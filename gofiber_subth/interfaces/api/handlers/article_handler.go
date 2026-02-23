package handlers

import (
	"io"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type ArticleHandler struct {
	articleService services.ArticleService
}

func NewArticleHandler(articleService services.ArticleService) *ArticleHandler {
	return &ArticleHandler{
		articleService: articleService,
	}
}

// IngestArticle - รับบทความจาก worker
// POST /api/v1/articles/ingest
func (h *ArticleHandler) IngestArticle(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.IngestArticleRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	// Get raw body for content storage
	rawBody, err := io.ReadAll(c.Request().BodyStream())
	if err != nil {
		// Body already read by BodyParser, use request body
		rawBody = c.Body()
	}

	article, err := h.articleService.IngestArticle(ctx, &req, rawBody)
	if err != nil {
		switch err.Error() {
		case "invalid video_id":
			return utils.BadRequestResponse(c, "Invalid video_id")
		case "video not found":
			return utils.NotFoundResponse(c, "Video not found")
		}
		logger.ErrorContext(ctx, "Failed to ingest article", "video_id", req.VideoID, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Article ingested", "article_id", article.ID, "video_id", req.VideoID)
	return utils.CreatedResponse(c, article)
}

// GetArticle - ดึงรายละเอียดบทความ
// GET /api/v1/articles/:id
func (h *ArticleHandler) GetArticle(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid article ID")
	}

	article, err := h.articleService.GetArticle(ctx, id)
	if err != nil {
		if err.Error() == "article not found" {
			return utils.NotFoundResponse(c, "Article not found")
		}
		logger.ErrorContext(ctx, "Failed to get article", "article_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, article)
}

// ListArticles - รายการบทความ
// GET /api/v1/articles
func (h *ArticleHandler) ListArticles(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var params dto.ArticleListParams
	if err := c.QueryParser(&params); err != nil {
		logger.WarnContext(ctx, "Invalid query parameters", "error", err)
		return utils.BadRequestResponse(c, "Invalid query parameters")
	}

	articles, total, err := h.articleService.ListArticles(ctx, &params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list articles", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	params.SetDefaults()
	return utils.PaginatedSuccessResponse(c, articles, total, params.Page, params.Limit)
}

// GetStats - สถิติบทความ
// GET /api/v1/articles/stats
func (h *ArticleHandler) GetStats(c *fiber.Ctx) error {
	ctx := c.UserContext()

	stats, err := h.articleService.GetStats(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get article stats", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, stats)
}

// UpdateStatus - เปลี่ยนสถานะบทความ
// PATCH /api/v1/articles/:id/status
func (h *ArticleHandler) UpdateStatus(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid article ID")
	}

	var req dto.UpdateArticleStatusRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	if err := h.articleService.UpdateStatus(ctx, id, &req); err != nil {
		switch err.Error() {
		case "article not found":
			return utils.NotFoundResponse(c, "Article not found")
		case "scheduledAt is required for scheduled status":
			return utils.BadRequestResponse(c, "scheduledAt is required for scheduled status")
		}
		logger.ErrorContext(ctx, "Failed to update article status", "article_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Article status updated", "article_id", id, "status", req.Status)
	return utils.SuccessResponse(c, fiber.Map{"message": "Status updated successfully"})
}

// BulkSchedule - ตั้งเวลาเผยแพร่หลายบทความ
// POST /api/v1/articles/bulk-schedule
func (h *ArticleHandler) BulkSchedule(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.BulkScheduleRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	if err := h.articleService.BulkSchedule(ctx, &req); err != nil {
		if err.Error() == "no valid article IDs provided" {
			return utils.BadRequestResponse(c, "No valid article IDs provided")
		}
		logger.ErrorContext(ctx, "Failed to bulk schedule articles", "count", len(req.ArticleIDs), "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Articles bulk scheduled", "count", len(req.ArticleIDs))
	return utils.SuccessResponse(c, fiber.Map{
		"message": "Articles scheduled successfully",
		"count":   len(req.ArticleIDs),
	})
}

// DeleteArticle - ลบบทความ
// DELETE /api/v1/articles/:id
func (h *ArticleHandler) DeleteArticle(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid article ID")
	}

	if err := h.articleService.DeleteArticle(ctx, id); err != nil {
		if err.Error() == "article not found" {
			return utils.NotFoundResponse(c, "Article not found")
		}
		logger.ErrorContext(ctx, "Failed to delete article", "article_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Article deleted", "article_id", id)
	return utils.SuccessResponse(c, fiber.Map{"message": "Article deleted successfully"})
}

// ========================================
// Public API (for nextjs_subth)
// ========================================

// GetPublishedArticle - ดึงบทความที่เผยแพร่แล้ว (Public)
// GET /api/v1/articles/slug/:slug
func (h *ArticleHandler) GetPublishedArticle(c *fiber.Ctx) error {
	ctx := c.UserContext()

	slug := c.Params("slug")
	if slug == "" {
		return utils.BadRequestResponse(c, "Slug is required")
	}

	article, err := h.articleService.GetPublishedArticle(ctx, slug)
	if err != nil {
		if err.Error() == "article not found" {
			return utils.NotFoundResponse(c, "Article not found")
		}
		logger.ErrorContext(ctx, "Failed to get published article", "slug", slug, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, article)
}
