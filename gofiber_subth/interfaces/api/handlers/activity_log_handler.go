package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type ActivityLogHandler struct {
	service services.ActivityLogService
}

func NewActivityLogHandler(service services.ActivityLogService) *ActivityLogHandler {
	return &ActivityLogHandler{service: service}
}

// LogActivity บันทึก activity (POST /api/v1/activity/log)
// @Summary Log user activity
// @Description บันทึกการเข้าถึงหน้าต่างๆ (Fire & Forget - ตอบกลับทันที)
// @Tags Activity
// @Accept json
// @Produce json
// @Param request body dto.LogActivityRequest true "Activity data"
// @Success 200 {object} dto.LogActivityResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /activity/log [post]
func (h *ActivityLogHandler) LogActivity(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Get user from auth middleware
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Unauthorized")
	}
	userID := user.ID

	// Parse request
	var req dto.LogActivityRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	// Validate
	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	// Get client info
	ipAddress := c.IP()
	userAgent := c.Get("User-Agent")

	// Log activity (Fire & Forget - push to Redis queue)
	go func() {
		if err := h.service.LogActivity(ctx, userID, &req, ipAddress, userAgent); err != nil {
			logger.WarnContext(ctx, "Failed to queue activity log", "error", err)
		}
	}()

	// ตอบกลับทันที (< 10ms)
	return utils.SuccessResponse(c, dto.LogActivityResponse{Success: true})
}

// GetMyHistory ดูประวัติตัวเอง (GET /api/v1/activity/me)
// @Summary Get my activity history
// @Description ดึงประวัติ activity ของตัวเอง (paginated)
// @Tags Activity
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /activity/me [get]
func (h *ActivityLogHandler) GetMyHistory(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Get user from auth middleware
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Unauthorized")
	}
	userID := user.ID

	// Parse pagination
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Get history
	logs, total, err := h.service.GetUserHistory(ctx, userID, page, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get activity history", "error", err, "user_id", userID)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, logs, total, page, limit)
}

// GetPageViews ดู view count ของ page (GET /api/v1/activity/views)
// @Summary Get page view count
// @Description ดึงจำนวน views ของ page
// @Tags Activity
// @Produce json
// @Param pageType query string true "Page type (video, cast, tag, etc.)"
// @Param pageId query string false "Page ID (UUID)"
// @Success 200 {object} utils.Response
// @Router /activity/views [get]
func (h *ActivityLogHandler) GetPageViews(c *fiber.Ctx) error {
	ctx := c.UserContext()

	pageType := c.Query("pageType")
	pageIDStr := c.Query("pageId")

	if pageType == "" {
		return utils.BadRequestResponse(c, "pageType is required")
	}

	var pageID *uuid.UUID
	if pageIDStr != "" {
		id, err := uuid.Parse(pageIDStr)
		if err != nil {
			return utils.BadRequestResponse(c, "Invalid pageId")
		}
		pageID = &id
	}

	count, err := h.service.GetPageViews(ctx, pageType, pageID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get page views", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, fiber.Map{
		"pageType":  pageType,
		"pageId":    pageIDStr,
		"viewCount": count,
	})
}

// GetAllActivity ดู activity ทั้งหมด (GET /api/v1/activity/all) - Admin only
// @Summary Get all activity logs
// @Description ดึง activity logs ทั้งหมด (admin only, paginated)
// @Tags Activity
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param pageType query string false "Filter by page type"
// @Success 200 {object} utils.PaginatedResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /activity/all [get]
func (h *ActivityLogHandler) GetAllActivity(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Parse pagination
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	pageType := c.Query("pageType")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Get all activity logs
	logs, total, err := h.service.GetAllActivity(ctx, pageType, page, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get all activity logs", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, logs, total, page, limit)
}

// GetUserActivity ดู activity ของ user เฉพาะคน (GET /api/v1/users/:id/activity) - Admin only
// @Summary Get user activity logs
// @Description ดึง activity logs ของ user เฉพาะคน (admin only, paginated)
// @Tags Activity
// @Produce json
// @Param id path string true "User ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /users/{id}/activity [get]
func (h *ActivityLogHandler) GetUserActivity(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Parse user ID
	userIDStr := c.Params("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid user ID")
	}

	// Parse pagination
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Get user activity logs
	logs, total, err := h.service.GetUserHistory(ctx, userID, page, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get user activity logs", "error", err, "user_id", userID)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, logs, total, page, limit)
}

// GetPopularPages ดู pages ยอดนิยม (GET /api/v1/activity/popular) - Admin only
// @Summary Get popular pages
// @Description ดึง pages ยอดนิยมในช่วงเวลา (admin only)
// @Tags Activity
// @Produce json
// @Param pageType query string true "Page type (video, cast, tag, maker, etc.)"
// @Param days query int false "Number of days to look back" default(7)
// @Param limit query int false "Number of results" default(10)
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.ErrorResponse
// @Router /activity/popular [get]
func (h *ActivityLogHandler) GetPopularPages(c *fiber.Ctx) error {
	ctx := c.UserContext()

	pageType := c.Query("pageType", "video")
	days := c.QueryInt("days", 7)
	limit := c.QueryInt("limit", 10)

	if days < 1 || days > 365 {
		days = 7
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	results, err := h.service.GetPopularPages(ctx, pageType, startDate, endDate, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get popular pages", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, fiber.Map{
		"pageType":  pageType,
		"days":      days,
		"startDate": startDate,
		"endDate":   endDate,
		"data":      results,
	})
}

// GetActivitySummary ดูสรุป activity (GET /api/v1/activity/summary) - Admin only
// @Summary Get activity summary
// @Description ดึงสรุป activity แยกตาม pageType
// @Tags Activity
// @Produce json
// @Param days query int false "Number of days to look back" default(7)
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.ErrorResponse
// @Router /activity/summary [get]
func (h *ActivityLogHandler) GetActivitySummary(c *fiber.Ctx) error {
	ctx := c.UserContext()

	days := c.QueryInt("days", 7)
	if days < 1 || days > 365 {
		days = 7
	}

	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	pageTypes := []string{"video", "cast", "tag", "maker", "search", "ai-search", "reel", "feed"}
	summary := make(map[string]interface{})

	for _, pt := range pageTypes {
		results, err := h.service.GetPopularPages(ctx, pt, startDate, endDate, 5)
		if err != nil {
			logger.WarnContext(ctx, "Failed to get popular pages for type", "pageType", pt, "error", err)
			continue
		}
		summary[pt] = results
	}

	return utils.SuccessResponse(c, fiber.Map{
		"days":      days,
		"startDate": startDate,
		"endDate":   endDate,
		"summary":   summary,
	})
}
