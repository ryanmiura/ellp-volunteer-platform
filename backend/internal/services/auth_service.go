package services

import (
	"context"
	"ellp-volunter-platform/backend/internal/config"
	"ellp-volunter-platform/backend/internal/models"
	"ellp-volunter-platform/backend/internal/repositories"
	"errors"
	"time"
)

var (
	// ErrInvalidCredentials é retornado quando as credenciais são inválidas
	ErrInvalidCredentials = errors.New("credenciais inválidas")
	// ErrUserInactive é retornado quando o usuário está inativo
	ErrUserInactive = errors.New("usuário inativo")
)

// AuthService define a interface para serviços de autenticação
type AuthService interface {
	Login(ctx context.Context, email, password string) (*LoginResponse, error)
	Register(ctx context.Context, req *models.CreateUserRequest) (*models.UserResponse, error)
	ValidateToken(token string) (*config.Claims, error)
	RefreshToken(token string) (string, error)
}

// LoginResponse representa a resposta de login
type LoginResponse struct {
	User  models.UserResponse `json:"user"`
	Token string              `json:"token"`
}

// authService implementa AuthService
type authService struct {
	userRepo repositories.UserRepository
}

// NewAuthService cria uma nova instância do serviço de autenticação
func NewAuthService(userRepo repositories.UserRepository) AuthService {
	return &authService{
		userRepo: userRepo,
	}
}

// Login autentica um usuário e retorna um token JWT
func (s *authService) Login(ctx context.Context, email, password string) (*LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if err == repositories.ErrUserNotFound {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if !user.IsActive {
		return nil, ErrUserInactive
	}

	if err := models.CheckPassword(password, user.Password); err != nil {
		return nil, ErrInvalidCredentials
	}

	token, err := config.GenerateToken(user.ID.Hex(), user.Email, user.Role)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		User:  user.ToResponse(),
		Token: token,
	}, nil
}

// Register registra um novo usuário no sistema
func (s *authService) Register(ctx context.Context, req *models.CreateUserRequest) (*models.UserResponse, error) {
	if err := models.ValidateEmail(req.Email); err != nil {
		return nil, err
	}

	if err := models.ValidatePassword(req.Password); err != nil {
		return nil, err
	}

	user := &models.User{
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		Role:      req.Role,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	response := user.ToResponse()
	return &response, nil
}

// ValidateToken valida um token JWT
func (s *authService) ValidateToken(token string) (*config.Claims, error) {
	return config.ValidateToken(token)
}

// RefreshToken renova um token JWT
func (s *authService) RefreshToken(token string) (string, error) {
	return config.RefreshToken(token)
}
