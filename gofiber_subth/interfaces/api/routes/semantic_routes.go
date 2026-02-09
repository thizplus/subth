package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
)

func SetupSemanticRoutes(router fiber.Router, handler *handlers.SemanticHandler) {
	semantic := router.Group("/semantic")

	// GET /api/v1/semantic/search?q=xxx - ค้นหาด้วย text
	semantic.Get("/search", handler.SearchByTextGET)

	// POST /api/v1/semantic/search - ค้นหาด้วย text (body)
	semantic.Post("/search", handler.SearchByText)

	// GET /api/v1/semantic/similar/:id - หาวิดีโอที่คล้ายกัน
	semantic.Get("/similar/:id", handler.GetSimilarVideos)

	// POST /api/v1/semantic/hybrid - Hybrid search (vector + text)
	semantic.Post("/hybrid", handler.HybridSearch)
}
