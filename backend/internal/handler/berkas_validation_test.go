package handler

import (
	"testing"
)

// TC_WB_019: Validasi batas ukuran berkas fisik (MaxFileSize = 2MB)
func TestWB019_Berkas_MaxFileSizeLimit(t *testing.T) {
	validSize := int64(1.5 * 1024 * 1024)   // 1.5 MB
	exceededSize := int64(2.5 * 1024 * 1024) // 2.5 MB

	if validSize > MaxFileSize {
		t.Errorf("Ukuran berkas 1.5MB salah terdeteksi melebihi MaxFileSize (%d > %d)", validSize, MaxFileSize)
	}

	if exceededSize <= MaxFileSize {
		t.Errorf("Ukuran berkas 2.5MB tidak terdeteksi melebihi MaxFileSize (%d <= %d)", exceededSize, MaxFileSize)
	}
}

// TC_WB_020: Validasi format whitelist MIME-Type berkas unggahan
func TestWB020_Berkas_AllowedMimeTypes(t *testing.T) {
	validTypes := []string{"image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"}
	invalidTypes := []string{"application/x-msdownload", "application/x-sh", "text/php", "application/octet-stream"}

	for _, mime := range validTypes {
		if !allowedMimeTypes[mime] {
			t.Errorf("MIME valid %s ditolak oleh whitelist", mime)
		}
	}

	for _, mime := range invalidTypes {
		if allowedMimeTypes[mime] {
			t.Errorf("MIME berbahaya/tidak valid %s diterima oleh whitelist", mime)
		}
	}
}
