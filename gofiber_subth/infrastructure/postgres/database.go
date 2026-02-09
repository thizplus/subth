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
	return db.AutoMigrate(
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
	)
}