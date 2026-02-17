package postgres

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
)

type videoRepositoryImpl struct {
	db *gorm.DB
}

func NewVideoRepository(db *gorm.DB) repositories.VideoRepository {
	return &videoRepositoryImpl{db: db}
}

func (r *videoRepositoryImpl) Create(ctx context.Context, video *models.Video) error {
	return r.db.WithContext(ctx).Create(video).Error
}

func (r *videoRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Video, error) {
	var video models.Video
	err := r.db.WithContext(ctx).First(&video, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &video, nil
}

func (r *videoRepositoryImpl) Update(ctx context.Context, video *models.Video) error {
	return r.db.WithContext(ctx).Save(video).Error
}

func (r *videoRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Video{}, "id = ?", id).Error
}

func (r *videoRepositoryImpl) GetWithRelations(ctx context.Context, id uuid.UUID) (*models.Video, error) {
	var video models.Video
	err := r.db.WithContext(ctx).
		Preload("Categories").
		Preload("Categories.Translations").
		Preload("Maker").
		Preload("Translations").
		Preload("Casts").
		Preload("Casts.Translations").
		Preload("Tags").
		Preload("Tags.Translations").
		First(&video, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &video, nil
}

func (r *videoRepositoryImpl) List(ctx context.Context, params repositories.VideoListParams) ([]models.Video, int64, error) {
	var videos []models.Video
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Video{})

	// Filters
	if params.Category != "" {
		// Filter by category slug using many2many join table
		subQuery := r.db.Table("video_categories").
			Select("video_categories.video_id").
			Joins("JOIN categories ON categories.id = video_categories.category_id").
			Where("categories.slug = ? OR categories.name = ?", params.Category, params.Category)
		query = query.Where("id IN (?)", subQuery)
	}
	if params.MakerID != nil {
		query = query.Where("maker_id = ?", params.MakerID)
	}
	if len(params.AutoTags) > 0 {
		query = query.Where("auto_tags && ?", pq.Array(params.AutoTags))
	}

	// Search in translations
	if params.Search != "" {
		subQuery := r.db.Model(&models.VideoTranslation{}).
			Select("video_id").
			Where("title ILIKE ?", "%"+params.Search+"%")
		if params.Lang != "" {
			subQuery = subQuery.Where("lang = ?", params.Lang)
		}
		query = query.Where("id IN (?)", subQuery)
	}

	// Filter videos without Thai title
	if params.MissingTh {
		subQuery := r.db.Model(&models.VideoTranslation{}).
			Select("video_id").
			Where("lang = 'th'").
			Where("title IS NOT NULL AND title != ''")
		query = query.Where("id NOT IN (?)", subQuery)
	}

	// Count
	query.Count(&total)

	// Sort
	orderBy := "created_at"
	if params.SortBy != "" {
		// Map sort field names to actual column names
		switch params.SortBy {
		case "date":
			orderBy = "release_date"
		case "created_at":
			orderBy = "created_at"
		default:
			orderBy = "created_at"
		}
	}
	order := "DESC"
	if params.Order != "" {
		order = strings.ToUpper(params.Order)
	}
	query = query.Order(orderBy + " " + order)

	// Pagination
	query = query.Offset(params.Offset).Limit(params.Limit)

	// Preload relations
	query = query.Preload("Categories").Preload("Maker").Preload("Translations").Preload("Casts").Preload("Casts.Translations")

	err := query.Find(&videos).Error
	return videos, total, err
}

func (r *videoRepositoryImpl) CreateTranslation(ctx context.Context, trans *models.VideoTranslation) error {
	return r.db.WithContext(ctx).Create(trans).Error
}

func (r *videoRepositoryImpl) GetTranslations(ctx context.Context, videoID uuid.UUID) ([]models.VideoTranslation, error) {
	var translations []models.VideoTranslation
	err := r.db.WithContext(ctx).Where("video_id = ?", videoID).Find(&translations).Error
	return translations, err
}

func (r *videoRepositoryImpl) GetTranslation(ctx context.Context, videoID uuid.UUID, lang string) (*models.VideoTranslation, error) {
	var trans models.VideoTranslation
	err := r.db.WithContext(ctx).Where("video_id = ? AND lang = ?", videoID, lang).First(&trans).Error
	if err != nil {
		return nil, err
	}
	return &trans, nil
}

func (r *videoRepositoryImpl) UpdateTranslation(ctx context.Context, trans *models.VideoTranslation) error {
	return r.db.WithContext(ctx).Save(trans).Error
}

func (r *videoRepositoryImpl) DeleteTranslations(ctx context.Context, videoID uuid.UUID) error {
	return r.db.WithContext(ctx).Where("video_id = ?", videoID).Delete(&models.VideoTranslation{}).Error
}

func (r *videoRepositoryImpl) ClearAssociations(ctx context.Context, videoID uuid.UUID) error {
	db := r.db.WithContext(ctx)

	// ลบ many2many โดยตรงจาก join tables
	if err := db.Exec("DELETE FROM video_categories WHERE video_id = ?", videoID).Error; err != nil {
		return err
	}
	if err := db.Exec("DELETE FROM video_casts WHERE video_id = ?", videoID).Error; err != nil {
		return err
	}
	if err := db.Exec("DELETE FROM video_tags WHERE video_id = ?", videoID).Error; err != nil {
		return err
	}
	return nil
}

func (r *videoRepositoryImpl) GetRandom(ctx context.Context, limit int) ([]models.Video, error) {
	var videos []models.Video
	err := r.db.WithContext(ctx).
		Preload("Categories").
		Preload("Maker").
		Preload("Translations").
		Order("RANDOM()").
		Limit(limit).
		Find(&videos).Error
	return videos, err
}

