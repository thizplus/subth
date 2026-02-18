package websocket

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

// ChatClient represents a WebSocket client
type ChatClient struct {
	ID       string
	UserID   uuid.UUID
	UserInfo dto.CommunityChatUserInfo
	Conn     *websocket.Conn
	Hub      *ChatHub
	Send     chan []byte
}

// ChatHub manages WebSocket connections
type ChatHub struct {
	clients    map[string]*ChatClient
	broadcast  chan []byte
	register   chan *ChatClient
	unregister chan *ChatClient
	mu         sync.RWMutex
	chatSvc    services.CommunityChatService
}

// NewChatHub creates a new chat hub
func NewChatHub(chatSvc services.CommunityChatService) *ChatHub {
	return &ChatHub{
		clients:    make(map[string]*ChatClient),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *ChatClient),
		unregister: make(chan *ChatClient),
		chatSvc:    chatSvc,
	}
}

// Run starts the hub
func (h *ChatHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			h.mu.Unlock()

			// Broadcast user join
			h.broadcastUserJoin(client)
			// Send online count
			h.broadcastOnlineCount()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.Send)
			}
			h.mu.Unlock()

			// Broadcast user leave
			h.broadcastUserLeave(client)
			// Send online count
			h.broadcastOnlineCount()

		case message := <-h.broadcast:
			h.mu.RLock()
			for _, client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client.ID)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Register adds a client to the hub
func (h *ChatHub) Register(client *ChatClient) {
	h.register <- client
}

// Unregister removes a client from the hub
func (h *ChatHub) Unregister(client *ChatClient) {
	h.unregister <- client
}

// Broadcast sends a message to all clients
func (h *ChatHub) Broadcast(msg []byte) {
	h.broadcast <- msg
}

// GetOnlineCount returns the number of online users
func (h *ChatHub) GetOnlineCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// BroadcastMessage broadcasts a chat message
func (h *ChatHub) BroadcastMessage(msg *dto.CommunityChatMessageResponse) {
	data := dto.WSChatServerMessage{
		Type: "message",
		Data: msg,
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		logger.Error("Failed to marshal message", "error", err)
		return
	}
	h.Broadcast(jsonData)
}

func (h *ChatHub) broadcastUserJoin(client *ChatClient) {
	data := dto.WSChatServerMessage{
		Type: "user_join",
		Data: dto.WSChatUserEvent{User: client.UserInfo},
	}
	jsonData, _ := json.Marshal(data)
	h.Broadcast(jsonData)
}

func (h *ChatHub) broadcastUserLeave(client *ChatClient) {
	data := dto.WSChatServerMessage{
		Type: "user_leave",
		Data: map[string]string{"userId": client.UserID.String()},
	}
	jsonData, _ := json.Marshal(data)
	h.Broadcast(jsonData)
}

func (h *ChatHub) broadcastOnlineCount() {
	data := dto.WSChatServerMessage{
		Type: "online_count",
		Data: dto.WSChatOnlineCount{Count: h.GetOnlineCount()},
	}
	jsonData, _ := json.Marshal(data)
	h.Broadcast(jsonData)
}

// SendHistory sends chat history to a client
func (h *ChatHub) SendHistory(client *ChatClient) {
	ctx := context.Background()
	messages, err := h.chatSvc.GetMessages(ctx, 50, nil)
	if err != nil {
		logger.Error("Failed to get chat history", "error", err)
		return
	}

	data := dto.WSChatServerMessage{
		Type: "history",
		Data: dto.WSChatHistory{Messages: messages},
	}
	jsonData, _ := json.Marshal(data)
	client.Send <- jsonData

	// Also send current online count
	onlineData := dto.WSChatServerMessage{
		Type: "online_count",
		Data: dto.WSChatOnlineCount{Count: h.GetOnlineCount()},
	}
	onlineJson, _ := json.Marshal(onlineData)
	client.Send <- onlineJson
}

// HandleMessage processes incoming messages from a client
func (h *ChatHub) HandleMessage(client *ChatClient, msgType int, data []byte) {
	var clientMsg dto.WSChatClientMessage
	if err := json.Unmarshal(data, &clientMsg); err != nil {
		logger.Warn("Invalid message format", "error", err)
		return
	}

	switch clientMsg.Type {
	case "message":
		h.handleChatMessage(client, &clientMsg)
	case "ping":
		// Respond with pong
		pong := dto.WSChatServerMessage{Type: "pong"}
		jsonData, _ := json.Marshal(pong)
		client.Send <- jsonData
	case "typing":
		// Broadcast typing indicator (optional)
	}
}

func (h *ChatHub) handleChatMessage(client *ChatClient, msg *dto.WSChatClientMessage) {
	if msg.Content == "" {
		return
	}

	ctx := context.Background()
	req := &dto.SendChatMessageRequest{
		Content: msg.Content,
		ReplyTo: msg.ReplyTo,
		VideoID: msg.VideoID,
	}

	response, err := h.chatSvc.SendMessage(ctx, client.UserID, req)
	if err != nil {
		// Send error to client
		errMsg := dto.WSChatServerMessage{
			Type: "error",
			Data: dto.WSChatError{Message: err.Error()},
		}
		jsonData, _ := json.Marshal(errMsg)
		client.Send <- jsonData
		return
	}

	// Broadcast the message to all clients
	h.BroadcastMessage(response)
}

// WritePump pumps messages from the hub to the WebSocket connection
func (c *ChatClient) WritePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ReadPump pumps messages from the WebSocket connection to the hub
func (c *ChatClient) ReadPump() {
	defer func() {
		c.Hub.Unregister(c)
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(4096)

	for {
		msgType, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.Warn("WebSocket error", "error", err)
			}
			break
		}
		c.Hub.HandleMessage(c, msgType, message)
	}
}
