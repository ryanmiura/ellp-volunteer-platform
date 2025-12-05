package models

import (
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name    string
		email   string
		wantErr bool
	}{
		{"Valid email", "user@example.com", false},
		{"Valid email with subdomain", "user@mail.example.com", false},
		{"Valid email with numbers", "user123@example.com", false},
		{"Valid email with plus", "user+test@example.com", false},
		{"Valid email with dash", "user-test@example.com", false},
		{"Valid email with underscore", "user_test@example.com", false},
		{"Empty email", "", true},
		{"Missing @", "userexample.com", true},
		{"Missing domain", "user@", true},
		{"Missing username", "@example.com", true},
		{"Invalid characters", "user@exa mple.com", true},
		{"Missing TLD", "user@example", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateEmail(tt.email)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateEmail() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name    string
		password string
		wantErr error
	}{
		{"Valid strong password", "Abc12345", nil},
		{"Valid password with special chars", "Abc123!@#", nil},
		{"Valid long password", "MyPassword123", nil},
		{"Too short", "Abc123", ErrInvalidPassword},
		{"Missing uppercase", "abc12345", ErrPasswordTooWeak},
		{"Missing lowercase", "ABC12345", ErrPasswordTooWeak},
		{"Missing number", "Abcdefgh", ErrPasswordTooWeak},
		{"Only numbers", "12345678", ErrPasswordTooWeak},
		{"Only letters", "AbcDefgh", ErrPasswordTooWeak},
		{"Empty password", "", ErrInvalidPassword},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidatePassword(tt.password)
			if err != tt.wantErr {
				t.Errorf("ValidatePassword() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestHashPassword(t *testing.T) {
	password := "TestPassword123"
	
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
	}

	if hash == "" {
		t.Error("HashPassword() returned empty hash")
	}

	if hash == password {
		t.Error("HashPassword() returned unhashed password")
	}

	// Verifica se o hash tem o formato bcrypt esperado
	if len(hash) != 60 {
		t.Errorf("HashPassword() hash length = %d, want 60", len(hash))
	}

	if hash[0] != '$' || hash[1] != '2' {
		t.Error("HashPassword() hash doesn't start with bcrypt prefix")
	}
}

func TestCheckPassword(t *testing.T) {
	password := "TestPassword123"
	hash, _ := HashPassword(password)

	tests := []struct {
		name     string
		password string
		hash     string
		wantErr  bool
	}{
		{"Correct password", password, hash, false},
		{"Incorrect password", "WrongPassword123", hash, true},
		{"Empty password", "", hash, true},
		{"Different case", "testpassword123", hash, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := CheckPassword(tt.password, tt.hash)
			if (err != nil) != tt.wantErr {
				t.Errorf("CheckPassword() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestUser_Validate(t *testing.T) {
	tests := []struct {
		name    string
		user    User
		wantErr bool
	}{
		{
			name: "Valid user",
			user: User{
				Name:     "Test User",
				Email:    "test@example.com",
				Password: "TestPass123",
				Role:     "member",
			},
			wantErr: false,
		},
		{
			name: "Valid admin user",
			user: User{
				Name:     "Admin User",
				Email:    "admin@example.com",
				Password: "AdminPass123",
				Role:     "admin",
			},
			wantErr: false,
		},
		{
			name: "Invalid email",
			user: User{
				Name:     "Test User",
				Email:    "invalid-email",
				Password: "TestPass123",
				Role:     "member",
			},
			wantErr: true,
		},
		{
			name: "Weak password",
			user: User{
				Name:     "Test User",
				Email:    "test@example.com",
				Password: "weak",
				Role:     "member",
			},
			wantErr: true,
		},
		{
			name: "Invalid role",
			user: User{
				Name:     "Test User",
				Email:    "test@example.com",
				Password: "TestPass123",
				Role:     "invalid",
			},
			wantErr: true,
		},
		{
			name: "Already hashed password (valid)",
			user: User{
				Name:     "Test User",
				Email:    "test@example.com",
				Password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
				Role:     "member",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.user.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("User.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestUser_BeforeCreate(t *testing.T) {
	user := User{
		Name:     "Test User",
		Email:    "test@example.com",
		Password: "TestPass123",
		Role:     "member",
	}

	err := user.BeforeCreate()
	if err != nil {
		t.Fatalf("User.BeforeCreate() error = %v", err)
	}

	// Verifica se os campos foram preenchidos
	if user.CreatedAt.IsZero() {
		t.Error("User.BeforeCreate() didn't set CreatedAt")
	}

	if user.UpdatedAt.IsZero() {
		t.Error("User.BeforeCreate() didn't set UpdatedAt")
	}

	if !user.IsActive {
		t.Error("User.BeforeCreate() didn't set IsActive to true")
	}

	// Verifica se a senha foi hasheada
	if user.Password == "TestPass123" {
		t.Error("User.BeforeCreate() didn't hash password")
	}

	if len(user.Password) != 60 {
		t.Errorf("User.BeforeCreate() password length = %d, want 60", len(user.Password))
	}

	// Verifica se a senha hasheada é válida
	err = CheckPassword("TestPass123", user.Password)
	if err != nil {
		t.Error("User.BeforeCreate() hashed password is invalid")
	}
}

func TestUser_BeforeUpdate(t *testing.T) {
	// Cria um usuário inicial
	user := User{
		ID:        primitive.NewObjectID(),
		Name:      "Test User",
		Email:     "test@example.com",
		Password:  "TestPass123",
		Role:      "member",
		IsActive:  true,
		CreatedAt: time.Now().Add(-24 * time.Hour),
		UpdatedAt: time.Now().Add(-24 * time.Hour),
	}

	// Primeiro, prepara para criar (para hashear a senha inicial)
	_ = user.BeforeCreate()
	initialPassword := user.Password
	initialUpdatedAt := user.UpdatedAt

	// Aguarda um momento para garantir que UpdatedAt seja diferente
	time.Sleep(10 * time.Millisecond)

	// Atualiza o nome (sem alterar senha)
	user.Name = "Updated Name"
	err := user.BeforeUpdate()
	if err != nil {
		t.Fatalf("User.BeforeUpdate() error = %v", err)
	}

	// Verifica se UpdatedAt foi atualizado
	if !user.UpdatedAt.After(initialUpdatedAt) {
		t.Error("User.BeforeUpdate() didn't update UpdatedAt")
	}

	// Verifica se a senha não foi alterada
	if user.Password != initialPassword {
		t.Error("User.BeforeUpdate() changed password when it shouldn't")
	}

	// Agora testa alteração de senha
	user.Password = "NewPassword123"
	err = user.BeforeUpdate()
	if err != nil {
		t.Fatalf("User.BeforeUpdate() error = %v", err)
	}

	// Verifica se a nova senha foi hasheada
	if user.Password == "NewPassword123" {
		t.Error("User.BeforeUpdate() didn't hash new password")
	}

	if user.Password == initialPassword {
		t.Error("User.BeforeUpdate() didn't change password hash")
	}

	// Verifica se a nova senha hasheada é válida
	err = CheckPassword("NewPassword123", user.Password)
	if err != nil {
		t.Error("User.BeforeUpdate() new hashed password is invalid")
	}
}

func TestUser_ToResponse(t *testing.T) {
	user := User{
		ID:        primitive.NewObjectID(),
		Name:      "Test User",
		Email:     "test@example.com",
		Password:  "$2a$10$hashedpassword",
		Role:      "member",
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	response := user.ToResponse()

	// Verifica se os campos foram copiados corretamente
	if response.ID != user.ID {
		t.Error("ToResponse() ID mismatch")
	}
	if response.Name != user.Name {
		t.Error("ToResponse() Name mismatch")
	}
	if response.Email != user.Email {
		t.Error("ToResponse() Email mismatch")
	}
	if response.Role != user.Role {
		t.Error("ToResponse() Role mismatch")
	}
	if response.IsActive != user.IsActive {
		t.Error("ToResponse() IsActive mismatch")
	}

	// Verifica se a senha não está presente na resposta
}
