package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type SemanticHandler struct {
	semanticService services.SemanticService
}

func NewSemanticHandler(semanticService services.SemanticService) *SemanticHandler {
	return &SemanticHandler{
		semanticService: semanticService,
	}
}

// SearchByText godoc
// @Summary      Semantic search by text
// @Description  Search videos using CLIP text embeddings
// @Tags         semantic
// @Accept       json
// @Produce      json
// @Param        request body dto.SemanticSearchRequest true "Search request"
// @Success      200  {object}  utils.Response{data=dto.SemanticSearchResponse}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /semantic/search [post]
func (h *SemanticHandler) SearchByText(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.SemanticSearchRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Query == "" {
		return utils.BadRequestResponse(c, "Query is required")
	}

	if req.Limit <= 0 {
		req.Limit = 20
	}
	if req.Limit > 100 {
		req.Limit = 100
	}

	logger.InfoContext(ctx, "Semantic search request",
		"query", req.Query,
		"limit", req.Limit,
	)

	result, err := h.semanticService.SearchByText(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Semantic search failed", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, result)
}

// SearchByTextGET godoc
// @Summary      Semantic search by text (GET)
// @Description  Search videos using CLIP text embeddings via GET request
// @Tags         semantic
// @Produce      json
// @Param        q     query  string  true   "Search query"
// @Param        limit query  int     false  "Limit results (default 20, max 100)"
// @Param        lang  query  string  false  "Language (th, en)"
// @Success      200  {object}  utils.Response{data=dto.SemanticSearchResponse}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /semantic/search [get]
func (h *SemanticHandler) SearchByTextGET(c *fiber.Ctx) error {
	ctx := c.UserContext()

	query := c.Query("q")
	if query == "" {
		return utils.BadRequestResponse(c, "Query parameter 'q' is required")
	}

	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}
	lang := c.Query("lang", "th")

	req := &dto.SemanticSearchRequest{
		Query: query,
		Limit: limit,
		Lang:  lang,
	}

	logger.InfoContext(ctx, "Semantic search GET request",
		"query", query,
		"limit", limit,
	)

	result, err := h.semanticService.SearchByText(ctx, req)
	if err != nil {
		logger.ErrorContext(ctx, "Semantic search failed", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, result)
}

// GetSimilarVideos godoc
// @Summary      Find similar videos
// @Description  Find videos similar to given video ID using CLIP embeddings
// @Tags         semantic
// @Produce      json
// @Param        id    path   string  true  "Video ID"
// @Param        limit query  int     false "Limit results (default 10, max 100)"
// @Success      200  {object}  utils.Response{data=dto.SemanticSearchResponse}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /semantic/similar/{id} [get]
func (h *SemanticHandler) GetSimilarVideos(c *fiber.Ctx) error {
	ctx := c.UserContext()

	idStr := c.Params("id")
	videoID, err := uuid.Parse(idStr)
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid video ID")
	}

	limit := c.QueryInt("limit", 10)
	if limit > 100 {
		limit = 100
	}

	logger.InfoContext(ctx, "Similar videos request",
		"video_id", videoID,
		"limit", limit,
	)

	result, err := h.semanticService.GetSimilarVideos(ctx, videoID, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Similar videos search failed", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, result)
}

// HybridSearch godoc
// @Summary      Hybrid search (vector + text)
// @Description  Search videos using both vector similarity and text matching (cast names, maker, title)
// @Tags         semantic
// @Accept       json
// @Produce      json
// @Param        request body dto.HybridSearchRequest true "Search request"
// @Success      200  {object}  utils.Response{data=dto.HybridSearchResponse}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /semantic/hybrid [post]
func (h *SemanticHandler) HybridSearch(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.HybridSearchRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Query == "" {
		return utils.BadRequestResponse(c, "Query is required")
	}

	// Set defaults
	if req.Limit <= 0 {
		req.Limit = 20
	}
	if req.Limit > 100 {
		req.Limit = 100
	}
	if req.VectorWeight <= 0 {
		req.VectorWeight = 0.6
	}
	if req.TextWeight <= 0 {
		req.TextWeight = 0.4
	}
	if req.Lang == "" {
		req.Lang = "th"
	}

	logger.InfoContext(ctx, "Hybrid search request",
		"query", req.Query,
		"limit", req.Limit,
		"vector_weight", req.VectorWeight,
		"text_weight", req.TextWeight,
	)

	result, err := h.semanticService.HybridSearch(ctx, &req)
	if err != nil {
		logger.ErrorContext(ctx, "Hybrid search failed", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	return utils.SuccessResponse(c, result)
}
