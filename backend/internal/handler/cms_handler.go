package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/response"

	"github.com/gin-gonic/gin"
)

type CMSHandler struct{}

func NewCMSHandler() *CMSHandler {
	return &CMSHandler{}
}

// ==========================================
// 1. REKENING PEMBAYARAN (MULTI-BANK)
// ==========================================

func (h *CMSHandler) ListRekening(c *gin.Context) {
	var list []model.RekeningPembayaran
	database.DB.Order("urutan asc, id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar rekening pembayaran", list)
}

func (h *CMSHandler) ListPublicRekening(c *gin.Context) {
	var list []model.RekeningPembayaran
	database.DB.Where("is_aktif = ?", true).Order("urutan asc, id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar rekening pembayaran aktif", list)
}

func (h *CMSHandler) CreateRekening(c *gin.Context) {
	var req model.RekeningPembayaran
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data rekening tidak valid", err.Error())
		return
	}

	if req.NamaBank == "" || req.NomorRekening == "" || req.AtasNama == "" {
		response.BadRequest(c, "Nama bank, nomor rekening, dan atas nama wajib diisi", "validation_failed")
		return
	}

	if err := database.DB.Create(&req).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	RecordAdminLog(c, "Tambah Rekening Pembayaran", fmt.Sprintf("Admin menambahkan rekening: %s (%s)", req.NamaBank, req.NomorRekening))
	response.Success(c, http.StatusCreated, "Rekening pembayaran berhasil dibuat", req)
}

func (h *CMSHandler) UpdateRekening(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID rekening tidak valid", err.Error())
		return
	}

	var rekening model.RekeningPembayaran
	if err := database.DB.First(&rekening, id).Error; err != nil {
		response.NotFound(c, "Rekening tidak ditemukan")
		return
	}

	var req model.RekeningPembayaran
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data rekening tidak valid", err.Error())
		return
	}

	rekening.NamaBank = req.NamaBank
	rekening.NomorRekening = req.NomorRekening
	rekening.AtasNama = req.AtasNama
	rekening.Cabang = req.Cabang
	rekening.InstruksiTransfer = req.InstruksiTransfer
	rekening.IsUtama = req.IsUtama
	rekening.IsAktif = req.IsAktif
	rekening.Urutan = req.Urutan

	database.DB.Save(&rekening)
	RecordAdminLog(c, "Perbarui Rekening Pembayaran", fmt.Sprintf("Admin memperbarui rekening: %s (%s)", rekening.NamaBank, rekening.NomorRekening))
	response.Success(c, http.StatusOK, "Rekening pembayaran berhasil diperbarui", rekening)
}

func (h *CMSHandler) DeleteRekening(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID rekening tidak valid", err.Error())
		return
	}

	var rekening model.RekeningPembayaran
	if err := database.DB.First(&rekening, id).Error; err != nil {
		response.NotFound(c, "Rekening tidak ditemukan")
		return
	}

	database.DB.Delete(&rekening)
	RecordAdminLog(c, "Hapus Rekening Pembayaran", fmt.Sprintf("Admin menghapus rekening: %s (%s)", rekening.NamaBank, rekening.NomorRekening))
	response.Success(c, http.StatusOK, "Rekening pembayaran berhasil dihapus", nil)
}

func (h *CMSHandler) ToggleRekening(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID rekening tidak valid", err.Error())
		return
	}

	var rekening model.RekeningPembayaran
	if err := database.DB.First(&rekening, id).Error; err != nil {
		response.NotFound(c, "Rekening tidak ditemukan")
		return
	}

	rekening.IsAktif = !rekening.IsAktif
	database.DB.Save(&rekening)
	response.Success(c, http.StatusOK, "Status rekening berhasil diubah", rekening)
}

// ==========================================
// 2. JALUR PENDAFTARAN
// ==========================================

func (h *CMSHandler) ListJalur(c *gin.Context) {
	var list []model.JalurPendaftaran
	database.DB.Order("urutan asc, id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar jalur pendaftaran", list)
}

func (h *CMSHandler) ListPublicJalur(c *gin.Context) {
	var list []model.JalurPendaftaran
	database.DB.Where("is_aktif = ?", true).Order("urutan asc, id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar jalur pendaftaran aktif", list)
}

