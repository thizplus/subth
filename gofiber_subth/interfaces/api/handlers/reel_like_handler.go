package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type ReelLikeHandler struct {
	likeService services.ReelLikeService
	xpService   services.XPService
}

func NewReelLikeHandler(likeService services.ReelLikeService, xpService services.XPService) *ReelLikeHandler {
	return &ReelLikeHandler{
		likeService: likeService,
		xpService:   xpService,
	}
}

// ToggleLike godoc
// @Summary Toggle like on a reel
// @Tags Reel Likes
// @Accept json
// @Produce json
// @Param id path string true "Reel ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/reels/{id}/like [post]
func (h *ReelLikeHandler) ToggleLike(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Get user from context (set by auth middleware)
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	// Get reel ID from params
	reelIDStr := c.Params("id")
	reelID, err := uuid.Parse(reelIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid reel ID")
	}

	// Toggle like
	result, err := h.likeService.Toggle(ctx, user.ID, reelID)
	if err != nil {
		return utils.InternalServerErrorResponse(c)
	}

	// Award XP if user liked (not unliked)
	if result.IsLiked && h.xpService != nil {
		xpResult, err := h.xpService.AwardLikeXP(ctx, user.ID, reelID)
		if err != nil {
			logger.WarnContext(ctx, "Failed to award like XP", "error", err, "user_id", user.ID, "reel_id", reelID)
		} else if xpResult.Awarded {
			logger.InfoContext(ctx, "Like XP awarded", "user_id", user.ID, "reel_id", reelID, "xp", xpResult.XPAmount)
		}
	}

	return utils.SuccessResponse(c, result)
}

// GetLikeStatus godoc
// @Summary Get like status for a reel
// @Tags Reel Likes
// @Accept json
// @Produce json
// @Param id path string true "Reel ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/reels/{id}/like [get]
func (h *ReelLikeHandler) GetLikeStatus(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Get reel ID from params
	reelIDStr := c.Params("id")
	reelID, err := uuid.Parse(reelIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid reel ID")
	}

	// Get likes count
	count, err := h.likeService.GetLikesCount(ctx, reelID)
	if err != nil {
		return utils.InternalServerErrorResponse(c)
	}

	// Check if user liked (if authenticated via Optional middleware)
	isLiked := false
	user, err := utils.GetUserFromContext(c)
	if err == nil && user != nil {
		isLiked, _ = h.likeService.IsLiked(ctx, user.ID, reelID)
	}

	return utils.SuccessResponse(c, fiber.Map{
		"isLiked":    isLiked,
		"likesCount": count,
	})
}
