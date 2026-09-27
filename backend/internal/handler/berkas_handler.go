package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"pmb-staici-backend/internal/config"
	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BerkasHandler struct {
	cfg *config.Config
}

func NewBerkasHandler(cfg *config.Config) *BerkasHandler {
	return &BerkasHandler{cfg: cfg}
}

const MaxFileSize = 2 * 1024 * 1024 // 2 MB (PRD FR-3.3, Section 8.7)

var allowedMimeTypes = map[string]bool{
	"image/jpeg":      true,
	"image/jpg":       true,
	"image/png":       true,
	"image/webp":      true,
	"application/pdf": true,
}

// UploadBerkas handles document upload (FR-3.1 - FR-3.4)
func (h *BerkasHandler) UploadBerkas(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran tidak ditemukan")
		return
	}

	jenisDokumen := strings.TrimSpace(c.PostForm("jenis_dokumen"))
	if jenisDokumen == "" {
		response.BadRequest(c, "Jenis dokumen harus dipilih (kk, ktp, ijazah, foto, kip, lainnya)", "Missing jenis_dokumen")
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		response.BadRequest(c, "Berkas tidak ditemukan dalam unggahan", err.Error())
		return
	}
	defer file.Close()

	// 1. Validasi Ukuran Maksimal 2 MB (FR-3.3, Section 7.1)
	if header.Size > MaxFileSize {
		response.BadRequest(c, "Ukuran file melebihi batas maksimal 2 MB", fmt.Sprintf("File size %d > %d", header.Size, MaxFileSize))
		return
	}

	// 2. Validasi MIME-Type (FR-3.4)
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		response.InternalServerError(c, "Gagal membaca header berkas")
		return
	}
	file.Seek(0, io.SeekStart)

	mimeType := http.DetectContentType(buffer)
	// Normalisasi untuk image/pdf
	if !allowedMimeTypes[mimeType] && !strings.HasPrefix(mimeType, "image/") && mimeType != "application/pdf" {
		response.BadRequest(c, "Format file tidak didukung. Harap unggah file berformat JPG, PNG, atau PDF.", fmt.Sprintf("Mime %s not allowed", mimeType))
		return
	}

	// Ensure upload directory exists
	uploadDir := h.cfg.UploadDir
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		response.InternalServerError(c, "Gagal membuat folder penyimpanan")
		return
	}

	// Buat nama file unik & aman (PRD 7.1)
	ext := filepath.Ext(header.Filename)
	safeFileName := fmt.Sprintf("%d_%s_%s%s", pendaftar.ID, strings.ToLower(jenisDokumen), uuid.New().String()[:8], ext)
	targetPath := filepath.Join(uploadDir, safeFileName)

	out, err := os.Create(targetPath)
	if err != nil {
		response.InternalServerError(c, fmt.Sprintf("Gagal menyimpan berkas ke disk: %v", err))
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		response.InternalServerError(c, fmt.Sprintf("Gagal menyalin konten berkas: %v", err))
		return
	}

	// Check if this document type already exists for applicant; if so, replace it
	var existingBerkas model.Berkas
	err = database.DB.Where("pendaftar_id = ? AND jenis_dokumen = ?", pendaftar.ID, jenisDokumen).First(&existingBerkas).Error
	if err == nil {
		// Hapus file lama jika ada
		_ = os.Remove(existingBerkas.FilePath)

		existingBerkas.FileName = header.Filename
		existingBerkas.FilePath = targetPath
		existingBerkas.FileSize = header.Size
		existingBerkas.MimeType = mimeType
		existingBerkas.StatusVerifikasi = model.StatusBerkasPending
		existingBerkas.CatatanAdmin = ""
		existingBerkas.UpdatedAt = time.Now()

		database.DB.Save(&existingBerkas)
		response.Success(c, http.StatusOK, fmt.Sprintf("Berkas %s berhasil diperbarui", jenisDokumen), existingBerkas)
		return
	}

	newBerkas := model.Berkas{
		PendaftarID:      pendaftar.ID,
		JenisDokumen:     jenisDokumen,
		FileName:         header.Filename,
		FilePath:         targetPath,
		FileSize:         header.Size,
		MimeType:         mimeType,
		StatusVerifikasi: model.StatusBerkasPending,
	}

	if err := database.DB.Create(&newBerkas).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusCreated, fmt.Sprintf("Berkas %s berhasil diunggah", jenisDokumen), newBerkas)
}

// DownloadBerkas streams file with RBAC & ownership verification (PRD 7.1 Proteksi Akses Berkas)
func (h *BerkasHandler) DownloadBerkas(c *gin.Context) {
	berkasIDStr := c.Param("id")
	berkasID, err := strconv.ParseUint(berkasIDStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID berkas tidak valid", err.Error())
		return
	}

	var berkas model.Berkas
	if err := database.DB.First(&berkas, berkasID).Error; err != nil {
		response.NotFound(c, "Berkas tidak ditemukan")
		return
	}

	userID := c.GetUint("user_id")
	role := c.GetString("role")

	// Calon mahasiswa can only view their own files
	if role == string(model.RoleCalonMahasiswa) {
		var pendaftar model.Pendaftar
		if err := database.DB.Where("user_id = ?", userID).First(&pendaftar).Error; err != nil || pendaftar.ID != berkas.PendaftarID {
			response.Forbidden(c, "Anda tidak berhak mengakses berkas ini")
			return
		}
	}

	// Check if file physically exists
	if _, err := os.Stat(berkas.FilePath); os.IsNotExist(err) {
		response.NotFound(c, "File fisik berkas tidak ditemukan di server")
		return
	}

	c.File(berkas.FilePath)
}

// DeleteBerkas removes uploaded document before verification (FR-3.5)
func (h *BerkasHandler) DeleteBerkas(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran tidak ditemukan")
		return
	}

	berkasIDStr := c.Param("id")
	berkasID, _ := strconv.ParseUint(berkasIDStr, 10, 32)

	var berkas model.Berkas
	if err := database.DB.Where("id = ? AND pendaftar_id = ?", berkasID, pendaftar.ID).First(&berkas).Error; err != nil {
		response.NotFound(c, "Berkas tidak ditemukan")
		return
	}

	if berkas.StatusVerifikasi == model.StatusBerkasValid {
		response.Forbidden(c, "Berkas yang telah diverifikasi sah tidak dapat dihapus")
		return
	}

	_ = os.Remove(berkas.FilePath)
	database.DB.Delete(&berkas)

	response.Success(c, http.StatusOK, "Berkas berhasil dihapus", nil)
}
