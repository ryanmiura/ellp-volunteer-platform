package services

import (
	"context"
	"ellp-volunter-platform/backend/internal/models"
	"ellp-volunter-platform/backend/internal/repositories"
	"errors"
	"time"
)

// VolunteerService define a interface para o serviço de voluntários
type VolunteerService interface {
	Create(ctx context.Context, req models.CreateVolunteerRequest) (*models.VolunteerResponse, error)
	GetByID(ctx context.Context, id string) (*models.VolunteerResponse, error)
	GetAll(ctx context.Context, filter repositories.VolunteerFilter) ([]*models.VolunteerResponse, error)
	Update(ctx context.Context, id string, req models.UpdateVolunteerRequest) (*models.VolunteerResponse, error)
	Delete(ctx context.Context, id string) error
	Inactivate(ctx context.Context, id string, req models.InactivateVolunteerRequest) (*models.VolunteerResponse, error)
	AddWorkshop(ctx context.Context, volunteerID string, workshopID string) error
	RemoveWorkshop(ctx context.Context, volunteerID string, workshopID string) error
}

// volunteerService implementa VolunteerService
type volunteerService struct {
	repo repositories.VolunteerRepository
}

// NewVolunteerService cria uma nova instância do serviço
func NewVolunteerService(repo repositories.VolunteerRepository) VolunteerService {
	return &volunteerService{
		repo: repo,
	}
}

// Create cria um novo voluntário
func (s *volunteerService) Create(ctx context.Context, req models.CreateVolunteerRequest) (*models.VolunteerResponse, error) {
	// Verificar se já existe voluntário com o mesmo email
	existingVolunteer, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if existingVolunteer != nil {
		return nil, errors.New("já existe um voluntário com este email")
	}

	// Criar novo voluntário
	volunteer := models.NewVolunteerFromRequest(req)

	// Validar
	if err := volunteer.Validate(); err != nil {
		return nil, err
	}

	// Salvar no banco
	if err := s.repo.Create(ctx, volunteer); err != nil {
		return nil, err
	}

	response := volunteer.ToResponse()
	return &response, nil
}

// GetByID busca um voluntário por ID
func (s *volunteerService) GetByID(ctx context.Context, id string) (*models.VolunteerResponse, error) {
	volunteer, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	response := volunteer.ToResponse()
	return &response, nil
}

// GetAll busca todos os voluntários com filtros
func (s *volunteerService) GetAll(ctx context.Context, filter repositories.VolunteerFilter) ([]*models.VolunteerResponse, error) {
	volunteers, err := s.repo.FindAll(ctx, filter)
	if err != nil {
		return nil, err
	}

	responses := make([]*models.VolunteerResponse, len(volunteers))
	for i, volunteer := range volunteers {
		response := volunteer.ToResponse()
		responses[i] = &response
	}

	return responses, nil
}

// Update atualiza um voluntário
func (s *volunteerService) Update(ctx context.Context, id string, req models.UpdateVolunteerRequest) (*models.VolunteerResponse, error) {
	// Buscar voluntário existente
	volunteer, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Se email está sendo alterado, verificar se não existe outro voluntário com o mesmo
	if req.Email != "" && req.Email != volunteer.Email {
		existingVolunteer, err := s.repo.FindByEmail(ctx, req.Email)
		if err != nil {
			return nil, err
		}
		if existingVolunteer != nil && existingVolunteer.ID != volunteer.ID {
			return nil, errors.New("já existe um voluntário com este email")
		}
	}

	// Atualizar campos se fornecidos
	if req.Name != "" {
		volunteer.Name = req.Name
	}
	if req.Email != "" {
		volunteer.Email = req.Email
	}
	if req.Phone != "" {
		volunteer.Phone = req.Phone
	}
	if req.IsAcademic != nil {
		volunteer.IsAcademic = *req.IsAcademic
	}
	if req.Course != "" {
		volunteer.Course = req.Course
	}
	if req.RA != "" {
		volunteer.RA = req.RA
	}
	if !req.EntryDate.IsZero() {
		volunteer.EntryDate = req.EntryDate
	}

	volunteer.UpdatedAt = time.Now()

	// Validar
	if err := volunteer.Validate(); err != nil {
		return nil, err
	}

	// Atualizar no banco
	if err := s.repo.Update(ctx, id, volunteer); err != nil {
		return nil, err
	}

	response := volunteer.ToResponse()
	return &response, nil
}

// Delete deleta um voluntário
func (s *volunteerService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

// Inactivate inativa um voluntário
func (s *volunteerService) Inactivate(ctx context.Context, id string, req models.InactivateVolunteerRequest) (*models.VolunteerResponse, error) {
	// Buscar voluntário
	volunteer, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Verificar se já está inativo
	if !volunteer.IsActive {
		return nil, errors.New("voluntário já está inativo")
	}

	// Validar data de saída
	if req.ExitDate.Before(volunteer.EntryDate) {
		return nil, errors.New("data de saída deve ser posterior à data de entrada")
	}

	// Inativar
	if err := s.repo.Inactivate(ctx, id, req.ExitDate); err != nil {
		return nil, err
	}

	// Buscar voluntário atualizado
	volunteer, err = s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	response := volunteer.ToResponse()
	return &response, nil
}

// AddWorkshop adiciona uma oficina ao histórico do voluntário
func (s *volunteerService) AddWorkshop(ctx context.Context, volunteerID string, workshopID string) error {
	return s.repo.AddWorkshop(ctx, volunteerID, workshopID)
}

// RemoveWorkshop remove uma oficina do histórico do voluntário
func (s *volunteerService) RemoveWorkshop(ctx context.Context, volunteerID string, workshopID string) error {
	return s.repo.RemoveWorkshop(ctx, volunteerID, workshopID)
}
