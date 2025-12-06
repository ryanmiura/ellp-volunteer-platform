package services

import (
	"context"
	"ellp-volunter-platform/backend/internal/models"
	"ellp-volunter-platform/backend/internal/repositories"
	"errors"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MockUserRepository é um mock do repositório de usuários para testes
type MockUserRepository struct {
	users        map[string]*models.User
	emailToID    map[string]string
	createError  error
	findError    error
	updateError  error
	deleteError  error
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{
		users:     make(map[string]*models.User),
		emailToID: make(map[string]string),
	}
}

func (m *MockUserRepository) Create(ctx context.Context, user *models.User) error {
	if m.createError != nil {
		return m.createError
	}

	// Verifica se email já existe
	if _, exists := m.emailToID[user.Email]; exists {
		return repositories.ErrUserAlreadyExists
	}

	// Prepara o usuário
	if err := user.BeforeCreate(); err != nil {
		return err
	}

	if user.ID.IsZero() {
		user.ID = primitive.NewObjectID()
	}

	m.users[user.ID.Hex()] = user
	m.emailToID[user.Email] = user.ID.Hex()
	return nil
}

func (m *MockUserRepository) FindByID(ctx context.Context, id string) (*models.User, error) {
	if m.findError != nil {
		return nil, m.findError
	}

	user, exists := m.users[id]
	if !exists {
		return nil, repositories.ErrUserNotFound
	}

	return user, nil
}

func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	if m.findError != nil {
		return nil, m.findError
	}

	id, exists := m.emailToID[email]
	if !exists {
		return nil, repositories.ErrUserNotFound
	}

	return m.users[id], nil
}

func (m *MockUserRepository) Update(ctx context.Context, user *models.User) error {
	if m.updateError != nil {
		return m.updateError
	}

	if _, exists := m.users[user.ID.Hex()]; !exists {
		return repositories.ErrUserNotFound
	}

	if err := user.BeforeUpdate(); err != nil {
		return err
	}

	m.users[user.ID.Hex()] = user
	return nil
}

func (m *MockUserRepository) Delete(ctx context.Context, id string) error {
	if m.deleteError != nil {
		return m.deleteError
	}

	user, exists := m.users[id]
	if !exists {
		return repositories.ErrUserNotFound
	}

	user.IsActive = false
	user.UpdatedAt = time.Now()
	return nil
}

func (m *MockUserRepository) List(ctx context.Context, filter bson.M, limit, offset int) ([]*models.User, error) {
	users := []*models.User{}
	for _, user := range m.users {
		users = append(users, user)
	}
	return users, nil
}

func (m *MockUserRepository) Count(ctx context.Context, filter bson.M) (int64, error) {
	return int64(len(m.users)), nil
}

func TestAuthService_Login(t *testing.T) {
	mockRepo := NewMockUserRepository()
	service := NewAuthService(mockRepo)
	ctx := context.Background()

	// Cria um usuário de teste
	testUser := &models.User{
		Name:     "Test User",
		Email:    "test@example.com",
		Password: "TestPassword123",
		Role:     "member",
		IsActive: true,
	}
	mockRepo.Create(ctx, testUser)

	tests := []struct {
		name      string
		email     string
		password  string
		wantErr   error
		setupFunc func()
	}{
		{
			name:     "Successful login",
			email:    "test@example.com",
			password: "TestPassword123",
			wantErr:  nil,
		},
		{
			name:     "Invalid email",
			email:    "wrong@example.com",
			password: "TestPassword123",
			wantErr:  ErrInvalidCredentials,
		},
		{
			name:     "Invalid password",
			email:    "test@example.com",
			password: "WrongPassword123",
			wantErr:  ErrInvalidCredentials,
		},
		{
			name:     "Inactive user",
			email:    "inactive@example.com",
			password: "TestPassword123",
			wantErr:  ErrUserInactive,
			setupFunc: func() {
				inactiveUser := &models.User{
					Name:     "Inactive User",
					Email:    "inactive@example.com",
					Password: "TestPassword123",
					Role:     "member",
					IsActive: false,
				}
				mockRepo.Create(ctx, inactiveUser)
				// Marca como inativo manualmente
				id := mockRepo.emailToID["inactive@example.com"]
				mockRepo.users[id].IsActive = false
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setupFunc != nil {
				tt.setupFunc()
			}

			response, err := service.Login(ctx, tt.email, tt.password)

			if tt.wantErr != nil {
				if err == nil {
					t.Errorf("Login() error = nil, wantErr %v", tt.wantErr)
					return
				}
				if !errors.Is(err, tt.wantErr) && err.Error() != tt.wantErr.Error() {
					t.Errorf("Login() error = %v, wantErr %v", err, tt.wantErr)
				}
				return
			}

			if err != nil {
				t.Errorf("Login() unexpected error = %v", err)
				return
			}

			if response == nil {
				t.Error("Login() returned nil response")
				return
			}

			if response.Token == "" {
				t.Error("Login() returned empty token")
			}

			if response.User.Email != tt.email {
				t.Errorf("Login() user email = %v, want %v", response.User.Email, tt.email)
			}
		})
	}
}

