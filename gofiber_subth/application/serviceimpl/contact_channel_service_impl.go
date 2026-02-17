package serviceimpl

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

type ContactChannelServiceImpl struct {
	channelRepo repositories.ContactChannelRepository
}

func NewContactChannelService(channelRepo repositories.ContactChannelRepository) services.ContactChannelService {
	return &ContactChannelServiceImpl{
		channelRepo: channelRepo,
	}
}

func (s *ContactChannelServiceImpl) Create(ctx context.Context, req *dto.CreateContactChannelRequest) (*dto.ContactChannelResponse, error) {
	// กำหนดค่าเริ่มต้น isActive = true ถ้าไม่ได้ส่งมา
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	// หา sort_order ถัดไป
	count, err := s.channelRepo.Count(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to count contact channels", "error", err)
		return nil, err
	}

	channel := &models.ContactChannel{
		Platform:    req.Platform,
		Title:       req.Title,
		Description: req.Description,
		URL:         req.URL,
		SortOrder:   int(count),
		IsActive:    isActive,
	}

	if err := s.channelRepo.Create(ctx, channel); err != nil {
		logger.ErrorContext(ctx, "Failed to create contact channel", "platform", req.Platform, "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "Contact channel created", "channel_id", channel.ID, "platform", channel.Platform)

	return s.toResponse(channel), nil
}

func (s *ContactChannelServiceImpl) GetByID(ctx context.Context, id uuid.UUID) (*dto.ContactChannelResponse, error) {
	channel, err := s.channelRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("contact channel not found")
		}
		logger.ErrorContext(ctx, "Failed to get contact channel", "channel_id", id, "error", err)
		return nil, err
	}

	return s.toResponse(channel), nil
}

func (s *ContactChannelServiceImpl) Update(ctx context.Context, id uuid.UUID, req *dto.UpdateContactChannelRequest) (*dto.ContactChannelResponse, error) {
	channel, err := s.channelRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("contact channel not found")
		}
		logger.ErrorContext(ctx, "Failed to get contact channel for update", "channel_id", id, "error", err)
		return nil, err
	}

	// Update fields ที่มีการส่งมา
	if req.Platform != nil {
		channel.Platform = *req.Platform
	}
	if req.Title != nil {
		channel.Title = *req.Title
	}
	if req.Description != nil {
		channel.Description = *req.Description
	}
	if req.URL != nil {
		channel.URL = *req.URL
	}
	if req.IsActive != nil {
		channel.IsActive = *req.IsActive
	}

	if err := s.channelRepo.Update(ctx, channel); err != nil {
		logger.ErrorContext(ctx, "Failed to update contact channel", "channel_id", id, "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "Contact channel updated", "channel_id", id)

	return s.toResponse(channel), nil
}

func (s *ContactChannelServiceImpl) Delete(ctx context.Context, id uuid.UUID) error {
	// ตรวจสอบว่ามีอยู่หรือไม่
	_, err := s.channelRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("contact channel not found")
		}
		logger.ErrorContext(ctx, "Failed to get contact channel for delete", "channel_id", id, "error", err)
		return err
	}

	if err := s.channelRepo.Delete(ctx, id); err != nil {
		logger.ErrorContext(ctx, "Failed to delete contact channel", "channel_id", id, "error", err)
		return err
	}

	logger.InfoContext(ctx, "Contact channel deleted", "channel_id", id)
	return nil
}

func (s *ContactChannelServiceImpl) List(ctx context.Context, includeInactive bool) ([]dto.ContactChannelResponse, error) {
	channels, err := s.channelRepo.List(ctx, includeInactive)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list contact channels", "error", err)
		return nil, err
	}

	return s.toResponses(channels), nil
}

func (s *ContactChannelServiceImpl) Reorder(ctx context.Context, ids []uuid.UUID) error {
	if err := s.channelRepo.Reorder(ctx, ids); err != nil {
		logger.ErrorContext(ctx, "Failed to reorder contact channels", "error", err)
		return err
	}

	logger.InfoContext(ctx, "Contact channels reordered", "count", len(ids))
	return nil
}

// Helper functions

func (s *ContactChannelServiceImpl) toResponse(channel *models.ContactChannel) *dto.ContactChannelResponse {
	return &dto.ContactChannelResponse{
		ID:          channel.ID,
		Platform:    channel.Platform,
		Title:       channel.Title,
		Description: channel.Description,
		URL:         channel.URL,
		SortOrder:   channel.SortOrder,
		IsActive:    channel.IsActive,
		CreatedAt:   channel.CreatedAt,
		UpdatedAt:   channel.UpdatedAt,
	}
}

func (s *ContactChannelServiceImpl) toResponses(channels []*models.ContactChannel) []dto.ContactChannelResponse {
	result := make([]dto.ContactChannelResponse, 0, len(channels))
	for _, ch := range channels {
		result = append(result, *s.toResponse(ch))
	}
	return result
}
