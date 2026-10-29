package database

import (
	"fmt"
	"image"
	"image/color"
	"image/png"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"pmb-staici-backend/internal/config"
	"pmb-staici-backend/internal/crypto"
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
		&model.RekeningPembayaran{},
		&model.JalurPendaftaran{},
		&model.TataCaraPendaftaran{},
		&model.KontakHotline{},
		&model.PersyaratanDokumen{},
		&model.RoleModel{},
		&model.MenuGroup{},
		&model.Menu{},
		&model.RoleMenu{},
		&model.SiteTranslation{},
	)
	if err != nil {
		return nil, fmt.Errorf("gagal migrasi skema tabel: %w", err)
	}

	// Normalisasi nomor_pendaftaran kosong menjadi NULL agar tidak bentrok dengan UNIQUE index
	db.Exec("UPDATE pendaftars SET nomor_pendaftaran = NULL WHERE nomor_pendaftaran = ''")
	// Pastikan semua user memiliki UUID unik permanen untuk AAD kriptografi
	db.Exec("UPDATE users SET uuid = UUID() WHERE uuid IS NULL OR uuid = ''")

	// Seed Master Data Awal (Prodi, Gelombang, Admin, Settings, FAQ, Rekening, Jalur, TataCara, Hotline, Persyaratan, RBAC)
	seedProgramStudi(db)
	seedGelombang(db)
	seedAdminDefault(db)
	seedSettingsDefault(db)
	seedFAQDefault(db)
	seedRekeningPembayaran(db)
	seedJalurPendaftaran(db)
	seedTataCaraPendaftaran(db)
	seedKontakHotline(db)
	seedPersyaratanDokumen(db)
	seedRBACDefault(db)
	seedSiteTranslations(db)
	seedBasicPendaftar(db, cfg.UploadDir)

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
	if count < 3 {
		// Gelombang 1 (Sudah Ditutup)
		var g1 model.Gelombang
		if err := db.Where("nama LIKE ?", "Gelombang 1%").First(&g1).Error; err != nil {
			tBuka := time.Date(2026, 5, 1, 0, 0, 0, 0, time.Local)
			tTutup := time.Date(2026, 7, 31, 23, 59, 59, 0, time.Local)
			db.Create(&model.Gelombang{
				Nama:             "Gelombang 1 - TA 2026/2027",
				TahunAkademik:    "2026/2027",
				TanggalBuka:      tBuka,
				TanggalTutup:     tTutup,
				BiayaPendaftaran: 250000,
				Kuota:            150,
				IsAktif:          false,
			})
		} else {
			// Update g1 dates so it reflects closed status accurately
			tBuka := time.Date(2026, 5, 1, 0, 0, 0, 0, time.Local)
			tTutup := time.Date(2026, 7, 31, 23, 59, 59, 0, time.Local)
			db.Model(&g1).Updates(map[string]interface{}{
				"tanggal_buka":  tBuka,
				"tanggal_tutup": tTutup,
				"is_aktif":      false,
			})
		}

		// Gelombang 2 (Sedang Dibuka)
		var g2 model.Gelombang
		if err := db.Where("nama LIKE ?", "Gelombang 2%").First(&g2).Error; err != nil {
			tBuka := time.Date(2026, 8, 1, 0, 0, 0, 0, time.Local)
			tTutup := time.Date(2026, 11, 30, 23, 59, 59, 0, time.Local)
			db.Create(&model.Gelombang{
				Nama:             "Gelombang 2 - TA 2026/2027",
				TahunAkademik:    "2026/2027",
				TanggalBuka:      tBuka,
				TanggalTutup:     tTutup,
				BiayaPendaftaran: 250000,
				Kuota:            200,
				IsAktif:          true,
			})
		}

		// Gelombang 3 (Akan Datang)
		var g3 model.Gelombang
		if err := db.Where("nama LIKE ?", "Gelombang 3%").First(&g3).Error; err != nil {
			tBuka := time.Date(2026, 12, 1, 0, 0, 0, 0, time.Local)
			tTutup := time.Date(2027, 2, 28, 23, 59, 59, 0, time.Local)
			db.Create(&model.Gelombang{
				Nama:             "Gelombang 3 - TA 2026/2027",
				TahunAkademik:    "2026/2027",
				TanggalBuka:      tBuka,
				TanggalTutup:     tTutup,
				BiayaPendaftaran: 300000,
				Kuota:            100,
				IsAktif:          false,
			})
		}
	}
}

