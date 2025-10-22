package main

import (
	"log"

	"Golang/internal/config"
	"Golang/internal/database"
	"Golang/internal/models"
	"Golang/internal/router"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Auto-migrate models
	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// Cleanup legacy columns: drop old 'name' column if exists
	if db.Migrator().HasColumn(&models.User{}, "name") {
		if err := db.Migrator().DropColumn(&models.User{}, "name"); err != nil {
			log.Fatalf("failed to drop legacy column 'name': %v", err)
		}
	}

	app := router.SetupRouter(db)

	if err := app.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server exited with error: %v", err)
	}
}