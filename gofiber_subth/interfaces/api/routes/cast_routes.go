package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

func SetupCastRoutes(api fiber.Router, h *handlers.Handlers) {
	casts := api.Group("/casts")

	// Public routes
	casts.Get("/", h.CastHandler.ListCasts)
	casts.Get("/search", h.CastHandler.SearchCasts)
	casts.Get("/top", h.CastHandler.GetTopCasts)
	casts.Get("/slug/:slug", h.CastHandler.GetCastBySlug)
	casts.Get("/:id", h.CastHandler.GetCast)

	// Admin routes (protected)
	casts.Post("/", middleware.Protected(), middleware.AdminOnly(), h.CastHandler.CreateCast)
	casts.Put("/:id", middleware.Protected(), middleware.AdminOnly(), h.CastHandler.UpdateCast)
	casts.Delete("/:id", middleware.Protected(), middleware.AdminOnly(), h.CastHandler.DeleteCast)
}
