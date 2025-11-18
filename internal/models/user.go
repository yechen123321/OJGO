// 数据模型定义
package models

import "time"

// User 与数据库 users 表对应
type User struct {
    ID          uint64     `json:"id" gorm:"type:BIGINT UNSIGNED;primaryKey"`                                // 主键
    Account     string     `json:"account" gorm:"size:50;uniqueIndex;not null"`                              // 账号（注册时默认等于学号）
    Username    string     `json:"username" gorm:"size:50;not null"`                                         // 用户名
    Email       string     `json:"email" gorm:"size:255;uniqueIndex;not null"`                               // 邮箱（唯一）
    Password    string     `json:"-" gorm:"size:255;not null"`                                               // 密码（当前阶段明文）
    Name        string     `json:"name" gorm:"size:100"`                                                      // 姓名
    StudentNo   string     `json:"studentNo" gorm:"size:50;uniqueIndex"`                                     // 学号（唯一）
    Role        string     `json:"role" gorm:"type:ENUM('admin','student');not null"`                        // 角色
    Status      string     `json:"status" gorm:"type:ENUM('active','suspended');not null;default:'active'"` // 状态
    LastLoginAt *time.Time `json:"lastLoginAt,omitempty"`                                                     // 最近登录时间
    CreatedAt   time.Time  `json:"createdAt"`                                                                 // 创建时间
    UpdatedAt   time.Time  `json:"updatedAt"`                                                                 // 更新时间
}
