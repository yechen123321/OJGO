// 统一响应体封装
package response

// 依赖：HTTP 状态码与 Gin 上下文
import (
    "net/http"

    "github.com/gin-gonic/gin"
)

// Envelope 标准返回体结构
type Envelope struct {
    Code    int         `json:"code"`       // 业务码（200 成功；其余按模块定义）
    Data    interface{} `json:"data"`      // 业务数据
    Message string      `json:"message"`   // 文本信息
}

// OK 成功响应（HTTP 200）
func OK(c *gin.Context, data interface{}, message string) {
    c.JSON(http.StatusOK, Envelope{Code: 200, Data: data, Message: message})
}

// Error 错误响应（HTTP 状态码与业务码分离）
func Error(c *gin.Context, httpStatus int, code int, message string) {
    c.JSON(httpStatus, Envelope{Code: code, Data: gin.H{}, Message: message})
}
