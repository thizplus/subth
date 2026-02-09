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

type xpTransactionRepositoryImpl struct {
	db *gorm.DB
}

func NewXPTransactionRepository(db *gorm.DB) repositories.XPTransactionRepository {
	return &xpTransactionRepositoryImpl{db: db}
}

func (r *xpTransactionRepositoryImpl) Create(ctx context.Context, tx *models.XPTransaction) error {
	if err := r.db.WithContext(ctx).Create(tx).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to create XP transaction", "error", err, "user_id", tx.UserID, "source", tx.Source)
		return err
	}
	return nil
}

func (r *xpTransactionRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.XPTransaction, error) {
	var tx models.XPTransaction
	if err := r.db.WithContext(ctx).First(&tx, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		logger.ErrorContext(ctx, "Failed to get XP transaction", "error", err, "id", id)
		return nil, err
	}
	return &tx, nil
}

func (r *xpTransactionRepositoryImpl) ListByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.XPTransaction, int64, error) {
	var transactions []models.XPTransaction
	var total int64

	// Count total
	if err := r.db.WithContext(ctx).
		Model(&models.XPTransaction{}).
		Where("user_id = ?", userID).
		Count(&total).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count XP transactions", "error", err, "user_id", userID)
		return nil, 0, err
	}

	// Get transactions
	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to list XP transactions", "error", err, "user_id", userID)
		return nil, 0, err
	}

	return transactions, total, nil
}

func (r *xpTransactionRepositoryImpl) HasReceivedXP(ctx context.Context, userID uuid.UUID, source models.XPSource, referenceID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.XPTransaction{}).
		Where("user_id = ? AND source = ? AND reference_id = ?", userID, source, referenceID).
		Count(&count).Error
	if err != nil {
		logger.ErrorContext(ctx, "Failed to check XP received", "error", err, "user_id", userID, "source", source)
		return false, err
	}
	return count > 0, nil
}

func (r *xpTransactionRepositoryImpl) HasReceivedRegistrationXP(ctx context.Context, userID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.XPTransaction{}).
		Where("user_id = ? AND source = ?", userID, models.XPSourceRegistration).
		Count(&count).Error
	if err != nil {
		logger.ErrorContext(ctx, "Failed to check registration XP", "error", err, "user_id", userID)
		return false, err
	}
	return count > 0, nil
}

func (r *xpTransactionRepositoryImpl) CountDailyCommentXP(ctx context.Context, userID uuid.UUID, date time.Time) (int, error) {
	// ตัดเวลาให้เหลือแค่วันที่
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.XPTransaction{}).
		Where("user_id = ? AND source = ? AND created_at >= ? AND created_at < ?",
			userID, models.XPSourceComment, startOfDay, endOfDay).
		Count(&count).Error
	if err != nil {
		logger.ErrorContext(ctx, "Failed to count daily comment XP", "error", err, "user_id", userID)
		return 0, err
	}
	return int(count), nil
}

func (r *xpTransactionRepositoryImpl) GetTotalXPByUser(ctx context.Context, userID uuid.UUID) (int, error) {
	var total int64
	err := r.db.WithContext(ctx).
		Model(&models.XPTransaction{}).
		Select("COALESCE(SUM(xp_amount), 0)").
		Where("user_id = ?", userID).
		Scan(&total).Error
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get total XP", "error", err, "user_id", userID)
		return 0, err
	}
	return int(total), nil
}
