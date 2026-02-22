package postgres

import (
	"context"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
)

type UserRepositoryImpl struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) repositories.UserRepository {
	return &UserRepositoryImpl{db: db}
}

func (r *UserRepositoryImpl) Create(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *UserRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepositoryImpl) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepositoryImpl) GetByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepositoryImpl) GetByGoogleID(ctx context.Context, googleID string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("google_id = ?", googleID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepositoryImpl) Update(ctx context.Context, id uuid.UUID, user *models.User) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Updates(user).Error
}

func (r *UserRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&models.User{}).Error
}

func (r *UserRepositoryImpl) List(ctx context.Context, offset, limit int) ([]*models.User, error) {
	var users []*models.User
	err := r.db.WithContext(ctx).Order("created_at DESC").Offset(offset).Limit(limit).Find(&users).Error
	return users, err
}

func (r *UserRepositoryImpl) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.User{}).Count(&count).Error
	return count, err
}

func (r *UserRepositoryImpl) ListWithSearch(ctx context.Context, search string, role string, offset, limit int) ([]*models.User, int64, error) {
	var users []*models.User
	var count int64

	query := r.db.WithContext(ctx).Model(&models.User{})

	// Search filter - ค้นหาจาก email, username, displayName, firstName, lastName
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where(
			"email ILIKE ? OR username ILIKE ? OR display_name ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
		)
	}

	// Role filter
	if role != "" {
		query = query.Where("role = ?", role)
	}

	// Count total
	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&users).Error
	return users, count, err
}

func (r *UserRepositoryImpl) CountNewToday(ctx context.Context) (int64, error) {
	var count int64
	today := "DATE(created_at) = CURRENT_DATE"
	err := r.db.WithContext(ctx).Model(&models.User{}).Where(today).Count(&count).Error
	return count, err
}

func (r *UserRepositoryImpl) CountNewThisWeek(ctx context.Context) (int64, error) {
	var count int64
	thisWeek := "created_at >= DATE_TRUNC('week', CURRENT_DATE)"
	err := r.db.WithContext(ctx).Model(&models.User{}).Where(thisWeek).Count(&count).Error
	return count, err
}