func (h *CMSHandler) CreateJalur(c *gin.Context) {
	var req model.JalurPendaftaran
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data jalur tidak valid", err.Error())
		return
	}

	if req.Kode == "" || req.Nama == "" {
		response.BadRequest(c, "Kode dan nama jalur wajib diisi", "validation_failed")
		return
	}

	if err := database.DB.Create(&req).Error; err != nil {
		response.BadRequest(c, "Kode jalur sudah ada", err.Error())
		return
	}

	RecordAdminLog(c, "Tambah Jalur Pendaftaran", fmt.Sprintf("Admin menambahkan jalur: %s (%s)", req.Nama, req.Kode))
	response.Success(c, http.StatusCreated, "Jalur pendaftaran berhasil dibuat", req)
}

func (h *CMSHandler) UpdateJalur(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID jalur tidak valid", err.Error())
		return
	}

	var jalur model.JalurPendaftaran
	if err := database.DB.First(&jalur, id).Error; err != nil {
		response.NotFound(c, "Jalur tidak ditemukan")
		return
	}

	var req model.JalurPendaftaran
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data jalur tidak valid", err.Error())
		return
	}

	jalur.Kode = req.Kode
	jalur.Nama = req.Nama
	jalur.NamaEN = req.NamaEN
	jalur.BadgeText = req.BadgeText
	jalur.BadgeTextEN = req.BadgeTextEN
	jalur.Deskripsi = req.Deskripsi
	jalur.DeskripsiEN = req.DeskripsiEN
	jalur.SyaratKhusus = req.SyaratKhusus
	jalur.BebasBiaya = req.BebasBiaya
	jalur.TampilDiHomepage = req.TampilDiHomepage
	jalur.IsAktif = req.IsAktif
	jalur.Urutan = req.Urutan

	database.DB.Save(&jalur)
	RecordAdminLog(c, "Perbarui Jalur Pendaftaran", fmt.Sprintf("Admin memperbarui jalur: %s (%s)", jalur.Nama, jalur.Kode))
	response.Success(c, http.StatusOK, "Jalur pendaftaran berhasil diperbarui", jalur)
}

func (h *CMSHandler) DeleteJalur(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID jalur tidak valid", err.Error())
		return
	}

	var jalur model.JalurPendaftaran
	if err := database.DB.First(&jalur, id).Error; err != nil {
		response.NotFound(c, "Jalur tidak ditemukan")
		return
	}

	database.DB.Delete(&jalur)
	RecordAdminLog(c, "Hapus Jalur Pendaftaran", fmt.Sprintf("Admin menghapus jalur: %s (%s)", jalur.Nama, jalur.Kode))
	response.Success(c, http.StatusOK, "Jalur pendaftaran berhasil dihapus", nil)
}

func (h *CMSHandler) ToggleJalur(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID jalur tidak valid", err.Error())
		return
	}

	var jalur model.JalurPendaftaran
	if err := database.DB.First(&jalur, id).Error; err != nil {
		response.NotFound(c, "Jalur tidak ditemukan")
		return
	}

	jalur.IsAktif = !jalur.IsAktif
	database.DB.Save(&jalur)
	response.Success(c, http.StatusOK, "Status jalur berhasil diubah", jalur)
}

// ==========================================
// 3. TATA CARA PENDAFTARAN (ALUR TERPUSAT)
// ==========================================

func (h *CMSHandler) ListTataCara(c *gin.Context) {
	var list []model.TataCaraPendaftaran
	database.DB.Order("nomor_langkah asc, urutan asc, id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar tata cara pendaftaran", list)
}

func (h *CMSHandler) ListPublicTataCara(c *gin.Context) {
	var list []model.TataCaraPendaftaran
	database.DB.Where("is_aktif = ?", true).Order("nomor_langkah asc, urutan asc, id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar tata cara pendaftaran aktif", list)
}

func (h *CMSHandler) CreateTataCara(c *gin.Context) {
	var req model.TataCaraPendaftaran
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data langkah tidak valid", err.Error())
		return
	}

	if req.Judul == "" {
		response.BadRequest(c, "Judul langkah wajib diisi", "validation_failed")
		return
	}

	if err := database.DB.Create(&req).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	RecordAdminLog(c, "Tambah Langkah Pendaftaran", fmt.Sprintf("Admin menambahkan langkah PMB: %s", req.Judul))
	response.Success(c, http.StatusCreated, "Langkah pendaftaran berhasil dibuat", req)
}

