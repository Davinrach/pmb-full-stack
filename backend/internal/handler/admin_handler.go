package handler

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/response"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// RecordAdminLog records audit trail for admin action (FR-8.14)
func RecordAdminLog(c *gin.Context, aksi, detail string) {
	adminID := c.GetUint("user_id")
	email := c.GetString("email")

	var user model.User
	adminNama := email
	if err := database.DB.First(&user, adminID).Error; err == nil && user.NamaLengkap != "" {
		adminNama = user.NamaLengkap
	}

	logEntry := model.LogAktivitasAdmin{
		AdminID:   adminID,
		AdminNama: adminNama,
		Aksi:      aksi,
		Detail:    detail,
		IPAddress: c.ClientIP(),
		CreatedAt: time.Now(),
	}
	database.DB.Create(&logEntry)
}

// GetDashboardStats aggregates applicants statistics (FR-8.13)
func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	var totalPendaftar int64
	var belumLengkap int64
	var menungguVerifikasi int64
	var berkasDiverifikasi int64
	var mengikutiUjian int64
	var lolosSeleksi int64
	var ditolak int64

	database.DB.Model(&model.Pendaftar{}).Count(&totalPendaftar)
	database.DB.Model(&model.Pendaftar{}).Where("status_pendaftaran = ?", model.StatusBelumLengkap).Count(&belumLengkap)
	database.DB.Model(&model.Pendaftar{}).Where("status_pendaftaran = ?", model.StatusMenungguVerifikasi).Count(&menungguVerifikasi)
	database.DB.Model(&model.Pendaftar{}).Where("status_pendaftaran = ?", model.StatusBerkasDiverifikasi).Count(&berkasDiverifikasi)
	database.DB.Model(&model.Pendaftar{}).Where("status_pendaftaran = ?", model.StatusMengikutiUjian).Count(&mengikutiUjian)
	database.DB.Model(&model.Pendaftar{}).Where("status_pendaftaran = ?", model.StatusLolosSeleksi).Count(&lolosSeleksi)
	database.DB.Model(&model.Pendaftar{}).Where("status_pendaftaran = ?", model.StatusDitolak).Count(&ditolak)

	// Stat per Program Studi
	type ProdiStat struct {
		Kode  string `json:"kode"`
		Nama  string `json:"nama"`
		Total int64  `json:"total"`
	}
	var prodiStats []ProdiStat
	database.DB.Table("program_studis").
		Select("program_studis.kode, program_studis.nama, COUNT(pendaftars.id) as total").
		Joins("LEFT JOIN pendaftars ON pendaftars.program_studi_id = program_studis.id AND pendaftars.deleted_at IS NULL").
		Group("program_studis.id, program_studis.kode, program_studis.nama").
		Scan(&prodiStats)

	// Stat per Gelombang
	type GelombangStat struct {
		ID    uint   `json:"id"`
		Nama  string `json:"nama"`
		Total int64  `json:"total"`
		Kuota int    `json:"kuota"`
	}
	var gelombangStats []GelombangStat
	database.DB.Table("gelombangs").
		Select("gelombangs.id, gelombangs.nama, gelombangs.kuota, COUNT(pendaftars.id) as total").
		Joins("LEFT JOIN pendaftars ON pendaftars.gelombang_id = gelombangs.id AND pendaftars.deleted_at IS NULL").
		Group("gelombangs.id, gelombangs.nama, gelombangs.kuota").
		Scan(&gelombangStats)

	response.Success(c, http.StatusOK, "Statistik pendaftaran PMB", gin.H{
		"total_pendaftar":      totalPendaftar,
		"belum_lengkap":        belumLengkap,
		"menunggu_verifikasi":  menungguVerifikasi,
		"berkas_diverifikasi":  berkasDiverifikasi,
		"mengikuti_ujian":      mengikutiUjian,
		"lolos_seleksi":        lolosSeleksi,
		"ditolak":              ditolak,
		"statistik_prodi":      prodiStats,
		"statistik_gelombang":  gelombangStats,
	})
}

