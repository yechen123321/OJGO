package config

import (
	"os"

	"github.com/joho/godotenv"
)

// Config holds application configuration values.
type Config struct {
	Port     string
	DBDriver string
	DBDsn    string
}

// Load loads configuration from environment variables, optionally from a .env file.
func Load() *Config {
	// Load .env if present; ignore errors if not found
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	driver := os.Getenv("DB_DRIVER")
	if driver == "" {
		driver = "sqlite" // default to sqlite for easy local dev
	}

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "file:app.db?_fk=1" // sqlite DSN, enables foreign keys
	}

	return &Config{
		Port:     port,
		DBDriver: driver,
		DBDsn:    dsn,
	}
}
