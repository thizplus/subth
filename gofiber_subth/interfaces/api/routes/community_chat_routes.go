package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

func SetupCommunityChatRoutes(api fiber.Router, h *handlers.CommunityChatHandler) {
	chat := api.Group("/community-chat")

	// Public routes - get messages and online count
	chat.Get("/messages", h.GetMessages)
	chat.Get("/online", h.GetOnlineCount)

	// Protected routes - need authentication
	protected := chat.Group("")
	protected.Use(middleware.Protected())
	protected.Delete("/messages/:id", h.DeleteMessage)

	// Admin routes
	admin := chat.Group("/admin")
	admin.Use(middleware.Protected())
	admin.Use(middleware.AdminOnly())
	admin.Post("/ban", h.BanUser)
	admin.Delete("/ban/:userId", h.UnbanUser)
}

func SetupCommunityChatWebSocket(app *fiber.App, h *handlers.CommunityChatHandler) {
	// WebSocket route with authentication (accepts token from query param)
	app.Use("/ws/chat", middleware.WebSocketAuth(), h.WebSocketUpgrade)
	app.Get("/ws/chat", websocket.New(h.HandleWebSocket))
}
