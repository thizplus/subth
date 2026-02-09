package main

import (
	"fmt"

	"gofiber-template/infrastructure/postgres"
	"gofiber-template/pkg/config"
)

func main() {
	fmt.Println("=== Fix Unique Constraint on videos.code ===")

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

	// Drop partial unique index
	fmt.Println("Dropping partial unique index idx_videos_code...")
	db.Exec(`DROP INDEX IF EXISTS idx_videos_code`)

	// Create proper unique constraint
	fmt.Println("Creating unique constraint on code...")
	result := db.Exec(`ALTER TABLE videos ADD CONSTRAINT videos_code_unique UNIQUE (code)`)
	if result.Error != nil {
		fmt.Printf("Failed to create constraint: %v\n", result.Error)
		return
	}
	fmt.Println("Constraint created!")

	// Test insert
	fmt.Println("\nTesting ON CONFLICT...")
	testResult := db.Exec(`
		INSERT INTO videos (id, code, thumbnail, views)
		VALUES (gen_random_uuid(), 'TEST-001', 'https://example.com/test.jpg', 0)
		ON CONFLICT (code) DO NOTHING
	`)
	if testResult.Error != nil {
		fmt.Printf("Test failed: %v\n", testResult.Error)
	} else {
		fmt.Printf("Test succeeded! Rows affected: %d\n", testResult.RowsAffected)
		db.Exec(`DELETE FROM videos WHERE code = 'TEST-001'`)
		fmt.Println("Test data cleaned up")
	}
}
