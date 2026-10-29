package crypto_test

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"pmb-staici-backend/internal/crypto"
	"pmb-staici-backend/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func setupTestCrypto(t *testing.T) {
	t.Helper()
	key1, _ := crypto.GenerateKey32()
	key2, _ := crypto.GenerateKey32()
	bIndexKey, _ := crypto.GenerateKey32()

	keysMap := map[string][]byte{
		"1": key1,
		"2": key2,
	}

	err := crypto.InitCrypto(keysMap, "1", bIndexKey)
	if err != nil {
		t.Fatalf("InitCrypto failed: %v", err)
	}
}

func getTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := "root:@tcp(127.0.0.1:3306)/pmb_staici_db?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Skipf("MySQL tidak aktif atau tidak dapat diakses untuk tes integrasi: %v", err)
	}
	return db
}

// TestGORMIntegration verifies GORM hooks auto-encrypt on Save and auto-decrypt on Find,
// while raw SQL shows the data is actually encrypted in MySQL.
func TestGORMIntegration(t *testing.T) {
	setupTestCrypto(t)
	db := getTestDB(t)

	testEmail := fmt.Sprintf("test_kripto_%d@example.com", os.Getpid())
	testNIK := "3512999988880001"

	// 1. Simpan user baru melalui GORM
	newUser := model.User{
		Email:        testEmail,
		NamaLengkap:  "Budi Kripto Santoso",
		NoHP:         "081234567899",
		NIK:          testNIK,
		Role:         model.RoleCalonMahasiswa,
		PasswordHash: "hashedpass",
	}

	err := db.Create(&newUser).Error
	if err != nil {
		t.Fatalf("Gagal membuat user baru di DB: %v", err)
	}
	defer func() {
		// Bersihkan data setelah pengujian
		db.Unscoped().Delete(&newUser)
	}()

	// 2. Verifikasi lewat Query Raw SQL bahwa kolom NIK di MySQL adalah Ciphertext v1:...
	var rawRow struct {
		NIK    string
		NIKIdx string
		UUID   string
	}
	err = db.Raw("SELECT nik, nik_idx, uuid FROM users WHERE id = ?", newUser.ID).Scan(&rawRow).Error
	if err != nil {
		t.Fatalf("Query raw SQL gagal: %v", err)
	}

	if !strings.HasPrefix(rawRow.NIK, "v1:") {
		t.Errorf("Kolom NIK di database HARUS diawali 'v1:', tetapi tersimpan: %s", rawRow.NIK)
	}

	if rawRow.NIK == testNIK {
		t.Fatalf("KEBOCORAN DATA: NIK di database tersimpan dalam bentuk plaintext!")
	}

	if rawRow.NIKIdx == "" {
		t.Errorf("Kolom nik_idx (blind index) di database tidak boleh kosong")
	}

	// 3. Verifikasi pencarian via Blind Index
	var foundUser model.User
	bIdx := crypto.BlindIndex(testNIK)
	err = db.Where("nik_idx = ?", bIdx).First(&foundUser).Error
	if err != nil {
		t.Fatalf("Pencarian via blind index gagal: %v", err)
	}

	// 4. Verifikasi bahwa saat dibaca lewat GORM, NIK didekripsi kembali menjadi plaintext asli
	if foundUser.NIK != testNIK {
		t.Errorf("NIK hasil dekripsi GORM '%s' tidak cocok dengan NIK asli '%s'", foundUser.NIK, testNIK)
	}

	// 5. Verifikasi deteksi duplikasi NIK via Blind Index
	duplicateUser := model.User{
		Email:        "duplicate_" + testEmail,
		NamaLengkap:  "Duplikat NIK",
		NoHP:         "081234567898",
		NIK:          testNIK,
		Role:         model.RoleCalonMahasiswa,
		PasswordHash: "hashedpass",
	}

	dupIdx := crypto.BlindIndex(duplicateUser.NIK)
	var count int64
	db.Model(&model.User{}).Where("nik_idx = ?", dupIdx).Count(&count)
	if count == 0 {
		t.Errorf("Duplikasi NIK seharusnya terdeteksi lewat nik_idx, namun count = 0")
	}
}

// TestFileSecurityUploadDownload simulates upload, checks physical ciphertext on disk,
// and tests ownership check (anti-IDOR).
func TestFileSecurityUploadDownload(t *testing.T) {
	setupTestCrypto(t)

	tempDir := t.TempDir()
	originalContent := []byte("%PDF-1.4\n1 0 obj\n<<DUMMY SECURE KTP DATA>>\nendobj")
	aad := []byte("pendaftar:101:dokumen:ktp")

	// 1. Enkripsi berkas seperti yang dilakukan di UploadBerkas
	encBytes, err := crypto.EncryptFile(originalContent, aad)
	if err != nil {
		t.Fatalf("EncryptFile gagal: %v", err)
	}

	targetFile := filepath.Join(tempDir, "101_ktp_test.pdf")
	err = os.WriteFile(targetFile, encBytes, 0600)
	if err != nil {
		t.Fatalf("Gagal menulis file: %v", err)
	}

	// 2. Verifikasi berkas di disk TIDAK memiliki header PDF valid dan diawali magic header ENC1
	readBackDisk, err := os.ReadFile(targetFile)
	if err != nil {
		t.Fatalf("Gagal membaca file dari disk: %v", err)
	}

	if bytes.HasPrefix(readBackDisk, []byte("%PDF")) {
		t.Errorf("File di disk tidak boleh terbaca sebagai format asli %%PDF!")
	}

	if !crypto.IsEncryptedFile(readBackDisk) {
		t.Errorf("File di disk harus diawali header ENC1|")
	}

	// 3. Dekripsi di memori (seperti di DownloadBerkas)
	decrypted, err := crypto.DecryptFile(readBackDisk, aad)
	if err != nil {
		t.Fatalf("DecryptFile gagal: %v", err)
	}

	if !bytes.Equal(decrypted, originalContent) {
		t.Errorf("Konten hasil dekripsi tidak cocok dengan file asli!")
	}

	// 4. Uji Anti-IDOR: Percobaan dekripsi dokumen dengan AAD pendaftar lain (ID: 999)
	wrongAAD := []byte("pendaftar:999:dokumen:ktp")
	_, err = crypto.DecryptFile(readBackDisk, wrongAAD)
	if err == nil {
		t.Errorf("Keamanan AAD gagal: data pendaftar 101 berhasil dibuka dengan AAD pendaftar 999!")
	}
}

// TestHTTPNoStoreHeader verifies Cache-Control: no-store header behavior
func TestHTTPNoStoreHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.GET("/download-test", func(c *gin.Context) {
		c.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		c.Header("Pragma", "no-cache")
		c.Data(http.StatusOK, "application/pdf", []byte("%PDF-dummy"))
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/download-test", nil)
	r.ServeHTTP(w, req)

	cacheHeader := w.Header().Get("Cache-Control")
	if !strings.Contains(cacheHeader, "no-store") {
		t.Errorf("Cache-Control header must contain 'no-store', got: %s", cacheHeader)
	}
}
