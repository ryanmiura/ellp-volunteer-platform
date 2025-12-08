package routes

import (
	"ellp-volunter-platform/backend/internal/handlers"
	"ellp-volunter-platform/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupVolunteerRoutes configura as rotas de voluntários
func SetupVolunteerRoutes(router *gin.Engine, volunteerHandler *handlers.VolunteerHandler, authMiddleware *middleware.AuthMiddleware) {
	// Grupo de rotas de voluntários
	volunteers := router.Group("/api/volunteers")
	{
		// Rotas públicas (se houver)
		
		// Rotas protegidas - requer autenticação
		volunteers.Use(authMiddleware.RequireAuth())
		{
			// CRUD básico
			volunteers.POST("", volunteerHandler.Create)           // Criar voluntário
			volunteers.GET("", volunteerHandler.GetAll)            // Listar todos
			volunteers.GET("/:id", volunteerHandler.GetByID)       // Buscar por ID
			volunteers.PUT("/:id", volunteerHandler.Update)        // Atualizar
			volunteers.DELETE("/:id", volunteerHandler.Delete)     // Deletar

			// Operações específicas
			volunteers.POST("/:id/inactivate", volunteerHandler.Inactivate) // Inativar

			// Gerenciamento de oficinas
			volunteers.POST("/:id/workshops/:workshop_id", volunteerHandler.AddWorkshop)       // Adicionar oficina
			volunteers.DELETE("/:id/workshops/:workshop_id", volunteerHandler.RemoveWorkshop)  // Remover oficina
		}
	}
}
