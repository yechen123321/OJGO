// 数据库连接管理
package database

// 依赖导入：标准库、GORM 驱动与日志、项目配置
import (
    "database/sql"
    "fmt"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"Golang/internal/config"
)

// Connect 根据配置初始化 GORM 数据库连接，并设置连接池
func Connect(cfg *config.Config) (*gorm.DB, error) {
	var (
		db  *gorm.DB
		err error
	)

    // 启用 GORM Info 日志，便于观察 SQL
    gormLogger := logger.Default.LogMode(logger.Info)

	switch cfg.DBDriver {
	case "sqlite":
		db, err = gorm.Open(sqlite.Open(cfg.DBDsn), &gorm.Config{Logger: gormLogger})
	case "mysql":
		// Example DSN: user:password@tcp(127.0.0.1:3306)/dbname?parseTime=true&loc=Local
		db, err = gorm.Open(mysql.Open(cfg.DBDsn), &gorm.Config{Logger: gormLogger})
	case "postgres", "postgresql":
		// Example DSN: host=localhost user=user password=pass dbname=db port=5432 sslmode=disable TimeZone=Asia/Shanghai
		db, err = gorm.Open(postgres.Open(cfg.DBDsn), &gorm.Config{Logger: gormLogger})
	default:
		return nil, fmt.Errorf("unsupported DB_DRIVER: %s", cfg.DBDriver)
	}

	if err != nil {
		return nil, err
	}

    // 配置连接池
    sqlDB, err := dbDB(db)
    if err != nil {
        return nil, err
    }
    sqlDB.SetMaxOpenConns(20)
    sqlDB.SetMaxIdleConns(10)
    // sqlDB.SetConnMaxLifetime(time.Hour)

    return db, nil
}

// dbDB 从 GORM 获取底层 *sql.DB，用于设置连接池
func dbDB(db *gorm.DB) (*sql.DB, error) {
    return db.DB()
}