func TestAuthService_Register(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name    string
		req     *models.CreateUserRequest
		wantErr bool
	}{
		{
			name: "Successful registration",
			req: &models.CreateUserRequest{
				Name:     "New User",
				Email:    "newuser@example.com",
				Password: "NewPassword123",
				Role:     "member",
			},
			wantErr: false,
		},
		{
			name: "Duplicate email",
			req: &models.CreateUserRequest{
				Name:     "Duplicate User",
				Email:    "newuser@example.com",
				Password: "Password123",
				Role:     "member",
			},
			wantErr: true,
		},
		{
			name: "Invalid email",
			req: &models.CreateUserRequest{
				Name:     "Invalid Email User",
				Email:    "invalid-email",
				Password: "Password123",
				Role:     "member",
			},
			wantErr: true,
		},
		{
			name: "Weak password",
			req: &models.CreateUserRequest{
				Name:     "Weak Password User",
				Email:    "weakpass@example.com",
				Password: "weak",
				Role:     "member",
			},
			wantErr: true,
		},
		{
			name: "Valid admin registration",
			req: &models.CreateUserRequest{
				Name:     "Admin User",
				Email:    "admin@example.com",
				Password: "AdminPass123",
				Role:     "admin",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := NewMockUserRepository()
			service := NewAuthService(mockRepo)

			// Para o teste de email duplicado, cria o usuário primeiro
			if tt.name == "Duplicate email" {
				firstUser := &models.CreateUserRequest{
					Name:     "First User",
					Email:    "newuser@example.com",
					Password: "FirstPass123",
					Role:     "member",
				}
				service.Register(ctx, firstUser)
			}

			user, err := service.Register(ctx, tt.req)

			if tt.wantErr {
				if err == nil {
					t.Error("Register() error = nil, wantErr true")
				}
				return
			}

			if err != nil {
				t.Errorf("Register() unexpected error = %v", err)
				return
			}

			if user == nil {
				t.Error("Register() returned nil user")
				return
			}

			if user.Email != tt.req.Email {
				t.Errorf("Register() email = %v, want %v", user.Email, tt.req.Email)
			}

			if user.Name != tt.req.Name {
				t.Errorf("Register() name = %v, want %v", user.Name, tt.req.Name)
			}

			if user.Role != tt.req.Role {
				t.Errorf("Register() role = %v, want %v", user.Role, tt.req.Role)
			}
		})
	}
}

func TestAuthService_ValidateToken(t *testing.T) {
	mockRepo := NewMockUserRepository()
	service := NewAuthService(mockRepo)
	ctx := context.Background()

	// Cria um usuário e faz login para obter um token válido
	testUser := &models.User{
		Name:     "Test User",
		Email:    "test@example.com",
		Password: "TestPassword123",
		Role:     "member",
		IsActive: true,
	}
	mockRepo.Create(ctx, testUser)

	loginResponse, _ := service.Login(ctx, "test@example.com", "TestPassword123")
	validToken := loginResponse.Token

	tests := []struct {
		name    string
		token   string
		wantErr bool
	}{
		{
			name:    "Valid token",
			token:   validToken,
			wantErr: false,
		},
		{
			name:    "Invalid token",
			token:   "invalid.token.string",
			wantErr: true,
		},
		{
			name:    "Empty token",
			token:   "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := service.ValidateToken(tt.token)

			if tt.wantErr {
				if err == nil {
					t.Error("ValidateToken() error = nil, wantErr true")
				}
				return
			}

			if err != nil {
				t.Errorf("ValidateToken() unexpected error = %v", err)
				return
			}

			if claims == nil {
				t.Error("ValidateToken() returned nil claims")
				return
			}

			if claims.Email != "test@example.com" {
				t.Errorf("ValidateToken() email = %v, want test@example.com", claims.Email)
			}
		})
	}
}

func TestAuthService_RefreshToken(t *testing.T) {
	mockRepo := NewMockUserRepository()
	service := NewAuthService(mockRepo)
	ctx := context.Background()

	// Cria um usuário e faz login
	testUser := &models.User{
		Name:     "Test User",
		Email:    "test@example.com",
		Password: "TestPassword123",
		Role:     "member",
		IsActive: true,
	}
	mockRepo.Create(ctx, testUser)

	loginResponse, _ := service.Login(ctx, "test@example.com", "TestPassword123")
	validToken := loginResponse.Token

	// Testa refresh com token válido
	newToken, err := service.RefreshToken(validToken)
	if err != nil {
		t.Errorf("RefreshToken() unexpected error = %v", err)
	}

	if newToken == "" {
		t.Error("RefreshToken() returned empty token")
	}

	// Valida que o novo token é válido
	claims, err := service.ValidateToken(newToken)
	if err != nil {
		t.Errorf("New token is invalid: %v", err)
	}

	if claims.Email != "test@example.com" {
		t.Errorf("New token email = %v, want test@example.com", claims.Email)
	}

	// Testa refresh com token inválido
	_, err = service.RefreshToken("invalid.token")
	if err == nil {
		t.Error("RefreshToken() should return error for invalid token")
	}
}
