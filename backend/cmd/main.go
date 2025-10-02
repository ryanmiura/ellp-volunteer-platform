package main

import (
	"context"
	"log"

	"ellp-volunter-platform/backend/internal/config"

	"github.com/gin-gonic/gin"
)

func main() {
	// Conectar ao MongoDB
	client := config.ConnectDB()
	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Fatal(err)
		}
	}()

	r := gin.Default()

	r.GET("/api/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong from backend",
		})
	})

	r.Run(":8080")
}
