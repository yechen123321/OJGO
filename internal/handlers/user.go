// 用户资源的 HTTP 处理逻辑（CRUD）
package handlers

// 依赖导入：HTTP、Gin、GORM、项目内模型与统一响应
import (
    "net/http"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"

    "Golang/internal/models"
    "Golang/internal/response"
)

// UserHandler 封装用户模块的数据库依赖
type UserHandler struct {
    DB *gorm.DB
}

// NewUserHandler 创建用户处理器
func NewUserHandler(db *gorm.DB) *UserHandler {
    return &UserHandler{DB: db}
}

// CreateUser 创建用户（演示用）：入参 username、email、password、role
func (h *UserHandler) CreateUser(c *gin.Context) {
    type payload struct {
        Username string `json:"username" binding:"required"`                // 用户名
        Email    string `json:"email" binding:"required,email"`             // 邮箱
        Password string `json:"password" binding:"required,min=6"`          // 明文密码（示例）
        Role     string `json:"role" binding:"omitempty,oneof=admin student"` // 角色
    }
	var p payload
    if err := c.ShouldBindJSON(&p); err != nil {
        response.Error(c, http.StatusBadRequest, 400, err.Error())
        return
    }

	role := p.Role
	if role == "" {
		role = "student"
	}
    // 注意：此处将 account 设置为 username，仅供演示；实际场景按你的规则赋值
    user := models.User{Account: p.Username, Username: p.Username, Email: p.Email, Password: p.Password, Role: role}
    if err := h.DB.Create(&user).Error; err != nil {
        response.Error(c, http.StatusInternalServerError, 500, err.Error())
        return
    }
    response.OK(c, user, "创建成功")
}

// ListUsers 返回所有用户列表
func (h *UserHandler) ListUsers(c *gin.Context) {
	var users []models.User
    if err := h.DB.Find(&users).Error; err != nil {
        response.Error(c, http.StatusInternalServerError, 500, err.Error())
        return
    }
    response.OK(c, users, "ok")
}

// GetUser 根据 ID 返回单个用户
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
    if err := h.DB.First(&user, id).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            response.Error(c, http.StatusNotFound, 404, "用户不存在")
            return
        }
        response.Error(c, http.StatusInternalServerError, 500, err.Error())
        return
    }
    response.OK(c, user, "ok")
}

// UpdateUser 更新用户（部分字段）：email、password、role、status
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := h.DB.First(&user, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

    type payload struct {
        Email    *string `json:"email" binding:"omitempty,email"`                     // 邮箱
        Password *string `json:"password"`                                            // 明文密码（示例）
        Role     *string `json:"role" binding:"omitempty,oneof=admin student"`       // 角色
        Status   *string `json:"status" binding:"omitempty,oneof=active suspended"`  // 状态
    }
    var p payload
    if err := c.ShouldBindJSON(&p); err != nil {
        response.Error(c, http.StatusBadRequest, 400, err.Error())
        return
    }
	if p.Email != nil {
		user.Email = *p.Email
	}
    if p.Password != nil {
        if len(*p.Password) < 6 {
            response.Error(c, http.StatusBadRequest, 400, "password too short")
            return
        }
        user.Password = *p.Password
    }
	if p.Role != nil {
		user.Role = *p.Role
	}
	if p.Status != nil {
		user.Status = *p.Status
	}
    if err := h.DB.Save(&user).Error; err != nil {
        response.Error(c, http.StatusInternalServerError, 500, err.Error())
        return
    }
    response.OK(c, user, "更新成功")
}

// DeleteUser 删除用户（根据 ID）
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
    if err := h.DB.Delete(&models.User{}, id).Error; err != nil {
        response.Error(c, http.StatusInternalServerError, 500, err.Error())
        return
    }
    response.OK(c, gin.H{}, "删除成功")
}
