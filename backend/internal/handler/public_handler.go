package handler

import (
	"net/http"

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

	response.Success(c, http.StatusOK, "Informasi publik PMB STAICI Situbondo", gin.H{
		"kampus": gin.H{
			"nama":          "STAI Cendekia Insani Situbondo",
			"singkatan":     "STAICI",
			"alamat":        "Jalan Raya no. 25 Paowan Panarukan Situbondo 68351",
			"email":         "staicendekia2010@gmail.com",
			"telepon":       "+62 852-3343-2221",
			"jam_layanan":   "Senin - Sabtu: 08.00 - 16.00 WIB",
			"akreditasi":    "Terakreditasi BAN-PT & Kemenag RI",
			"website_url":   "https://staicisitubondo.ac.id/pmb",
		},
		"program_studi": listProdi,
		"gelombang":     activeGelombang,
		"jalur_pendaftaran": []gin.H{
			{
				"kode":        "REGULER",
				"nama":        "Jalur Reguler (Mandiri)",
				"keterangan":  "Jalur pendaftaran terbuka untuk seluruh lulusan SMA/MA/SMK/Pondok Pesantren.",
				"termasuk_kip": "Pendaftar pemegang KIP/KIP-Kuliah dapat mengunggah berkas KIP sebagai berkas pendukung pada jalur ini.",
			},
		},
		"persyaratan": []string{
			"Scan/Foto Kartu Keluarga (KK) Asli/Legalisir (Format JPG/PDF maks 2 MB)",
			"Scan/Foto KTP Calon Mahasiswa (Format JPG/PDF maks 2 MB)",
			"Scan/Foto Ijazah / Surat Keterangan Lulus (SKL) SLTA Sederajat",
			"Pas Foto Resmi Berwarna 3x4 (Latar Belakang Merah/Biru)",
			"Bukti Transfer Pembayaran Biaya Pendaftaran PMB",
			"Scan Kartu KIP / KIP-Kuliah (Khusus Pendaftar Jalur Beasiswa KIP)",
		},
		"faq": []gin.H{
			{
				"pertanyaan": "Kapan waktu pendaftaran mahasiswa baru dibuka?",
				"jawaban":    "Pendaftaran dibuka melalui beberapa gelombang sepanjang tahun akademik berjalan. Silakan cek tabel Gelombang aktif di atas.",
			},
			{
				"pertanyaan": "Apakah pendaftaran PMB STAICI dapat dilakukan secara online sepenuhnya?",
				"jawaban":    "Ya, calon mahasiswa dapat melakukan pembuatan akun, pengisian biodata EMIS/Kopertais, dan unggah berkas secara daring melalui website ini.",
			},
			{
				"pertanyaan": "Bagaimana jika berkas saya dinyatakan tidak sah / perlu perbaikan?",
				"jawaban":    "Admin akan memberikan catatan alasan penolakan pada dashboard akun Anda, dan Anda dapat mengunggah ulang berkas revisi sebelum batas gelombang berakhir.",
			},
		},
	})
}

// GetSettings returns public dynamic settings for banner & contact info
func (h *PublicHandler) GetSettings(c *gin.Context) {
	var settings model.PengaturanSistem
	err := database.DB.First(&settings).Error
	if err != nil {
		response.Success(c, http.StatusOK, "Default settings", gin.H{
			"banner_title":      "Pusat Pendaftaran Mahasiswa Baru & Informasi Program Studi",
			"banner_subtitle":   "Meneguhkan keilmuan Islam modern dan etika profesional santri. Mari bergabung bersama STAI Cendekia Insani Tahun Akademik 2026/2027.",
			"announcement_text": "Penerimaan Mahasiswa Baru Gelombang 1 Resmi Dibuka",
			"bank_name":         "Bank Syariah Indonesia (BSI)",
			"nomor_rekening":    "7148899012",
			"atas_nama":         "STAI Cendekia Insani PMB",
			"no_whatsapp_cs":     "085233432221",
			"email_cs":          "pmb@staicisitubondo.ac.id",
			"alamat_kampus":     "Jl. Raya Panji No. 12, Situbondo, Jawa Timur",
		})
		return
	}
	response.Success(c, http.StatusOK, "Pengaturan sistem publik", settings)
}

