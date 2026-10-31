package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PendaftarHandler struct{}

func NewPendaftarHandler() *PendaftarHandler {
	return &PendaftarHandler{}
}

type UpdateIdentitasRequest struct {
	JenisKelamin      string  `json:"jenis_kelamin" binding:"required"`
	Alamat            string  `json:"alamat" binding:"required"`
	TempatLahir       string  `json:"tempat_lahir" binding:"required"`
	TanggalLahir      string  `json:"tanggal_lahir" binding:"required"` // format: YYYY-MM-DD
	StatusWargaNegara string  `json:"status_warga_negara" binding:"required"`
	NegaraWNA         string  `json:"negara_wna"`
	Agama             string  `json:"agama" binding:"required"`
	StatusPernikahan  string  `json:"status_pernikahan" binding:"required"`
}

type UpdateAsalSekolahRequest struct {
	NamaSekolah    string  `json:"nama_sekolah" binding:"required"`
	StatusSekolah  string  `json:"status_sekolah" binding:"required"` // Negeri / Swasta
	JurusanSekolah string  `json:"jurusan_sekolah" binding:"required"`
	NilaiRataRata  float64 `json:"nilai_rata_rata" binding:"required"`
	TahunLulus     int     `json:"tahun_lulus" binding:"required"`
}

type UpdateOrangTuaRequest struct {
	// Ayah
	NamaAyah         string `json:"nama_ayah" binding:"required"`
	NIKAyah          string `json:"nik_ayah"`
	KKAyah           string `json:"kk_ayah"`
	TempatLahirAyah  string `json:"tempat_lahir_ayah"`
	TanggalLahirAyah string `json:"tanggal_lahir_ayah"` // YYYY-MM-DD
	AlamatAyah       string `json:"alamat_ayah"`
	PendidikanAyah   string `json:"pendidikan_ayah"`
	PekerjaanAyah    string `json:"pekerjaan_ayah"`
	PenghasilanAyah  string `json:"penghasilan_ayah"`

	// Ibu
	NamaIbu          string `json:"nama_ibu" binding:"required"`
	NIKIbu           string `json:"nik_ibu"`
	KKIbu            string `json:"kk_ibu"`
	TempatLahirIbu   string `json:"tempat_lahir_ibu"`
	TanggalLahirIbu  string `json:"tanggal_lahir_ibu"` // YYYY-MM-DD
	AlamatIbu        string `json:"alamat_ibu"`
	PendidikanIbu    string `json:"pendidikan_ibu"`
	PekerjaanIbu     string `json:"pekerjaan_ibu"`
	PenghasilanIbu   string `json:"penghasilan_ibu"`

	// Wali (Kondisional)
	NamaWali         string `json:"nama_wali"`
	AlamatWali       string `json:"alamat_wali"`
	NoHPOrangTuaWali string `json:"no_hp_orang_tua_wali"`
}

type UpdateProdiGelombangRequest struct {
	ProgramStudiID   uint   `json:"program_studi_id" binding:"required"`
	GelombangID      uint   `json:"gelombang_id" binding:"required"`
	JalurPendaftaran string `json:"jalur_pendaftaran"`
}

func getPendaftarByUserID(userID uint) (*model.Pendaftar, error) {
	var pendaftar model.Pendaftar
	err := database.DB.Preload("User").
		Preload("Gelombang").
		Preload("ProgramStudi").
		Preload("DataOrangTua").
		Preload("Berkas").
		Preload("Pembayaran").
		Where("user_id = ?", userID).
		First(&pendaftar).Error
	if err != nil {
		return nil, err
	}
	return &pendaftar, nil
}

// GetMyPendaftaran returns full registration form data for current applicant (FR-7.1)
func (h *PendaftarHandler) GetMyPendaftaran(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran belum ditemukan")
		return
	}
	response.Success(c, http.StatusOK, "Data pendaftaran berhasil diambil", pendaftar)
}

// UpdateIdentitas updates student identity section (FR-2.1)
func (h *PendaftarHandler) UpdateIdentitas(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran tidak ditemukan")
		return
	}

	if pendaftar.IsLocked {
		response.Forbidden(c, "Data formulir sudah disubmit dan dikunci. Tidak dapat diubah.")
		return
	}

	var req UpdateIdentitasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Mohon lengkapi seluruh field identitas diri wajib", err.Error())
		return
	}

	var tglLahir *time.Time
	if req.TanggalLahir != "" {
		parsed, err := time.Parse("2006-01-02", req.TanggalLahir)
		if err == nil {
			tglLahir = &parsed
		}
	}

	pendaftar.JenisKelamin = req.JenisKelamin
	pendaftar.Alamat = req.Alamat
	pendaftar.TempatLahir = req.TempatLahir
	pendaftar.TanggalLahir = tglLahir
	pendaftar.StatusWargaNegara = req.StatusWargaNegara
	pendaftar.NegaraWNA = req.NegaraWNA
	pendaftar.Agama = req.Agama
	pendaftar.StatusPernikahan = req.StatusPernikahan

	if pendaftar.StatusPendaftaran == model.StatusAkunTerdaftar || pendaftar.StatusPendaftaran == model.StatusDraft {
		pendaftar.StatusPendaftaran = model.StatusBelumLengkap
	}

	if err := database.DB.Save(pendaftar).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Data identitas calon mahasiswa berhasil disimpan", pendaftar)
}

