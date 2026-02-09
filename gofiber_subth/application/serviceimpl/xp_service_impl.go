package serviceimpl

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

type xpServiceImpl struct {
	xpTxRepo   repositories.XPTransactionRepository
	viewRepo   repositories.VideoViewRepository
	statsRepo  repositories.UserStatsRepository
}

func NewXPService(
	xpTxRepo repositories.XPTransactionRepository,
	viewRepo repositories.VideoViewRepository,
	statsRepo repositories.UserStatsRepository,
) services.XPService {
	return &xpServiceImpl{
		xpTxRepo:  xpTxRepo,
		viewRepo:  viewRepo,
		statsRepo: statsRepo,
	}
}

func (s *xpServiceImpl) AwardRegistrationXP(ctx context.Context, userID uuid.UUID) (*dto.AwardXPResult, error) {
	// Check if already received
	received, err := s.xpTxRepo.HasReceivedRegistrationXP(ctx, userID)
	if err != nil {
		return nil, err
	}

	if received {
		stats, _ := s.statsRepo.GetByUserID(ctx, userID)
		totalXP := 0
		level := 1
		if stats != nil {
			totalXP = stats.XP
			level = stats.Level
		}
		return &dto.AwardXPResult{
			Awarded:  false,
			XPAmount: 0,
			TotalXP:  totalXP,
			NewLevel: level,
			Reason:   "already_received",
		}, nil
	}

	// Award XP
	return s.awardXP(ctx, userID, models.XPAmountRegistration, models.XPSourceRegistration, nil, nil)
}

func (s *xpServiceImpl) AwardViewXP(ctx context.Context, userID, reelID uuid.UUID, duration int, percent float64) (*dto.AwardXPResult, error) {
	// Check if already received XP for this reel
	received, err := s.xpTxRepo.HasReceivedXP(ctx, userID, models.XPSourceView, reelID)
	if err != nil {
		return nil, err
	}

	if received {
		stats, _ := s.statsRepo.GetByUserID(ctx, userID)
		totalXP := 0
		level := 1
		if stats != nil {
			totalXP = stats.XP
			level = stats.Level
		}
		return &dto.AwardXPResult{
			Awarded:  false,
			XPAmount: 0,
			TotalXP:  totalXP,
			NewLevel: level,
			Reason:   "already_viewed",
		}, nil
	}

	// Check if watch criteria met (30 seconds or 50%)
	if duration < 30 && percent < 50.0 {
		stats, _ := s.statsRepo.GetByUserID(ctx, userID)
		totalXP := 0
		level := 1
		if stats != nil {
			totalXP = stats.XP
			level = stats.Level
		}
		return &dto.AwardXPResult{
			Awarded:  false,
			XPAmount: 0,
			TotalXP:  totalXP,
			NewLevel: level,
			Reason:   "watch_criteria_not_met",
		}, nil
	}

	refType := models.XPRefTypeReel
	return s.awardXP(ctx, userID, models.XPAmountView, models.XPSourceView, &reelID, &refType)
}

func (s *xpServiceImpl) AwardLikeXP(ctx context.Context, userID, reelID uuid.UUID) (*dto.AwardXPResult, error) {
	// Check if already received XP for this reel
	received, err := s.xpTxRepo.HasReceivedXP(ctx, userID, models.XPSourceLike, reelID)
	if err != nil {
		return nil, err
	}

	if received {
		stats, _ := s.statsRepo.GetByUserID(ctx, userID)
		totalXP := 0
		level := 1
		if stats != nil {
			totalXP = stats.XP
			level = stats.Level
		}
		return &dto.AwardXPResult{
			Awarded:  false,
			XPAmount: 0,
			TotalXP:  totalXP,
			NewLevel: level,
			Reason:   "already_liked",
		}, nil
	}

	refType := models.XPRefTypeReel
	return s.awardXP(ctx, userID, models.XPAmountLike, models.XPSourceLike, &reelID, &refType)
}

