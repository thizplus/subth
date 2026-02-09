package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type ReelHandler struct {
	reelService services.ReelService
}

func NewReelHandler(reelService services.ReelService) *ReelHandler {
	return &ReelHandler{
		reelService: reelService,
	}
}

// CreateReel godoc
// @Summary Create a new reel
// @Description Create a new reel with video URLs
// @Tags reels
// @Accept json
// @Produce json
// @Param reel body dto.CreateReelRequest true "Reel data"
// @Success 201 {object} utils.Response{data=dto.ReelResponse}
// @Router /api/v1/reels/manage [post]
func (h *ReelHandler) CreateReel(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.CreateReelRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	reel, err := h.reelService.Create(ctx, &req)
	if err != nil {
		return utils.InternalServerErrorResponse(c)
	}

	return utils.CreatedResponse(c, dto.ReelResponse{
		ID:          reel.ID,
		VideoID:     reel.VideoID,
		CoverURL:    reel.CoverURL,
		VideoURL:    reel.VideoURL,
		ThumbURL:    reel.ThumbURL,
		Title:       reel.Title,
		Description: reel.Description,
		IsActive:    reel.IsActive,
		CreatedAt:   reel.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
		UpdatedAt:   reel.UpdatedAt.UTC().Format("2006-01-02T15:04:05Z"),
	})
}

// GetReel godoc
// @Summary Get a reel by ID
// @Description Get reel details by ID
// @Tags reels
// @Produce json
// @Param id path string true "Reel ID"
// @Success 200 {object} utils.Response{data=dto.ReelResponse}
// @Router /api/v1/reels/manage/{id} [get]
func (h *ReelHandler) GetReel(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid reel ID")
	}

	reel, err := h.reelService.GetByID(ctx, id)
	if err != nil {
		return utils.NotFoundResponse(c, "Reel not found")
	}

	return utils.SuccessResponse(c, dto.ReelResponse{
		ID:          reel.ID,
		VideoID:     reel.VideoID,
		CoverURL:    reel.CoverURL,
		VideoURL:    reel.VideoURL,
		ThumbURL:    reel.ThumbURL,
		Title:       reel.Title,
		Description: reel.Description,
		IsActive:    reel.IsActive,
		CreatedAt:   reel.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
		UpdatedAt:   reel.UpdatedAt.UTC().Format("2006-01-02T15:04:05Z"),
	})
}

// UpdateReel godoc
// @Summary Update a reel
// @Description Update reel details
// @Tags reels
// @Accept json
// @Produce json
// @Param id path string true "Reel ID"
// @Param reel body dto.UpdateReelRequest true "Reel data"
// @Success 200 {object} utils.Response{data=dto.ReelResponse}
// @Router /api/v1/reels/manage/{id} [put]
func (h *ReelHandler) UpdateReel(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid reel ID")
	}

	var req dto.UpdateReelRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	reel, err := h.reelService.Update(ctx, id, &req)
	if err != nil {
		return utils.NotFoundResponse(c, "Reel not found")
	}

	return utils.SuccessResponse(c, dto.ReelResponse{
		ID:          reel.ID,
		VideoID:     reel.VideoID,
		CoverURL:    reel.CoverURL,
		VideoURL:    reel.VideoURL,
		ThumbURL:    reel.ThumbURL,
		Title:       reel.Title,
		Description: reel.Description,
		IsActive:    reel.IsActive,
		CreatedAt:   reel.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
		UpdatedAt:   reel.UpdatedAt.UTC().Format("2006-01-02T15:04:05Z"),
	})
}

// DeleteReel godoc
// @Summary Delete a reel
// @Description Delete a reel by ID
// @Tags reels
// @Produce json
// @Param id path string true "Reel ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/reels/manage/{id} [delete]
func (h *ReelHandler) DeleteReel(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid reel ID")
	}

	if err := h.reelService.Delete(ctx, id); err != nil {
		return utils.NotFoundResponse(c, "Reel not found")
	}

	return utils.SuccessResponse(c, nil)
}

// ListReels godoc
// @Summary List all reels (admin)
// @Description List all reels with pagination
// @Tags reels
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param active_only query bool false "Show active only" default(false)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.ReelResponse}
// @Router /api/v1/reels/manage [get]
func (h *ReelHandler) ListReels(c *fiber.Ctx) error {
	ctx := c.UserContext()

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	activeOnly := c.QueryBool("active_only", false)

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	items, total, err := h.reelService.List(ctx, page, limit, activeOnly)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list reels", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, items, total, page, limit)
}

// SyncReel godoc
// @Summary Sync reel from suekk CDN to R2
// @Description Download reel files from suekk CDN and upload to R2 storage
// @Tags reels
// @Accept json
// @Produce json
// @Param reel body dto.SyncReelRequest true "Sync request"
// @Success 201 {object} utils.Response{data=dto.ReelResponse}
// @Router /api/v1/reels/sync [post]
func (h *ReelHandler) SyncReel(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.SyncReelRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	logger.InfoContext(ctx, "Sync reel request", "suekk_reel_id", req.SuekkReelID)

	reel, err := h.reelService.SyncFromSuekk(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to sync reel", "error", err)
		return utils.BadRequestResponse(c, err.Error())
	}

	return utils.CreatedResponse(c, dto.ReelResponse{
		ID:          reel.ID,
		VideoID:     reel.VideoID,
		CoverURL:    reel.CoverURL,
		VideoURL:    reel.VideoURL,
		ThumbURL:    reel.ThumbURL,
		Title:       reel.Title,
		Description: reel.Description,
		IsActive:    reel.IsActive,
		CreatedAt:   reel.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
		UpdatedAt:   reel.UpdatedAt.UTC().Format("2006-01-02T15:04:05Z"),
	})
}
