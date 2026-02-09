package routes

import (
	"github.com/gofiber/fiber/v2"

	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

// SetupXPRoutes sets up XP-related routes
func SetupXPRoutes(api fiber.Router, h *handlers.Handlers) {
	// Record view - POST /api/v1/reels/:id/view
	api.Post("/reels/:id/view", middleware.Protected(), h.XPHandler.RecordView)

	// XP history - GET /api/v1/users/me/xp-history
	api.Get("/users/me/xp-history", middleware.Protected(), h.XPHandler.GetXPHistory)
}
