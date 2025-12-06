package handlers

import (
	"ellp-volunter-platform/backend/internal/models"
	"ellp-volunter-platform/backend/internal/repositories"
	"ellp-volunter-platform/backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthHandler gerencia as requisições de autenticação
type AuthHandler struct {
	authService services.AuthService
}

// NewAuthHandler cria uma nova instância do handler de autenticação
func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Login godoc
// @Summary Login de usuário
// @Description Autentica um usuário e retorna um token JWT
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body models.LoginRequest true "Credenciais de login"
// @Success 200 {object} services.LoginResponse
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Router /api/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Dados inválidos",
		})
		return
	}

	response, err := h.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		switch err {
		case services.ErrInvalidCredentials:
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Email ou senha inválidos",
			})
		case services.ErrUserInactive:
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Usuário inativo",
			})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Erro ao realizar login",
			})
		}
		return
	}

	c.JSON(http.StatusOK, response)
}

// Register godoc
// @Summary Registrar novo usuário
// @Description Cria um novo usuário no sistema
// @Tags auth
// @Accept json
// @Produce json
// @Param user body models.CreateUserRequest true "Dados do usuário"
// @Success 201 {object} models.UserResponse
// @Failure 400 {object} gin.H
// @Failure 409 {object} gin.H
// @Router /api/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Dados inválidos",
		})
		return
	}

	user, err := h.authService.Register(c.Request.Context(), &req)
	if err != nil {
		switch err {
		case repositories.ErrUserAlreadyExists:
			c.JSON(http.StatusConflict, gin.H{
				"error": "Email já cadastrado",
			})
		case models.ErrInvalidEmail:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Email inválido",
			})
		case models.ErrInvalidPassword, models.ErrPasswordTooWeak:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Erro ao registrar usuário",
			})
		}
		return
	}

	c.JSON(http.StatusCreated, user)
}

// Logout godoc
// @Summary Logout de usuário
// @Description Invalida o token do usuário (cliente deve remover o token)
// @Tags auth
// @Produce json
// @Success 200 {object} gin.H
// @Router /api/auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// JWT stateless, o logout é feito no cliente
	// apenas é confirmado a operação
	c.JSON(http.StatusOK, gin.H{
		"message": "Logout realizado com sucesso",
	})
}

// RefreshToken godoc
// @Summary Renovar token
// @Description Gera um novo token JWT a partir do token atual
// @Tags auth
// @Produce json
// @Success 200 {object} gin.H
// @Failure 401 {object} gin.H
// @Router /api/auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Token não fornecido",
		})
		return
	}

	tokenString := authHeader
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	}

	newToken, err := h.authService.RefreshToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Token inválido ou expirado",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": newToken,
	})
}

// Me godoc
// @Summary Obter informações do usuário autenticado
// @Description Retorna as informações do usuário a partir do token JWT
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.UserResponse
// @Failure 401 {object} gin.H
// @Router /api/auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Não autenticado",
		})
		return
	}

	c.JSON(http.StatusOK, claims)
}
