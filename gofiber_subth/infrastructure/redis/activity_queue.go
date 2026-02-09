package redis

import (
	"context"
	"encoding/json"

	"gofiber-template/domain/dto"
	"gofiber-template/pkg/logger"

	"github.com/redis/go-redis/v9"
)

const ActivityQueueKey = "activity_log_queue"

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