// ListPendaftar lists applicants with search & filters (FR-8.2)
func (h *AdminHandler) ListPendaftar(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "15"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 15
	}
	offset := (page - 1) * perPage

	search := strings.TrimSpace(c.Query("search"))
	status := strings.TrimSpace(c.Query("status"))
	prodiID := strings.TrimSpace(c.Query("prodi_id"))
	gelombangID := strings.TrimSpace(c.Query("gelombang_id"))

	query := database.DB.Model(&model.Pendaftar{}).
		Preload("User").
		Preload("Gelombang").
		Preload("ProgramStudi").
		Preload("DataOrangTua").
		Preload("Berkas").
		Preload("Pembayaran")

	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Joins("LEFT JOIN users ON users.id = pendaftars.user_id").
			Where("users.nama_lengkap LIKE ? OR users.email LIKE ? OR users.nik LIKE ? OR pendaftars.nomor_pendaftaran LIKE ?",
				searchTerm, searchTerm, searchTerm, searchTerm)
	}

	if status != "" {
		if strings.Contains(status, ",") {
			parts := strings.Split(status, ",")
			var validParts []string
			for _, p := range parts {
				trimmed := strings.TrimSpace(p)
				if trimmed != "" {
					validParts = append(validParts, trimmed)
				}
			}
			if len(validParts) > 0 {
				query = query.Where("pendaftars.status_pendaftaran IN (?)", validParts)
			}
		} else {
			query = query.Where("pendaftars.status_pendaftaran = ?", status)
		}
	}

	if prodiID != "" {
		query = query.Where("pendaftars.program_studi_id = ?", prodiID)
	}

	if gelombangID != "" {
		query = query.Where("pendaftars.gelombang_id = ?", gelombangID)
	}

	var total int64
	query.Count(&total)

	var pendaftars []model.Pendaftar
	query.Order("pendaftars.id desc").Offset(offset).Limit(perPage).Find(&pendaftars)

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": pendaftars,
		"meta": gin.H{
			"total":       total,
			"page":        page,
			"per_page":    perPage,
			"total_pages": totalPages,
		},
	})
}

// GetDetailPendaftar returns single applicant detail
func (h *AdminHandler) GetDetailPendaftar(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID pendaftar tidak valid", err.Error())
		return
	}

	var pendaftar model.Pendaftar
	err = database.DB.Preload("User").
		Preload("Gelombang").
		Preload("ProgramStudi").
		Preload("DataOrangTua").
		Preload("Berkas").
		Preload("Pembayaran").
		First(&pendaftar, id).Error
	if err != nil {
		response.NotFound(c, "Data pendaftar tidak ditemukan")
		return
	}

	response.Success(c, http.StatusOK, "Detail pendaftar berhasil diambil", pendaftar)
}

type VerifikasiBerkasRequest struct {
	BerkasID     uint   `json:"berkas_id" binding:"required"`
	Status       string `json:"status" binding:"required"` // valid / invalid
	CatatanAdmin string `json:"catatan_admin"`
}

