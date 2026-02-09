package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

// UserStatsService จัดการ XP, Level และ Title ของ user
type UserStatsService interface {
	// GetOrCreate ดึง stats หรือสร้างใหม่ถ้ายังไม่มี
	GetOrCreate(ctx context.Context, userID uuid.UUID) (*models.UserStats, error)

	// GetStats ดึง stats ของ user
	GetStats(ctx context.Context, userID uuid.UUID) (*models.UserStats, error)

	// AddXP เพิ่ม XP ให้ user และ generate title ใหม่ถ้า level up
	AddXP(ctx context.Context, userID uuid.UUID, xp int, source string) (*models.UserStats, bool, error)

	// RegenerateTitle ขอ generate title ใหม่
	RegenerateTitle(ctx context.Context, userID uuid.UUID) (*models.UserStats, error)

	// GetTitleHistory ดึงประวัติ title ทั้งหมด
	GetTitleHistory(ctx context.Context, userID uuid.UUID) ([]models.TitleHistory, error)

	// RecordLogin บันทึกการ login และเพิ่ม XP
	RecordLogin(ctx context.Context, userID uuid.UUID) (*models.UserStats, error)
}
