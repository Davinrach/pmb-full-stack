package database

import (
	"fmt"
	"log"
	"time"

	"pmb-staici-backend/internal/config"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/util"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) (*gorm.DB, error) {
	// DSN format: user:pass@tcp(host:port)/dbname?charset=utf8mb4&parseTime=True&loc=Local
	var dsn string
	if cfg.DBPassword == "" {
		dsn = fmt.Sprintf("%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.DBUser, cfg.DBHost, cfg.DBPort, cfg.DBName)
	} else {
		dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(mysql.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("gagal terhubung ke basis data MySQL: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil instance pool database: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto Migrate Tabel sesuai PRD & RBAC
	err = db.AutoMigrate(
		&model.User{},
		&model.ProgramStudi{},
		&model.Gelombang{},
		&model.Pendaftar{},
		&model.OrangTua{},
		&model.Berkas{},
		&model.Pembayaran{},
		&model.LogAktivitasAdmin{},
		&model.PengaturanSistem{},
		&model.RoleModel{},
		&model.MenuGroup{},
		&model.Menu{},
		&model.RoleMenu{},
	)
	if err != nil {
		return nil, fmt.Errorf("gagal migrasi skema tabel: %w", err)
	}

	// Normalisasi nomor_pendaftaran kosong menjadi NULL agar tidak bentrok dengan UNIQUE index
	db.Exec("UPDATE pendaftars SET nomor_pendaftaran = NULL WHERE nomor_pendaftaran = ''")

	// Seed Master Data Awal (Prodi, Gelombang, Admin, Settings, RBAC)
	seedProgramStudi(db)
	seedGelombang(db)
	seedAdminDefault(db)
	seedSettingsDefault(db)
	seedRBACDefault(db)

	DB = db
	log.Println("✓ Terhubung ke MySQL dan Auto-Migrate berhasil.")
	return db, nil
}

func seedProgramStudi(db *gorm.DB) {
	defaultProdi := []model.ProgramStudi{
		{
			Kode:      "MPI",
			Nama:      "Manajemen Pendidikan Islam",
			Jenjang:   "S1",
			Deskripsi: "Mencetak manajer, pengelola, dan tenaga kependidikan profesional berlandaskan nilai-nilai Islam dan tata kelola modern.",
			IsAktif:   true,
		},
		{
			Kode:      "AS",
			Nama:      "Ahwal Al-Syakhsiyah (Hukum Keluarga Islam)",
			Jenjang:   "S1",
			Deskripsi: "Mencetak sarjana hukum yang ahli di bidang hukum perdata Islam, hukum keluarga, advokasi syariah, dan peradilan agama.",
			IsAktif:   true,
		},
		{
			Kode:      "KPI",
			Nama:      "Komunikasi dan Penyiaran Islam",
			Jenjang:   "S1",
			Deskripsi: "Melahirkan praktisi media, jurnalis, konten kreator, dan da'i profesional yang adaptif di era transformasi digital.",
			IsAktif:   true,
		},
	}

	for _, prodi := range defaultProdi {
		var count int64
		db.Model(&model.ProgramStudi{}).Where("kode = ?", prodi.Kode).Count(&count)
		if count == 0 {
			db.Create(&prodi)
		}
	}
}

func seedGelombang(db *gorm.DB) {
	var count int64
	db.Model(&model.Gelombang{}).Count(&count)
	if count == 0 {
		now := time.Now()
		gelombang1 := model.Gelombang{
			Nama:             "Gelombang 1 - TA 2026/2027",
			TahunAkademik:    "2026/2027",
			TanggalBuka:      now.AddDate(0, -1, 0),
			TanggalTutup:     now.AddDate(0, 3, 0),
			BiayaPendaftaran: 250000,
			Kuota:            150,
			IsAktif:          true,
		}
		db.Create(&gelombang1)
	}
}

func seedAdminDefault(db *gorm.DB) {
	hash, _ := util.HashPassword("adminpmb123")
	
	// Create user with NIK 'admin' for easy username login
	var countAdminNIK int64
	db.Model(&model.User{}).Where("nik = ?", "admin").Count(&countAdminNIK)
	if countAdminNIK == 0 {
		adminUser := model.User{
			Email:           "admin@staici.ac.id",
			PasswordHash:    hash,
			NamaLengkap:     "Administrator PMB STAICI",
			NoHP:            "085233432221",
			NIK:             "admin",
			Role:            model.RoleSuperAdmin,
			IsEmailVerified: true,
		}
		db.Create(&adminUser)
		log.Println("✓ Akun default Admin PMB dibuat: username (NIK): admin / password: adminpmb123")
	}

	// Update existing admin@staicisitubondo.ac.id if exists
	var existingUser model.User
	if err := db.Where("email = ?", "admin@staicisitubondo.ac.id").First(&existingUser).Error; err == nil {
		existingUser.PasswordHash = hash
		db.Save(&existingUser)
	}
}

func seedSettingsDefault(db *gorm.DB) {
	var count int64
	db.Model(&model.PengaturanSistem{}).Count(&count)
	if count == 0 {
		settings := model.PengaturanSistem{
			BannerTitle:      "Pusat Pendaftaran Mahasiswa Baru & Informasi Program Studi",
			BannerSubtitle:   "Meneguhkan keilmuan Islam modern dan etika profesional santri. Mari bergabung bersama STAI Cendekia Insani Tahun Akademik 2026/2027.",
			AnnouncementText: "Penerimaan Mahasiswa Baru Gelombang 1 Resmi Dibuka",
			BankName:         "Bank Syariah Indonesia (BSI)",
			NomorRekening:    "7148899012",
			AtasNama:         "STAI Cendekia Insani PMB",
			NoWhatsappCS:     "085233432221",
			EmailCS:          "pmb@staicisitubondo.ac.id",
			AlamatKampus:     "Jl. Raya Panji No. 12, Situbondo, Jawa Timur",
		}
		db.Create(&settings)
	}
}

func seedRBACDefault(db *gorm.DB) {
	// 1. Seed Default Roles
	defaultRoles := []model.RoleModel{
		{
			Kode:      "super_admin",
			Nama:      "Super Administrator",
			Deskripsi: "Akses penuh tanpa batas ke seluruh modul sistem dan pengaturan RBAC.",
			IsSystem:  true,
		},
		{
			Kode:      "admin_pmb",
			Nama:      "Admin Panitia PMB",
			Deskripsi: "Pengelola data pendaftar, verifikasi berkas, seleksi, gelombang, dan CMS konten.",
			IsSystem:  true,
		},
		{
			Kode:      "verifikator_keuangan",
			Nama:      "Verifikator Keuangan",
			Deskripsi: "Khusus verifikasi pembayaran Virtual Account & bukti transfer pendaftaran.",
			IsSystem:  false,
		},
		{
			Kode:      "calon_mahasiswa",
			Nama:      "Calon Mahasiswa",
			Deskripsi: "Pengguna publik calon mahasiswa pendaftar.",
			IsSystem:  true,
		},
	}

	for _, r := range defaultRoles {
		var count int64
		db.Model(&model.RoleModel{}).Where("kode = ?", r.Kode).Count(&count)
		if count == 0 {
			db.Create(&r)
		}
	}

	// 2. Seed Default Menu Groups
	defaultGroups := []model.MenuGroup{
		{Nama: "Menu Utama", Urutan: 1, IsAktif: true},
		{Nama: "Alat & Integrasi", Urutan: 2, IsAktif: true},
		{Nama: "Pengaturan", Urutan: 3, IsAktif: true},
	}

	for i, g := range defaultGroups {
		var existing model.MenuGroup
		if err := db.Where("nama = ?", g.Nama).First(&existing).Error; err != nil {
			db.Create(&defaultGroups[i])
		} else {
			defaultGroups[i] = existing
		}
	}

	// Re-fetch groups to get valid IDs
	var groupMenuUtama, groupAlat, groupPengaturan model.MenuGroup
	db.Where("nama = ?", "Menu Utama").First(&groupMenuUtama)
	db.Where("nama = ?", "Alat & Integrasi").First(&groupAlat)
	db.Where("nama = ?", "Pengaturan").First(&groupPengaturan)

	// 3. Seed Default Menus
	defaultMenus := []model.Menu{
		// Menu Utama
		{MenuGroupID: groupMenuUtama.ID, Nama: "Pendaftar PMB", Key: "pendaftar", Icon: "Users", URL: "pendaftar", BadgeText: "128", Urutan: 1, IsAktif: true},
		{MenuGroupID: groupMenuUtama.ID, Nama: "Verifikasi Berkas", Key: "verifikasi", Icon: "FileText", URL: "verifikasi", Urutan: 2, IsAktif: true},
		{MenuGroupID: groupMenuUtama.ID, Nama: "Seleksi & Kelulusan", Key: "seleksi", Icon: "Award", URL: "seleksi", Urutan: 3, IsAktif: true},
		// Alat & Integrasi
		{MenuGroupID: groupAlat.ID, Nama: "Sinkronisasi EMIS", Key: "emis", Icon: "RefreshCw", URL: "emis", Urutan: 1, IsAktif: true},
		{MenuGroupID: groupAlat.ID, Nama: "Export Data", Key: "export", Icon: "Download", URL: "export", Urutan: 2, IsAktif: true},
		{MenuGroupID: groupAlat.ID, Nama: "Log Audit", Key: "logs", Icon: "History", URL: "logs", Urutan: 3, IsAktif: true},
		{MenuGroupID: groupAlat.ID, Nama: "Integrasi VA", Key: "va", Icon: "CreditCard", URL: "va", Urutan: 4, IsAktif: true},
		// Pengaturan
		{MenuGroupID: groupPengaturan.ID, Nama: "Kelola Gelombang", Key: "gelombang", Icon: "Calendar", URL: "gelombang", Urutan: 1, IsAktif: true},
		{MenuGroupID: groupPengaturan.ID, Nama: "CMS Content & Banner", Key: "settings", Icon: "Settings", URL: "settings", Urutan: 2, IsAktif: true},
		{MenuGroupID: groupPengaturan.ID, Nama: "CMS Program Studi", Key: "prodi", Icon: "Layers", URL: "prodi", Urutan: 3, IsAktif: true},
		{MenuGroupID: groupPengaturan.ID, Nama: "Manajemen Role & RBAC", Key: "rbac", Icon: "ShieldCheck", URL: "rbac", Urutan: 4, IsAktif: true},
	}

	for _, m := range defaultMenus {
		var count int64
		db.Model(&model.Menu{}).Where("`key` = ?", m.Key).Count(&count)
		if count == 0 {
			db.Create(&m)
		}
	}

	// 4. Assign Default Role Permissions (RoleMenu)
	var allMenus []model.Menu
	db.Find(&allMenus)

	for _, m := range allMenus {
		// super_admin -> gets all menus
		var countSA int64
		db.Model(&model.RoleMenu{}).Where("role_kode = ? AND menu_id = ?", "super_admin", m.ID).Count(&countSA)
		if countSA == 0 {
			db.Create(&model.RoleMenu{RoleKode: "super_admin", MenuID: m.ID, AllowView: true})
		}

		// admin_pmb -> gets all menus except rbac
		if m.Key != "rbac" {
			var countAdmin int64
			db.Model(&model.RoleMenu{}).Where("role_kode = ? AND menu_id = ?", "admin_pmb", m.ID).Count(&countAdmin)
			if countAdmin == 0 {
				db.Create(&model.RoleMenu{RoleKode: "admin_pmb", MenuID: m.ID, AllowView: true})
			}
		}

		// verifikator_keuangan -> gets pendaftar, verifikasi, va, export
		if m.Key == "pendaftar" || m.Key == "verifikasi" || m.Key == "va" || m.Key == "export" {
			var countVK int64
			db.Model(&model.RoleMenu{}).Where("role_kode = ? AND menu_id = ?", "verifikator_keuangan", m.ID).Count(&countVK)
			if countVK == 0 {
				db.Create(&model.RoleMenu{RoleKode: "verifikator_keuangan", MenuID: m.ID, AllowView: true})
			}
		}
	}
}

