package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type FeedHandler struct {
	feedService services.FeedService
}

func NewFeedHandler(feedService services.FeedService) *FeedHandler {
	return &FeedHandler{
		feedService: feedService,
	}
}

// GetFeed godoc
// @Summary Get feed items (videos with reel covers)
// @Description Returns videos with reels for the home feed page, showing cover images and tags
// @Tags feed
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.FeedItemResponse}
// @Router /api/v1/feed [get]
func (h *FeedHandler) GetFeed(c *fiber.Ctx) error {
	ctx := c.UserContext()

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	lang := c.Query("lang", "en")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 50 {
		limit = 50
	}

	// Optional: get userID from context if authenticated
	var userID *uuid.UUID
	if user, err := utils.GetUserFromContext(c); err == nil {
		userID = &user.ID
	}

	items, total, err := h.feedService.GetFeed(ctx, page, limit, lang, userID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get feed", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, items, total, page, limit)
}

// GetReels godoc
// @Summary Get reel videos for vertical player
// @Description Returns videos with reels for the reels page, including video URLs for playback
// @Tags feed
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.ReelItemResponse}
// @Router /api/v1/reels [get]
func (h *FeedHandler) GetReels(c *fiber.Ctx) error {
	ctx := c.UserContext()

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	lang := c.Query("lang", "en")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 30 {
		limit = 30
	}

	// Optional: get userID from context if authenticated
	var userID *uuid.UUID
	if user, err := utils.GetUserFromContext(c); err == nil {
		userID = &user.ID
	}

	items, total, err := h.feedService.GetReels(ctx, page, limit, lang, userID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get reels", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, items, total, page, limit)
}
