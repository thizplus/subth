package serviceimpl

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/config"
	"gofiber-template/pkg/logger"
)

type chatServiceImpl struct {
	ragURL     string
	httpClient *http.Client
}

func NewChatService(cfg *config.Config) services.ChatService {
	return &chatServiceImpl{
		ragURL: cfg.RAG.ServiceURL,
		httpClient: &http.Client{
			Timeout: 60 * time.Second, // LLM อาจใช้เวลานาน
		},
	}
}

func (s *chatServiceImpl) SemanticChat(ctx context.Context, req *dto.ChatRequest) (*dto.ChatResponse, error) {
	// Set defaults
	limit := req.Limit
	if limit <= 0 {
		limit = 24
	}
	if limit > 50 {
		limit = 50
	}

	// Prepare request to Python RAG service
	ragReq := dto.RAGChatRequest{
		Message: req.Message,
		Limit:   limit,
		Cursor:  req.Cursor,
	}

	body, err := json.Marshal(ragReq)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to marshal RAG request", "error", err)
		return nil, fmt.Errorf("failed to prepare chat request")
	}

	// Call Python RAG service
	url := fmt.Sprintf("%s/api/v1/chat/semantic", s.ragURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		logger.ErrorContext(ctx, "Failed to create HTTP request", "error", err)
		return nil, fmt.Errorf("failed to create chat request")
	}
	httpReq.Header.Set("Content-Type", "application/json")

	logger.InfoContext(ctx, "Calling RAG service",
		"url", url,
		"message", req.Message,
		"limit", limit,
	)

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to call RAG service", "error", err, "url", url)
		return nil, fmt.Errorf("chat service unavailable")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		logger.ErrorContext(ctx, "RAG service returned error",
			"status", resp.StatusCode,
			"body", string(bodyBytes),
		)
		return nil, fmt.Errorf("chat failed: status %d", resp.StatusCode)
	}

	// Parse response
	var ragResp dto.RAGChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&ragResp); err != nil {
		logger.ErrorContext(ctx, "Failed to decode RAG response", "error", err)
		return nil, fmt.Errorf("failed to parse chat results")
	}

	if !ragResp.Success {
		logger.WarnContext(ctx, "RAG chat returned failure", "error", ragResp.Error)
		return nil, fmt.Errorf("chat failed: %s", ragResp.Error)
	}

	if ragResp.Data == nil {
		logger.WarnContext(ctx, "RAG chat returned empty data")
		return nil, fmt.Errorf("no response from chat service")
	}

	// Convert to response
	result := &dto.ChatResponse{
		Message:    ragResp.Data.Message,
		Videos:     ragResp.Data.Videos,
		Keywords:   ragResp.Data.Keywords,
		NextCursor: ragResp.Data.NextCursor,
	}

	logger.InfoContext(ctx, "Semantic chat completed",
		"message", req.Message,
		"keywords", ragResp.Data.Keywords,
		"video_count", len(ragResp.Data.Videos),
		"next_cursor", ragResp.Data.NextCursor,
	)

	return result, nil
}