// VerifikasiBerkas updates individual document verification & auto updates status (FR-8.3, FR-5.2)
func (h *AdminHandler) VerifikasiBerkas(c *gin.Context) {
	pendaftarIDStr := c.Param("id")
	pendaftarID, _ := strconv.ParseUint(pendaftarIDStr, 10, 32)

	var req VerifikasiBerkasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data verifikasi berkas tidak valid", err.Error())
		return
	}

	var pendaftar model.Pendaftar
	if err := database.DB.Preload("Berkas").Preload("User").First(&pendaftar, pendaftarID).Error; err != nil {
		response.NotFound(c, "Pendaftar tidak ditemukan")
		return
	}

	var berkas model.Berkas
	if err := database.DB.Where("id = ? AND pendaftar_id = ?", req.BerkasID, pendaftar.ID).First(&berkas).Error; err != nil {
		response.NotFound(c, "Berkas tidak ditemukan")
		return
	}

	berkas.StatusVerifikasi = model.StatusVerifikasiBerkas(req.Status)
	berkas.CatatanAdmin = req.CatatanAdmin
	database.DB.Save(&berkas)

	// Business rule (FR-5.2): Jika berkas ditolak (invalid), kembalikan status pendaftaran ke "Belum Lengkap" & buka kunci data agar dapat direvisi
	if req.Status == string(model.StatusBerkasInvalid) {
		pendaftar.StatusPendaftaran = model.StatusBelumLengkap
		pendaftar.CatatanRevisi = fmt.Sprintf("Berkas '%s' ditolak: %s", berkas.JenisDokumen, req.CatatanAdmin)
		pendaftar.IsLocked = false
		database.DB.Save(&pendaftar)

		RecordAdminLog(c, "Menolak Berkas Pendaftar", fmt.Sprintf("Admin menolak berkas %s pendaftar %s (%s). Alasan: %s",
			berkas.JenisDokumen, pendaftar.DisplayNomorPendaftaran(), pendaftar.User.NamaLengkap, req.CatatanAdmin))
	} else if req.Status == string(model.StatusBerkasValid) {
		// Periksa apakah semua berkas sudah diverifikasi valid
		var totalBerkas int64
		var totalValid int64
		database.DB.Model(&model.Berkas{}).Where("pendaftar_id = ?", pendaftar.ID).Count(&totalBerkas)
		database.DB.Model(&model.Berkas{}).Where("pendaftar_id = ? AND status_verifikasi = ?", pendaftar.ID, model.StatusBerkasValid).Count(&totalValid)

		if totalBerkas > 0 && totalBerkas == totalValid {
			pendaftar.StatusPendaftaran = model.StatusBerkasDiverifikasi
			database.DB.Save(&pendaftar)
		}

		RecordAdminLog(c, "Menyetujui Berkas Pendaftar", fmt.Sprintf("Admin menyetujui berkas %s pendaftar %s (%s)",
			berkas.JenisDokumen, pendaftar.DisplayNomorPendaftaran(), pendaftar.User.NamaLengkap))
	}

	response.Success(c, http.StatusOK, "Status verifikasi berkas berhasil diperbarui", gin.H{
		"berkas":              berkas,
		"status_pendaftaran": pendaftar.StatusPendaftaran,
	})
}

type VerifikasiPembayaranRequest struct {
	PembayaranID    uint   `json:"pembayaran_id" binding:"required"`
	Status          string `json:"status" binding:"required"` // diterima / ditolak
	AlasanPenolakan string `json:"alasan_penolakan"`
}

// VerifikasiPembayaran approves or rejects applicant payment (FR-8.4)
func (h *AdminHandler) VerifikasiPembayaran(c *gin.Context) {
	pendaftarIDStr := c.Param("id")
	pendaftarID, _ := strconv.ParseUint(pendaftarIDStr, 10, 32)

	var req VerifikasiPembayaranRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data verifikasi pembayaran tidak valid", err.Error())
		return
	}

	var pendaftar model.Pendaftar
	if err := database.DB.Preload("User").First(&pendaftar, pendaftarID).Error; err != nil {
		response.NotFound(c, "Pendaftar tidak ditemukan")
		return
	}

	var pembayaran model.Pembayaran
	if err := database.DB.Where("id = ? AND pendaftar_id = ?", req.PembayaranID, pendaftar.ID).First(&pembayaran).Error; err != nil {
		response.NotFound(c, "Data pembayaran tidak ditemukan")
		return
	}

	adminID := c.GetUint("user_id")
	now := time.Now()

	pembayaran.Status = model.StatusPembayaran(req.Status)
	pembayaran.AlasanPenolakan = req.AlasanPenolakan
	pembayaran.VerifiedBy = &adminID
	pembayaran.VerifiedAt = &now
	database.DB.Save(&pembayaran)

	if req.Status == string(model.StatusBayarDitolak) {
		pendaftar.StatusPendaftaran = model.StatusMenungguPembayaran
		pendaftar.CatatanRevisi = fmt.Sprintf("Pembayaran ditolak: %s. Harap unggah ulang bukti transfer yang sah.", req.AlasanPenolakan)
		database.DB.Save(&pendaftar)

		RecordAdminLog(c, "Menolak Pembayaran Pendaftar", fmt.Sprintf("Admin menolak pembayaran pendaftar %s (%s). Alasan: %s",
			pendaftar.DisplayNomorPendaftaran(), pendaftar.User.NamaLengkap, req.AlasanPenolakan))
	} else if req.Status == string(model.StatusBayarDiterima) {
		pendaftar.StatusPendaftaran = model.StatusBerkasDiverifikasi
		database.DB.Save(&pendaftar)

		RecordAdminLog(c, "Menyetujui Pembayaran Pendaftar", fmt.Sprintf("Admin menyetujui pembayaran pendaftar %s (%s)",
			pendaftar.DisplayNomorPendaftaran(), pendaftar.User.NamaLengkap))
	}

	response.Success(c, http.StatusOK, "Status verifikasi pembayaran berhasil disimpan", gin.H{
		"pembayaran":          pembayaran,
		"status_pendaftaran": pendaftar.StatusPendaftaran,
	})
}

