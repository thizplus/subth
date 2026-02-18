package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type ChatRepository interface {
	// Messages
	CreateMessage(ctx context.Context, msg *models.ChatMessage) error
	GetMessages(ctx context.Context, limit int, beforeID *uuid.UUID) ([]*models.ChatMessage, error)
	GetMessageByID(ctx context.Context, id uuid.UUID) (*models.ChatMessage, error)
	DeleteMessage(ctx context.Context, id uuid.UUID) error

	// Bans
	CreateBan(ctx context.Context, ban *models.ChatBan) error
	GetBanByUserID(ctx context.Context, userID uuid.UUID) (*models.ChatBan, error)
	DeleteBan(ctx context.Context, userID uuid.UUID) error
	IsUserBanned(ctx context.Context, userID uuid.UUID) (bool, error)
}
