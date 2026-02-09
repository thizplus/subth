package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type SemanticService interface {
	// SearchByText - ค้นหาด้วย text query ผ่าน CLIP
	SearchByText(ctx context.Context, req *dto.SemanticSearchRequest) (*dto.SemanticSearchResponse, error)

	// GetSimilarVideos - หาวิดีโอที่คล้ายกันจาก video ID
	GetSimilarVideos(ctx context.Context, videoID uuid.UUID, limit int) (*dto.SemanticSearchResponse, error)

	// HybridSearch - ค้นหาแบบ hybrid (vector + text) สำหรับค้นหาทั้งแนวหนังและชื่อ
	HybridSearch(ctx context.Context, req *dto.HybridSearchRequest) (*dto.HybridSearchResponse, error)
}
