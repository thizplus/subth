package dto

import (
	"github.com/google/uuid"
)

// === Reel Requests ===

// CreateReelRequest สำหรับสร้าง reel ใหม่
type CreateReelRequest struct {
	VideoID     *uuid.UUID `json:"videoId"`               // Video ต้นทาง (optional)
	CoverURL    string     `json:"coverUrl" validate:"required,url"`
	VideoURL    string     `json:"videoUrl" validate:"required,url"`
	ThumbURL    string     `json:"thumbUrl" validate:"required,url"`
	Title       string     `json:"title"`       // optional - ค่อยใส่ทีหลังได้
	Description string     `json:"description"` // optional - ค่อยใส่ทีหลังได้
	IsActive    *bool      `json:"isActive"`    // default true
}

// UpdateReelRequest สำหรับอัพเดต reel
type UpdateReelRequest struct {
	VideoID     *uuid.UUID `json:"videoId"`
	CoverURL    string     `json:"coverUrl" validate:"omitempty,url"`
	VideoURL    string     `json:"videoUrl" validate:"omitempty,url"`
	ThumbURL    string     `json:"thumbUrl" validate:"omitempty,url"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	IsActive    *bool      `json:"isActive"`
}

// ReelListRequest สำหรับ list reels
type ReelListRequest struct {
	Page       int  `query:"page" validate:"min=1"`
	Limit      int  `query:"limit" validate:"min=1,max=50"`
	ActiveOnly bool `query:"active_only"`
}

// SyncReelRequest สำหรับ sync reel จาก suekk
// สำคัญ: suekkReelId ต้องเป็น UUID ของ reel (เช่น "1cb78480-2d53-4363-b6c0-aaa224a0ccdd")
// ไม่ใช่ video code (เช่น "6p765bxv")
// หา UUID ได้จาก: GET https://api.suekk.com/api/v1/reels → ใช้ field "id" ไม่ใช่ "video.code"
type SyncReelRequest struct {
	SuekkReelID string     `json:"suekkReelId" validate:"required"` // UUID ของ reel จาก suekk (ไม่ใช่ video code!)
	VideoID     *uuid.UUID `json:"videoId"`                         // Video ID ใน subth (optional)
	Title       string     `json:"title"`                           // Title (optional)
	Description string     `json:"description"`                     // Description (optional)
}

// === Reel Responses ===

// ReelResponse สำหรับ single reel detail
type ReelResponse struct {
	ID          uuid.UUID  `json:"id"`
	VideoID     *uuid.UUID `json:"videoId,omitempty"`
	CoverURL    string     `json:"coverUrl"`
	VideoURL    string     `json:"videoUrl"`
	ThumbURL    string     `json:"thumbUrl"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	IsActive    bool       `json:"isActive"`
	CreatedAt   string     `json:"createdAt"`
	UpdatedAt   string     `json:"updatedAt"`
}
