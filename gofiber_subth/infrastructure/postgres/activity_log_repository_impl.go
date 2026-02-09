package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/pkg/logger"
	"gorm.io/gorm"
)

type activityLogRepositoryImpl struct {
	db *gorm.DB
}

func NewActivityLogRepository(db *gorm.DB) repositories.ActivityLogRepository {
	return &activityLogRepositoryImpl{db: db}
}

func (r *activityLogRepositoryImpl) Create(ctx context.Context, log *models.ActivityLog) error {
	if err := r.db.WithContext(ctx).Create(log).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to create activity log", "error", err, "user_id", log.UserID)
		return err
	}
	return nil
}

func (r *activityLogRepositoryImpl) BatchCreate(ctx context.Context, logs []*models.ActivityLog) error {
	if len(logs) == 0 {
		return nil
	}

	if err := r.db.WithContext(ctx).CreateInBatches(logs, 100).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to batch create activity logs", "error", err, "count", len(logs))
		return err
	}

	logger.InfoContext(ctx, "Batch created activity logs", "count", len(logs))
	return nil
}

func (r *activityLogRepositoryImpl) GetByUser(ctx context.Context, userID uuid.UUID, page, limit int) ([]*models.ActivityLog, int64, error) {
	var logs []*models.ActivityLog
	var total int64

	query := r.db.WithContext(ctx).Model(&models.ActivityLog{}).Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count activity logs by user", "error", err, "user_id", userID)
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&logs).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to get activity logs by user", "error", err, "user_id", userID)
		return nil, 0, err
	}

	return logs, total, nil
}

func (r *activityLogRepositoryImpl) GetByPage(ctx context.Context, pageType string, pageID *uuid.UUID, page, limit int) ([]*models.ActivityLog, int64, error) {
	var logs []*models.ActivityLog
	var total int64

	query := r.db.WithContext(ctx).Model(&models.ActivityLog{}).Where("page_type = ?", pageType)
	if pageID != nil {
		query = query.Where("page_id = ?", *pageID)
	}

	if err := query.Count(&total).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count activity logs by page", "error", err, "page_type", pageType)
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&logs).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to get activity logs by page", "error", err, "page_type", pageType)
		return nil, 0, err
	}

	return logs, total, nil
}

func (r *activityLogRepositoryImpl) CountByPage(ctx context.Context, pageType string, pageID *uuid.UUID) (int64, error) {
	var count int64

	query := r.db.WithContext(ctx).Model(&models.ActivityLog{}).Where("page_type = ?", pageType)
	if pageID != nil {
		query = query.Where("page_id = ?", *pageID)
	}

	if err := query.Count(&count).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count by page", "error", err, "page_type", pageType)
		return 0, err
	}

	return count, nil
}

func (r *activityLogRepositoryImpl) CountByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64

	if err := r.db.WithContext(ctx).Model(&models.ActivityLog{}).
		Where("user_id = ?", userID).
		Count(&count).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count by user", "error", err, "user_id", userID)
		return 0, err
	}

	return count, nil
}

func (r *activityLogRepositoryImpl) GetUserRecentHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*models.ActivityLog, error) {
	var logs []*models.ActivityLog

	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Find(&logs).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to get user recent history", "error", err, "user_id", userID)
		return nil, err
	}

	return logs, nil
}

func (r *activityLogRepositoryImpl) GetPopularPages(ctx context.Context, pageType string, startDate, endDate time.Time, limit int) ([]repositories.PageViewCount, error) {
	var results []repositories.PageViewCount

	err := r.db.WithContext(ctx).
		Model(&models.ActivityLog{}).
		Select("page_id, page_type, COUNT(*) as view_count").
		Where("page_type = ? AND page_id IS NOT NULL AND created_at BETWEEN ? AND ?", pageType, startDate, endDate).
		Group("page_id, page_type").
		Order("view_count DESC").
		Limit(limit).
		Scan(&results).Error

	if err != nil {
		logger.ErrorContext(ctx, "Failed to get popular pages", "error", err, "page_type", pageType)
		return nil, err
	}

	return results, nil
}

func (r *activityLogRepositoryImpl) DeleteOldLogs(ctx context.Context, retentionDays int) (int64, error) {
	cutoffDate := time.Now().AddDate(0, 0, -retentionDays)

	result := r.db.WithContext(ctx).
		Where("created_at < ?", cutoffDate).
		Delete(&models.ActivityLog{})

	if result.Error != nil {
		logger.ErrorContext(ctx, "Failed to delete old logs", "error", result.Error, "retention_days", retentionDays)
		return 0, result.Error
	}

	if result.RowsAffected > 0 {
		logger.InfoContext(ctx, "Deleted old activity logs", "count", result.RowsAffected, "retention_days", retentionDays)
	}

	return result.RowsAffected, nil
}

func (r *activityLogRepositoryImpl) GetAll(ctx context.Context, pageType string, page, limit int) ([]*models.ActivityLog, int64, error) {
	var logs []*models.ActivityLog
	var total int64

	query := r.db.WithContext(ctx).Model(&models.ActivityLog{})

	// Filter by pageType if provided
	if pageType != "" {
		query = query.Where("page_type = ?", pageType)
	}

	if err := query.Count(&total).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count all activity logs", "error", err)
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("User").Order("created_at DESC").Offset(offset).Limit(limit).Find(&logs).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to get all activity logs", "error", err)
		return nil, 0, err
	}

	return logs, total, nil
}
