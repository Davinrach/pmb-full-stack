package util

import (
	"testing"
)

// TC_WB_001: NIK valid tepat 16 digit angka
func TestValidateNIK_Valid(t *testing.T) {
	nik := "3512012345670001"
	if !ValidateNIK(nik) {
		t.Errorf("ValidateNIK(%s) = false, diharapkan true", nik)
	}
}

// TC_WB_002: NIK kurang dari 16 digit angka
func TestValidateNIK_TooShort(t *testing.T) {
	nik := "12345"
	if ValidateNIK(nik) {
		t.Errorf("ValidateNIK(%s) = true, diharapkan false", nik)
	}
}

// TC_WB_003: NIK lebih dari 16 digit angka
func TestValidateNIK_TooLong(t *testing.T) {
	nik := "351201234567000199"
	if ValidateNIK(nik) {
		t.Errorf("ValidateNIK(%s) = true, diharapkan false", nik)
	}
}

// TC_WB_004: NIK 16 karakter namun mengandung huruf atau karakter spesial
func TestValidateNIK_WithNonDigits(t *testing.T) {
	nik := "351201234567000A"
	if ValidateNIK(nik) {
		t.Errorf("ValidateNIK(%s) = true, diharapkan false", nik)
	}
}

// TC_WB_005: NIK berupa string kosong
func TestValidateNIK_Empty(t *testing.T) {
	nik := ""
	if ValidateNIK(nik) {
		t.Errorf("ValidateNIK(%s) = true, diharapkan false", nik)
	}
}

// TC_WB_006: Password valid dengan panjang >= 8 karakter
func TestValidatePasswordStrength_Valid(t *testing.T) {
	pass := "password123"
	err := ValidatePasswordStrength(pass)
	if err != nil {
		t.Errorf("ValidatePasswordStrength(%s) menghasilkan error: %v, diharapkan nil", pass, err)
	}
}

// TC_WB_007: Password tidak valid dengan panjang < 8 karakter
func TestValidatePasswordStrength_TooShort(t *testing.T) {
	pass := "pass1"
	err := ValidatePasswordStrength(pass)
	if err == nil {
		t.Errorf("ValidatePasswordStrength(%s) = nil, diharapkan error", pass)
	}
	expectedMsg := "kata sandi harus memiliki minimal 8 karakter"
	if err.Error() != expectedMsg {
		t.Errorf("Pesan error = %v, diharapkan %v", err.Error(), expectedMsg)
	}
}

// TC_WB_008: HashPassword menghasilkan hash bcrypt yang tidak kosong
func TestHashPassword_Success(t *testing.T) {
	pass := "rahasiaku123"
	hash, err := HashPassword(pass)
	if err != nil {
		t.Fatalf("HashPassword gagal: %v", err)
	}
	if len(hash) == 0 {
		t.Errorf("HashPassword menghasilkan string kosong")
	}
}

// TC_WB_009: CheckPasswordHash memverifikasi kecocokan kata sandi yang benar
func TestCheckPasswordHash_Match(t *testing.T) {
	pass := "adminpmb123"
	hash, err := HashPassword(pass)
	if err != nil {
		t.Fatalf("HashPassword gagal: %v", err)
	}

	if !CheckPasswordHash(pass, hash) {
		t.Errorf("CheckPasswordHash(%s, hash) = false, diharapkan true", pass)
	}
}

// TC_WB_010: CheckPasswordHash menolak kata sandi yang salah
func TestCheckPasswordHash_Mismatch(t *testing.T) {
	pass := "adminpmb123"
	hash, err := HashPassword(pass)
	if err != nil {
		t.Fatalf("HashPassword gagal: %v", err)
	}

	wrongPass := "passwordsalah"
	if CheckPasswordHash(wrongPass, hash) {
		t.Errorf("CheckPasswordHash(%s, hash) = true, diharapkan false", wrongPass)
	}
}
