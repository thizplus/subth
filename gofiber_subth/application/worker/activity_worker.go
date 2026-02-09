package worker

import (
	"context"
	"sync"
	"time"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/infrastructure/redis"
	"gofiber-template/pkg/logger"
)

const (
	// WorkerInterval - ทุกๆ 5 วินาที
	WorkerInterval = 5 * time.Second
	// BatchSize - จำนวน items ที่ดึงจาก queue ต่อครั้ง
	BatchSize = 100
	// RetentionDays - เก็บ log กี่วัน (90 วัน)
	RetentionDays = 90
	// CleanupInterval - ทุก 24 ชั่วโมง ลบ log เก่า
	CleanupInterval = 24 * time.Hour
)

type ActivityWorker struct {
	queue  *redis.ActivityQueue
	repo   repositories.ActivityLogRepository
	stop   chan struct{}
	wg     sync.WaitGroup
	mu     sync.Mutex
	running bool
}

func NewActivityWorker(
	queue *redis.ActivityQueue,
	repo repositories.ActivityLogRepository,
) *ActivityWorker {
	return &ActivityWorker{
		queue: queue,
		repo:  repo,
		stop:  make(chan struct{}),
	}
}

// Start เริ่ม background worker
func (w *ActivityWorker) Start(ctx context.Context) {
	w.mu.Lock()
	if w.running {
		w.mu.Unlock()
		return
	}
	w.running = true
	w.mu.Unlock()

	logger.Info("Activity worker starting...")

	// Worker goroutine - process queue
	w.wg.Add(1)
	go w.processLoop(ctx)

	// Cleanup goroutine - delete old logs
	w.wg.Add(1)
	go w.cleanupLoop(ctx)

	logger.Info("Activity worker started",
		"interval", WorkerInterval,
		"batch_size", BatchSize,
	)
}

// Stop หยุด worker
func (w *ActivityWorker) Stop() {
	w.mu.Lock()
	if !w.running {
		w.mu.Unlock()
		return
	}
	w.running = false
	w.mu.Unlock()

	close(w.stop)
	w.wg.Wait()
	logger.Info("Activity worker stopped")
}

// processLoop - loop หลักที่ดึง queue และ batch insert
func (w *ActivityWorker) processLoop(ctx context.Context) {
	defer w.wg.Done()

	ticker := time.NewTicker(WorkerInterval)
	defer ticker.Stop()

	for {
		select {
		case <-w.stop:
			// Process remaining items before stop
			w.ProcessBatch(ctx)
			return
		case <-ticker.C:
			w.ProcessBatch(ctx)
		}
	}
}

// cleanupLoop - loop ลบ log เก่า
func (w *ActivityWorker) cleanupLoop(ctx context.Context) {
	defer w.wg.Done()

	// Run cleanup once on start
	w.runCleanup(ctx)

	ticker := time.NewTicker(CleanupInterval)
	defer ticker.Stop()

	for {
		select {
		case <-w.stop:
			return
		case <-ticker.C:
			w.runCleanup(ctx)
		}
	}
}

func (w *ActivityWorker) runCleanup(ctx context.Context) {
	deleted, err := w.repo.DeleteOldLogs(ctx, RetentionDays)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to cleanup old logs", "error", err)
		return
	}
	if deleted > 0 {
		logger.InfoContext(ctx, "Cleaned up old activity logs", "deleted", deleted)
	}
}

// ProcessBatch ดึง items จาก queue และ batch insert เข้า DB
func (w *ActivityWorker) ProcessBatch(ctx context.Context) (int, error) {
	items, err := w.queue.Pop(ctx, BatchSize)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to pop from activity queue", "error", err)
		return 0, err
	}

	if len(items) == 0 {
		return 0, nil
	}

	// Convert queue items to models
	logs := make([]*models.ActivityLog, len(items))
	for i, item := range items {
		logs[i] = item.ToModel()
	}

	// Batch insert
	if err := w.repo.BatchCreate(ctx, logs); err != nil {
		logger.ErrorContext(ctx, "Failed to batch create activity logs", "error", err, "count", len(logs))
		// TODO: อาจจะ push กลับ queue หรือ log to file เพื่อ recovery
		return 0, err
	}

	logger.InfoContext(ctx, "Processed activity batch", "count", len(logs))
	return len(logs), nil
}

// IsRunning ตรวจสอบว่า worker กำลังทำงานอยู่หรือไม่
func (w *ActivityWorker) IsRunning() bool {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.running
}

// QueueLength จำนวน items ที่รอใน queue
func (w *ActivityWorker) QueueLength(ctx context.Context) (int64, error) {
	return w.queue.Length(ctx)
}
