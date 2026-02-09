package postgres

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/pkg/logger"
)

type UserStatsRepositoryImpl struct {
	db *gorm.DB
}

func NewUserStatsRepository(db *gorm.DB) repositories.UserStatsRepository {
	return &UserStatsRepositoryImpl{db: db}
}

func (r *UserStatsRepositoryImpl) Create(ctx context.Context, stats *models.UserStats) error {
	if err := r.db.WithContext(ctx).Create(stats).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to create user stats", "error", err, "user_id", stats.UserID)
		return err
	}
	return nil
}

func (r *UserStatsRepositoryImpl) GetByUserID(ctx context.Context, userID uuid.UUID) (*models.UserStats, error) {
	var stats models.UserStats
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&stats).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		logger.ErrorContext(ctx, "Failed to get user stats", "error", err, "user_id", userID)
		return nil, err
	}
	return &stats, nil
}

func (r *UserStatsRepositoryImpl) Update(ctx context.Context, stats *models.UserStats) error {
	if err := r.db.WithContext(ctx).Save(stats).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to update user stats", "error", err, "user_id", stats.UserID)
		return err
	}
	return nil
}

func (r *UserStatsRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.UserStats{}, id).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to delete user stats", "error", err, "id", id)
		return err
	}
	return nil
}

func (r *UserStatsRepositoryImpl) AddXP(ctx context.Context, userID uuid.UUID, xp int) (*models.UserStats, error) {
	stats, err := r.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if stats == nil {
		// สร้าง stats ใหม่ถ้ายังไม่มี
		stats = &models.UserStats{
			UserID: userID,
			XP:     xp,
			Level:  models.CalculateLevelFromXP(xp),
		}
		if err := r.Create(ctx, stats); err != nil {
			return nil, err
		}
		return stats, nil
	}

	// อัพเดท XP และ Level
	oldLevel := stats.Level
	stats.XP += xp
	stats.Level = models.CalculateLevelFromXP(stats.XP)

	if err := r.Update(ctx, stats); err != nil {
		return nil, err
	}

	// Log ถ้า level up
	if stats.Level > oldLevel {
		logger.InfoContext(ctx, "User leveled up",
			"user_id", userID,
			"old_level", oldLevel,
			"new_level", stats.Level,
			"xp", stats.XP,
		)
	}

	return stats, nil
}

func (r *UserStatsRepositoryImpl) CreateTitleHistory(ctx context.Context, history *models.TitleHistory) error {
	if err := r.db.WithContext(ctx).Create(history).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to create title history", "error", err, "user_id", history.UserID)
		return err
	}
	return nil
}

func (r *UserStatsRepositoryImpl) GetTitleHistoryByUserID(ctx context.Context, userID uuid.UUID) ([]models.TitleHistory, error) {
	var histories []models.TitleHistory
	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("earned_at DESC").
		Find(&histories).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to get title history", "error", err, "user_id", userID)
		return nil, err
	}
	return histories, nil
}
