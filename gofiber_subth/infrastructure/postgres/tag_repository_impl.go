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

type tagRepositoryImpl struct {
	db *gorm.DB
}

func NewTagRepository(db *gorm.DB) repositories.TagRepository {
	return &tagRepositoryImpl{db: db}
}

func (r *tagRepositoryImpl) Create(ctx context.Context, tag *models.Tag) error {
	return r.db.WithContext(ctx).Create(tag).Error
}

func (r *tagRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Tag, error) {
	var tag models.Tag
	err := r.db.WithContext(ctx).Preload("Translations").First(&tag, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepositoryImpl) GetBySlug(ctx context.Context, s string) (*models.Tag, error) {
	var tag models.Tag
	err := r.db.WithContext(ctx).Preload("Translations").First(&tag, "slug = ?", s).Error
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepositoryImpl) GetByName(ctx context.Context, name string) (*models.Tag, error) {
	var tag models.Tag
	err := r.db.WithContext(ctx).First(&tag, "name = ?", name).Error
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepositoryImpl) Update(ctx context.Context, tag *models.Tag) error {
	return r.db.WithContext(ctx).Save(tag).Error
}

func (r *tagRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Tag{}, "id = ?", id).Error
}

func (r *tagRepositoryImpl) List(ctx context.Context, params repositories.TagListParams) ([]models.Tag, int64, error) {
	var tags []models.Tag
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Tag{})

	// Filter by IDs (batch fetch mode) - takes priority over search
	if len(params.IDs) > 0 {
		query = query.Where("id IN ?", params.IDs)
	} else if params.Search != "" {
		if params.Lang != "" && params.Lang != "en" {
			// Search in translations
			subQuery := r.db.Model(&models.TagTranslation{}).
				Select("tag_id").
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

	err := query.Preload("Translations").Offset(params.Offset).Limit(params.Limit).Find(&tags).Error
	return tags, total, err
}

func (r *tagRepositoryImpl) Search(ctx context.Context, query string, lang string, limit int) ([]models.Tag, error) {
	var tags []models.Tag
	q := r.db.WithContext(ctx)

	if lang != "" && lang != "en" {
		subQuery := r.db.Model(&models.TagTranslation{}).
			Select("tag_id").
			Where("name ILIKE ? AND lang = ?", "%"+query+"%", lang)
		q = q.Where("id IN (?) OR name ILIKE ?", subQuery, "%"+query+"%")
	} else {
		q = q.Where("name ILIKE ?", "%"+query+"%")
	}

	err := q.Preload("Translations").Order("video_count DESC").Limit(limit).Find(&tags).Error
	return tags, err
}

func (r *tagRepositoryImpl) IncrementVideoCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.Tag{}).
		Where("id = ?", id).
		UpdateColumn("video_count", gorm.Expr("video_count + 1")).Error
}

func (r *tagRepositoryImpl) DecrementVideoCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.Tag{}).
		Where("id = ?", id).
		UpdateColumn("video_count", gorm.Expr("GREATEST(video_count - 1, 0)")).Error
}

func (r *tagRepositoryImpl) GetOrCreateByName(ctx context.Context, name string) (*models.Tag, error) {
	var tag models.Tag
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&tag).Error
	if err == nil {
		return &tag, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	tag = models.Tag{
		Name: name,
		Slug: slug.Make(name),
	}
	if err := r.db.WithContext(ctx).Create(&tag).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepositoryImpl) CreateTranslation(ctx context.Context, trans *models.TagTranslation) error {
	return r.db.WithContext(ctx).Create(trans).Error
}

func (r *tagRepositoryImpl) GetTranslations(ctx context.Context, tagID uuid.UUID) ([]models.TagTranslation, error) {
	var translations []models.TagTranslation
	err := r.db.WithContext(ctx).Where("tag_id = ?", tagID).Find(&translations).Error
	return translations, err
}

func (r *tagRepositoryImpl) GetTranslation(ctx context.Context, tagID uuid.UUID, lang string) (*models.TagTranslation, error) {
	var trans models.TagTranslation
	err := r.db.WithContext(ctx).Where("tag_id = ? AND lang = ?", tagID, lang).First(&trans).Error
	if err != nil {
		return nil, err
	}
	return &trans, nil
}

func (r *tagRepositoryImpl) DeleteTranslationsByTagID(ctx context.Context, tagID uuid.UUID) error {
	return r.db.WithContext(ctx).Where("tag_id = ?", tagID).Delete(&models.TagTranslation{}).Error
}

// GetNamesByIDs returns a map of tag IDs to their names (prefer Thai translation)
func (r *tagRepositoryImpl) GetNamesByIDs(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID]string, error) {
	if len(ids) == 0 {
		return make(map[uuid.UUID]string), nil
	}

	// First get Thai translations
	var translations []struct {
		TagID uuid.UUID
		Name  string
	}
	err := r.db.WithContext(ctx).
		Model(&models.TagTranslation{}).
		Select("tag_id, name").
		Where("tag_id IN ? AND lang = ?", ids, "th").
		Scan(&translations).Error
	if err != nil {
		return nil, err
	}

	result := make(map[uuid.UUID]string)
	for _, t := range translations {
		result[t.TagID] = t.Name
	}

	// Fill missing with English names
	missingIDs := make([]uuid.UUID, 0)
	for _, id := range ids {
		if _, ok := result[id]; !ok {
			missingIDs = append(missingIDs, id)
		}
	}

	if len(missingIDs) > 0 {
		var tags []struct {
			ID   uuid.UUID
			Name string
		}
		err := r.db.WithContext(ctx).
			Model(&models.Tag{}).
			Select("id, name").
			Where("id IN ?", missingIDs).
			Scan(&tags).Error
		if err != nil {
			return nil, err
		}
		for _, t := range tags {
			result[t.ID] = t.Name
		}
	}

	return result, nil
}
