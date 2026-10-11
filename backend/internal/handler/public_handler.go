package handler

import (
	"net/http"
	"strings"

	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/response"

	"github.com/gin-gonic/gin"
)

type PublicHandler struct{}

func NewPublicHandler() *PublicHandler {
	return &PublicHandler{}
}

// GetInfoPMB returns active waves, programs, and public registration info (FR-10.1)
func (h *PublicHandler) GetInfoPMB(c *gin.Context) {
	var listProdi []model.ProgramStudi
	database.DB.Where("is_aktif = ?", true).Order("id asc").Find(&listProdi)

	var activeGelombang []model.Gelombang
	database.DB.Where("is_aktif = ?", true).Order("tanggal_buka asc").Find(&activeGelombang)

	var faqs []model.FAQ
	database.DB.Where("is_aktif = ?", true).Order("urutan asc, id asc").Find(&faqs)

	var settings model.PengaturanSistem
	database.DB.First(&settings)

	// Persyaratan list (fallback if empty)
	persyaratanList := []string{
		"Scan/Foto Kartu Keluarga (KK) Asli/Legalisir (Format JPG/PDF maks 2 MB)",
		"Scan/Foto KTP Calon Mahasiswa (Format JPG/PDF maks 2 MB)",
		"Scan/Foto Ijazah / Surat Keterangan Lulus (SKL) SLTA Sederajat",
		"Pas Foto Resmi Berwarna 3x4 (Latar Belakang Merah/Biru)",
		"Bukti Transfer Pembayaran Biaya Pendaftaran PMB yang sah",
		"Scan Kartu KIP / KIP-Kuliah (Khusus Pendaftar Jalur Beasiswa KIP)",
	}
	if settings.PersyaratanPendaftaran != "" {
		lines := strings.Split(settings.PersyaratanPendaftaran, "\n")
		var customList []string
		for _, line := range lines {
			trimmed := strings.TrimSpace(line)
			if trimmed != "" {
				customList = append(customList, trimmed)
			}
		}
		if len(customList) > 0 {
			persyaratanList = customList
		}
	}

	response.Success(c, http.StatusOK, "Informasi publik PMB STAICI Situbondo", gin.H{
		"kampus": gin.H{
			"nama":          "STAI Cendekia Insani Situbondo",
			"singkatan":     "STAICI",
			"alamat":        settings.AlamatKampus,
			"email":         settings.EmailCS,
			"telepon":       settings.NoWhatsappCS,
			"jam_layanan":   "Senin - Sabtu: 08.00 - 16.00 WIB",
			"akreditasi":    "Terakreditasi BAN-PT & Kemenag RI",
			"website_url":   "https://staicisitubondo.ac.id/pmb",
		},
		"program_studi": listProdi,
		"gelombang":     activeGelombang,
		"jalur_pendaftaran_info": settings.JalurPendaftaranInfo,
		"persyaratan":   persyaratanList,
		"faq":           faqs,
		"settings":      settings,
	})
}

// GetPublicFAQs returns all active FAQs for the public portal
func (h *PublicHandler) GetPublicFAQs(c *gin.Context) {
	var faqs []model.FAQ
	database.DB.Where("is_aktif = ?", true).Order("urutan asc, id asc").Find(&faqs)
	response.Success(c, http.StatusOK, "Daftar FAQ Publik PMB", faqs)
}

// GetSettings returns public dynamic settings for banner, contact, and payment rules
func (h *PublicHandler) GetSettings(c *gin.Context) {
	var settings model.PengaturanSistem
	err := database.DB.First(&settings).Error
	if err != nil {
		response.Success(c, http.StatusOK, "Default settings", gin.H{
			"banner_title":            "Pusat Pendaftaran Mahasiswa Baru & Informasi Program Studi",
			"banner_subtitle":         "Meneguhkan keilmuan Islam modern dan etika profesional santri. Mari bergabung bersama STAI Cendekia Insani Tahun Akademik 2026/2027.",
			"announcement_text":       "Penerimaan Mahasiswa Baru Gelombang 1 Resmi Dibuka",
			"bank_name":               "Bank Syariah Indonesia (BSI)",
			"nomor_rekening":          "7148899012",
			"atas_nama":               "STAI Cendekia Insani PMB",
			"petunjuk_pembayaran":     "1. Transfer nominal pendaftaran ke rekening resmi.\n2. Unggah bukti transfer sah maks 2MB.",
			"regulasi_bukti_bayar":     "Bukti harus memuat nominal, tanggal, dan nomor transaksi jelas.",
			"batas_waktu_konfirmasi": "1x24 Jam Kerja",
			"persyaratan_pendaftaran": "KK, KTP, Ijazah/SKL, Pas Foto 3x4, Bukti Transfer",
			"jalur_pendaftaran_info":   "Reguler & KIP-Kuliah",
			"no_whatsapp_cs":           "085233432221",
			"email_cs":                "pmb@staicisitubondo.ac.id",
			"alamat_kampus":           "Jl. Raya Panji No. 12, Situbondo, Jawa Timur",
		})
		return
	}
	response.Success(c, http.StatusOK, "Pengaturan sistem publik", settings)
}


