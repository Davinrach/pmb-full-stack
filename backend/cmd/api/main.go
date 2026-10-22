package main

import (
	"log"
	"os"
	"strings"

	"pmb-staici-backend/internal/config"
	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/handler"
	"pmb-staici-backend/internal/middleware"
	"pmb-staici-backend/internal/model"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load Config
	cfg := config.LoadConfig()

	// 2. Ensure Secure Upload Directory exists (FR-3.1, Section 7.1)
	// 2. Ensure Secure Upload Directory exists (FR-3.1, Section 7.1)
	if err := os.MkdirAll(cfg.UploadDir, 0755); err != nil {
		log.Fatalf("Gagal membuat direktori upload: %v", err)
	}
	_ = os.MkdirAll(cfg.UploadDir+"/avatars", 0755)

	// 3. Connect to Database (MySQL) & Seed Defaults
	_, err := database.InitDB(cfg)
	if err != nil {
		log.Printf("Peringatan: Inisialisasi basis data gagal (%v). Pastikan MySQL telah aktif.", err)
	}

	// 4. Setup Gin Engine
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Use(gin.Recovery())

	// 5. Global Middlewares: CORS & Structured Observability Logger (PRD 7.7)
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.StructuredLogger())

	// Database Resilience Middleware: Auto-reconnect if DB was offline at startup, and return clean 503 instead of nil panic
	r.Use(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/uploads") || c.Request.URL.Path == "/api/v1/health" {
			c.Next()
			return
		}

		if database.DB == nil {
			if _, err := database.InitDB(cfg); err != nil {
				c.AbortWithStatusJSON(503, gin.H{
					"success": false,
					"message": "Basis data MySQL belum terhubung. Pastikan layanan MySQL (XAMPP / Laragon) sudah berjalan.",
					"error":   err.Error(),
				})
				return
			}
		}
		c.Next()
	})

	// Static file serving for uploads (Avatars, etc.)
	r.Static("/uploads", cfg.UploadDir)

	// 6. Initialize Handlers
	healthHandler := handler.NewHealthHandler()
	authHandler := handler.NewAuthHandler(cfg)
	pendaftarHandler := handler.NewPendaftarHandler()
	berkasHandler := handler.NewBerkasHandler(cfg)
	pembayaranHandler := handler.NewPembayaranHandler(cfg)
	adminHandler := handler.NewAdminHandler()
	publicHandler := handler.NewPublicHandler()
	cmsHandler := handler.NewCMSHandler()

	// 7. Route Groups
	api := r.Group("/api/v1")
	{
		// Public Routes (FR-10.1, FR-1.1, FR-1.6)
		api.GET("/health", healthHandler.Check)
		api.GET("/info-pmb", publicHandler.GetInfoPMB)
		api.GET("/info/pmb", publicHandler.GetInfoPMB)
		api.GET("/public/settings", publicHandler.GetSettings)
		api.GET("/faqs", publicHandler.GetPublicFAQs)
		api.GET("/rekening", cmsHandler.ListPublicRekening)
		api.GET("/jalur", cmsHandler.ListPublicJalur)
		api.GET("/tata-cara", cmsHandler.ListPublicTataCara)
		api.GET("/hotline", cmsHandler.ListPublicHotline)
		api.GET("/persyaratan", cmsHandler.ListPublicPersyaratan)

		api.GET("/program-studi", func(c *gin.Context) {
			var results []model.ProgramStudi
			database.DB.Where("is_aktif = ?", true).Order("id asc").Find(&results)
			c.JSON(200, gin.H{"success": true, "data": results})
		})

		api.GET("/program-studi/:slug", func(c *gin.Context) {
			rawSlug := c.Param("slug")
			slug := strings.ToLower(strings.TrimSpace(rawSlug))
			var result model.ProgramStudi
			err := database.DB.Where("LOWER(kode) = ? OR id = ? OR LOWER(REPLACE(REPLACE(nama, ' ', '-'), '/', '-')) = ?", slug, slug, slug).First(&result).Error
			if err != nil {
				c.JSON(404, gin.H{"success": false, "message": "Program studi tidak ditemukan"})
				return
			}
			c.JSON(200, gin.H{"success": true, "data": result})
		})

		// Auth Public Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/verify-otp", authHandler.VerifyOTP)
			auth.POST("/resend-otp", authHandler.ResendOTP)
			auth.POST("/login", authHandler.Login)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
		}

		// Authenticated Routes (Semua pengguna terautentikasi)
		authRequired := api.Group("")
		authRequired.Use(middleware.AuthMiddleware(cfg))
		{
			authRequired.GET("/auth/me", authHandler.GetMe)
			authRequired.PUT("/auth/profile", authHandler.UpdateProfile)
			authRequired.POST("/auth/profile/photo", authHandler.UploadProfilePhoto)
			authRequired.DELETE("/auth/profile/photo", authHandler.DeleteProfilePhoto)
			authRequired.POST("/auth/change-password", authHandler.ChangePassword)

			// Protected Document Streaming (PRD 7.1)
			authRequired.GET("/berkas/:id", berkasHandler.DownloadBerkas)

			// Calon Mahasiswa Routes
			mahasiswaGroup := authRequired.Group("")
			mahasiswaGroup.Use(middleware.RequireRoles(model.RoleCalonMahasiswa))
			{
				// Formulir Data Pendaftaran (FR-2.1 s/d FR-2.8)
				mahasiswaGroup.GET("/pendaftar/my", pendaftarHandler.GetMyPendaftaran)
				mahasiswaGroup.PUT("/pendaftar/identitas", pendaftarHandler.UpdateIdentitas)
				mahasiswaGroup.PUT("/pendaftar/asal-sekolah", pendaftarHandler.UpdateAsalSekolah)
				mahasiswaGroup.PUT("/pendaftar/orang-tua", pendaftarHandler.UpdateOrangTua)
				mahasiswaGroup.PUT("/pendaftar/prodi-gelombang", pendaftarHandler.UpdatePilihanProdi)
				mahasiswaGroup.POST("/pendaftar/submit", pendaftarHandler.SubmitFinal)

				// Upload & Ganti Berkas (FR-3.1 s/d FR-3.5)
				mahasiswaGroup.POST("/pendaftar/berkas", berkasHandler.UploadBerkas)
				mahasiswaGroup.DELETE("/pendaftar/berkas/:id", berkasHandler.DeleteBerkas)

				// Pembayaran Manual & Bukti Transfer (FR-4.1 s/d FR-4.3)
				mahasiswaGroup.GET("/pembayaran/info-rekening", pembayaranHandler.GetInfoRekening)
				mahasiswaGroup.POST("/pembayaran/konfirmasi", pembayaranHandler.KonfirmasiPembayaran)
				mahasiswaGroup.GET("/pembayaran/status", pembayaranHandler.GetStatusPembayaran)
			}

			// Admin CMS Routes (FR-8.1 s/d FR-8.15)
			adminGroup := authRequired.Group("/admin")
			adminGroup.Use(middleware.RequireAdminStaff())
			{
				adminGroup.GET("/dashboard/stats", adminHandler.GetDashboardStats)
				adminGroup.GET("/pendaftar", adminHandler.ListPendaftar)
				adminGroup.GET("/pendaftar/:id", adminHandler.GetDetailPendaftar)
				adminGroup.GET("/export/pendaftar", adminHandler.ExportPendaftar)
				adminGroup.PUT("/pendaftar/:id/verifikasi-berkas", adminHandler.VerifikasiBerkas)
				adminGroup.PUT("/pendaftar/:id/verifikasi-pembayaran", adminHandler.VerifikasiPembayaran)
				adminGroup.PUT("/pendaftar/:id/status-seleksi", adminHandler.UpdateStatusSeleksi)

				// Gelombang & Prodi
				adminGroup.GET("/gelombang", adminHandler.ListGelombang)
				adminGroup.POST("/gelombang", adminHandler.CreateGelombang)
				adminGroup.PUT("/gelombang/:id", adminHandler.UpdateGelombang)

				adminGroup.GET("/program-studi", adminHandler.ListProgramStudi)
				adminGroup.POST("/program-studi", adminHandler.CreateProgramStudi)
				adminGroup.PUT("/program-studi/:id", adminHandler.UpdateProgramStudi)
				adminGroup.DELETE("/program-studi/:id", adminHandler.DeleteProgramStudi)

				// Audit Logs & Settings
				adminGroup.GET("/logs", adminHandler.GetLogs)
				adminGroup.GET("/settings", adminHandler.GetSettings)
				adminGroup.PUT("/settings", adminHandler.UpdateSettings)

				// Dynamic FAQ Management
				adminGroup.GET("/faqs", adminHandler.GetFAQs)
				adminGroup.POST("/faqs", adminHandler.CreateFAQ)
				adminGroup.PUT("/faqs/:id", adminHandler.UpdateFAQ)
				adminGroup.DELETE("/faqs/:id", adminHandler.DeleteFAQ)
				adminGroup.PATCH("/faqs/:id/toggle", adminHandler.ToggleFAQStatus)

				// CMS Modular Management (Rekening, Jalur, Tata Cara, Hotline, Persyaratan)
				adminGroup.GET("/rekening", cmsHandler.ListRekening)
				adminGroup.POST("/rekening", cmsHandler.CreateRekening)
				adminGroup.PUT("/rekening/:id", cmsHandler.UpdateRekening)
				adminGroup.DELETE("/rekening/:id", cmsHandler.DeleteRekening)
				adminGroup.PATCH("/rekening/:id/toggle", cmsHandler.ToggleRekening)

				adminGroup.GET("/jalur", cmsHandler.ListJalur)
				adminGroup.POST("/jalur", cmsHandler.CreateJalur)
				adminGroup.PUT("/jalur/:id", cmsHandler.UpdateJalur)
				adminGroup.DELETE("/jalur/:id", cmsHandler.DeleteJalur)
				adminGroup.PATCH("/jalur/:id/toggle", cmsHandler.ToggleJalur)

				adminGroup.GET("/tata-cara", cmsHandler.ListTataCara)
				adminGroup.POST("/tata-cara", cmsHandler.CreateTataCara)
				adminGroup.PUT("/tata-cara/:id", cmsHandler.UpdateTataCara)
				adminGroup.DELETE("/tata-cara/:id", cmsHandler.DeleteTataCara)
				adminGroup.POST("/tata-cara/bulk", cmsHandler.BulkSaveTataCara)

				adminGroup.GET("/hotline", cmsHandler.ListHotline)
				adminGroup.POST("/hotline", cmsHandler.CreateHotline)
				adminGroup.PUT("/hotline/:id", cmsHandler.UpdateHotline)
				adminGroup.DELETE("/hotline/:id", cmsHandler.DeleteHotline)

				adminGroup.GET("/persyaratan", cmsHandler.ListPersyaratan)
				adminGroup.POST("/persyaratan", cmsHandler.CreatePersyaratan)
				adminGroup.PUT("/persyaratan/:id", cmsHandler.UpdatePersyaratan)
				adminGroup.DELETE("/persyaratan/:id", cmsHandler.DeletePersyaratan)

				// Dynamic RBAC Navigation (Accessible by any authorized admin role)
				rbacHandler := handler.NewRBACHandler()
				adminGroup.GET("/rbac/nav-menus", rbacHandler.GetNavMenus)

				// RBAC Configuration & Admin User Management (RESTRICTED TO SUPER ADMIN ONLY!)
				rbacSuperAdminGroup := adminGroup.Group("/rbac")
				rbacSuperAdminGroup.Use(middleware.RequireRoles(model.RoleSuperAdmin))
				{
					rbacSuperAdminGroup.GET("/roles", rbacHandler.ListRoles)
					rbacSuperAdminGroup.POST("/roles", rbacHandler.CreateRole)
					rbacSuperAdminGroup.PUT("/roles/:id", rbacHandler.UpdateRole)
					rbacSuperAdminGroup.GET("/menu-groups", rbacHandler.ListMenuGroups)
					rbacSuperAdminGroup.POST("/menu-groups", rbacHandler.CreateMenuGroup)
					rbacSuperAdminGroup.PUT("/menu-groups/:id", rbacHandler.UpdateMenuGroup)
					rbacSuperAdminGroup.DELETE("/menu-groups/:id", rbacHandler.DeleteMenuGroup)
					rbacSuperAdminGroup.GET("/menus", rbacHandler.ListMenus)
					rbacSuperAdminGroup.POST("/menus", rbacHandler.CreateMenu)
					rbacSuperAdminGroup.PUT("/menus/:id", rbacHandler.UpdateMenu)
					rbacSuperAdminGroup.DELETE("/menus/:id", rbacHandler.DeleteMenu)
					rbacSuperAdminGroup.GET("/role-permissions/:role_kode", rbacHandler.GetRolePermissions)
					rbacSuperAdminGroup.POST("/role-permissions", rbacHandler.UpdateRolePermissions)

					// Super Admin User Management
					rbacSuperAdminGroup.GET("/users", rbacHandler.ListAdminUsers)
					rbacSuperAdminGroup.POST("/users", rbacHandler.CreateAdminUser)
					rbacSuperAdminGroup.PUT("/users/:id/role", rbacHandler.UpdateUserRole)
				}
			}
		}
	}

	log.Printf("🚀 Server PMB STAICI Backend berjalan pada port :%s", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("Server berhenti dengan error: %v", err)
	}
}
