package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

func SetupSEOArticleRoutes(api fiber.Router, h *handlers.Handlers) {
	// Admin routes for managing SEO articles
	seoArticles := api.Group("/seo-articles")

	// Internal API for worker to ingest articles (should be protected by API key in production)
	seoArticles.Post("/ingest", h.SEOArticleHandler.IngestArticle)

	// Admin routes
	seoArticles.Get("/", middleware.Protected(), middleware.AdminOnly(), h.SEOArticleHandler.ListArticles)
	seoArticles.Get("/stats", middleware.Protected(), middleware.AdminOnly(), h.SEOArticleHandler.GetStats)
	seoArticles.Get("/:id", middleware.Protected(), middleware.AdminOnly(), h.SEOArticleHandler.GetArticle)
	seoArticles.Patch("/:id/status", middleware.Protected(), middleware.AdminOnly(), h.SEOArticleHandler.UpdateStatus)
	seoArticles.Post("/bulk-schedule", middleware.Protected(), middleware.AdminOnly(), h.SEOArticleHandler.BulkSchedule)
	seoArticles.Delete("/:id", middleware.Protected(), middleware.AdminOnly(), h.SEOArticleHandler.DeleteArticle)

	// Public API for nextjs_subth (published articles only)
	articles := api.Group("/articles")
	articles.Get("/:slug", h.SEOArticleHandler.GetPublishedArticle)
}
