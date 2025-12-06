package routes

import (
	"ellp-volunter-platform/backend/internal/handlers"
	"ellp-volunter-platform/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAuthRoutes configura todas as rotas de autenticação
func SetupAuthRoutes(router *gin.Engine, authHandler *handlers.AuthHandler) {
	// Rotas públicas de autenticação
	authRoutes := router.Group("/api/auth")
	{
		authRoutes.POST("/login", authHandler.Login)
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/logout", authHandler.Logout)
		authRoutes.POST("/refresh", authHandler.RefreshToken)
	}

	// Rotas protegidas de autenticação (requerem token válido)
	protectedAuthRoutes := router.Group("/api/auth")
	protectedAuthRoutes.Use(middleware.AuthMiddleware())
	{
		protectedAuthRoutes.GET("/me", authHandler.Me)
	}
}
