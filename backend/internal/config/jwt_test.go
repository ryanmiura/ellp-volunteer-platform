package config

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestGenerateToken(t *testing.T) {
	userID := "507f1f77bcf86cd799439011"
	email := "test@example.com"
	role := "member"

	token, err := GenerateToken(userID, email, role)
	if err != nil {
		t.Fatalf("GenerateToken() error = %v", err)
	}

	if token == "" {
		t.Error("GenerateToken() returned empty token")
	}

	// Valida o token gerado
	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("ValidateToken() error = %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("UserID = %v, want %v", claims.UserID, userID)
	}

	if claims.Email != email {
		t.Errorf("Email = %v, want %v", claims.Email, email)
	}

	if claims.Role != role {
		t.Errorf("Role = %v, want %v", claims.Role, role)
	}
}

func TestValidateToken(t *testing.T) {
	userID := "507f1f77bcf86cd799439011"
	email := "test@example.com"
	role := "admin"

	// Gera um token válido
	validToken, _ := GenerateToken(userID, email, role)

	// Gera um token expirado
	expiredClaims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}
	expiredToken := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims)
	expiredTokenString, _ := expiredToken.SignedString(JWTSecret)

	// Token com assinatura inválida
	invalidToken := validToken[:len(validToken)-5] + "xxxxx"

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
			name:    "Expired token",
			token:   expiredTokenString,
			wantErr: true,
		},
		{
			name:    "Invalid signature",
			token:   invalidToken,
			wantErr: true,
		},
		{
			name:    "Empty token",
			token:   "",
			wantErr: true,
		},
		{
			name:    "Malformed token",
			token:   "not.a.token",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := ValidateToken(tt.token)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateToken() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr {
				if claims == nil {
					t.Error("ValidateToken() returned nil claims for valid token")
				}
				if claims.UserID != userID {
					t.Errorf("UserID = %v, want %v", claims.UserID, userID)
				}
			}
		})
	}
}

func TestRefreshToken(t *testing.T) {
	userID := "507f1f77bcf86cd799439011"
	email := "test@example.com"
	role := "member"

	// Gera um token inicial
	originalToken, err := GenerateToken(userID, email, role)
	if err != nil {
		t.Fatalf("GenerateToken() error = %v", err)
	}

	// Renova o token
	newToken, err := RefreshToken(originalToken)
	if err != nil {
		t.Fatalf("RefreshToken() error = %v", err)
	}

	if newToken == "" {
		t.Error("RefreshToken() returned empty token")
	}

	// Valida o novo token
	claims, err := ValidateToken(newToken)
	if err != nil {
		t.Fatalf("ValidateToken() error = %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("UserID = %v, want %v", claims.UserID, userID)
	}

	if claims.Email != email {
		t.Errorf("Email = %v, want %v", claims.Email, email)
	}

	if claims.Role != role {
		t.Errorf("Role = %v, want %v", claims.Role, role)
	}
}

func TestRefreshTokenWithInvalidToken(t *testing.T) {
	invalidToken := "invalid.token.string"

	_, err := RefreshToken(invalidToken)
	if err == nil {
		t.Error("RefreshToken() should return error for invalid token")
	}
}
