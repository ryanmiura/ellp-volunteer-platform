package services

import (
	"context"
	"ellp-volunter-platform/backend/internal/models"
	"ellp-volunter-platform/backend/internal/repositories"
	"errors"
)

// WorkshopService define a interface de serviço para oficinas
type WorkshopService interface {
	Create(ctx context.Context, req models.CreateWorkshopRequest) (*models.WorkshopResponse, error)
	GetByID(ctx context.Context, id string) (*models.WorkshopResponse, error)
	GetAll(ctx context.Context, filter repositories.WorkshopFilter) ([]*models.WorkshopResponse, error)
	Update(ctx context.Context, id string, req models.UpdateWorkshopRequest) (*models.WorkshopResponse, error)
	Delete(ctx context.Context, id string) error
	AddVolunteer(ctx context.Context, workshopID string, volunteerID string) error
	RemoveVolunteer(ctx context.Context, workshopID string, volunteerID string) error
	GetByVolunteer(ctx context.Context, volunteerID string) ([]*models.WorkshopResponse, error)
}

// workshopService implementa WorkshopService
type workshopService struct {
	workshopRepo  repositories.WorkshopRepository
	volunteerRepo repositories.VolunteerRepository
}

// NewWorkshopService cria uma nova instância do serviço
func NewWorkshopService(workshopRepo repositories.WorkshopRepository, volunteerRepo repositories.VolunteerRepository) WorkshopService {
	return &workshopService{
		workshopRepo:  workshopRepo,
		volunteerRepo: volunteerRepo,
	}
}

// Create cria uma nova oficina
func (s *workshopService) Create(ctx context.Context, req models.CreateWorkshopRequest) (*models.WorkshopResponse, error) {
	// Valida dados de entrada
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// Verifica se já existe uma oficina com o mesmo nome e data
	existingWorkshop, err := s.workshopRepo.FindByName(ctx, req.Name)
	if err != nil {
		return nil, err
	}
	if existingWorkshop != nil {
		return nil, errors.New("já existe uma oficina com este nome")
	}

	// Cria nova oficina
	workshop, err := models.NewWorkshopFromRequest(req)
	if err != nil {
		return nil, err
	}

	if err := s.workshopRepo.Create(ctx, workshop); err != nil {
		return nil, err
	}

	response := workshop.ToResponse()
	return &response, nil
}

// GetByID busca uma oficina por ID
func (s *workshopService) GetByID(ctx context.Context, id string) (*models.WorkshopResponse, error) {
	workshop, err := s.workshopRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	response := workshop.ToResponse()
	return &response, nil
}

// GetAll busca todas as oficinas com filtros
func (s *workshopService) GetAll(ctx context.Context, filter repositories.WorkshopFilter) ([]*models.WorkshopResponse, error) {
	workshops, err := s.workshopRepo.FindAll(ctx, filter)
	if err != nil {
		return nil, err
	}

	responses := make([]*models.WorkshopResponse, len(workshops))
	for i, workshop := range workshops {
		response := workshop.ToResponse()
		responses[i] = &response
	}

	return responses, nil
}

// Update atualiza uma oficina existente
func (s *workshopService) Update(ctx context.Context, id string, req models.UpdateWorkshopRequest) (*models.WorkshopResponse, error) {
	// Valida dados de entrada
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// Busca oficina existente
	workshop, err := s.workshopRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Verifica se está tentando mudar o nome para um que já existe
	if req.Name != nil && *req.Name != workshop.Name {
		existingWorkshop, err := s.workshopRepo.FindByName(ctx, *req.Name)
		if err != nil {
			return nil, err
		}
		if existingWorkshop != nil && existingWorkshop.ID.Hex() != id {
			return nil, errors.New("já existe uma oficina com este nome")
		}
	}

	// Atualiza campos se fornecidos
	if req.Name != nil {
		workshop.Name = *req.Name
	}
	if req.Date != nil {
		date, err := models.NewWorkshopFromRequest(models.CreateWorkshopRequest{
			Name: workshop.Name,
			Date: *req.Date,
		})
		if err != nil {
			return nil, err
		}
		workshop.Date = date.Date
	}
	if req.Description != nil {
		workshop.Description = *req.Description
	}

	if err := s.workshopRepo.Update(ctx, id, workshop); err != nil {
		return nil, err
	}

	response := workshop.ToResponse()
	return &response, nil
}

// Delete remove uma oficina
func (s *workshopService) Delete(ctx context.Context, id string) error {
	// Verifica se a oficina existe
	_, err := s.workshopRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	return s.workshopRepo.Delete(ctx, id)
}

// AddVolunteer adiciona um voluntário à oficina
func (s *workshopService) AddVolunteer(ctx context.Context, workshopID string, volunteerID string) error {
	// Verifica se a oficina existe
	_, err := s.workshopRepo.FindByID(ctx, workshopID)
	if err != nil {
		return err
	}

	// Verifica se o voluntário existe e está ativo
	volunteer, err := s.volunteerRepo.FindByID(ctx, volunteerID)
	if err != nil {
		return err
	}
	if !volunteer.IsActive {
		return errors.New("voluntário não está ativo")
	}

	// Adiciona voluntário à oficina
	if err := s.workshopRepo.AddVolunteer(ctx, workshopID, volunteerID); err != nil {
		return err
	}

	// Adiciona oficina ao voluntário
	return s.volunteerRepo.AddWorkshop(ctx, volunteerID, workshopID)
}

// RemoveVolunteer remove um voluntário da oficina
func (s *workshopService) RemoveVolunteer(ctx context.Context, workshopID string, volunteerID string) error {
	// Verifica se a oficina existe
	_, err := s.workshopRepo.FindByID(ctx, workshopID)
	if err != nil {
		return err
	}

	// Verifica se o voluntário existe
	_, err = s.volunteerRepo.FindByID(ctx, volunteerID)
	if err != nil {
		return err
	}

	// Remove voluntário da oficina
	if err := s.workshopRepo.RemoveVolunteer(ctx, workshopID, volunteerID); err != nil {
		return err
	}

	// Remove oficina do voluntário
	return s.volunteerRepo.RemoveWorkshop(ctx, volunteerID, workshopID)
}

// GetByVolunteer busca todas as oficinas de um voluntário
func (s *workshopService) GetByVolunteer(ctx context.Context, volunteerID string) ([]*models.WorkshopResponse, error) {
	// Verifica se o voluntário existe
	_, err := s.volunteerRepo.FindByID(ctx, volunteerID)
	if err != nil {
		return nil, err
	}

	workshops, err := s.workshopRepo.FindByVolunteer(ctx, volunteerID)
	if err != nil {
		return nil, err
	}

	responses := make([]*models.WorkshopResponse, len(workshops))
	for i, workshop := range workshops {
		response := workshop.ToResponse()
		responses[i] = &response
	}

	return responses, nil
}
