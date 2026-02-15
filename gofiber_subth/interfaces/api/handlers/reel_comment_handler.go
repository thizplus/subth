package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type ReelCommentHandler struct {
	commentService services.ReelCommentService
	xpService      services.XPService
}

func NewReelCommentHandler(commentService services.ReelCommentService, xpService services.XPService) *ReelCommentHandler {
	return &ReelCommentHandler{
		commentService: commentService,
		xpService:      xpService,
	}
}

// CreateComment godoc
// @Summary Create a comment on a reel
// @Tags Reel Comments
// @Accept json
// @Produce json
// @Param id path string true "Reel ID"
// @Param body body dto.CreateCommentRequest true "Comment data"
// @Success 201 {object} utils.Response
// @Router /api/v1/reels/{id}/comments [post]
func (h *ReelCommentHandler) CreateComment(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Get user from context
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	// Get reel ID from params
	reelIDStr := c.Params("id")
	reelID, err := uuid.Parse(reelIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid reel ID")
	}

	// Parse request body
	var req dto.CreateCommentRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	// Set reel ID from params
	req.ReelID = reelID

	// Validate
	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		return utils.ValidationErrorResponse(c, errors)
	}

	// Create comment
	result, err := h.commentService.Create(ctx, user.ID, &req)
	if err != nil {
		return utils.InternalServerErrorResponse(c)
	}

	// Award XP for commenting
	if h.xpService != nil {
		xpResult, err := h.xpService.AwardCommentXP(ctx, user.ID, reelID, result.ID)
		if err != nil {
			logger.WarnContext(ctx, "Failed to award comment XP", "error", err, "user_id", user.ID, "comment_id", result.ID)
		} else if xpResult.Awarded {
			logger.InfoContext(ctx, "Comment XP awarded", "user_id", user.ID, "comment_id", result.ID, "xp", xpResult.XPAmount)
		}
	}

	return utils.CreatedResponse(c, result)
}

// ListComments godoc
// @Summary List comments for a reel
// @Tags Reel Comments
// @Accept json
// @Produce json
// @Param id path string true "Reel ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse
// @Router /api/v1/reels/{id}/comments [get]
func (h *ReelCommentHandler) ListComments(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Get reel ID from params
	reelIDStr := c.Params("id")
	reelID, err := uuid.Parse(reelIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid reel ID")
	}

	// Parse query params
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 20
	}

	// Get comments
	comments, total, err := h.commentService.ListByReel(ctx, reelID, page, limit)
	if err != nil {
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, comments, total, page, limit)
}

// GetComment godoc
// @Summary Get a comment by ID
// @Tags Reel Comments
// @Accept json
// @Produce json
// @Param commentId path string true "Comment ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/comments/{commentId} [get]
func (h *ReelCommentHandler) GetComment(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Get comment ID from params
	commentIDStr := c.Params("commentId")
	commentID, err := uuid.Parse(commentIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid comment ID")
	}

	comment, err := h.commentService.GetByID(ctx, commentID)
	if err != nil {
		return utils.NotFoundResponse(c, "Comment not found")
	}

	return utils.SuccessResponse(c, comment)
}

// UpdateComment godoc
// @Summary Update a comment
// @Tags Reel Comments
// @Accept json
// @Produce json
// @Param commentId path string true "Comment ID"
// @Param body body dto.UpdateCommentRequest true "Comment data"
// @Success 200 {object} utils.Response
// @Router /api/v1/comments/{commentId} [put]
func (h *ReelCommentHandler) UpdateComment(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Get user from context
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	// Get comment ID from params
	commentIDStr := c.Params("commentId")
	commentID, err := uuid.Parse(commentIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid comment ID")
	}

	// Parse request body
	var req dto.UpdateCommentRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	// Validate
	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		return utils.ValidationErrorResponse(c, errors)
	}

	// Update comment
	result, err := h.commentService.Update(ctx, user.ID, commentID, &req)
	if err != nil {
		if err.Error() == "comment not found" {
			return utils.NotFoundResponse(c, "Comment not found")
		}
		if err.Error() == "unauthorized: not comment owner" {
			return utils.ForbiddenResponse(c, "Not authorized to update this comment")
		}
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, result)
}

// DeleteComment godoc
// @Summary Delete a comment
// @Tags Reel Comments
// @Accept json
// @Produce json
// @Param commentId path string true "Comment ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/comments/{commentId} [delete]
func (h *ReelCommentHandler) DeleteComment(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Get user from context
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "User not authenticated")
	}

	// Get comment ID from params
	commentIDStr := c.Params("commentId")
	commentID, err := uuid.Parse(commentIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid comment ID")
	}

	// Delete comment
	err = h.commentService.Delete(ctx, user.ID, commentID)
	if err != nil {
		if err.Error() == "comment not found" {
			return utils.NotFoundResponse(c, "Comment not found")
		}
		if err.Error() == "unauthorized: not comment owner" {
			return utils.ForbiddenResponse(c, "Not authorized to delete this comment")
		}
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, fiber.Map{"message": "Comment deleted successfully"})
}

// ListRecentComments godoc
// @Summary List recent comments across all reels
// @Tags Reel Comments
// @Accept json
// @Produce json
// @Param limit query int false "Number of comments" default(10)
// @Success 200 {object} utils.Response
// @Router /api/v1/comments/recent [get]
func (h *ReelCommentHandler) ListRecentComments(c *fiber.Ctx) error {
	ctx := c.UserContext()

	limit := c.QueryInt("limit", 10)
	if limit < 1 || limit > 50 {
		limit = 10
	}

	comments, err := h.commentService.ListRecent(ctx, limit)
	if err != nil {
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, comments)
}

// ListReplies godoc
// @Summary List replies for a comment
// @Tags Reel Comments
// @Accept json
// @Produce json
// @Param commentId path string true "Parent Comment ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse
// @Router /api/v1/comments/{commentId}/replies [get]
func (h *ReelCommentHandler) ListReplies(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Get parent comment ID from params
	parentIDStr := c.Params("commentId")
	parentID, err := uuid.Parse(parentIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid comment ID")
	}

	// Parse query params
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 20
	}

	// Get replies
	replies, total, err := h.commentService.ListReplies(ctx, parentID, page, limit)
	if err != nil {
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, replies, total, page, limit)
}
