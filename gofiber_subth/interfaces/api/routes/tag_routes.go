package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

func SetupTagRoutes(api fiber.Router, h *handlers.Handlers) {
	tags := api.Group("/tags")

	// Public routes
	tags.Get("/", h.TagHandler.ListTags)
	tags.Get("/search", h.TagHandler.SearchTags)
	tags.Get("/top", h.TagHandler.GetTopTags)
	tags.Get("/auto", h.TagHandler.ListAutoTags)
	tags.Get("/auto/by-keys", h.TagHandler.GetAutoTagsByKeys)
	tags.Get("/slug/:slug", h.TagHandler.GetTagBySlug)
	tags.Get("/:id", h.TagHandler.GetTag)

	// Admin routes (protected)
	tags.Post("/", middleware.Protected(), middleware.AdminOnly(), h.TagHandler.CreateTag)
	tags.Put("/:id", middleware.Protected(), middleware.AdminOnly(), h.TagHandler.UpdateTag)
	tags.Delete("/:id", middleware.Protected(), middleware.AdminOnly(), h.TagHandler.DeleteTag)
}