func (s *xpServiceImpl) AwardCommentXP(ctx context.Context, userID, reelID uuid.UUID, commentID uuid.UUID) (*dto.AwardXPResult, error) {
	// Check daily limit
	today := time.Now()
	count, err := s.xpTxRepo.CountDailyCommentXP(ctx, userID, today)
	if err != nil {
		return nil, err
	}

	if count >= models.MaxDailyComments {
		stats, _ := s.statsRepo.GetByUserID(ctx, userID)
		totalXP := 0
		level := 1
		if stats != nil {
			totalXP = stats.XP
			level = stats.Level
		}
		return &dto.AwardXPResult{
			Awarded:  false,
			XPAmount: 0,
			TotalXP:  totalXP,
			NewLevel: level,
			Reason:   "daily_limit_reached",
		}, nil
	}

	refType := models.XPRefTypeComment
	return s.awardXP(ctx, userID, models.XPAmountComment, models.XPSourceComment, &commentID, &refType)
}

func (s *xpServiceImpl) GetXPHistory(ctx context.Context, userID uuid.UUID, page, limit int) ([]models.XPTransaction, int64, error) {
	offset := (page - 1) * limit
	return s.xpTxRepo.ListByUser(ctx, userID, limit, offset)
}

func (s *xpServiceImpl) RecordView(ctx context.Context, userID, reelID uuid.UUID, duration int, percent float64) (*dto.RecordViewResponse, error) {
	// Get or create view record
	view, err := s.viewRepo.GetByUserAndReel(ctx, userID, reelID)
	if err != nil {
		return nil, err
	}

	if view == nil {
		// Create new view record
		view = &models.VideoView{
			UserID:        userID,
			ReelID:        reelID,
			WatchDuration: duration,
			WatchPercent:  percent,
			XPAwarded:     false,
		}
		if err := s.viewRepo.Create(ctx, view); err != nil {
			return nil, err
		}
	} else {
		// Update existing record if better
		if duration > view.WatchDuration {
			view.WatchDuration = duration
		}
		if percent > view.WatchPercent {
			view.WatchPercent = percent
		}
		if err := s.viewRepo.Update(ctx, view); err != nil {
			return nil, err
		}
	}

	// Try to award XP if not already awarded
	if view.XPAwarded {
		stats, _ := s.statsRepo.GetByUserID(ctx, userID)
		totalXP := 0
		if stats != nil {
			totalXP = stats.XP
		}
		return &dto.RecordViewResponse{
			XPAwarded: false,
			XPAmount:  0,
			TotalXP:   totalXP,
			LeveledUp: false,
		}, nil
	}

	result, err := s.AwardViewXP(ctx, userID, reelID, duration, percent)
	if err != nil {
		return nil, err
	}

	// Mark as XP awarded if successful
	if result.Awarded {
		if err := s.viewRepo.MarkXPAwarded(ctx, view.ID); err != nil {
			logger.WarnContext(ctx, "Failed to mark XP awarded", "error", err, "view_id", view.ID)
		}
	}

	return &dto.RecordViewResponse{
		XPAwarded: result.Awarded,
		XPAmount:  result.XPAmount,
		TotalXP:   result.TotalXP,
		LeveledUp: result.LeveledUp,
	}, nil
}

// awardXP helper สำหรับให้ XP และ update user stats
func (s *xpServiceImpl) awardXP(
	ctx context.Context,
	userID uuid.UUID,
	xpAmount int,
	source models.XPSource,
	referenceID *uuid.UUID,
	referenceType *models.XPReferenceType,
) (*dto.AwardXPResult, error) {
	// Create XP transaction
	tx := &models.XPTransaction{
		UserID:        userID,
		XPAmount:      xpAmount,
		Source:        source,
		ReferenceID:   referenceID,
		ReferenceType: referenceType,
	}

	if err := s.xpTxRepo.Create(ctx, tx); err != nil {
		logger.ErrorContext(ctx, "Failed to create XP transaction", "error", err, "user_id", userID, "source", source)
		return nil, err
	}

	// Update user stats
	stats, err := s.statsRepo.AddXP(ctx, userID, xpAmount)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to add XP to user stats", "error", err, "user_id", userID, "xp", xpAmount)
		return nil, err
	}

	// Check if leveled up (compare XP before and after)
	oldLevel := models.CalculateLevelFromXP(stats.XP - xpAmount)
	leveledUp := stats.Level > oldLevel

	logger.InfoContext(ctx, "XP awarded",
		"user_id", userID,
		"source", source,
		"xp_amount", xpAmount,
		"total_xp", stats.XP,
		"level", stats.Level,
		"leveled_up", leveledUp,
	)

	return &dto.AwardXPResult{
		Awarded:   true,
		XPAmount:  xpAmount,
		TotalXP:   stats.XP,
		LeveledUp: leveledUp,
		NewLevel:  stats.Level,
	}, nil
}
