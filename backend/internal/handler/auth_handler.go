package handler

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"pmb-staici-backend/internal/config"
	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/middleware"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/response"
	"pmb-staici-backend/internal/util"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type AuthHandler struct {
	cfg *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{cfg: cfg}
}

type RegisterRequest struct {
	NamaLengkap string `json:"nama_lengkap" binding:"required"`
	NIK         string `json:"nik" binding:"required"`
	NoHP        string `json:"no_hp" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required"`
}

type LoginRequest struct {
	Identifier string `json:"identifier" binding:"required"` // Email atau NIK
	Password   string `json:"password" binding:"required"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

// Register registers a new calon mahasiswa (FR-1.1, FR-1.2)
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data formulir pendaftaran akun tidak valid", err.Error())
		return
	}

	// Validate NIK
	cleanNIK := strings.TrimSpace(req.NIK)
	if !util.ValidateNIK(cleanNIK) {
		response.BadRequest(c, "NIK harus terdiri dari 16 digit angka", "NIK invalid format")
		return
	}

	// Validate Password
	if err := util.ValidatePasswordStrength(req.Password); err != nil {
		response.BadRequest(c, err.Error(), "Password too short")
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))

	// Check if Email or NIK already exists
	var existingUser model.User
	if err := database.DB.Where("email = ? OR nik = ?", cleanEmail, cleanNIK).First(&existingUser).Error; err == nil {
		if existingUser.Email == cleanEmail {
			response.BadRequest(c, "Alamat email ini sudah terdaftar. Silakan login atau gunakan email lain.", "Email already exists")
			return
		}
		response.BadRequest(c, "NIK ini sudah terdaftar. Silakan hubungi panitia PMB jika ini adalah kesalahan.", "NIK already exists")
		return
	}

	// Hash password
	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	verificationToken := uuid.New().String()

	newUser := model.User{
		Email:             cleanEmail,
		PasswordHash:      hashedPassword,
		NamaLengkap:       strings.TrimSpace(req.NamaLengkap),
		NoHP:              strings.TrimSpace(req.NoHP),
		NIK:               cleanNIK,
		Role:              model.RoleCalonMahasiswa,
		IsEmailVerified:   true, // Diatur true atau dengan email simulation
		VerificationToken: verificationToken,
	}

	tx := database.DB.Begin()

	if err := tx.Create(&newUser).Error; err != nil {
		tx.Rollback()
		response.InternalServerError(c, fmt.Sprintf("Gagal membuat akun: %v", err))
		return
	}

	// Buat draft record Pendaftar otomatis
	newPendaftar := model.Pendaftar{
		UserID:            newUser.ID,
		StatusPendaftaran: model.StatusAkunTerdaftar,
		Agama:             "Islam",
		StatusWargaNegara: "WNI",
	}
	if err := tx.Create(&newPendaftar).Error; err != nil {
		tx.Rollback()
		response.InternalServerError(c, fmt.Sprintf("Gagal inisialisasi formulir pendaftar: %v", err))
		return
	}

	// Inisialisasi OrangTua record kosong
	newOrangTua := model.OrangTua{
		PendaftarID: newPendaftar.ID,
	}
	if err := tx.Create(&newOrangTua).Error; err != nil {
		tx.Rollback()
		response.InternalServerError(c, fmt.Sprintf("Gagal inisialisasi data orang tua: %v", err))
		return
	}

	tx.Commit()

	response.Success(c, http.StatusCreated, "Pendaftaran akun berhasil. Silakan login untuk melanjutkan pendaftaran PMB.", gin.H{
		"user_id":            newUser.ID,
		"email":              newUser.Email,
		"nama_lengkap":       newUser.NamaLengkap,
		"verification_token": verificationToken,
	})
}

// Login handles user/admin login with email or NIK (FR-1.6)
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Email/NIK dan Kata Sandi harus diisi", err.Error())
		return
	}

	identifier := strings.TrimSpace(req.Identifier)
	var user model.User

	// Find by email or NIK
	err := database.DB.Where("email = ? OR nik = ?", strings.ToLower(identifier), identifier).First(&user).Error
	if err != nil {
		response.Unauthorized(c, "Email / NIK atau Kata Sandi yang Anda masukkan salah")
		return
	}

	// Check password
	if !util.CheckPasswordHash(req.Password, user.PasswordHash) {
		response.Unauthorized(c, "Email / NIK atau Kata Sandi yang Anda masukkan salah")
		return
	}

	// Generate JWT
	expirationTime := time.Now().Add(7 * 24 * time.Hour) // 7 hari
	claims := &middleware.Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "pmb-staici",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(h.cfg.JWTSecret))
	if err != nil {
		response.InternalServerError(c, "Gagal membuat sesi login")
		return
	}

	// Get Pendaftar ID if role is calon_mahasiswa
	var pendaftarID *uint
	var statusPendaftaran *model.StatusPendaftaran
	var nomorPendaftaran *string

	if user.Role == model.RoleCalonMahasiswa {
		var pendaftar model.Pendaftar
		if err := database.DB.Where("user_id = ?", user.ID).First(&pendaftar).Error; err == nil {
			pendaftarID = &pendaftar.ID
			statusPendaftaran = &pendaftar.StatusPendaftaran
			nomorPendaftaran = pendaftar.NomorPendaftaran
		}
	}

	response.Success(c, http.StatusOK, "Login berhasil", gin.H{
		"token": tokenString,
		"user": gin.H{
			"id":                 user.ID,
			"nama_lengkap":       user.NamaLengkap,
			"email":              user.Email,
			"no_hp":              user.NoHP,
			"nik":                user.NIK,
			"role":               user.Role,
			"pendaftar_id":       pendaftarID,
			"status_pendaftaran": statusPendaftaran,
			"nomor_pendaftaran":  nomorPendaftaran,
		},
	})
}

// GetMe returns current authenticated user info (FR-7.1)
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "Sesi tidak valid")
		return
	}

	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}

	var pendaftar *model.Pendaftar
	if user.Role == model.RoleCalonMahasiswa {
		var p model.Pendaftar
		if err := database.DB.Preload("Gelombang").Preload("ProgramStudi").Preload("DataOrangTua").Preload("Berkas").Preload("Pembayaran").Where("user_id = ?", user.ID).First(&p).Error; err == nil {
			pendaftar = &p
		}
	}

	response.Success(c, http.StatusOK, "Profil pengguna berhasil diambil", gin.H{
		"user":      user,
		"pendaftar": pendaftar,
	})
}

// ForgotPassword handles reset token generation (FR-1.3)
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Alamat email tidak valid", err.Error())
		return
	}

	var user model.User
	if err := database.DB.Where("email = ?", strings.ToLower(strings.TrimSpace(req.Email))).First(&user).Error; err != nil {
		// Respond success anyway to avoid user enumeration
		response.Success(c, http.StatusOK, "Jika email terdaftar, instruksi reset kata sandi telah dikirim ke email Anda.", nil)
		return
	}

	resetToken := uuid.New().String()
	user.ResetPasswordToken = resetToken
	database.DB.Save(&user)

	response.Success(c, http.StatusOK, "Instruksi reset kata sandi telah dikirim ke email Anda.", gin.H{
		"reset_token": resetToken, // Simulated for direct testing
	})
}

// ResetPassword resets password using token (FR-1.3)
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Token dan kata sandi baru diperlukan", err.Error())
		return
	}

	if err := util.ValidatePasswordStrength(req.NewPassword); err != nil {
		response.BadRequest(c, err.Error(), "Password too weak")
		return
	}

	var user model.User
	if err := database.DB.Where("reset_password_token = ? AND reset_password_token != ''", req.Token).First(&user).Error; err != nil {
		response.BadRequest(c, "Token reset kata sandi tidak valid atau telah kedaluwarsa", "Invalid reset token")
		return
	}

	hashedPassword, err := util.HashPassword(req.NewPassword)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	user.PasswordHash = hashedPassword
	user.ResetPasswordToken = ""
	database.DB.Save(&user)

	response.Success(c, http.StatusOK, "Kata sandi Anda berhasil diperbarui. Silakan login kembali.", nil)
}

// ChangePassword changes password for authenticated user (FR-1.4)
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Kata sandi lama dan baru harus diisi", err.Error())
		return
	}

	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}

	if !util.CheckPasswordHash(req.OldPassword, user.PasswordHash) {
		response.BadRequest(c, "Kata sandi lama yang Anda masukkan tidak sesuai", "Invalid old password")
		return
	}

	if err := util.ValidatePasswordStrength(req.NewPassword); err != nil {
		response.BadRequest(c, err.Error(), "Password too weak")
		return
	}

	hashedPassword, err := util.HashPassword(req.NewPassword)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	user.PasswordHash = hashedPassword
	database.DB.Save(&user)

	response.Success(c, http.StatusOK, "Kata sandi berhasil diubah", nil)
}
