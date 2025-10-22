package models

import "time"

// User aligns with OJ schema users table.
type User struct {
	ID           uint64     `json:"id" gorm:"type:BIGINT UNSIGNED;primaryKey"`
	Username     string     `json:"username" gorm:"size:50;uniqueIndex;not null"`
	Email        string     `json:"email" gorm:"size:255;uniqueIndex;not null"`
	PasswordHash string     `json:"-" gorm:"size:255;not null"`
	Role         string     `json:"role" gorm:"type:ENUM('admin','student');not null"`
	Status       string     `json:"status" gorm:"type:ENUM('active','suspended');not null;default:'active'"`
	LastLoginAt  *time.Time `json:"lastLoginAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}