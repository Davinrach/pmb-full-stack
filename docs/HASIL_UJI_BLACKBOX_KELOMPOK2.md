# Laporan Hasil Pengujian Black Box - Kelompok 2: Formulir Pendaftaran Bertahap & Alur Pendaftar
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
| TC_BB_011 | Mengisi formulir pendaftaran bertahap dan fitur Simpan Draft | Mengisi tahap data diri, asal sekolah, dan data orang tua, lalu berpindah tahap / refresh halaman. | Data setiap tahap tersimpan secara aman ke server/database dan data yang telah diisi tetap tersedia saat dibuka kembali. | Data pada Step 1 (Identitas), Step 2 (Asal Sekolah), dan Step 3 (Orang Tua) berhasil disimpan bertahap ke server dan data tersimpan utuh saat diambil kembali via GET `/api/v1/pendaftar/my`. | Lulus | Fitur auto-save/draft bertahap mencegah hilangnya data pendaftar. | Response HTTP Status 200 OK |
| TC_BB_012 | Memilih program studi, gelombang pendaftaran, dan jalur pendaftaran (Reguler vs KIP-Kuliah) | Pilih Program Studi (MPI/AS/KPI), Gelombang aktif, dan Jalur Pendaftaran (Reguler / KIP-Kuliah). | Sistem menyimpan pilihan prodi, gelombang, dan jalur pendaftaran sesuai periode yang berlaku. | Pilihan program studi (MPI ID: 1), gelombang aktif (Gelombang 2 ID: 2), dan jalur pendaftaran (Reguler) tersimpan valid di database pendaftar. | Lulus | Integritas foreign key prodi dan gelombang tervalidasi. | Response HTTP Status 200 OK |
| TC_BB_013 | Pemilihan jalur KIP-Kuliah menghasilkan pembebasan biaya Rp 0 dan penetapan berkas KIP wajib | Pilih Jalur Pendaftaran: "KIP-Kuliah" pada stepper pemilihan prodi & gelombang formulir. | Biaya pendaftaran otomatis menjadi Rp 0 (Bebas Biaya), dokumen Kartu KIP/KKS/PKH/DTKS ditetapkan berstatus wajib diunggah. | Sistem otomatis mengubah tagihan biaya pendaftaran menjadi Rp 0 (Bebas Biaya) dan parameter `is_kip` bernilai true pada info rekening pembayaran. | Lulus | Aturan bisnis jalur beasiswa KIP-Kuliah berjalan akurat. | Response HTTP Status 200 OK |
| TC_BB_014 | Mengunci dan mengirim formulir pendaftaran (Final Submit) | Centang persetujuan keabsahan data dan klik tombol "Submit Pendaftaran Final". | Sistem menerbitkan Nomor Registrasi PMB resmi (format: PMB-2026-XXXX), status formulir terkunci (is_locked=true), dan tidak dapat diubah lagi. | Pendaftaran final berhasil disubmit; Nomor Registrasi resmi berformat `PMB-2026-XXXX` diterbitkan, status `is_locked=true`, dan upaya perubahan formulir berikutnya ditolak dengan HTTP 403 Forbidden. | Lulus | Menjamin sifat immutable data pendaftaran pasca final submit. | Response HTTP Status 200 OK & 403 Forbidden |

---

## 2. Ringkasan Eksekusi Otomatisasi (Playwright)

- **Total Kasus Uji Dijalankan:** 4 Kasus
- **Lulus (Passed):** 4 Kasus (100%)
- **Tidak Lulus (Failed):** 0 Kasus (0%)
- **Waktu Eksekusi Suite:** ~3.4 detik
- **File Skrip Pengujian:** [blackbox-kelompok2.spec.ts](file:///c:/Users/rachd/OneDrive/Documents/Staici/frontend/tests/blackbox-kelompok2.spec.ts)

