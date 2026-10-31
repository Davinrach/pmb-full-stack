package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"pmb-staici-backend/internal/config"
	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PembayaranHandler struct {
	cfg *config.Config
}

func NewPembayaranHandler(cfg *config.Config) *PembayaranHandler {
	return &PembayaranHandler{cfg: cfg}
}

// GetInfoRekening returns official bank account details and active wave fee (FR-4.1)
func (h *PembayaranHandler) GetInfoRekening(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran tidak ditemukan")
		return
	}

	biaya := float64(250000) // Default Rp 250.000 jika gelombang belum diatur
	isKip := strings.Contains(strings.ToLower(pendaftar.JalurPendaftaran), "kip")
	if isKip {
		biaya = 0
	} else if pendaftar.Gelombang != nil && pendaftar.Gelombang.BiayaPendaftaran > 0 {
		biaya = pendaftar.Gelombang.BiayaPendaftaran
	}

	var settings model.PengaturanSistem
	database.DB.First(&settings)

	var listRekening []model.RekeningPembayaran
	database.DB.Where("is_aktif = ?", true).Order("is_utama desc, urutan asc, id asc").Find(&listRekening)

	bankName := settings.BankName
	noRek := settings.NomorRekening
	atasNama := settings.AtasNama
	petunjuk := settings.PetunjukPembayaran

	if len(listRekening) > 0 {
		bankName = listRekening[0].NamaBank
		noRek = listRekening[0].NomorRekening
		atasNama = listRekening[0].AtasNama
		if listRekening[0].InstruksiTransfer != "" {
			petunjuk = listRekening[0].InstruksiTransfer
		}
	}

	if bankName == "" {
		bankName = "Bank Syariah Indonesia (BSI)"
	}
	if noRek == "" {
		noRek = "7148899012"
	}
	if atasNama == "" {
		atasNama = "STAI Cendekia Insani PMB"
	}
	if petunjuk == "" {
		petunjuk = "Harap cantumkan Nomor Registrasi PMB pada berita transfer atau simpan struk transfer untuk diunggah sebagai bukti bayar."
	}

	response.Success(c, http.StatusOK, "Informasi rekening pembayaran PMB STAICI", gin.H{
		"bank_name":              bankName,
		"nomor_rekening":         noRek,
		"atas_nama":              atasNama,
		"daftar_rekening":        listRekening,
		"biaya_pendaftaran":      biaya,
		"jalur_pendaftaran":      pendaftar.JalurPendaftaran,
		"is_kip":                 isKip,
		"nomor_pendaftaran":      pendaftar.NomorPendaftaran,
		"kode_pembayaran_unik":   fmt.Sprintf("PMB-%04d", pendaftar.ID),
		"instruksi":              petunjuk,
		"petunjuk_pembayaran":    petunjuk,
		"regulasi_bukti_bayar":   settings.RegulasiBuktiBayar,
		"batas_waktu_konfirmasi": settings.BatasWaktuKonfirmasi,
	})
}

// KonfirmasiPembayaran uploads manual payment receipt (FR-4.2, FR-4.3)
func (h *PembayaranHandler) KonfirmasiPembayaran(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran tidak ditemukan")
		return
	}

	var settings model.PengaturanSistem
	database.DB.First(&settings)

	namaPengirim := strings.TrimSpace(c.PostForm("nama_pengirim"))
	bankTujuan := strings.TrimSpace(c.PostForm("bank_tujuan"))
	if bankTujuan == "" {
		if settings.BankName != "" {
			bankTujuan = settings.BankName
		} else {
			bankTujuan = "Bank Syariah Indonesia (BSI)"
		}
	}

	file, header, err := c.Request.FormFile("bukti_transfer")
	if err != nil {
		response.BadRequest(c, "Bukti transfer harus diunggah", err.Error())
		return
	}
	defer file.Close()

	if header.Size > MaxFileSize {
		response.BadRequest(c, "Ukuran file bukti pembayaran melebihi 2 MB", "Max size exceeded")
		return
	}

	// Validasi Ekstensi dan MIME-Type Bukti Pembayaran
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".pdf":  true,
	}
	if !allowedExts[ext] {
		response.BadRequest(c, "Format file bukti transfer tidak didukung. Harap unggah berkas berformat JPG, PNG, WEBP, atau PDF.", "Disallowed file extension")
		return
	}

	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		response.InternalServerError(c, "Gagal membaca header bukti transfer")
		return
	}
	file.Seek(0, io.SeekStart)

	mimeType := http.DetectContentType(buffer)
	if !strings.HasPrefix(mimeType, "image/") && mimeType != "application/pdf" {
		response.BadRequest(c, "Format file bukti pembayaran tidak valid. Harap unggah file berformat JPG, PNG, WEBP, atau PDF.", fmt.Sprintf("Mime %s not allowed", mimeType))
		return
	}

	uploadDir := h.cfg.UploadDir
	_ = os.MkdirAll(uploadDir, 0755)

	safeFileName := fmt.Sprintf("pay_%d_%s%s", pendaftar.ID, uuid.New().String()[:8], ext)
	targetPath := filepath.ToSlash(filepath.Join(uploadDir, safeFileName))

	out, err := os.Create(targetPath)
	if err != nil {
		response.InternalServerError(c, "Gagal menyimpan file bukti transfer")
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		response.InternalServerError(c, "Gagal menulis file bukti transfer")
		return
	}

	biaya := float64(250000)
	if pendaftar.Gelombang != nil && pendaftar.Gelombang.BiayaPendaftaran > 0 {
		biaya = pendaftar.Gelombang.BiayaPendaftaran
	}

	noRekTujuan := settings.NomorRekening
	if noRekTujuan == "" {
		noRekTujuan = "7148899012"
	}

	pembayaran := model.Pembayaran{
		PendaftarID:         pendaftar.ID,
		Jumlah:              biaya,
		BankTujuan:          bankTujuan,
		NomorRekeningTujuan: noRekTujuan,
		NamaPengirim:        namaPengirim,
		BuktiTransferPath:   targetPath,
		Status:              model.StatusBayarMenungguVerifikasi,
	}

	tx := database.DB.Begin()
	if err := tx.Create(&pembayaran).Error; err != nil {
		tx.Rollback()
		response.InternalServerError(c, err.Error())
		return
	}

	// Update status pendaftaran menjadi Menunggu Verifikasi (FR-4.3, Section 8.8)
	pendaftar.StatusPendaftaran = model.StatusMenungguVerifikasi
	if err := tx.Save(pendaftar).Error; err != nil {
		tx.Rollback()
		response.InternalServerError(c, err.Error())
		return
	}
	tx.Commit()

	response.Success(c, http.StatusCreated, "Bukti pembayaran berhasil diunggah. Panitia PMB akan memverifikasi berkas dan pembayaran Anda.", pembayaran)
}

// GetStatusPembayaran returns current payment status (FR-4.3, FR-7.5)
func (h *PembayaranHandler) GetStatusPembayaran(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran tidak ditemukan")
		return
	}

	var listPembayaran []model.Pembayaran
	database.DB.Where("pendaftar_id = ?", pendaftar.ID).Order("created_at desc").Find(&listPembayaran)

	response.Success(c, http.StatusOK, "Status pembayaran berhasil diambil", gin.H{
		"status_pendaftaran": pendaftar.StatusPendaftaran,
		"riwayat_pembayaran": listPembayaran,
	})
}
