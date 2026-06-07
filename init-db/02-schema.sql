-- =====================================================
-- SupJav Database Schema
-- =====================================================

-- 1. Makers (Studios)
CREATE TABLE makers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    video_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_makers_slug ON makers(slug);
CREATE INDEX idx_makers_name ON makers USING gin(name gin_trgm_ops);

-- 2. Casts (Actresses)
CREATE TABLE casts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    video_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_casts_slug ON casts(slug);
CREATE INDEX idx_casts_name ON casts USING gin(name gin_trgm_ops);

-- 3. Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    video_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);

-- 4. Tag Translations
CREATE TABLE tag_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    lang VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tag_id, lang)
);

CREATE INDEX idx_tag_trans_tag_id ON tag_translations(tag_id);
CREATE INDEX idx_tag_trans_lang ON tag_translations(lang);

-- 4.1 Cast Translations
CREATE TABLE cast_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cast_id UUID NOT NULL REFERENCES casts(id) ON DELETE CASCADE,
    lang VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(cast_id, lang)
);

CREATE INDEX idx_cast_trans_cast_id ON cast_translations(cast_id);
CREATE INDEX idx_cast_trans_lang ON cast_translations(lang);

-- 5. Auto Tag Labels (CLIP generated tags - fixed vocabulary)
CREATE TABLE auto_tag_labels (
    key VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_th VARCHAR(100),
    name_ja VARCHAR(100),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Videos (Main table)
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50),
    thumbnail VARCHAR(255),
    category VARCHAR(100),
    release_date DATE,
    maker_id UUID REFERENCES makers(id) ON DELETE SET NULL,

    -- CLIP vectors
    image_embedding vector(512),
    auto_tags TEXT[],

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Partial unique index for code (allow NULLs)
CREATE UNIQUE INDEX idx_videos_code ON videos(code) WHERE code IS NOT NULL;
CREATE INDEX idx_videos_maker_id ON videos(maker_id);
CREATE INDEX idx_videos_release_date ON videos(release_date DESC);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_auto_tags ON videos USING gin(auto_tags);

-- 7. Video Translations (Multi-language titles)
CREATE TABLE video_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    lang VARCHAR(5) NOT NULL,
    title TEXT NOT NULL,
    title_embedding vector(1024),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(video_id, lang)
);

CREATE INDEX idx_video_trans_video_id ON video_translations(video_id);
CREATE INDEX idx_video_trans_lang ON video_translations(lang);
CREATE INDEX idx_video_trans_title_fts ON video_translations USING gin(to_tsvector('simple', title));

-- 8. Video Casts (Junction table)
CREATE TABLE video_casts (
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    cast_id UUID REFERENCES casts(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, cast_id)
);

CREATE INDEX idx_video_casts_cast_id ON video_casts(cast_id);

-- 9. Video Tags (Junction table)
CREATE TABLE video_tags (
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, tag_id)
);

CREATE INDEX idx_video_tags_tag_id ON video_tags(tag_id);

-- =====================================================
-- Vector indexes (create after data import for better performance)
-- =====================================================
-- Note: Create these AFTER importing data
-- CREATE INDEX idx_videos_image_embedding ON videos
--     USING ivfflat (image_embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX idx_video_trans_embedding ON video_translations
--     USING ivfflat (title_embedding vector_cosine_ops) WITH (lists = 100);

-- =====================================================
-- Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_makers_updated_at BEFORE UPDATE ON makers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_casts_updated_at BEFORE UPDATE ON casts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_trans_updated_at BEFORE UPDATE ON video_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Summary
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Schema created successfully!';
    RAISE NOTICE 'Tables: makers, casts, tags, tag_translations, auto_tag_labels, videos, video_translations, video_casts, video_tags';
END $$;
