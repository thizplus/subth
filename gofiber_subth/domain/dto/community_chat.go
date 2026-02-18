package dto

import (
	"strings"
	"time"

	"gofiber-template/domain/models"
)

// CommunityChatUserInfo ข้อมูล user ใน chat
type CommunityChatUserInfo struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Level       int    `json:"level"`
	LevelBadge  string `json:"levelBadge"`
	Avatar      string `json:"avatar"`
}

// CommunityChatVideoInfo ข้อมูล video ที่ mention
type CommunityChatVideoInfo struct {
	ID        string `json:"id"`
	Code      string `json:"code"`
	Title     string `json:"title"`
	Thumbnail string `json:"thumbnail"`
}

// CommunityChatMessageResponse response สำหรับข้อความ
type CommunityChatMessageResponse struct {
	ID             string                        `json:"id"`
	User           CommunityChatUserInfo         `json:"user"`
	Content        string                        `json:"content"`
	MentionedVideo *CommunityChatVideoInfo       `json:"mentionedVideo,omitempty"`
	ReplyTo        *CommunityChatMessageResponse `json:"replyTo,omitempty"`
	CreatedAt      time.Time                     `json:"createdAt"`
}

// SendChatMessageRequest request สำหรับส่งข้อความ
type SendChatMessageRequest struct {
	Content string  `json:"content" validate:"required,min=1,max=1000"`
	ReplyTo *string `json:"replyTo"` // message ID
	VideoID *string `json:"videoId"` // mentioned video ID
}

// ChatMessageToResponse แปลง model เป็น response
func ChatMessageToResponse(msg *models.ChatMessage) *CommunityChatMessageResponse {
	if msg == nil {
		return nil
	}

	response := &CommunityChatMessageResponse{
		ID:        msg.ID.String(),
		Content:   msg.Content,
		CreatedAt: msg.CreatedAt,
	}

	// User info
	if msg.User != nil {
		response.User = CommunityChatUserInfo{
			ID:          msg.UserID.String(),
			Username:    msg.User.Username,
			DisplayName: msg.User.DisplayName,
			Avatar:      msg.User.GetAvatarURL(),
		}
		// Level info from stats
		if msg.User.Stats != nil {
			response.User.Level = msg.User.Stats.Level
			response.User.LevelBadge = GetLevelBadge(msg.User.Stats.Level)
		}
	}

	// Mentioned video
	if msg.MentionedVideo != nil {
		title := ""
		code := ""
		if len(msg.MentionedVideo.Translations) > 0 {
			title = msg.MentionedVideo.Translations[0].Title
			// Extract code from title (usually first word like "ABC-123")
			code = extractVideoCode(title)
		}
		response.MentionedVideo = &CommunityChatVideoInfo{
			ID:        msg.MentionedVideo.ID.String(),
			Code:      code,
			Title:     title,
			Thumbnail: msg.MentionedVideo.Thumbnail,
		}
	}

	// Reply to
	if msg.ReplyTo != nil {
		response.ReplyTo = ChatMessageToResponse(msg.ReplyTo)
	}

	return response
}

// extractVideoCode extracts video code from title (e.g., "ABC-123 xxx" -> "ABC-123")
func extractVideoCode(title string) string {
	if title == "" {
		return ""
	}
	// Split by space and return first part
	parts := strings.SplitN(title, " ", 2)
	if len(parts) > 0 {
		return parts[0]
	}
	return ""
}

// ChatMessagesToResponse แปลง slice
func ChatMessagesToResponse(messages []*models.ChatMessage) []*CommunityChatMessageResponse {
	responses := make([]*CommunityChatMessageResponse, len(messages))
	for i, msg := range messages {
		responses[i] = ChatMessageToResponse(msg)
	}
	return responses
}

// WebSocket message types

// WSChatClientMessage ข้อความจาก client
type WSChatClientMessage struct {
	Type    string  `json:"type"` // message, typing, ping
	Content string  `json:"content,omitempty"`
	ReplyTo *string `json:"replyTo,omitempty"`
	VideoID *string `json:"videoId,omitempty"`
}

// WSChatServerMessage ข้อความจาก server
type WSChatServerMessage struct {
	Type string      `json:"type"` // message, online_count, user_join, user_leave, error, history
	Data interface{} `json:"data,omitempty"`
}

// WSChatMessageData ข้อมูลข้อความสำหรับ broadcast
type WSChatMessageData struct {
	ID             string                 `json:"id"`
	User           CommunityChatUserInfo  `json:"user"`
	Content        string                 `json:"content"`
	MentionedVideo *CommunityChatVideoInfo `json:"mentionedVideo,omitempty"`
	ReplyTo        *WSChatMessageData     `json:"replyTo,omitempty"`
	CreatedAt      time.Time              `json:"createdAt"`
}

// WSChatOnlineCount จำนวน user online
type WSChatOnlineCount struct {
	Count int `json:"count"`
}

// WSChatUserEvent user join/leave
type WSChatUserEvent struct {
	User CommunityChatUserInfo `json:"user"`
}

// WSChatError error message
type WSChatError struct {
	Message string `json:"message"`
}

// WSChatHistory ประวัติข้อความ
type WSChatHistory struct {
	Messages []*CommunityChatMessageResponse `json:"messages"`
}
