package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type ArticleCommentService interface {
	Create(ctx context.Context, userID uuid.UUID, req *dto.CreateArticleCommentRequest) (*dto.ArticleCommentResponse, error)
	GetByID(ctx context.Context, id uuid.UUID) (*dto.ArticleCommentResponse, error)
	Update(ctx context.Context, userID, commentID uuid.UUID, req *dto.UpdateArticleCommentRequest) (*dto.ArticleCommentResponse, error)
	Delete(ctx context.Context, userID, commentID uuid.UUID) error
	ListByArticle(ctx context.Context, articleID uuid.UUID, page, limit int) ([]dto.ArticleCommentResponse, int64, error)
	ListReplies(ctx context.Context, parentID uuid.UUID, page, limit int) ([]dto.ArticleCommentResponse, int64, error)
	GetCommentsCount(ctx context.Context, articleID uuid.UUID) (int, error)
}
