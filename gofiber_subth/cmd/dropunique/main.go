package main

import (
	"fmt"

	"gofiber-template/infrastructure/postgres"
	"gofiber-template/pkg/config"
)

func main() {
	fmt.Println("=== Drop Unique Index on code ===")

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

	// Drop all unique indexes on code
	fmt.Println("Dropping unique indexes on code...")
	db.Exec(`DROP INDEX IF EXISTS idx_videos_code`)
	db.Exec(`DROP INDEX IF EXISTS idx_videos_code_unique`)
	db.Exec(`ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_code_unique`)
	db.Exec(`ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_code_key`)

	// Create regular index (not unique) for performance
	fmt.Println("Creating regular index on code...")
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_videos_code ON videos(code)`)

	// Verify
	fmt.Println("\nVerifying indexes:")
	var indexes []struct {
		Indexname string
		Indexdef  string
	}
	db.Raw(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'videos' AND indexname LIKE '%code%'`).Scan(&indexes)
	for _, idx := range indexes {
		fmt.Printf("  %s: %s\n", idx.Indexname, idx.Indexdef)
	}

	fmt.Println("\n✓ Done! Code can now be duplicated")
}
