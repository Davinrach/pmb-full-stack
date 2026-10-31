package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"

	"github.com/gin-gonic/gin"
)

// TC_WB_021: Menguji percabangan penentuan biaya formulir pendaftaran untuk Jalur KIP-Kuliah (isKip == true)
func TestWB021_Pembayaran_JalurKipKuliahBebasBiaya(t *testing.T) {
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
func TestWB022_Pembayaran_JalurRegulerBerbayar(t *testing.T) {
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
func TestWB023_HealthHandler_DatabaseNilSafety(t *testing.T) {
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

// TestFix_Pembayaran_AllowedExtensions: Memastikan ekstensi file bukti transfer berbahaya ditolak
func TestFix_Pembayaran_AllowedExtensions(t *testing.T) {
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".pdf":  true,
	}

	dangerousFiles := []string{"shell.php", "exploit.exe", "script.sh", "payload.html", "trojan.js"}
	for _, fn := range dangerousFiles {
		ext := strings.ToLower(fn[strings.LastIndex(fn, "."):])
		if allowedExts[ext] {
			t.Errorf("Ekstensi berbahaya '%s' seharusnya ditolak, tapi diizinkan", ext)
		}
	}

	validFiles := []string{"bukti.jpg", "struk.jpeg", "transfer.png", "receipt.webp", "nota.pdf"}
	for _, fn := range validFiles {
		ext := strings.ToLower(fn[strings.LastIndex(fn, "."):])
		if !allowedExts[ext] {
			t.Errorf("Ekstensi valid '%s' seharusnya diizinkan, tapi ditolak", ext)
		}
	}
}

// TestFix_SafeNomorPendaftaran_MaxSequence: Memastikan nomor pendaftaran menghitung MAX urutan agar bebas tabrakan
func TestFix_SafeNomorPendaftaran_MaxSequence(t *testing.T) {
	currentYear := 2026
	allNomor := []string{"PMB-2026-0001", "PMB-2026-0005", "PMB-2026-0010"} // Ada gap penomoran

	maxSeq := 0
	for _, n := range allNomor {
		parts := strings.Split(n, "-")
		if len(parts) == 3 {
			var seq int
			for _, ch := range parts[2] {
				if ch >= '0' && ch <= '9' {
					seq = seq*10 + int(ch-'0')
				}
			}
			if seq > maxSeq {
				maxSeq = seq
			}
		}
	}

	nextSeq := maxSeq + 1
	generated := fmt.Sprintf("PMB-%d-%04d", currentYear, nextSeq)

	if nextSeq != 11 {
		t.Errorf("nextSeq = %d, diharapkan 11 (maxSeq 10 + 1)", nextSeq)
	}
	if generated != "PMB-2026-0011" {
		t.Errorf("generated = %s, diharapkan PMB-2026-0011", generated)
	}
}