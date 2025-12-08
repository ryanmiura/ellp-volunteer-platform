package models

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Workshop representa uma oficina do projeto ELLP
type Workshop struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name        string               `bson:"name" json:"name"`
	Date        time.Time            `bson:"date" json:"date"`
	Description string               `bson:"description,omitempty" json:"description,omitempty"`
	Volunteers  []primitive.ObjectID `bson:"volunteers" json:"volunteers"`
	CreatedAt   time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time            `bson:"updated_at" json:"updated_at"`
}

// CreateWorkshopRequest representa os dados necessários para criar uma oficina
type CreateWorkshopRequest struct {
	Name        string `json:"name" binding:"required"`
	Date        string `json:"date" binding:"required"`
	Description string `json:"description"`
}

// UpdateWorkshopRequest representa os dados que podem ser atualizados
type UpdateWorkshopRequest struct {
	Name        *string `json:"name"`
	Date        *string `json:"date"`
	Description *string `json:"description"`
}

// WorkshopResponse representa a resposta da API com dados da oficina
type WorkshopResponse struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Date        string   `json:"date"`
	Description string   `json:"description,omitempty"`
	Volunteers  []string `json:"volunteers"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
}

// Validate valida os dados de criação de uma oficina
func (r *CreateWorkshopRequest) Validate() error {
	if r.Name == "" {
		return errors.New("nome da oficina é obrigatório")
	}

	if len(r.Name) < 3 {
		return errors.New("nome da oficina deve ter pelo menos 3 caracteres")
	}

	if r.Date == "" {
		return errors.New("data da oficina é obrigatória")
	}

	// Valida formato da data (YYYY-MM-DD)
	date, err := time.Parse("2006-01-02", r.Date)
	if err != nil {
		return errors.New("data inválida. Use o formato YYYY-MM-DD")
	}

	// Não permite oficinas no futuro distante (mais de 1 ano)
	oneYearFromNow := time.Now().AddDate(1, 0, 0)
	if date.After(oneYearFromNow) {
		return errors.New("data da oficina não pode ser mais de 1 ano no futuro")
	}

	return nil
}

// Validate valida os dados de atualização de uma oficina
func (r *UpdateWorkshopRequest) Validate() error {
	if r.Name != nil {
		if *r.Name == "" {
			return errors.New("nome da oficina não pode ser vazio")
		}
		if len(*r.Name) < 3 {
			return errors.New("nome da oficina deve ter pelo menos 3 caracteres")
		}
	}

	if r.Date != nil {
		if *r.Date == "" {
			return errors.New("data da oficina não pode ser vazia")
		}

		date, err := time.Parse("2006-01-02", *r.Date)
		if err != nil {
			return errors.New("data inválida. Use o formato YYYY-MM-DD")
		}

		oneYearFromNow := time.Now().AddDate(1, 0, 0)
		if date.After(oneYearFromNow) {
			return errors.New("data da oficina não pode ser mais de 1 ano no futuro")
		}
	}

	return nil
}

// ToResponse converte Workshop para WorkshopResponse
func (w *Workshop) ToResponse() WorkshopResponse {
	volunteers := make([]string, len(w.Volunteers))
	for i, v := range w.Volunteers {
		volunteers[i] = v.Hex()
	}

	return WorkshopResponse{
		ID:          w.ID.Hex(),
		Name:        w.Name,
		Date:        w.Date.Format("2006-01-02"),
		Description: w.Description,
		Volunteers:  volunteers,
		CreatedAt:   w.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   w.UpdatedAt.Format(time.RFC3339),
	}
}

// NewWorkshopFromRequest cria um Workshop a partir de CreateWorkshopRequest
func NewWorkshopFromRequest(req CreateWorkshopRequest) (*Workshop, error) {
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	return &Workshop{
		Name:        req.Name,
		Date:        date,
		Description: req.Description,
		Volunteers:  []primitive.ObjectID{},
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}
