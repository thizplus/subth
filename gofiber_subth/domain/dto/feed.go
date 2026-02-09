package dto

import (
	"github.com/google/uuid"
)

// === Feed Requests ===

type FeedListRequest struct {
	Page  int    `query:"page" validate:"min=1"`
	Limit int    `query:"limit" validate:"min=1,max=50"`
	Lang  string `query:"lang" validate:"omitempty,oneof=en th ja"`
}

// === Feed Responses ===

// FeedItemResponse สำหรับหน้า Feed (แสดง cover image, title, tags)
type FeedItemResponse struct {
	ID           uuid.UUID  `json:"id"`                    // Reel ID
	VideoID      *uuid.UUID `json:"videoId,omitempty"`     // Video ต้นทาง (ถ้ามี)
	Title        string     `json:"title"`                 // จาก Reel หรือ Video
	Description  string     `json:"description,omitempty"` // คำอธิบาย
	CoverURL     string     `json:"coverUrl"`              // cover.jpg
	Tags         []string   `json:"tags"`                  // จาก Video tags
	LikeCount    int64      `json:"likeCount"`             // จำนวน likes
	CommentCount int64      `json:"commentCount"`          // จำนวน comments
	IsLiked      bool       `json:"isLiked"`               // user liked this? (ลด API call)
	CreatedAt    string     `json:"createdAt"`
}

// ReelItemResponse สำหรับหน้า Reels (แสดง vertical video)
type ReelItemResponse struct {
	ID           uuid.UUID  `json:"id"`                    // Reel ID
	VideoID      *uuid.UUID `json:"videoId,omitempty"`     // Video ต้นทาง (ถ้ามี)
	Title        string     `json:"title"`                 // จาก Reel หรือ Video
	Description  string     `json:"description,omitempty"` // คำอธิบาย
	VideoURL     string     `json:"videoUrl"`              // output.mp4
	ThumbURL     string     `json:"thumbUrl"`              // thumb.jpg
	Tags         []string   `json:"tags"`                  // จาก Video tags
	LikeCount    int64      `json:"likeCount"`             // จำนวน likes
	CommentCount int64      `json:"commentCount"`          // จำนวน comments
	IsLiked      bool       `json:"isLiked"`               // user liked this? (ลด API call)
	CreatedAt    string     `json:"createdAt"`
}
