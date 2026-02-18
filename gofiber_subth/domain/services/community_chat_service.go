package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type CommunityChatService interface {
	// Messages
	SendMessage(ctx context.Context, userID uuid.UUID, req *dto.SendChatMessageRequest) (*dto.CommunityChatMessageResponse, error)
	GetMessages(ctx context.Context, limit int, beforeID *uuid.UUID) ([]*dto.CommunityChatMessageResponse, error)
	DeleteMessage(ctx context.Context, messageID uuid.UUID, userID uuid.UUID, isAdmin bool) error

	// Bans
	BanUser(ctx context.Context, userID uuid.UUID, reason string, bannedBy uuid.UUID, duration *int) error
	UnbanUser(ctx context.Context, userID uuid.UUID) error
	IsUserBanned(ctx context.Context, userID uuid.UUID) (bool, error)
}
