# SEO Content Worker - Architecture Plan

> Worker ตัวใหม่สำหรับ Auto-Generate E-E-A-T Content ส่งไปที่ `api.subth.com`

---

## 1. Overview

### หน้าที่หลัก
เมื่อ Admin กดปุ่ม "Generate Article" → Worker จะทำงานเป็น **Orchestrator** รวบรวมข้อมูล → AI Processing → TTS → Embedding → บันทึกลง Database

### ทำไมต้องแยก Worker?
- Logic 28 ฟิลด์ที่ต้องรอ AI + TTS + Embedding ใช้เวลา 15-30 วินาที
- ถ้าทำใน HTTP Request → Admin UI จะ Timeout
- แยก Worker ทำให้ Scale ได้อิสระ (Horizontal Scaling)

### Strategic Benefits
- **Data Integrity**: รู้ทันทีว่าข้อมูลที่ Gemini สกัดมีคุณภาพแค่ไหน ก่อนออกแบบหน้าเว็บ
- **Async Processing**: ขยายจำนวน Worker ได้ถ้ามีหนังเข้าจำนวนมาก
- **Decoupling**: ถ้า Gemini/ElevenLabs ล่ม → api.subth.com ยังทำงานปกติ

---

## 2. Architecture (Clean Architecture)

```
seo-worker/
├── cmd/
│   └── worker/main.go              # Entry point
├── config/
│   └── config.go                   # Configuration
├── container/
│   └── container.go                # DI Container
├── domain/
│   ├── models/
│   │   ├── job.go                  # SEOArticleJob struct
│   │   └── article.go              # Article model (28 fields)
│   └── ports/                      # Interfaces
│       ├── ai_port.go              # Gemini AI interface
│       ├── tts_port.go             # ElevenLabs interface
│       ├── embedding_port.go       # pgvector interface
│       ├── srt_fetcher_port.go     # SRT from api.suekk.com
│       ├── metadata_fetcher_port.go # Metadata from api.subth.com
│       ├── article_publisher_port.go # POST to api.subth.com
│       ├── consumer_port.go        # NATS Consumer
│       └── messenger_port.go       # NATS Publisher (progress)
├── infrastructure/
│   ├── ai/
│   │   └── gemini_client.go        # Gemini API implementation
│   ├── tts/
│   │   └── elevenlabs_client.go    # ElevenLabs implementation
│   ├── embedding/
│   │   └── pgvector_client.go      # pgvector implementation
│   ├── fetcher/
│   │   ├── srt_fetcher.go          # HTTP fetch SRT
│   │   └── metadata_fetcher.go     # HTTP fetch metadata
│   ├── publisher/
│   │   └── article_publisher.go    # HTTP POST article
│   ├── consumer/
│   │   └── nats_consumer.go        # NATS JetStream consumer
│   └── messenger/
│       └── nats_publisher.go       # Progress updates
├── services/
│   ├── content_service.go          # AI content generation
│   ├── tts_service.go              # TTS generation
│   └── embedding_service.go        # Vector embedding
└── use_cases/
    └── seo_handler.go              # Main job handler (Orchestrator)
```

---

## 3. Domain Models

### 3.1 SEOArticleJob (Job Queue)

```go
// domain/models/job.go
type SEOArticleJob struct {
    VideoID       string `json:"video_id"`
    VideoCode     string `json:"video_code"`
    Priority      int    `json:"priority"`      // 1=urgent, 2=normal, 3=backfill
    GenerateTTS   bool   `json:"generate_tts"`  // ต้องการ TTS หรือไม่
    CreatedAt     int64  `json:"created_at"`
}
```

### 3.2 ArticleContent (28 Fields Output)

