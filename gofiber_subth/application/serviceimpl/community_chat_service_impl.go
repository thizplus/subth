package serviceimpl

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

type communityChatServiceImpl struct {
	chatRepo  repositories.ChatRepository
	videoRepo repositories.VideoRepository
}

func NewCommunityChatService(
	chatRepo repositories.ChatRepository,
	videoRepo repositories.VideoRepository,
) services.CommunityChatService {
	return &communityChatServiceImpl{
		chatRepo:  chatRepo,
		videoRepo: videoRepo,
	}
}

func (s *communityChatServiceImpl) SendMessage(ctx context.Context, userID uuid.UUID, req *dto.SendChatMessageRequest) (*dto.CommunityChatMessageResponse, error) {
	// Check if user is banned
	banned, err := s.chatRepo.IsUserBanned(ctx, userID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to check ban status", "error", err, "user_id", userID)
		return nil, err
	}
	if banned {
		return nil, errors.New("you are banned from chat")
	}

	// Create message
	msg := &models.ChatMessage{
		UserID:  userID,
		Content: req.Content,
	}

	// Parse reply to
	if req.ReplyTo != nil {
		replyID, err := uuid.Parse(*req.ReplyTo)
		if err == nil {
			msg.ReplyToID = &replyID
		}
	}

	// Parse video mention
	if req.VideoID != nil {
		videoID, err := uuid.Parse(*req.VideoID)
		if err == nil {
			// Verify video exists
			_, err := s.videoRepo.GetByID(ctx, videoID)
			if err == nil {
				msg.MentionedVideoID = &videoID
			}
		}
	}

	// Save message
	if err := s.chatRepo.CreateMessage(ctx, msg); err != nil {
		logger.ErrorContext(ctx, "Failed to create chat message", "error", err, "user_id", userID)
		return nil, err
	}

	// Fetch the message with relations
	savedMsg, err := s.chatRepo.GetMessageByID(ctx, msg.ID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to fetch saved message", "error", err, "message_id", msg.ID)
		return nil, err
	}

	logger.InfoContext(ctx, "Chat message sent", "message_id", msg.ID, "user_id", userID)
	return dto.ChatMessageToResponse(savedMsg), nil
}

func (s *communityChatServiceImpl) GetMessages(ctx context.Context, limit int, beforeID *uuid.UUID) ([]*dto.CommunityChatMessageResponse, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	messages, err := s.chatRepo.GetMessages(ctx, limit, beforeID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get chat messages", "error", err)
		return nil, err
	}

	return dto.ChatMessagesToResponse(messages), nil
}

func (s *communityChatServiceImpl) DeleteMessage(ctx context.Context, messageID uuid.UUID, userID uuid.UUID, isAdmin bool) error {
	// Get message
	msg, err := s.chatRepo.GetMessageByID(ctx, messageID)
	if err != nil {
		return errors.New("message not found")
	}

	// Check permission
	if !isAdmin && msg.UserID != userID {
		return errors.New("you can only delete your own messages")
	}

	if err := s.chatRepo.DeleteMessage(ctx, messageID); err != nil {
		logger.ErrorContext(ctx, "Failed to delete message", "error", err, "message_id", messageID)
		return err
	}

	logger.InfoContext(ctx, "Chat message deleted", "message_id", messageID, "deleted_by", userID)
	return nil
}

func (s *communityChatServiceImpl) BanUser(ctx context.Context, userID uuid.UUID, reason string, bannedBy uuid.UUID, duration *int) error {
	ban := &models.ChatBan{
		UserID:   userID,
		Reason:   reason,
		BannedBy: &bannedBy,
	}

	// Set expiration if duration is provided (in hours)
	if duration != nil && *duration > 0 {
		expiresAt := time.Now().Add(time.Duration(*duration) * time.Hour)
		ban.ExpiresAt = &expiresAt
	}

	if err := s.chatRepo.CreateBan(ctx, ban); err != nil {
		logger.ErrorContext(ctx, "Failed to ban user", "error", err, "user_id", userID)
		return err
	}

	logger.InfoContext(ctx, "User banned from chat", "user_id", userID, "banned_by", bannedBy, "reason", reason)
	return nil
}

func (s *communityChatServiceImpl) UnbanUser(ctx context.Context, userID uuid.UUID) error {
	if err := s.chatRepo.DeleteBan(ctx, userID); err != nil {
		logger.ErrorContext(ctx, "Failed to unban user", "error", err, "user_id", userID)
		return err
	}

	logger.InfoContext(ctx, "User unbanned from chat", "user_id", userID)
	return nil
}

func (s *communityChatServiceImpl) IsUserBanned(ctx context.Context, userID uuid.UUID) (bool, error) {
	return s.chatRepo.IsUserBanned(ctx, userID)
}
