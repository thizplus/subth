package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

// TitleGenerationService สำหรับ generate ฉายาจาก Gemini AI
type TitleGenerationService interface {
	// GenerateTitle สร้างฉายาใหม่สำหรับ user
	GenerateTitle(ctx context.Context, userID uuid.UUID) (string, error)

	// GenerateTitleForLevel สร้างฉายาตาม level ที่กำหนด
	GenerateTitleForLevel(ctx context.Context, level int, stats *models.UserStats) (string, error)
}
