package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

// SetupReelEngagementRoutes sets up reel engagement routes (likes, comments)
func SetupReelEngagementRoutes(api fiber.Router, h *handlers.Handlers) {
	// Like routes
	api.Post("/reels/:id/like", middleware.Protected(), h.ReelLikeHandler.ToggleLike)
	api.Get("/reels/:id/like", middleware.Optional(), h.ReelLikeHandler.GetLikeStatus)

	// Comment routes
	api.Get("/reels/:id/comments", h.ReelCommentHandler.ListComments) // public
	api.Post("/reels/:id/comments", middleware.Protected(), h.ReelCommentHandler.CreateComment)

	// Comment management routes
	comments := api.Group("/comments")
	comments.Get("/:commentId", h.ReelCommentHandler.GetComment)
	comments.Put("/:commentId", middleware.Protected(), h.ReelCommentHandler.UpdateComment)
	comments.Delete("/:commentId", middleware.Protected(), h.ReelCommentHandler.DeleteComment)
	comments.Get("/:commentId/replies", h.ReelCommentHandler.ListReplies)
}
