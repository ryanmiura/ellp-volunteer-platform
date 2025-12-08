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
	volunteerRepo := repositories.NewMongoVolunteerRepository(db)

	// Inicializar serviços
	authService := services.NewAuthService(userRepo)
	volunteerService := services.NewVolunteerService(volunteerRepo)

	// Inicializar handlers
	authHandler := handlers.NewAuthHandler(authService)
	volunteerHandler := handlers.NewVolunteerHandler(volunteerService)

	// Configurar router
	r := gin.Default()

	// Aplicar middlewares globais
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.LoggingMiddleware())

	// Inicializar middleware de autenticação
	authMiddleware := middleware.NewAuthMiddleware(userRepo)

	// Rotas de auth
	routes.SetupAuthRoutes(r, authHandler)

	// Rotas de voluntários
	routes.SetupVolunteerRoutes(r, volunteerHandler, authMiddleware)


	// Iniciar servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Servidor rodando na porta %s", port)
	r.Run(":" + port)
}
