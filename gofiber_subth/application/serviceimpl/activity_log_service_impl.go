package serviceimpl

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/infrastructure/redis"
	"gofiber-template/pkg/logger"
)

type activityLogServiceImpl struct {
	repo      repositories.ActivityLogRepository
	videoRepo repositories.VideoRepository
	queue     *redis.ActivityQueue
}

func NewActivityLogService(
	repo repositories.ActivityLogRepository,
	videoRepo repositories.VideoRepository,
	queue *redis.ActivityQueue,
) services.ActivityLogService {
	return &activityLogServiceImpl{
		repo:      repo,
		videoRepo: videoRepo,
		queue:     queue,
	}
}

// LogActivity - Push to Redis queue (Fire & Forget, < 10ms response)
func (s *activityLogServiceImpl) LogActivity(ctx context.Context, userID uuid.UUID, req *dto.LogActivityRequest, ipAddress, userAgent string) error {
	item := &dto.ActivityQueueItem{
		UserID:    userID,
		PageType:  req.PageType,
		PageID:    req.PageID,
		Path:      req.Path,
		Metadata:  req.Metadata,
		IPAddress: ipAddress,
		UserAgent: userAgent,
		CreatedAt: time.Now(),
	}

	// Push to queue (async)
	if err := s.queue.Push(ctx, item); err != nil {
		logger.WarnContext(ctx, "Failed to queue activity log", "error", err, "user_id", userID)
		return err
	}

	return nil
}

func (s *activityLogServiceImpl) GetUserHistory(ctx context.Context, userID uuid.UUID, page, limit int) ([]*dto.ActivityLogResponse, int64, error) {
	logs, total, err := s.repo.GetByUser(ctx, userID, page, limit)
	if err != nil {
		return nil, 0, err
	}

	responses := dto.ActivityLogsToResponse(logs)

	// Enrich with video titles
	videoIDs := make([]uuid.UUID, 0)
	for _, log := range logs {
		if log.PageType == models.PageTypeVideo && log.PageID != nil {
			videoIDs = append(videoIDs, *log.PageID)
		}
	}

	if len(videoIDs) > 0 {
		titles, err := s.videoRepo.GetTitlesByIDs(ctx, videoIDs)
		if err != nil {
			logger.WarnContext(ctx, "Failed to get video titles for user history", "error", err)
		} else {
			for i, log := range logs {
				if log.PageType == models.PageTypeVideo && log.PageID != nil {
					if title, ok := titles[*log.PageID]; ok {
						responses[i].PageTitle = &title
					}
				}
			}
		}
	}

	return responses, total, nil
}

func (s *activityLogServiceImpl) GetPageViews(ctx context.Context, pageType string, pageID *uuid.UUID) (int64, error) {
	return s.repo.CountByPage(ctx, pageType, pageID)
}

func (s *activityLogServiceImpl) GetPopularPages(ctx context.Context, pageType string, startDate, endDate time.Time, limit int) ([]*dto.PageViewCountResponse, error) {
	results, err := s.repo.GetPopularPages(ctx, pageType, startDate, endDate, limit)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.PageViewCountResponse, len(results))
	for i, r := range results {
		responses[i] = &dto.PageViewCountResponse{
			PageID:    r.PageID.String(),
			PageType:  r.PageType,
			ViewCount: r.ViewCount,
		}
	}

	return responses, nil
}

func (s *activityLogServiceImpl) GetUserRecentHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*models.ActivityLog, error) {
	return s.repo.GetUserRecentHistory(ctx, userID, limit)
}

func (s *activityLogServiceImpl) GetAllActivity(ctx context.Context, pageType string, page, limit int) ([]*dto.ActivityLogWithUserResponse, int64, error) {
	logs, total, err := s.repo.GetAll(ctx, pageType, page, limit)
	if err != nil {
		return nil, 0, err
	}

	responses := dto.ActivityLogsToWithUserResponse(logs)

	// Enrich with video titles
	videoIDs := make([]uuid.UUID, 0)
	for _, log := range logs {
		if log.PageType == models.PageTypeVideo && log.PageID != nil {
			videoIDs = append(videoIDs, *log.PageID)
		}
	}

	if len(videoIDs) > 0 {
		titles, err := s.videoRepo.GetTitlesByIDs(ctx, videoIDs)
		if err != nil {
			logger.WarnContext(ctx, "Failed to get video titles", "error", err)
		} else {
			for i, log := range logs {
				if log.PageType == models.PageTypeVideo && log.PageID != nil {
					if title, ok := titles[*log.PageID]; ok {
						responses[i].PageTitle = &title
					}
				}
			}
		}
	}

	return responses, total, nil
}
