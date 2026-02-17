package dto

import (
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

// LogActivityRequest request สำหรับบันทึก activity
type LogActivityRequest struct {
	PageType string  `json:"pageType" validate:"required,oneof=video cast tag maker category search ai-search reel feed profile"`
	PageID   *string `json:"pageId"`   // UUID string (nullable)
	Path     string  `json:"path" validate:"required"`
	Metadata *string `json:"metadata"` // JSON string
}

// LogActivityResponse response หลังบันทึก activity
type LogActivityResponse struct {
	Success bool `json:"success"`
}

// ActivityLogResponse response สำหรับแสดง activity log
type ActivityLogResponse struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	PageType  string    `json:"pageType"`
	PageID    *string   `json:"pageId"`
	PageTitle *string   `json:"pageTitle,omitempty"`
	Path      string    `json:"path"`
	Metadata  *string   `json:"metadata"`
	CreatedAt time.Time `json:"createdAt"`
}

// ActivityLogToResponse แปลง model เป็น response
func ActivityLogToResponse(log *models.ActivityLog) *ActivityLogResponse {
	var pageID *string
	if log.PageID != nil {
		id := log.PageID.String()
		pageID = &id
	}

	return &ActivityLogResponse{
		ID:        log.ID.String(),
		UserID:    log.UserID.String(),
		PageType:  log.PageType,
		PageID:    pageID,
		Path:      log.Path,
		Metadata:  log.Metadata,
		CreatedAt: log.CreatedAt,
	}
}

// ActivityLogsToResponse แปลง slice ของ models เป็น slice ของ responses
func ActivityLogsToResponse(logs []*models.ActivityLog) []*ActivityLogResponse {
	responses := make([]*ActivityLogResponse, len(logs))
	for i, log := range logs {
		responses[i] = ActivityLogToResponse(log)
	}
	return responses
}

// ActivityQueueItem item ที่เก็บใน Redis queue
type ActivityQueueItem struct {
	UserID    uuid.UUID `json:"userId"`
	PageType  string    `json:"pageType"`
	PageID    *string   `json:"pageId"`
	Path      string    `json:"path"`
	Metadata  *string   `json:"metadata"`
	IPAddress string    `json:"ipAddress"`
	UserAgent string    `json:"userAgent"`
	CreatedAt time.Time `json:"createdAt"`
}

// ToModel แปลง queue item เป็น model
func (q *ActivityQueueItem) ToModel() *models.ActivityLog {
	var pageID *uuid.UUID
	if q.PageID != nil {
		if id, err := uuid.Parse(*q.PageID); err == nil {
			pageID = &id
		}
	}

	return &models.ActivityLog{
		UserID:    q.UserID,
		PageType:  q.PageType,
		PageID:    pageID,
		Path:      q.Path,
		Metadata:  q.Metadata,
		IPAddress: q.IPAddress,
		UserAgent: q.UserAgent,
		CreatedAt: q.CreatedAt,
	}
}

// PageViewCountResponse response สำหรับ analytics
type PageViewCountResponse struct {
	PageID    string `json:"pageId"`
	PageType  string `json:"pageType"`
	ViewCount int64  `json:"viewCount"`
}

// ActivityLogWithUserResponse response สำหรับ admin ดู activity พร้อมข้อมูล user
type ActivityLogWithUserResponse struct {
	ID          string    `json:"id"`
	UserID      string    `json:"userId"`
	Username    string    `json:"username"`
	DisplayName string    `json:"displayName"`
	Avatar      string    `json:"avatar"`
	PageType    string    `json:"pageType"`
	PageID      *string   `json:"pageId"`
	PageTitle   *string   `json:"pageTitle,omitempty"`
	Path        string    `json:"path"`
	Metadata    *string   `json:"metadata"`
	IPAddress   string    `json:"ipAddress"`
	UserAgent   string    `json:"userAgent"`
	CreatedAt   time.Time `json:"createdAt"`
}

// ActivityLogToWithUserResponse แปลง model เป็น response พร้อม user info
func ActivityLogToWithUserResponse(log *models.ActivityLog) *ActivityLogWithUserResponse {
	var pageID *string
	if log.PageID != nil {
		id := log.PageID.String()
		pageID = &id
	}

	username := ""
	displayName := ""
	avatar := ""
	if log.User != nil {
		username = log.User.Username
		displayName = log.User.DisplayName
		avatar = log.User.GetAvatarURL()
	}

	return &ActivityLogWithUserResponse{
		ID:          log.ID.String(),
		UserID:      log.UserID.String(),
		Username:    username,
		DisplayName: displayName,
		Avatar:      avatar,
		PageType:    log.PageType,
		PageID:      pageID,
		Path:        log.Path,
		Metadata:    log.Metadata,
		IPAddress:   log.IPAddress,
		UserAgent:   log.UserAgent,
		CreatedAt:   log.CreatedAt,
	}
}

// ActivityLogsToWithUserResponse แปลง slice
func ActivityLogsToWithUserResponse(logs []*models.ActivityLog) []*ActivityLogWithUserResponse {
	responses := make([]*ActivityLogWithUserResponse, len(logs))
	for i, log := range logs {
		responses[i] = ActivityLogToWithUserResponse(log)
	}
	return responses
}
