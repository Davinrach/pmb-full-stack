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
		&model.FAQ{},
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

	// Seed Master Data Awal (Prodi, Gelombang, Admin, Settings, FAQ, RBAC)
	seedProgramStudi(db)
	seedGelombang(db)
	seedAdminDefault(db)
	seedSettingsDefault(db)
	seedFAQDefault(db)
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
	defaultPetunjuk := "1. Lakukan transfer manual sesuai nominal biaya pendaftaran ke rekening resmi STAICI di atas.\n2. Cantumkan Nomor Registrasi PMB pada kolom berita transfer jika memungkinkan.\n3. Simpan bukti transfer (struk ATM / tangkapan layar m-banking / bukti setor tunai).\n4. Unggah file bukti transfer dalam format JPG, PNG, atau PDF (maksimal 2 MB).\n5. Tim Keuangan PMB akan memverifikasi pembayaran Anda dalam waktu 1x24 jam kerja."
	defaultRegulasi := "1. Bukti pembayaran harus memuat informasi nama pengirim, nominal transfer yang sesuai, tanggal/waktu transaksi, dan nomor referensi/struk yang terbaca jelas.\n2. Pembayaran yang tidak sesuai nominal atau bukti buram/rusak akan ditolak dan wajib diunggah ulang.\n3. Biaya pendaftaran yang telah dibayarkan dan diverifikasi sah tidak dapat ditarik kembali."
	defaultPersyaratan := "1. Scan / Foto Kartu Keluarga (KK) Asli atau Legalisir.\n2. Scan / Foto KTP Calon Mahasiswa (atau Surat Keterangan Domisili/KTP Sementara).\n3. Scan / Foto Ijazah atau Surat Keterangan Lulus (SKL) SLTA Sederajat.\n4. Pas Foto Resmi Berwarna 3x4 (Latar Belakang Merah/Biru).\n5. Bukti Transfer Pembayaran Biaya Pendaftaran PMB yang sah.\n6. Scan Kartu KIP / KIP-Kuliah (Khusus Pendaftar Jalur Beasiswa KIP)."
	defaultJalur := "Jalur Reguler (Mandiri): Terbuka bagi seluruh lulusan SMA/MA/SMK/Pondok Pesantren.\nJalur Beasiswa KIP-Kuliah: Terbuka bagi lulusan berprestasi pemegang KIP/KKS/PKH."

	if count == 0 {
		settings := model.PengaturanSistem{
			BannerTitle:            "Pusat Pendaftaran Mahasiswa Baru & Informasi Program Studi",
			BannerSubtitle:         "Meneguhkan keilmuan Islam modern dan etika profesional santri. Mari bergabung bersama STAI Cendekia Insani Tahun Akademik 2026/2027.",
			AnnouncementText:       "Penerimaan Mahasiswa Baru Gelombang 1 Resmi Dibuka",
			BankName:               "Bank Syariah Indonesia (BSI)",
			NomorRekening:          "7148899012",
			AtasNama:               "STAI Cendekia Insani PMB",
			PetunjukPembayaran:     defaultPetunjuk,
			RegulasiBuktiBayar:     defaultRegulasi,
			BatasWaktuKonfirmasi:   "1x24 Jam Kerja",
			PersyaratanPendaftaran: defaultPersyaratan,
			JalurPendaftaranInfo:   defaultJalur,
			NoWhatsappCS:           "085233432221",
			EmailCS:                "pmb@staicisitubondo.ac.id",
			AlamatKampus:           "Jl. Raya Panji No. 12, Situbondo, Jawa Timur",
		}
		db.Create(&settings)
	} else {
		// Update existing row if instructions are empty
		var existing model.PengaturanSistem
		if err := db.First(&existing).Error; err == nil {
			updated := false
			if existing.PetunjukPembayaran == "" {
				existing.PetunjukPembayaran = defaultPetunjuk
				updated = true
			}
			if existing.RegulasiBuktiBayar == "" {
				existing.RegulasiBuktiBayar = defaultRegulasi
				updated = true
			}
			if existing.BatasWaktuKonfirmasi == "" {
				existing.BatasWaktuKonfirmasi = "1x24 Jam Kerja"
				updated = true
			}
			if existing.PersyaratanPendaftaran == "" {
				existing.PersyaratanPendaftaran = defaultPersyaratan
				updated = true
			}
			if existing.JalurPendaftaranInfo == "" {
				existing.JalurPendaftaranInfo = defaultJalur
				updated = true
			}
			if updated {
				db.Save(&existing)
			}
		}
	}
}

