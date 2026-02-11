package postgres

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gofiber-template/domain/models"
)

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

func NewDatabase(config DatabaseConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		config.Host, config.User, config.Password, config.DBName, config.Port, config.SSLMode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	return db, nil
}

func Migrate(db *gorm.DB) error {
	// Run AutoMigrate first
	if err := db.AutoMigrate(
		&models.User{},
		&models.Task{},
		&models.File{},
		&models.Job{},
		// SubTH models - Category & Maker first (referenced by Video)
		&models.Category{},
		&models.CategoryTranslation{},
		&models.Maker{},
		&models.Cast{},
		&models.CastTranslation{},
		&models.Tag{},
		&models.TagTranslation{},
		// Video after its dependencies
		&models.Video{},
		&models.VideoTranslation{},
		&models.AutoTagLabel{},
		// Reel after Video (references Video)
		&models.Reel{},
		// Reel engagement (likes, comments)
		&models.ReelLike{},
		&models.ReelComment{},
		// User stats & AI titles
		&models.UserStats{},
		&models.TitleHistory{},
		// XP system
		&models.XPTransaction{},
		&models.VideoView{},
		// Activity logs
		&models.ActivityLog{},
	); err != nil {
		return err
	}

	// Run custom migrations
	return migrateVideoCategories(db)
}

// migrateVideoCategories - Migrate from single category_id to many2many video_categories
func migrateVideoCategories(db *gorm.DB) error {
	// Check if category_id column exists in videos table
	var columnExists bool
	db.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'category_id')").Scan(&columnExists)

	if !columnExists {
		// Column doesn't exist, nothing to migrate
		return nil
	}

	// Migrate existing category_id to video_categories
	result := db.Exec(`
		INSERT INTO video_categories (video_id, category_id)
		SELECT id, category_id FROM videos
		WHERE category_id IS NOT NULL
		ON CONFLICT DO NOTHING
	`)
	if result.Error != nil {
		return fmt.Errorf("failed to migrate video categories: %v", result.Error)
	}

	// Drop the old category_id column
	result = db.Exec("ALTER TABLE videos DROP COLUMN IF EXISTS category_id")
	if result.Error != nil {
		return fmt.Errorf("failed to drop category_id column: %v", result.Error)
	}

	return nil
}