type UpdateStatusSeleksiRequest struct {
	Status         model.StatusPendaftaran `json:"status" binding:"required"` // lolos_seleksi / tidak_lolos / mengikuti_ujian / berkas_diverifikasi
	Catatan        string                  `json:"catatan"`
	NilaiUjian     *float64                `json:"nilai_ujian"`
	NilaiWawancara *float64                `json:"nilai_wawancara"`
}

// UpdateStatusSeleksi updates applicant selection graduation status (FR-8.5, FR-6.3)
func (h *AdminHandler) UpdateStatusSeleksi(c *gin.Context) {
	pendaftarIDStr := c.Param("id")
	pendaftarID, _ := strconv.ParseUint(pendaftarIDStr, 10, 32)

	var req UpdateStatusSeleksiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Pilihan status seleksi tidak valid", err.Error())
		return
	}

	var pendaftar model.Pendaftar
	if err := database.DB.Preload("User").First(&pendaftar, pendaftarID).Error; err != nil {
		response.NotFound(c, "Pendaftar tidak ditemukan")
		return
	}

	pendaftar.StatusPendaftaran = req.Status
	if req.Status == model.StatusBelumLengkap || req.Status == model.StatusDitolak {
		pendaftar.IsLocked = false
	}
	if req.Catatan != "" {
		pendaftar.CatatanSeleksi = req.Catatan
		pendaftar.CatatanRevisi = req.Catatan
	}
	if req.NilaiUjian != nil {
		pendaftar.NilaiUjian = req.NilaiUjian
	}
	if req.NilaiWawancara != nil {
		pendaftar.NilaiWawancara = req.NilaiWawancara
	}
	database.DB.Save(&pendaftar)

	RecordAdminLog(c, "Mengubah Status Seleksi", fmt.Sprintf("Admin menetapkan seleksi pendaftar %s (%s) menjadi: %s",
		pendaftar.DisplayNomorPendaftaran(), pendaftar.User.NamaLengkap, req.Status))

	response.Success(c, http.StatusOK, "Status seleksi calon mahasiswa berhasil diperbarui", pendaftar)
}

// Gelombang PMB Management (FR-8.9, FR-8.10)
func (h *AdminHandler) ListGelombang(c *gin.Context) {
	var list []model.Gelombang
	database.DB.Order("id desc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar Gelombang PMB", list)
}

type GelombangRequest struct {
	Nama             string  `json:"nama" binding:"required"`
	TahunAkademik    string  `json:"tahun_akademik" binding:"required"`
	TanggalBuka      string  `json:"tanggal_buka" binding:"required"`  // YYYY-MM-DD
	TanggalTutup     string  `json:"tanggal_tutup" binding:"required"` // YYYY-MM-DD
	BiayaPendaftaran float64 `json:"biaya_pendaftaran" binding:"required"`
	Kuota            int     `json:"kuota" binding:"required"`
	IsAktif          bool    `json:"is_aktif"`
}

func (h *AdminHandler) CreateGelombang(c *gin.Context) {
	var req GelombangRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data gelombang tidak valid", err.Error())
		return
	}

	tglBuka, _ := time.Parse("2006-01-02", req.TanggalBuka)
	tglTutup, _ := time.Parse("2006-01-02", req.TanggalTutup)

	gel := model.Gelombang{
		Nama:             req.Nama,
		TahunAkademik:    req.TahunAkademik,
		TanggalBuka:      tglBuka,
		TanggalTutup:     tglTutup,
		BiayaPendaftaran: req.BiayaPendaftaran,
		Kuota:            req.Kuota,
		IsAktif:          req.IsAktif,
	}

	if err := database.DB.Create(&gel).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	RecordAdminLog(c, "Menambah Gelombang PMB", fmt.Sprintf("Admin menambahkan gelombang: %s", gel.Nama))
	response.Success(c, http.StatusCreated, "Gelombang PMB berhasil dibuat", gel)
}

