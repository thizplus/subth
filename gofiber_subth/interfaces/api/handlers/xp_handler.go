package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type XPHandler struct {
	xpService services.XPService
}

func NewXPHandler(xpService services.XPService) *XPHandler {
	return &XPHandler{
		xpService: xpService,
	}
}

// RecordView godoc
// @Summary Record video view
// @Description Record video/reel view and award XP if criteria met
// @Tags XP
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Reel ID"
// @Param body body dto.RecordViewRequest true "View data"
// @Success 200 {object} utils.Response{data=dto.RecordViewResponse}
// @Router /api/v1/reels/{id}/view [post]
func (h *XPHandler) RecordView(c *fiber.Ctx) error {
	ctx := c.UserContext()
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	reelID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid reel ID")
	}

	var req dto.RecordViewRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		return utils.ValidationErrorResponse(c, errors)
	}

	result, err := h.xpService.RecordView(ctx, user.ID, reelID, req.WatchDuration, req.WatchPercent)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to record view", "error", err, "user_id", user.ID, "reel_id", reelID)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "View recorded",
		"user_id", user.ID,
		"reel_id", reelID,
		"xp_awarded", result.XPAwarded,
		"duration", req.WatchDuration,
	)

	return utils.SuccessResponse(c, result)
}

// GetXPHistory godoc
// @Summary Get XP history
// @Description Get XP transaction history for the authenticated user
// @Tags XP
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.XPTransactionResponse}
// @Router /api/v1/users/me/xp-history [get]
func (h *XPHandler) GetXPHistory(c *fiber.Ctx) error {
	ctx := c.UserContext()
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	transactions, total, err := h.xpService.GetXPHistory(ctx, user.ID, page, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get XP history", "error", err, "user_id", user.ID)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, dto.XPTransactionsToResponse(transactions), total, page, limit)
}
