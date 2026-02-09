package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
)

func SetupChatRoutes(router fiber.Router, handler *handlers.ChatHandler) {
	chat := router.Group("/chat")

	// POST /api/v1/chat/semantic - Chat with semantic search
	chat.Post("/semantic", handler.SemanticChat)
}
