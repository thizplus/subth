package main

import (
	"context"
	"fmt"
	"os"

	"gofiber-template/infrastructure/storage"
	"gofiber-template/pkg/config"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run cmd/r2test/main.go <image_path>")
		fmt.Println("Example: go run cmd/r2test/main.go D:\\images\\test.jpg")
		os.Exit(1)
	}

	imagePath := os.Args[1]

	// Load config
	cfg, err := config.LoadConfig()
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		os.Exit(1)
	}

	// Initialize R2
	r2Config := storage.R2Config{
		AccountID:       cfg.R2.AccountID,
		AccessKeyID:     cfg.R2.AccessKeyID,
		SecretAccessKey: cfg.R2.SecretAccessKey,
		Bucket:          cfg.R2.Bucket,
		PublicURL:       cfg.R2.PublicURL,
	}

	r2, err := storage.NewR2Adapter(r2Config)
	if err != nil {
		fmt.Printf("Failed to initialize R2: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("R2 Initialized - Bucket: %s\n", cfg.R2.Bucket)

	// Open file
	file, err := os.Open(imagePath)
	if err != nil {
		fmt.Printf("Failed to open file: %v\n", err)
		os.Exit(1)
	}
	defer file.Close()

	// Get file info
	fileInfo, _ := file.Stat()
	fmt.Printf("Uploading: %s (%d bytes)\n", fileInfo.Name(), fileInfo.Size())

	// Determine content type
	contentType := storage.GetContentType(fileInfo.Name())

	// Upload to R2 using the new interface
	destPath := fmt.Sprintf("test/%s", fileInfo.Name())
	ctx := context.Background()
	url, err := r2.Upload(ctx, destPath, file, contentType)
	if err != nil {
		fmt.Printf("Failed to upload: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("========================================")
	fmt.Println("Upload successful!")
	fmt.Printf("URL: %s\n", url)
	fmt.Println("========================================")
}
