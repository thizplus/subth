package handlers

import (
	"github.com/gofiber/fiber/v2"

	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type StatsHandler struct {
	statsService services.StatsService
}

func NewStatsHandler(statsService services.StatsService) *StatsHandler {
	return &StatsHandler{
		statsService: statsService,
	}
}

// GetStats godoc
// @Summary Get overall statistics
// @Tags stats
// @Produce json
// @Success 200 {object} utils.Response{data=services.StatsResponse}
// @Router /api/v1/stats [get]
func (h *StatsHandler) GetStats(c *fiber.Ctx) error {
	ctx := c.UserContext()

	stats, err := h.statsService.GetStats(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get stats", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, stats)
}

// GetTopMakers godoc
// @Summary Get top makers by video count
// @Tags stats
// @Produce json
// @Param limit query int false "Number of results" default(10)
// @Success 200 {object} utils.Response{data=[]dto.MakerResponse}
// @Router /api/v1/stats/top-makers [get]
func (h *StatsHandler) GetTopMakers(c *fiber.Ctx) error {
	ctx := c.UserContext()

	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}

	makers, err := h.statsService.GetTopMakers(ctx, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get top makers", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, makers)
}

// GetTopCasts godoc
// @Summary Get top casts by video count
// @Tags stats
// @Produce json
// @Param limit query int false "Number of results" default(10)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=[]dto.CastResponse}
// @Router /api/v1/stats/top-casts [get]
func (h *StatsHandler) GetTopCasts(c *fiber.Ctx) error {
	ctx := c.UserContext()

	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}
	lang := c.Query("lang", "en")

	casts, err := h.statsService.GetTopCasts(ctx, limit, lang)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get top casts", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, casts)
}

// GetTopTags godoc
// @Summary Get top tags by video count
// @Tags stats
// @Produce json
// @Param limit query int false "Number of results" default(10)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=[]dto.TagResponse}
// @Router /api/v1/stats/top-tags [get]
func (h *StatsHandler) GetTopTags(c *fiber.Ctx) error {
	ctx := c.UserContext()

	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}
	lang := c.Query("lang", "en")

	tags, err := h.statsService.GetTopTags(ctx, limit, lang)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get top tags", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, tags)
}
