package crypto

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"io"
	"strings"
	"testing"
)

func setupTestCrypto(t *testing.T) {
	t.Helper()
	key1, _ := GenerateKey32()
	key2, _ := GenerateKey32()
	bIndexKey, _ := GenerateKey32()

	keysMap := map[string][]byte{
		"1": key1,
		"2": key2,
	}

	err := InitCrypto(keysMap, "1", bIndexKey)
	if err != nil {
		t.Fatalf("InitCrypto failed: %v", err)
	}
}

func TestRoundTripEncryptDecrypt(t *testing.T) {
	setupTestCrypto(t)

	plaintext := "3512011203020001"
	aad := []byte("users:nik:user-uuid-123")

	ciphertext, err := EncryptString(plaintext, aad)
	if err != nil {
		t.Fatalf("EncryptString failed: %v", err)
	}

	if !strings.HasPrefix(ciphertext, "v1:") {
		t.Errorf("Expected prefix 'v1:', got %s", ciphertext)
	}

	decrypted, err := DecryptString(ciphertext, aad)
	if err != nil {
		t.Fatalf("DecryptString failed: %v", err)
	}

	if decrypted != plaintext {
		t.Errorf("Decrypted '%s' does not match plaintext '%s'", decrypted, plaintext)
	}
}

func TestNonceRandomness(t *testing.T) {
	setupTestCrypto(t)

	plaintext := "3512011203020001"
	aad := []byte("users:nik:user-uuid-123")

	c1, err := EncryptString(plaintext, aad)
	if err != nil {
		t.Fatalf("c1 failed: %v", err)
	}

	c2, err := EncryptString(plaintext, aad)
	if err != nil {
		t.Fatalf("c2 failed: %v", err)
	}

	if c1 == c2 {
		t.Errorf("Ciphertexts should not be identical for same plaintext! Reused nonce detected.")
	}
}

func TestTamperDetection(t *testing.T) {
	setupTestCrypto(t)

	plaintext := "3512011203020001"
	aad := []byte("users:nik:user-uuid-123")

	cipherStr, err := EncryptString(plaintext, aad)
	if err != nil {
		t.Fatalf("EncryptString failed: %v", err)
	}

	// 1. Alter AAD
	wrongAAD := []byte("users:nik:user-uuid-999")
	_, err = DecryptString(cipherStr, wrongAAD)
	if err == nil {
		t.Errorf("Expected decryption failure when AAD is altered, but succeeded!")
	}

	// 2. Alter Ciphertext byte
	parts := strings.SplitN(cipherStr, ":", 2)
	rawBytes, _ := base64.StdEncoding.DecodeString(parts[1])
	rawBytes[len(rawBytes)-1] ^= 0xFF // Flip last byte of tag
	tamperedStr := parts[0] + ":" + base64.StdEncoding.EncodeToString(rawBytes)

	_, err = DecryptString(tamperedStr, aad)
	if err == nil {
		t.Errorf("Expected decryption failure when ciphertext/tag is tampered, but succeeded!")
	}

	// 3. Alter Nonce byte
	rawBytes2, _ := base64.StdEncoding.DecodeString(parts[1])
	rawBytes2[0] ^= 0x01 // Flip nonce byte
	tamperedNonceStr := parts[0] + ":" + base64.StdEncoding.EncodeToString(rawBytes2)

	_, err = DecryptString(tamperedNonceStr, aad)
	if err == nil {
		t.Errorf("Expected decryption failure when nonce is tampered, but succeeded!")
	}
}

func TestKeyRotationDecryption(t *testing.T) {
	setupTestCrypto(t)

	plaintext := "3512011203020001"
	aad := []byte("users:nik:uuid-rotate-test")

	// Encrypted under active version 1
	c1, err := EncryptString(plaintext, aad)
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	// Now switch active version to 2
	mu.Lock()
	activeVersion = "2"
	mu.Unlock()

	// Should still decrypt c1 (which was encrypted with v1) seamlessly
	dec1, err := DecryptString(c1, aad)
	if err != nil {
		t.Fatalf("Failed to decrypt v1 data after active version changed to 2: %v", err)
	}
	if dec1 != plaintext {
		t.Errorf("Expected %s, got %s", plaintext, dec1)
	}

	// ReEncryptString should upgrade c1 to v2
	c2, reEncrypted, err := ReEncryptString(c1, aad, aad)
	if err != nil {
		t.Fatalf("ReEncryptString failed: %v", err)
	}
	if !reEncrypted {
		t.Errorf("Expected reEncrypted=true")
	}
	if !strings.HasPrefix(c2, "v2:") {
		t.Errorf("Expected upgraded ciphertext to start with v2:, got %s", c2)
	}

	dec2, err := DecryptString(c2, aad)
	if err != nil {
		t.Fatalf("Decrypting v2 ciphertext failed: %v", err)
	}
	if dec2 != plaintext {
		t.Errorf("Expected %s, got %s", plaintext, dec2)
	}
}

