package router

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"Golang/internal/handlers"
)

// SetupRouter configures Gin engine with routes and middleware.
func SetupRouter(db *gorm.DB) *gin.Engine {
	// Use gin.New for custom middleware stack
	app := gin.New()
	app.Use(gin.Logger())
	app.Use(gin.Recovery())
	app.Use(cors.Default())

	// Health check
	app.GET("/health", func(c *gin.Context) {
		// Minimal health info; if DB is reachable, return ok
		if err := db.Exec("SELECT 1").Error; err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "degraded", "db": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// API v1 group
	v1 := app.Group("/api/v1")

	// Users routes
	uh := handlers.NewUserHandler(db)
	users := v1.Group("/users")
	{
		users.POST("/", uh.CreateUser)
		users.GET("/", uh.ListUsers)
		users.GET("/:id", uh.GetUser)
		users.PUT("/:id", uh.UpdateUser)
		users.DELETE("/:id", uh.DeleteUser)
	}

	return app
}
