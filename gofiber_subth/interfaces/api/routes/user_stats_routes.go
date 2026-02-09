package routes

import (
	"github.com/gofiber/fiber/v2"

	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

// SetupUserStatsRoutes sets up user stats routes
func SetupUserStatsRoutes(api fiber.Router, h *handlers.Handlers) {
	// My stats (authenticated)
	userStats := api.Group("/user/stats")
	userStats.Get("", middleware.Protected(), h.UserStatsHandler.GetMyStats)
	userStats.Post("/xp", middleware.Protected(), h.UserStatsHandler.AddXP)
	userStats.Post("/regenerate-title", middleware.Protected(), h.UserStatsHandler.RegenerateTitle)
	userStats.Get("/titles", middleware.Protected(), h.UserStatsHandler.GetTitleHistory)
	userStats.Post("/login", middleware.Protected(), h.UserStatsHandler.RecordLogin)

	// Public - ดู stats ของ user อื่น
	api.Get("/users/:id/stats", h.UserStatsHandler.GetUserStats)
}
