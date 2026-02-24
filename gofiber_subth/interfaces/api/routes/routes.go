package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
)

func SetupRoutes(app *fiber.App, h *handlers.Handlers, communityChatHandler *handlers.CommunityChatHandler) {
	// Setup health and root routes
	SetupHealthRoutes(app)

	// API version group
	api := app.Group("/api/v1")

	// Setup all route groups
	SetupAuthRoutes(api, h)
	SetupUserRoutes(api, h)
	SetupTaskRoutes(api, h)
	SetupFileRoutes(api, h)
	SetupJobRoutes(api, h)

	// Public routes (no auth required)
	SetupFeedRoutes(api, h)

	// Reel management routes
	SetupReelRoutes(api, h)

	// Reel engagement routes (likes, comments)
	SetupReelEngagementRoutes(api, h)

	// SubTH routes
	SetupVideoRoutes(api, h)
	SetupMakerRoutes(api, h)
	SetupCastRoutes(api, h)
	SetupTagRoutes(api, h)
	SetupCategoryRoutes(api, h)
	SetupStatsRoutes(api, h)
	SetupSemanticRoutes(api, h.SemanticHandler)
	SetupChatRoutes(api, h.ChatHandler)

	// User stats & AI title routes
	SetupUserStatsRoutes(api, h)

	// XP system routes
	SetupXPRoutes(api, h)

	// Activity log routes
	SetupActivityLogRoutes(api, h)

	// Contact channel routes
	SetupContactChannelRoutes(api, h)

	// Article routes
	SetupArticleRoutes(api, h)

	// Site setting routes
	SetupSiteSettingRoutes(api, h)

	// Community chat routes
	if communityChatHandler != nil {
		SetupCommunityChatRoutes(api, communityChatHandler)
		SetupCommunityChatWebSocket(app, communityChatHandler)
	}

	// Setup WebSocket routes (needs app, not api group)
	SetupWebSocketRoutes(app)
}