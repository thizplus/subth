package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type VideoService interface {
	// CRUD
	CreateVideo(ctx context.Context, req *dto.CreateVideoRequest) (*dto.VideoResponse, error)
	CreateVideoBatch(ctx context.Context, req *dto.BatchCreateVideoRequest) (*dto.BatchCreateVideoResponse, error)
	GetVideo(ctx context.Context, id uuid.UUID, lang string) (*dto.VideoResponse, error)
	UpdateVideo(ctx context.Context, id uuid.UUID, req *dto.UpdateVideoRequest) (*dto.VideoResponse, error)
	DeleteVideo(ctx context.Context, id uuid.UUID) error

	// List
	ListVideos(ctx context.Context, req *dto.VideoListRequest) ([]dto.VideoListItemResponse, int64, error)

	// Random
	GetRandomVideos(ctx context.Context, limit int, lang string) ([]dto.VideoListItemResponse, error)

	// Search
	SearchVideos(ctx context.Context, query string, lang string, page int, limit int) ([]dto.VideoListItemResponse, int64, error)

	// By relations
	GetVideosByMaker(ctx context.Context, makerID uuid.UUID, lang string, page int, limit int) ([]dto.VideoListItemResponse, int64, error)
	GetVideosByCast(ctx context.Context, castID uuid.UUID, lang string, page int, limit int) ([]dto.VideoListItemResponse, int64, error)
	GetVideosByTag(ctx context.Context, tagID uuid.UUID, lang string, page int, limit int) ([]dto.VideoListItemResponse, int64, error)
	GetVideosByAutoTags(ctx context.Context, tags []string, lang string, page int, limit int) ([]dto.VideoListItemResponse, int64, error)

	// Homepage - grouped by categories
	GetVideosByCategories(ctx context.Context, req *dto.VideosByCategoriesRequest) ([]dto.CategoryWithVideosResponse, error)

	// Cleanup - get videos by embed codes
	GetVideosByEmbedCodes(ctx context.Context, codes []string) ([]dto.VideoIDWithCode, error)
	DeleteVideosByEmbedCodes(ctx context.Context, codes []string) (int, error)
}
