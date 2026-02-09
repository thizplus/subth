package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
)

func SetupStatsRoutes(api fiber.Router, h *handlers.Handlers) {
	stats := api.Group("/stats")

	// Public routes
	stats.Get("/", h.StatsHandler.GetStats)
	stats.Get("/top-makers", h.StatsHandler.GetTopMakers)
	stats.Get("/top-casts", h.StatsHandler.GetTopCasts)
	stats.Get("/top-tags", h.StatsHandler.GetTopTags)
}
