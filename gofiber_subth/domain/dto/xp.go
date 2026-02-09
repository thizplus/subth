package dto

import (
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

// RecordViewRequest request สำหรับบันทึกการดู video
type RecordViewRequest struct {
	WatchDuration int     `json:"watchDuration" validate:"required,min=1"` // วินาที
	WatchPercent  float64 `json:"watchPercent" validate:"min=0,max=100"`   // %
}

// RecordViewResponse response หลังบันทึกการดู
type RecordViewResponse struct {
	XPAwarded bool `json:"xpAwarded"`
	XPAmount  int  `json:"xpAmount"`
	TotalXP   int  `json:"totalXp"`
	LeveledUp bool `json:"leveledUp"`
}

// XPTransactionResponse response สำหรับ XP transaction
type XPTransactionResponse struct {
	ID            uuid.UUID `json:"id"`
	XPAmount      int       `json:"xpAmount"`
	Source        string    `json:"source"`
	ReferenceType string    `json:"referenceType,omitempty"`
	ReferenceID   string    `json:"referenceId,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
}

// XPHistoryResponse response สำหรับประวัติ XP
type XPHistoryResponse struct {
	Transactions []XPTransactionResponse `json:"transactions"`
	TotalXP      int                     `json:"totalXp"`
}

// AwardXPResult ผลลัพธ์จากการให้ XP
type AwardXPResult struct {
	Awarded   bool `json:"awarded"`   // ให้ XP สำเร็จหรือไม่
	XPAmount  int  `json:"xpAmount"`  // จำนวน XP ที่ได้
	TotalXP   int  `json:"totalXp"`   // XP รวมหลังได้รับ
	LeveledUp bool `json:"leveledUp"` // level up หรือไม่
	NewLevel  int  `json:"newLevel"`  // level ใหม่
	Reason    string `json:"reason,omitempty"` // เหตุผลถ้าไม่ได้ XP
}

// Mapper functions

func XPTransactionToResponse(tx *models.XPTransaction) *XPTransactionResponse {
	if tx == nil {
		return nil
	}

	resp := &XPTransactionResponse{
		ID:        tx.ID,
		XPAmount:  tx.XPAmount,
		Source:    string(tx.Source),
		CreatedAt: tx.CreatedAt,
	}

	if tx.ReferenceType != nil {
		resp.ReferenceType = string(*tx.ReferenceType)
	}
	if tx.ReferenceID != nil {
		resp.ReferenceID = tx.ReferenceID.String()
	}

	return resp
}

func XPTransactionsToResponse(txs []models.XPTransaction) []XPTransactionResponse {
	result := make([]XPTransactionResponse, len(txs))
	for i, tx := range txs {
		result[i] = *XPTransactionToResponse(&tx)
	}
	return result
}
