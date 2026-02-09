package main

import (
	"fmt"
	"os"

	"gofiber-template/infrastructure/postgres"
	"gofiber-template/pkg/config"
)

func main() {
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
	fmt.Println("✓ Database connected\n")

	// Query counts
	tables := []string{
		"videos",
		"video_translations",
		"categories",
		"category_translations",
		"makers",
		"casts",
		"cast_translations",
		"tags",
		"tag_translations",
		"video_casts",
		"video_tags",
	}

	// Expected counts from scrape (based on SCHEMA_AND_TODO.md)
	expected := map[string]int{
		"videos":     143465,
		"categories": 2,
		"makers":     498,
		"casts":      6571,
		"tags":       285,
	}

	fmt.Println("=== Database Summary ===")
	fmt.Printf("%-25s %15s %15s %10s\n", "Table", "Count", "Expected", "Status")
	fmt.Println("----------------------------------------------------------------------")

	for _, table := range tables {
		var count int64
		result := db.Table(table).Count(&count)
		if result.Error != nil {
			fmt.Printf("%-25s %15s\n", table, "ERROR: "+result.Error.Error())
			continue
		}

		exp, hasExp := expected[table]
		status := ""
		expStr := "-"
		if hasExp {
			expStr = fmt.Sprintf("%d", exp)
			if int(count) == exp {
				status = "✓"
			} else if int(count) > 0 {
				pct := float64(count) / float64(exp) * 100
				status = fmt.Sprintf("%.1f%%", pct)
			} else {
				status = "EMPTY"
			}
		}

		fmt.Printf("%-25s %15d %15s %10s\n", table, count, expStr, status)
	}

	// Check some sample video thumbnails
	fmt.Println("\n=== Sample Video Thumbnails ===")
	type VideoSample struct {
		Code      string
		Thumbnail string
	}
	var samples []VideoSample
	db.Table("videos").Select("code, thumbnail").Limit(5).Scan(&samples)
	for _, s := range samples {
		fmt.Printf("Code: %s\n  Thumbnail: %s\n", s.Code, s.Thumbnail)
	}
}
