package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Build DSN
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASSWORD", "postgres"),
		getEnv("DB_NAME", "subth"),
	)

	// Connect
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Connected to database")

	// Fix category video counts
	result := db.Exec(`
		UPDATE categories SET video_count = (
			SELECT COUNT(*) FROM videos WHERE videos.category_id = categories.id
		)
	`)
	if result.Error != nil {
		log.Fatalf("Failed to update category counts: %v", result.Error)
	}
	fmt.Printf("Updated %d category rows\n", result.RowsAffected)

	// Fix maker video counts
	result = db.Exec(`
		UPDATE makers SET video_count = (
			SELECT COUNT(*) FROM videos WHERE videos.maker_id = makers.id
		)
	`)
	if result.Error != nil {
		log.Fatalf("Failed to update maker counts: %v", result.Error)
	}
	fmt.Printf("Updated %d maker rows\n", result.RowsAffected)

	// Fix cast video counts
	result = db.Exec(`
		UPDATE casts SET video_count = (
			SELECT COUNT(*) FROM video_casts WHERE video_casts.cast_id = casts.id
		)
	`)
	if result.Error != nil {
		log.Fatalf("Failed to update cast counts: %v", result.Error)
	}
	fmt.Printf("Updated %d cast rows\n", result.RowsAffected)

	// Fix tag video counts
	result = db.Exec(`
		UPDATE tags SET video_count = (
			SELECT COUNT(*) FROM video_tags WHERE video_tags.tag_id = tags.id
		)
	`)
	if result.Error != nil {
		log.Fatalf("Failed to update tag counts: %v", result.Error)
	}
	fmt.Printf("Updated %d tag rows\n", result.RowsAffected)

	fmt.Println("\nDone! All video counts have been recalculated.")
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
