package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type VideoViewRepository interface {
	// Create สร้าง view record ใหม่
	Create(ctx context.Context, view *models.VideoView) error

	// Update อัพเดท view record (เช่น watch duration/percent)
	Update(ctx context.Context, view *models.VideoView) error

	// GetByUserAndReel ดึง view record ของ user + reel
	GetByUserAndReel(ctx context.Context, userID, reelID uuid.UUID) (*models.VideoView, error)

	// HasUserViewedReel เช็คว่า user เคยดู reel นี้แล้วหรือยัง (และได้ XP แล้ว)
	HasUserViewedReel(ctx context.Context, userID, reelID uuid.UUID) (bool, error)

	// MarkXPAwarded อัพเดท xp_awarded = true
	MarkXPAwarded(ctx context.Context, id uuid.UUID) error

	// CountByReel นับจำนวน views ของ reel
	CountByReel(ctx context.Context, reelID uuid.UUID) (int64, error)

	// CountByUser นับจำนวน views ของ user
	CountByUser(ctx context.Context, userID uuid.UUID) (int64, error)
}
