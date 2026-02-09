package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
)

// XPService จัดการการให้ XP สำหรับกิจกรรมต่างๆ
type XPService interface {
	// AwardRegistrationXP ให้ XP สำหรับการสมัครสมาชิก (1 ครั้งตลอดไป)
	AwardRegistrationXP(ctx context.Context, userID uuid.UUID) (*dto.AwardXPResult, error)

	// AwardViewXP ให้ XP สำหรับการดู video (1 ครั้งต่อ reel ตลอดไป)
	AwardViewXP(ctx context.Context, userID, reelID uuid.UUID, duration int, percent float64) (*dto.AwardXPResult, error)

	// AwardLikeXP ให้ XP สำหรับการกด like (1 ครั้งต่อ reel ตลอดไป)
	AwardLikeXP(ctx context.Context, userID, reelID uuid.UUID) (*dto.AwardXPResult, error)

	// AwardCommentXP ให้ XP สำหรับการ comment (สูงสุด 10 ครั้งต่อวัน)
	AwardCommentXP(ctx context.Context, userID, reelID uuid.UUID, commentID uuid.UUID) (*dto.AwardXPResult, error)

	// GetXPHistory ดึงประวัติ XP ของ user
	GetXPHistory(ctx context.Context, userID uuid.UUID, page, limit int) ([]models.XPTransaction, int64, error)

	// RecordView บันทึกการดู video และให้ XP ถ้าถึงเงื่อนไข
	RecordView(ctx context.Context, userID, reelID uuid.UUID, duration int, percent float64) (*dto.RecordViewResponse, error)
}
