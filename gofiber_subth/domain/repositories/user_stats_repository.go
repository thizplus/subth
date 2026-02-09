package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type UserStatsRepository interface {
	Create(ctx context.Context, stats *models.UserStats) error
	GetByUserID(ctx context.Context, userID uuid.UUID) (*models.UserStats, error)
	Update(ctx context.Context, stats *models.UserStats) error
	Delete(ctx context.Context, id uuid.UUID) error

	// XP operations
	AddXP(ctx context.Context, userID uuid.UUID, xp int) (*models.UserStats, error)

	// Title history
	CreateTitleHistory(ctx context.Context, history *models.TitleHistory) error
	GetTitleHistoryByUserID(ctx context.Context, userID uuid.UUID) ([]models.TitleHistory, error)
}
