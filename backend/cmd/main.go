package main

import (
	"context"
	"log"
	"os"

	"ellp-volunter-platform/backend/internal/config"
	"ellp-volunter-platform/backend/internal/handlers"
	"ellp-volunter-platform/backend/internal/middleware"
	"ellp-volunter-platform/backend/internal/repositories"
	"ellp-volunter-platform/backend/internal/routes"
	"ellp-volunter-platform/backend/internal/services"

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
	db := client.Database("ellp_db")

	// Inicializar repositórios
	userRepo := repositories.NewMongoUserRepository(db)

	// Inicializar serviços
	authService := services.NewAuthService(userRepo)

	// Inicializar handlers
	authHandler := handlers.NewAuthHandler(authService)

	// Configurar router
	r := gin.Default()

	// Aplicar middlewares globais
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.LoggingMiddleware())

	// Rotas de auth
	routes.SetupAuthRoutes(r, authHandler)


	// Iniciar servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Servidor rodando na porta %s", port)
	r.Run(":" + port)
}
