package dto

import (
	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

// CreateCommentRequest - Request to create a comment
type CreateCommentRequest struct {
	ReelID   uuid.UUID  `json:"reelId" validate:"required"`
	ParentID *uuid.UUID `json:"parentId"` // nullable for top-level comment
	Content  string     `json:"content" validate:"required,min=1,max=1000"`
}

// UpdateCommentRequest - Request to update a comment
type UpdateCommentRequest struct {
	Content string `json:"content" validate:"required,min=1,max=1000"`
}

// CommentListRequest - Request for listing comments
type CommentListRequest struct {
	Page  int `query:"page" validate:"min=1"`
	Limit int `query:"limit" validate:"min=1,max=50"`
}

// CommentResponse - Single comment response
type CommentResponse struct {
	ID           uuid.UUID  `json:"id"`
	UserID       uuid.UUID  `json:"userId"`
	ReelID       uuid.UUID  `json:"reelId"`
	ParentID     *uuid.UUID `json:"parentId,omitempty"`
	Content      string     `json:"content"`
	CreatedAt    string     `json:"createdAt"`
	UpdatedAt    string     `json:"updatedAt"`
	User         *UserBrief `json:"user,omitempty"`
	RepliesCount int64      `json:"repliesCount,omitempty"`
}

// UserBrief - Brief user info for comments (ไม่แสดงข้อมูลส่วนตัว)
type UserBrief struct {
	ID          uuid.UUID `json:"id"`
	Username    string    `json:"username"`
	DisplayName string    `json:"displayName"`
	Avatar      string    `json:"avatar"`
	Level       int       `json:"level"`
	LevelBadge  string    `json:"levelBadge"`
}

// ToCommentResponse converts model to response
func ToCommentResponse(comment *models.ReelComment) *CommentResponse {
	resp := &CommentResponse{
		ID:        comment.ID,
		UserID:    comment.UserID,
		ReelID:    comment.ReelID,
		ParentID:  comment.ParentID,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
		UpdatedAt: comment.UpdatedAt.UTC().Format("2006-01-02T15:04:05Z"),
	}

	if comment.User != nil {
		level := 1
		levelBadge := "⭐"
		if comment.User.Stats != nil {
			level = comment.User.Stats.Level
			levelBadge = GetLevelBadge(level)
		}
		resp.User = &UserBrief{
			ID:          comment.User.ID,
			Username:    comment.User.Username,
			DisplayName: comment.User.DisplayName,
			Avatar:      comment.User.GetAvatarURL(),
			Level:       level,
			LevelBadge:  levelBadge,
		}
	}

	return resp
}

// ToCommentResponseList converts model list to response list
func ToCommentResponseList(comments []models.ReelComment) []CommentResponse {
	result := make([]CommentResponse, len(comments))
	for i, c := range comments {
		result[i] = *ToCommentResponse(&c)
	}
	return result
}
