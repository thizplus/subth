package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type ArticleLikeHandler struct {
	service   services.ArticleLikeService
	xpService services.XPService
}

func NewArticleLikeHandler(service services.ArticleLikeService, xpService services.XPService) *ArticleLikeHandler {
	return &ArticleLikeHandler{
		service:   service,
		xpService: xpService,
	}
}

// Toggle godoc
// @Summary Toggle article like
// @Description Toggle like status for an article (like/unlike)
// @Tags ArticleLikes
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Article ID"
// @Success 200 {object} utils.Response{data=dto.ArticleLikeResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /articles/{id}/like [post]
func (h *ArticleLikeHandler) Toggle(c *fiber.Ctx) error {
	ctx := c.UserContext()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Unauthorized")
	}

	articleIDStr := c.Params("id")
	articleID, err := uuid.Parse(articleIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid article ID")
	}

	result, err := h.service.Toggle(ctx, user.ID, articleID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to toggle article like", "error", err, "user_id", user.ID, "article_id", articleID)
		return utils.InternalServerErrorResponse(c)
	}

	// Award XP if liked (not unliked)
	if result.IsLiked && h.xpService != nil {
		go func() {
			// Use background context since request may complete
			_, _ = h.xpService.AwardLikeXP(ctx, user.ID, articleID)
		}()
	}

	return utils.SuccessResponse(c, result)
}

// GetStatus godoc
// @Summary Get article like status
// @Description Get like status and count for an article
// @Tags ArticleLikes
// @Produce json
// @Param id path string true "Article ID"
// @Success 200 {object} utils.Response{data=dto.ArticleLikeResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Router /articles/{id}/like [get]
func (h *ArticleLikeHandler) GetStatus(c *fiber.Ctx) error {
	ctx := c.UserContext()

	articleIDStr := c.Params("id")
	articleID, err := uuid.Parse(articleIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid article ID")
	}

	// Get likes count
	count, err := h.service.GetLikesCount(ctx, articleID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get article likes count", "error", err, "article_id", articleID)
		return utils.InternalServerErrorResponse(c)
	}

	// Check if user liked (if authenticated)
	isLiked := false
	user, err := utils.GetUserFromContext(c)
	if err == nil && user != nil {
		isLiked, _ = h.service.IsLiked(ctx, user.ID, articleID)
	}

	return utils.SuccessResponse(c, fiber.Map{
		"isLiked":    isLiked,
		"likesCount": count,
	})
}
