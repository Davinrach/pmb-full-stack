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

type TranslationHandler struct{}

func NewTranslationHandler() *TranslationHandler {
	return &TranslationHandler{}
}

// ──────────────────────────────────────────────
// PUBLIC: GET /api/v1/public/translations
// Mengembalikan seluruh teks terjemahan terformat
// sebagai nested JSON {group: {key: {id, en}}}
// ──────────────────────────────────────────────

func (h *TranslationHandler) GetPublicTranslations(c *gin.Context) {
	var rows []model.SiteTranslation
	database.DB.Order("group_name asc, urutan asc, id asc").Find(&rows)

	// Bangun struktur nested: { "navbar": { "beranda": { "id": "...", "en": "..." } } }
	result := make(map[string]map[string]map[string]string)
	for _, r := range rows {
		if result[r.GroupName] == nil {
			result[r.GroupName] = make(map[string]map[string]string)
		}
		result[r.GroupName][r.TranslationKey] = map[string]string{
			"id": r.TextID,
			"en": r.TextEN,
		}
	}

	response.Success(c, http.StatusOK, "Teks terjemahan publik", result)
}

// ──────────────────────────────────────────────
// ADMIN: LIST semua terjemahan (flat array)
// GET /api/v1/admin/translations
// ──────────────────────────────────────────────

func (h *TranslationHandler) ListTranslations(c *gin.Context) {
	groupFilter := c.Query("group")

	var list []model.SiteTranslation
	q := database.DB.Order("group_name asc, urutan asc, id asc")
	if groupFilter != "" {
		q = q.Where("group_name = ?", groupFilter)
	}
	q.Find(&list)

	// Kumpulkan daftar grup unik untuk filter di frontend
	var groups []string
	database.DB.Model(&model.SiteTranslation{}).
		Distinct("group_name").
		Order("group_name asc").
		Pluck("group_name", &groups)

	response.Success(c, http.StatusOK, "Daftar teks terjemahan", gin.H{
		"translations": list,
		"groups":       groups,
	})
}

// ──────────────────────────────────────────────
// ADMIN: CREATE terjemahan baru
// POST /api/v1/admin/translations
// ──────────────────────────────────────────────

func (h *TranslationHandler) CreateTranslation(c *gin.Context) {
	var req model.SiteTranslation
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data terjemahan tidak valid", err.Error())
		return
	}

	if req.GroupName == "" || req.TranslationKey == "" {
		response.BadRequest(c, "Nama grup dan kunci terjemahan wajib diisi", "validation_failed")
		return
	}
	if req.TextID == "" {
		response.BadRequest(c, "Teks Bahasa Indonesia wajib diisi", "validation_failed")
		return
	}

	// Cek duplikat
	var existing model.SiteTranslation
	if err := database.DB.Where("group_name = ? AND translation_key = ?", req.GroupName, req.TranslationKey).First(&existing).Error; err == nil {
		response.BadRequest(c, fmt.Sprintf("Kunci '%s.%s' sudah ada di database", req.GroupName, req.TranslationKey), "duplicate_key")
		return
	}

	if err := database.DB.Create(&req).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	RecordAdminLog(c, "Tambah Terjemahan", fmt.Sprintf("Admin menambahkan teks: %s.%s", req.GroupName, req.TranslationKey))
	response.Success(c, http.StatusCreated, "Teks terjemahan berhasil ditambahkan", req)
}

// ──────────────────────────────────────────────
// ADMIN: UPDATE terjemahan
// PUT /api/v1/admin/translations/:id
// ──────────────────────────────────────────────

func (h *TranslationHandler) UpdateTranslation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID terjemahan tidak valid", err.Error())
		return
	}

	var existing model.SiteTranslation
	if err := database.DB.First(&existing, id).Error; err != nil {
		response.NotFound(c, "Teks terjemahan tidak ditemukan")
		return
	}

	var req model.SiteTranslation
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data terjemahan tidak valid", err.Error())
		return
	}

	existing.GroupName = req.GroupName
	existing.TranslationKey = req.TranslationKey
	existing.TextID = req.TextID
	existing.TextEN = req.TextEN
	if req.Urutan != 0 {
		existing.Urutan = req.Urutan
	}

	if err := database.DB.Save(&existing).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	RecordAdminLog(c, "Update Terjemahan", fmt.Sprintf("Admin memperbarui teks: %s.%s", existing.GroupName, existing.TranslationKey))
	response.Success(c, http.StatusOK, "Teks terjemahan berhasil diperbarui", existing)
}

// ──────────────────────────────────────────────
// ADMIN: DELETE terjemahan
// DELETE /api/v1/admin/translations/:id
// ──────────────────────────────────────────────

func (h *TranslationHandler) DeleteTranslation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "ID terjemahan tidak valid", err.Error())
		return
	}

	var existing model.SiteTranslation
	if err := database.DB.First(&existing, id).Error; err != nil {
		response.NotFound(c, "Teks terjemahan tidak ditemukan")
		return
	}

	database.DB.Delete(&existing)

	RecordAdminLog(c, "Hapus Terjemahan", fmt.Sprintf("Admin menghapus teks: %s.%s", existing.GroupName, existing.TranslationKey))
	response.Success(c, http.StatusOK, "Teks terjemahan berhasil dihapus", nil)
}

// ──────────────────────────────────────────────
// ADMIN: BULK UPDATE (untuk simpan massal dari tab CMS)
// PUT /api/v1/admin/translations/bulk
// Body: { "translations": [ { id, text_id, text_en }, ... ] }
// ──────────────────────────────────────────────

func (h *TranslationHandler) BulkUpdateTranslations(c *gin.Context) {
	var req struct {
		Translations []struct {
			ID     uint   `json:"id"`
			TextID string `json:"text_id"`
			TextEN string `json:"text_en"`
		} `json:"translations"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data bulk update tidak valid", err.Error())
		return
	}

	updatedCount := 0
	for _, item := range req.Translations {
		if item.ID == 0 {
			continue
		}
		result := database.DB.Model(&model.SiteTranslation{}).
			Where("id = ?", item.ID).
			Updates(map[string]interface{}{
				"text_id": item.TextID,
				"text_en": item.TextEN,
			})
		if result.RowsAffected > 0 {
			updatedCount++
		}
	}

	RecordAdminLog(c, "Bulk Update Terjemahan", fmt.Sprintf("Admin memperbarui %d baris teks terjemahan secara massal", updatedCount))
	response.Success(c, http.StatusOK, fmt.Sprintf("Berhasil memperbarui %d teks terjemahan", updatedCount), gin.H{
		"updated_count": updatedCount,
	})
}