func TestInvalidKeyValidation(t *testing.T) {
	shortKey := make([]byte, 16)
	bKey, _ := GenerateKey32()

	err := InitCrypto(map[string][]byte{"1": shortKey}, "1", bKey)
	if err == nil {
		t.Errorf("Expected error for 16-byte key, but got nil")
	}

	goodKey, _ := GenerateKey32()
	// Active version doesn't exist
	err = InitCrypto(map[string][]byte{"1": goodKey}, "99", bKey)
	if err == nil {
		t.Errorf("Expected error when active version '99' does not exist in keys")
	}

	// Blind index key equals encryption key (must be rejected)
	err = InitCrypto(map[string][]byte{"1": goodKey}, "1", goodKey)
	if err == nil {
		t.Errorf("Expected error when blind index key equals encryption key, but got nil")
	}
}

func TestBlindIndex(t *testing.T) {
	setupTestCrypto(t)

	nik1 := "3512011203020001"
	nik1Formatted := " 3512-0112-0302-0001 "
	nik2 := "3512011203020002"

	idx1 := BlindIndex(nik1)
	idx1Fmt := BlindIndex(nik1Formatted)
	idx2 := BlindIndex(nik2)

	if len(idx1) != 64 {
		t.Errorf("Expected 64 hex characters for SHA-256 HMAC blind index, got %d", len(idx1))
	}

	if idx1 != idx1Fmt {
		t.Errorf("BlindIndex should normalize spaces and dashes: %s vs %s", idx1, idx1Fmt)
	}

	if idx1 == idx2 {
		t.Errorf("Different NIKs must produce different blind indexes!")
	}
}

func TestFileEncryptionRoundTrip(t *testing.T) {
	setupTestCrypto(t)

	// Simulate a 2 MB file (dummy PDF header)
	fileSize := 2 * 1024 * 1024 // 2 MB
	dummyFile := make([]byte, fileSize)
	copy(dummyFile, []byte("%PDF-1.4\n%DUMMY-KTP-CONTENT..."))
	_, _ = io.ReadFull(rand.Reader, dummyFile[100:])

	aad := []byte("pendaftar:42:dokumen:ktp")

	encFile, err := EncryptFile(dummyFile, aad)
	if err != nil {
		t.Fatalf("EncryptFile failed: %v", err)
	}

	if !IsEncryptedFile(encFile) {
		t.Errorf("Expected IsEncryptedFile to return true")
	}

	if bytes.HasPrefix(encFile, []byte("%PDF")) {
		t.Errorf("Encrypted file on disk must NOT leak plaintext PDF signature!")
	}

	// Decrypt
	decFile, err := DecryptFile(encFile, aad)
	if err != nil {
		t.Fatalf("DecryptFile failed: %v", err)
	}

	if !bytes.Equal(dummyFile, decFile) {
		t.Errorf("Decrypted file content does not match original file!")
	}

	// Tampered AAD
	_, err = DecryptFile(encFile, []byte("pendaftar:99:dokumen:ktp"))
	if err == nil {
		t.Errorf("Expected DecryptFile to fail with wrong AAD!")
	}
}

func TestMaskNIK(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"3512011203020001", "3512********0001"},
		{"1234567890", "12******90"},
		{"admin", "*****"},
		{"", ""},
	}

	for _, tc := range tests {
		res := MaskNIK(tc.input)
		if res != tc.expected {
			t.Errorf("MaskNIK(%s) = '%s', expected '%s'", tc.input, res, tc.expected)
		}
	}
}

// Benchmarks for skripsi & performance documentation
func BenchmarkEncryptNIK(b *testing.B) {
	setupTestCrypto(&testing.T{})
	nik := "3512011203020001"
	aad := []byte("users:nik:benchmark-uuid")

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = EncryptString(nik, aad)
	}
}

func BenchmarkDecryptNIK(b *testing.B) {
	setupTestCrypto(&testing.T{})
	nik := "3512011203020001"
	aad := []byte("users:nik:benchmark-uuid")
	c, _ := EncryptString(nik, aad)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = DecryptString(c, aad)
	}
}

func BenchmarkBlindIndex(b *testing.B) {
	setupTestCrypto(&testing.T{})
	nik := "3512011203020001"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = BlindIndex(nik)
	}
}

func BenchmarkEncryptFile2MB(b *testing.B) {
	setupTestCrypto(&testing.T{})
	data := make([]byte, 2*1024*1024)
	_, _ = io.ReadFull(rand.Reader, data)
	aad := []byte("pendaftar:1:dokumen:ktp")

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = EncryptFile(data, aad)
	}
}

func BenchmarkDecryptFile2MB(b *testing.B) {
	setupTestCrypto(&testing.T{})
	data := make([]byte, 2*1024*1024)
	_, _ = io.ReadFull(rand.Reader, data)
	aad := []byte("pendaftar:1:dokumen:ktp")
	enc, _ := EncryptFile(data, aad)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = DecryptFile(enc, aad)
	}
}
