package dto

import (
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

// ===== Article Like DTOs =====

type ArticleLikeResponse struct {
	IsLiked    bool `json:"isLiked"`
	LikesCount int  `json:"likesCount"`
}

// ===== Article Comment DTOs =====

type CreateArticleCommentRequest struct {
	ArticleID uuid.UUID  `json:"articleId" validate:"required"`
	ParentID  *uuid.UUID `json:"parentId"`
	Content   string     `json:"content" validate:"required,min=1,max=1000"`
}

type UpdateArticleCommentRequest struct {
	Content string `json:"content" validate:"required,min=1,max=1000"`
}

type ArticleCommentResponse struct {
	ID        uuid.UUID            `json:"id"`
	ArticleID uuid.UUID            `json:"articleId"`
	ParentID  *uuid.UUID           `json:"parentId,omitempty"`
	Content   string               `json:"content"`
	User      *CommentUserResponse `json:"user"`
	CreatedAt time.Time            `json:"createdAt"`
	UpdatedAt time.Time            `json:"updatedAt"`
}

type CommentUserResponse struct {
	ID          uuid.UUID `json:"id"`
	DisplayName string    `json:"displayName"`
	AvatarSeed  string    `json:"avatarSeed"`
	Level       int       `json:"level,omitempty"`
	Title       string    `json:"title,omitempty"`
}

// ===== Mappers =====

func ToArticleCommentResponse(comment *models.ArticleComment) *ArticleCommentResponse {
	if comment == nil {
		return nil
	}

	resp := &ArticleCommentResponse{
		ID:        comment.ID,
		ArticleID: comment.ArticleID,
		ParentID:  comment.ParentID,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt,
		UpdatedAt: comment.UpdatedAt,
	}

	if comment.User != nil {
		resp.User = &CommentUserResponse{
			ID:          comment.User.ID,
			DisplayName: comment.User.DisplayName,
			AvatarSeed:  comment.User.AvatarSeed,
		}
	}

	return resp
}

func ToArticleCommentResponseList(comments []models.ArticleComment) []ArticleCommentResponse {
	result := make([]ArticleCommentResponse, len(comments))
	for i, c := range comments {
		resp := ToArticleCommentResponse(&c)
		if resp != nil {
			result[i] = *resp
		}
	}
	return result
}