// UpdateAsalSekolah updates high school data (FR-2.2)
func (h *PendaftarHandler) UpdateAsalSekolah(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran tidak ditemukan")
		return
	}

	if pendaftar.IsLocked {
		response.Forbidden(c, "Data formulir sudah disubmit dan dikunci. Tidak dapat diubah.")
		return
	}

	var req UpdateAsalSekolahRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Mohon lengkapi seluruh field asal sekolah wajib", err.Error())
		return
	}

	pendaftar.NamaSekolah = req.NamaSekolah
	pendaftar.StatusSekolah = req.StatusSekolah
	pendaftar.JurusanSekolah = req.JurusanSekolah
	pendaftar.NilaiRataRata = req.NilaiRataRata
	pendaftar.TahunLulus = req.TahunLulus

	if pendaftar.StatusPendaftaran == model.StatusAkunTerdaftar || pendaftar.StatusPendaftaran == model.StatusDraft {
		pendaftar.StatusPendaftaran = model.StatusBelumLengkap
	}

	if err := database.DB.Save(pendaftar).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Data asal sekolah berhasil disimpan", pendaftar)
}

// UpdateOrangTua updates parent and guardian details (FR-2.3, FR-2.4, FR-2.5)
func (h *PendaftarHandler) UpdateOrangTua(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran tidak ditemukan")
		return
	}

	if pendaftar.IsLocked {
		response.Forbidden(c, "Data formulir sudah disubmit dan dikunci. Tidak dapat diubah.")
		return
	}

	var req UpdateOrangTuaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Mohon lengkapi data orang tua (Ayah & Ibu) serta kontak", err.Error())
		return
	}

	var tglAyah, tglIbu *time.Time
	if req.TanggalLahirAyah != "" {
		if t, err := time.Parse("2006-01-02", req.TanggalLahirAyah); err == nil {
			tglAyah = &t
		}
	}
	if req.TanggalLahirIbu != "" {
		if t, err := time.Parse("2006-01-02", req.TanggalLahirIbu); err == nil {
			tglIbu = &t
		}
	}

	var orangTua model.OrangTua
	err = database.DB.Where("pendaftar_id = ?", pendaftar.ID).First(&orangTua).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		response.InternalServerError(c, err.Error())
		return
	}

	orangTua.PendaftarID = pendaftar.ID
	orangTua.NamaAyah = req.NamaAyah
	orangTua.NIKAyah = req.NIKAyah
	orangTua.KKAyah = req.KKAyah
	orangTua.TempatLahirAyah = req.TempatLahirAyah
	orangTua.TanggalLahirAyah = tglAyah
	orangTua.AlamatAyah = req.AlamatAyah
	orangTua.PendidikanAyah = req.PendidikanAyah
	orangTua.PekerjaanAyah = req.PekerjaanAyah
	orangTua.PenghasilanAyah = req.PenghasilanAyah

	orangTua.NamaIbu = req.NamaIbu
	orangTua.NIKIbu = req.NIKIbu
	orangTua.KKIbu = req.KKIbu
	orangTua.TempatLahirIbu = req.TempatLahirIbu
	orangTua.TanggalLahirIbu = tglIbu
	orangTua.AlamatIbu = req.AlamatIbu
	orangTua.PendidikanIbu = req.PendidikanIbu
	orangTua.PekerjaanIbu = req.PekerjaanIbu
	orangTua.PenghasilanIbu = req.PenghasilanIbu

	orangTua.NamaWali = req.NamaWali
	orangTua.AlamatWali = req.AlamatWali
	orangTua.NoHPOrangTuaWali = req.NoHPOrangTuaWali

	if err := database.DB.Save(&orangTua).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	if pendaftar.StatusPendaftaran == model.StatusAkunTerdaftar || pendaftar.StatusPendaftaran == model.StatusDraft {
		pendaftar.StatusPendaftaran = model.StatusBelumLengkap
		database.DB.Save(pendaftar)
	}

	response.Success(c, http.StatusOK, "Data orang tua dan wali berhasil disimpan", orangTua)
}

