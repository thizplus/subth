package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"sync/atomic"
	"time"

	"gofiber-template/domain/models"
	"gofiber-template/infrastructure/postgres"
	"gofiber-template/infrastructure/storage"
	"gofiber-template/pkg/config"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"
)

// ScrapedItem represents scraped data from JSON
type ScrapedItem struct {
	Title      string   `json:"title"`
	URL        string   `json:"url"`
	Thumbnail  string   `json:"thumbnail"`
	Date       string   `json:"date"`
	Views      int      `json:"views"`
	Page       int      `json:"page"`
	FullImage  string   `json:"full_image"`
	Category   string   `json:"category"`
	Maker      string   `json:"maker"`
	Cast       []string `json:"cast"`
	Tags       []string `json:"tags"`
	Code       string   `json:"code"`
	LocalImage string   `json:"local_image"`
}

// ScrapedFile represents a JSON file structure
type ScrapedFile struct {
	Worker     int           `json:"worker"`
	Pages      string        `json:"pages"`
	ScrapedAt  string        `json:"scraped_at"`
	TotalItems int           `json:"total_items"`
	Items      []ScrapedItem `json:"items"`
}

// Progress tracks import progress for resume
type Progress struct {
	ProcessedFiles  []string          `json:"processed_files"`
	UploadedImages  map[string]string `json:"uploaded_images"` // code -> r2_url
	LastUpdated     time.Time         `json:"last_updated"`
	TotalProcessed  int               `json:"total_processed"`
	TotalImages     int               `json:"total_images"`
	FailedImages    []string          `json:"failed_images"`
}

var (
	dataDir      string
	imageDir     string
	progressFile string
	workers      int
	skipImages   bool
	dryRun       bool
)

func init() {
	flag.StringVar(&dataDir, "data", "", "Directory containing JSON files (required)")
	flag.StringVar(&imageDir, "images", "", "Directory containing images (required)")
	flag.StringVar(&progressFile, "progress", "import_progress.json", "Progress file for resume")
	flag.IntVar(&workers, "workers", 10, "Number of parallel workers for image upload")
	flag.BoolVar(&skipImages, "skip-images", false, "Skip image upload (use existing URLs)")
	flag.BoolVar(&dryRun, "dry-run", false, "Parse data without importing")
}