func (h *AdminHandler) UpdateGelombang(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	var gel model.Gelombang
	if err := database.DB.First(&gel, id).Error; err != nil {
		response.NotFound(c, "Gelombang tidak ditemukan")
		return
	}

	var req GelombangRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data gelombang tidak valid", err.Error())
		return
	}

	tglBuka, _ := time.Parse("2006-01-02", req.TanggalBuka)
	tglTutup, _ := time.Parse("2006-01-02", req.TanggalTutup)

	gel.Nama = req.Nama
	gel.TahunAkademik = req.TahunAkademik
	gel.TanggalBuka = tglBuka
	gel.TanggalTutup = tglTutup
	gel.BiayaPendaftaran = req.BiayaPendaftaran
	gel.Kuota = req.Kuota
	gel.IsAktif = req.IsAktif

	database.DB.Save(&gel)
	RecordAdminLog(c, "Memperbarui Gelombang PMB", fmt.Sprintf("Admin memperbarui gelombang: %s", gel.Nama))
	response.Success(c, http.StatusOK, "Gelombang PMB berhasil diperbarui", gel)
}

// Program Studi Management (FR-8.7)
func (h *AdminHandler) ListProgramStudi(c *gin.Context) {
	var list []model.ProgramStudi
	database.DB.Order("id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar Program Studi", list)
}

type ProgramStudiRequest struct {
	Kode      string `json:"kode" binding:"required"`
	Nama      string `json:"nama" binding:"required"`
	Jenjang   string `json:"jenjang" binding:"required"`
	Deskripsi string `json:"deskripsi"`
	IsAktif   bool   `json:"is_aktif"`
}

func (h *AdminHandler) CreateProgramStudi(c *gin.Context) {
	var req ProgramStudiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data program studi tidak valid", err.Error())
		return
	}

	prodi := model.ProgramStudi{
		Kode:      strings.ToUpper(req.Kode),
		Nama:      req.Nama,
		Jenjang:   req.Jenjang,
		Deskripsi: req.Deskripsi,
		IsAktif:   req.IsAktif,
	}

	if err := database.DB.Create(&prodi).Error; err != nil {
		response.BadRequest(c, "Kode program studi sudah terdaftar", err.Error())
		return
	}

	RecordAdminLog(c, "Menambah Program Studi", fmt.Sprintf("Admin menambahkan prodi: %s (%s)", prodi.Nama, prodi.Kode))
	response.Success(c, http.StatusCreated, "Program studi berhasil dibuat", prodi)
}

func (h *AdminHandler) UpdateProgramStudi(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	var prodi model.ProgramStudi
	if err := database.DB.First(&prodi, id).Error; err != nil {
		response.NotFound(c, "Program studi tidak ditemukan")
		return
	}

	var req ProgramStudiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data program studi tidak valid", err.Error())
		return
	}

	prodi.Kode = strings.ToUpper(req.Kode)
	prodi.Nama = req.Nama
	prodi.Jenjang = req.Jenjang
	prodi.Deskripsi = req.Deskripsi
	prodi.IsAktif = req.IsAktif

	database.DB.Save(&prodi)
	RecordAdminLog(c, "Memperbarui Program Studi", fmt.Sprintf("Admin memperbarui prodi: %s (%s)", prodi.Nama, prodi.Kode))
	response.Success(c, http.StatusOK, "Program studi berhasil diperbarui", prodi)
}

// GetLogs returns audit trail logs (FR-8.14)
func (h *AdminHandler) GetLogs(c *gin.Context) {
	var logs []model.LogAktivitasAdmin
	database.DB.Order("created_at desc").Limit(100).Find(&logs)
	response.Success(c, http.StatusOK, "Log aktivitas admin", logs)
}