```go
// domain/models/article.go
type ArticleContent struct {
    // === Core SEO ===
    Title           string   `json:"title"`            // H1 + meta title
    MetaDescription string   `json:"metaDescription"`  // 150-160 chars
    Slug            string   `json:"slug"`             // URL-friendly

    // === Schema.org VideoObject ===
    VideoName        string   `json:"videoName"`
    VideoDescription string   `json:"videoDescription"`
    ThumbnailURL     string   `json:"thumbnailUrl"`
    ThumbnailAlt     string   `json:"thumbnailAlt"`    // AI generated
    UploadDate       string   `json:"uploadDate"`      // ISO 8601
    Duration         string   `json:"duration"`        // ISO 8601
    ContentURL       string   `json:"contentUrl"`
    EmbedURL         string   `json:"embedUrl"`

    // === Key Moments (hasPart) ===
    KeyMoments []KeyMoment `json:"keyMoments"`

    // === Article Content ===
    Summary          string   `json:"summary"`         // 500 words (AI)
    Highlights       []string `json:"highlights"`      // 5-10 key scenes (AI)
    DetailedReview   string   `json:"detailedReview"`  // Long-form (AI)

    // === Cast & Crew ===
    CastProfiles []CastProfile `json:"castProfiles"`
    MakerInfo    MakerInfo     `json:"makerInfo"`

    // === Related Content ===
    RelatedVideos   []RelatedVideo `json:"relatedVideos"`
    TagDescriptions []TagDesc      `json:"tagDescriptions"`

    // === E-E-A-T Signals ===
    ExpertAnalysis  string `json:"expertAnalysis"`   // AI technical review
    QualityScore    int    `json:"qualityScore"`     // AI rating 1-10
    RecommendedFor  string `json:"recommendedFor"`   // Target audience

    // === TTS ===
    AudioSummaryURL string `json:"audioSummaryUrl"`  // ElevenLabs output
    AudioDuration   int    `json:"audioDuration"`    // seconds

    // === Gallery ===
    GalleryImages []GalleryImage `json:"galleryImages"`

    // === FAQ (AI Generated) ===
    FAQItems []FAQItem `json:"faqItems"`

    // === Vector Embedding ===
    EmbeddingVector []float32 `json:"embeddingVector"` // 1536 dims
}

type KeyMoment struct {
    Name      string `json:"name"`
    StartTime int    `json:"startOffset"` // seconds
    EndTime   int    `json:"endOffset"`
    URL       string `json:"url"`         // ?t={startTime}
}

type CastProfile struct {
    Name       string `json:"name"`
    NameTH     string `json:"nameTH"`
    Bio        string `json:"bio"`         // AI generated
    ImageURL   string `json:"imageUrl"`
    ProfileURL string `json:"profileUrl"`
}

type GalleryImage struct {
    URL    string `json:"url"`
    Alt    string `json:"alt"`    // AI generated from highlights
    Width  int    `json:"width"`
    Height int    `json:"height"`
}

type FAQItem struct {
    Question string `json:"question"`
    Answer   string `json:"answer"`
}
```

---

## 4. Ports (Interfaces)

### 4.1 AI Port

```go
// domain/ports/ai_port.go
type AIPort interface {
    // GenerateArticleContent รับ SRT + Metadata แล้วสร้าง content 28 fields
    GenerateArticleContent(ctx context.Context, input AIInput) (*ArticleContent, error)
}

type AIInput struct {
    SRTContent    string            // Full SRT text
    VideoMetadata VideoMetadata     // From api.subth.com
    Casts         []CastMetadata    // Cast info
    PreviousWorks []PreviousWork    // For context
}
```

### 4.2 TTS Port

```go
// domain/ports/tts_port.go
type TTSPort interface {
    // GenerateAudio สร้างไฟล์เสียงจาก text
    GenerateAudio(ctx context.Context, text string, voiceID string) (*TTSResult, error)
}

type TTSResult struct {
    AudioData    []byte
    Duration     int    // seconds
    CharCount    int    // characters used (for logging)
}
```

### TTS Script Optimization
```go
// services/tts_service.go
// สกัดใจความสำคัญจาก Full Summary (~500 คำ) เหลือ ~500 ตัวอักษร สำหรับ TTS
func ExtractTTSScript(summary string, highlights []string) string {
    // 1. เอา 2 ประโยคแรกจาก summary
    // 2. เพิ่ม highlights 3 อันแรก
    // 3. รวมกันไม่เกิน 500 ตัวอักษร
    // ประหยัด token และได้เสียงที่กระชับ
}
```

### 4.3 Embedding Port

