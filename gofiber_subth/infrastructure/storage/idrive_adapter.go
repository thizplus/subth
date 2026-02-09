package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// IDriveAdapter สำหรับอ่านไฟล์จาก iDrive E2 (source storage)
type IDriveAdapter struct {
	client *s3.Client
	bucket string
}

type IDriveConfig struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Bucket    string
	Region    string
}

// NewIDriveAdapter สร้าง iDrive E2 adapter (read-only สำหรับ sync)
func NewIDriveAdapter(cfg IDriveConfig) (*IDriveAdapter, error) {
	if cfg.Endpoint == "" || cfg.AccessKey == "" || cfg.SecretKey == "" {
		return nil, fmt.Errorf("iDrive credentials not configured")
	}

	// iDrive E2 endpoint: https://s3.{region}.idrivee2.com
	endpoint := fmt.Sprintf("https://%s", cfg.Endpoint)

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: endpoint,
		}, nil
	})

	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithEndpointResolverWithOptions(r2Resolver),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AccessKey,
			cfg.SecretKey,
			"",
		)),
		awsconfig.WithRegion(cfg.Region),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load iDrive config: %w", err)
	}

	client := s3.NewFromConfig(awsCfg)

	return &IDriveAdapter{
		client: client,
		bucket: cfg.Bucket,
	}, nil
}

// GetFile downloads a file from iDrive E2
func (a *IDriveAdapter) GetFile(ctx context.Context, path string) (io.ReadCloser, error) {
	result, err := a.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(a.bucket),
		Key:    aws.String(path),
	})
	if err != nil {
		return nil, fmt.Errorf("iDrive get file failed: %w", err)
	}

	return result.Body, nil
}

// Exists checks if a file exists in iDrive E2
func (a *IDriveAdapter) Exists(ctx context.Context, path string) (bool, error) {
	_, err := a.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(a.bucket),
		Key:    aws.String(path),
	})
	if err != nil {
		return false, nil
	}
	return true, nil
}
