package services

import (
	"context"

	"gofiber-template/domain/dto"
)

type StatsService interface {
	// Overall stats
	GetStats(ctx context.Context) (*StatsResponse, error)

	// Top entities
	GetTopMakers(ctx context.Context, limit int) ([]dto.MakerResponse, error)
	GetTopCasts(ctx context.Context, limit int, lang string) ([]dto.CastResponse, error)
	GetTopTags(ctx context.Context, limit int, lang string) ([]dto.TagResponse, error)
}

type StatsResponse struct {
	TotalVideos int64 `json:"total_videos"`
	TotalMakers int64 `json:"total_makers"`
	TotalCasts  int64 `json:"total_casts"`
	TotalTags   int64 `json:"total_tags"`
}
