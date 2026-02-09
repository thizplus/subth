package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

func SetupMakerRoutes(api fiber.Router, h *handlers.Handlers) {
	makers := api.Group("/makers")

	// Public routes
	makers.Get("/", h.MakerHandler.ListMakers)
	makers.Get("/search", h.MakerHandler.SearchMakers)
	makers.Get("/top", h.MakerHandler.GetTopMakers)
	makers.Get("/slug/:slug", h.MakerHandler.GetMakerBySlug)
	makers.Get("/:id", h.MakerHandler.GetMaker)

	// Admin routes (protected)
	makers.Post("/", middleware.Protected(), middleware.AdminOnly(), h.MakerHandler.CreateMaker)
	makers.Put("/:id", middleware.Protected(), middleware.AdminOnly(), h.MakerHandler.UpdateMaker)
	makers.Delete("/:id", middleware.Protected(), middleware.AdminOnly(), h.MakerHandler.DeleteMaker)
}