```go
// domain/ports/embedding_port.go
type EmbeddingPort interface {
    // GenerateEmbedding สร้าง vector จาก text
    GenerateEmbedding(ctx context.Context, text string) ([]float32, error)

    // StoreEmbedding บันทึกลง pgvector พร้อม metadata สำหรับ filtered search
    StoreEmbedding(ctx context.Context, embedding *EmbeddingData) error
}

// EmbeddingData รวม vector + metadata สำหรับ filtered similarity search
type EmbeddingData struct {
    VideoID   string    `json:"video_id"`
    Vector    []float32 `json:"vector"`     // 1536 dims
    CastIDs   []string  `json:"cast_ids"`   // Filter: หานักแสดงคนเดียวกัน
    MakerID   string    `json:"maker_id"`   // Filter: หา maker เดียวกัน
    TagIDs    []string  `json:"tag_ids"`    // Filter: หา tag คล้ายกัน
    CreatedAt time.Time `json:"created_at"`
}
```

### 4.4 Fetcher Ports

```go
// domain/ports/srt_fetcher_port.go
type SRTFetcherPort interface {
    // FetchSRT ดึง SRT จาก api.suekk.com
    // หมายเหตุ: SRT ต้องมีอยู่แล้ว (pre-validated ที่ Admin UI)
    FetchSRT(ctx context.Context, videoCode string) (string, error)
}

// domain/ports/metadata_fetcher_port.go
type MetadataFetcherPort interface {
    // FetchVideoMetadata ดึงข้อมูล video จาก api.subth.com
    FetchVideoMetadata(ctx context.Context, videoID string) (*VideoMetadata, error)

    // FetchCasts ดึงข้อมูล cast
    FetchCasts(ctx context.Context, castIDs []string) ([]CastMetadata, error)

    // FetchPreviousWorks ดึงผลงานก่อนหน้าของ cast
    FetchPreviousWorks(ctx context.Context, castID string) ([]PreviousWork, error)
}
```

### 4.5 Publisher Port

```go
// domain/ports/article_publisher_port.go
type ArticlePublisherPort interface {
    // PublishArticle ส่ง article ไปที่ api.subth.com
    PublishArticle(ctx context.Context, article *ArticleContent) error

    // UpdateArticleStatus อัพเดทสถานะ (draft/published)
    UpdateArticleStatus(ctx context.Context, videoID string, status string) error
}
```

---

## 5. Use Case: SEO Handler (Orchestrator)

