package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"pmb-staici-backend/internal/config"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/response"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID uint       `json:"user_id"`
	Email  string     `json:"email"`
	Role   model.Role `json:"role"`
	jwt.RegisteredClaims
}

func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header diperlukan"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Format token tidak valid (Gunakan Bearer <token>)"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("metode signing tidak terduga: %v", token.Header["alg"])
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid atau telah kedaluwarsa"})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", string(claims.Role))
		c.Set("role_model", claims.Role)
		c.Next()
	}
}

// RequireRoles membatasi akses endpoint berdasarkan peran RBAC
func RequireRoles(roles ...model.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			response.Forbidden(c, "Akses ditolak: sesi login Anda tidak memiliki peran (role) yang valid")
			c.Abort()
			return
		}

		var userRole model.Role
		switch v := roleVal.(type) {
		case model.Role:
			userRole = v
		case string:
			userRole = model.Role(v)
		default:
			response.Forbidden(c, "Akses ditolak: format role tidak valid")
			c.Abort()
			return
		}

		for _, r := range roles {
			if userRole == r {
				c.Next()
				return
			}
		}

		response.Forbidden(c, fmt.Sprintf("Akses ditolak: Anda login sebagai '%s', tindakan ini khusus untuk Super Administrator", userRole))
		c.Abort()
	}
}

// RequireAdminStaff memastikan pengguna memiliki peran pengelola/admin (bukan calon mahasiswa)
func RequireAdminStaff() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			response.Forbidden(c, "Akses ditolak: sesi login tidak valid")
			c.Abort()
			return
		}

		roleStr := fmt.Sprintf("%v", roleVal)
		if roleStr == string(model.RoleCalonMahasiswa) || roleStr == "" {
			response.Forbidden(c, "Akses ditolak: Portal ini khusus untuk Administrator dan Pengelola PMB")
			c.Abort()
			return
		}

		c.Next()
	}
}