func main() {
	flag.Parse()

	if dataDir == "" || imageDir == "" {
		fmt.Println("Usage: go run cmd/import/main.go -data=<json_dir> -images=<image_dir>")
		fmt.Println("\nFlags:")
		flag.PrintDefaults()
		os.Exit(1)
	}

	// Load config
	cfg, err := config.LoadConfig()
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		os.Exit(1)
	}

	// Initialize database
	dbConfig := postgres.DatabaseConfig{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		DBName:   cfg.Database.DBName,
		SSLMode:  cfg.Database.SSLMode,
	}
	db, err := postgres.NewDatabase(dbConfig)
	if err != nil {
		fmt.Printf("Failed to connect to database: %v\n", err)
		os.Exit(1)
	}
	// ปิด GORM log เพื่อให้เห็นแค่ progress bar
	db.Logger = logger.Default.LogMode(logger.Silent)
	fmt.Println("✓ Database connected")

	// Initialize R2 storage
	var r2Storage *storage.R2Adapter
	if !skipImages {
		r2Cfg := storage.R2Config{
			AccountID:       cfg.R2.AccountID,
			AccessKeyID:     cfg.R2.AccessKeyID,
			SecretAccessKey: cfg.R2.SecretAccessKey,
			Bucket:          cfg.R2.Bucket,
			PublicURL:       cfg.R2.PublicURL,
		}
		storageAdapter, err := storage.NewR2Adapter(r2Cfg)
		if err != nil {
			fmt.Printf("Failed to initialize R2: %v\n", err)
			os.Exit(1)
		}
		r2Storage = storageAdapter.(*storage.R2Adapter)
		fmt.Printf("✓ R2 Storage initialized (bucket: %s)\n", cfg.R2.Bucket)
	}

	// Load progress
	progress := loadProgress(progressFile)
	fmt.Printf("✓ Progress loaded (processed: %d files, %d images)\n", len(progress.ProcessedFiles), len(progress.UploadedImages))

	// Read all JSON files
	items, err := readAllJSONFiles(dataDir, progress.ProcessedFiles)
	if err != nil {
		fmt.Printf("Failed to read JSON files: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("✓ Loaded %d items from JSON files\n", len(items))

	if dryRun {
		fmt.Println("\n[DRY RUN] Analyzing data...")
		analyzeData(items)
		return
	}

	// Phase 1: Create makers, casts, tags, categories
	fmt.Println("\n=== Phase 1: Creating Categories, Makers, Casts, Tags ===")
	makerMap, castMap, tagMap, categoryMap := createEntities(db, items)
	fmt.Printf("✓ Created %d makers, %d casts, %d tags, %d categories\n", len(makerMap), len(castMap), len(tagMap), len(categoryMap))

	// Phase 2: Upload images to R2
	fmt.Println("\n=== Phase 2: Uploading Images ===")
	if !skipImages && r2Storage != nil {
		uploadImages(r2Storage, imageDir, items, progress, workers)
		saveProgress(progressFile, progress)
	} else {
		fmt.Println("Skipping image upload")
	}

	// Phase 3: Create videos
	fmt.Println("\n=== Phase 3: Creating Videos ===")
	createVideos(db, items, makerMap, castMap, tagMap, categoryMap, progress)

	// Save final progress
	progress.LastUpdated = time.Now()
	saveProgress(progressFile, progress)

	fmt.Println("\n========================================")
	fmt.Println("Import completed!")
	fmt.Printf("Total videos: %d\n", len(items))
	fmt.Printf("Images uploaded: %d\n", len(progress.UploadedImages))
	fmt.Printf("Failed images: %d\n", len(progress.FailedImages))
	fmt.Println("========================================")
}

func loadProgress(filename string) *Progress {
	progress := &Progress{
		ProcessedFiles: []string{},
		UploadedImages: make(map[string]string),
		FailedImages:   []string{},
	}

	data, err := os.ReadFile(filename)
	if err != nil {
		return progress
	}

	json.Unmarshal(data, progress)
	if progress.UploadedImages == nil {
		progress.UploadedImages = make(map[string]string)
	}
	return progress
}

func saveProgress(filename string, progress *Progress) {
	progress.LastUpdated = time.Now()
	data, _ := json.MarshalIndent(progress, "", "  ")
	os.WriteFile(filename, data, 0644)
}

func readAllJSONFiles(dir string, processedFiles []string) ([]ScrapedItem, error) {
	processedSet := make(map[string]bool)
	for _, f := range processedFiles {
		processedSet[f] = true
	}

	var allItems []ScrapedItem
	files, err := filepath.Glob(filepath.Join(dir, "listings_*.json"))
	if err != nil {
		return nil, err
	}

	// Sort files
	sort.Strings(files)

	for _, file := range files {
		basename := filepath.Base(file)
		if processedSet[basename] {
			continue
		}

		data, err := os.ReadFile(file)
		if err != nil {
			fmt.Printf("Warning: Failed to read %s: %v\n", basename, err)
			continue
		}

		var sf ScrapedFile
		if err := json.Unmarshal(data, &sf); err != nil {
			fmt.Printf("Warning: Failed to parse %s: %v\n", basename, err)
			continue
		}

		allItems = append(allItems, sf.Items...)
		fmt.Printf("  Read %s (%d items)\n", basename, len(sf.Items))
	}

	return allItems, nil
}

func analyzeData(items []ScrapedItem) {
	makers := make(map[string]int)
	casts := make(map[string]int)
	tags := make(map[string]int)
	categories := make(map[string]int)

	for _, item := range items {
		if item.Maker != "" {
			makers[item.Maker]++
		}
		for _, c := range item.Cast {
			casts[c]++
		}
		for _, t := range item.Tags {
			tags[t]++
		}
		categories[item.Category]++
	}

	fmt.Printf("\nTotal items: %d\n", len(items))
	fmt.Printf("Unique makers: %d\n", len(makers))
	fmt.Printf("Unique casts: %d\n", len(casts))
	fmt.Printf("Unique tags: %d\n", len(tags))
	fmt.Printf("Categories: %v\n", categories)
}

func createEntities(db *gorm.DB, items []ScrapedItem) (map[string]uuid.UUID, map[string]uuid.UUID, map[string]uuid.UUID, map[string]uuid.UUID) {
	makerSet := make(map[string]bool)
	castSet := make(map[string]bool)
	tagSet := make(map[string]bool)
	categorySet := make(map[string]bool)

	// Collect unique values
	for _, item := range items {
		if item.Maker != "" {
			makerSet[item.Maker] = true
		}
		for _, c := range item.Cast {
			if c != "" {
				castSet[c] = true
			}
		}
		for _, t := range item.Tags {
			if t != "" {
				tagSet[t] = true
			}
		}
		if item.Category != "" {
			categorySet[item.Category] = true
		}
	}

	// Create categories
	categoryMap := make(map[string]uuid.UUID)
	fmt.Printf("Creating %d categories...\n", len(categorySet))
	for name := range categorySet {
		category := models.Category{
			ID:   uuid.New(),
			Name: name,
			Slug: slug.Make(name),
		}
		db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "name"}},
			DoUpdates: clause.AssignmentColumns([]string{"updated_at"}),
		}).Create(&category)

		var existing models.Category
		db.Where("name = ?", name).First(&existing)
		categoryMap[name] = existing.ID
	}

	// Create makers
	makerMap := make(map[string]uuid.UUID)
	fmt.Printf("Creating %d makers...\n", len(makerSet))
	for name := range makerSet {
		maker := models.Maker{
			ID:   uuid.New(),
			Name: name,
			Slug: slug.Make(name),
		}
		db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "name"}},
			DoUpdates: clause.AssignmentColumns([]string{"updated_at"}),
		}).Create(&maker)

		// Get the actual ID (in case it already existed)
		var existing models.Maker
		db.Where("name = ?", name).First(&existing)
		makerMap[name] = existing.ID
	}

	// Create casts
	castMap := make(map[string]uuid.UUID)
	fmt.Printf("Creating %d casts...\n", len(castSet))
	for name := range castSet {
		cast := models.Cast{
			ID:   uuid.New(),
			Name: name,
			Slug: slug.Make(name),
		}
		db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "name"}},
			DoUpdates: clause.AssignmentColumns([]string{"updated_at"}),
		}).Create(&cast)

		var existing models.Cast
		db.Where("name = ?", name).First(&existing)
		castMap[name] = existing.ID
	}

	// Create tags
	tagMap := make(map[string]uuid.UUID)
	fmt.Printf("Creating %d tags...\n", len(tagSet))
	for name := range tagSet {
		tag := models.Tag{
			ID:   uuid.New(),
			Name: name,
			Slug: slug.Make(name),
		}
		db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "name"}},
			DoUpdates: clause.AssignmentColumns([]string{"created_at"}),
		}).Create(&tag)

		var existing models.Tag
		db.Where("name = ?", name).First(&existing)
		tagMap[name] = existing.ID
	}

	return makerMap, castMap, tagMap, categoryMap
}

