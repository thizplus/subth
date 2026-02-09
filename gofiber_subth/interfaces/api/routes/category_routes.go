package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

func SetupCategoryRoutes(router fiber.Router, h *handlers.Handlers) {
	categories := router.Group("/categories")

	// Public routes
	categories.Get("/", h.CategoryHandler.ListCategories)
	categories.Get("/:id", h.CategoryHandler.GetCategory)

	// Admin routes (protected)
	categories.Post("/", middleware.Protected(), middleware.AdminOnly(), h.CategoryHandler.CreateCategory)
	categories.Put("/:id", middleware.Protected(), middleware.AdminOnly(), h.CategoryHandler.UpdateCategory)
	categories.Delete("/:id", middleware.Protected(), middleware.AdminOnly(), h.CategoryHandler.DeleteCategory)
}
