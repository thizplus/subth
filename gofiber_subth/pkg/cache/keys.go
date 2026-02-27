package cache

import (
	"fmt"
	"time"
)

// Cache TTL settings
const (
	ArticleCacheTTL     = 60 * time.Minute // 1 hour for single article
	ArticleListCacheTTL = 30 * time.Minute // 30 min for list pages
)

// ArticleKey returns cache key for single article (default language: th)
// Format: article:{type}:{slug}
func ArticleKey(articleType, slug string) string {
	return fmt.Sprintf("article:%s:%s", articleType, slug)
}

// ArticleKeyWithLang returns cache key for single article with language
// Format: article:{type}:{slug}:{lang}
func ArticleKeyWithLang(articleType, slug, lang string) string {
	if lang == "" {
		lang = "th"
	}
	return fmt.Sprintf("article:%s:%s:%s", articleType, slug, lang)
}

// ArticleListKey returns cache key for article list
// Format: article:list:{page}:{limit}
func ArticleListKey(page, limit int) string {
	return fmt.Sprintf("article:list:%d:%d", page, limit)
}

// ArticleByCastKey returns cache key for articles by cast
// Format: article:cast:{slug}:{page}
func ArticleByCastKey(castSlug string, page int) string {
	return fmt.Sprintf("article:cast:%s:%d", castSlug, page)
}

// ArticleByTagKey returns cache key for articles by tag
// Format: article:tag:{slug}:{page}
func ArticleByTagKey(tagSlug string, page int) string {
	return fmt.Sprintf("article:tag:%s:%d", tagSlug, page)
}

// ArticleByMakerKey returns cache key for articles by maker
// Format: article:maker:{slug}:{page}
func ArticleByMakerKey(makerSlug string, page int) string {
	return fmt.Sprintf("article:maker:%s:%d", makerSlug, page)
}
