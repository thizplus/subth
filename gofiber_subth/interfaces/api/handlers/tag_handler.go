package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type TagHandler struct {
	tagService services.TagService
}

func NewTagHandler(tagService services.TagService) *TagHandler {
	return &TagHandler{
		tagService: tagService,
	}
}

// CreateTag godoc
// @Summary Create a new tag
// @Tags tags
// @Accept json
// @Produce json
// @Param tag body dto.CreateTagRequest true "Tag data"
// @Success 201 {object} utils.Response{data=dto.TagDetailResponse}
// @Router /api/v1/tags [post]
func (h *TagHandler) CreateTag(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.CreateTagRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	tag, err := h.tagService.CreateTag(ctx, &req)
	if err != nil {
		if err.Error() == "tag already exists" {
			return utils.ConflictResponse(c, "Tag already exists")
		}
		logger.ErrorContext(ctx, "Failed to create tag", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Tag created", "tag_id", tag.ID)
	return utils.CreatedResponse(c, tag)
}

// UpdateTag godoc
// @Summary Update tag
// @Tags tags
// @Accept json
// @Produce json
// @Param id path string true "Tag ID"
// @Param tag body dto.UpdateTagRequest true "Tag data"
// @Success 200 {object} utils.Response{data=dto.TagDetailResponse}
// @Router /api/v1/tags/{id} [put]
func (h *TagHandler) UpdateTag(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid tag ID")
	}

	var req dto.UpdateTagRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	tag, err := h.tagService.UpdateTag(ctx, id, &req)
	if err != nil {
		if err.Error() == "tag not found" {
			return utils.NotFoundResponse(c, "Tag not found")
		}
		if err.Error() == "tag name already exists" {
			return utils.ConflictResponse(c, "Tag name already exists")
		}
		logger.ErrorContext(ctx, "Failed to update tag", "tag_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Tag updated", "tag_id", id)
	return utils.SuccessResponse(c, tag)
}

// DeleteTag godoc
// @Summary Delete tag
// @Tags tags
// @Produce json
// @Param id path string true "Tag ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/tags/{id} [delete]
func (h *TagHandler) DeleteTag(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid tag ID")
	}

	if err := h.tagService.DeleteTag(ctx, id); err != nil {
		if err.Error() == "tag not found" {
			return utils.NotFoundResponse(c, "Tag not found")
		}
		if err.Error() == "cannot delete tag with associated videos" {
			return utils.BadRequestResponse(c, "Cannot delete tag with associated videos")
		}
		logger.ErrorContext(ctx, "Failed to delete tag", "tag_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Tag deleted", "tag_id", id)
	return utils.SuccessResponse(c, fiber.Map{"message": "Tag deleted successfully"})
}

// GetTag godoc
// @Summary Get tag by ID
// @Tags tags
// @Produce json
// @Param id path string true "Tag ID"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=dto.TagDetailResponse}
// @Router /api/v1/tags/{id} [get]
func (h *TagHandler) GetTag(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid tag ID")
	}

	lang := c.Query("lang", "en")

	tag, err := h.tagService.GetTag(ctx, id, lang)
	if err != nil {
		if err.Error() == "tag not found" {
			return utils.NotFoundResponse(c, "Tag not found")
		}
		logger.ErrorContext(ctx, "Failed to get tag", "tag_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, tag)
}

// GetTagBySlug godoc
// @Summary Get tag by slug
// @Tags tags
// @Produce json
// @Param slug path string true "Tag slug"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=dto.TagDetailResponse}
// @Router /api/v1/tags/slug/{slug} [get]
func (h *TagHandler) GetTagBySlug(c *fiber.Ctx) error {
	ctx := c.UserContext()

	slug := c.Params("slug")
	lang := c.Query("lang", "en")

	tag, err := h.tagService.GetTagBySlug(ctx, slug, lang)
	if err != nil {
		if err.Error() == "tag not found" {
			return utils.NotFoundResponse(c, "Tag not found")
		}
		logger.ErrorContext(ctx, "Failed to get tag by slug", "slug", slug, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, tag)
}

// ListTags godoc
// @Summary List tags with pagination
// @Tags tags
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param search query string false "Search by name"
// @Param sort_by query string false "Sort by field" Enums(name, video_count, created_at)
// @Param order query string false "Sort order" Enums(asc, desc)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.TagResponse}
// @Router /api/v1/tags [get]
func (h *TagHandler) ListTags(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.TagListRequest
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

	tags, total, err := h.tagService.ListTags(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list tags", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, tags, total, req.Page, req.Limit)
}

// SearchTags godoc
// @Summary Search tags by name
// @Tags tags
// @Produce json
// @Param q query string true "Search query"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param limit query int false "Number of results" default(10)
// @Success 200 {object} utils.Response{data=[]dto.TagResponse}
// @Router /api/v1/tags/search [get]
func (h *TagHandler) SearchTags(c *fiber.Ctx) error {
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

	tags, err := h.tagService.SearchTags(ctx, query, lang, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to search tags", "query", query, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, tags)
}

// GetTopTags godoc
// @Summary Get top tags by video count
// @Tags tags
// @Produce json
// @Param limit query int false "Number of results" default(10)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=[]dto.TagResponse}
// @Router /api/v1/tags/top [get]
func (h *TagHandler) GetTopTags(c *fiber.Ctx) error {
	ctx := c.UserContext()

	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}
	lang := c.Query("lang", "en")

	tags, err := h.tagService.GetTopTags(ctx, limit, lang)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get top tags", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, tags)
}

// ListAutoTags godoc
// @Summary List auto tags (CLIP-detected)
// @Tags tags
// @Produce json
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param category query string false "Filter by category"
// @Success 200 {object} utils.Response{data=[]dto.AutoTagLabelResponse}
// @Router /api/v1/tags/auto [get]
func (h *TagHandler) ListAutoTags(c *fiber.Ctx) error {
	ctx := c.UserContext()

	lang := c.Query("lang", "en")
	category := c.Query("category")

	autoTags, err := h.tagService.ListAutoTags(ctx, lang, category)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list auto tags", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, autoTags)
}

// GetAutoTagsByKeys godoc
// @Summary Get auto tags by keys
// @Tags tags
// @Produce json
// @Param keys query string true "Comma-separated auto tag keys"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=[]dto.AutoTagResponse}
// @Router /api/v1/tags/auto/by-keys [get]
func (h *TagHandler) GetAutoTagsByKeys(c *fiber.Ctx) error {
	ctx := c.UserContext()

	keysStr := c.Query("keys")
	if keysStr == "" {
		return utils.BadRequestResponse(c, "Keys parameter is required")
	}

	keys := strings.Split(keysStr, ",")
	lang := c.Query("lang", "en")

	autoTags, err := h.tagService.GetAutoTagsByKeys(ctx, keys, lang)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get auto tags by keys", "keys", keys, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, autoTags)
}