type SettingsRequest struct {
	BannerTitle            string `json:"banner_title"`
	BannerSubtitle         string `json:"banner_subtitle"`
	AnnouncementText       string `json:"announcement_text"`
	BankName               string `json:"bank_name"`
	NomorRekening          string `json:"nomor_rekening"`
	AtasNama               string `json:"atas_nama"`
	PetunjukPembayaran     string `json:"petunjuk_pembayaran"`
	RegulasiBuktiBayar     string `json:"regulasi_bukti_bayar"`
	BatasWaktuKonfirmasi   string `json:"batas_waktu_konfirmasi"`
	PersyaratanPendaftaran string `json:"persyaratan_pendaftaran"`
	JalurPendaftaranInfo   string `json:"jalur_pendaftaran_info"`
	NoWhatsappCS           string `json:"no_whatsapp_cs"`
	EmailCS                string `json:"email_cs"`
	AlamatKampus           string `json:"alamat_kampus"`
}

func (h *AdminHandler) GetSettings(c *gin.Context) {
	var settings model.PengaturanSistem
	err := database.DB.First(&settings).Error
	if err != nil {
		response.NotFound(c, "Pengaturan belum ada")
		return
	}
	response.Success(c, http.StatusOK, "Pengaturan sistem berhasil diambil", settings)
}

func (h *AdminHandler) UpdateSettings(c *gin.Context) {
	var req SettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data pengaturan tidak valid", err.Error())
		return
	}

	var settings model.PengaturanSistem
	err := database.DB.First(&settings).Error
	if err != nil {
		settings = model.PengaturanSistem{}
	}

	settings.BannerTitle = req.BannerTitle
	settings.BannerSubtitle = req.BannerSubtitle
	settings.AnnouncementText = req.AnnouncementText
	settings.BankName = req.BankName
	settings.NomorRekening = req.NomorRekening
	settings.AtasNama = req.AtasNama
	settings.PetunjukPembayaran = req.PetunjukPembayaran
	settings.RegulasiBuktiBayar = req.RegulasiBuktiBayar
	settings.BatasWaktuKonfirmasi = req.BatasWaktuKonfirmasi
	settings.PersyaratanPendaftaran = req.PersyaratanPendaftaran
	settings.JalurPendaftaranInfo = req.JalurPendaftaranInfo
	settings.NoWhatsappCS = req.NoWhatsappCS
	settings.EmailCS = req.EmailCS
	settings.AlamatKampus = req.AlamatKampus
	settings.UpdatedAt = time.Now()

	database.DB.Save(&settings)
	RecordAdminLog(c, "Memperbarui Pengaturan Sistem & Banner", "Admin memperbarui teks banner, rekening, petunjuk bayar, dan regulasi PMB")

	response.Success(c, http.StatusOK, "Pengaturan sistem berhasil disimpan", settings)
}

// FAQ Management (FR-10 Dynamic FAQ)
type FAQRequest struct {
	Kategori   string `json:"kategori"`
	Pertanyaan string `json:"pertanyaan" binding:"required"`
	Jawaban    string `json:"jawaban" binding:"required"`
	Urutan     int    `json:"urutan"`
	IsAktif    *bool  `json:"is_aktif"`
}

func (h *AdminHandler) GetFAQs(c *gin.Context) {
	var faqs []model.FAQ
	database.DB.Order("urutan asc, id asc").Find(&faqs)
	response.Success(c, http.StatusOK, "Daftar FAQ", faqs)
}

func (h *AdminHandler) CreateFAQ(c *gin.Context) {
	var req FAQRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data FAQ tidak valid", err.Error())
		return
	}

	isAktif := true
	if req.IsAktif != nil {
		isAktif = *req.IsAktif
	}

	kategori := "Umum"
	if req.Kategori != "" {
		kategori = req.Kategori
	}

	faq := model.FAQ{
		Kategori:   kategori,
		Pertanyaan: req.Pertanyaan,
		Jawaban:    req.Jawaban,
		Urutan:     req.Urutan,
		IsAktif:    isAktif,
	}

	if err := database.DB.Create(&faq).Error; err != nil {
		response.InternalServerError(c, "Gagal menambahkan FAQ: "+err.Error())
		return
	}

	RecordAdminLog(c, "Tambah FAQ PMB", "Admin menambahkan FAQ: "+faq.Pertanyaan)
	response.Success(c, http.StatusCreated, "FAQ berhasil ditambahkan", faq)
}

