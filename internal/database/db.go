package database

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

// Connect initializes a GORM DB connection based on configuration.
func Connect(cfg *config.Config) (*gorm.DB, error) {
	var (
		db  *gorm.DB
		err error
	)

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

	// Configure connection pool
	sqlDB, err := dbDB(db)
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxOpenConns(20)
	sqlDB.SetMaxIdleConns(10)
	// sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}

// dbDB extracts *sql.DB from GORM for pool settings.
func dbDB(db *gorm.DB) (*sql.DB, error) {
	return db.DB()
}