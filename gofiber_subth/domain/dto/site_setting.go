package dto

import (
	"time"

	"gofiber-template/domain/models"
)

// SiteSettingResponse - Response DTO for site settings
type SiteSettingResponse struct {
	GTMID     string    `json:"gtmId"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// UpdateSiteSettingRequest - Request DTO to update site settings
type UpdateSiteSettingRequest struct {
	GTMID string `json:"gtmId" validate:"omitempty,max=50"`
}

// SiteSettingToResponse converts model to response DTO
func SiteSettingToResponse(setting *models.SiteSetting) *SiteSettingResponse {
	if setting == nil {
		return &SiteSettingResponse{}
	}
	return &SiteSettingResponse{
		GTMID:     setting.GTMID,
		UpdatedAt: setting.UpdatedAt,
	}
}