func (h *CMSHandler) UpdateTataCara(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID langkah tidak valid", err.Error())
		return
	}

	var step model.TataCaraPendaftaran
	if err := database.DB.First(&step, id).Error; err != nil {
		response.NotFound(c, "Langkah tidak ditemukan")
		return
	}

	var req model.TataCaraPendaftaran
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data langkah tidak valid", err.Error())
		return
	}

	step.NomorLangkah = req.NomorLangkah
	step.Judul = req.Judul
	step.Deskripsi = req.Deskripsi
	step.Icon = req.Icon
	step.IsAktif = req.IsAktif
	step.Urutan = req.Urutan

	database.DB.Save(&step)
	RecordAdminLog(c, "Perbarui Langkah Pendaftaran", fmt.Sprintf("Admin memperbarui langkah PMB: %s", step.Judul))
	response.Success(c, http.StatusOK, "Langkah pendaftaran berhasil diperbarui", step)
}

func (h *CMSHandler) DeleteTataCara(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID langkah tidak valid", err.Error())
		return
	}

	var step model.TataCaraPendaftaran
	if err := database.DB.First(&step, id).Error; err != nil {
		response.NotFound(c, "Langkah tidak ditemukan")
		return
	}

	database.DB.Delete(&step)
	RecordAdminLog(c, "Hapus Langkah Pendaftaran", fmt.Sprintf("Admin menghapus langkah PMB: %s", step.Judul))
	response.Success(c, http.StatusOK, "Langkah pendaftaran berhasil dihapus", nil)
}

func (h *CMSHandler) BulkSaveTataCara(c *gin.Context) {
	var steps []model.TataCaraPendaftaran
	if err := c.ShouldBindJSON(&steps); err != nil {
		response.BadRequest(c, "Data langkah tidak valid", err.Error())
		return
	}

	// Hapus langkah lama dan simpan urutan baru
	tx := database.DB.Begin()
	if err := tx.Exec("DELETE FROM tata_cara_pendaftarans").Error; err != nil {
		tx.Rollback()
		response.InternalServerError(c, err.Error())
		return
	}

	for i, s := range steps {
		s.ID = 0
		s.NomorLangkah = i + 1
		s.Urutan = i + 1
		if err := tx.Create(&s).Error; err != nil {
			tx.Rollback()
			response.InternalServerError(c, err.Error())
			return
		}
	}
	tx.Commit()

	RecordAdminLog(c, "Simpan Seluruh Alur Pendaftaran", fmt.Sprintf("Admin menyinkronkan %d langkah tata cara pendaftaran", len(steps)))
	response.Success(c, http.StatusOK, "Alur tata cara pendaftaran berhasil diperbarui", steps)
}

// ==========================================
// 4. KONTAK HOTLINE & NARAHUBUNG
// ==========================================

func (h *CMSHandler) ListHotline(c *gin.Context) {
	var list []model.KontakHotline
	database.DB.Order("urutan asc, id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar kontak hotline", list)
}

func (h *CMSHandler) ListPublicHotline(c *gin.Context) {
	var list []model.KontakHotline
	database.DB.Where("is_aktif = ?", true).Order("urutan asc, id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar kontak hotline aktif", list)
}

func (h *CMSHandler) CreateHotline(c *gin.Context) {
	var req model.KontakHotline
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data hotline tidak valid", err.Error())
		return
	}

	if req.NamaLayanan == "" || req.NomorAtauEmail == "" {
		response.BadRequest(c, "Nama layanan dan kontak wajib diisi", "validation_failed")
		return
	}

	if err := database.DB.Create(&req).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	RecordAdminLog(c, "Tambah Narahubung", fmt.Sprintf("Admin menambahkan narahubung: %s (%s)", req.NamaLayanan, req.NomorAtauEmail))
	response.Success(c, http.StatusCreated, "Narahubung berhasil dibuat", req)
}

func (h *CMSHandler) UpdateHotline(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID hotline tidak valid", err.Error())
		return
	}

	var hotline model.KontakHotline
	if err := database.DB.First(&hotline, id).Error; err != nil {
		response.NotFound(c, "Hotline tidak ditemukan")
		return
	}

	var req model.KontakHotline
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data hotline tidak valid", err.Error())
		return
	}

	hotline.NamaLayanan = req.NamaLayanan
	hotline.NamaLayananEN = req.NamaLayananEN
	hotline.TipeKontak = req.TipeKontak
	hotline.NomorAtauEmail = req.NomorAtauEmail
	hotline.NamaPetugas = req.NamaPetugas
	hotline.JamLayanan = req.JamLayanan
	hotline.JamLayananEN = req.JamLayananEN
	hotline.IsAktif = req.IsAktif
	hotline.Urutan = req.Urutan

	database.DB.Save(&hotline)
	RecordAdminLog(c, "Perbarui Narahubung", fmt.Sprintf("Admin memperbarui narahubung: %s (%s)", hotline.NamaLayanan, hotline.NomorAtauEmail))
	response.Success(c, http.StatusOK, "Narahubung berhasil diperbarui", hotline)
}

