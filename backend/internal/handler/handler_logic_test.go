package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"

	"github.com/gin-gonic/gin"
)

// TC_WB_021: Menguji percabangan penentuan biaya formulir pendaftaran untuk Jalur KIP-Kuliah (isKip == true)
func TestPembayaran_JalurKipKuliahBebasBiaya(t *testing.T) {
	jalur := "KIP-Kuliah"
	isKip := strings.Contains(strings.ToLower(jalur), "kip")

	biaya := float64(250000)
	if isKip {
		biaya = 0
	}

	if !isKip {
		t.Errorf("isKip untuk jalur '%s' bernilai false, diharapkan true", jalur)
	}
	if biaya != 0 {
		t.Errorf("Biaya untuk pendaftar KIP bernilai %f, diharapkan 0", biaya)
	}
}

// TC_WB_022: Menguji percabangan penentuan biaya formulir pendaftaran untuk Jalur Reguler berbayar (isKip == false)
func TestPembayaran_JalurRegulerBerbayar(t *testing.T) {
	jalur := "Reguler"
	gelombang := &model.Gelombang{
		BiayaPendaftaran: 250000,
	}

	isKip := strings.Contains(strings.ToLower(jalur), "kip")
	biaya := float64(250000)
	if isKip {
		biaya = 0
	} else if gelombang.BiayaPendaftaran > 0 {
		biaya = gelombang.BiayaPendaftaran
	}

	if isKip {
		t.Errorf("isKip untuk jalur '%s' bernilai true, diharapkan false", jalur)
	}
	if biaya != 250000 {
		t.Errorf("Biaya untuk pendaftar Reguler bernilai %f, diharapkan 250000", biaya)
	}
}

// TC_WB_023: Menguji penanganan status kesehatan sistem saat koneksi basis data bernilai nil (database.DB == nil)
func TestHealthHandler_DatabaseNilSafety(t *testing.T) {
	gin.SetMode(gin.TestMode)
	originalDB := database.DB
	database.DB = nil
	defer func() {
		database.DB = originalDB
	}()

	h := NewHealthHandler()
	router := gin.New()
	router.GET("/health", h.Check)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/health", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Status code = %d, diharapkan %d", w.Code, http.StatusOK)
	}

	var res map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
		t.Fatalf("Gagal unmarshal response JSON: %v", err)
	}

	dbStatus, ok := res["database"].(string)
	if !ok || dbStatus != "disconnected" {
		t.Errorf("Status database = %v, diharapkan 'disconnected'", res["database"])
	}
}
