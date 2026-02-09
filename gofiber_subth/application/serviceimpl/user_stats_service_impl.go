package serviceimpl

import (
	"context"
	"time"

	"github.com/google/uuid"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

type UserStatsServiceImpl struct {
	userStatsRepo          repositories.UserStatsRepository
	titleGenerationService services.TitleGenerationService
}

func NewUserStatsService(
	userStatsRepo repositories.UserStatsRepository,
	titleGenerationService services.TitleGenerationService,
) services.UserStatsService {
	return &UserStatsServiceImpl{
		userStatsRepo:          userStatsRepo,
		titleGenerationService: titleGenerationService,
	}
}

func (s *UserStatsServiceImpl) GetOrCreate(ctx context.Context, userID uuid.UUID) (*models.UserStats, error) {
	stats, err := s.userStatsRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if stats != nil {
		return stats, nil
	}

	// สร้าง stats ใหม่พร้อม generate title เริ่มต้น
	now := time.Now()
	stats = &models.UserStats{
		UserID:           userID,
		XP:               0,
		Level:            1,
		TotalViews:       0,
		TotalLikes:       0,
		TotalComments:    0,
		LoginStreak:      0,
		PeakHour:         0,
		TitleGeneratedAt: &now,
	}

	// Generate initial title
	title, err := s.titleGenerationService.GenerateTitleForLevel(ctx, 1, stats)
	if err != nil {
		logger.WarnContext(ctx, "Failed to generate initial title", "error", err)
		title = "ผู้เริ่มต้น"
	}
	stats.Title = title

	if err := s.userStatsRepo.Create(ctx, stats); err != nil {
		return nil, err
	}

	// บันทึก title history
	s.saveTitleHistory(ctx, userID, 1, title)

	logger.InfoContext(ctx, "Created user stats",
		"user_id", userID,
		"title", title,
	)

	return stats, nil
}

func (s *UserStatsServiceImpl) GetStats(ctx context.Context, userID uuid.UUID) (*models.UserStats, error) {
	return s.userStatsRepo.GetByUserID(ctx, userID)
}

func (s *UserStatsServiceImpl) AddXP(ctx context.Context, userID uuid.UUID, xp int, source string) (*models.UserStats, bool, error) {
	stats, err := s.GetOrCreate(ctx, userID)
	if err != nil {
		return nil, false, err
	}

	oldLevel := stats.Level
	stats.XP += xp
	newLevel := models.CalculateLevelFromXP(stats.XP)
	stats.Level = newLevel

	leveledUp := newLevel > oldLevel

	// Generate new title if leveled up
	if leveledUp {
		title, err := s.titleGenerationService.GenerateTitleForLevel(ctx, newLevel, stats)
		if err != nil {
			logger.WarnContext(ctx, "Failed to generate title on level up", "error", err)
		} else {
			stats.Title = title
			now := time.Now()
			stats.TitleGeneratedAt = &now

			// บันทึก title history
			s.saveTitleHistory(ctx, userID, newLevel, title)
		}

		logger.InfoContext(ctx, "User leveled up",
			"user_id", userID,
			"old_level", oldLevel,
			"new_level", newLevel,
			"xp", stats.XP,
			"title", stats.Title,
			"source", source,
		)
	}

	if err := s.userStatsRepo.Update(ctx, stats); err != nil {
		return nil, false, err
	}

	return stats, leveledUp, nil
}

func (s *UserStatsServiceImpl) RegenerateTitle(ctx context.Context, userID uuid.UUID) (*models.UserStats, error) {
	stats, err := s.GetOrCreate(ctx, userID)
	if err != nil {
		return nil, err
	}

	title, err := s.titleGenerationService.GenerateTitleForLevel(ctx, stats.Level, stats)
	if err != nil {
		return nil, err
	}

	stats.Title = title
	now := time.Now()
	stats.TitleGeneratedAt = &now

	if err := s.userStatsRepo.Update(ctx, stats); err != nil {
		return nil, err
	}

	// บันทึก title history (manual regenerate)
	s.saveTitleHistory(ctx, userID, stats.Level, title)

	logger.InfoContext(ctx, "Regenerated title",
		"user_id", userID,
		"level", stats.Level,
		"title", title,
	)

	return stats, nil
}

func (s *UserStatsServiceImpl) GetTitleHistory(ctx context.Context, userID uuid.UUID) ([]models.TitleHistory, error) {
	return s.userStatsRepo.GetTitleHistoryByUserID(ctx, userID)
}

func (s *UserStatsServiceImpl) RecordLogin(ctx context.Context, userID uuid.UUID) (*models.UserStats, error) {
	stats, err := s.GetOrCreate(ctx, userID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	xpToAdd := 15 // XP สำหรับ login รายวัน

	// Check login streak
	if stats.LastLoginAt != nil {
		daysSinceLastLogin := int(now.Sub(*stats.LastLoginAt).Hours() / 24)
		if daysSinceLastLogin == 1 {
			// ต่อเนื่อง - เพิ่ม streak
			stats.LoginStreak++
			if stats.LoginStreak >= 7 {
				xpToAdd += 50 // Bonus 7-day streak
				stats.LoginStreak = 0 // Reset streak
				logger.InfoContext(ctx, "User completed 7-day streak bonus", "user_id", userID)
			}
		} else if daysSinceLastLogin > 1 {
			// ขาด - reset streak
			stats.LoginStreak = 1
		}
		// ถ้า daysSinceLastLogin == 0 หมายถึง login ในวันเดียวกัน ไม่ต้องเพิ่ม XP
		if daysSinceLastLogin == 0 {
			return stats, nil
		}
	} else {
		stats.LoginStreak = 1
	}

	stats.LastLoginAt = &now

	// เพิ่ม XP
	updatedStats, _, err := s.AddXP(ctx, userID, xpToAdd, "login")
	return updatedStats, err
}

func (s *UserStatsServiceImpl) saveTitleHistory(ctx context.Context, userID uuid.UUID, level int, title string) {
	history := &models.TitleHistory{
		UserID:   userID,
		Level:    level,
		Title:    title,
		EarnedAt: time.Now(),
	}
	if err := s.userStatsRepo.CreateTitleHistory(ctx, history); err != nil {
		logger.WarnContext(ctx, "Failed to save title history", "error", err, "user_id", userID)
	}
}
