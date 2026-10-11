package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort      string
	AppEnv       string
	DBUser       string
	DBPassword   string
	DBHost       string
	DBPort       string
	DBName       string
	JWTSecret    string
	UploadDir    string
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPass     string
	SMTPFrom     string
	SMTPFromName string
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

	return &Config{
		AppPort:      getEnv("PORT", "8080"),
		AppEnv:       getEnv("APP_ENV", "development"),
		DBUser:       getEnv("DB_USER", "root"),
		DBPassword:   getEnv("DB_PASSWORD", ""),
		DBHost:       getEnv("DB_HOST", "127.0.0.1"),
		DBPort:       getEnv("DB_PORT", "3306"),
		DBName:       getEnv("DB_NAME", "pmb_staici_db"),
		JWTSecret:    getEnv("JWT_SECRET", "staici-secret-pmb-token-key-2026"),
		UploadDir:    getEnv("UPLOAD_DIR", "./uploads"),
		SMTPHost:     getEnv("SMTP_HOST", ""),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPass:     getEnv("SMTP_PASS", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "pmb@staici.ac.id"),
		SMTPFromName: getEnv("SMTP_FROM_NAME", "PMB STAI Cendekia Insani"),
	}
}