// UpdatePilihanProdi updates study program and wave (FR-2.6)
func (h *PendaftarHandler) UpdatePilihanProdi(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran tidak ditemukan")
		return
	}

	if pendaftar.IsLocked {
		response.Forbidden(c, "Data formulir sudah disubmit dan dikunci. Tidak dapat diubah.")
		return
	}

	var req UpdateProdiGelombangRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Pilihan program studi dan gelombang harus ditentukan", err.Error())
		return
	}

	pendaftar.ProgramStudiID = &req.ProgramStudiID
	pendaftar.GelombangID = &req.GelombangID
	if req.JalurPendaftaran != "" {
		pendaftar.JalurPendaftaran = req.JalurPendaftaran
	} else if pendaftar.JalurPendaftaran == "" {
		pendaftar.JalurPendaftaran = "Reguler"
	}

	if pendaftar.StatusPendaftaran == model.StatusAkunTerdaftar || pendaftar.StatusPendaftaran == model.StatusDraft {
		pendaftar.StatusPendaftaran = model.StatusBelumLengkap
	}

	if err := database.DB.Save(pendaftar).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Pilihan program studi & gelombang berhasil diperbarui", pendaftar)
}

// SubmitFinal submits the registration, generates nomor pendaftaran, and locks data (FR-5.5, FR-2.8)
func (h *PendaftarHandler) SubmitFinal(c *gin.Context) {
	userID := c.GetUint("user_id")
	pendaftar, err := getPendaftarByUserID(userID)
	if err != nil {
		response.NotFound(c, "Data pendaftaran tidak ditemukan")
		return
	}

	if pendaftar.IsLocked {
		response.BadRequest(c, "Pendaftaran sudah disubmit sebelumnya.", "Already submitted")
		return
	}

	// Validate completeness
	if pendaftar.JenisKelamin == "" || pendaftar.Alamat == "" || pendaftar.TempatLahir == "" {
		response.BadRequest(c, "Identitas mahasiswa belum lengkap. Silakan lengkapi Bagian 1.", "Incomplete Identity")
		return
	}

	if pendaftar.NamaSekolah == "" || pendaftar.TahunLulus == 0 {
		response.BadRequest(c, "Data asal sekolah belum lengkap. Silakan lengkapi Bagian 2.", "Incomplete School Info")
		return
	}

	if pendaftar.DataOrangTua == nil || pendaftar.DataOrangTua.NamaAyah == "" || pendaftar.DataOrangTua.NamaIbu == "" {
		response.BadRequest(c, "Data orang tua belum lengkap. Silakan lengkapi Bagian 3.", "Incomplete Parent Info")
		return
	}

	if pendaftar.ProgramStudiID == nil {
		response.BadRequest(c, "Pilihan program studi belum dipilih. Silakan pilih program studi terlebih dahulu.", "Incomplete Prodi")
		return
	}

	// Check mandatory documents (KK, KTP, Ijazah, Foto)
	docTypes := make(map[string]bool)
	for _, b := range pendaftar.Berkas {
		docTypes[strings.ToLower(b.JenisDokumen)] = true
	}

	// Generate Nomor Pendaftaran: PMB-[Tahun]-[Urutan 4 digit] (FR-5.5, Section 8.9)
	currentYear := time.Now().Year()
	prefix := fmt.Sprintf("PMB-%d-", currentYear)

	var nomorPendaftaran string
	if pendaftar.NomorPendaftaran != nil && *pendaftar.NomorPendaftaran != "" {
		nomorPendaftaran = *pendaftar.NomorPendaftaran
	} else {
		var allNomor []string
		database.DB.Model(&model.Pendaftar{}).
			Where("nomor_pendaftaran LIKE ?", prefix+"%").
			Pluck("nomor_pendaftaran", &allNomor)

		maxSeq := 0
		for _, n := range allNomor {
			parts := strings.Split(n, "-")
			if len(parts) == 3 {
				if seq, err := strconv.Atoi(parts[2]); err == nil && seq > maxSeq {
					maxSeq = seq
				}
			}
		}
		nomorPendaftaran = fmt.Sprintf("PMB-%d-%04d", currentYear, maxSeq+1)
		pendaftar.NomorPendaftaran = &nomorPendaftaran
	}
	pendaftar.StatusPendaftaran = model.StatusMenungguPembayaran
	pendaftar.IsLocked = true
	pendaftar.CatatanRevisi = ""

	if err := database.DB.Save(pendaftar).Error; err != nil {
		response.InternalServerError(c, fmt.Sprintf("Gagal menyimpan pendaftaran: %v", err))
		return
	}

	response.Success(c, http.StatusOK, "Pendaftaran berhasil disubmit! Nomor Registrasi PMB Anda telah diterbitkan.", gin.H{
		"nomor_pendaftaran":  nomorPendaftaran,
		"status_pendaftaran": pendaftar.StatusPendaftaran,
		"is_locked":          pendaftar.IsLocked,
	})
}
