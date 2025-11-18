// 应用入口：加载配置→连接数据库→注册路由→启动服务
package main

// 依赖导入：日志、项目配置/数据库/路由
import (
    "log"

	"Golang/internal/config"
	"Golang/internal/database"
	"Golang/internal/router"
)

func main() {
    // 加载配置
    cfg := config.Load()

    // 建立数据库连接
    db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

    // 注册路由与中间件
    app := router.SetupRouter(db, cfg)

    // 启动 HTTP 服务
    if err := app.Run(":" + cfg.Port); err != nil {
        log.Fatalf("server exited with error: %v", err)
    }
}