func (h *AdminHandler) UpdateFAQ(c *gin.Context) {
	faqID := c.Param("id")
	var faq model.FAQ
	if err := database.DB.First(&faq, faqID).Error; err != nil {
		response.NotFound(c, "FAQ tidak ditemukan")
		return
	}

	var req FAQRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data FAQ tidak valid", err.Error())
		return
	}

	if req.Kategori != "" {
		faq.Kategori = req.Kategori
	}
	if req.Pertanyaan != "" {
		faq.Pertanyaan = req.Pertanyaan
	}
	if req.Jawaban != "" {
		faq.Jawaban = req.Jawaban
	}
	faq.Urutan = req.Urutan
	if req.IsAktif != nil {
		faq.IsAktif = *req.IsAktif
	}

	database.DB.Save(&faq)
	RecordAdminLog(c, "Edit FAQ PMB", "Admin memperbarui FAQ ID: "+faqID)
	response.Success(c, http.StatusOK, "FAQ berhasil diperbarui", faq)
}

func (h *AdminHandler) DeleteFAQ(c *gin.Context) {
	faqID := c.Param("id")
	var faq model.FAQ
	if err := database.DB.First(&faq, faqID).Error; err != nil {
		response.NotFound(c, "FAQ tidak ditemukan")
		return
	}

	database.DB.Delete(&faq)
	RecordAdminLog(c, "Hapus FAQ PMB", "Admin menghapus FAQ ID: "+faqID)
	response.Success(c, http.StatusOK, "FAQ berhasil dihapus", nil)
}

func (h *AdminHandler) ToggleFAQStatus(c *gin.Context) {
	faqID := c.Param("id")
	var faq model.FAQ
	if err := database.DB.First(&faq, faqID).Error; err != nil {
		response.NotFound(c, "FAQ tidak ditemukan")
		return
	}

	faq.IsAktif = !faq.IsAktif
	database.DB.Save(&faq)
	RecordAdminLog(c, "Toggle Status FAQ PMB", fmt.Sprintf("Admin mengubah status FAQ ID %s menjadi %v", faqID, faq.IsAktif))
	response.Success(c, http.StatusOK, "Status FAQ berhasil diperbarui", faq)
}

