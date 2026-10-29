package config

import (
	"encoding/base64"
	"log"
	"os"
	"strings"

	"pmb-staici-backend/internal/crypto"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort             string
	AppEnv              string
	DBUser              string
	DBPassword          string
	DBHost              string
	DBPort              string
	DBName              string
	JWTSecret           string
	UploadDir           string
	SMTPHost            string
	SMTPPort            string
	SMTPUser            string
	SMTPPass            string
	SMTPFrom            string
	SMTPFromName        string
	AppEncKeys          string
	AppEncActiveVersion string
	AppBlindIndexKey    string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("Note: .env file not found, using system environment variables")
	}

	getEnv := func(key, defaultValue string) string {
		if val, exists := os.LookupEnv(key); exists && val != "" {
			return val
		}
		return defaultValue
	}

	cfg := &Config{
		AppPort:             getEnv("PORT", "8080"),
		AppEnv:              getEnv("APP_ENV", "development"),
		DBUser:              getEnv("DB_USER", "root"),
		DBPassword:          getEnv("DB_PASSWORD", ""),
		DBHost:              getEnv("DB_HOST", "127.0.0.1"),
		DBPort:              getEnv("DB_PORT", "3306"),
		DBName:              getEnv("DB_NAME", "pmb_staici_db"),
		JWTSecret:           getEnv("JWT_SECRET", "staici-secret-pmb-token-key-2026"),
		UploadDir:           getEnv("UPLOAD_DIR", "./uploads"),
		SMTPHost:            getEnv("SMTP_HOST", ""),
		SMTPPort:            getEnv("SMTP_PORT", "587"),
		SMTPUser:            getEnv("SMTP_USER", ""),
		SMTPPass:            getEnv("SMTP_PASS", ""),
		SMTPFrom:            getEnv("SMTP_FROM", "pmb@staici.ac.id"),
		SMTPFromName:        getEnv("SMTP_FROM_NAME", "PMB STAI Cendekia Insani"),
		AppEncKeys:          getEnv("APP_ENC_KEYS", ""),
		AppEncActiveVersion: getEnv("APP_ENC_ACTIVE_VERSION", "1"),
		AppBlindIndexKey:    getEnv("APP_BLIND_INDEX_KEY", ""),
	}

	// Inisialisasi & Validasi Kripto Fail-Fast
	if cfg.AppEncKeys == "" || cfg.AppBlindIndexKey == "" {
		log.Fatalf("FATAL: Variabel APP_ENC_KEYS dan APP_BLIND_INDEX_KEY wajib disetel pada environment/.env.\nJalankan 'go run cmd/keygen/main.go' untuk menghasilkan kunci acak 32-byte.")
	}

	keysMap, err := crypto.ParseKeysFromEnv(cfg.AppEncKeys)
	if err != nil {
		log.Fatalf("FATAL: Format kunci APP_ENC_KEYS tidak valid: %v", err)
	}

	blindKeyBytes, err := base64.StdEncoding.DecodeString(strings.TrimSpace(cfg.AppBlindIndexKey))
	if err != nil {
		log.Fatalf("FATAL: APP_BLIND_INDEX_KEY gagal di-decode dari base64: %v", err)
	}

	if err := crypto.InitCrypto(keysMap, cfg.AppEncActiveVersion, blindKeyBytes); err != nil {
		log.Fatalf("FATAL: Inisialisasi modul kripto gagal: %v", err)
	}

	log.Printf("✓ Modul Kripto AES-256-GCM siap (Versi Aktif: v%s, Jumlah Kunci: %d)",
		crypto.GetActiveVersion(), crypto.GetKeyCount())

	return cfg
}
