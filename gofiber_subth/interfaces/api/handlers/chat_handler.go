package handlers

import (
	"github.com/gofiber/fiber/v2"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type ChatHandler struct {
	chatService services.ChatService
}

func NewChatHandler(chatService services.ChatService) *ChatHandler {
	return &ChatHandler{
		chatService: chatService,
	}
}

// SemanticChat godoc
// @Summary      Semantic chat with video search
// @Description  Chat with RAG - extracts keywords, searches videos, generates response
// @Tags         chat
// @Accept       json
// @Produce      json
// @Param        request body dto.ChatRequest true "Chat request"
// @Success      200  {object}  utils.Response{data=dto.ChatResponse}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /chat/semantic [post]
func (h *ChatHandler) SemanticChat(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.ChatRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Message == "" {
		return utils.BadRequestResponse(c, "Message is required")
	}

	if len(req.Message) > 500 {
		return utils.BadRequestResponse(c, "Message too long (max 500 characters)")
	}

	// Set default limit
	if req.Limit <= 0 {
		req.Limit = 24
	}
	if req.Limit > 50 {
		req.Limit = 50
	}

	logger.InfoContext(ctx, "Semantic chat request",
		"message", req.Message,
		"limit", req.Limit,
	)

	result, err := h.chatService.SemanticChat(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Semantic chat failed", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, result)
}
