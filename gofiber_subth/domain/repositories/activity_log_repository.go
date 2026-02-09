package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type ActivityLogRepository interface {
	// Create สร้าง activity log ใหม่
	Create(ctx context.Context, log *models.ActivityLog) error

	// BatchCreate สร้างหลาย activity logs (สำหรับ batch insert จาก queue)
	BatchCreate(ctx context.Context, logs []*models.ActivityLog) error

	// GetByUser ดึง activity logs ของ user (paginated)
	GetByUser(ctx context.Context, userID uuid.UUID, page, limit int) ([]*models.ActivityLog, int64, error)

	// GetByPage ดึง activity logs ของ page ใดๆ (paginated)
	GetByPage(ctx context.Context, pageType string, pageID *uuid.UUID, page, limit int) ([]*models.ActivityLog, int64, error)

	// CountByPage นับจำนวน views ของ page
	CountByPage(ctx context.Context, pageType string, pageID *uuid.UUID) (int64, error)

	// CountByUser นับจำนวน activities ของ user
	CountByUser(ctx context.Context, userID uuid.UUID) (int64, error)

	// GetUserRecentHistory ดึงประวัติล่าสุดของ user (สำหรับ recommendation)
	GetUserRecentHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*models.ActivityLog, error)

	// GetPopularPages ดึง pages ยอดนิยมในช่วงเวลา
	GetPopularPages(ctx context.Context, pageType string, startDate, endDate time.Time, limit int) ([]PageViewCount, error)

	// DeleteOldLogs ลบ logs เก่ากว่า retentionDays วัน
	DeleteOldLogs(ctx context.Context, retentionDays int) (int64, error)

	// GetAll ดึง activity logs ทั้งหมด (สำหรับ admin)
	GetAll(ctx context.Context, pageType string, page, limit int) ([]*models.ActivityLog, int64, error)
}

// PageViewCount สำหรับ analytics
type PageViewCount struct {
	PageID    uuid.UUID `json:"pageId"`
	PageType  string    `json:"pageType"`
	ViewCount int64     `json:"viewCount"`
}
