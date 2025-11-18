// 路由与中间件配置
package router

// 依赖：HTTP、Gin、GORM、项目配置、处理器与统一响应
import (
    "net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"Golang/internal/config"
	"Golang/internal/handlers"
	"Golang/internal/response"
)

// SetupRouter 初始化 Gin 引擎、注册中间件与路由
func SetupRouter(db *gorm.DB, cfg *config.Config) *gin.Engine {
	// Use gin.New for custom middleware stack
	app := gin.New()
	app.Use(gin.Logger())
	app.Use(gin.Recovery())
	app.Use(cors.Default())

	// Health check
    // 健康检查：简单执行一次 SQL，失败则返回 503
    app.GET("/health", func(c *gin.Context) {
        if err := db.Exec("SELECT 1").Error; err != nil {
            response.Error(c, http.StatusServiceUnavailable, 503, "服务不可用")
            return
        }
        response.OK(c, gin.H{}, "ok")
    })

    // API v1 分组
    v1 := app.Group("/api/v1")

    // 用户资源路由
    uh := handlers.NewUserHandler(db)
	users := v1.Group("/users")
	{
		users.POST("/", uh.CreateUser)
		users.GET("/", uh.ListUsers)
		users.GET("/:id", uh.GetUser)
		users.PUT("/:id", uh.UpdateUser)
		users.DELETE("/:id", uh.DeleteUser)
	}

    // 认证路由
    ah := handlers.NewAuthHandler(db, cfg.AuthSecret)
	auth := v1.Group("/auth")
	{
		auth.POST("/login", ah.Login)
		auth.POST("/register", ah.Register)
		auth.GET("/me", ah.Me)
	}

	return app
}
