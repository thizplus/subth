package services

import (
	"context"

	"gofiber-template/domain/dto"
)

type ChatService interface {
	// SemanticChat - Chat with semantic search via RAG service
	SemanticChat(ctx context.Context, req *dto.ChatRequest) (*dto.ChatResponse, error)
}