func uploadImages(r2 *storage.R2Adapter, imageDir string, items []ScrapedItem, progress *Progress, numWorkers int) {
	// Find items that need image upload
	var toUpload []ScrapedItem
	for _, item := range items {
		if item.Code == "" {
			continue
		}
		if _, exists := progress.UploadedImages[item.Code]; exists {
			continue
		}
		toUpload = append(toUpload, item)
	}

	if len(toUpload) == 0 {
		fmt.Println("No new images to upload")
		return
	}

	fmt.Printf("Uploading %d images with %d workers...\n", len(toUpload), numWorkers)

	// Create work channel
	jobs := make(chan ScrapedItem, len(toUpload))
	var wg sync.WaitGroup
	var uploaded, failed int64
	var mu sync.Mutex

	// Start workers
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			defer func() {
				if r := recover(); r != nil {
					fmt.Printf("Worker recovered from panic: %v\n", r)
				}
			}()
			ctx := context.Background()

			for item := range jobs {
				localPath := filepath.Join(imageDir, filepath.Base(item.LocalImage))
				if _, err := os.Stat(localPath); os.IsNotExist(err) {
					// Try with code
					localPath = filepath.Join(imageDir, item.Code+".jpg")
				}

				// Check if file exists
				if _, err := os.Stat(localPath); os.IsNotExist(err) {
					atomic.AddInt64(&failed, 1)
					continue
				}

				// Upload with retry logic
				r2Path := fmt.Sprintf("thumbnails/%s.jpg", item.Code)
				contentType := "image/jpeg"
				maxRetries := 3
				var url string
				var uploadErr error

				for retry := 0; retry < maxRetries; retry++ {
					file, err := os.Open(localPath)
					if err != nil {
						uploadErr = err
						break
					}

					url, uploadErr = r2.Upload(ctx, r2Path, file, contentType)
					file.Close()

					if uploadErr == nil {
						break // Success
					}

					// Wait before retry
					if retry < maxRetries-1 {
						time.Sleep(time.Duration(retry+1) * time.Second)
					}
				}

				if uploadErr != nil {
					atomic.AddInt64(&failed, 1)
					mu.Lock()
					progress.FailedImages = append(progress.FailedImages, item.Code)
					mu.Unlock()
					continue
				}

				atomic.AddInt64(&uploaded, 1)
				mu.Lock()
				progress.UploadedImages[item.Code] = url
				mu.Unlock()

				// Progress update
				current := atomic.LoadInt64(&uploaded)
				if current%100 == 0 {
					fmt.Printf("  Uploaded: %d/%d (failed: %d)\n", current, len(toUpload), atomic.LoadInt64(&failed))
					saveProgress(progressFile, progress)
				}
			}
		}()
	}

	// Send jobs
	for _, item := range toUpload {
		jobs <- item
	}
	close(jobs)

	wg.Wait()
	fmt.Printf("✓ Upload complete: %d uploaded, %d failed\n", uploaded, failed)
}

