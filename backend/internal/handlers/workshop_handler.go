package handlers

import (
	"ellp-volunter-platform/backend/internal/models"
	"ellp-volunter-platform/backend/internal/repositories"
	"ellp-volunter-platform/backend/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// WorkshopHandler gerencia as requisições de oficinas
type WorkshopHandler struct {
	workshopService services.WorkshopService
}

// NewWorkshopHandler cria uma nova instância do handler
func NewWorkshopHandler(workshopService services.WorkshopService) *WorkshopHandler {
	return &WorkshopHandler{
		workshopService: workshopService,
	}
}

// Create godoc
// @Summary Criar nova oficina
// @Description Cria uma nova oficina no sistema
// @Tags workshops
// @Accept json
// @Produce json
// @Param workshop body models.CreateWorkshopRequest true "Dados da oficina"
// @Success 201 {object} models.WorkshopResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/workshops [post]
func (h *WorkshopHandler) Create(c *gin.Context) {
	var req models.CreateWorkshopRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	workshop, err := h.workshopService.Create(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, workshop)
}

// GetByID godoc
// @Summary Buscar oficina por ID
// @Description Busca uma oficina específica por ID
// @Tags workshops
// @Produce json
// @Param id path string true "ID da oficina"
// @Success 200 {object} models.WorkshopResponse
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/workshops/{id} [get]
func (h *WorkshopHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	workshop, err := h.workshopService.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workshop)
}

// GetAll godoc
// @Summary Listar todas as oficinas
// @Description Lista todas as oficinas com filtros opcionais
// @Tags workshops
// @Produce json
// @Param name query string false "Filtrar por nome"
// @Param month query string false "Filtrar por mês (YYYY-MM)"
// @Param year query string false "Filtrar por ano (YYYY)"
// @Param page query int false "Número da página" default(1)
// @Param limit query int false "Itens por página" default(10)
// @Success 200 {array} models.WorkshopResponse
// @Failure 500 {object} map[string]string
// @Router /api/workshops [get]
func (h *WorkshopHandler) GetAll(c *gin.Context) {
	filter := repositories.WorkshopFilter{
		Name:  c.Query("name"),
		Month: c.Query("month"),
		Year:  c.Query("year"),
	}

	// Parse pagination parameters
	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil && page > 0 {
			filter.Page = page
		}
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			filter.Limit = limit
		}
	}

	workshops, err := h.workshopService.GetAll(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workshops)
}

// Update godoc
// @Summary Atualizar oficina
// @Description Atualiza os dados de uma oficina existente
// @Tags workshops
// @Accept json
// @Produce json
// @Param id path string true "ID da oficina"
// @Param workshop body models.UpdateWorkshopRequest true "Dados atualizados"
// @Success 200 {object} models.WorkshopResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/workshops/{id} [put]
func (h *WorkshopHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateWorkshopRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	workshop, err := h.workshopService.Update(c.Request.Context(), id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workshop)
}

// Delete godoc
// @Summary Deletar oficina
// @Description Remove uma oficina do sistema
// @Tags workshops
// @Produce json
// @Param id path string true "ID da oficina"
// @Success 204
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/workshops/{id} [delete]
func (h *WorkshopHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := h.workshopService.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// AddVolunteer godoc
// @Summary Adicionar voluntário à oficina
// @Description Adiciona um voluntário à lista de participantes da oficina
// @Tags workshops
// @Produce json
// @Param id path string true "ID da oficina"
// @Param volunteer_id path string true "ID do voluntário"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/workshops/{id}/volunteers/{volunteer_id} [post]
func (h *WorkshopHandler) AddVolunteer(c *gin.Context) {
	workshopID := c.Param("id")
	volunteerID := c.Param("volunteer_id")

	if err := h.workshopService.AddVolunteer(c.Request.Context(), workshopID, volunteerID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Voluntário adicionado com sucesso"})
}

// RemoveVolunteer godoc
// @Summary Remover voluntário da oficina
// @Description Remove um voluntário da lista de participantes da oficina
// @Tags workshops
// @Produce json
// @Param id path string true "ID da oficina"
// @Param volunteer_id path string true "ID do voluntário"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/workshops/{id}/volunteers/{volunteer_id} [delete]
func (h *WorkshopHandler) RemoveVolunteer(c *gin.Context) {
	workshopID := c.Param("id")
	volunteerID := c.Param("volunteer_id")

	if err := h.workshopService.RemoveVolunteer(c.Request.Context(), workshopID, volunteerID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Voluntário removido com sucesso"})
}

// GetByVolunteer godoc
// @Summary Listar oficinas de um voluntário
// @Description Busca todas as oficinas em que um voluntário participou
// @Tags workshops
// @Produce json
// @Param volunteer_id path string true "ID do voluntário"
// @Success 200 {array} models.WorkshopResponse
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/volunteers/{volunteer_id}/workshops [get]
func (h *WorkshopHandler) GetByVolunteer(c *gin.Context) {
	volunteerID := c.Param("volunteer_id")

	workshops, err := h.workshopService.GetByVolunteer(c.Request.Context(), volunteerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workshops)
}
