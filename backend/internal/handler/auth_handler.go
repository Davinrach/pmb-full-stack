package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
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

type VerifyOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required"`
}

type ResendOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
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

// Register registers a new calon mahasiswa (FR-1.1, FR-1.2) with 6-digit OTP verification
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
	otpCode := util.GenerateOTP()
	otpExpiresAt := time.Now().Add(15 * time.Minute)

	newUser := model.User{
		Email:             cleanEmail,
		PasswordHash:      hashedPassword,
		NamaLengkap:       strings.TrimSpace(req.NamaLengkap),
		NoHP:              strings.TrimSpace(req.NoHP),
		NIK:               cleanNIK,
		Role:              model.RoleCalonMahasiswa,
		IsEmailVerified:   false, // Wajib verifikasi OTP
		VerificationToken: verificationToken,
		VerificationOTP:   otpCode,
		OTPExpiresAt:      &otpExpiresAt,
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

	// Kirim email OTP secara asinkron
	go func(cfg *config.Config, toEmail, name, otp string) {
		_ = util.SendVerificationOTPEmail(cfg, toEmail, name, otp)
	}(h.cfg, newUser.Email, newUser.NamaLengkap, otpCode)

	resData := gin.H{
		"user_id":            newUser.ID,
		"email":              newUser.Email,
		"nama_lengkap":       newUser.NamaLengkap,
		"expires_in_seconds": 900,
	}
	if h.cfg.AppEnv != "production" {
		resData["dev_otp"] = otpCode
	}

	response.Success(c, http.StatusCreated, "Pendaftaran akun berhasil. Silakan masukkan kode OTP yang telah dikirimkan ke email Anda untuk verifikasi.", resData)
}

// VerifyOTP verifies the 6-digit OTP code and issues JWT login token
func (h *AuthHandler) VerifyOTP(c *gin.Context) {
	var req VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Email dan kode OTP 6-digit harus diisi dengan benar", err.Error())
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))
	cleanOTP := strings.TrimSpace(req.OTP)

	var user model.User
	if err := database.DB.Where("email = ?", cleanEmail).First(&user).Error; err != nil {
		response.NotFound(c, "Akun dengan email tersebut tidak ditemukan")
		return
	}

	if !user.IsEmailVerified {
		if user.VerificationOTP == "" || user.VerificationOTP != cleanOTP {
			response.BadRequest(c, "Kode OTP yang Anda masukkan salah atau tidak sesuai", "Invalid OTP")
			return
		}

		if user.OTPExpiresAt == nil || time.Now().After(*user.OTPExpiresAt) {
			response.BadRequest(c, "Kode OTP telah kedaluwarsa. Silakan klik 'Kirim Ulang Kode OTP'.", "Expired OTP")
			return
		}

		// Update verified state
		user.IsEmailVerified = true
		user.VerificationOTP = ""
		user.OTPExpiresAt = nil
		if err := database.DB.Save(&user).Error; err != nil {
			response.InternalServerError(c, "Gagal mengupdate status verifikasi akun")
			return
		}
	}

	// Generate JWT session for immediate login
	expirationTime := time.Now().Add(7 * 24 * time.Hour)
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

	response.Success(c, http.StatusOK, "Email berhasil diverifikasi! Selamat datang di PMB STAI Cendekia Insani.", gin.H{
		"token": tokenString,
		"user": gin.H{
			"id":                 user.ID,
			"nama_lengkap":       user.NamaLengkap,
			"email":              user.Email,
			"no_hp":              user.NoHP,
			"nik":                user.NIK,
			"role":               user.Role,
			"foto_profil":        user.FotoProfil,
			"pendaftar_id":       pendaftarID,
			"status_pendaftaran": statusPendaftaran,
			"nomor_pendaftaran":  nomorPendaftaran,
		},
	})
}

