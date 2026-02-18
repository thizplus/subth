package handlers

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	ws "gofiber-template/infrastructure/websocket"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type CommunityChatHandler struct {
	chatSvc      services.CommunityChatService
	userSvc      services.UserService
	userStatsSvc services.UserStatsService
	hub          *ws.ChatHub
}

func NewCommunityChatHandler(chatSvc services.CommunityChatService, userSvc services.UserService, userStatsSvc services.UserStatsService, hub *ws.ChatHub) *CommunityChatHandler {
	return &CommunityChatHandler{
		chatSvc:      chatSvc,
		userSvc:      userSvc,
		userStatsSvc: userStatsSvc,
		hub:          hub,
	}
}

// WebSocketUpgrade handles WebSocket upgrade
func (h *CommunityChatHandler) WebSocketUpgrade(c *fiber.Ctx) error {
	if websocket.IsWebSocketUpgrade(c) {
		return c.Next()
	}
	return fiber.ErrUpgradeRequired
}

// HandleWebSocket handles WebSocket connections for community chat
func (h *CommunityChatHandler) HandleWebSocket(c *websocket.Conn) {
	// Get user from context (set by auth middleware)
	userContext := c.Locals("user")
	if userContext == nil {
		logger.Warn("WebSocket: No user context")
		c.Close()
		return
	}

	user, ok := userContext.(*utils.UserContext)
	if !ok || user.ID == uuid.Nil {
		logger.Warn("WebSocket: Invalid user context")
		c.Close()
		return
	}

	// Fetch full user info from database
	ctx := context.Background()
	userInfo, err := h.userSvc.GetProfile(ctx, user.ID)
	if err != nil {
		logger.Error("WebSocket: Failed to get user profile", "error", err, "user_id", user.ID)
		c.Close()
		return
	}

	// Get user level from stats service
	level := 1
	stats, err := h.userStatsSvc.GetStats(ctx, user.ID)
	if err == nil && stats != nil {
		level = stats.Level
	}
	levelBadge := dto.GetLevelBadge(level)
	displayName := userInfo.DisplayName

	// Get avatar URL
	avatar := userInfo.GetAvatarURL()

	// Create chat client
	client := &ws.ChatClient{
		ID:     uuid.New().String(),
		UserID: user.ID,
		UserInfo: dto.CommunityChatUserInfo{
			ID:          user.ID.String(),
			Username:    userInfo.Username,
			DisplayName: displayName,
			Level:       level,
			LevelBadge:  levelBadge,
			Avatar:      avatar,
		},
		Conn: c,
		Hub:  h.hub,
		Send: make(chan []byte, 256),
	}

	// Register client
	h.hub.Register(client)

	// Send history to client
	go h.hub.SendHistory(client)

	// Start write pump in goroutine
	go client.WritePump()

	// Read pump (blocking)
	client.ReadPump()
}

// GetMessages returns chat history (REST endpoint)
func (h *CommunityChatHandler) GetMessages(c *fiber.Ctx) error {
	ctx := c.UserContext()

	limit := c.QueryInt("limit", 50)
	beforeIDStr := c.Query("before")

	var beforeID *uuid.UUID
	if beforeIDStr != "" {
		id, err := uuid.Parse(beforeIDStr)
		if err == nil {
			beforeID = &id
		}
	}

	messages, err := h.chatSvc.GetMessages(ctx, limit, beforeID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get chat messages", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, messages)
}

// GetOnlineCount returns the current online count
func (h *CommunityChatHandler) GetOnlineCount(c *fiber.Ctx) error {
	count := h.hub.GetOnlineCount()
	return utils.SuccessResponse(c, map[string]int{"count": count})
}

// DeleteMessage deletes a chat message (admin only)
func (h *CommunityChatHandler) DeleteMessage(c *fiber.Ctx) error {
	ctx := c.UserContext()

	messageID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid message ID")
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Unauthorized")
	}

	isAdmin := user.Role == "admin"

	if err := h.chatSvc.DeleteMessage(ctx, messageID, user.ID, isAdmin); err != nil {
		logger.WarnContext(ctx, "Failed to delete message", "error", err, "message_id", messageID)
		return utils.BadRequestResponse(c, err.Error())
	}

	// Broadcast delete event
	h.hub.Broadcast([]byte(`{"type":"message_deleted","data":{"id":"` + messageID.String() + `"}}`))

	logger.InfoContext(ctx, "Chat message deleted", "message_id", messageID, "deleted_by", user.ID)
	return utils.SuccessResponse(c, map[string]string{"message": "Message deleted"})
}

// BanUser bans a user from chat (admin only)
func (h *CommunityChatHandler) BanUser(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req struct {
		UserID   string `json:"userId" validate:"required"`
		Reason   string `json:"reason" validate:"required"`
		Duration *int   `json:"duration"` // hours, nil = permanent
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		return utils.ValidationErrorResponse(c, utils.GetValidationErrors(err))
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid user ID")
	}

	admin, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Unauthorized")
	}

	if err := h.chatSvc.BanUser(ctx, userID, req.Reason, admin.ID, req.Duration); err != nil {
		logger.ErrorContext(ctx, "Failed to ban user", "error", err, "user_id", userID)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "User banned from chat", "user_id", userID, "banned_by", admin.ID)
	return utils.SuccessResponse(c, map[string]string{"message": "User banned"})
}

// UnbanUser unbans a user from chat (admin only)
func (h *CommunityChatHandler) UnbanUser(c *fiber.Ctx) error {
	ctx := c.UserContext()

	userID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid user ID")
	}

	admin, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Unauthorized")
	}

	if err := h.chatSvc.UnbanUser(ctx, userID); err != nil {
		logger.ErrorContext(ctx, "Failed to unban user", "error", err, "user_id", userID)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "User unbanned from chat", "user_id", userID, "unbanned_by", admin.ID)
	return utils.SuccessResponse(c, map[string]string{"message": "User unbanned"})
}
