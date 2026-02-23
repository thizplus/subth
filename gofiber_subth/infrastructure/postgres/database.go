package postgres

import (
	"fmt"
	"time"

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
		// IMPORTANT: Disable PrepareStmt for PgBouncer transaction pooling mode
		// Without this, you'll get "prepared statement S_1 does not exist" errors
		PrepareStmt: false,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	// Configure connection pool for PgBouncer
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %v", err)
	}

	// SetMaxOpenConns: Should be higher than PgBouncer's DEFAULT_POOL_SIZE (25)
	// to allow effective connection competition during peak load
	sqlDB.SetMaxOpenConns(100)

	// SetMaxIdleConns: Keep some connections ready for reuse
	sqlDB.SetMaxIdleConns(25)

	// SetConnMaxLifetime: Should be less than PgBouncer's SERVER_LIFETIME (1800s)
	// to ensure connections are refreshed before PgBouncer closes them
	sqlDB.SetConnMaxLifetime(time.Minute * 15)

	// SetConnMaxIdleTime: Close idle connections after 5 minutes
	sqlDB.SetConnMaxIdleTime(time.Minute * 5)

	return db, nil
}

func Migrate(db *gorm.DB) error {
	// Run AutoMigrate first
	// NOTE: Maker, Cast, Tag ถูกเอาออกเพราะ GORM v1.30.0 มี bug พยายาม drop constraint ที่ไม่มี
	// Tables เหล่านี้มีอยู่ใน production แล้ว ไม่ต้อง migrate
	if err := db.AutoMigrate(
		&models.User{},
		&models.Task{},
		&models.File{},
		&models.Job{},
		// SubTH models - Category first (Maker, Cast, Tag skipped - already exist)
		&models.Category{},
		&models.CategoryTranslation{},
		// &models.Maker{},      // SKIP - GORM bug
		// &models.Cast{},       // SKIP - GORM bug
		&models.CastTranslation{},
		// &models.Tag{},        // SKIP - GORM bug
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
		// Contact channels
		&models.ContactChannel{},
		// Community chat
		&models.ChatMessage{},
		&models.ChatBan{},
		// SEO Articles (from seo_worker)
		&models.SEOArticle{},
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