```go
// use_cases/seo_handler.go
type SEOHandler struct {
    srtFetcher     ports.SRTFetcherPort
    metadataFetcher ports.MetadataFetcherPort
    aiService      ports.AIPort
    ttsService     ports.TTSPort
    embeddingService ports.EmbeddingPort
    articlePublisher ports.ArticlePublisherPort
    messenger      ports.MessengerPort
    storage        ports.StoragePort
}

func (h *SEOHandler) ProcessJob(ctx context.Context, job *models.SEOArticleJob) error {
    // === Stage 1: Fetch Raw Materials ===
    // หมายเหตุ: SRT ต้องมีอยู่แล้วก่อนกดปุ่ม (validated ที่ Admin UI)
    h.messenger.SendProgress(job.VideoID, "fetching_data", 10)

    // 1.1 Fetch SRT content
    srtContent, err := h.srtFetcher.FetchSRT(ctx, job.VideoCode)
    if err != nil {
        return fmt.Errorf("failed to fetch SRT: %w", err)
    }

    // 1.2 Fetch metadata
    metadata, err := h.metadataFetcher.FetchVideoMetadata(ctx, job.VideoID)
    if err != nil {
        return fmt.Errorf("failed to fetch metadata: %w", err)
    }

    // 1.3 Fetch cast info & previous works
    casts, _ := h.metadataFetcher.FetchCasts(ctx, metadata.CastIDs)
    var previousWorks []PreviousWork
    for _, cast := range casts {
        works, _ := h.metadataFetcher.FetchPreviousWorks(ctx, cast.ID)
        previousWorks = append(previousWorks, works...)
    }

    h.messenger.SendProgress(job.VideoID, "data_fetched", 25)

    // === Stage 2: AI Processing (Gemini with JSON Mode) ===
    h.messenger.SendProgress(job.VideoID, "ai_processing", 30)

    aiInput := AIInput{
        SRTContent:    srtContent,
        VideoMetadata: *metadata,
        Casts:         casts,
        PreviousWorks: previousWorks,
    }

    article, err := h.aiService.GenerateArticleContent(ctx, aiInput)
    if err != nil {
        return fmt.Errorf("AI generation failed: %w", err)
    }

    h.messenger.SendProgress(job.VideoID, "ai_completed", 60)

    // === Stage 3: TTS & Embedding (Parallel) ===
    // รัน TTS และ Embedding พร้อมกันเพื่อความเร็ว
    h.messenger.SendProgress(job.VideoID, "tts_embedding", 65)

    var wg sync.WaitGroup
    var ttsErr, embedErr error

    // 3.1 TTS Generation (Optional)
    if job.GenerateTTS {
        wg.Add(1)
        go func() {
            defer wg.Done()
            // สกัดใจความสำคัญ ~500 ตัวอักษร แทนที่จะใช้ full summary
            ttsScript := ExtractTTSScript(article.Summary, article.Highlights)
            ttsResult, err := h.ttsService.GenerateAudio(ctx, ttsScript, "thai-female")
            if err != nil {
                slog.Warn("TTS failed", "error", err, "video_id", job.VideoID)
                ttsErr = err
                return
            }
            // Upload to storage
            audioPath := fmt.Sprintf("audio/articles/%s/summary.mp3", job.VideoCode)
            h.storage.Upload(ctx, audioPath, ttsResult.AudioData)
            article.AudioSummaryURL = audioPath
            article.AudioDuration = ttsResult.Duration
        }()
    }

    // 3.2 Embedding Generation
    wg.Add(1)
    go func() {
        defer wg.Done()
        embeddingText := article.Summary + " " + strings.Join(article.Highlights, " ")
        vector, err := h.embeddingService.GenerateEmbedding(ctx, embeddingText)
        if err != nil {
            embedErr = err
            return
        }
        article.EmbeddingVector = vector

        // Store in pgvector พร้อม metadata สำหรับ filtered search
        embeddingData := &EmbeddingData{
            VideoID:   job.VideoID,
            Vector:    vector,
            CastIDs:   metadata.CastIDs,
            MakerID:   metadata.MakerID,
            TagIDs:    metadata.TagIDs,
            CreatedAt: time.Now(),
        }
        if err := h.embeddingService.StoreEmbedding(ctx, embeddingData); err != nil {
            slog.Warn("pgvector store failed", "error", err)
        }
    }()

    wg.Wait()

    // TTS error is non-critical, embedding error is critical
    if embedErr != nil {
        return fmt.Errorf("embedding failed: %w", embedErr)
    }

    h.messenger.SendProgress(job.VideoID, "tts_embedding_completed", 90)

    // === Stage 4: Publish to api.subth.com ===
    h.messenger.SendProgress(job.VideoID, "publishing", 95)

    err = h.articlePublisher.PublishArticle(ctx, article)
    if err != nil {
        return fmt.Errorf("publish failed: %w", err)
    }

    h.messenger.SendProgress(job.VideoID, "completed", 100)

    return nil
}
```

---

## 6. Container (DI)

```go
// container/container.go
type Container struct {
    Config *config.Config

    // External connections
    NATSConn *nats.Conn
    DB       *sql.DB

    // Ports
    SRTFetcher       ports.SRTFetcherPort
    MetadataFetcher  ports.MetadataFetcherPort
    AIService        ports.AIPort
    TTSService       ports.TTSPort
    EmbeddingService ports.EmbeddingPort
    ArticlePublisher ports.ArticlePublisherPort
    Consumer         ports.ConsumerPort
    Messenger        ports.MessengerPort
    Storage          ports.StoragePort

    // Use Cases
    SEOHandler *use_cases.SEOHandler
}

func NewContainer(cfg *config.Config) (*Container, error) {
    c := &Container{Config: cfg}

    // 1. External Connections
    c.NATSConn, _ = nats.Connect(cfg.NATS.URL)
    c.DB, _ = sql.Open("postgres", cfg.Database.URL)

    // 2. Infrastructure
    c.SRTFetcher = fetcher.NewSRTFetcher(cfg.SuekkAPI.URL, cfg.SuekkAPI.Token)
    c.MetadataFetcher = fetcher.NewMetadataFetcher(cfg.SubthAPI.URL, cfg.SubthAPI.Token)
    c.AIService = ai.NewGeminiClient(cfg.Gemini.APIKey)
    c.TTSService = tts.NewElevenLabsClient(cfg.ElevenLabs.APIKey)
    c.EmbeddingService = embedding.NewPgVectorClient(c.DB)
    c.ArticlePublisher = publisher.NewArticlePublisher(cfg.SubthAPI.URL, cfg.SubthAPI.Token)
    c.Consumer, _ = consumer.NewNATSConsumer(cfg.NATS)
    c.Messenger = messenger.NewNATSPublisher(c.NATSConn)
    c.Storage, _ = storage.NewR2Client(cfg.Storage)

    // 3. Use Cases
    c.SEOHandler = use_cases.NewSEOHandler(
        c.SRTFetcher,
        c.MetadataFetcher,
        c.AIService,
        c.TTSService,
        c.EmbeddingService,
        c.ArticlePublisher,
        c.Messenger,
        c.Storage,
    )

    // 4. Wire handler to consumer
    c.Consumer.SetHandler(c.SEOHandler.ProcessJob)

    return c, nil
}
```

