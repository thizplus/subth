package storage

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"

	"gofiber-template/domain/ports"
)

// R2Adapter implements ports.Storage for Cloudflare R2
type R2Adapter struct {
	client    *s3.Client
	bucket    string
	publicURL string
}

type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicURL       string
}

// NewR2Adapter สร้าง R2 storage adapter
func NewR2Adapter(cfg R2Config) (ports.Storage, error) {
	if cfg.AccountID == "" || cfg.AccessKeyID == "" || cfg.SecretAccessKey == "" {
		return nil, fmt.Errorf("R2 credentials not configured")
	}

	// R2 endpoint: https://<account_id>.r2.cloudflarestorage.com
	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountID)

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: endpoint,
		}, nil
	})

	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithEndpointResolverWithOptions(r2Resolver),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			"",
		)),
		awsconfig.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load R2 config: %w", err)
	}

	client := s3.NewFromConfig(awsCfg)

	return &R2Adapter{
		client:    client,
		bucket:    cfg.Bucket,
		publicURL: strings.TrimSuffix(cfg.PublicURL, "/"),
	}, nil
}

// Upload implements ports.Storage
func (r *R2Adapter) Upload(ctx context.Context, path string, file io.Reader, contentType string) (string, error) {
	path = strings.TrimPrefix(path, "/")

	_, err := r.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(r.bucket),
		Key:         aws.String(path),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("R2 upload failed: %w", err)
	}

	return r.GetURL(path), nil
}

// Delete implements ports.Storage
func (r *R2Adapter) Delete(ctx context.Context, path string) error {
	path = strings.TrimPrefix(path, "/")

	_, err := r.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(path),
	})
	if err != nil {
		return fmt.Errorf("R2 delete failed: %w", err)
	}

	return nil
}

// DeleteByPrefix implements ports.Storage - ลบไฟล์ทั้งหมดที่ขึ้นต้นด้วย prefix
func (r *R2Adapter) DeleteByPrefix(ctx context.Context, prefix string) (int, error) {
	prefix = strings.TrimPrefix(prefix, "/")

	// List all objects with prefix
	listOutput, err := r.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket: aws.String(r.bucket),
		Prefix: aws.String(prefix),
	})
	if err != nil {
		return 0, fmt.Errorf("R2 list failed: %w", err)
	}

	if len(listOutput.Contents) == 0 {
		return 0, nil
	}

	// Build delete objects input
	objects := make([]types.ObjectIdentifier, 0, len(listOutput.Contents))
	for _, obj := range listOutput.Contents {
		objects = append(objects, types.ObjectIdentifier{
			Key: obj.Key,
		})
	}

	// Delete objects
	deleteOutput, err := r.client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
		Bucket: aws.String(r.bucket),
		Delete: &types.Delete{
			Objects: objects,
			Quiet:   aws.Bool(true),
		},
	})
	if err != nil {
		return 0, fmt.Errorf("R2 delete objects failed: %w", err)
	}

	deletedCount := len(objects)
	if deleteOutput.Errors != nil {
		deletedCount -= len(deleteOutput.Errors)
	}

	return deletedCount, nil
}

// GetURL implements ports.Storage
func (r *R2Adapter) GetURL(path string) string {
	path = strings.TrimPrefix(path, "/")
	return fmt.Sprintf("%s/%s", r.publicURL, path)
}

// Exists implements ports.Storage
func (r *R2Adapter) Exists(ctx context.Context, path string) (bool, error) {
	path = strings.TrimPrefix(path, "/")

	_, err := r.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(path),
	})
	if err != nil {
		// Check if it's a "not found" error
		return false, nil
	}

	return true, nil
}

// Helper: GetContentType returns MIME type from filename
func GetContentType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	mimeTypes := map[string]string{
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".webp": "image/webp",
		".mp4":  "video/mp4",
		".webm": "video/webm",
		".pdf":  "application/pdf",
	}
	if mime, ok := mimeTypes[ext]; ok {
		return mime
	}
	return "application/octet-stream"
}
