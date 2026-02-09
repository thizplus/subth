package main

import (
	"fmt"
	"os"

	"gofiber-template/infrastructure/postgres"
	"gofiber-template/pkg/config"
)

func main() {
	fmt.Println("=== Create Unique Index on videos.code ===")

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
	fmt.Println("Database connected")

	// Check if index exists
	var indexExists bool
	db.Raw(`
		SELECT EXISTS (
			SELECT 1 FROM pg_indexes
			WHERE tablename = 'videos'
			AND indexname = 'idx_videos_code'
		)
	`).Scan(&indexExists)

	if indexExists {
		fmt.Println("Index idx_videos_code already exists")
	} else {
		fmt.Println("Creating unique index on videos.code...")
		result := db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_code ON videos(code)`)
		if result.Error != nil {
			fmt.Printf("Failed to create index: %v\n", result.Error)
			os.Exit(1)
		}
		fmt.Println("Index created successfully!")
	}

	// Also create index for video_translations unique constraint
	var vtIndexExists bool
	db.Raw(`
		SELECT EXISTS (
			SELECT 1 FROM pg_indexes
			WHERE tablename = 'video_translations'
			AND indexname = 'idx_video_translations_video_id_lang'
		)
	`).Scan(&vtIndexExists)

	if vtIndexExists {
		fmt.Println("Index idx_video_translations_video_id_lang already exists")
	} else {
		fmt.Println("Creating unique index on video_translations(video_id, lang)...")
		result := db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_video_translations_video_id_lang ON video_translations(video_id, lang)`)
		if result.Error != nil {
			fmt.Printf("Failed to create index: %v\n", result.Error)
			os.Exit(1)
		}
		fmt.Println("Index created successfully!")
	}

	fmt.Println("\nAll indexes created!")
}
