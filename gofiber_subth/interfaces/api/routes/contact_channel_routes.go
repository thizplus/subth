package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

func SetupContactChannelRoutes(router fiber.Router, h *handlers.Handlers) {
	channels := router.Group("/contact-channels")

	// Public routes
	channels.Get("/", h.ContactChannelHandler.ListContactChannels)

	// Admin routes (protected) - static paths BEFORE :id
	channels.Get("/admin", middleware.Protected(), middleware.AdminOnly(), h.ContactChannelHandler.ListContactChannelsAdmin)
	channels.Post("/", middleware.Protected(), middleware.AdminOnly(), h.ContactChannelHandler.CreateContactChannel)
	channels.Put("/reorder", middleware.Protected(), middleware.AdminOnly(), h.ContactChannelHandler.ReorderContactChannels)

	// Parameter routes LAST
	channels.Get("/:id", h.ContactChannelHandler.GetContactChannel)
	channels.Put("/:id", middleware.Protected(), middleware.AdminOnly(), h.ContactChannelHandler.UpdateContactChannel)
	channels.Delete("/:id", middleware.Protected(), middleware.AdminOnly(), h.ContactChannelHandler.DeleteContactChannel)
}
