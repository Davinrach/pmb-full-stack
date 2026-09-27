package main

import (
	"log"
	"os"

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
	if err := os.MkdirAll(cfg.UploadDir, 0755); err != nil {
		log.Fatalf("Gagal membuat direktori upload: %v", err)
	}

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

	// 6. Initialize Handlers
	healthHandler := handler.NewHealthHandler()
	authHandler := handler.NewAuthHandler(cfg)
	pendaftarHandler := handler.NewPendaftarHandler()
	berkasHandler := handler.NewBerkasHandler(cfg)
	pembayaranHandler := handler.NewPembayaranHandler(cfg)
	adminHandler := handler.NewAdminHandler()
	publicHandler := handler.NewPublicHandler()

	// 7. Route Groups
	api := r.Group("/api/v1")
	{
		// Public Routes (FR-10.1, FR-1.1, FR-1.6)
		api.GET("/health", healthHandler.Check)
		api.GET("/info-pmb", publicHandler.GetInfoPMB)
		api.GET("/public/settings", publicHandler.GetSettings)

		api.GET("/program-studi", func(c *gin.Context) {
			var results []model.ProgramStudi
			database.DB.Where("is_aktif = ?", true).Order("id asc").Find(&results)
			c.JSON(200, gin.H{"success": true, "data": results})
		})

		// Auth Public Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
		}

		// Authenticated Routes (Semua pengguna terautentikasi)
		authRequired := api.Group("")
		authRequired.Use(middleware.AuthMiddleware(cfg))
		{
			authRequired.GET("/auth/me", authHandler.GetMe)
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
			adminGroup.Use(middleware.RequireRoles(model.RoleAdminPMB, model.RoleSuperAdmin))
			{
				adminGroup.GET("/dashboard/stats", adminHandler.GetDashboardStats)
				adminGroup.GET("/pendaftar", adminHandler.ListPendaftar)
				adminGroup.GET("/pendaftar/:id", adminHandler.GetDetailPendaftar)
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

				// Audit Logs & Settings
				adminGroup.GET("/logs", adminHandler.GetLogs)
				adminGroup.GET("/settings", adminHandler.GetSettings)
				adminGroup.PUT("/settings", adminHandler.UpdateSettings)

				// Dynamic RBAC Navigation & Role Management Endpoints
				rbacHandler := handler.NewRBACHandler()
				adminGroup.GET("/rbac/nav-menus", rbacHandler.GetNavMenus)
				adminGroup.GET("/rbac/roles", rbacHandler.ListRoles)
				adminGroup.POST("/rbac/roles", rbacHandler.CreateRole)
				adminGroup.PUT("/rbac/roles/:id", rbacHandler.UpdateRole)
				adminGroup.GET("/rbac/menu-groups", rbacHandler.ListMenuGroups)
				adminGroup.POST("/rbac/menu-groups", rbacHandler.CreateMenuGroup)
				adminGroup.PUT("/rbac/menu-groups/:id", rbacHandler.UpdateMenuGroup)
				adminGroup.GET("/rbac/menus", rbacHandler.ListMenus)
				adminGroup.POST("/rbac/menus", rbacHandler.CreateMenu)
				adminGroup.GET("/rbac/role-permissions/:role_kode", rbacHandler.GetRolePermissions)
				adminGroup.POST("/rbac/role-permissions", rbacHandler.UpdateRolePermissions)
			}
		}
	}

	log.Printf("🚀 Server PMB STAICI Backend berjalan pada port :%s", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("Server berhenti dengan error: %v", err)
	}
}
