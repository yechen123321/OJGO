// 应用配置加载
package config

import (
	"os"

	"github.com/joho/godotenv"
)

// Config 应用配置结构
type Config struct {
	Port       string // 服务端口
	DBDriver   string // 数据库驱动：sqlite/mysql/postgres
	DBDsn      string // 数据源连接串
	AuthSecret string // 令牌签名密钥
}

// Load 加载环境变量配置，若存在 .env 则优先读取
func Load() *Config {
	// Load .env if present; ignore errors if not found
	_ = godotenv.Load()

	// 服务端口
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 数据库驱动
	driver := os.Getenv("DB_DRIVER")
	if driver == "" {
		driver = "sqlite" // default to sqlite for easy local dev
	}

	// 数据库 DSN
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "file:app.db?_fk=1" // sqlite DSN, enables foreign keys
	}

	// 令牌签名密钥
	secret := os.Getenv("AUTH_SECRET")
	if secret == "" {
		secret = "ojgo-dev-secret"
	}

	// 返回配置实例
	return &Config{
		Port:       port,
		DBDriver:   driver,
		DBDsn:      dsn,
		AuthSecret: secret,
	}
}