func createVideos(db *gorm.DB, items []ScrapedItem, makerMap, castMap, tagMap, categoryMap map[string]uuid.UUID, progress *Progress) {
	total := len(items)
	numWorkers := workers // from flag, default 10

	fmt.Printf("\n╔══════════════════════════════════════════════════════════════╗\n")
	fmt.Printf("║  Creating %d videos with %d parallel workers              ║\n", total, numWorkers)
	fmt.Printf("╚══════════════════════════════════════════════════════════════╝\n\n")

	var created, skipped, errors, processed int64
	startTime := time.Now()

	// Create job channel
	jobs := make(chan ScrapedItem, numWorkers*2)

	// WaitGroup for workers
	var wg sync.WaitGroup

	// Start workers
	for w := 0; w < numWorkers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			for item := range jobs {
				// Parse date
				var releaseDate *time.Time
				if item.Date != "" {
					if t, err := time.Parse("2006/01/02", item.Date); err == nil {
						releaseDate = &t
					}
				}

				// Get maker ID
				var makerID *uuid.UUID
				if id, exists := makerMap[item.Maker]; exists {
					makerID = &id
				}

				// Get category ID
				var categoryID *uuid.UUID
				if id, exists := categoryMap[item.Category]; exists {
					categoryID = &id
				}

				// Get thumbnail path (เก็บแค่ path ไม่รวม domain)
				thumbnail := ""
				if item.Code != "" {
					// ใช้ path format: /thumbnails/{code}.jpg
					thumbnail = fmt.Sprintf("/thumbnails/%s.jpg", item.Code)
				}

				// Create video struct
				video := models.Video{
					ID:          uuid.New(),
					Thumbnail:   thumbnail,
					SourceURL:   item.URL, // เก็บ URL ต้นทาง
					CategoryID:  categoryID,
					ReleaseDate: releaseDate,
					MakerID:     makerID,
					Views:       item.Views,
				}

				// Insert video
				if err := db.Create(&video).Error; err != nil {
					atomic.AddInt64(&errors, 1)
					atomic.AddInt64(&processed, 1)
					continue
				}
				videoID := video.ID
				atomic.AddInt64(&created, 1)

				// Add casts
				var casts []models.Cast
				for _, castName := range item.Cast {
					if castID, exists := castMap[castName]; exists {
						casts = append(casts, models.Cast{ID: castID})
					}
				}
				if len(casts) > 0 {
					db.Model(&models.Video{ID: videoID}).Association("Casts").Replace(casts)
				}

				// Add tags
				var tags []models.Tag
				for _, tagName := range item.Tags {
					if tagID, exists := tagMap[tagName]; exists {
						tags = append(tags, models.Tag{ID: tagID})
					}
				}
				if len(tags) > 0 {
					db.Model(&models.Video{ID: videoID}).Association("Tags").Replace(tags)
				}

				// Add translation
				trans := models.VideoTranslation{
					ID:      uuid.New(),
					VideoID: videoID,
					Lang:    "en",
					Title:   item.Title,
				}
				db.Clauses(clause.OnConflict{
					Columns:   []clause.Column{{Name: "video_id"}, {Name: "lang"}},
					DoUpdates: clause.AssignmentColumns([]string{"title", "updated_at"}),
				}).Create(&trans)

				atomic.AddInt64(&processed, 1)
			}
		}()
	}

	// Progress display goroutine (tqdm style)
	done := make(chan bool)
	go func() {
		for {
			select {
			case <-done:
				return
			default:
				current := atomic.LoadInt64(&processed)
				elapsed := time.Since(startTime)
				rate := float64(current) / elapsed.Seconds()
				remaining := time.Duration(0)
				if rate > 0 {
					remaining = time.Duration(float64(int64(total)-current)/rate) * time.Second
				}

				pct := float64(current) / float64(total) * 100
				barWidth := 50
				filled := int(pct / 100 * float64(barWidth))

				bar := ""
				for j := 0; j < barWidth; j++ {
					if j < filled {
						bar += "█"
					} else {
						bar += " "
					}
				}

				// Format elapsed time
				elapsedStr := fmt.Sprintf("%02d:%02d", int(elapsed.Minutes()), int(elapsed.Seconds())%60)
				remainStr := fmt.Sprintf("%02d:%02d", int(remaining.Minutes()), int(remaining.Seconds())%60)

				// tqdm style: 100%|████████████████████████████████████████████████| 91458/91458 [29:12<00:00, 52.20it/s]
				fmt.Printf("\r%3.0f%%|%s| %d/%d [%s<%s, %.2fit/s]    ",
					pct, bar, current, total, elapsedStr, remainStr, rate)

				time.Sleep(100 * time.Millisecond)
			}
		}
	}()

	// Send jobs to workers
	for _, item := range items {
		jobs <- item
	}
	close(jobs)

	// Wait for all workers to finish
	wg.Wait()
	done <- true

	// Final progress
	fmt.Printf("\r[████████████████████████████████████████] 100.0%% | %d/%d | Created: %d | Skipped: %d | Errors: %d    \n",
		total, total, created, skipped, errors)

	fmt.Printf("\n╔══════════════════════════════════════════════════════════════╗\n")
	fmt.Printf("║  ✓ Import completed in %s                          ║\n", time.Since(startTime).Round(time.Second))
	fmt.Printf("║    Created: %-10d                                      ║\n", created)
	fmt.Printf("║    Skipped: %-10d                                      ║\n", skipped)
	fmt.Printf("║    Errors:  %-10d                                      ║\n", errors)
	fmt.Printf("╚══════════════════════════════════════════════════════════════╝\n")

	// Update counts
	fmt.Println("Updating counts...")
	db.Exec(`
		UPDATE categories SET video_count = (
			SELECT COUNT(*) FROM videos WHERE videos.category_id = categories.id
		)
	`)
	db.Exec(`
		UPDATE makers SET video_count = (
			SELECT COUNT(*) FROM videos WHERE videos.maker_id = makers.id
		)
	`)
	db.Exec(`
		UPDATE casts SET video_count = (
			SELECT COUNT(*) FROM video_casts WHERE video_casts.cast_id = casts.id
		)
	`)
	db.Exec(`
		UPDATE tags SET video_count = (
			SELECT COUNT(*) FROM video_tags WHERE video_tags.tag_id = tags.id
		)
	`)
	fmt.Println("✓ Counts updated")
}
