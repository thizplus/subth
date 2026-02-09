package main

import (
	"fmt"

	"gofiber-template/infrastructure/postgres"
	"gofiber-template/pkg/config"
)

func main() {
	fmt.Println("=== Fix Schema for NULL code support ===")

	cfg, _ := config.LoadConfig()
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
		fmt.Printf("Failed to connect: %v\n", err)
		return
	}
	fmt.Println("Database connected")

	// Step 1: Clear existing video data
	fmt.Println("\n=== Step 1: Clearing existing video data ===")
	db.Exec(`DELETE FROM video_translations`)
	fmt.Println("  - Cleared video_translations")
	db.Exec(`DELETE FROM video_casts`)
	fmt.Println("  - Cleared video_casts")
	db.Exec(`DELETE FROM video_tags`)
	fmt.Println("  - Cleared video_tags")
	db.Exec(`DELETE FROM videos`)
	fmt.Println("  - Cleared videos")

	// Step 2: Drop existing unique constraint
	fmt.Println("\n=== Step 2: Dropping existing unique constraint ===")
	db.Exec(`ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_code_unique`)
	fmt.Println("  - Dropped videos_code_unique")

	// Step 3: Create partial unique index (only for non-null codes)
	fmt.Println("\n=== Step 3: Creating partial unique index ===")
	result := db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_code_unique ON videos(code) WHERE code IS NOT NULL`)
	if result.Error != nil {
		fmt.Printf("  - Failed: %v\n", result.Error)
	} else {
		fmt.Println("  - Created idx_videos_code_unique (partial)")
	}

	// Step 4: Verify
	fmt.Println("\n=== Step 4: Verifying ===")
	var count int64
	db.Table("videos").Count(&count)
	fmt.Printf("  - Videos count: %d\n", count)

	var indexes []struct {
		Indexname string
		Indexdef  string
	}
	db.Raw(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'videos' AND indexname LIKE '%code%'`).Scan(&indexes)
	for _, idx := range indexes {
		fmt.Printf("  - Index: %s\n    %s\n", idx.Indexname, idx.Indexdef)
	}

	fmt.Println("\n=== Done! Ready for import ===")
}
