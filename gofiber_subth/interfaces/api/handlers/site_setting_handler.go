package handlers

import (
	"github.com/gofiber/fiber/v2"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type SiteSettingHandler struct {
	service services.SiteSettingService
}

func NewSiteSettingHandler(service services.SiteSettingService) *SiteSettingHandler {
	return &SiteSettingHandler{service: service}
}

// Get returns the current site settings
// GET /api/v1/settings
func (h *SiteSettingHandler) Get(c *fiber.Ctx) error {
	ctx := c.UserContext()

	setting, err := h.service.Get(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get site settings", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, setting)
}

// Update updates the site settings
// PUT /api/v1/settings
func (h *SiteSettingHandler) Update(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.UpdateSiteSettingRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errors)
		return utils.ValidationErrorResponse(c, errors)
	}

	setting, err := h.service.Update(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to update site settings", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Site settings updated", "gtm_id", req.GTMID)
	return utils.SuccessResponse(c, setting)
}