func seedAdminDefault(db *gorm.DB) {
	hash, _ := util.HashPassword("adminpmb123")
	
	// Create user with NIK 'admin' for easy username login or update role to super_admin if exists
	adminIdx := crypto.BlindIndex("admin")
	var countAdminNIK int64
	db.Model(&model.User{}).Where("email = ? OR nik_idx = ? OR nik = ?", "admin@staici.ac.id", adminIdx, "admin").Count(&countAdminNIK)
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
		log.Println("✓ Akun default Super Admin dibuat: username (NIK): admin / password: adminpmb123")
	} else {
		db.Model(&model.User{}).Where("email = ? OR nik_idx = ? OR nik = ?", "admin@staici.ac.id", adminIdx, "admin").Updates(map[string]interface{}{
			"role":              model.RoleSuperAdmin,
			"password_hash":     hash,
			"is_email_verified": true,
		})
		log.Println("✓ Akun 'admin' berhasil disinkronkan ke role: super_admin")
	}

	// Create user with NIK 'adminpmb' for Panitia PMB (Standard Admin) or update role to admin_pmb if exists
	panitiaIdx := crypto.BlindIndex("adminpmb")
	var countPanitiaNIK int64
	db.Model(&model.User{}).Where("email = ? OR nik_idx = ? OR nik = ?", "panitia@staici.ac.id", panitiaIdx, "adminpmb").Count(&countPanitiaNIK)
	if countPanitiaNIK == 0 {
		panitiaUser := model.User{
			Email:           "panitia@staici.ac.id",
			PasswordHash:    hash,
			NamaLengkap:     "Ust. Ahmad Fauzan",
			NoHP:            "085233432222",
			NIK:             "adminpmb",
			Role:            model.RoleAdminPMB,
			IsEmailVerified: true,
		}
		db.Create(&panitiaUser)
		log.Println("✓ Akun default Panitia PMB dibuat: username (NIK): adminpmb / password: adminpmb123")
	} else {
		db.Model(&model.User{}).Where("email = ? OR nik_idx = ? OR nik = ?", "panitia@staici.ac.id", panitiaIdx, "adminpmb").Updates(map[string]interface{}{
			"role":              model.RoleAdminPMB,
			"password_hash":     hash,
			"is_email_verified": true,
		})
		log.Println("✓ Akun 'adminpmb' berhasil disinkronkan ke role: admin_pmb")
	}

	// Update existing admin@staicisitubondo.ac.id if exists
	var existingUser model.User
	if err := db.Where("email = ?", "admin@staicisitubondo.ac.id").First(&existingUser).Error; err == nil {
		existingUser.PasswordHash = hash
		existingUser.Role = model.RoleSuperAdmin
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
			defaultJalurJSON := `[{"id":"reguler","nama":"Jalur Masuk Reguler (Mandiri)","badge":"Jalur Reguler","deskripsi":"Terbuka bagi seluruh lulusan SMA/MA/SMK/Pondok Pesantren sederajat tanpa batasan tahun kelulusan. Proses seleksi berkas administrasi dan wawancara.","is_aktif":true},{"id":"kip","nama":"Jalur Beasiswa KIP-Kuliah (Pemerintah)","badge":"Beasiswa KIP-Kuliah","deskripsi":"Khusus bagi calon mahasiswa berprestasi dari keluarga pemegang KIP/KKS/PKH atau terdata dalam DTKS Kemensos RI. Bebas biaya pendaftaran dan subsidi UKT.","is_aktif":true}]`
			defaultProdiJSON := `[{"prodi_id":1,"kode":"MPI","nama":"Manajemen Pendidikan Islam","deskripsi_singkat":"Mencetak sarjana yang menguasai tata kelola kelembagaan pendidikan Islam modern, kepemimpinan transformasional, dan sistem administrasi sekolah/madrasah unggul.","badge_jenjang":"Jenjang S1","badge_gelar":"Gelar Sarjana Pendidikan (S.Pd.)","badge_akreditasi":"Terakreditasi BAN-PT"},{"prodi_id":2,"kode":"AS","nama":"Ahwal Al-Syakhsiyah (Hukum Keluarga Islam)","deskripsi_singkat":"Fokus pada penguasaan hukum perdata Islam, advokasi, mediasi peradilan agama, dan pembinaan keluarga sakinah.","badge_jenjang":"Jenjang S1","badge_gelar":"Gelar Sarjana Hukum (S.H.)","badge_akreditasi":"Terakreditasi BAN-PT"},{"prodi_id":3,"kode":"KPI","nama":"Komunikasi dan Penyiaran Islam","deskripsi_singkat":"Mencetak praktisi media, jurnalis cyber, broadcaster, content creator, dan humas profesional berbasis nilai Islam.","badge_jenjang":"Jenjang S1","badge_gelar":"Gelar Sarjana Sosial (S.Sos.)","badge_akreditasi":"Terakreditasi BAN-PT"}]`

			if !strings.HasPrefix(existing.JalurPendaftaranInfo, "[") {
				existing.JalurPendaftaranInfo = defaultJalurJSON
				updated = true
			}
			if existing.HomepageProdiList == "" {
				existing.HomepageProdiList = defaultProdiJSON
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

func seedRekeningPembayaran(db *gorm.DB) {
	var count int64
	db.Model(&model.RekeningPembayaran{}).Count(&count)
	if count == 0 {
		rekenings := []model.RekeningPembayaran{
			{
				NamaBank:          "Bank Syariah Indonesia (BSI)",
				NomorRekening:     "7148899012",
				AtasNama:          "STAI Cendekia Insani PMB",
				Cabang:            "KCP Situbondo Panji",
				InstruksiTransfer: "Transfer melalui BSI Mobile / ATM Bersama dengan memasukkan kode bank 451 diikuti nomor rekening.",
				IsUtama:           true,
				IsAktif:           true,
				Urutan:            1,
			},
			{
				NamaBank:          "Bank Jatim Syariah",
				NomorRekening:     "6102938475",
				AtasNama:          "Yayasan Cendekia Insani Situbondo",
				Cabang:            "Situbondo",
				InstruksiTransfer: "Transfer melalui teller atau ATM Bank Jatim / JConnect Mobile ke nomor rekening di atas.",
				IsUtama:           false,
				IsAktif:           true,
				Urutan:            2,
			},
		}
		for _, r := range rekenings {
			db.Create(&r)
		}
		log.Println("✓ Seed Master Data Rekening Pembayaran PMB berhasil.")
	}
}

func seedJalurPendaftaran(db *gorm.DB) {
	var count int64
	db.Model(&model.JalurPendaftaran{}).Count(&count)
	if count == 0 {
		jalurs := []model.JalurPendaftaran{
			{
				Kode:             "reguler",
				Nama:             "Jalur Masuk Reguler (Mandiri)",
				BadgeText:        "Jalur Reguler",
				Deskripsi:        "Terbuka bagi seluruh lulusan SMA/MA/SMK/Pondok Pesantren sederajat tanpa batasan tahun kelulusan. Proses seleksi berkas administrasi dan wawancara.",
				SyaratKhusus:     "Ijazah/SKL SLTA sederajat dan bukti pembayaran biaya pendaftaran.",
				BebasBiaya:       false,
				TampilDiHomepage: true,
				IsAktif:          true,
				Urutan:           1,
			},
			{
				Kode:             "kip-kuliah",
				Nama:             "Jalur Beasiswa KIP-Kuliah (Pemerintah)",
				BadgeText:        "Beasiswa KIP-Kuliah",
				Deskripsi:        "Khusus bagi calon mahasiswa berprestasi dari keluarga pemegang KIP/KKS/PKH atau terdata dalam DTKS Kemensos RI. Bebas biaya pendaftaran dan subsidi UKT penuh.",
				SyaratKhusus:     "Melampirkan Kartu KIP / KKS / PKH atau Surat Keterangan Tidak Mampu (SKTM).",
				BebasBiaya:       true,
				TampilDiHomepage: true,
				IsAktif:          true,
				Urutan:           2,
			},
		}
		for _, j := range jalurs {
			db.Create(&j)
		}
		log.Println("✓ Seed Master Data Jalur Pendaftaran berhasil.")
	}
}

func seedTataCaraPendaftaran(db *gorm.DB) {
	var count int64
	db.Model(&model.TataCaraPendaftaran{}).Count(&count)
	if count == 0 {
		steps := []model.TataCaraPendaftaran{
			{
				NomorLangkah: 1,
				Judul:        "Konsultasi Pendaftaran",
				Deskripsi:    "Hubungi panitia PMB untuk memperoleh informasi gelombang, jadwal, dan biaya pendidikan.",
				Icon:         "MessageSquare",
				IsAktif:      true,
				Urutan:       1,
			},
			{
				NomorLangkah: 2,
				Judul:        "Pilih Jalur Pendaftaran",
				Deskripsi:    "Tentukan jalur masuk sesuai pilihan dan ketentuan kampus (Reguler atau Beasiswa KIP).",
				Icon:         "Award",
				IsAktif:      true,
				Urutan:       2,
			},
			{
				NomorLangkah: 3,
				Judul:        "Isi Formulir dan Unggah Berkas",
				Deskripsi:    "Mengisi formulir pendaftaran dan menyerahkan berkas persyaratan yang dibutuhkan.",
				Icon:         "FileText",
				IsAktif:      true,
				Urutan:       3,
			},
			{
				NomorLangkah: 4,
				Judul:        "Bayar Biaya Pendaftaran",
				Deskripsi:    "Lakukan pembayaran sesuai petunjuk dan nomor rekening resmi yang tersedia.",
				Icon:         "CreditCard",
				IsAktif:      true,
				Urutan:       4,
			},
			{
				NomorLangkah: 5,
				Judul:        "Tunggu Informasi",
				Deskripsi:    "Silahkan menunggu verifikasi dan pengumuman hasil seleksi melalui website resmi.",
				Icon:         "CheckCircle2",
				IsAktif:      true,
				Urutan:       5,
			},
		}
		for _, s := range steps {
			db.Create(&s)
		}
		log.Println("✓ Seed Master Data Tata Cara Pendaftaran berhasil.")
	}
}

func seedKontakHotline(db *gorm.DB) {
	var count int64
	db.Model(&model.KontakHotline{}).Count(&count)
	if count == 0 {
		kontaks := []model.KontakHotline{
			{
				NamaLayanan:    "WhatsApp Panitia PMB Center",
				TipeKontak:     "whatsapp",
				NomorAtauEmail: "085233432221",
				NamaPetugas:    "Panitia PMB STAICI",
				JamLayanan:     "Senin - Sabtu: 08.00 - 16.00 WIB",
				IsAktif:        true,
				Urutan:         1,
			},
			{
				NamaLayanan:    "Helpdesk Konsultasi Beasiswa KIP",
				TipeKontak:     "whatsapp",
				NomorAtauEmail: "085233432222",
				NamaPetugas:    "Admin Layanan KIP",
				JamLayanan:     "Senin - Jumat: 08.30 - 15.00 WIB",
				IsAktif:        true,
				Urutan:         2,
			},
			{
				NamaLayanan:    "Email Resmi PMB STAICI",
				TipeKontak:     "email",
				NomorAtauEmail: "pmb@staicisitubondo.ac.id",
				NamaPetugas:    "Sekretariat PMB",
				JamLayanan:     "24 Jam (Dibalas jam kerja)",
				IsAktif:        true,
				Urutan:         3,
			},
		}
		for _, k := range kontaks {
			db.Create(&k)
		}
		log.Println("✓ Seed Master Data Kontak Hotline PMB berhasil.")
	}
}

func seedPersyaratanDokumen(db *gorm.DB) {
	var count int64
	db.Model(&model.PersyaratanDokumen{}).Count(&count)
	if count == 0 {
		dokumens := []model.PersyaratanDokumen{
			{
				Kode:        "kk",
				NamaDokumen: "Scan / Foto Kartu Keluarga (KK) Asli atau Legalisir",
				Deskripsi:   "Dokumen Kartu Keluarga terbaru yang masih berlaku.",
				IsWajib:     true,
				JalurKhusus: "semua",
				TipeFile:    "jpg,jpeg,png,pdf",
				MaxSizeMB:   2,
				IsAktif:     true,
				Urutan:      1,
			},
			{
				Kode:        "ktp",
				NamaDokumen: "Scan / Foto KTP Calon Mahasiswa",
				Deskripsi:   "KTP Asli atau Surat Keterangan Domisili/KTP Sementara.",
				IsWajib:     true,
				JalurKhusus: "semua",
				TipeFile:    "jpg,jpeg,png,pdf",
				MaxSizeMB:   2,
				IsAktif:     true,
				Urutan:      2,
			},
			{
				Kode:        "ijazah",
				NamaDokumen: "Scan / Foto Ijazah atau SKL SLTA Sederajat",
				Deskripsi:   "Ijazah kelulusan SMA/MA/SMK/Pesantren atau Surat Keterangan Lulus (SKL).",
				IsWajib:     true,
				JalurKhusus: "semua",
				TipeFile:    "jpg,jpeg,png,pdf",
				MaxSizeMB:   2,
				IsAktif:     true,
				Urutan:      3,
			},
			{
				Kode:        "foto",
				NamaDokumen: "Pas Foto Resmi Berwarna 3x4",
				Deskripsi:   "Pas foto terbaru dengan latar belakang merah atau biru.",
				IsWajib:     true,
				JalurKhusus: "semua",
				TipeFile:    "jpg,jpeg,png",
				MaxSizeMB:   2,
				IsAktif:     true,
				Urutan:      4,
			},
			{
				Kode:        "bukti_bayar",
				NamaDokumen: "Bukti Transfer Pembayaran Biaya Pendaftaran PMB",
				Deskripsi:   "Struk ATM atau screenshot m-banking transfer ke rekening resmi.",
				IsWajib:     true,
				JalurKhusus: "reguler",
				TipeFile:    "jpg,jpeg,png,pdf",
				MaxSizeMB:   2,
				IsAktif:     true,
				Urutan:      5,
			},
			{
				Kode:        "kip",
				NamaDokumen: "Scan Kartu KIP / KKS / PKH / SKTM",
				Deskripsi:   "Khusus pendaftar Jalur Beasiswa KIP-Kuliah.",
				IsWajib:     true,
				JalurKhusus: "kip-kuliah",
				TipeFile:    "jpg,jpeg,png,pdf",
				MaxSizeMB:   2,
				IsAktif:     true,
				Urutan:      6,
			},
		}
		for _, d := range dokumens {
			db.Create(&d)
		}
		log.Println("✓ Seed Master Data Persyaratan Dokumen berhasil.")
	}
}

func seedRBACDefault(db *gorm.DB) {
	// Bersihkan entri menu dan grup yang sebelumnya sempat ter-soft delete agar tabel database benar-benar bersih
	db.Unscoped().Where("deleted_at IS NOT NULL").Delete(&model.Menu{})
	db.Unscoped().Where("deleted_at IS NOT NULL").Delete(&model.MenuGroup{})

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
		{Nama: "CMS/Content Management System", Urutan: 3, IsAktif: true},
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
	if err := db.Where("nama = ?", "CMS/Content Management System").First(&groupPengaturan).Error; err != nil {
		db.Where("nama = ?", "Pengaturan").First(&groupPengaturan)
	}

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
		// CMS / Content Management System
		{MenuGroupID: groupPengaturan.ID, Nama: "Homepage", Key: "homepage", Icon: "Home", URL: "homepage", Urutan: 1, IsAktif: true},
		{MenuGroupID: groupPengaturan.ID, Nama: "Program Studi", Key: "prodi", Icon: "Layers", URL: "prodi", Urutan: 2, IsAktif: true},
		{MenuGroupID: groupPengaturan.ID, Nama: "Pendaftaran & Biaya", Key: "pendaftaran", Icon: "CreditCard", URL: "pendaftaran", Urutan: 3, IsAktif: true},
		{MenuGroupID: groupPengaturan.ID, Nama: "Hotline & Narahubung", Key: "hotline", Icon: "Headphones", URL: "hotline", Urutan: 4, IsAktif: true},
		{MenuGroupID: groupPengaturan.ID, Nama: "Manajemen Role & RBAC", Key: "rbac", Icon: "ShieldCheck", URL: "rbac", Urutan: 5, IsAktif: true},
	}

	// Hapus menu translations jika sebelumnya sempat dibuat di database (kini dikelola langsung di masing-masing CMS page)
	var transMenu model.Menu
	if err := db.Unscoped().Where("`key` = ?", "translations").First(&transMenu).Error; err == nil {
		db.Where("menu_id = ?", transMenu.ID).Delete(&model.RoleMenu{})
		db.Unscoped().Delete(&transMenu)
	}

	// Migrasi menu lama gelombang -> pendaftaran
	db.Model(&model.Menu{}).Where("`key` = ?", "gelombang").Updates(map[string]interface{}{
		"nama":   "Pendaftaran & Biaya",
		"key":    "pendaftaran",
		"url":    "pendaftaran",
		"icon":   "CreditCard",
		"urutan": 3,
	})

	for _, m := range defaultMenus {
		var existing model.Menu
		if err := db.Where("`key` = ?", m.Key).First(&existing).Error; err != nil {
			db.Create(&m)
		} else {
			db.Model(&existing).Updates(map[string]interface{}{
				"nama":   m.Nama,
				"url":    m.URL,
				"icon":   m.Icon,
				"urutan": m.Urutan,
			})
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

func seedBasicPendaftar(db *gorm.DB, uploadDir string) {
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	createSampleDummyFiles(uploadDir)
	createSampleDummyFiles("./uploads")

	var gelombangs []model.Gelombang
	db.Find(&gelombangs)
	if len(gelombangs) == 0 {
		return
	}
	gelombangID := gelombangs[0].ID

	var prodis []model.ProgramStudi
	db.Find(&prodis)
	if len(prodis) == 0 {
		return
	}

	type BasicApplicant struct {
		Nama       string
		NIK        string
		Email      string
		NoHP       string
		JK         string
		ProdiIndex int
		Sekolah    string
		Jurusan    string
		Jalur      string
	}

	basicList := []BasicApplicant{
		{"Ahmad Fauzi Ridwan", "3512011203020001", "fauzi.ridwan@example.com", "081234567801", "Laki-laki", 0, "MAN 1 Situbondo", "IPA", "Reguler"},
		{"Siti Nur Halimah", "3512015504020002", "siti.halimah@example.com", "081234567802", "Perempuan", 1, "SMA Negeri 1 Panji", "IPS", "KIP-Kuliah"},
		{"Muhammad Rizky Pratama", "3512011405020003", "rizky.pratama@example.com", "081234567803", "Laki-laki", 2, "SMK Ibrahimy Sukorejo", "Multimedia", "Reguler"},
		{"Dewi Sartika Putri", "3512016206020004", "dewi.sartika@example.com", "081234567804", "Perempuan", 0, "MA Salafiyah Syafi'iyah", "Keagamaan", "KIP-Kuliah"},
		{"Bagas Dwi Santoso", "3512012107020005", "bagas.santoso@example.com", "081234567805", "Laki-laki", 1, "SMAN 2 Situbondo", "IPA", "Reguler"},
		{"Laila Fitriani", "3512014808020006", "laila.fitriani@example.com", "081234567806", "Perempuan", 2, "MAN 2 Situbondo", "IPS", "Reguler"},
		{"Hendra Kusuma", "3512011909020007", "hendra.kusuma@example.com", "081234567807", "Laki-laki", 0, "SMA PGRI Situbondo", "IPS", "Reguler"},
		{"Zahra Alifah Zahir", "3512015210020008", "zahra.alifah@example.com", "081234567808", "Perempuan", 1, "MA Nurul Jadid", "Keagamaan", "KIP-Kuliah"},
		{"Dimas Wahyu Pratama", "3512012511020009", "dimas.wahyu@example.com", "081234567809", "Laki-laki", 2, "SMK Negeri 1 Situbondo", "Teknik Komputer", "Reguler"},
		{"Anisa Tri Rahayu", "3512016312020010", "anisa.rahayu@example.com", "081234567810", "Perempuan", 0, "SMA Muhammadiyah 1 Panji", "IPA", "KIP-Kuliah"},
	}

	passHash, _ := util.HashPassword("pendaftar123")
	tglLahir := time.Date(2005, 5, 12, 0, 0, 0, 0, time.Local)

	for i, app := range basicList {
		var user model.User
		appIdx := crypto.BlindIndex(app.NIK)
		if err := db.Where("email = ? OR nik_idx = ? OR nik = ?", app.Email, appIdx, app.NIK).First(&user).Error; err != nil {
			user = model.User{
				Email:           app.Email,
				PasswordHash:    passHash,
				NamaLengkap:     app.Nama,
				NoHP:            app.NoHP,
				NIK:             app.NIK,
				Role:            model.RoleCalonMahasiswa,
				IsEmailVerified: true,
			}
			db.Create(&user)
		}

		prodiID := prodis[app.ProdiIndex%len(prodis)].ID
		noDaftar := fmt.Sprintf("PMB-2026-%04d", i+1)

		var pendaftar model.Pendaftar
		if err := db.Where("user_id = ?", user.ID).First(&pendaftar).Error; err != nil {
			pendaftar = model.Pendaftar{
				UserID:            user.ID,
				GelombangID:       &gelombangID,
				ProgramStudiID:    &prodiID,
				NomorPendaftaran:  &noDaftar,
				JalurPendaftaran:  app.Jalur,
				StatusPendaftaran: model.StatusMenungguVerifikasi,
				IsLocked:          true,
				JenisKelamin:      app.JK,
				Alamat:            fmt.Sprintf("Jl. Basuki Rahmat No. %d, Situbondo, Jawa Timur", (i+1)*5),
				TempatLahir:       "Situbondo",
				TanggalLahir:      &tglLahir,
				StatusWargaNegara: "WNI",
				Agama:             "Islam",
				StatusPernikahan:  "Belum Menikah",
				NamaSekolah:       app.Sekolah,
				StatusSekolah:     "Negeri",
				JurusanSekolah:    app.Jurusan,
				NilaiRataRata:     85.0 + float64(i%5),
				TahunLulus:        2025,
			}
			db.Create(&pendaftar)
		} else {
			// Pastikan status basic: menunggu_verifikasi & is_locked = true
			db.Model(&pendaftar).Updates(map[string]interface{}{
				"jalur_pendaftaran":  app.Jalur,
				"status_pendaftaran": model.StatusMenungguVerifikasi,
				"is_locked":          true,
				"catatan_revisi":     "",
			})
		}

		// Data Orang Tua
		var orangTua model.OrangTua
		if err := db.Where("pendaftar_id = ?", pendaftar.ID).First(&orangTua).Error; err != nil {
			orangTua = model.OrangTua{
				PendaftarID:      pendaftar.ID,
				NamaAyah:         "Bpk. " + app.Nama + " Senior",
				NIKAyah:          fmt.Sprintf("35120101017000%02d", i+1),
				KKAyah:           fmt.Sprintf("35120101010100%02d", i+1),
				TempatLahirAyah:  "Situbondo",
				AlamatAyah:       pendaftar.Alamat,
				PendidikanAyah:   "SMA / Sederajat",
				PekerjaanAyah:    "Wiraswasta",
				PenghasilanAyah:  "Rp 3.000.000 - Rp 5.000.000",
				NamaIbu:          "Ibu " + app.Nama,
				NIKIbu:           fmt.Sprintf("35120141017500%02d", i+1),
				KKIbu:            fmt.Sprintf("35120101010100%02d", i+1),
				TempatLahirIbu:   "Situbondo",
				AlamatIbu:        pendaftar.Alamat,
				PendidikanIbu:    "SMA / Sederajat",
				PekerjaanIbu:     "Ibu Rumah Tangga",
				PenghasilanIbu:   "Tidak Berpenghasilan",
				NoHPOrangTuaWali: app.NoHP,
			}
			db.Create(&orangTua)
		}

		// Dokumen Berkas (kk, ktp, ijazah, foto wajib; kip hanya jika Jalur KIP-Kuliah)
		type DocDef struct {
			Jenis    string
			FileName string
			Mime     string
			Path     string
		}
		docTypes := []DocDef{
			{"kk", fmt.Sprintf("kk_%s.pdf", noDaftar), "application/pdf", "uploads/berkas/dummy_kk.pdf"},
			{"ktp", fmt.Sprintf("ktp_%s.pdf", noDaftar), "application/pdf", "uploads/berkas/dummy_ktp.pdf"},
			{"ijazah", fmt.Sprintf("ijazah_%s.pdf", noDaftar), "application/pdf", "uploads/berkas/dummy_ijazah.pdf"},
			{"foto", fmt.Sprintf("foto_%s.png", noDaftar), "image/png", "uploads/berkas/dummy_foto.png"},
		}
		if app.Jalur == "KIP-Kuliah" {
			docTypes = append(docTypes, DocDef{
				Jenis:    "kip",
				FileName: fmt.Sprintf("kip_%s.pdf", noDaftar),
				Mime:     "application/pdf",
				Path:     "uploads/berkas/dummy_kip.pdf",
			})
		} else {
			db.Where("pendaftar_id = ? AND jenis_dokumen = 'kip'", pendaftar.ID).Delete(&model.Berkas{})
		}

		for _, dt := range docTypes {
			var berkas model.Berkas
			if err := db.Where("pendaftar_id = ? AND jenis_dokumen = ?", pendaftar.ID, dt.Jenis).First(&berkas).Error; err != nil {
				berkas = model.Berkas{
					PendaftarID:      pendaftar.ID,
					JenisDokumen:     dt.Jenis,
					FileName:         dt.FileName,
					FilePath:         dt.Path,
					FileSize:         1024 * 180,
					MimeType:         dt.Mime,
					StatusVerifikasi: model.StatusBerkasPending,
					CatatanAdmin:     "",
				}
				db.Create(&berkas)
			} else {
				db.Model(&berkas).Updates(map[string]interface{}{
					"status_verifikasi": model.StatusBerkasPending,
					"file_path":         dt.Path,
					"catatan_admin":     "",
				})
			}
		}

		// Pembayaran
		var bayar model.Pembayaran
		if err := db.Where("pendaftar_id = ?", pendaftar.ID).First(&bayar).Error; err != nil {
			bayar = model.Pembayaran{
				PendaftarID:         pendaftar.ID,
				Jumlah:              250000,
				BankTujuan:          "Bank Syariah Indonesia (BSI)",
				NomorRekeningTujuan: "7148899012",
				NamaPengirim:        app.Nama,
				BuktiTransferPath:   "uploads/berkas/dummy_bukti_bayar.png",
				Status:              model.StatusBayarMenungguVerifikasi,
			}
			db.Create(&bayar)
		} else {
			db.Model(&bayar).Updates(map[string]interface{}{
				"status":              model.StatusBayarMenungguVerifikasi,
				"bukti_transfer_path": "uploads/berkas/dummy_bukti_bayar.png",
				"alasan_penolakan":    "",
			})
		}
	}

	// Normalisasi seluruh pendaftar yang ada di database agar berstatus Menunggu Verifikasi
	db.Model(&model.Pendaftar{}).Where("deleted_at IS NULL").Updates(map[string]interface{}{
		"status_pendaftaran": model.StatusMenungguVerifikasi,
		"is_locked":          true,
	})
	db.Model(&model.Berkas{}).Where("id > 0").Updates(map[string]interface{}{
		"status_verifikasi": model.StatusBerkasPending,
		"catatan_admin":     "",
	})
	db.Model(&model.Pembayaran{}).Where("id > 0").Updates(map[string]interface{}{
		"status":           model.StatusBayarMenungguVerifikasi,
		"alasan_penolakan": "",
	})

	log.Println("✓ Seed Pendaftar Dummy Basic (Menunggu Verifikasi & Berkas Lengkap) aktif.")
}

func createSampleDummyFiles(baseDir string) {
	berkasDir := filepath.Join(baseDir, "berkas")
	_ = os.MkdirAll(berkasDir, 0755)

	kkPDF := createSimplePDF("DOKUMEN RESMI KARTU KELUARGA (KK)")
	ktpPDF := createSimplePDF("DOKUMEN RESMI KTP CALON MAHASISWA")
	ijazahPDF := createSimplePDF("DOKUMEN RESMI IJAZAH / SKL SLTA")
	kipPDF := createSimplePDF("DOKUMEN KARTU INDONESIA PINTAR (KIP)")

	pdfFiles := map[string][]byte{
		filepath.Join(berkasDir, "dummy_kk.pdf"):     kkPDF,
		filepath.Join(berkasDir, "dummy_ktp.pdf"):    ktpPDF,
		filepath.Join(berkasDir, "dummy_ijazah.pdf"): ijazahPDF,
		filepath.Join(berkasDir, "dummy_kip.pdf"):    kipPDF,
	}

	for p, content := range pdfFiles {
		_ = os.WriteFile(p, content, 0644)
	}

	createDummyPNG(filepath.Join(berkasDir, "dummy_foto.png"), 300, 400, color.RGBA{R: 26, G: 77, B: 140, A: 255})
	createDummyPNG(filepath.Join(berkasDir, "dummy_bukti_bayar.png"), 400, 600, color.RGBA{R: 240, G: 245, B: 240, A: 255})
}

func createSimplePDF(title string) []byte {
	content := fmt.Sprintf("BT /F1 18 Tf 50 720 Td (%s) Tj /F1 12 Tf 0 -35 Td (STAI Cendekia Insani Situbondo - Dokumen Uji Coba PMB) Tj /F1 10 Tf 0 -25 Td (Status: Menunggu Verifikasi oleh Panitia PMB) Tj ET", title)
	contentLen := len(content)

	return []byte(fmt.Sprintf(`%%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length %d >>
stream
%s
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000115 00000 n 
0000000240 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
430
%%EOF`, contentLen, content))
}

func createDummyPNG(filePath string, width, height int, baseColor color.RGBA) {
	img := image.NewRGBA(image.Rect(0, 0, width, height))

	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			if x < 8 || x > width-8 || y < 8 || y > height-8 {
				img.Set(x, y, color.RGBA{R: 15, G: 23, B: 42, A: 255})
			} else {
				img.Set(x, y, baseColor)
			}
		}
	}

	f, err := os.Create(filePath)
	if err == nil {
		defer f.Close()
		_ = png.Encode(f, img)
	}
}

// seedSiteTranslations menyuntikkan seluruh teks terjemahan default (ID & EN) ke tabel site_translations.
// Hanya dijalankan jika tabel masih kosong, agar perubahan admin tidak tertimpa.
func seedSiteTranslations(db *gorm.DB) {
	log.Println("📝 Memeriksa dan menyinkronkan teks terjemahan default (site_translations)...")

	type entry struct {
		Group string
		Key   string
		ID    string // Bahasa Indonesia
		EN    string // English
	}

	seeds := []entry{
		// ── NAVBAR ──
		{"navbar", "beranda", "Beranda", "Home"},
		{"navbar", "programStudi", "Program Studi", "Study Programs"},
		{"navbar", "lihatSemuaProdi", "Lihat Semua Program Studi ↓", "View All Study Programs ↓"},
		{"navbar", "pendaftaran", "Pendaftaran", "Admission"},
		{"navbar", "daftar", "Daftar", "Register"},
		{"navbar", "masuk", "Masuk", "Sign In"},
		{"navbar", "masukSebagai", "Masuk sebagai", "Signed in as"},
		{"navbar", "dashboardPmb", "Dashboard PMB", "Admission Dashboard"},
		{"navbar", "keluar", "Keluar (Logout)", "Sign Out"},
		{"navbar", "bukaMenu", "Buka Menu", "Open Menu"},
		{"navbar", "bahasa", "Bahasa", "Language"},
		{"navbar", "dashboardBtn", "Buka Dashboard PMB →", "Open Admission Dashboard →"},

		// ── HERO ──
		{"hero", "badge", "Penerimaan Mahasiswa Baru Gelombang 1 Resmi Dibuka", "Wave 1 New Student Admission is Officially Open"},
		{"hero", "title", "Pusat Pendaftaran Mahasiswa Baru & Informasi Program Studi", "New Student Admission Center & Study Program Information"},
		{"hero", "titleMain", "Pusat Pendaftaran Mahasiswa Baru", "New Student Admission Center"},
		{"hero", "titleHighlight", "& Informasi Program Studi", "& Study Program Information"},
		{"hero", "subtitle", "Meneguhkan keilmuan Islam modern dan etika profesional santri. Mari bergabung bersama STAI Cendekia Insani Tahun Akademik 2026/2027.", "Advancing modern Islamic scholarship and professional santri ethics. Join STAI Cendekia Insani for Academic Year 2026/2027."},
		{"hero", "btnDaftar", "Daftar Sekarang (Online)", "Apply Online Now"},
		{"hero", "btnBrosur", "Unduh Brosur PMB (PDF)", "Download Brochure (PDF)"},
		{"hero", "statistikGelombang", "Pendaftaran Gelombang 1 Aktif", "Wave 1 Admission Active"},
		{"hero", "jalurPenerimaan", "Jalur Reguler & KIP Kuliah", "Regular & KIP Scholarship Tracks"},

		// ── QUICK INFO ──
		{"quickInfo", "akreditasiTitle", "Terakreditasi Resmi", "Officially Accredited"},
		{"quickInfo", "akreditasiDesc", "BAN-PT & Kementerian Agama RI", "BAN-PT & Ministry of Religious Affairs RI"},
		{"quickInfo", "beasiswaTitle", "Program Beasiswa", "Scholarship Programs"},
		{"quickInfo", "beasiswaDesc", "KIP-Kuliah, Tahfidz & Prestasi", "KIP-Kuliah, Tahfidz & Academic Merit"},
		{"quickInfo", "kampusTitle", "Lokasi Strategis", "Strategic Campus"},
		{"quickInfo", "kampusDesc", "Jl. Raya no. 25 Paowan Panarukan Situbondo", "Jl. Raya no. 25 Paowan Panarukan Situbondo"},
		{"quickInfo", "lulusanTitle", "Gelar & Karir", "Degrees & Careers"},
		{"quickInfo", "lulusanDesc", "Sarjana S.Pd., S.H., dan S.Sos.", "Bachelor Degrees in S.Pd., S.H., and S.Sos."},

		// ── PRODI SECTION ──
		{"prodiSection", "badge", "Informasi Program Studi", "Study Program Information"},
		{"prodiSection", "title", "Program Studi Unggulan", "Featured Study Programs"},
		{"prodiSection", "subtitle", "STAI Cendekia Insani menyelenggarakan pendidikan sarjana terakreditasi dengan integrasi adab pesantren dan keilmuan kontemporer.", "STAI Cendekia Insani provides accredited bachelor education integrating Islamic values and contemporary science."},
		{"prodiSection", "lihatDetail", "Lihat Detail", "View Details"},
		{"prodiSection", "daftarProdiIni", "Daftar Program Studi Ini", "Apply for this Program"},
		{"prodiSection", "tutup", "Tutup", "Close"},
		{"prodiSection", "prospekKarir", "Prospek Karir & Profil Lulusan", "Career Prospects & Graduate Profiles"},
		{"prodiSection", "mataKuliah", "Mata Kuliah & Keilmuan Unggulan", "Core & Featured Courses"},

		// ── ALUR ──
		{"alur", "badge", "Alur Penerimaan Mahasiswa", "Admission Flow"},
		{"alur", "title", "5 Tahap Mudah Menjadi Mahasiswa STAICI", "5 Easy Steps to Become a STAICI Student"},
		{"alur", "subtitle", "Proses pendaftaran dirancang cepat, transparan, dan sepenuhnya online.", "The registration process is fast, transparent, and completely online."},

		// ── CTA ──
		{"cta", "title", "Siap Meraih Masa Depan Gemilang Bersama STAICI?", "Ready to Build a Bright Future with STAICI?"},
		{"cta", "subtitle", "Daftarkan diri Anda sekarang pada Gelombang 1 untuk mendapatkan kuota beasiswa dan program unggulan.", "Register now in Wave 1 to secure scholarship quotas and premier academic programs."},
		{"cta", "btnDaftar", "Daftar Mahasiswa Baru Sekarang", "Apply as a New Student Now"},
		{"cta", "btnHotline", "Konsultasi WhatsApp Panitia", "WhatsApp Admission Consultation"},

		// ── FOOTER ──
		{"footer", "identitasTitle", "STAI Cendekia Insani", "STAI Cendekia Insani"},
		{"footer", "identitasLocation", "Situbondo, Jawa Timur", "Situbondo, East Java, Indonesia"},
		{"footer", "identitasDesc", "Sekolah Tinggi Agama Islam Cendekia Insani Situbondo (STAI Cendekia Insani) adalah lembaga pendidikan tinggi yang bernaung di bawah Yayasan Cendekia Insani Panarukan, Situbondo.", "STAI Cendekia Insani Situbondo (STAICI) is an Islamic higher education institution under the auspices of the Cendekia Insani Panarukan Foundation, Situbondo."},
		{"footer", "akreditasiBanpt", "Terakreditasi BAN-PT", "Accredited by BAN-PT"},
		{"footer", "akreditasiKemenag", "Kemenag RI", "Ministry of Religious Affairs"},
		{"footer", "prodiTitle", "Program Studi", "Study Programs"},
		{"footer", "tautanTitle", "Tautan Cepat", "Quick Links"},
		{"footer", "tautanPendaftaran", "Pendaftaran Mahasiswa Baru", "New Student Admission"},
		{"footer", "tautanProdi", "Informasi Program Studi", "Study Program Information"},
		{"footer", "tautanPortal", "Portal Akun PMB", "Admission Account Portal"},
		{"footer", "kontakTitle", "Kontak & Kampus", "Contact & Campus"},
		{"footer", "alamat", "Jalan Raya no. 25 Paowan Panarukan Situbondo 68351", "Jalan Raya no. 25 Paowan Panarukan Situbondo 68351"},
		{"footer", "email", "staicendekia2010@gmail.com", "staicendekia2010@gmail.com"},
		{"footer", "telepon", "0852-3343-2221", "+62 852-3343-2221"},
		{"footer", "jamOperasional", "Senin - Sabtu: 08.00 - 16.00 WIB", "Monday - Saturday: 08:00 - 16:00 WIB"},
		{"footer", "copyright", "© 2026 STAI Cendekia Insani. Hak Cipta Dilindungi Undang-Undang.", "© 2026 STAI Cendekia Insani. All Rights Reserved."},
		{"footer", "bantuan", "Bantuan & Layanan PMB", "Support & PMB Services"},
		{"footer", "privasi", "Kebijakan Privasi", "Privacy Policy"},

		// ── SIDEBAR ──
		{"sidebar", "caraDaftarTitle", "Tata Cara Pendaftaran", "Admission Guidelines"},
		{"sidebar", "caraDaftarSubtitle", "Berikut adalah cara mudah untuk mendaftarkan diri ke STAI Cendekia Insani", "Here are the simple steps to register at STAI Cendekia Insani"},
		{"sidebar", "hotlineTitle", "Hotline Panitia PMB", "PMB Committee Hotline"},
		{"sidebar", "hotlineDesc", "Butuh bantuan pengisian atau konsultasi program studi? Hubungi petugas kami:", "Need help or consultation regarding study programs? Contact our team:"},
		{"sidebar", "whatsappLabel", "WhatsApp PMB Center", "WhatsApp PMB Center"},
		{"sidebar", "operatingHours", "Senin - Sabtu: 08.00 - 16.00 WIB", "Monday - Saturday: 08:00 - 16:00 WIB"},
		{"sidebar", "jalurTitle", "Jalur Masuk Reguler PMB TA 2026/2027", "Regular Admission Track AY 2026/2027"},
		{"sidebar", "jalurBadge", "Reguler & KIP", "Regular & KIP"},
		{"sidebar", "jalurDesc", "Semua calon mahasiswa baru mendaftar melalui Jalur Reguler STAICI. Bagi Anda pemegang Kartu Indonesia Pintar (KIP / KIP-K), silakan lampirkan pindaian Kartu KIP pada bagian unggah berkas (Bagian G) untuk diverifikasi dan diseleksi langsung oleh Panitia PMB STAICI Situbondo.", "All prospective new students register via the STAICI Regular Track. For holders of the Smart Indonesia Card (KIP / KIP-K), please attach a scan of your KIP card in the document upload section for direct verification and selection."},

		// ── PENDAFTARAN PAGE ──
		{"pendaftaranPage", "title", "Formulir Pendaftaran Mahasiswa Baru", "New Student Admission Form"},
		{"pendaftaranPage", "subtitle", "STAI Cendekia Insani Situbondo • Lengkapi 3 tahap praktis di bawah ini", "STAI Cendekia Insani Situbondo • Complete the 3 easy steps below"},
		{"pendaftaranPage", "badgeTa", "Penerimaan Mahasiswa Baru 2026/2027", "New Student Admission 2026/2027"},
		{"pendaftaranPage", "btnLihatProdi", "Lihat Detail Prodi", "View Study Programs"},
		{"pendaftaranPage", "tipsAuth", "Anda dapat langsung mengisi formulir, atau Masuk / Buat Akun agar draft isian tersimpan otomatis ke akun Anda.", "You can fill the form directly, or Sign In / Register to automatically save your draft."},
		{"pendaftaranPage", "btnMasukAkun", "Masuk / Daftar Akun", "Sign In / Register"},
		{"pendaftaranPage", "step1Title", "1. Jalur & Biodata", "1. Track & Identity"},
		{"pendaftaranPage", "step2Title", "2. Sekolah & Ortu", "2. School & Parents"},
		{"pendaftaranPage", "step3Title", "3. Berkas & Selesai", "3. Documents & Submit"},
		{"pendaftaranPage", "tahap1Header", "Tahap 1: Jalur Masuk & Biodata Calon Mahasiswa", "Stage 1: Admission Track & Applicant Identity"},
		{"pendaftaranPage", "tahap1Sub", "Pilih jalur, gelombang, prodi, dan lengkapi identitas dasar Anda.", "Select your entry track, wave, program, and complete your basic identity."},
		{"pendaftaranPage", "jalurTitle", "Jalur Pendaftaran", "Admission Track"},
		{"pendaftaranPage", "jalurHint", "Pilih salah satu", "Select one"},
		{"pendaftaranPage", "gelombangTitle", "Gelombang Pendaftaran (Sedang Dibuka)", "Admission Wave (Currently Open)"},
		{"pendaftaranPage", "gelombangAktif", "Periode Aktif", "Active Period"},
		{"pendaftaranPage", "prodiTitle", "Pilihan Program Studi S1", "Undergraduate Program Choice"},
		{"pendaftaranPage", "namaLengkap", "Nama Lengkap (Sesuai KTP/Ijazah)", "Full Name (as in ID/Diploma)"},
		{"pendaftaranPage", "nik", "NIK (16 Digit KTP/KK)", "National ID (16 Digits)"},
		{"pendaftaranPage", "jenisKelamin", "Jenis Kelamin", "Gender"},
		{"pendaftaranPage", "lakiLaki", "Laki-laki", "Male"},
		{"pendaftaranPage", "perempuan", "Perempuan", "Female"},
		{"pendaftaranPage", "tempatLahir", "Tempat Lahir", "Place of Birth"},
		{"pendaftaranPage", "tanggalLahir", "Tanggal Lahir", "Date of Birth"},
		{"pendaftaranPage", "statusPernikahan", "Status Pernikahan", "Marital Status"},
		{"pendaftaranPage", "belumMenikah", "Belum Menikah", "Single"},
		{"pendaftaranPage", "menikah", "Menikah", "Married"},
		{"pendaftaranPage", "dudaJanda", "Duda / Janda", "Divorced / Widowed"},
		{"pendaftaranPage", "agama", "Agama", "Religion"},
		{"pendaftaranPage", "kewarganegaraan", "Kewarganegaraan", "Citizenship"},
		{"pendaftaranPage", "noWa", "No. WhatsApp Aktif", "Active WhatsApp Number"},
		{"pendaftaranPage", "email", "Email Aktif", "Active Email"},
		{"pendaftaranPage", "alamat", "Alamat Tempat Tinggal Lengkap", "Full Residential Address"},
		{"pendaftaranPage", "tahap2Header", "Tahap 2: Asal Sekolah & Data Orang Tua", "Stage 2: High School & Parents Information"},
		{"pendaftaranPage", "tahap2Sub", "Lengkapi riwayat pendidikan sekolah menengah dan data orang tua/wali.", "Complete your high school history and parents/guardian information."},
		{"pendaftaranPage", "asalSekolahTitle", "A. Data Asal Sekolah (SMA / MA / SMK)", "A. High School Information (SMA / MA / SMK)"},
		{"pendaftaranPage", "namaSekolah", "Nama Asal Sekolah", "School Name"},
		{"pendaftaranPage", "statusSekolah", "Status Sekolah", "School Status"},
		{"pendaftaranPage", "jurusanSekolah", "Jurusan", "Major / Stream"},
		{"pendaftaranPage", "nilaiRataRata", "Nilai Rata-rata Ijazah / Rapor", "Average Score (Diploma/Report)"},
		{"pendaftaranPage", "tahunLulus", "Tahun Lulus", "Graduation Year"},
		{"pendaftaranPage", "ayahTitle", "B. Data Ayah Kandung", "B. Father's Information"},
		{"pendaftaranPage", "ibuTitle", "C. Data Ibu Kandung", "C. Mother's Information"},
		{"pendaftaranPage", "almarhum", "Almarhum", "Deceased"},
		{"pendaftaranPage", "almarhumah", "Almarhumah", "Deceased"},
		{"pendaftaranPage", "namaAyah", "Nama Ayah", "Father's Name"},
		{"pendaftaranPage", "pekerjaanAyah", "Pekerjaan Ayah", "Father's Occupation"},
		{"pendaftaranPage", "penghasilanAyah", "Penghasilan Ayah", "Father's Income"},
		{"pendaftaranPage", "namaIbu", "Nama Ibu", "Mother's Name"},
		{"pendaftaranPage", "pekerjaanIbu", "Pekerjaan Ibu", "Mother's Occupation"},
		{"pendaftaranPage", "penghasilanIbu", "Penghasilan Ibu", "Mother's Income"},
		{"pendaftaranPage", "tahap3Header", "Tahap 3: Unggah Berkas & Finalisasi", "Stage 3: Document Upload & Final Submit"},
		{"pendaftaranPage", "tahap3Sub", "Unggah berkas pendaftaran dan konfirmasi pengiriman formulir.", "Upload registration documents and confirm form submission."},
		{"pendaftaranPage", "berkasTitle", "Berkas Persyaratan (Format JPG/PDF maks. 2MB)", "Required Documents (JPG/PDF format, max 2MB)"},
		{"pendaftaranPage", "pembayaranTitle", "Nomor Rekening Resmi Kampus", "Official Campus Bank Account"},
		{"pendaftaranPage", "pernyataan", "Saya menyatakan bahwa seluruh data dan berkas yang saya isikan adalah benar dan sah sesuai data diri saya.", "I solemnly declare that all information and documents provided are true and valid."},
		{"pendaftaranPage", "btnDraft", "Simpan Draft", "Save Draft"},
		{"pendaftaranPage", "btnNext", "Lanjut ke Tahap Berikutnya →", "Proceed to Next Step →"},
		{"pendaftaranPage", "btnPrev", "← Kembali ke Tahap Sebelumnya", "← Back to Previous Step"},
		{"pendaftaranPage", "btnSubmit", "Submit Pendaftaran Sekarang", "Submit Registration Now"},
		{"pendaftaranPage", "ringkasanTitle", "Ringkasan Pendaftaran", "Application Summary"},
		{"pendaftaranPage", "ringkasanJalur", "Jalur", "Track"},
		{"pendaftaranPage", "ringkasanGelombang", "Gelombang", "Wave"},
		{"pendaftaranPage", "ringkasanProdi", "Pilihan Prodi", "Study Program"},
		{"pendaftaranPage", "ringkasanBiaya", "Biaya Formulir", "Registration Fee"},
		{"pendaftaranPage", "ringkasanProgres", "Kelengkapan Data", "Data Completion"},
		{"pendaftaranPage", "bantuanTitle", "Butuh Bantuan Pendaftaran?", "Need Help Applying?"},
		{"pendaftaranPage", "bantuanSub", "Tim Panitia PMB STAICI siap mendampingi pengisian formulir Anda.", "The STAICI PMB committee is ready to assist you."},
		{"pendaftaranPage", "bantuanWa", "WhatsApp Panitia PMB", "WhatsApp PMB Committee"},
		{"pendaftaranPage", "bantuanJam", "Senin - Sabtu: 08.00 - 16.00 WIB", "Monday - Saturday: 08:00 - 16:00 WIB"},
	}

	seededCount := 0
	for i, s := range seeds {
		var existing model.SiteTranslation
		if err := db.Where("group_name = ? AND translation_key = ?", s.Group, s.Key).First(&existing).Error; err != nil {
			t := model.SiteTranslation{
				GroupName:      s.Group,
				TranslationKey: s.Key,
				TextID:         s.ID,
				TextEN:         s.EN,
				Urutan:         i,
			}
			db.Create(&t)
			seededCount++
		}
	}

	if seededCount > 0 {
		log.Printf("✓ Disinkronkan %d teks terjemahan baru ke tabel site_translations.", seededCount)
	}
}