func (h *CMSHandler) DeleteHotline(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID hotline tidak valid", err.Error())
		return
	}

	var hotline model.KontakHotline
	if err := database.DB.First(&hotline, id).Error; err != nil {
		response.NotFound(c, "Hotline tidak ditemukan")
		return
	}

	database.DB.Delete(&hotline)
	RecordAdminLog(c, "Hapus Narahubung", fmt.Sprintf("Admin menghapus narahubung: %s (%s)", hotline.NamaLayanan, hotline.NomorAtauEmail))
	response.Success(c, http.StatusOK, "Narahubung berhasil dihapus", nil)
}

// ==========================================
// 5. PERSYARATAN DOKUMEN
// ==========================================

func (h *CMSHandler) ListPersyaratan(c *gin.Context) {
	var list []model.PersyaratanDokumen
	database.DB.Order("urutan asc, id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar persyaratan dokumen", list)
}

func (h *CMSHandler) ListPublicPersyaratan(c *gin.Context) {
	var list []model.PersyaratanDokumen
	database.DB.Where("is_aktif = ?", true).Order("urutan asc, id asc").Find(&list)
	response.Success(c, http.StatusOK, "Daftar persyaratan dokumen aktif", list)
}

func (h *CMSHandler) CreatePersyaratan(c *gin.Context) {
	var req model.PersyaratanDokumen
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data persyaratan tidak valid", err.Error())
		return
	}

	if req.NamaDokumen == "" {
		response.BadRequest(c, "Nama dokumen persyaratan wajib diisi", "validation_failed")
		return
	}

	if req.Kode == "" {
		req.Kode = "dok_" + strconv.FormatInt(req.CreatedAt.Unix(), 10)
	}

	if err := database.DB.Create(&req).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	RecordAdminLog(c, "Tambah Persyaratan Dokumen", fmt.Sprintf("Admin menambahkan dokumen: %s", req.NamaDokumen))
	response.Success(c, http.StatusCreated, "Persyaratan dokumen berhasil dibuat", req)
}

func (h *CMSHandler) UpdatePersyaratan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID persyaratan tidak valid", err.Error())
		return
	}

	var doc model.PersyaratanDokumen
	if err := database.DB.First(&doc, id).Error; err != nil {
		response.NotFound(c, "Persyaratan dokumen tidak ditemukan")
		return
	}

	var req model.PersyaratanDokumen
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data persyaratan tidak valid", err.Error())
		return
	}

	doc.NamaDokumen = req.NamaDokumen
	doc.NamaDokumenEN = req.NamaDokumenEN
	doc.Kode = req.Kode
	doc.Deskripsi = req.Deskripsi
	doc.DeskripsiEN = req.DeskripsiEN
	doc.IsWajib = req.IsWajib
	doc.JalurKhusus = req.JalurKhusus
	doc.TipeFile = req.TipeFile
	doc.MaxSizeMB = req.MaxSizeMB
	doc.IsAktif = req.IsAktif
	doc.Urutan = req.Urutan

	database.DB.Save(&doc)
	RecordAdminLog(c, "Perbarui Persyaratan Dokumen", fmt.Sprintf("Admin memperbarui dokumen: %s", doc.NamaDokumen))
	response.Success(c, http.StatusOK, "Persyaratan dokumen berhasil diperbarui", doc)
}

func (h *CMSHandler) DeletePersyaratan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID persyaratan tidak valid", err.Error())
		return
	}

	var doc model.PersyaratanDokumen
	if err := database.DB.First(&doc, id).Error; err != nil {
		response.NotFound(c, "Persyaratan dokumen tidak ditemukan")
		return
	}

	database.DB.Delete(&doc)
	RecordAdminLog(c, "Hapus Persyaratan Dokumen", fmt.Sprintf("Admin menghapus dokumen: %s", doc.NamaDokumen))
	response.Success(c, http.StatusOK, "Persyaratan dokumen berhasil dihapus", nil)
}
