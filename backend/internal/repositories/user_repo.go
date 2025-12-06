package repositories

import (
	"context"
	"ellp-volunter-platform/backend/internal/models"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	// ErrUserNotFound é retornado quando o usuário não é encontrado
	ErrUserNotFound = errors.New("usuário não encontrado")
	// ErrUserAlreadyExists é retornado quando o email já está em uso
	ErrUserAlreadyExists = errors.New("email já está em uso")
)

// UserRepository define a interface para operações de usuário
type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByID(ctx context.Context, id string) (*models.User, error)
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, filter bson.M, limit, offset int) ([]*models.User, error)
	Count(ctx context.Context, filter bson.M) (int64, error)
}

// MongoUserRepository implementa UserRepository para MongoDB
type MongoUserRepository struct {
	collection *mongo.Collection
}

// NewMongoUserRepository cria uma nova instância do repositório
func NewMongoUserRepository(db *mongo.Database) UserRepository {
	return &MongoUserRepository{
		collection: db.Collection("users"),
	}
}

// Create insere um novo usuário no banco de dados
func (r *MongoUserRepository) Create(ctx context.Context, user *models.User) error {
	// Verifica se o email já existe
	existingUser, _ := r.FindByEmail(ctx, user.Email)
	if existingUser != nil {
		return ErrUserAlreadyExists
	}

	// Prepara o usuário para inserção
	if err := user.BeforeCreate(); err != nil {
		return err
	}

	// Gera um novo ID se não existir
	if user.ID.IsZero() {
		user.ID = primitive.NewObjectID()
	}

	_, err := r.collection.InsertOne(ctx, user)
	return err
}

// FindByID busca um usuário por ID
func (r *MongoUserRepository) FindByID(ctx context.Context, id string) (*models.User, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var user models.User
	err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

// FindByEmail busca um usuário por email
func (r *MongoUserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

// Update atualiza um usuário existente
func (r *MongoUserRepository) Update(ctx context.Context, user *models.User) error {
	// Prepara o usuário para atualização
	if err := user.BeforeUpdate(); err != nil {
		return err
	}

	filter := bson.M{"_id": user.ID}
	update := bson.M{
		"$set": bson.M{
			"name":       user.Name,
			"email":      user.Email,
			"password":   user.Password,
			"role":       user.Role,
			"is_active":  user.IsActive,
			"updated_at": user.UpdatedAt,
		},
	}

	result, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return ErrUserNotFound
	}

	return nil
}

// Delete remove um usuário (soft delete marcando como inativo)
func (r *MongoUserRepository) Delete(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objectID}
	update := bson.M{
		"$set": bson.M{
			"is_active":  false,
			"updated_at": time.Now(),
		},
	}

	result, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return ErrUserNotFound
	}

	return nil
}

// List retorna uma lista de usuários com filtros, paginação
func (r *MongoUserRepository) List(ctx context.Context, filter bson.M, limit, offset int) ([]*models.User, error) {
	var users []*models.User

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &users); err != nil {
		return nil, err
	}

	return users, nil
}

// Count retorna o número total de usuários que correspondem ao filtro
func (r *MongoUserRepository) Count(ctx context.Context, filter bson.M) (int64, error) {
	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, err
	}
	return count, nil
}