// ExportPendaftar exports applicants' personal data with filters as CSV (Excel-compatible) or JSON
func (h *AdminHandler) ExportPendaftar(c *gin.Context) {
	status := strings.TrimSpace(c.Query("status"))
	prodiID := strings.TrimSpace(c.Query("prodi_id"))
	gelombangID := strings.TrimSpace(c.Query("gelombang_id"))
	format := strings.ToLower(strings.TrimSpace(c.Query("format")))

	query := database.DB.Model(&model.Pendaftar{}).
		Preload("User").
		Preload("Gelombang").
		Preload("ProgramStudi").
		Preload("DataOrangTua").
		Preload("Pembayaran")

	if status != "" {
		query = query.Where("pendaftars.status_pendaftaran = ?", status)
	}
	if prodiID != "" {
		query = query.Where("pendaftars.program_studi_id = ?", prodiID)
	}
	if gelombangID != "" {
		query = query.Where("pendaftars.gelombang_id = ?", gelombangID)
	}

	var pendaftars []model.Pendaftar
	if err := query.Order("pendaftars.id asc").Find(&pendaftars).Error; err != nil {
		response.InternalServerError(c, "Gagal memuat data pendaftar untuk diekspor: "+err.Error())
		return
	}

	RecordAdminLog(c, "Export Data Pendaftar", fmt.Sprintf("Admin mengekspor %d data calon mahasiswa", len(pendaftars)))

	if format == "csv" {
		fileName := fmt.Sprintf("Data_Pendaftar_PMB_STAICI_%s.csv", time.Now().Format("20060102_150405"))
		c.Header("Content-Disposition", "attachment; filename="+fileName)
		c.Header("Content-Type", "text/csv; charset=utf-8")

		// Write UTF-8 BOM so Excel opens with proper Indonesian characters
		c.Writer.Write([]byte{0xEF, 0xBB, 0xBF})

		writer := csv.NewWriter(c.Writer)
		defer writer.Flush()

		headers := []string{
			"No",
			"No. Pendaftaran",
			"NIK",
			"Nama Lengkap",
			"Jenis Kelamin",
			"Tempat Lahir",
			"Tanggal Lahir",
			"Agama",
			"Status Pernikahan",
			"Kewarganegaraan",
			"Alamat Lengkap",
			"No. HP / WhatsApp",
			"Email",
			"Asal Sekolah",
			"Status Sekolah",
			"Jurusan Sekolah",
			"Tahun Lulus",
			"Nilai Rata-rata",
			"Program Studi",
			"Jenjang",
			"Gelombang / Jalur",
			"Tahun Akademik",
			"Nama Ayah",
			"Pekerjaan Ayah",
			"Nama Ibu",
			"Pekerjaan Ibu",
			"No. HP Orang Tua / Wali",
			"Status Pendaftaran",
			"Status Pembayaran",
			"Tanggal Pendaftaran",
		}
		_ = writer.Write(headers)

		for i, p := range pendaftars {
			tglLahirStr := "-"
			if p.TanggalLahir != nil {
				tglLahirStr = p.TanggalLahir.Format("2006-01-02")
			}

			namaSekolah := p.NamaSekolah
			if namaSekolah == "" {
				namaSekolah = "-"
			}

			prodiNama := "-"
			jenjang := "-"
			if p.ProgramStudi != nil {
				prodiNama = p.ProgramStudi.Nama
				jenjang = p.ProgramStudi.Jenjang
			}

			gelombangNama := "-"
			tahunAkademik := "-"
			if p.Gelombang != nil {
				gelombangNama = p.Gelombang.Nama
				tahunAkademik = p.Gelombang.TahunAkademik
			}

			namaAyah := "-"
			pekerjaanAyah := "-"
			namaIbu := "-"
			pekerjaanIbu := "-"
			noHPOrtu := "-"
			if p.DataOrangTua != nil {
				if p.DataOrangTua.NamaAyah != "" {
					namaAyah = p.DataOrangTua.NamaAyah
				}
				if p.DataOrangTua.PekerjaanAyah != "" {
					pekerjaanAyah = p.DataOrangTua.PekerjaanAyah
				}
				if p.DataOrangTua.NamaIbu != "" {
					namaIbu = p.DataOrangTua.NamaIbu
				}
				if p.DataOrangTua.PekerjaanIbu != "" {
					pekerjaanIbu = p.DataOrangTua.PekerjaanIbu
				}
				if p.DataOrangTua.NoHPOrangTuaWali != "" {
					noHPOrtu = p.DataOrangTua.NoHPOrangTuaWali
				}
			}

			statusBayar := "Belum Bayar"
			for _, pay := range p.Pembayaran {
				if pay.Status == model.StatusBayarDiterima {
					statusBayar = "Lunas"
					break
				} else if pay.Status == model.StatusBayarMenungguVerifikasi {
					statusBayar = "Menunggu Verifikasi"
				}
			}

			noPmb := "-"
			if p.NomorPendaftaran != nil && *p.NomorPendaftaran != "" {
				noPmb = *p.NomorPendaftaran
			}

			// Format NIK and No HP with ="..." so Excel treats them as literal strings
			nikStr := fmt.Sprintf("=\"%s\"", p.User.NIK)
			hpStr := fmt.Sprintf("=\"%s\"", p.User.NoHP)
			if noHPOrtu != "-" {
				noHPOrtu = fmt.Sprintf("=\"%s\"", noHPOrtu)
			}

			row := []string{
				strconv.Itoa(i + 1),
				noPmb,
				nikStr,
				p.User.NamaLengkap,
				p.JenisKelamin,
				p.TempatLahir,
				tglLahirStr,
				p.Agama,
				p.StatusPernikahan,
				p.StatusWargaNegara,
				p.Alamat,
				hpStr,
				p.User.Email,
				namaSekolah,
				p.StatusSekolah,
				p.JurusanSekolah,
				strconv.Itoa(p.TahunLulus),
				fmt.Sprintf("%.2f", p.NilaiRataRata),
				prodiNama,
				jenjang,
				gelombangNama,
				tahunAkademik,
				namaAyah,
				pekerjaanAyah,
				namaIbu,
				pekerjaanIbu,
				noHPOrtu,
				string(p.StatusPendaftaran),
				statusBayar,
				p.CreatedAt.Format("2006-01-02 15:04"),
			}
			_ = writer.Write(row)
		}
		return
	}

	response.Success(c, http.StatusOK, "Data pendaftar untuk ekspor berhasil dimuat", gin.H{
		"total": len(pendaftars),
		"data":  pendaftars,
	})
}