func (r *videoRepositoryImpl) SearchByTitle(ctx context.Context, query string, lang string, limit int, offset int) ([]models.Video, int64, error) {
	var videos []models.Video
	var total int64

	// ค้นหาจาก video title
	titleSubQuery := r.db.Model(&models.VideoTranslation{}).
		Select("video_id").
		Where("title ILIKE ?", "%"+query+"%")

	// ค้นหาจาก cast name (English) และ cast translations (Thai, Japanese, etc.)
	castSubQuery := r.db.Table("video_casts").
		Select("video_casts.video_id").
		Joins("JOIN casts ON casts.id = video_casts.cast_id").
		Joins("LEFT JOIN cast_translations ON cast_translations.cast_id = casts.id").
		Where("casts.name ILIKE ? OR casts.slug ILIKE ? OR cast_translations.name ILIKE ?",
			"%"+query+"%", "%"+query+"%", "%"+query+"%")

	// รวม query ทั้งสอง
	q := r.db.WithContext(ctx).
		Model(&models.Video{}).
		Where("id IN (?) OR id IN (?)", titleSubQuery, castSubQuery)

	q.Count(&total)

	err := q.
		Preload("Categories").
		Preload("Maker").
		Preload("Translations").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&videos).Error

	return videos, total, err
}

func (r *videoRepositoryImpl) GetByMakerID(ctx context.Context, makerID uuid.UUID, limit int, offset int) ([]models.Video, int64, error) {
	var videos []models.Video
	var total int64

	q := r.db.WithContext(ctx).Model(&models.Video{}).Where("maker_id = ?", makerID)
	q.Count(&total)

	err := q.
		Preload("Categories").
		Preload("Maker").
		Preload("Translations").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&videos).Error

	return videos, total, err
}

func (r *videoRepositoryImpl) GetByCastID(ctx context.Context, castID uuid.UUID, limit int, offset int) ([]models.Video, int64, error) {
	var videos []models.Video
	var total int64

	subQuery := r.db.Table("video_casts").Select("video_id").Where("cast_id = ?", castID)

	q := r.db.WithContext(ctx).Model(&models.Video{}).Where("id IN (?)", subQuery)
	q.Count(&total)

	err := q.
		Preload("Categories").
		Preload("Maker").
		Preload("Translations").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&videos).Error

	return videos, total, err
}

func (r *videoRepositoryImpl) GetByTagID(ctx context.Context, tagID uuid.UUID, limit int, offset int) ([]models.Video, int64, error) {
	var videos []models.Video
	var total int64

	subQuery := r.db.Table("video_tags").Select("video_id").Where("tag_id = ?", tagID)

	q := r.db.WithContext(ctx).Model(&models.Video{}).Where("id IN (?)", subQuery)
	q.Count(&total)

	err := q.
		Preload("Categories").
		Preload("Maker").
		Preload("Translations").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&videos).Error

	return videos, total, err
}

func (r *videoRepositoryImpl) GetByAutoTags(ctx context.Context, tags []string, limit int, offset int) ([]models.Video, int64, error) {
	var videos []models.Video
	var total int64

	q := r.db.WithContext(ctx).Model(&models.Video{}).Where("auto_tags && ?", pq.Array(tags))
	q.Count(&total)

	err := q.
		Preload("Categories").
		Preload("Maker").
		Preload("Translations").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&videos).Error

	return videos, total, err
}

func (r *videoRepositoryImpl) AddCasts(ctx context.Context, videoID uuid.UUID, casts []models.Cast) error {
	if len(casts) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Model(&models.Video{ID: videoID}).Association("Casts").Append(casts)
}

func (r *videoRepositoryImpl) AddTags(ctx context.Context, videoID uuid.UUID, tags []models.Tag) error {
	if len(tags) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Model(&models.Video{ID: videoID}).Association("Tags").Append(tags)
}

// GetWithReels returns videos that have reels (has_reel = true)
func (r *videoRepositoryImpl) GetWithReels(ctx context.Context, limit int, offset int) ([]models.Video, int64, error) {
	var videos []models.Video
	var total int64

	q := r.db.WithContext(ctx).Model(&models.Video{}).Where("has_reel = ?", true)
	q.Count(&total)

	err := q.
		Preload("Translations").
		Preload("Tags").
		Preload("Tags.Translations").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&videos).Error

	return videos, total, err
}

func (r *videoRepositoryImpl) AddCategories(ctx context.Context, videoID uuid.UUID, categories []models.Category) error {
	if len(categories) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Model(&models.Video{ID: videoID}).Association("Categories").Append(categories)
}

func (r *videoRepositoryImpl) ReplaceCategories(ctx context.Context, videoID uuid.UUID, categories []models.Category) error {
	return r.db.WithContext(ctx).Model(&models.Video{ID: videoID}).Association("Categories").Replace(categories)
}

// GetTitlesByIDs returns a map of video IDs to their Thai titles
func (r *videoRepositoryImpl) GetTitlesByIDs(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID]string, error) {
	if len(ids) == 0 {
		return make(map[uuid.UUID]string), nil
	}

	var results []struct {
		VideoID uuid.UUID
		Title   string
	}

	err := r.db.WithContext(ctx).
		Table("video_translations").
		Select("video_id, title").
		Where("video_id IN ? AND language = ?", ids, "th").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	titleMap := make(map[uuid.UUID]string, len(results))
	for _, r := range results {
		titleMap[r.VideoID] = r.Title
	}

	return titleMap, nil
}
