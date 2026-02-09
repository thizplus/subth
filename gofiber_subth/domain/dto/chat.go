package dto

// ChatRequest - request for semantic chat
type ChatRequest struct {
	Message string `json:"message" validate:"required,min=1,max=500"`
	Limit   int    `json:"limit,omitempty"`
	Cursor  string `json:"cursor,omitempty"`
}

// ChatVideoResult - video result from chat
type ChatVideoResult struct {
	ID         string  `json:"id"`
	Code       string  `json:"code"`
	Title      string  `json:"title,omitempty"`
	Thumbnail  string  `json:"thumbnail,omitempty"`
	Similarity float64 `json:"similarity"`
}

// ChatData - chat response data
type ChatData struct {
	Message    string            `json:"message"`
	Videos     []ChatVideoResult `json:"videos"`
	Keywords   []string          `json:"keywords"`
	NextCursor string            `json:"nextCursor,omitempty"`
}

// ChatResponse - response from semantic chat
type ChatResponse struct {
	Message    string            `json:"message"`
	Videos     []ChatVideoResult `json:"videos"`
	Keywords   []string          `json:"keywords"`
	NextCursor string            `json:"nextCursor,omitempty"`
}

// RAGChatRequest - request to Python RAG service
type RAGChatRequest struct {
	Message string `json:"message"`
	Limit   int    `json:"limit"`
	Cursor  string `json:"cursor,omitempty"`
}

// RAGChatResponse - response from Python RAG service
type RAGChatResponse struct {
	Success bool      `json:"success"`
	Data    *ChatData `json:"data,omitempty"`
	Error   string    `json:"error,omitempty"`
}
