package crypto

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"regexp"
	"strconv"
	"strings"
	"sync"
)

const (
	KeySize          = 32 // 256-bit AES key
	NonceSize        = 12 // 96-bit standard GCM nonce
	FileMagicPrefix  = "ENC1|"
)

var (
	ErrInvalidKeySize        = errors.New("kunci kripto tidak valid: panjang kunci harus tepat 32 byte (256-bit)")
	ErrActiveKeyNotFound     = errors.New("versi kunci aktif tidak ditemukan dalam daftar kunci yang tersedia")
	ErrDecryptionFailed      = errors.New("gagal mendekripsi data: integritas atau autentikasi data tidak valid")
	ErrUnrecognizedVersion   = errors.New("versi kunci enkripsi tidak dikenal dalam sistem")
	ErrInvalidCipherFormat   = errors.New("format ciphertext tidak valid")
	ErrCryptoNotInitialized  = errors.New("modul kripto belum diinisialisasi")
	ErrInvalidBlindIndexKey  = errors.New("kunci blind index tidak valid: harus tepat 32 byte")
)

var (
	mu             sync.RWMutex
	keys           = make(map[string][]byte)
	activeVersion  string
	blindIndexKey  []byte
	isInitialized  bool
)

// InitCrypto menginisialisasi modul kriptografi dengan manajemen multi-kunci.
// Memastikan semua kunci berukuran tepat 32 byte dan versi aktif tersedia (fail-fast).
func InitCrypto(keysMap map[string][]byte, activeVer string, bIndexKey []byte) error {
	mu.Lock()
	defer mu.Unlock()

	if len(keysMap) == 0 {
		return errors.New("daftar kunci enkripsi tidak boleh kosong")
	}

	for ver, k := range keysMap {
		if len(k) != KeySize {
			return fmt.Errorf("%w: versi '%s' memiliki panjang %d byte", ErrInvalidKeySize, ver, len(k))
		}
	}

	activeVerClean := strings.TrimSpace(activeVer)
	if _, exists := keysMap[activeVerClean]; !exists {
		return fmt.Errorf("%w: versi '%s' tidak terdaftar", ErrActiveKeyNotFound, activeVerClean)
	}

	if len(bIndexKey) != KeySize {
		return fmt.Errorf("%w: panjang kunci blind index %d byte", ErrInvalidBlindIndexKey, len(bIndexKey))
	}

	// Pastikan kunci blind index terpisah dan tidak identik dengan kunci enkripsi manapun
	for ver, k := range keysMap {
		if bytes.Equal(k, bIndexKey) {
			return fmt.Errorf("kunci blind index tidak boleh sama dengan kunci enkripsi (versi '%s')", ver)
		}
	}

	keys = make(map[string][]byte)
	for k, v := range keysMap {
		copied := make([]byte, len(v))
		copy(copied, v)
		keys[k] = copied
	}

	activeVersion = activeVerClean
	blindIndexKey = make([]byte, len(bIndexKey))
	copy(blindIndexKey, bIndexKey)
	isInitialized = true

	return nil
}

// GenerateKey32 menghasilkan kunci acak 32-byte kriptografis berkekuatan tinggi menggunakan crypto/rand.
func GenerateKey32() ([]byte, error) {
	key := make([]byte, KeySize)
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		return nil, fmt.Errorf("gagal menghasilkan entropi acak: %w", err)
	}
	return key, nil
}

// GenerateBase64Key menghasilkan kunci 32-byte dalam format Base64.
func GenerateBase64Key() (string, error) {
	k, err := GenerateKey32()
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(k), nil
}

// ParseKeysFromEnv mem-parsing string konfigurasi kunci APP_ENC_KEYS.
// Format: "1:<base64-32b>,2:<base64-32b>"
func ParseKeysFromEnv(envStr string) (map[string][]byte, error) {
	result := make(map[string][]byte)
	parts := strings.Split(envStr, ",")
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		kv := strings.SplitN(part, ":", 2)
		if len(kv) != 2 {
			return nil, fmt.Errorf("format APP_ENC_KEYS salah pada bagian '%s' (harus versi:base64)", part)
		}
		ver := strings.TrimSpace(kv[0])
		rawKey, err := base64.StdEncoding.DecodeString(strings.TrimSpace(kv[1]))
		if err != nil {
			return nil, fmt.Errorf("gagal decode base64 kunci versi '%s': %w", ver, err)
		}
		if len(rawKey) != KeySize {
			return nil, fmt.Errorf("%w: versi '%s' menghasilkan %d byte", ErrInvalidKeySize, ver, len(rawKey))
		}
		result[ver] = rawKey
	}
	if len(result) == 0 {
		return nil, errors.New("tidak ada kunci valid dalam APP_ENC_KEYS")
	}
	return result, nil
}

