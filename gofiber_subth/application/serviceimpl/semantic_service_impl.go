package serviceimpl

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/config"
	"gofiber-template/pkg/logger"
)

type semanticServiceImpl struct {
	clipURL    string
	httpClient *http.Client
}

func NewSemanticService(cfg *config.Config) services.SemanticService {
	return &semanticServiceImpl{
		clipURL: cfg.CLIP.ServiceURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *semanticServiceImpl) SearchByText(ctx context.Context, req *dto.SemanticSearchRequest) (*dto.SemanticSearchResponse, error) {
	// Set defaults
	limit := req.Limit
	if limit <= 0 {
		limit = 20
	}

	// Prepare request to Python CLIP service
	clipReq := dto.CLIPTextSearchRequest{
		Query:     req.Query,
		Limit:     limit,
		Threshold: 0.2, // default threshold
	}

	body, err := json.Marshal(clipReq)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to marshal CLIP request", "error", err)
		return nil, fmt.Errorf("failed to prepare search request")
	}

	// Call Python CLIP service
	url := fmt.Sprintf("%s/api/v1/search/text", s.clipURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		logger.ErrorContext(ctx, "Failed to create HTTP request", "error", err)
		return nil, fmt.Errorf("failed to create search request")
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to call CLIP service", "error", err, "url", url)
		return nil, fmt.Errorf("search service unavailable")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		logger.ErrorContext(ctx, "CLIP service returned error",
			"status", resp.StatusCode,
			"body", string(bodyBytes),
		)
		return nil, fmt.Errorf("search failed: status %d", resp.StatusCode)
	}

	// Parse response
	var clipResp dto.CLIPSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&clipResp); err != nil {
		logger.ErrorContext(ctx, "Failed to decode CLIP response", "error", err)
		return nil, fmt.Errorf("failed to parse search results")
	}

	if !clipResp.Success {
		logger.WarnContext(ctx, "CLIP search returned failure", "error", clipResp.Error)
		return nil, fmt.Errorf("search failed: %s", clipResp.Error)
	}

	// Convert to our response format
	results := make([]dto.SemanticSearchResult, len(clipResp.Data.Videos))
	for i, v := range clipResp.Data.Videos {
		results[i] = dto.SemanticSearchResult{
			ID:         v.ID,
			Title:      v.Title,
			Thumbnail:  v.Thumbnail,
			Similarity: v.Similarity,
		}
	}

	logger.InfoContext(ctx, "Semantic search completed",
		"query", req.Query,
		"results", len(results),
	)

	return &dto.SemanticSearchResponse{
		Videos: results,
		Total:  clipResp.Data.Total,
	}, nil
}

func (s *semanticServiceImpl) GetSimilarVideos(ctx context.Context, videoID uuid.UUID, limit int) (*dto.SemanticSearchResponse, error) {
	if limit <= 0 {
		limit = 10
	}

	// Call Python CLIP service
	url := fmt.Sprintf("%s/api/v1/search/similar/%s?limit=%d", s.clipURL, videoID.String(), limit)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to create HTTP request", "error", err)
		return nil, fmt.Errorf("failed to create request")
	}

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to call CLIP service", "error", err, "url", url)
		return nil, fmt.Errorf("search service unavailable")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		logger.ErrorContext(ctx, "CLIP service returned error",
			"status", resp.StatusCode,
			"body", string(bodyBytes),
		)
		return nil, fmt.Errorf("search failed: status %d", resp.StatusCode)
	}

	// Parse response
	var clipResp dto.CLIPSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&clipResp); err != nil {
		logger.ErrorContext(ctx, "Failed to decode CLIP response", "error", err)
		return nil, fmt.Errorf("failed to parse search results")
	}

	if !clipResp.Success {
		logger.WarnContext(ctx, "Similar search returned failure", "error", clipResp.Error)
		return nil, fmt.Errorf("search failed: %s", clipResp.Error)
	}

	// Convert to our response format
	results := make([]dto.SemanticSearchResult, len(clipResp.Data.Videos))
	for i, v := range clipResp.Data.Videos {
		results[i] = dto.SemanticSearchResult{
			ID:         v.ID,
			Title:      v.Title,
			Thumbnail:  v.Thumbnail,
			Similarity: v.Similarity,
		}
	}

	logger.InfoContext(ctx, "Similar videos search completed",
		"video_id", videoID,
		"results", len(results),
	)

	return &dto.SemanticSearchResponse{
		Videos: results,
		Total:  clipResp.Data.Total,
	}, nil
}

func (s *semanticServiceImpl) HybridSearch(ctx context.Context, req *dto.HybridSearchRequest) (*dto.HybridSearchResponse, error) {
	// Set defaults
	limit := req.Limit
	if limit <= 0 {
		limit = 20
	}
	vectorWeight := req.VectorWeight
	if vectorWeight <= 0 {
		vectorWeight = 0.6
	}
	textWeight := req.TextWeight
	if textWeight <= 0 {
		textWeight = 0.4
	}
	lang := req.Lang
	if lang == "" {
		lang = "th"
	}

	// Prepare request to Python CLIP service
	clipReq := dto.CLIPHybridSearchRequest{
		Query:        req.Query,
		Limit:        limit,
		VectorWeight: vectorWeight,
		TextWeight:   textWeight,
		Lang:         lang,
		Cursor:       req.Cursor,
	}

	body, err := json.Marshal(clipReq)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to marshal hybrid search request", "error", err)
		return nil, fmt.Errorf("failed to prepare search request")
	}

	// Call Python CLIP service
	url := fmt.Sprintf("%s/api/v1/search/hybrid", s.clipURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		logger.ErrorContext(ctx, "Failed to create HTTP request", "error", err)
		return nil, fmt.Errorf("failed to create search request")
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to call CLIP hybrid search", "error", err, "url", url)
		return nil, fmt.Errorf("search service unavailable")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		logger.ErrorContext(ctx, "CLIP hybrid search returned error",
			"status", resp.StatusCode,
			"body", string(bodyBytes),
		)
		return nil, fmt.Errorf("search failed: status %d", resp.StatusCode)
	}

	// Parse response
	var clipResp dto.CLIPHybridSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&clipResp); err != nil {
		logger.ErrorContext(ctx, "Failed to decode hybrid search response", "error", err)
		return nil, fmt.Errorf("failed to parse search results")
	}

	if !clipResp.Success {
		logger.WarnContext(ctx, "Hybrid search returned failure", "error", clipResp.Error)
		return nil, fmt.Errorf("search failed: %s", clipResp.Error)
	}

	// Convert to our response format
	results := make([]dto.HybridSearchResult, len(clipResp.Data.Videos))
	for i, v := range clipResp.Data.Videos {
		results[i] = dto.HybridSearchResult{
			ID:        v.ID,
			Title:     v.Title,
			Thumbnail: v.Thumbnail,
			Score:     v.Similarity,
		}
	}

	logger.InfoContext(ctx, "Hybrid search completed",
		"query", req.Query,
		"results", len(results),
		"vector_weight", vectorWeight,
		"text_weight", textWeight,
	)

	return &dto.HybridSearchResponse{
		Videos:     results,
		Total:      clipResp.Data.Total,
		NextCursor: clipResp.Data.NextCursor,
	}, nil
}
