package util

import (
	"regexp"
	"testing"

	"pmb-staici-backend/internal/config"
)

func TestGenerateOTP(t *testing.T) {
	otp := GenerateOTP()
	if len(otp) != 6 {
		t.Errorf("GenerateOTP() menghasilkan panjang %d, diharapkan 6", len(otp))
	}
	matched, _ := regexp.MatchString(`^[0-9]{6}$`, otp)
	if !matched {
		t.Errorf("GenerateOTP() menghasilkan karakter non-angka: %s", otp)
	}
}

func TestSendVerificationOTPEmail_Simulation(t *testing.T) {
	cfg := &config.Config{
		SMTPHost: "", // Kosong memicu simulation mode
		SMTPUser: "",
		SMTPPass: "",
	}

	err := SendVerificationOTPEmail(cfg, "test@example.com", "Test User", "123456")
	if err != nil {
		t.Errorf("SendVerificationOTPEmail dalam mode simulasi gagal: %v", err)
	}
}

func TestSendPasswordResetEmail_Simulation(t *testing.T) {
	cfg := &config.Config{
		SMTPHost: "", // Kosong memicu simulation mode
		SMTPUser: "",
		SMTPPass: "",
	}

	err := SendPasswordResetEmail(cfg, "test@example.com", "Test User", "reset_token_dummy")
	if err != nil {
		t.Errorf("SendPasswordResetEmail dalam mode simulasi gagal: %v", err)
	}
}
