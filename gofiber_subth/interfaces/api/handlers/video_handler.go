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

type VideoHandler struct {
	videoService services.VideoService
}

func NewVideoHandler(videoService services.VideoService) *VideoHandler {
	return &VideoHandler{
		videoService: videoService,
	}
}

// CreateVideo godoc
// @Summary Create a new video
// @Tags videos
// @Accept json
// @Produce json
// @Param video body dto.CreateVideoRequest true "Video data"
// @Success 201 {object} utils.Response{data=dto.VideoResponse}
// @Router /api/v1/videos [post]
func (h *VideoHandler) CreateVideo(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.CreateVideoRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	video, err := h.videoService.CreateVideo(ctx, &req)
	if err != nil {
		logger.WarnContext(ctx, "Failed to create video", "error", err)
		return utils.BadRequestResponse(c, err.Error())
	}

	logger.InfoContext(ctx, "Video created", "video_id", video.ID)
	return utils.CreatedResponse(c, video)
}

// CreateVideoBatch godoc
// @Summary Create multiple videos in batch
// @Tags videos
// @Accept json
// @Produce json
// @Param videos body dto.BatchCreateVideoRequest true "Batch video data"
// @Success 200 {object} utils.Response{data=dto.BatchCreateVideoResponse}
// @Router /api/v1/videos/batch [post]
func (h *VideoHandler) CreateVideoBatch(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.BatchCreateVideoRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	logger.InfoContext(ctx, "Batch create videos started", "count", len(req.Videos))

	result, err := h.videoService.CreateVideoBatch(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to batch create videos", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Batch create videos completed", "total", result.Total, "succeeded", result.Succeeded, "failed", result.Failed)
	return utils.SuccessResponse(c, result)
}

// GetVideo godoc
// @Summary Get video by ID
// @Tags videos
// @Produce json
// @Param id path string true "Video ID"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=dto.VideoResponse}
// @Router /api/v1/videos/{id} [get]
func (h *VideoHandler) GetVideo(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid video ID")
	}

	lang := c.Query("lang", "en")

	video, err := h.videoService.GetVideo(ctx, id, lang)
	if err != nil {
		if err.Error() == "video not found" {
			return utils.NotFoundResponse(c, "Video not found")
		}
		logger.ErrorContext(ctx, "Failed to get video", "video_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, video)
}

// UpdateVideo godoc
// @Summary Update video
// @Tags videos
// @Accept json
// @Produce json
// @Param id path string true "Video ID"
// @Param video body dto.UpdateVideoRequest true "Video data"
// @Success 200 {object} utils.Response{data=dto.VideoResponse}
// @Router /api/v1/videos/{id} [put]
func (h *VideoHandler) UpdateVideo(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid video ID")
	}

	var req dto.UpdateVideoRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	video, err := h.videoService.UpdateVideo(ctx, id, &req)
	if err != nil {
		if err.Error() == "video not found" {
			return utils.NotFoundResponse(c, "Video not found")
		}
		logger.ErrorContext(ctx, "Failed to update video", "video_id", id, "error", err)
		return utils.BadRequestResponse(c, err.Error())
	}

	logger.InfoContext(ctx, "Video updated", "video_id", id)
	return utils.SuccessResponse(c, video)
}

// DeleteVideo godoc
// @Summary Delete video
// @Tags videos
// @Produce json
// @Param id path string true "Video ID"
// @Success 204
// @Router /api/v1/videos/{id} [delete]
func (h *VideoHandler) DeleteVideo(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid video ID")
	}

	err = h.videoService.DeleteVideo(ctx, id)
	if err != nil {
		if err.Error() == "video not found" {
			return utils.NotFoundResponse(c, "Video not found")
		}
		logger.ErrorContext(ctx, "Failed to delete video", "video_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Video deleted", "video_id", id)
	return utils.NoContentResponse(c)
}

// ListVideos godoc
// @Summary List videos with pagination
// @Tags videos
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param search query string false "Search by title"
// @Param category query string false "Filter by category"
// @Param maker_id query string false "Filter by maker ID"
// @Param auto_tags query string false "Filter by auto tags (comma-separated)"
// @Param sort_by query string false "Sort by field" Enums(created_at, date)
// @Param order query string false "Sort order" Enums(asc, desc)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.VideoListItemResponse}
// @Router /api/v1/videos [get]
func (h *VideoHandler) ListVideos(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.VideoListRequest
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

	videos, total, err := h.videoService.ListVideos(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list videos", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, videos, total, req.Page, req.Limit)
}

// GetRandomVideos godoc
// @Summary Get random videos
// @Tags videos
// @Produce json
// @Param limit query int false "Number of videos" default(10)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=[]dto.VideoListItemResponse}
// @Router /api/v1/videos/random [get]
func (h *VideoHandler) GetRandomVideos(c *fiber.Ctx) error {
	ctx := c.UserContext()

	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}
	lang := c.Query("lang", "en")

	videos, err := h.videoService.GetRandomVideos(ctx, limit, lang)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get random videos", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, videos)
}

