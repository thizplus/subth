package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

// SetupFeedRoutes sets up public feed and reels routes
// These routes do not require authentication but use Optional() to get user context if available
func SetupFeedRoutes(api fiber.Router, h *handlers.Handlers) {
	// Public endpoints with optional auth (to get isLiked status)
	api.Get("/feed", middleware.Optional(), h.FeedHandler.GetFeed)
	api.Get("/reels", middleware.Optional(), h.FeedHandler.GetReels)
}
