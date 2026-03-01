package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"gofiber-template/infrastructure/storage"
	"gofiber-template/pkg/config"
)

func main() {
	// Load config
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Create R2 adapter
	r2, err := storage.NewR2Adapter(storage.R2Config{
		AccountID:       cfg.R2.AccountID,
		AccessKeyID:     cfg.R2.AccessKeyID,
		SecretAccessKey: cfg.R2.SecretAccessKey,
		Bucket:          cfg.R2.Bucket,
		PublicURL:       cfg.R2.PublicURL,
	})
	if err != nil {
		log.Fatalf("Failed to create R2 adapter: %v", err)
	}

	// robots.txt content - Allow all for CDN (images/videos are meant to be indexed)
	robotsContent := `User-agent: *
Allow: /
`

	// Upload robots.txt
	ctx := context.Background()
	url, err := r2.Upload(ctx, "robots.txt", strings.NewReader(robotsContent), "text/plain; charset=utf-8")
	if err != nil {
		log.Fatalf("Failed to upload robots.txt: %v", err)
	}

	fmt.Printf("✅ robots.txt uploaded successfully!\n")
	fmt.Printf("   URL: %s\n", url)

	os.Exit(0)
}
