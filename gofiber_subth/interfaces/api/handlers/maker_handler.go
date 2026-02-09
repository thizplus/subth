package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type MakerHandler struct {
	makerService services.MakerService
}

func NewMakerHandler(makerService services.MakerService) *MakerHandler {
	return &MakerHandler{
		makerService: makerService,
	}
}

// CreateMaker godoc
// @Summary Create a new maker
// @Tags makers
// @Accept json
// @Produce json
// @Param maker body dto.CreateMakerRequest true "Maker data"
// @Success 201 {object} utils.Response{data=dto.MakerDetailResponse}
// @Router /api/v1/makers [post]
func (h *MakerHandler) CreateMaker(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.CreateMakerRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	maker, err := h.makerService.CreateMaker(ctx, &req)
	if err != nil {
		if err.Error() == "maker already exists" {
			return utils.ConflictResponse(c, "Maker already exists")
		}
		logger.ErrorContext(ctx, "Failed to create maker", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Maker created", "maker_id", maker.ID)
	return utils.CreatedResponse(c, maker)
}

// UpdateMaker godoc
// @Summary Update maker
// @Tags makers
// @Accept json
// @Produce json
// @Param id path string true "Maker ID"
// @Param maker body dto.UpdateMakerRequest true "Maker data"
// @Success 200 {object} utils.Response{data=dto.MakerDetailResponse}
// @Router /api/v1/makers/{id} [put]
func (h *MakerHandler) UpdateMaker(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid maker ID")
	}

	var req dto.UpdateMakerRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	maker, err := h.makerService.UpdateMaker(ctx, id, &req)
	if err != nil {
		if err.Error() == "maker not found" {
			return utils.NotFoundResponse(c, "Maker not found")
		}
		if err.Error() == "maker name already exists" {
			return utils.ConflictResponse(c, "Maker name already exists")
		}
		logger.ErrorContext(ctx, "Failed to update maker", "maker_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Maker updated", "maker_id", id)
	return utils.SuccessResponse(c, maker)
}

// DeleteMaker godoc
// @Summary Delete maker
// @Tags makers
// @Produce json
// @Param id path string true "Maker ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/makers/{id} [delete]
func (h *MakerHandler) DeleteMaker(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid maker ID")
	}

	if err := h.makerService.DeleteMaker(ctx, id); err != nil {
		if err.Error() == "maker not found" {
			return utils.NotFoundResponse(c, "Maker not found")
		}
		if err.Error() == "cannot delete maker with associated videos" {
			return utils.BadRequestResponse(c, "Cannot delete maker with associated videos")
		}
		logger.ErrorContext(ctx, "Failed to delete maker", "maker_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Maker deleted", "maker_id", id)
	return utils.SuccessResponse(c, fiber.Map{"message": "Maker deleted successfully"})
}

// GetMaker godoc
// @Summary Get maker by ID
// @Tags makers
// @Produce json
// @Param id path string true "Maker ID"
// @Success 200 {object} utils.Response{data=dto.MakerDetailResponse}
// @Router /api/v1/makers/{id} [get]
func (h *MakerHandler) GetMaker(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid maker ID")
	}

	maker, err := h.makerService.GetMaker(ctx, id)
	if err != nil {
		if err.Error() == "maker not found" {
			return utils.NotFoundResponse(c, "Maker not found")
		}
		logger.ErrorContext(ctx, "Failed to get maker", "maker_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, maker)
}

// GetMakerBySlug godoc
// @Summary Get maker by slug
// @Tags makers
// @Produce json
// @Param slug path string true "Maker slug"
// @Success 200 {object} utils.Response{data=dto.MakerDetailResponse}
// @Router /api/v1/makers/slug/{slug} [get]
func (h *MakerHandler) GetMakerBySlug(c *fiber.Ctx) error {
	ctx := c.UserContext()

	slug := c.Params("slug")

	maker, err := h.makerService.GetMakerBySlug(ctx, slug)
	if err != nil {
		if err.Error() == "maker not found" {
			return utils.NotFoundResponse(c, "Maker not found")
		}
		logger.ErrorContext(ctx, "Failed to get maker by slug", "slug", slug, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, maker)
}

// ListMakers godoc
// @Summary List makers with pagination
// @Tags makers
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param search query string false "Search by name"
// @Param sort_by query string false "Sort by field" Enums(name, video_count, created_at)
// @Param order query string false "Sort order" Enums(asc, desc)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.MakerResponse}
// @Router /api/v1/makers [get]
func (h *MakerHandler) ListMakers(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.MakerListRequest
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

	makers, total, err := h.makerService.ListMakers(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list makers", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, makers, total, req.Page, req.Limit)
}

// SearchMakers godoc
// @Summary Search makers by name
// @Tags makers
// @Produce json
// @Param q query string true "Search query"
// @Param limit query int false "Number of results" default(10)
// @Success 200 {object} utils.Response{data=[]dto.MakerResponse}
// @Router /api/v1/makers/search [get]
func (h *MakerHandler) SearchMakers(c *fiber.Ctx) error {
	ctx := c.UserContext()

	query := c.Query("q")
	if query == "" {
		return utils.BadRequestResponse(c, "Search query is required")
	}

	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}

	makers, err := h.makerService.SearchMakers(ctx, query, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to search makers", "query", query, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, makers)
}

// GetTopMakers godoc
// @Summary Get top makers by video count
// @Tags makers
// @Produce json
// @Param limit query int false "Number of results" default(10)
// @Success 200 {object} utils.Response{data=[]dto.MakerResponse}
// @Router /api/v1/makers/top [get]
func (h *MakerHandler) GetTopMakers(c *fiber.Ctx) error {
	ctx := c.UserContext()

	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}

	makers, err := h.makerService.GetTopMakers(ctx, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get top makers", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, makers)
}