// SearchVideos godoc
// @Summary Search videos by title
// @Tags videos
// @Produce json
// @Param q query string true "Search query"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.VideoListItemResponse}
// @Router /api/v1/videos/search [get]
func (h *VideoHandler) SearchVideos(c *fiber.Ctx) error {
	ctx := c.UserContext()

	query := c.Query("q")
	if query == "" {
		return utils.BadRequestResponse(c, "Search query is required")
	}

	lang := c.Query("lang", "en")
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}

	videos, total, err := h.videoService.SearchVideos(ctx, query, lang, page, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to search videos", "query", query, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, videos, total, page, limit)
}

// GetVideosByMaker godoc
// @Summary Get videos by maker
// @Tags videos
// @Produce json
// @Param maker_id path string true "Maker ID"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.VideoListItemResponse}
// @Router /api/v1/videos/maker/{maker_id} [get]
func (h *VideoHandler) GetVideosByMaker(c *fiber.Ctx) error {
	ctx := c.UserContext()

	makerID, err := uuid.Parse(c.Params("maker_id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid maker ID")
	}

	lang := c.Query("lang", "en")
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}

	videos, total, err := h.videoService.GetVideosByMaker(ctx, makerID, lang, page, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get videos by maker", "maker_id", makerID, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, videos, total, page, limit)
}

// GetVideosByCast godoc
// @Summary Get videos by cast
// @Tags videos
// @Produce json
// @Param cast_id path string true "Cast ID"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.VideoListItemResponse}
// @Router /api/v1/videos/cast/{cast_id} [get]
func (h *VideoHandler) GetVideosByCast(c *fiber.Ctx) error {
	ctx := c.UserContext()

	castID, err := uuid.Parse(c.Params("cast_id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid cast ID")
	}

	lang := c.Query("lang", "en")
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}

	videos, total, err := h.videoService.GetVideosByCast(ctx, castID, lang, page, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get videos by cast", "cast_id", castID, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, videos, total, page, limit)
}

// GetVideosByTag godoc
// @Summary Get videos by tag
// @Tags videos
// @Produce json
// @Param tag_id path string true "Tag ID"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.VideoListItemResponse}
// @Router /api/v1/videos/tag/{tag_id} [get]
func (h *VideoHandler) GetVideosByTag(c *fiber.Ctx) error {
	ctx := c.UserContext()

	tagID, err := uuid.Parse(c.Params("tag_id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid tag ID")
	}

	lang := c.Query("lang", "en")
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}

	videos, total, err := h.videoService.GetVideosByTag(ctx, tagID, lang, page, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get videos by tag", "tag_id", tagID, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, videos, total, page, limit)
}

// GetVideosByAutoTags godoc
// @Summary Get videos by auto tags
// @Tags videos
// @Produce json
// @Param tags query string true "Comma-separated auto tag keys"
// @Param lang query string false "Language" Enums(en, th, ja)
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse{data=[]dto.VideoListItemResponse}
// @Router /api/v1/videos/auto-tags [get]
func (h *VideoHandler) GetVideosByAutoTags(c *fiber.Ctx) error {
	ctx := c.UserContext()

	tagsStr := c.Query("tags")
	if tagsStr == "" {
		return utils.BadRequestResponse(c, "Tags parameter is required")
	}

	tags := strings.Split(tagsStr, ",")
	lang := c.Query("lang", "en")
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}

	videos, total, err := h.videoService.GetVideosByAutoTags(ctx, tags, lang, page, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get videos by auto tags", "tags", tags, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, videos, total, page, limit)
}

// GetVideosByCategories godoc
// @Summary Get videos grouped by categories (for homepage)
// @Tags videos
// @Produce json
// @Param limit query int false "Videos per category" default(4)
// @Param categories query int false "Number of categories" default(3)
// @Param lang query string false "Language" Enums(en, th, ja)
// @Success 200 {object} utils.Response{data=[]dto.CategoryWithVideosResponse}
// @Router /api/v1/videos/by-categories [get]
func (h *VideoHandler) GetVideosByCategories(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.VideosByCategoriesRequest
	if err := c.QueryParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid query parameters", "error", err)
		return utils.BadRequestResponse(c, "Invalid query parameters")
	}

	// Set defaults (CategoryCount = 0 means all categories)
	if req.LimitPerCategory <= 0 {
		req.LimitPerCategory = 4
	}
	if req.Lang == "" {
		req.Lang = "th"
	}

	result, err := h.videoService.GetVideosByCategories(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get videos by categories", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, result)
}
