package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

func SetupVideoRoutes(api fiber.Router, h *handlers.Handlers) {
	videos := api.Group("/videos")

	// Public routes
	videos.Get("/", h.VideoHandler.ListVideos)
	videos.Get("/random", h.VideoHandler.GetRandomVideos)
	videos.Get("/search", h.VideoHandler.SearchVideos)
	videos.Get("/auto-tags", h.VideoHandler.GetVideosByAutoTags)
	videos.Get("/by-categories", h.VideoHandler.GetVideosByCategories) // Homepage - videos grouped by categories
	videos.Get("/maker/:maker_id", h.VideoHandler.GetVideosByMaker)
	videos.Get("/cast/:cast_id", h.VideoHandler.GetVideosByCast)
	videos.Get("/tag/:tag_id", h.VideoHandler.GetVideosByTag)
	videos.Get("/:id", h.VideoHandler.GetVideo)

	// Admin routes (protected)
	videos.Post("/", middleware.Protected(), h.VideoHandler.CreateVideo)
	// Batch create (for scraper upload)
	videos.Post("/batch", middleware.Protected(), h.VideoHandler.CreateVideoBatch)
	videos.Put("/:id", middleware.Protected(), h.VideoHandler.UpdateVideo)
	videos.Delete("/:id", middleware.Protected(), h.VideoHandler.DeleteVideo)

	// Cleanup routes (for deleting videos by embed codes)
	videos.Post("/find-by-codes", middleware.Protected(), h.VideoHandler.GetVideosByEmbedCodes)
	videos.Post("/delete-by-codes", middleware.Protected(), h.VideoHandler.DeleteVideosByEmbedCodes)

	// Internal routes (from worker) - ใช้ api token authentication
	internal := api.Group("/internal/videos")
	internal.Patch("/:id/gallery", middleware.Protected(), h.VideoHandler.UpdateVideoGallery)
}
