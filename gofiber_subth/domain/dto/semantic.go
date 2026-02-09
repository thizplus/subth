package dto

// SemanticSearchResult - single video result from semantic search
type SemanticSearchResult struct {
	ID         string   `json:"id"`
	Title      string   `json:"title"`
	Thumbnail  string   `json:"thumbnail"`
	Similarity float64  `json:"similarity"`
	AutoTags   []string `json:"autoTags,omitempty"`
}

// SemanticSearchResponse - response from semantic search
type SemanticSearchResponse struct {
	Videos []SemanticSearchResult `json:"videos"`
	Total  int                    `json:"total"`
}

// CLIPTextSearchRequest - request to Python CLIP service for text search
type CLIPTextSearchRequest struct {
	Query     string  `json:"query"`
	Limit     int     `json:"limit"`
	Threshold float64 `json:"threshold"`
}

// CLIPSearchResponse - response from Python CLIP service
type CLIPSearchResponse struct {
	Success bool           `json:"success"`
	Data    CLIPSearchData `json:"data"`
	Error   string         `json:"error,omitempty"`
}

type CLIPSearchData struct {
	Videos []CLIPVideoResult `json:"videos"`
	Total  int               `json:"total"`
}

type CLIPVideoResult struct {
	ID         string  `json:"id"`
	Code       string  `json:"code"`
	Title      string  `json:"title"`
	Thumbnail  string  `json:"thumbnail"`
	Similarity float64 `json:"similarity"`
}

// HybridSearchRequest - request for hybrid search (vector + text)
type HybridSearchRequest struct {
	Query        string  `json:"query" validate:"required,min=1,max=500"`
	Limit        int     `json:"limit" validate:"omitempty,min=1,max=100"`
	VectorWeight float64 `json:"vectorWeight" validate:"omitempty,min=0,max=1"`
	TextWeight   float64 `json:"textWeight" validate:"omitempty,min=0,max=1"`
	Lang         string  `json:"lang" validate:"omitempty,oneof=en th"`
	Cursor       string  `json:"cursor,omitempty"`
}

// HybridSearchResponse - response from hybrid search
type HybridSearchResponse struct {
	Videos     []HybridSearchResult `json:"videos"`
	Total      int                  `json:"total"`
	NextCursor string               `json:"nextCursor,omitempty"`
}

type HybridSearchResult struct {
	ID         string  `json:"id"`
	Title      string  `json:"title"`
	Thumbnail  string  `json:"thumbnail"`
	Score      float64 `json:"score"`
	CastNames  string  `json:"castNames,omitempty"`
	MakerName  string  `json:"makerName,omitempty"`
}

// CLIPHybridSearchRequest - request to Python CLIP service for hybrid search
type CLIPHybridSearchRequest struct {
	Query        string  `json:"query"`
	Limit        int     `json:"limit"`
	VectorWeight float64 `json:"vector_weight"`
	TextWeight   float64 `json:"text_weight"`
	Lang         string  `json:"lang"`
	Cursor       string  `json:"cursor,omitempty"`
}

// CLIPHybridSearchResponse - response from Python CLIP service hybrid search
type CLIPHybridSearchResponse struct {
	Success bool                  `json:"success"`
	Data    CLIPHybridSearchData  `json:"data"`
	Error   string                `json:"error,omitempty"`
}

type CLIPHybridSearchData struct {
	Videos     []CLIPVideoResult `json:"videos"`
	Total      int               `json:"total"`
	NextCursor string            `json:"nextCursor,omitempty"`
}
