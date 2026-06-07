-- =====================================================
-- Hybrid Search: Materialized View + Indexes
-- =====================================================

-- Drop if exists (for re-running)
DROP MATERIALIZED VIEW IF EXISTS video_search_view;

-- Create materialized view for hybrid search
-- NOTE: Removed categories reference to avoid GORM migration conflict
CREATE MATERIALIZED VIEW video_search_view AS
SELECT
    v.id,
    v.thumbnail,
    v.image_embedding,
    v.combined_embedding,
    v.auto_tags,
    v.created_at,
    vt_en.title as title_en,
    vt_th.title as title_th,
    m.name as maker_name,
    m.slug as maker_slug,
    COALESCE(
        (SELECT string_agg(ca.name, ', ' ORDER BY ca.name)
         FROM video_casts vc
         JOIN casts ca ON vc.cast_id = ca.id
         WHERE vc.video_id = v.id),
        ''
    ) as cast_names,
    COALESCE(
        (SELECT string_agg(t.name, ', ' ORDER BY t.name)
         FROM video_tags vt
         JOIN tags t ON vt.tag_id = t.id
         WHERE vt.video_id = v.id),
        ''
    ) as tag_names,
    array_to_string(v.auto_tags, ', ') as auto_tags_text
FROM videos v
LEFT JOIN video_translations vt_en ON v.id = vt_en.video_id AND vt_en.lang = 'en'
LEFT JOIN video_translations vt_th ON v.id = vt_th.video_id AND vt_th.lang = 'th'
LEFT JOIN makers m ON v.maker_id = m.id;

-- Create unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX idx_video_search_view_id ON video_search_view(id);

-- Index for vector similarity search (combined_embedding)
CREATE INDEX idx_video_search_view_combined_embedding ON video_search_view
    USING ivfflat (combined_embedding vector_cosine_ops) WITH (lists = 100);

-- Index for vector similarity search (image_embedding)
CREATE INDEX idx_video_search_view_image_embedding ON video_search_view
    USING ivfflat (image_embedding vector_cosine_ops) WITH (lists = 100);

-- Index for text search on cast_names
CREATE INDEX idx_video_search_view_cast_names ON video_search_view
    USING GIN(to_tsvector('simple', cast_names));

-- Index for text search on maker_name
CREATE INDEX idx_video_search_view_maker_name ON video_search_view
    USING GIN(to_tsvector('simple', COALESCE(maker_name, '')));

-- Index for text search on titles
CREATE INDEX idx_video_search_view_title_en ON video_search_view
    USING GIN(to_tsvector('simple', COALESCE(title_en, '')));

CREATE INDEX idx_video_search_view_title_th ON video_search_view
    USING GIN(to_tsvector('simple', COALESCE(title_th, '')));

-- Index for ordering by created_at
CREATE INDEX idx_video_search_view_created_at ON video_search_view(created_at DESC);

-- Verify
SELECT COUNT(*) as total_videos FROM video_search_view;

-- Show sample data
SELECT
    id,
    LEFT(title_th, 50) as title,
    maker_name,
    LEFT(cast_names, 50) as casts,
    LEFT(auto_tags_text, 30) as auto_tags
FROM video_search_view
LIMIT 5;
