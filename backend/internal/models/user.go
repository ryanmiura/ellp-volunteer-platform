package models

import (
	"errors"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// User representa um usuário do sistema ELLP
type User struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name" binding:"required"`
	Email     string             `json:"email" bson:"email" binding:"required,email"`
	Password  string             `json:"-" bson:"password" binding:"required"`
	Role      string             `json:"role" bson:"role" binding:"required"` // "admin", "member"
	IsActive  bool               `json:"is_active" bson:"is_active"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

// UserResponse representa a resposta da API sem expor a senha
type UserResponse struct {
	ID        primitive.ObjectID `json:"id"`
	Name      string             `json:"name"`
	Email     string             `json:"email"`
	Role      string             `json:"role"`
	IsActive  bool               `json:"is_active"`
	CreatedAt time.Time          `json:"created_at"`
	UpdatedAt time.Time          `json:"updated_at"`
}

// LoginRequest representa os dados de login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// CreateUserRequest representa os dados para criar um usuário
type CreateUserRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"required,oneof=admin member"`
}

// UpdateUserRequest representa os dados para atualizar um usuário
type UpdateUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email" binding:"omitempty,email"`
	Password string `json:"password" binding:"omitempty,min=8"`
	Role     string `json:"role" binding:"omitempty,oneof=admin member"`
	IsActive *bool  `json:"is_active"`
}

var (
	// ErrInvalidEmail é retornado quando o email é inválido
	ErrInvalidEmail = errors.New("email inválido")
	// ErrInvalidPassword é retornado quando a senha não atende aos requisitos
	ErrInvalidPassword = errors.New("senha deve ter no mínimo 8 caracteres")
	// ErrPasswordTooWeak é retornado quando a senha é muito fraca
	ErrPasswordTooWeak = errors.New("senha muito fraca: deve conter letras maiúsculas, minúsculas e números")
	// ErrEmailAlreadyExists é retornado quando o email já está cadastrado
	ErrEmailAlreadyExists = errors.New("email já cadastrado")
)

// emailRegex é o padrão para validar emails
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// ValidateEmail valida o formato do email
func ValidateEmail(email string) error {
	if email == "" {
		return ErrInvalidEmail
	}
	if !emailRegex.MatchString(email) {
		return ErrInvalidEmail
	}
	return nil
}

// ValidatePassword valida os requisitos da senha
func ValidatePassword(password string) error {
	if len(password) < 8 {
		return ErrInvalidPassword
	}

	// Verifica se tem pelo menos uma letra maiúscula, uma minúscula e um número
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)

	if !hasUpper || !hasLower || !hasNumber {
		return ErrPasswordTooWeak
	}

	return nil
}

// HashPassword gera o hash bcrypt da senha
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPassword verifica se a senha corresponde ao hash
func CheckPassword(password, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

// ToResponse converte User para UserResponse (sem senha)
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		Role:      u.Role,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

// Validate valida os campos do usuário
func (u *User) Validate() error {
	if err := ValidateEmail(u.Email); err != nil {
		return err
	}
	
	// Se a senha ainda não foi hasheada, valida
	if !isPasswordHashed(u.Password) {
		if err := ValidatePassword(u.Password); err != nil {
			return err
		}
	}

	if u.Role != "admin" && u.Role != "member" {
		return errors.New("role deve ser 'admin' ou 'member'")
	}

	return nil
}

// isPasswordHashed verifica se a senha já está em formato bcrypt hash
func isPasswordHashed(password string) bool {
	// Hashes bcrypt começam com $2a$, $2b$, ou $2y$ e têm 60 caracteres
	if len(password) != 60 {
		return false
	}
	// Verifica se começa com $2 (padrão bcrypt: $2a$, $2b$, ou $2y$)
	if len(password) < 2 {
		return false
	}
	return password[0] == '$' && password[1] == '2'
}

// BeforeCreate prepara o usuário antes de criar no banco
func (u *User) BeforeCreate() error {
	now := time.Now()
	u.CreatedAt = now
	u.UpdatedAt = now
	u.IsActive = true

	// Valida os campos
	if err := u.Validate(); err != nil {
		return err
	}

	// Hash da senha se ainda não estiver hasheada
	if !isPasswordHashed(u.Password) {
		hashedPassword, err := HashPassword(u.Password)
		if err != nil {
			return err
		}
		u.Password = hashedPassword
	}

	return nil
}

// BeforeUpdate prepara o usuário antes de atualizar no banco
func (u *User) BeforeUpdate() error {
	u.UpdatedAt = time.Now()

	// Valida os campos
	if err := u.Validate(); err != nil {
		return err
	}

	// Hash da senha se foi alterada e ainda não estiver hasheada
	if u.Password != "" && !isPasswordHashed(u.Password) {
		hashedPassword, err := HashPassword(u.Password)
		if err != nil {
			return err
		}
		u.Password = hashedPassword
	}

	return nil
}
