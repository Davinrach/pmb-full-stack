# Laporan Hasil Pengujian Black Box - Kelompok 1: Navigasi, Informasi Publik, & Landing Page
**Sistem Penerimaan Mahasiswa Baru (PMB) STAI Cendekia Insani Situbondo**  
**Tanggal Pengujian:** 31 Oktober 2026  
**Lingkungan Uji:** 
- Frontend: Next.js (App Router, TypeScript) `http://localhost:3000`
- Backend: Go / Gin REST API `http://localhost:8080`
- Database: MySQL (XAMPP Daemon) `localhost:3306` (Database: `pmb_staici_db`)
- Framework Uji: Playwright v1.56+ (Engine: Chromium headless)

---

## 1. Tabel Hasil Pengujian (Siap Disalin ke Excel)

| ID Kasus Uji | Skenario Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status (Lulus/Tidak Lulus) | Catatan | Lokasi Bukti (Screenshot / Trace) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC_BB_001 | Mengakses halaman utama website PMB STAICI | URL: `http://localhost:3000/` | Halaman utama menampilkan informasi PMB, menu navigasi, profil 3 prodi (MPI, AS, KPI), dan banner pengumuman sesuai konfigurasi aktif. | Halaman utama termuat sempurna; menampilkan banner hero, informasi pendaftaran, navigasi, dan kartu ketiga prodi unggulan (MPI, AS, KPI) lengkap dengan tombol Lihat Detail. | Lulus | Tampilan responsif dan konten dinamis terintegrasi. | `docs/evidence/evidence-TC_BB_001-landing-page.png` |
| TC_BB_002 | Membuka detail program studi yang terdaftar | Pilih program studi MPI, AS, atau KPI. Contoh URL: `/program-studi/mpi` | Sistem menampilkan detail program studi lengkap (profil lulusan, prospek karir, kurikulum, dan gelar akademik S.Pd./S.H./S.Sos.). | Halaman prodi MPI menampilkan detail lengkap: judul prodi, deskripsi, gelar akademik Sarjana Pendidikan (S.Pd.), prospek karir, dan kurikulum. | Lulus | Kontrak data prodi sinkron antara frontend dan database. | `docs/evidence/evidence-TC_BB_002-detail-prodi-mpi.png` |
| TC_BB_003 | Mengakses halaman program studi dengan slug tidak terdaftar | URL: `/program-studi/teknik-mesin` | Sistem menampilkan halaman 404 Not Found secara elegan tanpa menyebabkan crash atau unhandled error. | Sistem merender tampilan 404 Not Found standar Next.js secara elegan tanpa terjadi uncaught exception atau crash pada aplikasi. | Lulus | Graceful error handling untuk alamat rute yang tidak valid. | `docs/evidence/evidence-TC_BB_003-prodi-404.png` |

---

## 2. Ringkasan Eksekusi Otomatisasi (Playwright)

- **Total Kasus Uji Dijalankan:** 3 Kasus
- **Lulus (Passed):** 3 Kasus (100%)
- **Tidak Lulus (Failed):** 0 Kasus (0%)
- **Waktu Eksekusi Suite:** ~27.6 detik
- **File Skrip Pengujian:** [blackbox-kelompok1.spec.ts](file:///c:/Users/rachd/OneDrive/Documents/Staici/frontend/tests/blackbox-kelompok1.spec.ts)
- **Direktori Bukti Screenshot:** [docs/evidence/](file:///c:/Users/rachd/OneDrive/Documents/Staici/docs/evidence)

