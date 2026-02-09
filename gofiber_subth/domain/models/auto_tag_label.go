package models

import "time"

type AutoTagLabel struct {
	Key       string    `gorm:"primaryKey;size:50"`
	NameEN    string    `gorm:"column:name_en;size:100;not null"`
	NameTH    *string   `gorm:"column:name_th;size:100"`
	NameJA    *string   `gorm:"column:name_ja;size:100"`
	Category  string    `gorm:"size:50"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

func (AutoTagLabel) TableName() string {
	return "auto_tag_labels"
}

// GetName returns the name in the specified language
func (a *AutoTagLabel) GetName(lang string) string {
	switch lang {
	case "th":
		if a.NameTH != nil {
			return *a.NameTH
		}
	case "ja":
		if a.NameJA != nil {
			return *a.NameJA
		}
	}
	return a.NameEN
}
