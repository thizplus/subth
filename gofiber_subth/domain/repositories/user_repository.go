package repositories

import (
	"context"
	"gofiber-template/domain/models"
	"github.com/google/uuid"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByUsername(ctx context.Context, username string) (*models.User, error)
	GetByGoogleID(ctx context.Context, googleID string) (*models.User, error)
	Update(ctx context.Context, id uuid.UUID, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, offset, limit int) ([]*models.User, error)
	ListWithSearch(ctx context.Context, search string, role string, offset, limit int) ([]*models.User, int64, error)
	Count(ctx context.Context) (int64, error)
	CountNewToday(ctx context.Context) (int64, error)
	CountNewThisWeek(ctx context.Context) (int64, error)
}