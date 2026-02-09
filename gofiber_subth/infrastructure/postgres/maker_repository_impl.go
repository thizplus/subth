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

type makerRepositoryImpl struct {
	db *gorm.DB
}

func NewMakerRepository(db *gorm.DB) repositories.MakerRepository {
	return &makerRepositoryImpl{db: db}
}

func (r *makerRepositoryImpl) Create(ctx context.Context, maker *models.Maker) error {
	return r.db.WithContext(ctx).Create(maker).Error
}

func (r *makerRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Maker, error) {
	var maker models.Maker
	err := r.db.WithContext(ctx).First(&maker, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &maker, nil
}

func (r *makerRepositoryImpl) GetBySlug(ctx context.Context, s string) (*models.Maker, error) {
	var maker models.Maker
	err := r.db.WithContext(ctx).First(&maker, "slug = ?", s).Error
	if err != nil {
		return nil, err
	}
	return &maker, nil
}

func (r *makerRepositoryImpl) GetByName(ctx context.Context, name string) (*models.Maker, error) {
	var maker models.Maker
	err := r.db.WithContext(ctx).First(&maker, "name = ?", name).Error
	if err != nil {
		return nil, err
	}
	return &maker, nil
}

func (r *makerRepositoryImpl) Update(ctx context.Context, maker *models.Maker) error {
	return r.db.WithContext(ctx).Save(maker).Error
}

func (r *makerRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Maker{}, "id = ?", id).Error
}

func (r *makerRepositoryImpl) List(ctx context.Context, params repositories.MakerListParams) ([]models.Maker, int64, error) {
	var makers []models.Maker
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Maker{})

	if params.Search != "" {
		query = query.Where("name ILIKE ?", "%"+params.Search+"%")
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

	err := query.Offset(params.Offset).Limit(params.Limit).Find(&makers).Error
	return makers, total, err
}

func (r *makerRepositoryImpl) Search(ctx context.Context, query string, limit int) ([]models.Maker, error) {
	var makers []models.Maker
	err := r.db.WithContext(ctx).
		Where("name ILIKE ?", "%"+query+"%").
		Order("video_count DESC").
		Limit(limit).
		Find(&makers).Error
	return makers, err
}

func (r *makerRepositoryImpl) IncrementVideoCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.Maker{}).
		Where("id = ?", id).
		UpdateColumn("video_count", gorm.Expr("video_count + 1")).Error
}

func (r *makerRepositoryImpl) DecrementVideoCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.Maker{}).
		Where("id = ?", id).
		UpdateColumn("video_count", gorm.Expr("GREATEST(video_count - 1, 0)")).Error
}

func (r *makerRepositoryImpl) GetOrCreateByName(ctx context.Context, name string) (*models.Maker, error) {
	var maker models.Maker
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&maker).Error
	if err == nil {
		return &maker, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Create new
	maker = models.Maker{
		Name: name,
		Slug: slug.Make(name),
	}
	if err := r.db.WithContext(ctx).Create(&maker).Error; err != nil {
		return nil, err
	}
	return &maker, nil
}
