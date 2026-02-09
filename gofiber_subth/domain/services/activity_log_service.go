package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
)

type ActivityLogService interface {
	// LogActivity บันทึก activity (push to Redis queue - Fire & Forget)
	LogActivity(ctx context.Context, userID uuid.UUID, req *dto.LogActivityRequest, ipAddress, userAgent string) error

	// GetUserHistory ดึงประวัติ activity ของ user
	GetUserHistory(ctx context.Context, userID uuid.UUID, page, limit int) ([]*dto.ActivityLogResponse, int64, error)

	// GetPageViews ดึง view count ของ page
	GetPageViews(ctx context.Context, pageType string, pageID *uuid.UUID) (int64, error)

	// GetPopularPages ดึง pages ยอดนิยม
	GetPopularPages(ctx context.Context, pageType string, startDate, endDate time.Time, limit int) ([]*dto.PageViewCountResponse, error)

	// GetUserRecentHistory ดึงประวัติล่าสุดของ user (สำหรับ recommendation)
	GetUserRecentHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*models.ActivityLog, error)

	// GetAllActivity ดึง activity logs ทั้งหมด (สำหรับ admin)
	GetAllActivity(ctx context.Context, pageType string, page, limit int) ([]*dto.ActivityLogWithUserResponse, int64, error)
}

type ActivityQueueService interface {
	// Push เพิ่ม item เข้า queue
	Push(ctx context.Context, item *dto.ActivityQueueItem) error

	// Pop ดึง items จาก queue
	Pop(ctx context.Context, count int) ([]*dto.ActivityQueueItem, error)

	// Length จำนวน items ใน queue
	Length(ctx context.Context) (int64, error)
}

type ActivityWorkerService interface {
	// Start เริ่ม background worker
	Start(ctx context.Context)

	// Stop หยุด worker
	Stop()

	// ProcessBatch ประมวลผล batch (สำหรับ manual trigger)
	ProcessBatch(ctx context.Context) (int, error)
}

// PageViewCount สำหรับ analytics
type PageViewCount = repositories.PageViewCount
