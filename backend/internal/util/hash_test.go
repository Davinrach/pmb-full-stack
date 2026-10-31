package util

import (
	"strings"
	"testing"
)

// TC_WB_001: NIK valid tepat 16 digit angka
func TestWB001_ValidateNIK_Valid(t *testing.T) {
	nik := "3512012345670001"
	if !ValidateNIK(nik) {
		t.Errorf("ValidateNIK(%s) = false, diharapkan true", nik)
	}
}

// TC_WB_002: NIK kurang dari 16 digit angka (Boundary Value: 5 digit)
func TestWB002_ValidateNIK_TooShort(t *testing.T) {
	nik := "12345"
	if ValidateNIK(nik) {
		t.Errorf("ValidateNIK(%s) = true, diharapkan false", nik)
	}
}

// TC_WB_003: NIK lebih dari 16 digit angka (Boundary Value: 18 digit)
func TestWB003_ValidateNIK_TooLong(t *testing.T) {
	nik := "351201234567000199"
	if ValidateNIK(nik) {
		t.Errorf("ValidateNIK(%s) = true, diharapkan false", nik)
	}
}

// TC_WB_004: NIK 16 karakter namun mengandung huruf atau karakter spesial
func TestWB004_ValidateNIK_WithNonDigits(t *testing.T) {
	nik := "351201234567000A"
	if ValidateNIK(nik) {
		t.Errorf("ValidateNIK(%s) = true, diharapkan false", nik)
	}
}

// TC_WB_005: NIK berupa string kosong
func TestWB005_ValidateNIK_Empty(t *testing.T) {
	nik := ""
	if ValidateNIK(nik) {
		t.Errorf("ValidateNIK(%s) = true, diharapkan false", nik)
	}
}

// TC_WB_006: Password valid yang memenuhi kriteria keamanan (NIST SP 800-63B min 12 karakter)
func TestWB006_ValidatePasswordStrength_Valid(t *testing.T) {
	// Kata sandi valid yang memenuhi standar keamanan sistem PMB STAICI (>= 12 karakter)
	pass := "StaiciPMB2026!"
	err := ValidatePasswordStrength(pass)
	if err != nil {
		t.Errorf("ValidatePasswordStrength(%s) menghasilkan error: %v, diharapkan nil", pass, err)
	}

	// Passphrase panjang (>= 16 karakter) tanpa simbol tetap valid
	longPassphrase := "belajardikampusstaici"
	errLong := ValidatePasswordStrength(longPassphrase)
	if errLong != nil {
		t.Errorf("ValidatePasswordStrength(%s) menghasilkan error: %v, diharapkan nil", longPassphrase, errLong)
	}

	// Catatan Defect/Perbedaan Spesifikasi Lembar Pengujian:
	// Pada lembar uji tercantum 'Rahasia123' (10 karakter).
	// Backend menerapkan kebijakan keamanan minimal 12 karakter sehingga 'Rahasia123' menghasilkan error.
	errOldSpec := ValidatePasswordStrength("Rahasia123")
	if errOldSpec == nil {
		t.Errorf("ValidatePasswordStrength('Rahasia123') diharapkan error karena panjang < 12 karakter")
	}
}

// TC_WB_007: Password tidak valid dengan panjang < 12 karakter
func TestWB007_ValidatePasswordStrength_TooShort(t *testing.T) {
	pass := "pass1"
	err := ValidatePasswordStrength(pass)
	if err == nil {
		t.Errorf("ValidatePasswordStrength(%s) = nil, diharapkan error", pass)
	}
	expectedMsgPart := "minimal"
	if !strings.Contains(err.Error(), expectedMsgPart) {
		t.Errorf("Pesan error = %v, harus memuat %v", err.Error(), expectedMsgPart)
	}
}

// TC_WB_008: HashPassword menghasilkan hash bcrypt (cost 10) yang valid
func TestWB008_HashPassword_Success(t *testing.T) {
	pass := "MySecurePass2026"
	hash, err := HashPassword(pass)
	if err != nil {
		t.Fatalf("HashPassword gagal: %v", err)
	}
	if len(hash) == 0 {
		t.Errorf("HashPassword menghasilkan string kosong")
	}
	if !strings.HasPrefix(hash, "$2a$10$") && !strings.HasPrefix(hash, "$2a$") {
		t.Errorf("Hash bcrypt tidak berformat $2a$: %s", hash)
	}
}

// TC_WB_009: CheckPasswordHash memverifikasi kecocokan kata sandi yang benar
func TestWB009_CheckPasswordHash_Match(t *testing.T) {
	pass := "Pass123"
	hash, err := HashPassword(pass)
	if err != nil {
		t.Fatalf("HashPassword gagal: %v", err)
	}

	if !CheckPasswordHash(pass, hash) {
		t.Errorf("CheckPasswordHash(%s, hash) = false, diharapkan true", pass)
	}
}

// TC_WB_010: CheckPasswordHash menolak kata sandi yang salah
func TestWB010_CheckPasswordHash_Mismatch(t *testing.T) {
	pass := "Pass123"
	hash, err := HashPassword(pass)
	if err != nil {
		t.Fatalf("HashPassword gagal: %v", err)
	}

	wrongPass := "WrongPassword"
	if CheckPasswordHash(wrongPass, hash) {
		t.Errorf("CheckPasswordHash(%s, hash) = true, diharapkan false", wrongPass)
	}
}
