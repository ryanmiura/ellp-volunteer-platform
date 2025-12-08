package routes

import (
	"ellp-volunter-platform/backend/internal/handlers"
	"ellp-volunter-platform/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupWorkshopRoutes configura as rotas de oficinas
func SetupWorkshopRoutes(router *gin.Engine, workshopHandler *handlers.WorkshopHandler, authMiddleware *middleware.AuthMiddleware) {
	// Grupo de rotas de oficinas
	workshops := router.Group("/api/workshops")
	{
		// Rotas protegidas - requer autenticação
		workshops.Use(authMiddleware.RequireAuth())
		{
			// CRUD básico
			workshops.POST("", workshopHandler.Create)           // Criar oficina
			workshops.GET("", workshopHandler.GetAll)            // Listar todas
			workshops.GET("/:id", workshopHandler.GetByID)       // Buscar por ID
			workshops.PUT("/:id", workshopHandler.Update)        // Atualizar
			workshops.DELETE("/:id", workshopHandler.Delete)     // Deletar

			// Gerenciamento de voluntários
			workshops.POST("/:id/volunteers/:volunteer_id", workshopHandler.AddVolunteer)       // Adicionar voluntário
			workshops.DELETE("/:id/volunteers/:volunteer_id", workshopHandler.RemoveVolunteer)  // Remover voluntário
		}
	}

	// Rota para buscar oficinas de um voluntário específico
	volunteers := router.Group("/api/volunteers")
	{
		volunteers.Use(authMiddleware.RequireAuth())
		{
			volunteers.GET("/:volunteer_id/workshops", workshopHandler.GetByVolunteer) // Listar oficinas do voluntário
		}
	}
}
