package main

import (
	"fmt"

	"gofiber-template/infrastructure/postgres"
	"gofiber-template/pkg/config"
)

func main() {
	fmt.Println("=== Check Constraints and Indexes ===")

	cfg, _ := config.LoadConfig()
	dbConfig := postgres.DatabaseConfig{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		DBName:   cfg.Database.DBName,
		SSLMode:  cfg.Database.SSLMode,
	}
	db, _ := postgres.NewDatabase(dbConfig)

	// Check indexes
	fmt.Println("\n=== Indexes on videos table ===")
	var indexes []struct {
		Indexname  string
		Indexdef   string
	}
	db.Raw(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'videos'`).Scan(&indexes)
	for _, idx := range indexes {
		fmt.Printf("  %s: %s\n", idx.Indexname, idx.Indexdef)
	}

	// Check constraints
	fmt.Println("\n=== Constraints on videos table ===")
	var constraints []struct {
		ConstraintName string
		ConstraintType string
	}
	db.Raw(`
		SELECT constraint_name, constraint_type
		FROM information_schema.table_constraints
		WHERE table_name = 'videos'
	`).Scan(&constraints)
	for _, c := range constraints {
		fmt.Printf("  %s: %s\n", c.ConstraintName, c.ConstraintType)
	}

	// Try simple insert
	fmt.Println("\n=== Testing insert ===")
	result := db.Exec(`
		INSERT INTO videos (id, code, thumbnail, views)
		VALUES (gen_random_uuid(), 'TEST-001', 'https://example.com/test.jpg', 0)
		ON CONFLICT (code) DO NOTHING
	`)
	if result.Error != nil {
		fmt.Printf("Insert failed: %v\n", result.Error)
	} else {
		fmt.Printf("Insert succeeded, rows affected: %d\n", result.RowsAffected)
		// Clean up
		db.Exec(`DELETE FROM videos WHERE code = 'TEST-001'`)
	}
}
