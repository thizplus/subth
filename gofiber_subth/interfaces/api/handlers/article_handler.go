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

	// Get raw body first (before BodyParser consumes it)
	rawBody := c.Body()

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

	logger.InfoContext(ctx, "Article ingested", "article_id", article.ID, "video_id", req.VideoID, "language", req.Language)
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
// Deprecated: Use GetPublishedArticleByType instead
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

// GetPublishedArticleByType - ดึงบทความตาม type และ slug (Public)
// GET /api/v1/articles/:type/:slug
// Types: review, ranking, best-of, guide, news
func (h *ArticleHandler) GetPublishedArticleByType(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Extract article type from the path (e.g., /articles/review/slug -> review)
	path := c.Path()
	articleType := extractArticleTypeFromPath(path)

	slug := c.Params("slug")

	if articleType == "" {
		return utils.BadRequestResponse(c, "Article type is required")
	}
	if slug == "" {
		return utils.BadRequestResponse(c, "Slug is required")
	}

	article, err := h.articleService.GetPublishedArticleByType(ctx, articleType, slug)
	if err != nil {
		switch err.Error() {
		case "invalid article type":
			return utils.BadRequestResponse(c, "Invalid article type")
		case "article not found":
			return utils.NotFoundResponse(c, "Article not found")
		}
		logger.ErrorContext(ctx, "Failed to get published article by type", "type", articleType, "slug", slug, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, article)
}

// extractArticleTypeFromPath extracts the article type from URL path
// e.g., /api/v1/articles/review/slug -> review
func extractArticleTypeFromPath(path string) string {
	// Path format: /api/v1/articles/{type}/{slug}
	types := []string{"review", "ranking", "best-of", "guide", "news"}
	for _, t := range types {
		if strings.Contains(path, "/"+t+"/") {
			return t
		}
	}
	return ""
}

// ListPublishedArticles - รายการบทความที่เผยแพร่แล้ว (Public)
// GET /api/v1/articles/public
func (h *ArticleHandler) ListPublishedArticles(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var params dto.PublicArticleListParams
	if err := c.QueryParser(&params); err != nil {
		logger.WarnContext(ctx, "Invalid query parameters", "error", err)
		return utils.BadRequestResponse(c, "Invalid query parameters")
	}

	articles, total, err := h.articleService.ListPublishedArticles(ctx, &params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list published articles", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	params.SetDefaults()
	return utils.PaginatedSuccessResponse(c, articles, total, params.Page, params.Limit)
}

// ListArticlesByCast - รายการบทความตามนักแสดง (Public)
// GET /api/v1/articles/cast/:slug
func (h *ArticleHandler) ListArticlesByCast(c *fiber.Ctx) error {
	ctx := c.UserContext()

	castSlug := c.Params("slug")
	if castSlug == "" {
		return utils.BadRequestResponse(c, "Cast slug is required")
	}

	var params dto.PublicArticleListParams
	if err := c.QueryParser(&params); err != nil {
		logger.WarnContext(ctx, "Invalid query parameters", "error", err)
		return utils.BadRequestResponse(c, "Invalid query parameters")
	}

	articles, total, err := h.articleService.ListArticlesByCast(ctx, castSlug, &params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list articles by cast", "cast_slug", castSlug, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	params.SetDefaults()
	return utils.PaginatedSuccessResponse(c, articles, total, params.Page, params.Limit)
}

// ListArticlesByTag - รายการบทความตาม Tag (Public)
// GET /api/v1/articles/tag/:slug
func (h *ArticleHandler) ListArticlesByTag(c *fiber.Ctx) error {
	ctx := c.UserContext()

	tagSlug := c.Params("slug")
	if tagSlug == "" {
		return utils.BadRequestResponse(c, "Tag slug is required")
	}

	var params dto.PublicArticleListParams
	if err := c.QueryParser(&params); err != nil {
		logger.WarnContext(ctx, "Invalid query parameters", "error", err)
		return utils.BadRequestResponse(c, "Invalid query parameters")
	}

	articles, total, err := h.articleService.ListArticlesByTag(ctx, tagSlug, &params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list articles by tag", "tag_slug", tagSlug, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	params.SetDefaults()
	return utils.PaginatedSuccessResponse(c, articles, total, params.Page, params.Limit)
}

// ListArticlesByMaker - รายการบทความตามค่าย (Public)
// GET /api/v1/articles/maker/:slug
func (h *ArticleHandler) ListArticlesByMaker(c *fiber.Ctx) error {
	ctx := c.UserContext()

	makerSlug := c.Params("slug")
	if makerSlug == "" {
		return utils.BadRequestResponse(c, "Maker slug is required")
	}

	var params dto.PublicArticleListParams
	if err := c.QueryParser(&params); err != nil {
		logger.WarnContext(ctx, "Invalid query parameters", "error", err)
		return utils.BadRequestResponse(c, "Invalid query parameters")
	}

	articles, total, err := h.articleService.ListArticlesByMaker(ctx, makerSlug, &params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list articles by maker", "maker_slug", makerSlug, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	params.SetDefaults()
	return utils.PaginatedSuccessResponse(c, articles, total, params.Page, params.Limit)
}

// ========================================
// Admin Cache Management
// ========================================

// ClearArticleCache - ล้าง cache ของบทความ (Admin)
// DELETE /api/v1/articles/:type/:slug/cache
func (h *ArticleHandler) ClearArticleCache(c *fiber.Ctx) error {
	ctx := c.UserContext()

	articleType := c.Params("type")
	slug := c.Params("slug")

	if articleType == "" {
		return utils.BadRequestResponse(c, "Article type is required")
	}
	if slug == "" {
		return utils.BadRequestResponse(c, "Slug is required")
	}

	if err := h.articleService.ClearArticleCache(ctx, articleType, slug); err != nil {
		if err.Error() == "cache not available" {
			return utils.BadRequestResponse(c, "Cache not available")
		}
		logger.ErrorContext(ctx, "Failed to clear article cache", "type", articleType, "slug", slug, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Article cache cleared", "type", articleType, "slug", slug)
	return utils.SuccessResponse(c, fiber.Map{
		"message": "Cache cleared successfully",
		"type":    articleType,
		"slug":    slug,
	})
}
