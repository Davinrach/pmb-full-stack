package main

import (
	"fmt"
	"image"
	"image/color"
	"image/png"
	"log"
	"os"
	"path/filepath"
	"time"

	"pmb-staici-backend/internal/config"
	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/util"
)

func main() {
	log.Println("==================================================")
	log.Println("  PMB STAICI - RESET & SEED BASIC DUMMY VERIFIKASI")
	log.Println("==================================================")

	cfg := config.LoadConfig()

	// 1. Siapkan folder uploads dan dummy files fisik
	uploadDir := cfg.UploadDir
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	createSampleDummyFiles(uploadDir)
	// Salin juga ke "uploads" relative jika berbeda
	if uploadDir != "uploads" && uploadDir != "./uploads" {
		createSampleDummyFiles("./uploads")
	}

	// 2. Inisialisasi DB (AutoMigrate + Master Seeder bawaan)
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Gagal terhubung ke basis data MySQL: %v\nPastikan MySQL di XAMPP aktif dan database 'pmb_staici_db' sudah dibuat.", err)
	}

	// 3. Ambil Program Studi & Gelombang aktif
	var prodis []model.ProgramStudi
	db.Find(&prodis)
	if len(prodis) == 0 {
		log.Fatal("Program studi tidak ditemukan setelah inisialisasi basis data!")
	}

	var gelombangs []model.Gelombang
	db.Find(&gelombangs)
	if len(gelombangs) == 0 {
		log.Fatal("Gelombang tidak ditemukan setelah inisialisasi basis data!")
	}
	gelombangID := gelombangs[0].ID

	// 4. Bersihkan data dummy pendaftar sebelumnya agar bersih dan seragam
	log.Println("[*] Membersihkan data pendaftar dummy lama agar seragam...")
	db.Exec("DELETE FROM berkas")
	db.Exec("DELETE FROM pembayarans")
	db.Exec("DELETE FROM orang_tuas")
	db.Exec("DELETE FROM pendaftars")
	db.Exec("DELETE FROM users WHERE role = 'calon_mahasiswa'")

	// 5. Data Calon Mahasiswa (Semua berstatus Menunggu Verifikasi)
	type ApplicantDummy struct {
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

	applicants := []ApplicantDummy{
		{
			Nama:       "Ahmad Fauzi Ridwan",
			NIK:        "3512011203020001",
			Email:      "fauzi.ridwan@example.com",
			NoHP:       "081234567801",
			JK:         "Laki-laki",
			ProdiIndex: 0, // Manajemen Pendidikan Islam (MPI)
			Sekolah:    "MAN 1 Situbondo",
			Jurusan:    "IPA",
			Jalur:      "Reguler",
		},
		{
			Nama:       "Siti Nur Halimah",
			NIK:        "3512015504020002",
			Email:      "siti.halimah@example.com",
			NoHP:       "081234567802",
			JK:         "Perempuan",
			ProdiIndex: 1, // Ahwal Al-Syakhsiyah (AS)
			Sekolah:    "SMA Negeri 1 Panji",
			Jurusan:    "IPS",
			Jalur:      "KIP-Kuliah",
		},
		{
			Nama:       "Muhammad Rizky Pratama",
			NIK:        "3512011405020003",
			Email:      "rizky.pratama@example.com",
			NoHP:       "081234567803",
			JK:         "Laki-laki",
			ProdiIndex: 2, // Komunikasi dan Penyiaran Islam (KPI)
			Sekolah:    "SMK Ibrahimy Sukorejo",
			Jurusan:    "Multimedia",
			Jalur:      "Reguler",
		},
		{
			Nama:       "Dewi Sartika Putri",
			NIK:        "3512016206020004",
			Email:      "dewi.sartika@example.com",
			NoHP:       "081234567804",
			JK:         "Perempuan",
			ProdiIndex: 0, // MPI
			Sekolah:    "MA Salafiyah Syafi'iyah",
			Jurusan:    "Keagamaan",
			Jalur:      "KIP-Kuliah",
		},
		{
			Nama:       "Bagas Dwi Santoso",
			NIK:        "3512012107020005",
			Email:      "bagas.santoso@example.com",
			NoHP:       "081234567805",
			JK:         "Laki-laki",
			ProdiIndex: 1, // AS
			Sekolah:    "SMAN 2 Situbondo",
			Jurusan:    "IPA",
			Jalur:      "Reguler",
		},
		{
			Nama:       "Laila Fitriani",
			NIK:        "3512014808020006",
			Email:      "laila.fitriani@example.com",
			NoHP:       "081234567806",
			JK:         "Perempuan",
			ProdiIndex: 2, // KPI
			Sekolah:    "MAN 2 Situbondo",
			Jurusan:    "IPS",
			Jalur:      "Reguler",
		},
		{
			Nama:       "Hendra Kusuma",
			NIK:        "3512011909020007",
			Email:      "hendra.kusuma@example.com",
			NoHP:       "081234567807",
			JK:         "Laki-laki",
			ProdiIndex: 0, // MPI
			Sekolah:    "SMA PGRI Situbondo",
			Jurusan:    "IPS",
			Jalur:      "Reguler",
		},
		{
			Nama:       "Zahra Alifah Zahir",
			NIK:        "3512015210020008",
			Email:      "zahra.alifah@example.com",
			NoHP:       "081234567808",
			JK:         "Perempuan",
			ProdiIndex: 1, // AS
			Sekolah:    "MA Nurul Jadid",
			Jurusan:    "Keagamaan",
			Jalur:      "KIP-Kuliah",
		},
		{
			Nama:       "Dimas Wahyu Pratama",
			NIK:        "3512012511020009",
			Email:      "dimas.wahyu@example.com",
			NoHP:       "081234567809",
			JK:         "Laki-laki",
			ProdiIndex: 2, // KPI
			Sekolah:    "SMK Negeri 1 Situbondo",
			Jurusan:    "Teknik Komputer",
			Jalur:      "Reguler",
		},
		{
			Nama:       "Anisa Tri Rahayu",
			NIK:        "3512016312020010",
			Email:      "anisa.rahayu@example.com",
			NoHP:       "081234567810",
			JK:         "Perempuan",
			ProdiIndex: 0, // MPI
			Sekolah:    "SMA Muhammadiyah 1 Panji",
			Jurusan:    "IPA",
			Jalur:      "KIP-Kuliah",
		},
	}

	passHash, _ := util.HashPassword("pendaftar123")
	tglLahir := time.Date(2005, 5, 12, 0, 0, 0, 0, time.Local)

	log.Println("[*] Membuat 10 pendaftar dummy dengan status 'Menunggu Verifikasi' & berkas lengkap...")

	for i, app := range applicants {
		// A. User Calon Mahasiswa
		user := model.User{
			Email:           app.Email,
			PasswordHash:    passHash,
			NamaLengkap:     app.Nama,
			NoHP:            app.NoHP,
			NIK:             app.NIK,
			Role:            model.RoleCalonMahasiswa,
			IsEmailVerified: true,
			CreatedAt:       time.Now().Add(-time.Duration(10-i) * 2 * time.Hour),
		}
		if err := db.Create(&user).Error; err != nil {
			log.Printf("Gagal membuat user %s: %v", app.Nama, err)
			continue
		}

		// B. Pendaftar (Semua status: menunggu_verifikasi, locked = true)
		noDaftar := fmt.Sprintf("PMB-2026-%04d", i+1)
		prodiID := prodis[app.ProdiIndex%len(prodis)].ID

		pendaftar := model.Pendaftar{
			UserID:            user.ID,
			GelombangID:       &gelombangID,
			ProgramStudiID:    &prodiID,
			NomorPendaftaran:  &noDaftar,
			JalurPendaftaran:  app.Jalur,
			StatusPendaftaran: model.StatusMenungguVerifikasi, // BASIC STATUS
			CatatanRevisi:     "",
			IsLocked:          true, // Sudah submit formulir
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
			NilaiRataRata:     84.5 + float64(i%5),
			TahunLulus:        2025,
			CreatedAt:         user.CreatedAt,
			UpdatedAt:         time.Now(),
		}
		if err := db.Create(&pendaftar).Error; err != nil {
			log.Printf("Gagal membuat pendaftar %s: %v", app.Nama, err)
			continue
		}

		// C. Data Orang Tua
		orangTua := model.OrangTua{
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

		// D. Dokumen Berkas (kk, ktp, ijazah, foto wajib; kip hanya jika Jalur KIP-Kuliah)
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
		}

		for _, dt := range docTypes {
			berkas := model.Berkas{
				PendaftarID:      pendaftar.ID,
				JenisDokumen:     dt.Jenis,
				FileName:         dt.FileName,
				FilePath:         dt.Path,
				FileSize:         1024 * 180, // 180 KB
				MimeType:         dt.Mime,
				StatusVerifikasi: model.StatusBerkasPending, // Menunggu Verifikasi
				CatatanAdmin:     "",
				CreatedAt:        user.CreatedAt,
				UpdatedAt:        user.CreatedAt,
			}
			db.Create(&berkas)
		}

		// E. Pembayaran (Semua status: menunggu_verifikasi)
		pembayaran := model.Pembayaran{
			PendaftarID:         pendaftar.ID,
			Jumlah:              250000,
			BankTujuan:          "Bank Syariah Indonesia (BSI)",
			NomorRekeningTujuan: "7148899012",
			NamaPengirim:        app.Nama,
			BuktiTransferPath:   "uploads/berkas/dummy_bukti_bayar.png",
			Status:              model.StatusBayarMenungguVerifikasi, // Menunggu Verifikasi
			AlasanPenolakan:     "",
			CreatedAt:           user.CreatedAt,
			UpdatedAt:           user.CreatedAt,
		}
		db.Create(&pembayaran)
	}

	// 6. Seed Log Aktivitas Admin Awal
	var adminUser model.User
	db.Where("nik = ?", "admin").First(&adminUser)
	adminID := adminUser.ID
	if adminID == 0 {
		adminID = 1
	}

	db.Create(&model.LogAktivitasAdmin{
		AdminID:   adminID,
		AdminNama: "Administrator PMB STAICI",
		Aksi:      "Inisialisasi Sistem",
		Detail:    "Sinkronisasi master data dan 10 pendaftar baru berstatus Menunggu Verifikasi.",
		IPAddress: "127.0.0.1",
		CreatedAt: time.Now(),
	})

	log.Println("==================================================")
	log.Println("✓ SUKSES! DATA DUMMY BASIC BERHASIL DITERAPKAN:")
	log.Println("  - 10 Pendaftar dengan status 'Menunggu Verifikasi'")
	log.Println("  - Berkas Lengkap: KK, KTP, Ijazah, Foto, KIP (Status: Pending)")
	log.Println("  - Pembayaran Lengkap: Transfer Rp 250.000 BSI (Status: Menunggu Verifikasi)")
	log.Println("  - File dummy fisik tersimpan rapi di uploads/berkas/")
	log.Println("  - Admin dapat langsung menguji tombol 'Periksa' & verifikasi berkas!")
	log.Println("==================================================")
}

func createSampleDummyFiles(baseDir string) {
	berkasDir := filepath.Join(baseDir, "berkas")
	_ = os.MkdirAll(berkasDir, 0755)

	// Buat PDF dummy yang rapi dan valid
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

	// Buat PNG dummy valid (Pas Foto & Bukti Bayar)
	createDummyPNG(filepath.Join(berkasDir, "dummy_foto.png"), 300, 400, color.RGBA{R: 26, G: 77, B: 140, A: 255})       // Biru pas foto
	createDummyPNG(filepath.Join(berkasDir, "dummy_bukti_bayar.png"), 400, 600, color.RGBA{R: 240, G: 245, B: 240, A: 255}) // Struk transfer
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
			// Frame / border
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
