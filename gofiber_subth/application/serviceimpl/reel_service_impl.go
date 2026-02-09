package serviceimpl

import (
	"bytes"
	"context"
	"fmt"
	"io"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/ports"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

type ReelServiceImpl struct {
	reelRepo      repositories.ReelRepository
	storage       ports.Storage       // R2 - destination
	sourceStorage ports.SourceStorage // iDrive E2 - source
}

func NewReelService(reelRepo repositories.ReelRepository, storage ports.Storage, sourceStorage ports.SourceStorage) services.ReelService {
	return &ReelServiceImpl{
		reelRepo:      reelRepo,
		storage:       storage,
		sourceStorage: sourceStorage,
	}
}

func (s *ReelServiceImpl) Create(ctx context.Context, req *dto.CreateReelRequest) (*models.Reel, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	reel := &models.Reel{
		VideoID:     req.VideoID,
		CoverURL:    req.CoverURL,
		VideoURL:    req.VideoURL,
		ThumbURL:    req.ThumbURL,
		Title:       req.Title,
		Description: req.Description,
		IsActive:    isActive,
	}

	if err := s.reelRepo.Create(ctx, reel); err != nil {
		logger.ErrorContext(ctx, "Failed to create reel", "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "Reel created", "reel_id", reel.ID)
	return reel, nil
}

func (s *ReelServiceImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Reel, error) {
	reel, err := s.reelRepo.GetByID(ctx, id)
	if err != nil {
		logger.WarnContext(ctx, "Reel not found", "reel_id", id, "error", err)
		return nil, err
	}
	return reel, nil
}

func (s *ReelServiceImpl) Update(ctx context.Context, id uuid.UUID, req *dto.UpdateReelRequest) (*models.Reel, error) {
	reel, err := s.reelRepo.GetByID(ctx, id)
	if err != nil {
		logger.WarnContext(ctx, "Reel not found for update", "reel_id", id, "error", err)
		return nil, err
	}

	// Update fields if provided
	if req.VideoID != nil {
		reel.VideoID = req.VideoID
	}
	if req.CoverURL != "" {
		reel.CoverURL = req.CoverURL
	}
	if req.VideoURL != "" {
		reel.VideoURL = req.VideoURL
	}
	if req.ThumbURL != "" {
		reel.ThumbURL = req.ThumbURL
	}
	if req.Title != "" {
		reel.Title = req.Title
	}
	if req.Description != "" {
		reel.Description = req.Description
	}
	if req.IsActive != nil {
		reel.IsActive = *req.IsActive
	}

	if err := s.reelRepo.Update(ctx, reel); err != nil {
		logger.ErrorContext(ctx, "Failed to update reel", "reel_id", id, "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "Reel updated", "reel_id", id)
	return reel, nil
}

func (s *ReelServiceImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.reelRepo.Delete(ctx, id); err != nil {
		logger.ErrorContext(ctx, "Failed to delete reel", "reel_id", id, "error", err)
		return err
	}

	logger.InfoContext(ctx, "Reel deleted", "reel_id", id)
	return nil
}

func (s *ReelServiceImpl) List(ctx context.Context, page int, limit int, activeOnly bool) ([]dto.ReelResponse, int64, error) {
	offset := (page - 1) * limit

	reels, total, err := s.reelRepo.List(ctx, limit, offset, activeOnly)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list reels", "error", err)
		return nil, 0, err
	}

	items := make([]dto.ReelResponse, 0, len(reels))
	for _, reel := range reels {
		items = append(items, dto.ReelResponse{
			ID:          reel.ID,
			VideoID:     reel.VideoID,
			CoverURL:    reel.CoverURL,
			VideoURL:    reel.VideoURL,
			ThumbURL:    reel.ThumbURL,
			Title:       reel.Title,
			Description: reel.Description,
			IsActive:    reel.IsActive,
			CreatedAt:   reel.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
			UpdatedAt:   reel.UpdatedAt.UTC().Format("2006-01-02T15:04:05Z"),
		})
	}

	return items, total, nil
}

// SyncFromSuekk downloads reel files from iDrive E2 and uploads to R2
func (s *ReelServiceImpl) SyncFromSuekk(ctx context.Context, req *dto.SyncReelRequest) (*models.Reel, error) {
	suekkReelID := req.SuekkReelID

	logger.InfoContext(ctx, "Syncing reel from iDrive E2", "suekk_reel_id", suekkReelID)

	// Check if source storage is configured
	if s.sourceStorage == nil {
		return nil, fmt.Errorf("iDrive E2 source storage not configured")
	}

	// iDrive E2 source paths (ตาม structure ใน suekk bucket)
	sourcePaths := map[string]string{
		"video": fmt.Sprintf("reels/%s/output.mp4", suekkReelID),
		"thumb": fmt.Sprintf("reels/%s/thumb.jpg", suekkReelID),
		"cover": fmt.Sprintf("reels/%s/cover.jpg", suekkReelID),
	}

	// R2 destination paths
	r2Base := fmt.Sprintf("reels/%s", suekkReelID)
	r2Paths := map[string]string{
		"video": r2Base + "/output.mp4",
		"thumb": r2Base + "/thumb.jpg",
		"cover": r2Base + "/cover.jpg",
	}

	// Content types
	contentTypes := map[string]string{
		"video": "video/mp4",
		"thumb": "image/jpeg",
		"cover": "image/jpeg",
	}

	r2URLs := make(map[string]string)

	// Download from iDrive E2 and upload to R2
	for fileType, sourcePath := range sourcePaths {
		logger.InfoContext(ctx, "Downloading from iDrive E2", "type", fileType, "path", sourcePath)

		// Download from iDrive E2
		reader, err := s.sourceStorage.GetFile(ctx, sourcePath)
		if err != nil {
			logger.ErrorContext(ctx, "Failed to download from iDrive", "type", fileType, "error", err)
			if fileType == "video" {
				return nil, fmt.Errorf("failed to download video from iDrive: %w", err)
			}
			continue // Skip optional files (thumb, cover)
		}

		// Read body into buffer
		body, err := io.ReadAll(reader)
		reader.Close()
		if err != nil {
			logger.ErrorContext(ctx, "Failed to read file", "type", fileType, "error", err)
			if fileType == "video" {
				return nil, fmt.Errorf("failed to read video: %w", err)
			}
			continue
		}

		logger.InfoContext(ctx, "Downloaded from iDrive", "type", fileType, "size", len(body))

		// Upload to R2
		logger.InfoContext(ctx, "Uploading to R2", "type", fileType, "path", r2Paths[fileType])
		uploadedURL, err := s.storage.Upload(ctx, r2Paths[fileType], bytes.NewReader(body), contentTypes[fileType])
		if err != nil {
			logger.ErrorContext(ctx, "Failed to upload to R2", "type", fileType, "error", err)
			if fileType == "video" {
				return nil, fmt.Errorf("failed to upload video to R2: %w", err)
			}
			continue
		}

		r2URLs[fileType] = uploadedURL
		logger.InfoContext(ctx, "Uploaded to R2 successfully", "type", fileType, "url", uploadedURL)
	}

	// Create reel record
	reel := &models.Reel{
		VideoID:     req.VideoID,
		VideoURL:    r2URLs["video"],
		ThumbURL:    r2URLs["thumb"],
		CoverURL:    r2URLs["cover"],
		Title:       req.Title,
		Description: req.Description,
		IsActive:    true,
	}

	if err := s.reelRepo.Create(ctx, reel); err != nil {
		logger.ErrorContext(ctx, "Failed to create reel record", "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "Reel synced successfully",
		"reel_id", reel.ID,
		"suekk_reel_id", suekkReelID,
		"video_url", reel.VideoURL,
	)

	return reel, nil
}
