package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

func SetupArticleRoutes(api fiber.Router, h *handlers.Handlers) {
	articles := api.Group("/articles")

	// Internal API for worker to ingest articles
	articles.Post("/ingest", h.ArticleHandler.IngestArticle)

	// Public API (must be before :id to avoid conflict)
	articles.Get("/public", h.ArticleHandler.ListPublishedArticles)        // List published articles
	articles.Get("/slug/:slug", h.ArticleHandler.GetPublishedArticle)      // Get single article by slug (deprecated)
	articles.Get("/cast/:slug", h.ArticleHandler.ListArticlesByCast)       // List articles by cast
	articles.Get("/tag/:slug", h.ArticleHandler.ListArticlesByTag)         // List articles by tag
	articles.Get("/maker/:slug", h.ArticleHandler.ListArticlesByMaker)     // List articles by maker

	// Type-based article routes (new URL structure)
	// GET /api/v1/articles/:type/:slug (e.g., /articles/review/dass-541)
	articles.Get("/review/:slug", h.ArticleHandler.GetPublishedArticleByType)   // Review articles
	articles.Get("/ranking/:slug", h.ArticleHandler.GetPublishedArticleByType)  // Ranking articles
	articles.Get("/best-of/:slug", h.ArticleHandler.GetPublishedArticleByType)  // Best-of articles
	articles.Get("/guide/:slug", h.ArticleHandler.GetPublishedArticleByType)    // Guide articles
	articles.Get("/news/:slug", h.ArticleHandler.GetPublishedArticleByType)     // News articles

	// Admin routes
	articles.Get("/", middleware.Protected(), middleware.AdminOnly(), h.ArticleHandler.ListArticles)
	articles.Get("/stats", middleware.Protected(), middleware.AdminOnly(), h.ArticleHandler.GetStats)
	articles.Get("/:id", middleware.Protected(), middleware.AdminOnly(), h.ArticleHandler.GetArticle)
	articles.Patch("/:id/status", middleware.Protected(), middleware.AdminOnly(), h.ArticleHandler.UpdateStatus)
	articles.Post("/bulk-schedule", middleware.Protected(), middleware.AdminOnly(), h.ArticleHandler.BulkSchedule)
	articles.Delete("/:id", middleware.Protected(), middleware.AdminOnly(), h.ArticleHandler.DeleteArticle)
}
