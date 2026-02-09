package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type CastHandler struct {
	castService services.CastService
}

func NewCastHandler(castService services.CastService) *CastHandler {
	return &CastHandler{
		castService: castService,
	}
}

// CreateCast godoc
// @Summary Create a new cast
// @Tags casts
// @Accept json
// @Produce json
// @Param cast body dto.CreateCastRequest true "Cast data"
// @Success 201 {object} utils.Response{data=dto.CastDetailResponse}
// @Router /api/v1/casts [post]
func (h *CastHandler) CreateCast(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.CreateCastRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	cast, err := h.castService.CreateCast(ctx, &req)
	if err != nil {
		if err.Error() == "cast already exists" {
			return utils.ConflictResponse(c, "Cast already exists")
		}
		logger.ErrorContext(ctx, "Failed to create cast", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Cast created", "cast_id", cast.ID)
	return utils.CreatedResponse(c, cast)
}

// UpdateCast godoc
// @Summary Update cast
// @Tags casts
// @Accept json
// @Produce json
// @Param id path string true "Cast ID"
// @Param cast body dto.UpdateCastRequest true "Cast data"
// @Success 200 {object} utils.Response{data=dto.CastDetailResponse}
// @Router /api/v1/casts/{id} [put]
func (h *CastHandler) UpdateCast(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid cast ID")
	}

	var req dto.UpdateCastRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	cast, err := h.castService.UpdateCast(ctx, id, &req)
	if err != nil {
		if err.Error() == "cast not found" {
			return utils.NotFoundResponse(c, "Cast not found")
		}
		if err.Error() == "cast name already exists" {
			return utils.ConflictResponse(c, "Cast name already exists")
		}
		logger.ErrorContext(ctx, "Failed to update cast", "cast_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Cast updated", "cast_id", id)
	return utils.SuccessResponse(c, cast)
}

// DeleteCast godoc
// @Summary Delete cast
// @Tags casts
// @Produce json
// @Param id path string true "Cast ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/casts/{id} [delete]
func (h *CastHandler) DeleteCast(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid cast ID")
	}

	if err := h.castService.DeleteCast(ctx, id); err != nil {
		if err.Error() == "cast not found" {
			return utils.NotFoundResponse(c, "Cast not found")
		}
		if err.Error() == "cannot delete cast with associated videos" {
			return utils.BadRequestResponse(c, "Cannot delete cast with associated videos")
		}
		logger.ErrorContext(ctx, "Failed to delete cast", "cast_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Cast deleted", "cast_id", id)
	return utils.SuccessResponse(c, fiber.Map{"message": "Cast deleted successfully"})
}

// GetCast godoc
// @Summary Get cast by ID
// @Tags casts
// @Produce json
// @Param id path string true "Cast ID"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=dto.CastDetailResponse}
// @Router /api/v1/casts/{id} [get]
func (h *CastHandler) GetCast(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid cast ID")
	}

	lang := c.Query("lang", "en")

	cast, err := h.castService.GetCast(ctx, id, lang)
	if err != nil {
		if err.Error() == "cast not found" {
			return utils.NotFoundResponse(c, "Cast not found")
		}
		logger.ErrorContext(ctx, "Failed to get cast", "cast_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, cast)
}

// GetCastBySlug godoc
// @Summary Get cast by slug
// @Tags casts
// @Produce json
// @Param slug path string true "Cast slug"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=dto.CastDetailResponse}
// @Router /api/v1/casts/slug/{slug} [get]
func (h *CastHandler) GetCastBySlug(c *fiber.Ctx) error {
	ctx := c.UserContext()

	slug := c.Params("slug")
	lang := c.Query("lang", "en")

	cast, err := h.castService.GetCastBySlug(ctx, slug, lang)
	if err != nil {
		if err.Error() == "cast not found" {
			return utils.NotFoundResponse(c, "Cast not found")
		}
		logger.ErrorContext(ctx, "Failed to get cast by slug", "slug", slug, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, cast)
}

// ListCasts godoc
// @Summary List casts with pagination
// @Tags casts
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param search query string false "Search by name"
// @Param sort_by query string false "Sort by field" Enums(name, video_count, created_at)
// @Param order query string false "Sort order" Enums(asc, desc)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.CastResponse}
// @Router /api/v1/casts [get]
func (h *CastHandler) ListCasts(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.CastListRequest
	if err := c.QueryParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid query parameters", "error", err)
		return utils.BadRequestResponse(c, "Invalid query parameters")
	}

	// Default values
	if req.Page < 1 {
		req.Page = 1
	}
	if req.Limit < 1 {
		req.Limit = 20
	}
	if req.Limit > 100 {
		req.Limit = 100
	}
	if req.Lang == "" {
		req.Lang = "en"
	}

	casts, total, err := h.castService.ListCasts(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list casts", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, casts, total, req.Page, req.Limit)
}

// SearchCasts godoc
// @Summary Search casts by name
// @Tags casts
// @Produce json
// @Param q query string true "Search query"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param limit query int false "Number of results" default(10)
// @Success 200 {object} utils.Response{data=[]dto.CastResponse}
// @Router /api/v1/casts/search [get]
func (h *CastHandler) SearchCasts(c *fiber.Ctx) error {
	ctx := c.UserContext()

	query := c.Query("q")
	if query == "" {
		return utils.BadRequestResponse(c, "Search query is required")
	}

	lang := c.Query("lang", "en")
	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}

	casts, err := h.castService.SearchCasts(ctx, query, lang, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to search casts", "query", query, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, casts)
}

// GetTopCasts godoc
// @Summary Get top casts by video count
// @Tags casts
// @Produce json
// @Param limit query int false "Number of results" default(10)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=[]dto.CastResponse}
// @Router /api/v1/casts/top [get]
func (h *CastHandler) GetTopCasts(c *fiber.Ctx) error {
	ctx := c.UserContext()

	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}
	lang := c.Query("lang", "en")

	casts, err := h.castService.GetTopCasts(ctx, limit, lang)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get top casts", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, casts)
}
