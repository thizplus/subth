package postgres

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"gorm.io/gorm"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
)

type castRepositoryImpl struct {
	db *gorm.DB
}

func NewCastRepository(db *gorm.DB) repositories.CastRepository {
	return &castRepositoryImpl{db: db}
}

func (r *castRepositoryImpl) Create(ctx context.Context, cast *models.Cast) error {
	return r.db.WithContext(ctx).Create(cast).Error
}

func (r *castRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Cast, error) {
	var cast models.Cast
	err := r.db.WithContext(ctx).Preload("Translations").First(&cast, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &cast, nil
}

func (r *castRepositoryImpl) GetBySlug(ctx context.Context, s string) (*models.Cast, error) {
	var cast models.Cast
	err := r.db.WithContext(ctx).Preload("Translations").First(&cast, "slug = ?", s).Error
	if err != nil {
		return nil, err
	}
	return &cast, nil
}

func (r *castRepositoryImpl) GetByName(ctx context.Context, name string) (*models.Cast, error) {
	var cast models.Cast
	err := r.db.WithContext(ctx).First(&cast, "name = ?", name).Error
	if err != nil {
		return nil, err
	}
	return &cast, nil
}

func (r *castRepositoryImpl) Update(ctx context.Context, cast *models.Cast) error {
	return r.db.WithContext(ctx).Save(cast).Error
}

func (r *castRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Cast{}, "id = ?", id).Error
}

func (r *castRepositoryImpl) List(ctx context.Context, params repositories.CastListParams) ([]models.Cast, int64, error) {
	var casts []models.Cast
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Cast{})

	// Filter only casts with published articles
	if params.HasArticles {
		subQuery := r.db.Table("video_casts").
			Select("DISTINCT video_casts.cast_id").
			Joins("JOIN videos ON videos.id = video_casts.video_id").
			Joins("JOIN articles ON articles.video_id = videos.id").
			Where("articles.status = ?", "published")
		query = query.Where("id IN (?)", subQuery)
	}

	// Filter by IDs (batch fetch mode) - takes priority over search
	if len(params.IDs) > 0 {
		query = query.Where("id IN ?", params.IDs)
	} else if params.Search != "" {
		if params.Lang != "" && params.Lang != "en" {
			// Search in translations
			subQuery := r.db.Model(&models.CastTranslation{}).
				Select("cast_id").
				Where("name ILIKE ? AND lang = ?", "%"+params.Search+"%", params.Lang)
			query = query.Where("id IN (?) OR name ILIKE ?", subQuery, "%"+params.Search+"%")
		} else {
			query = query.Where("name ILIKE ?", "%"+params.Search+"%")
		}
	}

	query.Count(&total)

	orderBy := "name"
	if params.SortBy != "" {
		orderBy = params.SortBy
	}
	order := "ASC"
	if params.Order != "" {
		order = strings.ToUpper(params.Order)
	}
	query = query.Order(orderBy + " " + order)

	err := query.Preload("Translations").Offset(params.Offset).Limit(params.Limit).Find(&casts).Error
	return casts, total, err
}

func (r *castRepositoryImpl) Search(ctx context.Context, query string, lang string, limit int) ([]models.Cast, error) {
	var casts []models.Cast
	q := r.db.WithContext(ctx)

	if lang != "" && lang != "en" {
		subQuery := r.db.Model(&models.CastTranslation{}).
			Select("cast_id").
			Where("name ILIKE ? AND lang = ?", "%"+query+"%", lang)
		q = q.Where("id IN (?) OR name ILIKE ?", subQuery, "%"+query+"%")
	} else {
		q = q.Where("name ILIKE ?", "%"+query+"%")
	}

	err := q.Preload("Translations").Order("video_count DESC").Limit(limit).Find(&casts).Error
	return casts, err
}

func (r *castRepositoryImpl) IncrementVideoCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.Cast{}).
		Where("id = ?", id).
		UpdateColumn("video_count", gorm.Expr("video_count + 1")).Error
}

func (r *castRepositoryImpl) DecrementVideoCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.Cast{}).
		Where("id = ?", id).
		UpdateColumn("video_count", gorm.Expr("GREATEST(video_count - 1, 0)")).Error
}

func (r *castRepositoryImpl) GetOrCreateByName(ctx context.Context, name string) (*models.Cast, error) {
	var cast models.Cast
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&cast).Error
	if err == nil {
		return &cast, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	cast = models.Cast{
		Name: name,
		Slug: slug.Make(name),
	}
	if err := r.db.WithContext(ctx).Create(&cast).Error; err != nil {
		return nil, err
	}
	return &cast, nil
}

func (r *castRepositoryImpl) CreateTranslation(ctx context.Context, trans *models.CastTranslation) error {
	return r.db.WithContext(ctx).Create(trans).Error
}

func (r *castRepositoryImpl) GetTranslations(ctx context.Context, castID uuid.UUID) ([]models.CastTranslation, error) {
	var translations []models.CastTranslation
	err := r.db.WithContext(ctx).Where("cast_id = ?", castID).Find(&translations).Error
	return translations, err
}

func (r *castRepositoryImpl) GetTranslation(ctx context.Context, castID uuid.UUID, lang string) (*models.CastTranslation, error) {
	var trans models.CastTranslation
	err := r.db.WithContext(ctx).Where("cast_id = ? AND lang = ?", castID, lang).First(&trans).Error
	if err != nil {
		return nil, err
	}
	return &trans, nil
}

func (r *castRepositoryImpl) DeleteTranslationsByCastID(ctx context.Context, castID uuid.UUID) error {
	return r.db.WithContext(ctx).Where("cast_id = ?", castID).Delete(&models.CastTranslation{}).Error
}

// GetNamesByIDs returns a map of cast IDs to their names (prefer Thai translation)
func (r *castRepositoryImpl) GetNamesByIDs(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID]string, error) {
	if len(ids) == 0 {
		return make(map[uuid.UUID]string), nil
	}

	// First get Thai translations
	var translations []struct {
		CastID uuid.UUID
		Name   string
	}
	err := r.db.WithContext(ctx).
		Model(&models.CastTranslation{}).
		Select("cast_id, name").
		Where("cast_id IN ? AND lang = ?", ids, "th").
		Scan(&translations).Error
	if err != nil {
		return nil, err
	}

	result := make(map[uuid.UUID]string)
	for _, t := range translations {
		result[t.CastID] = t.Name
	}

	// Fill missing with English names
	missingIDs := make([]uuid.UUID, 0)
	for _, id := range ids {
		if _, ok := result[id]; !ok {
			missingIDs = append(missingIDs, id)
		}
	}

	if len(missingIDs) > 0 {
		var casts []struct {
			ID   uuid.UUID
			Name string
		}
		err := r.db.WithContext(ctx).
			Model(&models.Cast{}).
			Select("id, name").
			Where("id IN ?", missingIDs).
			Scan(&casts).Error
		if err != nil {
			return nil, err
		}
		for _, c := range casts {
			result[c.ID] = c.Name
		}
	}

	return result, nil
}
