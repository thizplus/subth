package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type XPTransactionRepository interface {
	// Create บันทึก XP transaction ใหม่
	Create(ctx context.Context, tx *models.XPTransaction) error

	// GetByID ดึง transaction ตาม ID
	GetByID(ctx context.Context, id uuid.UUID) (*models.XPTransaction, error)

	// ListByUser ดึงรายการ transactions ของ user
	ListByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.XPTransaction, int64, error)

	// HasReceivedXP เช็คว่า user เคยได้รับ XP จาก source + reference หรือยัง
	// ใช้สำหรับ cooldown check (1 ครั้งต่อ reel ตลอดไป)
	HasReceivedXP(ctx context.Context, userID uuid.UUID, source models.XPSource, referenceID uuid.UUID) (bool, error)

	// HasReceivedRegistrationXP เช็คว่า user เคยได้รับ XP สมัครสมาชิกหรือยัง
	HasReceivedRegistrationXP(ctx context.Context, userID uuid.UUID) (bool, error)

	// CountDailyCommentXP นับจำนวน comment XP ที่ได้รับในวันนี้
	CountDailyCommentXP(ctx context.Context, userID uuid.UUID, date time.Time) (int, error)

	// GetTotalXPByUser รวม XP ทั้งหมดของ user (for verification)
	GetTotalXPByUser(ctx context.Context, userID uuid.UUID) (int, error)
}