func seedFAQDefault(db *gorm.DB) {
	var count int64
	db.Model(&model.FAQ{}).Count(&count)
	if count == 0 {
		defaultFAQs := []model.FAQ{
			{
				Kategori:   "Pendaftaran",
				Pertanyaan: "Kapan waktu pendaftaran mahasiswa baru (PMB) STAICI dibuka?",
				Jawaban:    "Pendaftaran dibuka melalui beberapa gelombang sepanjang tahun akademik berjalan. Silakan cek tabel Gelombang aktif pada halaman beranda atau dashboard untuk melihat tanggal buka dan tutupnya.",
				Urutan:     1,
				IsAktif:    true,
			},
			{
				Kategori:   "Pendaftaran",
				Pertanyaan: "Apakah pendaftaran PMB STAICI dapat dilakukan secara online sepenuhnya?",
				Jawaban:    "Ya, calon mahasiswa dapat melakukan registrasi akun, verifikasi email/OTP, pengisian biodata EMIS/Kopertais, unggah berkas, dan konfirmasi pembayaran secara online melalui website resmi ini.",
				Urutan:     2,
				IsAktif:    true,
			},
			{
				Kategori:   "Berkas",
				Pertanyaan: "Bagaimana jika berkas saya dinyatakan tidak sah / perlu perbaikan?",
				Jawaban:    "Admin akan memberikan catatan alasan penolakan pada dashboard akun Anda. Anda dapat mengunggah ulang berkas revisi yang benar sebelum batas gelombang berakhir.",
				Urutan:     3,
				IsAktif:    true,
			},
			{
				Kategori:   "Pembayaran",
				Pertanyaan: "Berapa lama proses verifikasi pembayaran biaya pendaftaran?",
				Jawaban:    "Proses verifikasi oleh Tim Keuangan PMB memerlukan waktu maksimal 1x24 jam kerja setelah Anda mengunggah bukti transfer yang sah dan jelas.",
				Urutan:     4,
				IsAktif:    true,
			},
			{
				Kategori:   "Beasiswa",
				Pertanyaan: "Apakah tersedia jalur beasiswa KIP-Kuliah di STAI Cendekia Insani?",
				Jawaban:    "Ya, STAICI menyediakan jalur beasiswa KIP-Kuliah bagi calon mahasiswa berprestasi dari keluarga kurang mampu. Pastikan Anda mengunggah berkas KIP/KKS/PKH saat pendaftaran.",
				Urutan:     5,
				IsAktif:    true,
			},
			{
				Kategori:   "Layanan",
				Pertanyaan: "Siapa yang dapat saya hubungi jika mengalami kendala saat mendaftar?",
				Jawaban:    "Anda dapat menghubungi nomor WhatsApp Customer Service PMB di 0852-3343-2221 atau email pmb@staicisitubondo.ac.id pada jam layanan kerja (Senin - Sabtu: 08.00 - 16.00 WIB).",
				Urutan:     6,
				IsAktif:    true,
			},
		}
		for _, f := range defaultFAQs {
			db.Create(&f)
		}
		log.Println("✓ Seed Master Data FAQ PMB berhasil.")
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

	// 2.5 Hapus menu yang sudah tidak digunakan (verifikasi berkas & integrasi VA) sesuai instruksi admin
	var deprecatedMenus []model.Menu
	db.Where("`key` IN ?", []string{"verifikasi", "va"}).Find(&deprecatedMenus)
	for _, dm := range deprecatedMenus {
		db.Where("menu_id = ?", dm.ID).Delete(&model.RoleMenu{})
		db.Delete(&dm)
	}

	// 3. Seed Default Menus
	defaultMenus := []model.Menu{
		// Menu Utama
		{MenuGroupID: groupMenuUtama.ID, Nama: "Pendaftar PMB", Key: "pendaftar", Icon: "Users", URL: "pendaftar", BadgeText: "128", Urutan: 1, IsAktif: true},
		{MenuGroupID: groupMenuUtama.ID, Nama: "Seleksi & Penerimaan", Key: "seleksi", Icon: "Award", URL: "seleksi", Urutan: 2, IsAktif: true},
		// Alat & Integrasi
		{MenuGroupID: groupAlat.ID, Nama: "Export Data", Key: "export", Icon: "Download", URL: "export", Urutan: 1, IsAktif: true},
		{MenuGroupID: groupAlat.ID, Nama: "Sinkronisasi EMIS", Key: "emis", Icon: "RefreshCw", URL: "emis", Urutan: 2, IsAktif: true},
		{MenuGroupID: groupAlat.ID, Nama: "Log Audit", Key: "logs", Icon: "History", URL: "logs", Urutan: 3, IsAktif: true},
		// Pengaturan
		{MenuGroupID: groupPengaturan.ID, Nama: "Kelola Gelombang", Key: "gelombang", Icon: "Calendar", URL: "gelombang", Urutan: 1, IsAktif: true},
		{MenuGroupID: groupPengaturan.ID, Nama: "CMS Content & Banner", Key: "settings", Icon: "Settings", URL: "settings", Urutan: 2, IsAktif: true},
		{MenuGroupID: groupPengaturan.ID, Nama: "CMS Program Studi", Key: "prodi", Icon: "Layers", URL: "prodi", Urutan: 3, IsAktif: true},
		{MenuGroupID: groupPengaturan.ID, Nama: "Manajemen Role & RBAC", Key: "rbac", Icon: "ShieldCheck", URL: "rbac", Urutan: 4, IsAktif: true},
	}

	for _, m := range defaultMenus {
		var existing model.Menu
		if err := db.Where("`key` = ?", m.Key).First(&existing).Error; err != nil {
			db.Create(&m)
		} else {
			db.Model(&existing).Update("nama", m.Nama)
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

		// verifikator_keuangan -> gets pendaftar, export
		if m.Key == "pendaftar" || m.Key == "export" {
			var countVK int64
			db.Model(&model.RoleMenu{}).Where("role_kode = ? AND menu_id = ?", "verifikator_keuangan", m.ID).Count(&countVK)
			if countVK == 0 {
				db.Create(&model.RoleMenu{RoleKode: "verifikator_keuangan", MenuID: m.ID, AllowView: true})
			}
		}
	}
}