// Encrypt mengenkripsi plaintext menggunakan AES-256-GCM dengan versi aktif saat ini.
// Nonce 12 byte dihasilkan secara acak dan unik untuk setiap panggilan.
func Encrypt(plaintext []byte, aad []byte) (version string, nonce []byte, ciphertext []byte, err error) {
	mu.RLock()
	defer mu.RUnlock()

	if !isInitialized {
		return "", nil, nil, ErrCryptoNotInitialized
	}

	key := keys[activeVersion]
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", nil, nil, fmt.Errorf("gagal membuat AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", nil, nil, fmt.Errorf("gagal inisialisasi GCM mode: %w", err)
	}

	nonce = make([]byte, NonceSize)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", nil, nil, fmt.Errorf("gagal menghasilkan nonce acak: %w", err)
	}

	// Seal membubuhkan ciphertext + 16 byte authentication tag
	ciphertext = gcm.Seal(nil, nonce, plaintext, aad)
	return activeVersion, nonce, ciphertext, nil
}

// Decrypt mendekripsi ciphertext berdasarkan versi kunci yang tersimpan.
// Memverifikasi authentication tag dan AAD secara ketat.
func Decrypt(version string, nonce []byte, ciphertext []byte, aad []byte) ([]byte, error) {
	mu.RLock()
	defer mu.RUnlock()

	if !isInitialized {
		return nil, ErrCryptoNotInitialized
	}

	key, exists := keys[version]
	if !exists {
		return nil, fmt.Errorf("%w: '%s'", ErrUnrecognizedVersion, version)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("gagal inisialisasi GCM mode: %w", err)
	}

	if len(nonce) != NonceSize {
		return nil, errors.New("panjang nonce tidak valid")
	}

	plaintext, err := gcm.Open(nil, nonce, ciphertext, aad)
	if err != nil {
		return nil, ErrDecryptionFailed
	}

	return plaintext, nil
}

// EncryptString mengenkripsi plaintext string menjadi string dengan format:
// v<versi>:<base64(nonce || ciphertext+tag)>
func EncryptString(plaintext string, aad []byte) (string, error) {
	if plaintext == "" {
		return "", nil
	}

	ver, nonce, ct, err := Encrypt([]byte(plaintext), aad)
	if err != nil {
		return "", err
	}

	combined := make([]byte, 0, len(nonce)+len(ct))
	combined = append(combined, nonce...)
	combined = append(combined, ct...)

	b64 := base64.StdEncoding.EncodeToString(combined)
	return fmt.Sprintf("v%s:%s", ver, b64), nil
}

// DecryptString mendekripsi format v<versi>:<base64(nonce || ciphertext+tag)>
// Jika string bukan format terenkripsi (misal data legasi), mengembalikan error ErrInvalidCipherFormat.
func DecryptString(cipherStr string, aad []byte) (string, error) {
	if cipherStr == "" {
		return "", nil
	}

	if !IsEncryptedString(cipherStr) {
		return "", ErrInvalidCipherFormat
	}

	// Format: v<versi>:<base64>
	parts := strings.SplitN(cipherStr, ":", 2)
	if len(parts) != 2 {
		return "", ErrInvalidCipherFormat
	}

	ver := strings.TrimPrefix(parts[0], "v")
	combined, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		return "", fmt.Errorf("%w: base64 decode gagal", ErrInvalidCipherFormat)
	}

	if len(combined) < NonceSize {
		return "", fmt.Errorf("%w: payload terlalu pendek", ErrInvalidCipherFormat)
	}

	nonce := combined[:NonceSize]
	ciphertext := combined[NonceSize:]

	pt, err := Decrypt(ver, nonce, ciphertext, aad)
	if err != nil {
		return "", err
	}

	return string(pt), nil
}

var versionFormatRegex = regexp.MustCompile(`^v[0-9]+:`)

// IsEncryptedString memeriksa apakah string memiliki format v<versi>:<base64...>
func IsEncryptedString(str string) bool {
	return versionFormatRegex.MatchString(str)
}

// NormalizeForBlindIndex menormalkan input sebelum di-hash:
// - Trim spasi di awal dan akhir
// - Jika berupa digit angka (misal NIK / no KK), buang seluruh karakter non-digit
// - Untuk teks umum, ubah menjadi huruf kecil (lowercase)
func NormalizeForBlindIndex(value string) string {
	clean := strings.TrimSpace(value)
	// Jika terdiri dari digit angka atau ada strip/spasi di nomor identitas
	digitsOnly := regexp.MustCompile(`[^0-9]`).ReplaceAllString(clean, "")
	if len(digitsOnly) >= 10 && len(digitsOnly) <= 20 {
		return digitsOnly
	}
	return strings.ToLower(clean)
}

