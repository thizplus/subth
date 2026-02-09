package routes

import (
	"github.com/gofiber/fiber/v2"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/interfaces/api/middleware"
)

// SetupActivityLogRoutes sets up activity log routes
func SetupActivityLogRoutes(api fiber.Router, h *handlers.Handlers) {
	activity := api.Group("/activity")

	// Protected routes - ต้อง login
	// POST /api/v1/activity/log - บันทึก activity
	activity.Post("/log", middleware.Protected(), h.ActivityLogHandler.LogActivity)

	// GET /api/v1/activity/me - ดูประวัติตัวเอง
	activity.Get("/me", middleware.Protected(), h.ActivityLogHandler.GetMyHistory)

	// Admin routes
	// GET /api/v1/activity/all - ดู activity ทั้งหมด (admin only)
	activity.Get("/all", middleware.Protected(), middleware.AdminOnly(), h.ActivityLogHandler.GetAllActivity)

	// GET /api/v1/activity/popular - ดู pages ยอดนิยม (admin only)
	activity.Get("/popular", middleware.Protected(), middleware.AdminOnly(), h.ActivityLogHandler.GetPopularPages)

	// GET /api/v1/activity/summary - ดูสรุป activity (admin only)
	activity.Get("/summary", middleware.Protected(), middleware.AdminOnly(), h.ActivityLogHandler.GetActivitySummary)

	// Public routes
	// GET /api/v1/activity/views - ดู view count (public สำหรับ analytics)
	activity.Get("/views", h.ActivityLogHandler.GetPageViews)
}