---

## 7. Configuration

```go
// config/config.go
type Config struct {
    Worker struct {
        ID          string
        Concurrency int
    }

    NATS struct {
        URL    string
        Stream string // "SEO_ARTICLES"
    }

    Database struct {
        URL string // PostgreSQL with pgvector
    }

    SuekkAPI struct {
        URL   string // https://api.suekk.com
        Token string
    }

    SubthAPI struct {
        URL   string // https://api.subth.com
        Token string
    }

    Gemini struct {
        APIKey string
        Model  string // "gemini-1.5-pro"
    }

    ElevenLabs struct {
        APIKey  string
        VoiceID string
    }

    Storage struct {
        Endpoint  string
        AccessKey string
        SecretKey string
        Bucket    string
    }
}
```

---

## 8. NATS JetStream Setup

```go
// Stream: SEO_ARTICLES
// Subject: seo.article.generate

// Consumer: seo-worker-{id}
// DeliverPolicy: all
// AckPolicy: explicit
// MaxDeliver: 3 (retry 3 times then DLQ)
```

### Job Flow (Async with 202 Accepted)
```
Admin UI → POST /api/v1/admin/articles/generate
         → API validates (SRT exists? ✓)
         → API publishes to NATS "seo.article.generate"
         → API returns 202 Accepted ทันที (ไม่ต้องรอ Worker)

SEO Worker → Consumes job from NATS
           → Fetch SRT + Metadata
           → AI Processing (Gemini JSON Mode)
           → TTS + Embedding (Parallel)
           → POST results to api.subth.com/internal/articles
           → Webhook/SSE แจ้ง Admin UI ว่าเสร็จแล้ว
```

---

## 9. API Endpoints (api.subth.com)

### ต้องเพิ่มใน gofiber_subth:

| Method | Endpoint | หน้าที่ |
|--------|----------|--------|
| POST | `/api/v1/admin/articles/generate` | Publish job to NATS |
| GET | `/api/v1/admin/articles/progress/:video_id` | SSE progress updates |
| POST | `/api/v1/internal/articles` | Worker saves article (internal) |
| PUT | `/api/v1/internal/articles/:video_id/status` | Update status |

### Internal API Auth
ใช้ Internal API Token แยกจาก Admin JWT เพื่อให้ Worker เรียกได้

---

## 10. Error Handling & Retry

```go
// Error classification
type ErrorType int

const (
    ErrorRetryable     ErrorType = iota // Network, timeout → retry
    ErrorNonRetryable                    // Invalid data, AI refused → DLQ
)

func classifyError(err error) ErrorType {
    // AI content policy violation หรือ invalid input
    if errors.Is(err, ErrInvalidData) || errors.Is(err, ErrContentBlocked) {
        return ErrorNonRetryable
    }
    // Network, API timeout, rate limit → retry
    return ErrorRetryable
}

// หมายเหตุ: SRT ต้องมีก่อนกดปุ่ม (validated ที่ Admin UI)
// ไม่ต้องมี ErrorDependency case
```

---

## 11. Monitoring & Observability

### Metrics (Prometheus)
- `seo_jobs_total{status="success|failed"}`
- `seo_job_duration_seconds`
- `seo_ai_tokens_used`
- `seo_stage_duration_seconds{stage="fetch|ai|tts|embedding|publish"}`

