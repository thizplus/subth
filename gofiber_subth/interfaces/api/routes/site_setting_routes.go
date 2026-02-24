package routes

import (
	"github.com/gofiber/fiber/v2"

	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

func SetupSiteSettingRoutes(api fiber.Router, h *handlers.Handlers) {
	settings := api.Group("/settings")

	// Public: Get settings (for frontend to fetch GTM ID)
	settings.Get("", h.SiteSettingHandler.Get)

	// Admin only: Update settings
	settings.Put("", middleware.Protected(), middleware.AdminOnly(), h.SiteSettingHandler.Update)
}
