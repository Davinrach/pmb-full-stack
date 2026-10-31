# Laporan Hasil Pengujian Black Box - Kelompok 3: Alur Pembayaran & Bukti Transfer
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
| TC_BB_018 | Mengirim konfirmasi pembayaran melalui transfer bank manual (Jalur Reguler) | Pilih Bank Tujuan: BSI, Nama Pengirim: "Bambang Sudiro", Upload bukti bayar: `dummy_valid.pdf` | Bukti transfer berhasil dikirim, status pembayaran terupdate menjadi "Menunggu Verifikasi Admin", dan detail transaksi tercatat. | Bukti transfer berhasil diunggah (HTTP 201 Created), status pembayaran pendaftar tercatat menunggu verifikasi panitia, dan riwayat pembayaran berhasil dibuat. | Lulus | Khusus pendaftar Jalur Reguler berbayar. | Response HTTP Status 201 Created |
| TC_BB_019 | Konfirmasi pembebasan biaya pendaftaran pada halaman pembayaran Jalur KIP-Kuliah | Buka halaman `/dashboard/pembayaran` menggunakan akun pendaftar yang memilih Jalur KIP-Kuliah. | Menampilkan kartu informasi pembebasan biaya pendaftaran Rp 0 (Beasiswa KIP), tidak mewajibkan unggah bukti transfer bank. | Halaman `/dashboard/pembayaran` menampilkan banner Beasiswa KIP-Kuliah dengan tagihan Rp 0 (Bebas Biaya) dan pesan eksplisit "Konfirmasi Pembayaran Tidak Diperlukan". | Lulus | Memastikan pendaftar KIP-Kuliah tidak dibebani alur transfer manual. | `docs/evidence/evidence-TC_BB_019-kip-free-payment.png` |

---

## 2. Ringkasan Eksekusi Otomatisasi (Playwright)

- **Total Kasus Uji Dijalankan:** 2 Kasus
- **Lulus (Passed):** 2 Kasus (100%)
- **Tidak Lulus (Failed):** 0 Kasus (0%)
- **Waktu Eksekusi Suite:** ~16.9 detik
- **File Skrip Pengujian:** [blackbox-kelompok3.spec.ts](file:///c:/Users/rachd/OneDrive/Documents/Staici/frontend/tests/blackbox-kelompok3.spec.ts)
- **Direktori Bukti Screenshot:** [docs/evidence/](file:///c:/Users/rachd/OneDrive/Documents/Staici/docs/evidence)

