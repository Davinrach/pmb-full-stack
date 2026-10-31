package middleware

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"pmb-staici-backend/internal/config"
	"pmb-staici-backend/internal/model"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func generateTestToken(secret string, userID uint, email string, role model.Role, duration time.Duration) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// TC_WB_011: AuthMiddleware menolak request tanpa Authorization header
func TestWB011_AuthMiddleware_MissingHeader(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test_secret_key"}
	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Status code = %d, diharapkan %d", w.Code, http.StatusUnauthorized)
	}
}

// TC_WB_012: AuthMiddleware menolak format header yang bukan 'Bearer <token>'
func TestWB012_AuthMiddleware_InvalidFormat(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test_secret_key"}
	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Basic invalidtokenformat")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Status code = %d, diharapkan %d", w.Code, http.StatusUnauthorized)
	}
}

// TC_WB_013: AuthMiddleware menolak token dengan signature atau secret yang salah
func TestWB013_AuthMiddleware_InvalidSignature(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test_secret_key"}
	tokenStr, _ := generateTestToken("wrong_secret", 1, "user@test.com", model.RoleCalonMahasiswa, time.Hour)

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenStr))
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Status code = %d, diharapkan %d", w.Code, http.StatusUnauthorized)
	}
}

// TC_WB_014: AuthMiddleware menolak token yang telah kedaluwarsa (expired)
func TestWB014_AuthMiddleware_ExpiredToken(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test_secret_key"}
	// Duration negatif agar langsung expired
	tokenStr, _ := generateTestToken(cfg.JWTSecret, 1, "user@test.com", model.RoleCalonMahasiswa, -time.Hour)

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenStr))
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Status code = %d, diharapkan %d", w.Code, http.StatusUnauthorized)
	}
}

// TC_WB_015: AuthMiddleware menerima token valid dan menyematkan konteks user
func TestWB015_AuthMiddleware_ValidToken(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test_secret_key"}
	tokenStr, _ := generateTestToken(cfg.JWTSecret, 42, "mhs@staici.ac.id", model.RoleCalonMahasiswa, time.Hour)

	var extractedUserID uint
	var extractedEmail string
	var extractedRole model.Role

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/protected", func(c *gin.Context) {
		extractedUserID = c.GetUint("user_id")
		extractedEmail = c.GetString("email")
		roleVal, _ := c.Get("role")
		extractedRole = model.Role(roleVal.(string))
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenStr))
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Status code = %d, diharapkan %d", w.Code, http.StatusOK)
	}
	if extractedUserID != 42 || extractedEmail != "mhs@staici.ac.id" || extractedRole != model.RoleCalonMahasiswa {
		t.Errorf("Klaim token tidak sesuai konteks: id=%d, email=%s, role=%s", extractedUserID, extractedEmail, extractedRole)
	}
}

// TC_WB_016: RequireRoles menolak request saat context tidak memiliki atribut role
func TestWB016_RequireRoles_MissingRoleInContext(t *testing.T) {
	router := gin.New()
	router.Use(RequireRoles(model.RoleAdminPMB))
	router.GET("/admin-only", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/admin-only", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("Status code = %d, diharapkan %d", w.Code, http.StatusForbidden)
	}
}

// TC_WB_017: RequireRoles mengizinkan akses jika role pengguna sesuai
func TestWB017_RequireRoles_RoleMatched(t *testing.T) {
	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("role", string(model.RoleAdminPMB))
		c.Next()
	})
	router.Use(RequireRoles(model.RoleAdminPMB, model.RoleSuperAdmin))
	router.GET("/admin-only", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/admin-only", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Status code = %d, diharapkan %d", w.Code, http.StatusOK)
	}
}

// TC_WB_018: RequireRoles menolak akses jika role pengguna tidak memiliki wewenang
func TestWB018_RequireRoles_RoleMismatched(t *testing.T) {
	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("role", string(model.RoleCalonMahasiswa))
		c.Next()
	})
	router.Use(RequireRoles(model.RoleAdminPMB, model.RoleSuperAdmin))
	router.GET("/admin-only", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/admin-only", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("Status code = %d, diharapkan %d", w.Code, http.StatusForbidden)
	}
}
