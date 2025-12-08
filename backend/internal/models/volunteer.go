package models

import (
	"errors"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Volunteer representa um voluntário do projeto ELLP
type Volunteer struct {
	ID         primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name       string             `json:"name" bson:"name" binding:"required"`
	Email      string             `json:"email" bson:"email" binding:"required,email"`
	Phone      string             `json:"phone" bson:"phone"`
	IsAcademic bool               `json:"is_academic" bson:"is_academic"`
	Course     string             `json:"course" bson:"course"`
	RA         string             `json:"ra" bson:"ra"`
	EntryDate  time.Time          `json:"entry_date" bson:"entry_date" binding:"required"`
	ExitDate   *time.Time         `json:"exit_date,omitempty" bson:"exit_date,omitempty"`
	IsActive   bool               `json:"is_active" bson:"is_active"`
	Workshops  []string           `json:"workshops" bson:"workshops"` // IDs das oficinas
	CreatedAt  time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at" bson:"updated_at"`
}

// CreateVolunteerRequest representa o payload para criar um voluntário
type CreateVolunteerRequest struct {
	Name       string    `json:"name" binding:"required"`
	Email      string    `json:"email" binding:"required,email"`
	Phone      string    `json:"phone"`
	IsAcademic bool      `json:"is_academic"`
	Course     string    `json:"course"`
	RA         string    `json:"ra"`
	EntryDate  time.Time `json:"entry_date" binding:"required"`
}

// UpdateVolunteerRequest representa o payload para atualizar um voluntário
type UpdateVolunteerRequest struct {
	Name       string    `json:"name"`
	Email      string    `json:"email" binding:"omitempty,email"`
	Phone      string    `json:"phone"`
	IsAcademic *bool     `json:"is_academic"`
	Course     string    `json:"course"`
	RA         string    `json:"ra"`
	EntryDate  time.Time `json:"entry_date"`
}

// InactivateVolunteerRequest representa o payload para inativar um voluntário
type InactivateVolunteerRequest struct {
	ExitDate time.Time `json:"exit_date" binding:"required"`
}

// VolunteerResponse representa a resposta da API
type VolunteerResponse struct {
	ID         primitive.ObjectID `json:"id"`
	Name       string             `json:"name"`
	Email      string             `json:"email"`
	Phone      string             `json:"phone"`
	IsAcademic bool               `json:"is_academic"`
	Course     string             `json:"course"`
	RA         string             `json:"ra"`
	EntryDate  time.Time          `json:"entry_date"`
	ExitDate   *time.Time         `json:"exit_date,omitempty"`
	IsActive   bool               `json:"is_active"`
	Workshops  []string           `json:"workshops"`
	CreatedAt  time.Time          `json:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at"`
}

// Validate valida os dados do voluntário
func (v *Volunteer) Validate() error {
	if v.Name == "" {
		return errors.New("nome é obrigatório")
	}

	if v.Email == "" {
		return errors.New("email é obrigatório")
	}

	// Validar formato do email
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(v.Email) {
		return errors.New("email inválido")
	}

	// Se é acadêmico, curso e RA devem ser preenchidos
	if v.IsAcademic {
		if v.Course == "" {
			return errors.New("curso é obrigatório para acadêmicos")
		}
		if v.RA == "" {
			return errors.New("RA é obrigatório para acadêmicos")
		}
	}

	if v.EntryDate.IsZero() {
		return errors.New("data de entrada é obrigatória")
	}

	// Data de entrada não pode ser futura
	if v.EntryDate.After(time.Now()) {
		return errors.New("data de entrada não pode ser futura")
	}

	// Se tem data de saída, deve ser posterior à data de entrada
	if v.ExitDate != nil && v.ExitDate.Before(v.EntryDate) {
		return errors.New("data de saída deve ser posterior à data de entrada")
	}

	return nil
}

// ToResponse converte um Volunteer para VolunteerResponse
func (v *Volunteer) ToResponse() VolunteerResponse {
	return VolunteerResponse{
		ID:         v.ID,
		Name:       v.Name,
		Email:      v.Email,
		Phone:      v.Phone,
		IsAcademic: v.IsAcademic,
		Course:     v.Course,
		RA:         v.RA,
		EntryDate:  v.EntryDate,
		ExitDate:   v.ExitDate,
		IsActive:   v.IsActive,
		Workshops:  v.Workshops,
		CreatedAt:  v.CreatedAt,
		UpdatedAt:  v.UpdatedAt,
	}
}

// NewVolunteerFromRequest cria um novo voluntário a partir do request
func NewVolunteerFromRequest(req CreateVolunteerRequest) *Volunteer {
	now := time.Now()
	return &Volunteer{
		Name:       req.Name,
		Email:      req.Email,
		Phone:      req.Phone,
		IsAcademic: req.IsAcademic,
		Course:     req.Course,
		RA:         req.RA,
		EntryDate:  req.EntryDate,
		IsActive:   true,
		Workshops:  []string{},
		CreatedAt:  now,
		UpdatedAt:  now,
	}
}
