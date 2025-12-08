package repositories

import (
	"context"
	"ellp-volunter-platform/backend/internal/models"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// WorkshopRepository define as operações de repositório para oficinas
type WorkshopRepository interface {
	Create(ctx context.Context, workshop *models.Workshop) error
	FindByID(ctx context.Context, id string) (*models.Workshop, error)
	FindByName(ctx context.Context, name string) (*models.Workshop, error)
	FindAll(ctx context.Context, filter WorkshopFilter) ([]*models.Workshop, error)
	Update(ctx context.Context, id string, workshop *models.Workshop) error
	Delete(ctx context.Context, id string) error
	AddVolunteer(ctx context.Context, workshopID string, volunteerID string) error
	RemoveVolunteer(ctx context.Context, workshopID string, volunteerID string) error
	FindByVolunteer(ctx context.Context, volunteerID string) ([]*models.Workshop, error)
}

// WorkshopFilter representa os filtros para busca de oficinas
type WorkshopFilter struct {
	Name  string
	Month string // Format: YYYY-MM
	Year  string // Format: YYYY
	Page  int
	Limit int
}

// MongoWorkshopRepository implementa WorkshopRepository para MongoDB
type MongoWorkshopRepository struct {
	collection *mongo.Collection
}

// NewMongoWorkshopRepository cria uma nova instância do repositório
func NewMongoWorkshopRepository(db *mongo.Database) WorkshopRepository {
	return &MongoWorkshopRepository{
		collection: db.Collection("workshops"),
	}
}

// Create insere uma nova oficina no banco
func (r *MongoWorkshopRepository) Create(ctx context.Context, workshop *models.Workshop) error {
	workshop.ID = primitive.NewObjectID()
	workshop.CreatedAt = time.Now()
	workshop.UpdatedAt = time.Now()

	_, err := r.collection.InsertOne(ctx, workshop)
	return err
}

// FindByID busca uma oficina por ID
func (r *MongoWorkshopRepository) FindByID(ctx context.Context, id string) (*models.Workshop, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("ID inválido")
	}

	var workshop models.Workshop
	err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&workshop)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("oficina não encontrada")
		}
		return nil, err
	}

	return &workshop, nil
}

// FindByName busca uma oficina por nome exato
func (r *MongoWorkshopRepository) FindByName(ctx context.Context, name string) (*models.Workshop, error) {
	var workshop models.Workshop
	err := r.collection.FindOne(ctx, bson.M{"name": name}).Decode(&workshop)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &workshop, nil
}

// FindAll busca todas as oficinas com filtros opcionais
func (r *MongoWorkshopRepository) FindAll(ctx context.Context, filter WorkshopFilter) ([]*models.Workshop, error) {
	query := bson.M{}

	// Filtro por nome (regex case-insensitive)
	if filter.Name != "" {
		query["name"] = bson.M{"$regex": filter.Name, "$options": "i"}
	}

	// Filtro por mês/ano
	if filter.Month != "" {
		// Parse month (YYYY-MM)
		startDate, err := time.Parse("2006-01", filter.Month)
		if err == nil {
			endDate := startDate.AddDate(0, 1, 0)
			query["date"] = bson.M{
				"$gte": startDate,
				"$lt":  endDate,
			}
		}
	} else if filter.Year != "" {
		// Parse year (YYYY)
		startDate, err := time.Parse("2006", filter.Year)
		if err == nil {
			endDate := startDate.AddDate(1, 0, 0)
			query["date"] = bson.M{
				"$gte": startDate,
				"$lt":  endDate,
			}
		}
	}

	// Paginação
	page := filter.Page
	if page < 1 {
		page = 1
	}
	limit := filter.Limit
	if limit < 1 {
		limit = 10
	}
	skip := (page - 1) * limit

	// Options com ordenação por data (mais recente primeiro)
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: "date", Value: -1}})

	cursor, err := r.collection.Find(ctx, query, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var workshops []*models.Workshop
	if err = cursor.All(ctx, &workshops); err != nil {
		return nil, err
	}

	return workshops, nil
}

// Update atualiza uma oficina existente
func (r *MongoWorkshopRepository) Update(ctx context.Context, id string, workshop *models.Workshop) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID inválido")
	}

	workshop.UpdatedAt = time.Now()

	update := bson.M{
		"$set": bson.M{
			"name":        workshop.Name,
			"date":        workshop.Date,
			"description": workshop.Description,
			"updated_at":  workshop.UpdatedAt,
		},
	}

	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("oficina não encontrada")
	}

	return nil
}

// Delete remove uma oficina
func (r *MongoWorkshopRepository) Delete(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID inválido")
	}

	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("oficina não encontrada")
	}

	return nil
}

// AddVolunteer adiciona um voluntário à oficina
func (r *MongoWorkshopRepository) AddVolunteer(ctx context.Context, workshopID string, volunteerID string) error {
	workshopObjID, err := primitive.ObjectIDFromHex(workshopID)
	if err != nil {
		return errors.New("ID da oficina inválido")
	}

	volunteerObjID, err := primitive.ObjectIDFromHex(volunteerID)
	if err != nil {
		return errors.New("ID do voluntário inválido")
	}

	update := bson.M{
		"$addToSet": bson.M{"volunteers": volunteerObjID},
		"$set":      bson.M{"updated_at": time.Now()},
	}

	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": workshopObjID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("oficina não encontrada")
	}

	return nil
}

// RemoveVolunteer remove um voluntário da oficina
func (r *MongoWorkshopRepository) RemoveVolunteer(ctx context.Context, workshopID string, volunteerID string) error {
	workshopObjID, err := primitive.ObjectIDFromHex(workshopID)
	if err != nil {
		return errors.New("ID da oficina inválido")
	}

	volunteerObjID, err := primitive.ObjectIDFromHex(volunteerID)
	if err != nil {
		return errors.New("ID do voluntário inválido")
	}

	update := bson.M{
		"$pull": bson.M{"volunteers": volunteerObjID},
		"$set":  bson.M{"updated_at": time.Now()},
	}

	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": workshopObjID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("oficina não encontrada")
	}

	return nil
}

// FindByVolunteer busca todas as oficinas de um voluntário
func (r *MongoWorkshopRepository) FindByVolunteer(ctx context.Context, volunteerID string) ([]*models.Workshop, error) {
	volunteerObjID, err := primitive.ObjectIDFromHex(volunteerID)
	if err != nil {
		return nil, errors.New("ID do voluntário inválido")
	}

	query := bson.M{"volunteers": volunteerObjID}
	opts := options.Find().SetSort(bson.D{{Key: "date", Value: -1}})

	cursor, err := r.collection.Find(ctx, query, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var workshops []*models.Workshop
	if err = cursor.All(ctx, &workshops); err != nil {
		return nil, err
	}

	return workshops, nil
}
