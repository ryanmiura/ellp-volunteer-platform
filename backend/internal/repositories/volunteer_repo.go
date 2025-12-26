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

// VolunteerRepository define a interface para operações de voluntários
type VolunteerRepository interface {
	Create(ctx context.Context, volunteer *models.Volunteer) error
	FindByID(ctx context.Context, id string) (*models.Volunteer, error)
	FindByEmail(ctx context.Context, email string) (*models.Volunteer, error)
	FindAll(ctx context.Context, filter VolunteerFilter) ([]*models.Volunteer, error)
	Update(ctx context.Context, id string, volunteer *models.Volunteer) error
	Delete(ctx context.Context, id string) error
	Inactivate(ctx context.Context, id string, exitDate time.Time) error
	AddWorkshop(ctx context.Context, volunteerID string, workshopID string) error
	RemoveWorkshop(ctx context.Context, volunteerID string, workshopID string) error
}

// VolunteerFilter representa os filtros para busca de voluntários
type VolunteerFilter struct {
	Name     string
	IsActive *bool
	Page     int
	Limit    int
}

// MongoVolunteerRepository implementa VolunteerRepository usando MongoDB
type MongoVolunteerRepository struct {
	collection *mongo.Collection
}

// NewMongoVolunteerRepository cria uma nova instância do repositório
func NewMongoVolunteerRepository(db *mongo.Database) VolunteerRepository {
	return &MongoVolunteerRepository{
		collection: db.Collection("volunteers"),
	}
}

// Create cria um novo voluntário
func (r *MongoVolunteerRepository) Create(ctx context.Context, volunteer *models.Volunteer) error {
	result, err := r.collection.InsertOne(ctx, volunteer)
	if err != nil {
		return err
	}

	volunteer.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

// FindByID busca um voluntário por ID
func (r *MongoVolunteerRepository) FindByID(ctx context.Context, id string) (*models.Volunteer, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("ID inválido")
	}

	var volunteer models.Volunteer
	err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&volunteer)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("voluntário não encontrado")
		}
		return nil, err
	}

	return &volunteer, nil
}

// FindByEmail busca um voluntário por email
func (r *MongoVolunteerRepository) FindByEmail(ctx context.Context, email string) (*models.Volunteer, error) {
	var volunteer models.Volunteer
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&volunteer)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &volunteer, nil
}

// FindAll busca todos os voluntários com filtros opcionais
func (r *MongoVolunteerRepository) FindAll(ctx context.Context, filter VolunteerFilter) ([]*models.Volunteer, error) {
	// Construir filtro BSON
	bsonFilter := bson.M{}
	
	if filter.Name != "" {
		bsonFilter["name"] = bson.M{"$regex": filter.Name, "$options": "i"}
	}
	
	if filter.IsActive != nil {
		bsonFilter["is_active"] = *filter.IsActive
	}

	// Configurar paginação
	findOptions := options.Find()
	if filter.Limit > 0 {
		findOptions.SetLimit(int64(filter.Limit))
		if filter.Page > 0 {
			skip := (filter.Page - 1) * filter.Limit
			findOptions.SetSkip(int64(skip))
		}
	}
	findOptions.SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, bsonFilter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var volunteers []*models.Volunteer
	if err = cursor.All(ctx, &volunteers); err != nil {
		return nil, err
	}

	return volunteers, nil
}

// Update atualiza um voluntário
func (r *MongoVolunteerRepository) Update(ctx context.Context, id string, volunteer *models.Volunteer) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID inválido")
	}

	volunteer.UpdatedAt = time.Now()

	update := bson.M{
		"$set": volunteer,
	}

	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("voluntário não encontrado")
	}

	return nil
}

// Delete deleta um voluntário
func (r *MongoVolunteerRepository) Delete(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID inválido")
	}

	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("voluntário não encontrado")
	}

	return nil
}

// Inactivate inativa um voluntário
func (r *MongoVolunteerRepository) Inactivate(ctx context.Context, id string, exitDate time.Time) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID inválido")
	}

	update := bson.M{
		"$set": bson.M{
			"is_active":  false,
			"exit_date":  exitDate,
			"updated_at": time.Now(),
		},
	}

	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("voluntário não encontrado")
	}

	return nil
}

// AddWorkshop adiciona uma oficina ao voluntário
func (r *MongoVolunteerRepository) AddWorkshop(ctx context.Context, volunteerID string, workshopID string) error {
	objectID, err := primitive.ObjectIDFromHex(volunteerID)
	if err != nil {
		return errors.New("ID inválido")
	}

	update := bson.M{
		"$addToSet": bson.M{"workshops": workshopID},
		"$set":      bson.M{"updated_at": time.Now()},
	}

	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("voluntário não encontrado")
	}

	return nil
}

// RemoveWorkshop remove uma oficina do voluntário
func (r *MongoVolunteerRepository) RemoveWorkshop(ctx context.Context, volunteerID string, workshopID string) error {
	objectID, err := primitive.ObjectIDFromHex(volunteerID)
	if err != nil {
		return errors.New("ID inválido")
	}

	update := bson.M{
		"$pull": bson.M{"workshops": workshopID},
		"$set":  bson.M{"updated_at": time.Now()},
	}

	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("voluntário não encontrado")
	}

	return nil
}
