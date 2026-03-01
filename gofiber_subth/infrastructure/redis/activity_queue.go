package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/pkg/logger"

	"github.com/redis/go-redis/v9"
)

const ActivityQueueKey = "activity_log_queue"
const ActivityRateLimitPrefix = "activity_rate:"

type ActivityQueue struct {
	client *redis.Client
}

func NewActivityQueue(redisClient *RedisClient) *ActivityQueue {
	return &ActivityQueue{
		client: redisClient.client,
	}
}

// Push เพิ่ม activity item เข้า queue (Fire & Forget)
func (q *ActivityQueue) Push(ctx context.Context, item *dto.ActivityQueueItem) error {
	data, err := json.Marshal(item)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to marshal activity queue item", "error", err)
		return err
	}

	if err := q.client.LPush(ctx, ActivityQueueKey, data).Err(); err != nil {
		logger.ErrorContext(ctx, "Failed to push to activity queue", "error", err)
		return err
	}

	return nil
}

// Pop ดึง items จาก queue (สำหรับ worker)
func (q *ActivityQueue) Pop(ctx context.Context, count int) ([]*dto.ActivityQueueItem, error) {
	items := make([]*dto.ActivityQueueItem, 0, count)

	for i := 0; i < count; i++ {
		// RPOP - First In First Out
		data, err := q.client.RPop(ctx, ActivityQueueKey).Bytes()
		if err != nil {
			if err == redis.Nil {
				// Queue empty
				break
			}
			logger.ErrorContext(ctx, "Failed to pop from activity queue", "error", err)
			return items, err
		}

		var item dto.ActivityQueueItem
		if err := json.Unmarshal(data, &item); err != nil {
			logger.ErrorContext(ctx, "Failed to unmarshal activity queue item", "error", err)
			continue // Skip invalid items
		}

		items = append(items, &item)
	}

	return items, nil
}

// Length คืนจำนวน items ใน queue
func (q *ActivityQueue) Length(ctx context.Context) (int64, error) {
	return q.client.LLen(ctx, ActivityQueueKey).Result()
}

// Clear ลบทุก items ใน queue (สำหรับ testing)
func (q *ActivityQueue) Clear(ctx context.Context) error {
	return q.client.Del(ctx, ActivityQueueKey).Err()
}

// ========== Rate Limiting ==========

// GetRateLimitKey สร้าง key สำหรับ rate limit (user:pageType:pageID)
func (q *ActivityQueue) GetRateLimitKey(userID uuid.UUID, pageType string, pageID *string) string {
	pid := "none"
	if pageID != nil {
		pid = *pageID
	}
	return fmt.Sprintf("%s%s:%s:%s", ActivityRateLimitPrefix, userID.String(), pageType, pid)
}

// IsRateLimited เช็คว่า user นี้เพิ่ง log activity ไปหรือยัง
func (q *ActivityQueue) IsRateLimited(ctx context.Context, key string) bool {
	exists, err := q.client.Exists(ctx, key).Result()
	if err != nil {
		logger.WarnContext(ctx, "Failed to check rate limit", "error", err, "key", key)
		return false // Allow on error
	}
	return exists > 0
}

// SetRateLimit ตั้ง rate limit key พร้อม TTL
func (q *ActivityQueue) SetRateLimit(ctx context.Context, key string, ttl time.Duration) {
	if err := q.client.Set(ctx, key, "1", ttl).Err(); err != nil {
		logger.WarnContext(ctx, "Failed to set rate limit", "error", err, "key", key)
	}
}
