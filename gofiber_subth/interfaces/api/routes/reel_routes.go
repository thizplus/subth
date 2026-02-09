package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
)

// SetupReelRoutes sets up reel management routes (admin)
func SetupReelRoutes(api fiber.Router, h *handlers.Handlers) {
	reels := api.Group("/reels/manage")

	// CRUD operations
	reels.Post("/", h.ReelHandler.CreateReel)
	reels.Get("/", h.ReelHandler.ListReels)
	reels.Get("/:id", h.ReelHandler.GetReel)
	reels.Put("/:id", h.ReelHandler.UpdateReel)
	reels.Delete("/:id", h.ReelHandler.DeleteReel)

	// Sync from suekk CDN to R2
	api.Post("/reels/sync", h.ReelHandler.SyncReel)
}