// BlindIndex menghitung hash deterministik HMAC-SHA256 dari nilai yang telah dinormalisasi.
// Hasilnya berupa string heksadesimal 64 karakter yang aman untuk pencarian persis dan indeks UNIQUE.
func BlindIndex(value string) string {
	mu.RLock()
	defer mu.RUnlock()

	if !isInitialized || len(blindIndexKey) == 0 {
		return ""
	}

	norm := NormalizeForBlindIndex(value)
	if norm == "" {
		return ""
	}

	h := hmac.New(sha256.New, blindIndexKey)
	h.Write([]byte(norm))
	return hex.EncodeToString(h.Sum(nil))
}

// EncryptFile mengenkripsi byte dokumen file fisik dengan header format:
// ENC1|v<versi>|<nonce 12-byte><ciphertext+tag>
func EncryptFile(fileBytes []byte, aad []byte) ([]byte, error) {
	ver, nonce, ct, err := Encrypt(fileBytes, aad)
	if err != nil {
		return nil, err
	}

	header := fmt.Sprintf("%sv%s|", FileMagicPrefix, ver)
	var buf bytes.Buffer
	buf.WriteString(header)
	buf.Write(nonce)
	buf.Write(ct)

	return buf.Bytes(), nil
}

// IsEncryptedFile memeriksa apakah data file diawali dengan magic header ENC1|
func IsEncryptedFile(data []byte) bool {
	return bytes.HasPrefix(data, []byte(FileMagicPrefix))
}

// DecryptFile mendekripsi byte file berheader ENC1|v<versi>|... di memori.
func DecryptFile(data []byte, aad []byte) ([]byte, error) {
	if !IsEncryptedFile(data) {
		return nil, errors.New("file tidak memiliki header enkripsi ENC1")
	}

	// Parsing header: ENC1|v<versi>|
	prefixLen := len(FileMagicPrefix)
	rest := data[prefixLen:]

	pipeIdx := bytes.IndexByte(rest, '|')
	if pipeIdx == -1 {
		return nil, errors.New("format header file terenkripsi korup")
	}

	verStr := string(rest[:pipeIdx])
	ver := strings.TrimPrefix(verStr, "v")
	payload := rest[pipeIdx+1:]

	if len(payload) < NonceSize {
		return nil, errors.New("ukuran payload file terenkripsi terlalu kecil")
	}

	nonce := payload[:NonceSize]
	ciphertext := payload[NonceSize:]

	return Decrypt(ver, nonce, ciphertext, aad)
}

// MaskNIK menyamarkan 16-digit NIK menjadi format 3512********0001
func MaskNIK(nik string) string {
	clean := strings.TrimSpace(nik)
	if len(clean) == 16 {
		return clean[:4] + "********" + clean[12:]
	}
	if len(clean) > 8 {
		prefix := clean[:2]
		suffix := clean[len(clean)-2:]
		return prefix + strings.Repeat("*", len(clean)-4) + suffix
	}
	if len(clean) > 0 {
		return strings.Repeat("*", len(clean))
	}
	return ""
}

// GetActiveVersion mengembalikan versi kunci aktif saat ini
func GetActiveVersion() string {
	mu.RLock()
	defer mu.RUnlock()
	return activeVersion
}

// GetKeyCount mengembalikan jumlah kunci yang terdaftar
func GetKeyCount() int {
	mu.RLock()
	defer mu.RUnlock()
	return len(keys)
}

// ReEncryptString mengenkripsi ulang string dari versi lama ke versi aktif saat ini (untuk rotasi kunci)
func ReEncryptString(cipherStr string, oldAAD, newAAD []byte) (string, bool, error) {
	if cipherStr == "" || !IsEncryptedString(cipherStr) {
		return cipherStr, false, nil
	}

	parts := strings.SplitN(cipherStr, ":", 2)
	ver := strings.TrimPrefix(parts[0], "v")

	mu.RLock()
	currentActive := activeVersion
	mu.RUnlock()

	// Jika sudah berada pada versi aktif dan AAD sama, tidak perlu diubah
	if ver == currentActive && bytes.Equal(oldAAD, newAAD) {
		return cipherStr, false, nil
	}

	plaintext, err := DecryptString(cipherStr, oldAAD)
	if err != nil {
		return "", false, fmt.Errorf("gagal dekripsi saat rotasi: %w", err)
	}

	newCipher, err := EncryptString(plaintext, newAAD)
	if err != nil {
		return "", false, fmt.Errorf("gagal enkripsi ulang saat rotasi: %w", err)
	}

	return newCipher, true, nil
}

// ValidateVersionNumber memastikan string versi berupa integer valid
func ValidateVersionNumber(ver string) bool {
	_, err := strconv.Atoi(strings.TrimSpace(ver))
	return err == nil
}

