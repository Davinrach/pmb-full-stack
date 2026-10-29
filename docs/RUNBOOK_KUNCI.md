# Runbook Operasional Manajemen Kunci & Enkripsi
**Sistem PMB STAI Cendekia Insani Situbondo**

---

## 1. Quick Reference: Variabel Kunci

Variabel environment berikut dikelola di file `.env` server backend:

| Nama Variabel | Format | Contoh Format (Dummy) | Deskripsi |
|---|---|---|---|
| `APP_ENC_KEYS` | `versi:base64,versi:base64` | `1:BASE64_KEY_1,2:BASE64_KEY_2` | Daftar kunci AES-256 yang valid untuk dekripsi & enkripsi. |
| `APP_ENC_ACTIVE_VERSION` | Angka string | `1` | Versi kunci yang saat ini aktif digunakan untuk enkripsi data baru. |
| `APP_BLIND_INDEX_KEY` | Base64 (32 byte) | `BASE64_HMAC_KEY` | Kunci HMAC terpisah khusus untuk hashing blind index pencarian persis. |

---

## 2. Prosedur Pembuatan Kunci Baru

Jalankan perintah berikut di direktori `backend/`:
```powershell
go run cmd/keygen/main.go
```
Salin baris yang dihasilkan ke file `.env`.

---

## 3. Prosedur Menjalankan Migrasi Data

### A. Uji Coba (Dry-Run / Simulasi)
```powershell
go run cmd/migrate_encrypt/main.go --dry-run
```
Memeriksa integritas dan menghitung total baris/berkas tanpa mengubah data di database atau disk.

### B. Migrasi Nyata (Live Migration)
```powershell
go run cmd/migrate_encrypt/main.go
```
Mengenkrpsi data lama yang masih berupa plaintext dan mengisi seluruh kolom blind index (`*_idx`).

---

## 4. Prosedur Rotasi Kunci (Tahunan / Insidental)

1. Buat pasangan kunci baru:
   ```powershell
   go run cmd/keygen/main.go
   ```
2. Tambahkan kunci baru ke `.env` server, misalnya menambahkan versi `2`:
   ```env
   APP_ENC_KEYS=1:<kunci_v1_lama>,2:<kunci_v2_baru>
   APP_ENC_ACTIVE_VERSION=2
   ```
3. Restart backend service PMB:
   ```powershell
   # Jika menggunakan PM2 atau service
   pm2 restart pmb-backend
   ```
4. Jalankan re-enkripsi seluruh database dan berkas ke versi `2`:
   ```powershell
   go run cmd/migrate_encrypt/main.go --rotate-keys
   ```
5. Verifikasi di database bahwa kolom NIK sudah berawalan `v2:`.

---

## 5. Prosedur Pemulihan dari Backup (Disaster Recovery)

1. Restore database MySQL dari file backup `.sql`:
   ```bash
   mysql -u root -p pmb_staici_db < backup_pmb_2026.sql
   ```
2. Pastikan file `.env` memiliki nilai `APP_ENC_KEYS` yang mencakup versi kunci saat backup dibuat (misal versi `1`).
3. Restore folder berkas fisik `./uploads`.
4. Jalankan aplikasi backend PMB. GORM hooks akan otomatis mendekripsi data saat diakses oleh pengguna yang berwenang.

---

## 6. Kontak Keamanan
Bila terdeteksi indikasi kebocoran kunci atau anomali kriptografi, segera hubungi Unit SIM & Keamanan Siber STAI Cendekia Insani Situbondo.

