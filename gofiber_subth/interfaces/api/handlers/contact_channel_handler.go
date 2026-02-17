package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type ContactChannelHandler struct {
	channelService services.ContactChannelService
}

func NewContactChannelHandler(channelService services.ContactChannelService) *ContactChannelHandler {
	return &ContactChannelHandler{
		channelService: channelService,
	}
}

// ListContactChannels godoc
// @Summary List contact channels (public - active only)
// @Tags contact-channels
// @Produce json
// @Success 200 {object} utils.Response
// @Router /api/v1/contact-channels [get]
func (h *ContactChannelHandler) ListContactChannels(c *fiber.Ctx) error {
	ctx := c.UserContext()

	channels, err := h.channelService.List(ctx, false) // active only
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list contact channels", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, channels)
}

// ListContactChannelsAdmin godoc
// @Summary List all contact channels (admin - include inactive)
// @Tags contact-channels
// @Produce json
// @Success 200 {object} utils.Response
// @Router /api/v1/contact-channels/admin [get]
func (h *ContactChannelHandler) ListContactChannelsAdmin(c *fiber.Ctx) error {
	ctx := c.UserContext()

	channels, err := h.channelService.List(ctx, true) // include inactive
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list contact channels", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, channels)
}

// GetContactChannel godoc
// @Summary Get contact channel by ID
// @Tags contact-channels
// @Produce json
// @Param id path string true "Contact Channel ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/contact-channels/{id} [get]
func (h *ContactChannelHandler) GetContactChannel(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid contact channel ID")
	}

	channel, err := h.channelService.GetByID(ctx, id)
	if err != nil {
		if err.Error() == "contact channel not found" {
			return utils.NotFoundResponse(c, "Contact channel not found")
		}
		logger.ErrorContext(ctx, "Failed to get contact channel", "channel_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, channel)
}

// CreateContactChannel godoc
// @Summary Create a new contact channel
// @Tags contact-channels
// @Accept json
// @Produce json
// @Param channel body dto.CreateContactChannelRequest true "Contact channel data"
// @Success 201 {object} utils.Response
// @Router /api/v1/contact-channels [post]
func (h *ContactChannelHandler) CreateContactChannel(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.CreateContactChannelRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errs := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errs)
		return utils.ValidationErrorResponse(c, errs)
	}

	channel, err := h.channelService.Create(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to create contact channel", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Contact channel created", "channel_id", channel.ID, "platform", channel.Platform)
	return utils.CreatedResponse(c, channel)
}

// UpdateContactChannel godoc
// @Summary Update contact channel
// @Tags contact-channels
// @Accept json
// @Produce json
// @Param id path string true "Contact Channel ID"
// @Param channel body dto.UpdateContactChannelRequest true "Contact channel data"
// @Success 200 {object} utils.Response
// @Router /api/v1/contact-channels/{id} [put]
func (h *ContactChannelHandler) UpdateContactChannel(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid contact channel ID")
	}

	var req dto.UpdateContactChannelRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errs := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errs)
		return utils.ValidationErrorResponse(c, errs)
	}

	channel, err := h.channelService.Update(ctx, id, &req)
	if err != nil {
		if err.Error() == "contact channel not found" {
			return utils.NotFoundResponse(c, "Contact channel not found")
		}
		logger.ErrorContext(ctx, "Failed to update contact channel", "channel_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Contact channel updated", "channel_id", id)
	return utils.SuccessResponse(c, channel)
}

// DeleteContactChannel godoc
// @Summary Delete contact channel
// @Tags contact-channels
// @Produce json
// @Param id path string true "Contact Channel ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/contact-channels/{id} [delete]
func (h *ContactChannelHandler) DeleteContactChannel(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid contact channel ID")
	}

	if err := h.channelService.Delete(ctx, id); err != nil {
		if err.Error() == "contact channel not found" {
			return utils.NotFoundResponse(c, "Contact channel not found")
		}
		logger.ErrorContext(ctx, "Failed to delete contact channel", "channel_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Contact channel deleted", "channel_id", id)
	return utils.SuccessResponse(c, fiber.Map{"message": "Contact channel deleted successfully"})
}

// ReorderContactChannels godoc
// @Summary Reorder contact channels
// @Tags contact-channels
// @Accept json
// @Produce json
// @Param body body dto.ReorderContactChannelsRequest true "Contact channel IDs in new order"
// @Success 200 {object} utils.Response
// @Router /api/v1/contact-channels/reorder [put]
func (h *ContactChannelHandler) ReorderContactChannels(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.ReorderContactChannelsRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errs := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errs)
		return utils.ValidationErrorResponse(c, errs)
	}

	if err := h.channelService.Reorder(ctx, req.IDs); err != nil {
		logger.ErrorContext(ctx, "Failed to reorder contact channels", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Contact channels reordered", "count", len(req.IDs))
	return utils.SuccessResponse(c, fiber.Map{"message": "Contact channels reordered successfully"})
}
