# Laporan Hasil Pengujian Black Box - Tahap 1
**Sistem Penerimaan Mahasiswa Baru (PMB) STAI Cendekia Insani Situbondo**  
**Tanggal Pengujian:** 29 Oktober 2026  
**Lingkungan Uji:** 
- Frontend: Next.js (App Router, TypeScript) `http://localhost:3000`
- Backend: Go / Gin REST API `http://localhost:8080`
- Database: MySQL (XAMPP Daemon) `localhost:3306`
- Framework Uji: Playwright v1.56+ (Engine: Chromium headless)

---

## 1. Tabel Hasil Pengujian (Siap Disalin ke Excel)

| ID Kasus Uji | Skenario Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status (Lulus/Tidak Lulus) | Catatan | Lokasi Bukti (Screenshot / Trace) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC_BB_005 | Registrasi akun dengan format NIK tidak valid (< 16 digit atau huruf) | NIK: "12345" (< 16 digit) dan "351201234567000A" (mengandung huruf) | Sistem menolak registrasi dan menampilkan pesan kesalahan bahwa NIK harus terdiri dari 16 digit angka, baik pada validasi UI sisi klien maupun validasi API backend. | Frontend memfilter karakter non-digit secara realtime dan memvalidasi panjang NIK. Saat disubmit dengan NIK < 16 digit, UI menampilkan peringatan merah "NIK harus terdiri dari 16 digit angka sesuai KTP/KK." Endpoint backend POST /api/v1/auth/register menolak dengan HTTP 400 Bad Request ("NIK harus terdiri dari 16 digit angka"). | Lulus | Validasi bekerja berlapis di client-side (Next.js) dan server-side (Go/Gin). Input huruf ditolak otomatis oleh sanitasi regex. | `docs/evidence/evidence-TC_BB_005-short-nik.png` |
| TC_BB_008 | Login calon mahasiswa menggunakan kata sandi salah | Email/NIK: "fauzi.ridwan@example.com", Kata Sandi Salah: "PasswordSalah123!" | Sistem menolak login, menampilkan pesan kesalahan generik tanpa mengungkap informasi akun secara berlebihan. | Sistem menolak autentikasi, status HTTP 401 Unauthorized diterima dari backend, dan UI menampilkan pesan kesalahan: "Email/NIK atau kata sandi tidak valid. Silakan periksa kembali." Pengguna tetap berada di halaman login. | Lulus | Mencegah eksploitasi User Enumeration Attack dengan menggunakan respons generik yang aman. | `docs/evidence/evidence-TC_BB_008-wrong-password.png` |
| TC_BB_009 | Mengakses dashboard calon mahasiswa tanpa login (Unauthenticated) | Buka URL langsung: `http://localhost:3000/dashboard` tanpa memiliki token/sesi login | Sistem menolak akses dan secara otomatis mengarahkan (redirect) pengguna ke halaman login. | Browser langsung dialihkan (redirect) oleh middleware autentikasi ke URL `/login?redirect=%2Fdashboard`. Dashboard privat terlindungi dari akses anonim. | Lulus | Perlindungan route guard Next.js dan middleware bekerja sesuai spesifikasi keamanan. | `docs/evidence/evidence-TC_BB_009-unauth-dashboard.png` |
| TC_BB_023 | Mengakses portal admin CMS tanpa login | Buka URL langsung: `http://localhost:3000/admincms` tanpa sesi login administrator | Sistem menolak akses dan secara otomatis me-redirect pengguna ke halaman login admin (/loginadmin). | Pengguna langsung diarahkan (redirect) ke `/loginadmin` secara otomatis. Area administrasi dan data pendaftar tidak dapat diakses tanpa sesi admin yang valid. | Lulus | Isolasi portal admin berfungsi sempurna, mencegah akses ilegal ke modul pengelolaan PMB. | `docs/evidence/evidence-TC_BB_023-unauth-admincms.png` |
| TC_BB_035 | Calon mahasiswa mencoba mengakses API khusus admin (Privilege Escalation) | Token JWT Calon Mahasiswa (role: calon_mahasiswa), memanggil GET `/api/v1/admin/pendaftar` | Backend menolak permintaan dengan HTTP Status 403 Forbidden dan respons penolakan otorisasi. | Backend mengembalikan HTTP 403 Forbidden dengan payload JSON `{"success": false, "error": {"code": "FORBIDDEN", "message": "Akses ditolak: role calon_mahasiswa tidak memiliki izin untuk resource ini"}}`. | Lulus | Role-Based Access Control (RBAC) pada middleware `RequireRole(Admin)` di Go backend berjalan efektif menolak eskalasi hak akses. | Response HTTP Status 403 Forbidden |

---

## 2. Ringkasan Eksekusi Otomatisasi (Playwright)

- **Total Kasus Uji Dijalankan:** 5
- **Lulus (Passed):** 5 (100%)
- **Gagal (Failed):** 0 (0%)
- **Waktu Eksekusi:** 19.5 detik
- **File Skrip Pengujian:** [blackbox-tahap1.spec.ts](file:///c:/Users/rachd/OneDrive/Documents/Staici/frontend/tests/blackbox-tahap1.spec.ts)
- **Konfigurasi Uji:** [playwright.config.ts](file:///c:/Users/rachd/OneDrive/Documents/Staici/frontend/playwright.config.ts)
- **Direktori Bukti Screenshot:** [docs/evidence/](file:///c:/Users/rachd/OneDrive/Documents/Staici/docs/evidence)

