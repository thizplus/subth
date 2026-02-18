package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
)

type chatRepositoryImpl struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) repositories.ChatRepository {
	return &chatRepositoryImpl{db: db}
}

func (r *chatRepositoryImpl) CreateMessage(ctx context.Context, msg *models.ChatMessage) error {
	return r.db.WithContext(ctx).Create(msg).Error
}

func (r *chatRepositoryImpl) GetMessages(ctx context.Context, limit int, beforeID *uuid.UUID) ([]*models.ChatMessage, error) {
	var messages []*models.ChatMessage

	query := r.db.WithContext(ctx).
		Preload("User").
		Preload("User.Stats").
		Preload("MentionedVideo").
		Preload("MentionedVideo.Translations", "lang = ?", "th").
		Preload("ReplyTo").
		Preload("ReplyTo.User").
		Where("is_deleted = ?", false)

	if beforeID != nil {
		// Get messages older than the given ID
		var beforeMsg models.ChatMessage
		if err := r.db.WithContext(ctx).Select("created_at").Where("id = ?", beforeID).First(&beforeMsg).Error; err == nil {
			query = query.Where("created_at < ?", beforeMsg.CreatedAt)
		}
	}

	err := query.
		Order("created_at DESC").
		Limit(limit).
		Find(&messages).Error

	if err != nil {
		return nil, err
	}

	// Reverse to get chronological order
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

func (r *chatRepositoryImpl) GetMessageByID(ctx context.Context, id uuid.UUID) (*models.ChatMessage, error) {
	var msg models.ChatMessage
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("User.Stats").
		Preload("MentionedVideo").
		Preload("MentionedVideo.Translations", "lang = ?", "th").
		Preload("ReplyTo").
		Preload("ReplyTo.User").
		Where("id = ? AND is_deleted = ?", id, false).
		First(&msg).Error
	if err != nil {
		return nil, err
	}
	return &msg, nil
}

func (r *chatRepositoryImpl) DeleteMessage(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.ChatMessage{}).
		Where("id = ?", id).
		Update("is_deleted", true).Error
}

func (r *chatRepositoryImpl) CreateBan(ctx context.Context, ban *models.ChatBan) error {
	return r.db.WithContext(ctx).Create(ban).Error
}

func (r *chatRepositoryImpl) GetBanByUserID(ctx context.Context, userID uuid.UUID) (*models.ChatBan, error) {
	var ban models.ChatBan
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		First(&ban).Error
	if err != nil {
		return nil, err
	}
	return &ban, nil
}

func (r *chatRepositoryImpl) DeleteBan(ctx context.Context, userID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Delete(&models.ChatBan{}).Error
}

func (r *chatRepositoryImpl) IsUserBanned(ctx context.Context, userID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.ChatBan{}).
		Where("user_id = ? AND (expires_at IS NULL OR expires_at > ?)", userID, time.Now()).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
