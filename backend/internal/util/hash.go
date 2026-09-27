package util

import (
	"errors"
	"regexp"

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

// ValidatePasswordStrength checks if password meets security requirements (min 8 characters)
func ValidatePasswordStrength(password string) error {
	if len(password) < 8 {
		return errors.New("kata sandi harus memiliki minimal 8 karakter")
	}
	return nil
}

// ValidateNIK checks if NIK has exactly 16 digits
func ValidateNIK(nik string) bool {
	match, _ := regexp.MatchString(`^[0-9]{16}$`, nik)
	return match
}
