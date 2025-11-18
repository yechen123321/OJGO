// 认证与注册相关的 HTTP 处理逻辑
package handlers

// 导入依赖：标准库、加密库、第三方 Gin/GORM、以及项目内模型与统一响应封装
import (
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"crypto/hmac"
	"crypto/sha256"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"Golang/internal/models"
	"Golang/internal/response"
)

// AuthHandler 封装认证相关的处理器与依赖
type AuthHandler struct {
	DB     *gorm.DB // 数据库连接
	Secret string   // 签名密钥（用于生成和校验令牌）
}

// NewAuthHandler 创建认证处理器
func NewAuthHandler(db *gorm.DB, secret string) *AuthHandler {
	return &AuthHandler{DB: db, Secret: secret}
}

// Login 登录接口：接受 account + password，校验成功返回签名令牌
func (h *AuthHandler) Login(c *gin.Context) {
	type payload struct {
		Account  string `json:"account" binding:"required"`  // 账号（等于学号）
		Password string `json:"password" binding:"required"` // 明文密码（当前阶段不加密）
	}
	var p payload
	if err := c.ShouldBindJSON(&p); err != nil {
		response.Error(c, http.StatusBadRequest, 400, err.Error())
		return
	}

	var user models.User
	if err := h.DB.Where("account = ? AND password = ?", p.Account, p.Password).First(&user).Error; err != nil {
		response.Error(c, http.StatusUnauthorized, 401, "账号或密码错误")
		return
	}

	// 记录最近登录时间（非关键路径，失败不影响登录响应）
	now := time.Now()
	user.LastLoginAt = &now
	_ = h.DB.Model(&user).Update("last_login_at", now).Error

	// 生成签名令牌并返回
	token := signToken(user.ID, h.Secret)
	response.OK(c, gin.H{"token": token}, "登录成功")
}

// Register 注册接口：接受姓名、学号、用户名、密码，账号固定为学号
func (h *AuthHandler) Register(c *gin.Context) {
	type payload struct {
		Name      string `json:"name" binding:"required"`      // 姓名
		StudentNo string `json:"studentNo" binding:"required"` // 学号
		Username  string `json:"username" binding:"required"`  // 用户名
		Password  string `json:"password" binding:"required"`  // 明文密码
	}
	var p payload
	if err := c.ShouldBindJSON(&p); err != nil {
		response.Error(c, http.StatusBadRequest, 400, err.Error())
		return
	}

	// 账号设为学号，邮箱按学号生成占位邮箱
	account := p.StudentNo
	email := account + "@local"
	var exists models.User
	if err := h.DB.Where("account = ? OR student_no = ? OR email = ?", account, p.StudentNo, email).First(&exists).Error; err == nil {
		response.Error(c, http.StatusConflict, 409, "账号或学号或邮箱已存在")
		return
	}
	// 组装用户数据
	user := models.User{
		Account:   account,
		Username:  p.Username,
		Email:     email,
		Password:  p.Password,
		Name:      p.Name,
		StudentNo: p.StudentNo,
		Role:      "student",
	}

	// 创建用户记录
	if err := h.DB.Create(&user).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, 500, err.Error())
		return
	}
	response.OK(c, gin.H{}, "注册成功")
}

// Me 根据请求头中的 Bearer token 解析用户 ID，返回当前用户信息
func (h *AuthHandler) Me(c *gin.Context) {
	auth := c.GetHeader("Authorization")
	if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
		response.Error(c, http.StatusUnauthorized, 401, "缺少令牌")
		return
	}
	token := strings.TrimPrefix(auth, "Bearer ")
	uid, err := parseToken(token, h.Secret)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, 401, "令牌无效")
		return
	}

	// 查询用户信息
	var user models.User
	if err := h.DB.First(&user, uid).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, http.StatusNotFound, 404, "用户不存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, 500, err.Error())
		return
	}
	response.OK(c, user, "ok")
}

// signToken 生成令牌：payload 为 "<userID>:<timestamp>"，使用 HMAC-SHA256 与密钥签名
func signToken(userID uint64, secret string) string {
	ts := time.Now().Unix()
	payload := fmt.Sprintf("%d:%d", userID, ts)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	sig := hex.EncodeToString(mac.Sum(nil))
	raw := payload + ":" + sig
	return base64.RawURLEncoding.EncodeToString([]byte(raw))
}

// parseToken 解析并校验令牌，返回用户 ID；若签名或格式不合法则报错
func parseToken(token string, secret string) (uint64, error) {
	b, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil {
		return 0, err
	}
	parts := strings.Split(string(b), ":")
	if len(parts) != 3 {
		return 0, errors.New("invalid token format")
	}
	payload := parts[0] + ":" + parts[1]
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	expected := hex.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(expected), []byte(parts[2])) {
		return 0, errors.New("invalid token signature")
	}
	id, err := strconv.ParseUint(parts[0], 10, 64)
	if err != nil {
		return 0, err
	}
	return id, nil
}
