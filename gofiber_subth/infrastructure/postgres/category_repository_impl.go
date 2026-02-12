package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
)

type CategoryRepositoryImpl struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) repositories.CategoryRepository {
	return &CategoryRepositoryImpl{db: db}
}

func (r *CategoryRepositoryImpl) Create(ctx context.Context, category *models.Category) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *CategoryRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Category, error) {
	var category models.Category
	err := r.db.WithContext(ctx).
		Preload("Translations").
		First(&category, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepositoryImpl) GetBySlug(ctx context.Context, slugStr string) (*models.Category, error) {
	var category models.Category
	err := r.db.WithContext(ctx).
		Preload("Translations").
		First(&category, "slug = ?", slugStr).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepositoryImpl) GetByName(ctx context.Context, name string) (*models.Category, error) {
	var category models.Category
	err := r.db.WithContext(ctx).
		Preload("Translations").
		First(&category, "name = ?", name).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepositoryImpl) GetOrCreate(ctx context.Context, nameOrSlug string) (*models.Category, error) {
	if nameOrSlug == "" {
		return nil, nil
	}

	// Try to find existing category by slug first, then by name
	var existing models.Category
	err := r.db.WithContext(ctx).First(&existing, "slug = ? OR name = ?", nameOrSlug, nameOrSlug).Error
	if err == nil {
		return &existing, nil
	}

	// Not found - create new category
	slugStr := slug.Make(nameOrSlug)
	category := &models.Category{
		ID:   uuid.New(),
		Name: nameOrSlug,
		Slug: slugStr,
	}

	// Upsert: create or get existing
	err = r.db.WithContext(ctx).
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "slug"}},
			DoNothing: true,
		}).
		Create(category).Error
	if err != nil {
		return nil, err
	}

	// Get the actual record (might be existing)
	err = r.db.WithContext(ctx).First(&existing, "slug = ?", slugStr).Error
	if err != nil {
		return nil, err
	}

	return &existing, nil
}

func (r *CategoryRepositoryImpl) List(ctx context.Context) ([]*models.Category, error) {
	var categories []*models.Category
	err := r.db.WithContext(ctx).
		Preload("Translations").
		Order("video_count DESC").
		Find(&categories).Error
	return categories, err
}

func (r *CategoryRepositoryImpl) Update(ctx context.Context, category *models.Category) error {
	return r.db.WithContext(ctx).Save(category).Error
}

func (r *CategoryRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Category{}, "id = ?", id).Error
}

func (r *CategoryRepositoryImpl) UpdateVideoCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Exec(`
		UPDATE categories SET video_count = (
			SELECT COUNT(*) FROM video_categories WHERE video_categories.category_id = categories.id
		) WHERE id = ?
	`, id).Error
}

func (r *CategoryRepositoryImpl) IncrementVideoCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Exec(`
		UPDATE categories SET video_count = video_count + 1 WHERE id = ?
	`, id).Error
}

func (r *CategoryRepositoryImpl) DecrementVideoCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Exec(`
		UPDATE categories SET video_count = GREATEST(video_count - 1, 0) WHERE id = ?
	`, id).Error
}

// RefreshAllVideoCounts นับ video_count ใหม่ทุก category (ลบ orphan records ด้วย)
func (r *CategoryRepositoryImpl) RefreshAllVideoCounts(ctx context.Context) error {
	// ลบ orphan records จาก video_categories (video ถูกลบไปแล้ว)
	if err := r.db.WithContext(ctx).Exec(`
		DELETE FROM video_categories
		WHERE video_id NOT IN (SELECT id FROM videos)
	`).Error; err != nil {
		return err
	}

	// Update video_count ทุก category
	return r.db.WithContext(ctx).Exec(`
		UPDATE categories SET video_count = (
			SELECT COUNT(*) FROM video_categories WHERE video_categories.category_id = categories.id
		)
	`).Error
}

func (r *CategoryRepositoryImpl) CreateTranslation(ctx context.Context, trans *models.CategoryTranslation) error {
	return r.db.WithContext(ctx).Create(trans).Error
}

func (r *CategoryRepositoryImpl) DeleteTranslationsByCategoryID(ctx context.Context, categoryID uuid.UUID) error {
	return r.db.WithContext(ctx).Where("category_id = ?", categoryID).Delete(&models.CategoryTranslation{}).Error
}
