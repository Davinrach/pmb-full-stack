package util

import (
	"errors"
	"regexp"
	"strings"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes plain text password using bcrypt (cost 10)
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

// CheckPasswordHash compares hash with candidate password
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Common leaked or easily guessable passwords (lowercase)
var commonLeakedPasswords = map[string]bool{
	"password1234":    true,
	"password12345":   true,
	"password123456":  true,
	"123456789012":    true,
	"1234567890123":   true,
	"qwertyuiopas":    true,
	"qwertyuiopasd":   true,
	"admin12345678":   true,
	"administrator":   true,
	"staici1234567":   true,
	"staicisitubondo": true,
	"situbondo1234":   true,
	"mahasiswabaru":   true,
	"mahasiswastaici": true,
	"rahasia123456":   true,
	"bismillah1234":   true,
	"indonesia1234":   true,
	"welcome123456":   true,
	"iloveyou12345":   true,
	"letmein123456":   true,
	"sunshine12345":   true,
}

// ValidatePasswordStrength checks if password meets security standards:
// - Minimal 12 karakter.
// - Menolak password umum / bocor / karakter berulang.
// - Fleksibel (NIST SP 800-63B): jika >= 16 karakter (passphrase panjang yang kuat), tidak wajib kombinasi kaku.
// - Jika 12 - 15 karakter, wajib memadukan minimal 2 kategori karakter (huruf besar/kecil, angka, simbol).
func ValidatePasswordStrength(password string) error {
	trimmed := strings.TrimSpace(password)

	// 1. Minimal 12 karakter
	if len(trimmed) < 12 {
		return errors.New("kata sandi harus memiliki minimal 12 karakter")
	}

	// 2. Cek password umum / bocor
	lowered := strings.ToLower(trimmed)
	if commonLeakedPasswords[lowered] {
		return errors.New("kata sandi terlalu umum atau berisiko mudah ditebak, silakan gunakan kombinasi lain")
	}

	// 3. Cek karakter tunggal berulang (misal aaaaaaaaaaaa)
	allSame := true
	for i := 1; i < len(trimmed); i++ {
		if trimmed[i] != trimmed[0] {
			allSame = false
			break
		}
	}
	if allSame {
		return errors.New("kata sandi tidak boleh hanya terdiri dari satu karakter yang diulang")
	}

	// 4. Hitung keragaman kategori karakter
	var hasLower, hasUpper, hasDigit, hasSpecial bool
	for _, ch := range trimmed {
		switch {
		case unicode.IsLower(ch):
			hasLower = true
		case unicode.IsUpper(ch):
			hasUpper = true
		case unicode.IsDigit(ch):
			hasDigit = true
		default:
			hasSpecial = true
		}
	}

	categories := 0
	if hasLower {
		categories++
	}
	if hasUpper {
		categories++
	}
	if hasDigit {
		categories++
	}
	if hasSpecial {
		categories++
	}

	// Jika panjang >= 16 karakter (passphrase panjang):
	// Tidak mewajibkan kombinasi simbol secara kaku (NIST SP 800-63B).
	if len(trimmed) >= 16 {
		return nil
	}

	// Jika 12 - 15 karakter: minimal 2 kategori karakter
	if categories < 2 {
		return errors.New("untuk kata sandi di bawah 16 karakter, kombinasikan minimal 2 jenis karakter (huruf besar/kecil, angka, atau simbol)")
	}

	return nil
}

// ValidateNIK checks if NIK has exactly 16 digits
func ValidateNIK(nik string) bool {
	match, _ := regexp.MatchString(`^[0-9]{16}$`, nik)
	return match
}