### Logging (slog)
```go
slog.InfoContext(ctx, "Job started", "video_id", job.VideoID)
slog.InfoContext(ctx, "AI completed", "video_id", job.VideoID, "tokens", tokenCount)
slog.ErrorContext(ctx, "Job failed", "video_id", job.VideoID, "error", err, "stage", stage)
```

### Alerting
- Job failed > 3 times → Discord webhook
- AI rate limit → Pause & alert
- Embedding failed → Alert (critical for semantic search)

---

## 12. Implementation Priority

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| **1** | Project setup, config, NATS consumer | 1 day |
| **2** | SRT/Metadata fetchers (HTTP clients) | 1 day |
| **3** | Gemini AI service + prompt engineering | 2 days |
| **4** | TTS service (ElevenLabs) | 0.5 day |
| **5** | Embedding service (pgvector) | 0.5 day |
| **6** | Article publisher + API endpoints | 1 day |
| **7** | Testing & integration | 1 day |

**Total: ~7 days**

---

## 13. Dependencies

### SRT Availability (Pre-validated)
```
✅ SRT ต้องมีก่อนกดปุ่ม Generate (validated ที่ Admin UI)

Admin UI Logic:
1. ปุ่ม "Generate Article" จะ disabled ถ้ายังไม่มี SRT
2. เมื่อ SRT พร้อม → ปุ่มจะ enabled
3. Admin กด → Publish job to NATS (return 202 Accepted)
4. Worker ดึง SRT ได้ทันที ไม่ต้องรอ
```

### External APIs
- `api.suekk.com/api/v1/subtitles/:code/th` - SRT file
- `api.subth.com/api/v1/videos/:id` - Video metadata
- `api.subth.com/api/v1/casts/:id` - Cast info
- `generativelanguage.googleapis.com` - Gemini API
- `api.elevenlabs.io` - TTS API

### pgvector Table (Filtered Similarity Search)
```sql
-- embeddings table สำหรับ semantic search + filtered search
CREATE TABLE article_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES videos(id),
    embedding vector(1536) NOT NULL,
    -- Metadata สำหรับ filtered search
    cast_ids UUID[] NOT NULL DEFAULT '{}',
    maker_id UUID,
    tag_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Index สำหรับ similarity search
CREATE INDEX ON article_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ตัวอย่าง query: หาเรื่องคล้ายกัน แต่ต้องเป็นนักแสดงคนเดียวกัน
SELECT v.*, 1 - (e.embedding <=> $1) as similarity
FROM article_embeddings e
JOIN videos v ON v.id = e.video_id
WHERE $2 = ANY(e.cast_ids)  -- Filter by cast
ORDER BY e.embedding <=> $1
LIMIT 10;
```

---

## 14. Gemini Prompt Strategy

### JSON Mode (Response Schema) - ป้องกัน Parsing Error

```go
// infrastructure/ai/gemini_client.go
func (c *GeminiClient) GenerateArticleContent(ctx context.Context, input AIInput) (*ArticleContent, error) {
    // ใช้ Gemini JSON Mode บังคับให้คืนค่าตาม Schema
    // ป้องกันปัญหา JSON malformed (ลืมปิดปีกกา, ตัวอักษรแปลก)

    model := c.client.GenerativeModel("gemini-1.5-pro")
    model.ResponseMIMEType = "application/json"
    model.ResponseSchema = &genai.Schema{
        Type: genai.TypeObject,
        Properties: map[string]*genai.Schema{
            "title":           {Type: genai.TypeString},
            "metaDescription": {Type: genai.TypeString},
            "summary":         {Type: genai.TypeString},
            "highlights":      {Type: genai.TypeArray, Items: &genai.Schema{Type: genai.TypeString}},
            "keyMoments":      {Type: genai.TypeArray, Items: &genai.Schema{...}},
            // ... กำหนด schema ครบทุก field
        },
        Required: []string{"title", "metaDescription", "summary", "highlights"},
    }

    resp, err := model.GenerateContent(ctx, genai.Text(buildPrompt(input)))
    // JSON unmarshal ได้ 100% เพราะ Gemini บังคับตาม schema
}
```

### Prompt Field Separation

```go
// แยกฟิลด์ตามประเภท:
// - ความคิดสร้างสรรค์สูง: summary, detailedReview, castBios
// - ความแม่นยำสูง: keyMoments (timestamps), qualityScore

const PromptTemplate = `
คุณเป็นผู้เชี่ยวชาญด้าน SEO Content สำหรับเว็บไซต์วิดีโอ

