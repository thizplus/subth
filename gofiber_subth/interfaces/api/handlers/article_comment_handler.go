package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type ArticleCommentHandler struct {
	service   services.ArticleCommentService
	xpService services.XPService
}

func NewArticleCommentHandler(service services.ArticleCommentService, xpService services.XPService) *ArticleCommentHandler {
	return &ArticleCommentHandler{
		service:   service,
		xpService: xpService,
	}
}

// Create godoc
// @Summary Create article comment
// @Description Create a new comment on an article
// @Tags ArticleComments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Article ID"
// @Param body body dto.CreateArticleCommentRequest true "Comment data"
// @Success 201 {object} utils.Response{data=dto.ArticleCommentResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /articles/{id}/comments [post]
func (h *ArticleCommentHandler) Create(c *fiber.Ctx) error {
	ctx := c.UserContext()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Unauthorized")
	}

	articleIDStr := c.Params("id")
	articleID, err := uuid.Parse(articleIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid article ID")
	}

	var req dto.CreateArticleCommentRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	// Override articleID from path
	req.ArticleID = articleID

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		return utils.ValidationErrorResponse(c, errors)
	}

	comment, err := h.service.Create(ctx, user.ID, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to create article comment", "error", err, "user_id", user.ID, "article_id", articleID)
		return utils.InternalServerErrorResponse(c)
	}

	// Award XP for comment
	if h.xpService != nil {
		go func() {
			_, _ = h.xpService.AwardCommentXP(ctx, user.ID, articleID, comment.ID)
		}()
	}

	return utils.CreatedResponse(c, comment)
}

// List godoc
// @Summary List article comments
// @Description Get paginated comments for an article
// @Tags ArticleComments
// @Produce json
// @Param id path string true "Article ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.PaginatedResponse
// @Failure 400 {object} utils.ErrorResponse
// @Router /articles/{id}/comments [get]
func (h *ArticleCommentHandler) List(c *fiber.Ctx) error {
	ctx := c.UserContext()

	articleIDStr := c.Params("id")
	articleID, err := uuid.Parse(articleIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid article ID")
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	comments, total, err := h.service.ListByArticle(ctx, articleID, page, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list article comments", "error", err, "article_id", articleID)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.PaginatedSuccessResponse(c, comments, total, page, limit)
}

// Update godoc
// @Summary Update article comment
// @Description Update an existing comment
// @Tags ArticleComments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Article ID"
// @Param commentId path string true "Comment ID"
// @Param body body dto.UpdateArticleCommentRequest true "Updated comment data"
// @Success 200 {object} utils.Response{data=dto.ArticleCommentResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Router /articles/{id}/comments/{commentId} [put]
func (h *ArticleCommentHandler) Update(c *fiber.Ctx) error {
	ctx := c.UserContext()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Unauthorized")
	}

	commentIDStr := c.Params("commentId")
	commentID, err := uuid.Parse(commentIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid comment ID")
	}

	var req dto.UpdateArticleCommentRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errors := utils.GetValidationErrors(err)
		return utils.ValidationErrorResponse(c, errors)
	}

	comment, err := h.service.Update(ctx, user.ID, commentID, &req)
	if err != nil {
		if err.Error() == "comment not found" {
			return utils.NotFoundResponse(c, "Comment not found")
		}
		if err.Error() == "unauthorized: not comment owner" {
			return utils.ForbiddenResponse(c, "You can only edit your own comments")
		}
		logger.ErrorContext(ctx, "Failed to update article comment", "error", err, "user_id", user.ID, "comment_id", commentID)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, comment)
}

// Delete godoc
// @Summary Delete article comment
// @Description Delete an existing comment
// @Tags ArticleComments
// @Produce json
// @Security BearerAuth
// @Param id path string true "Article ID"
// @Param commentId path string true "Comment ID"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Router /articles/{id}/comments/{commentId} [delete]
func (h *ArticleCommentHandler) Delete(c *fiber.Ctx) error {
	ctx := c.UserContext()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Unauthorized")
	}

	commentIDStr := c.Params("commentId")
	commentID, err := uuid.Parse(commentIDStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid comment ID")
	}

	err = h.service.Delete(ctx, user.ID, commentID)
	if err != nil {
		if err.Error() == "comment not found" {
			return utils.NotFoundResponse(c, "Comment not found")
		}
		if err.Error() == "unauthorized: not comment owner" {
			return utils.ForbiddenResponse(c, "You can only delete your own comments")
		}
		logger.ErrorContext(ctx, "Failed to delete article comment", "error", err, "user_id", user.ID, "comment_id", commentID)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, fiber.Map{"deleted": true})
}