// ResendOTP generates a fresh 6-digit OTP code and resends email
func (h *AuthHandler) ResendOTP(c *gin.Context) {
	var req ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Alamat email tidak valid", err.Error())
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))
	var user model.User
	if err := database.DB.Where("email = ?", cleanEmail).First(&user).Error; err != nil {
		response.NotFound(c, "Akun dengan email tersebut tidak ditemukan")
		return
	}

	if user.IsEmailVerified {
		response.BadRequest(c, "Akun Anda sudah terverifikasi sebelumnya. Silakan langsung login.", "Already verified")
		return
	}

	newOTP := util.GenerateOTP()
	expiresAt := time.Now().Add(15 * time.Minute)

	user.VerificationOTP = newOTP
	user.OTPExpiresAt = &expiresAt

	if err := database.DB.Save(&user).Error; err != nil {
		response.InternalServerError(c, "Gagal memperbarui kode OTP")
		return
	}

	// Send email asynchronously
	go func(cfg *config.Config, toEmail, name, otp string) {
		_ = util.SendVerificationOTPEmail(cfg, toEmail, name, otp)
	}(h.cfg, user.Email, user.NamaLengkap, newOTP)

	resData := gin.H{
		"email":              user.Email,
		"expires_in_seconds": 900,
	}
	if h.cfg.AppEnv != "production" {
		resData["dev_otp"] = newOTP
	}

	response.Success(c, http.StatusOK, "Kode OTP baru telah berhasil dikirimkan ke email Anda.", resData)
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

	// Check if Calon Mahasiswa has verified their email
	if user.Role == model.RoleCalonMahasiswa && !user.IsEmailVerified {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Email akun Anda belum diverifikasi. Silakan masukkan kode OTP yang telah dikirimkan ke email Anda.",
			"error": gin.H{
				"code":    "UNVERIFIED_EMAIL",
				"message": "Email akun Anda belum diverifikasi. Silakan masukkan kode OTP terlebih dahulu.",
			},
			"data": gin.H{
				"need_email_verification": true,
				"email":                   user.Email,
			},
		})
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
			"foto_profil":        user.FotoProfil,
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

// ForgotPassword handles reset token generation and email dispatch (FR-1.3)
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Alamat email tidak valid", err.Error())
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))
	var user model.User
	if err := database.DB.Where("email = ?", cleanEmail).First(&user).Error; err != nil {
		// Respond success anyway to avoid user enumeration
		response.Success(c, http.StatusOK, "Jika email terdaftar, instruksi dan tombol reset kata sandi telah dikirim ke email Anda.", nil)
		return
	}

	resetToken := uuid.New().String()
	expiresAt := time.Now().Add(60 * time.Minute)

	user.ResetPasswordToken = resetToken
	user.ResetPasswordExpiresAt = &expiresAt
	database.DB.Save(&user)

	// Determine frontend URL (origin or default localhost:3000)
	origin := c.Request.Header.Get("Origin")
	if origin == "" {
		origin = "http://localhost:3000"
	}
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", origin, resetToken)

	// Send email asynchronously
	go func(cfg *config.Config, toEmail, name, link string) {
		_ = util.SendPasswordResetEmail(cfg, toEmail, name, link)
	}(h.cfg, user.Email, user.NamaLengkap, resetLink)

	resData := gin.H{
		"email": user.Email,
	}
	if h.cfg.AppEnv != "production" {
		resData["reset_token"] = resetToken
		resData["reset_link"] = resetLink
	}

	response.Success(c, http.StatusOK, "Tautan reset kata sandi telah berhasil dikirimkan ke email Anda. Silakan periksa kotak masuk atau folder spam email Anda.", resData)
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
	if err := database.DB.Where("reset_password_token = ? AND reset_password_token != ''", strings.TrimSpace(req.Token)).First(&user).Error; err != nil {
		response.BadRequest(c, "Tautan reset kata sandi tidak valid atau telah kedaluwarsa. Silakan minta tautan baru.", "Invalid reset token")
		return
	}

	if user.ResetPasswordExpiresAt != nil && time.Now().After(*user.ResetPasswordExpiresAt) {
		response.BadRequest(c, "Tautan reset kata sandi telah kedaluwarsa (lebih dari 60 menit). Silakan minta tautan reset baru.", "Expired reset token")
		return
	}

	hashedPassword, err := util.HashPassword(req.NewPassword)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	user.PasswordHash = hashedPassword
	user.ResetPasswordToken = ""
	user.ResetPasswordExpiresAt = nil
	database.DB.Save(&user)

	response.Success(c, http.StatusOK, "Kata sandi akun Anda berhasil diperbarui! Silakan login menggunakan kata sandi baru Anda.", nil)
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

