package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type UserStatsHandler struct {
	userStatsService services.UserStatsService
}

func NewUserStatsHandler(userStatsService services.UserStatsService) *UserStatsHandler {
	return &UserStatsHandler{
		userStatsService: userStatsService,
	}
}

// GetMyStats godoc
// @Summary Get my stats
// @Description Get stats of the authenticated user
// @Tags UserStats
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=dto.UserStatsResponse}
// @Router /api/v1/user/stats [get]
func (h *UserStatsHandler) GetMyStats(c *fiber.Ctx) error {
	ctx := c.UserContext()
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	stats, err := h.userStatsService.GetOrCreate(ctx, user.ID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get user stats", "error", err, "user_id", user.ID)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, dto.UserStatsToResponse(stats))
}

// GetUserStats godoc
// @Summary Get user stats by ID
// @Description Get stats of a specific user
// @Tags UserStats
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} utils.Response{data=dto.UserStatsResponse}
// @Router /api/v1/users/{id}/stats [get]
func (h *UserStatsHandler) GetUserStats(c *fiber.Ctx) error {
	ctx := c.UserContext()
	idStr := c.Params("id")

	userID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid user ID")
	}

	stats, err := h.userStatsService.GetStats(ctx, userID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get user stats", "error", err, "user_id", userID)
		return utils.InternalServerErrorResponse(c)
	}

	if stats == nil {
		return utils.NotFoundResponse(c, "User stats not found")
	}

	return utils.SuccessResponse(c, dto.UserStatsToResponse(stats))
}

// AddXP godoc
// @Summary Add XP to user
// @Description Add XP to the authenticated user
// @Tags UserStats
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body dto.AddXPRequest true "XP to add"
// @Success 200 {object} utils.Response{data=dto.AddXPResponse}
// @Router /api/v1/user/stats/xp [post]
func (h *UserStatsHandler) AddXP(c *fiber.Ctx) error {
	ctx := c.UserContext()
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	var req dto.AddXPRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		return utils.ValidationErrorResponse(c, errors)
	}

	stats, leveledUp, err := h.userStatsService.AddXP(ctx, user.ID, req.XP, req.Source)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to add XP", "error", err, "user_id", user.ID)
		return utils.InternalServerErrorResponse(c)
	}

	response := dto.AddXPResponse{
		Stats:     *dto.UserStatsToResponse(stats),
		LeveledUp: leveledUp,
		XPAdded:   req.XP,
	}

	return utils.SuccessResponse(c, response)
}

// RegenerateTitle godoc
// @Summary Regenerate title
// @Description Generate a new AI title for the authenticated user
// @Tags UserStats
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=dto.UserStatsResponse}
// @Router /api/v1/user/stats/regenerate-title [post]
func (h *UserStatsHandler) RegenerateTitle(c *fiber.Ctx) error {
	ctx := c.UserContext()
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	stats, err := h.userStatsService.RegenerateTitle(ctx, user.ID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to regenerate title", "error", err, "user_id", user.ID)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "User regenerated title",
		"user_id", user.ID,
		"title", stats.Title,
	)

	return utils.SuccessResponse(c, dto.UserStatsToResponse(stats))
}

// GetTitleHistory godoc
// @Summary Get title history
// @Description Get all title history of the authenticated user
// @Tags UserStats
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=[]dto.TitleHistoryResponse}
// @Router /api/v1/user/stats/titles [get]
func (h *UserStatsHandler) GetTitleHistory(c *fiber.Ctx) error {
	ctx := c.UserContext()
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	histories, err := h.userStatsService.GetTitleHistory(ctx, user.ID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get title history", "error", err, "user_id", user.ID)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, dto.TitleHistoriesToResponse(histories))
}

// RecordLogin godoc
// @Summary Record login
// @Description Record login and add daily XP
// @Tags UserStats
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=dto.UserStatsResponse}
// @Router /api/v1/user/stats/login [post]
func (h *UserStatsHandler) RecordLogin(c *fiber.Ctx) error {
	ctx := c.UserContext()
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	stats, err := h.userStatsService.RecordLogin(ctx, user.ID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to record login", "error", err, "user_id", user.ID)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, dto.UserStatsToResponse(stats))
}
