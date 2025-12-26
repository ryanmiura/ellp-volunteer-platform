package handlers

import (
	"ellp-volunter-platform/backend/internal/models"
	"ellp-volunter-platform/backend/internal/repositories"
	"ellp-volunter-platform/backend/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// VolunteerHandler gerencia as requisições de voluntários
type VolunteerHandler struct {
	volunteerService services.VolunteerService
}

// NewVolunteerHandler cria uma nova instância do handler
func NewVolunteerHandler(volunteerService services.VolunteerService) *VolunteerHandler {
	return &VolunteerHandler{
		volunteerService: volunteerService,
	}
}

// Create godoc
// @Summary Criar novo voluntário
// @Description Cria um novo voluntário no sistema
// @Tags volunteers
// @Accept json
// @Produce json
// @Param volunteer body models.CreateVolunteerRequest true "Dados do voluntário"
// @Success 201 {object} models.VolunteerResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/volunteers [post]
func (h *VolunteerHandler) Create(c *gin.Context) {
	var req models.CreateVolunteerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	volunteer, err := h.volunteerService.Create(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, volunteer)
}

// GetByID godoc
// @Summary Buscar voluntário por ID
// @Description Busca um voluntário específico por ID
// @Tags volunteers
// @Produce json
// @Param id path string true "ID do voluntário"
// @Success 200 {object} models.VolunteerResponse
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/volunteers/{id} [get]
func (h *VolunteerHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	volunteer, err := h.volunteerService.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, volunteer)
}

// GetAll godoc
// @Summary Listar todos os voluntários
// @Description Lista todos os voluntários com filtros opcionais
// @Tags volunteers
// @Produce json
// @Param name query string false "Filtrar por nome"
// @Param is_active query bool false "Filtrar por status ativo"
// @Param page query int false "Número da página" default(1)
// @Param limit query int false "Itens por página" default(10)
// @Success 200 {array} models.VolunteerResponse
// @Failure 500 {object} map[string]string
// @Router /api/volunteers [get]
func (h *VolunteerHandler) GetAll(c *gin.Context) {
	filter := repositories.VolunteerFilter{
		Name: c.Query("name"),
	}

	// Parse is_active parameter
	if isActiveStr := c.Query("is_active"); isActiveStr != "" {
		isActive := isActiveStr == "true"
		filter.IsActive = &isActive
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

	volunteers, err := h.volunteerService.GetAll(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, volunteers)
}

// Update godoc
// @Summary Atualizar voluntário
// @Description Atualiza os dados de um voluntário existente
// @Tags volunteers
// @Accept json
// @Produce json
// @Param id path string true "ID do voluntário"
// @Param volunteer body models.UpdateVolunteerRequest true "Dados atualizados"
// @Success 200 {object} models.VolunteerResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/volunteers/{id} [put]
func (h *VolunteerHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateVolunteerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	volunteer, err := h.volunteerService.Update(c.Request.Context(), id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, volunteer)
}

// Delete godoc
// @Summary Deletar voluntário
// @Description Remove um voluntário do sistema
// @Tags volunteers
// @Produce json
// @Param id path string true "ID do voluntário"
// @Success 204
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/volunteers/{id} [delete]
func (h *VolunteerHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := h.volunteerService.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// Inactivate godoc
// @Summary Inativar voluntário
// @Description Marca um voluntário como inativo e registra data de saída
// @Tags volunteers
// @Accept json
// @Produce json
// @Param id path string true "ID do voluntário"
// @Param request body models.InactivateVolunteerRequest true "Data de saída"
// @Success 200 {object} models.VolunteerResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/volunteers/{id}/inactivate [post]
func (h *VolunteerHandler) Inactivate(c *gin.Context) {
	id := c.Param("id")

	var req models.InactivateVolunteerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	volunteer, err := h.volunteerService.Inactivate(c.Request.Context(), id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, volunteer)
}

// AddWorkshop godoc
// @Summary Adicionar oficina ao voluntário
// @Description Adiciona uma oficina ao histórico do voluntário
// @Tags volunteers
// @Produce json
// @Param id path string true "ID do voluntário"
// @Param workshop_id path string true "ID da oficina"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/volunteers/{id}/workshops/{workshop_id} [post]
func (h *VolunteerHandler) AddWorkshop(c *gin.Context) {
	volunteerID := c.Param("id")
	workshopID := c.Param("workshop_id")

	if err := h.volunteerService.AddWorkshop(c.Request.Context(), volunteerID, workshopID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Oficina adicionada com sucesso"})
}

// RemoveWorkshop godoc
// @Summary Remover oficina do voluntário
// @Description Remove uma oficina do histórico do voluntário
// @Tags volunteers
// @Produce json
// @Param id path string true "ID do voluntário"
// @Param workshop_id path string true "ID da oficina"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/volunteers/{id}/workshops/{workshop_id} [delete]
func (h *VolunteerHandler) RemoveWorkshop(c *gin.Context) {
	volunteerID := c.Param("id")
	workshopID := c.Param("workshop_id")

	if err := h.volunteerService.RemoveWorkshop(c.Request.Context(), volunteerID, workshopID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Oficina removida com sucesso"})
}