## Input Data
### SRT Transcript (ใช้สำหรับ timestamps):
{srt_content}

### Video Metadata:
- Code: {video_code}
- Duration: {duration} seconds
- Casts: {cast_names}
- Tags: {tags}
- Maker: {maker}

### Cast Previous Works (ใช้สำหรับเขียน bio):
{previous_works}

## Instructions

### ฟิลด์ที่ต้องการความแม่นยำ (Accuracy-Critical):
- keyMoments: ดึง timestamp จาก SRT โดยตรง ห้ามเดา
- qualityScore: ให้คะแนน 1-10 ตามเกณฑ์ที่กำหนด

### ฟิลด์ที่ต้องการความคิดสร้างสรรค์ (Creative):
- summary: เขียนเชิงวิเคราะห์ 500 คำ ภาษาไทยเป็นธรรมชาติ
- detailedReview: บทวิเคราะห์ยาว 800-1000 คำ
- castBios: เขียน bio โดยอิงจากผลงานก่อนหน้า

## Output Format
{... JSON schema ...}
`
```

---

## 15. Important Implementation Notes

### 15.1 Idempotency (ป้องกัน Duplicate)
```go
// ถ้า Admin กด Generate ซ้ำในรหัสเดิม → Update แทน Insert
// ใช้ ON CONFLICT ใน SQL

// infrastructure/publisher/article_publisher.go
const upsertArticleSQL = `
INSERT INTO articles (video_id, title, meta_description, summary, ...)
VALUES ($1, $2, $3, $4, ...)
ON CONFLICT (video_id) DO UPDATE SET
    title = EXCLUDED.title,
    meta_description = EXCLUDED.meta_description,
    summary = EXCLUDED.summary,
    updated_at = NOW()
RETURNING id
`

// หรือใน GORM
db.Clauses(clause.OnConflict{
    Columns:   []clause.Column{{Name: "video_id"}},
    DoUpdates: clause.AssignmentColumns([]string{"title", "summary", "updated_at"}),
}).Create(&article)
```

### 15.2 Gemini Model Selection
```go
// config/config.go
type GeminiConfig struct {
    APIKey string
    Model  string // "gemini-1.5-flash" or "gemini-1.5-pro"
}

// Development: ใช้ Flash (เร็ว, ประหยัด, ทดสอบ prompt)
// Production:  ใช้ Pro (ลึกซึ้ง, EEAT quality)

// .env.development
GEMINI_MODEL=gemini-1.5-flash

// .env.production
GEMINI_MODEL=gemini-1.5-pro
```

### 15.3 TTS Voice Identity (Brand Trustworthiness)
```go
// ใช้ Voice เดียวกันทั้งระบบ เพื่อสร้าง Brand Identity
// User จะจำได้ว่าเป็น "เสียงของ SubTH"

// config/config.go
type ElevenLabsConfig struct {
    APIKey  string
    VoiceID string // "flat2.0" - consistent voice for brand
}

// .env
ELEVENLABS_VOICE_ID=flat2.0
```

---

## 16. Workflow Summary (Final)

| ลำดับ | ขั้นตอน | สถานะ |
|-------|---------|-------|
| 1 | Admin กด "Generate" | ✅ Return 202 Accepted ทันที |
| 2 | Worker ดึง SRT + Metadata | 📥 Fetch from APIs |
| 3 | Gemini Process (JSON Mode) | 🤖 AI สกัด 28 fields |
| 4 | TTS + Embedding | ⚡ รันขนานพร้อมกัน |
| 5 | Upsert to api.subth.com | 🚀 ON CONFLICT → Update ถ้ามีอยู่แล้ว |

---

## Ready to Start Checklist

- [ ] Project structure created
- [ ] NATS JetStream stream "SEO_ARTICLES" configured
- [ ] Gemini API key ready (Flash for dev, Pro for prod)
- [ ] ElevenLabs API key + Voice ID "flat2.0"
- [ ] pgvector extension enabled in PostgreSQL
- [ ] Internal API token for Worker → api.subth.com

---

*Document created: 2026-02-22*
*Updated: 2026-02-22 (rcm4.txt + final recommendations)*
*Author: Claude Code*