type UpdateProfileRequest struct {
	NamaLengkap string `json:"nama_lengkap" binding:"required"`
	NoHP        string `json:"no_hp" binding:"required"`
}

// UpdateProfile updates authenticated user's name & phone number
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "Sesi tidak valid")
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Nama lengkap dan nomor HP/WhatsApp wajib diisi", err.Error())
		return
	}

	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}

	user.NamaLengkap = strings.TrimSpace(req.NamaLengkap)
	user.NoHP = strings.TrimSpace(req.NoHP)

	if err := database.DB.Save(&user).Error; err != nil {
		response.InternalServerError(c, "Gagal memperbarui profil pengguna")
		return
	}

	response.Success(c, http.StatusOK, "Profil Anda berhasil diperbarui", gin.H{
		"id":           user.ID,
		"nama_lengkap": user.NamaLengkap,
		"email":        user.Email,
		"no_hp":        user.NoHP,
		"nik":          user.NIK,
		"role":         user.Role,
		"foto_profil":  user.FotoProfil,
	})
}

// UploadProfilePhoto handles uploading user avatar
func (h *AuthHandler) UploadProfilePhoto(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "Sesi tidak valid")
		return
	}

	file, err := c.FormFile("foto_profil")
	if err != nil {
		response.BadRequest(c, "Berkas foto profil wajib diunggah", err.Error())
		return
	}

	// Max 5MB
	if file.Size > 5*1024*1024 {
		response.BadRequest(c, "Ukuran foto profil maksimal adalah 5MB", "File size exceeded")
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		response.BadRequest(c, "Format foto harus berupa JPG, JPEG, PNG, atau WEBP", "Invalid image extension")
		return
	}

	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}

	avatarDir := filepath.Join(h.cfg.UploadDir, "avatars")
	_ = os.MkdirAll(avatarDir, 0755)

	// Remove previous avatar file if exists
	if user.FotoProfil != "" {
		oldFilePath := filepath.Join(h.cfg.UploadDir, strings.TrimPrefix(user.FotoProfil, "/uploads/"))
		_ = os.Remove(oldFilePath)
	}

	newFileName := fmt.Sprintf("avatar_%v_%d%s", userID, time.Now().Unix(), ext)
	dst := filepath.Join(avatarDir, newFileName)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		response.InternalServerError(c, fmt.Sprintf("Gagal menyimpan berkas foto: %v", err))
		return
	}

	relativeURL := fmt.Sprintf("/uploads/avatars/%s", newFileName)
	user.FotoProfil = relativeURL
	if err := database.DB.Save(&user).Error; err != nil {
		response.InternalServerError(c, "Gagal mengupdate foto profil di basis data")
		return
	}

	response.Success(c, http.StatusOK, "Foto profil berhasil diperbarui", gin.H{
		"id":           user.ID,
		"nama_lengkap": user.NamaLengkap,
		"email":        user.Email,
		"no_hp":        user.NoHP,
		"nik":          user.NIK,
		"role":         user.Role,
		"foto_profil":  user.FotoProfil,
	})
}

// DeleteProfilePhoto removes user's profile photo
func (h *AuthHandler) DeleteProfilePhoto(c *gin.Context) {
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

	if user.FotoProfil != "" {
		oldFilePath := filepath.Join(h.cfg.UploadDir, strings.TrimPrefix(user.FotoProfil, "/uploads/"))
		_ = os.Remove(oldFilePath)
		user.FotoProfil = ""
		database.DB.Save(&user)
	}

	response.Success(c, http.StatusOK, "Foto profil berhasil dihapus", gin.H{
		"id":           user.ID,
		"nama_lengkap": user.NamaLengkap,
		"email":        user.Email,
		"no_hp":        user.NoHP,
		"nik":          user.NIK,
		"role":         user.Role,
		"foto_profil":  "",
	})
}
