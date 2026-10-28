# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Website Penerimaan Mahasiswa Baru (PMB)
## STAI Cendekia Insani (STAICI) Situbondo

---

| Item | Keterangan |
|------|------------|
| Nama Dokumen | Software Requirements Specification (SRS) - Website PMB STAICI |
| Nama Sistem | Website PMB STAI Cendekia Insani (STAICI) Situbondo |
| Versi Dokumen | 1.0 |
| Tanggal Dibuat | 27 September 2026 |
| Status Dokumen | Final Draft |
| Disusun Oleh | Tim Pengembang Capstone Project |
| Repository | https://github.com/Davinrach/pmb-full-stack.git |
| Referensi PRD | PRD_Website_PMB_STAICI_v1.1.md |

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Deskripsi Umum Sistem](#2-deskripsi-umum-sistem)
3. [Aktor dan Stakeholder](#3-aktor-dan-stakeholder)
4. [Alur Bisnis dan User Journey](#4-alur-bisnis-dan-user-journey)
5. [Kebutuhan Fungsional](#5-kebutuhan-fungsional)
6. [Kebutuhan Non-Fungsional](#6-kebutuhan-non-fungsional)
7. [Arsitektur Sistem](#7-arsitektur-sistem)
8. [Desain Database](#8-desain-database)
9. [REST API Endpoint](#9-rest-api-endpoint)
10. [Keamanan Sistem](#10-keamanan-sistem)
11. [Rencana Pengujian](#11-rencana-pengujian)
12. [Batasan dan Asumsi](#12-batasan-dan-asumsi)
13. [Risiko dan Mitigasi](#13-risiko-dan-mitigasi)
14. [Glosarium](#14-glosarium)

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini merupakan **Software Requirements Specification (SRS)** untuk sistem Website Penerimaan Mahasiswa Baru (PMB) STAI Cendekia Insani (STAICI) Situbondo. SRS ini menjabarkan secara lengkap:

- Kebutuhan fungsional dan non-fungsional sistem
- Alur bisnis end-to-end proses pendaftaran mahasiswa
- Arsitektur teknis sistem (frontend, backend, database)
- Skema database beserta relasi antar tabel
- Seluruh endpoint REST API
- Standar keamanan dan rencana pengujian

Dokumen ini menjadi acuan bagi seluruh tim pengembang, penguji, dan pihak STAICI dalam proses pembangunan dan verifikasi sistem.

### 1.2 Ruang Lingkup Sistem

Sistem Website PMB STAICI mencakup tiga komponen utama:

1. **Website Publik** — Halaman informasi PMB yang dapat diakses siapapun tanpa login, menampilkan program studi, alur pendaftaran, jadwal gelombang, biaya, FAQ, dan kontak.
2. **Portal Calon Mahasiswa** — Dashboard untuk mendaftar, mengisi formulir, upload berkas, membayar, dan memantau status pendaftaran.
3. **Panel Admin / CMS** — Dashboard pengelola PMB untuk verifikasi berkas dan pembayaran, manajemen data, statistik, dan konten.

### 1.3 Definisi, Akronim, dan Singkatan

| Singkatan | Kepanjangan |
|-----------|-------------|
| PMB | Penerimaan Mahasiswa Baru |
| STAICI | STAI Cendekia Insani Situbondo |
| CMS | Content Management System |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| VA | Virtual Account |
| KIP | Kartu Indonesia Pintar |
| EMIS | Education Management Information System |
| NIK | Nomor Induk Kependudukan |
| KK | Kartu Keluarga |
| SKL | Surat Keterangan Lulus |
| SRS | Software Requirements Specification |
| PRD | Product Requirements Document |
| ERD | Entity Relationship Diagram |

### 1.4 Referensi

- PRD Website PMB STAICI v1.1 — dokumen kebutuhan produk utama
- Formulir Lembar Penerimaan Mahasiswa Baru Kopertais IV Surabaya / EMIS
- Repository kode sumber: https://github.com/Davinrach/pmb-full-stack.git
- Rancangan UI/UX Figma: https://www.figma.com/design/ENFH84Tfx5vSKiiRhw6zrr/Website-PMB-STAICI

---

## 2. Deskripsi Umum Sistem

### 2.1 Latar Belakang

Setiap tahun, STAICI Situbondo melaksanakan proses Penerimaan Mahasiswa Baru (PMB) secara manual/semi-manual. Permasalahan utama yang mendorong pembangunan sistem ini:

- Proses pendaftaran, verifikasi berkas, dan verifikasi pembayaran yang lambat dan rawan kesalahan
- Belum ada sistem terpusat untuk melacak status setiap calon mahasiswa dari pendaftaran hingga daftar ulang
- Data pribadi calon mahasiswa yang sangat rinci memerlukan pengelolaan terstruktur dan aman
- Admin PMB kesulitan mencari, memfilter, dan memantau statistik pendaftar dari banyak gelombang

### 2.2 Tujuan Sistem

| No. | Tujuan |
|-----|--------|
| T-1 | Menyediakan platform pendaftaran online yang mudah diakses, mobile-first, dan dapat digunakan berulang setiap tahun/gelombang. |
| T-2 | Mengotomasi alur status pendaftaran dari pembuatan akun hingga daftar ulang, termasuk mekanisme revisi berkas yang ditolak. |
| T-3 | Menyediakan CMS yang memudahkan admin PMB mengelola seluruh aspek PMB tanpa bergantung pada pengembang. |
| T-4 | Menjamin keamanan data pribadi calon mahasiswa (KTP, KK, data ekonomi orang tua). |
| T-5 | Menyediakan website publik informasi PMB yang informatif sebagai pintu masuk pendaftaran. |

### 2.3 Teknologi yang Digunakan

| Komponen | Teknologi | Versi / Keterangan |
|----------|-----------|-------------------|
| Frontend | Next.js + React | Next.js App Router, React 19 |
| Backend | Golang + Gin Framework | Go 1.27, Gin v1.12 |
| Database | MySQL | Via GORM ORM |
| ORM | GORM | v1.31 |
| Autentikasi | JSON Web Token (JWT) | golang-jwt/jwt v5 |
| Hosting | idwebhost.com (disediakan STAICI) | staicisitubondo.ac.id/pmb |
| File Storage | Local encrypted storage | Upload dir terproteksi |
| Email | SMTP / Email Service | Notifikasi dan verifikasi |

---

## 3. Aktor dan Stakeholder

### 3.1 Aktor Sistem

| Aktor | Role Kode | Deskripsi |
|-------|-----------|-----------|
| Calon Mahasiswa | `calon_mahasiswa` | Pengguna publik yang mendaftar sebagai calon mahasiswa baru STAICI |
| Admin PMB | `admin_pmb` | Staf STAICI yang mengelola proses PMB melalui CMS |
| Super Administrator | `super_admin` | Administrator penuh dengan akses ke seluruh modul termasuk RBAC |
| Verifikator Keuangan | `verifikator_keuangan` | Khusus melakukan verifikasi pembayaran VA dan bukti transfer |

### 3.2 Stakeholder Eksternal

| Stakeholder | Kebutuhan Utama |
|-------------|-----------------|
| Pihak STAICI (Manajemen) | Data pendaftar akurat, laporan yang dapat dipertanggungjawabkan |
| Kopertais IV Surabaya | Data pribadi dan orang tua sesuai format pelaporan EMIS |
| Admin IT STAICI | Sistem stabil, aman, mudah di-maintain, backup terjadwal |

### 3.3 Hak Akses per Aktor

```
Calon Mahasiswa:
  - Akses dashboard pribadi saja
  - CRUD data pendaftaran sendiri
  - Upload/download berkas sendiri
  - Lihat status dan pengumuman

Admin PMB:
  - Semua modul kecuali RBAC Management
  - Verifikasi berkas dan pembayaran
  - Kelola gelombang, prodi, konten
  - Lihat statistik dan log aktivitas

Super Admin:
  - Semua modul tanpa pengecualian
  - Manajemen RBAC (role dan permission)
  - Pengaturan sistem global

Verifikator Keuangan:
  - Pendaftar PMB (lihat)
  - Verifikasi berkas dan pembayaran
  - Integrasi VA dan export data
```

---

## 4. Alur Bisnis dan User Journey

### 4.1 Alur Pendaftaran Calon Mahasiswa (End-to-End)

```
ALUR PENDAFTARAN CALON MAHASISWA PMB STAICI
============================================

[1] Kunjungi Website Publik (staicisitubondo.ac.id/pmb)
          |
          v
[2] Pilih "Daftar Sekarang"
          |
          v
[3] Buat Akun Baru
    (Nama Lengkap, Email, No. WA, Password, NIK 16 digit)
          |
          v
[4] Verifikasi Email
    Sistem kirim link verifikasi -> Klik link untuk aktivasi
          |
    [Jika tidak diverifikasi] --> Akun tidak aktif
          |
          v (akun aktif)
[5] Login ke Dashboard
          |
          v
[6] Isi Formulir Data Pribadi (4 Tab/Step)
    +------------------------+
    | Tab 1: Identitas Diri  | -> Nama, JK, Alamat, TTL, Status WN, Agama, Status Kawin
    | Tab 2: Asal Sekolah    | -> Nama/Status Sekolah, Jurusan, Nilai, Tahun Lulus
    | Tab 3: Data Orang Tua  | -> Data Ayah, Ibu, Wali (kondisional), Kontak Darurat
    | Tab 4: Prodi & Gelombang| -> Pilih Program Studi (P1 & P2) + Gelombang
    +------------------------+
          |  (dapat disimpan sebagai Draft)
          v
[7] Upload Berkas Wajib
    - Kartu Keluarga (KK)
    - KTP
    - Ijazah / SKL
    - Pas Foto 3x4 (JPG)
    - [Opsional] Kartu KIP
    (Format: PDF/JPG/PNG, maks. 2 MB per file)
          |
          v
[8] Upload Bukti Pembayaran
    Transfer ke VA/Rekening STAICI -> Upload foto bukti transfer
          |
          v
[9] Final Submit Pendaftaran
    -> Sistem buat Nomor Pendaftaran: PMB-[TAHUN]-[URUTAN]
    -> Data DIKUNCI, tidak dapat diubah pendaftar
          |
          v  Status: MENUNGGU VERIFIKASI
[10] Admin Verifikasi Pembayaran
          |
          +-- [Ditolak] --> Alasan penolakan tampil di dashboard
          |                 Status kembali ke: MENUNGGU PEMBAYARAN
          v [Diterima]
[11] Admin Verifikasi Berkas
          |
          +-- [Ditolak] --> Alasan penolakan tampil di dashboard
          |                 Status kembali ke: BELUM LENGKAP
          |                 Calon mahasiswa dapat revisi & submit ulang
          v [Diterima]  Status: BERKAS DIVERIFIKASI
[12] Tahap Seleksi (Opsional: Ujian/Wawancara)
          |
          +-- [Tidak Lolos] --> Status: TIDAK LOLOS
          v [Lolos]  Status: LOLOS SELEKSI
[13] Pengumuman
    Hasil tampil di akun PMB sesuai timeline
          |
          v
[14] Daftar Ulang
    - Bayar biaya her-registrasi
    - Upload dokumen tambahan
    Status: DAFTAR ULANG
          |
          v
[15] Mahasiswa Aktif
    Data "naik kelas" menjadi data mahasiswa aktif (rekam akademik permanen)
```

### 4.2 Diagram Transisi Status Pendaftaran (12 Status)

```
STATUS PENDAFTARAN - DIAGRAM TRANSISI
=======================================

  [DRAFT]
      |
      v
  [AKUN_TERDAFTAR]
      |
      v
  [BELUM_LENGKAP] <-------------------------------------------+
      |  <---------- [Berkas/Pembayaran Ditolak Admin] ----+  |
      v                                                    |  |
  [MENUNGGU_PEMBAYARAN]                                    |  |
      |                                                    |  |
      v                                                    |  |
  [MENUNGGU_VERIFIKASI]                                    |  |
      |                                                    |  |
      v  (Admin verifikasi)                                |  |
  [BERKAS_DIVERIFIKASI] -- [DITOLAK_PERLU_PERBAIKAN] -----+  |
      |                                                       |
      v                                                       |
  [MENGIKUTI_UJIAN] (opsional)                               |
      |                                                       |
      +-- [TIDAK_LOLOS]                                       |
      |                                                       |
      v                                                       |
  [LOLOS_SELEKSI]                                            |
      |                                                       |
      v                                                       |
  [DAFTAR_ULANG]                                             |
      |                                                       |
      v                                                       |
  [MAHASISWA AKTIF]                                          |
                                                             |
  [KADALUARSA] <-- (batas waktu terlampaui) ----------------+
```

**Nilai Status pada Database:**

| Nilai | Label Tampil | Keterangan |
|-------|-------------|------------|
| `draft` | Draft | Sebelum mulai isi formulir |
| `akun_terdaftar` | Akun Terdaftar | Status awal setelah akun dibuat |
| `belum_lengkap` | Belum Lengkap | Sedang mengisi data/berkas |
| `menunggu_pembayaran` | Menunggu Pembayaran | Formulir lengkap, menunggu transfer |
| `menunggu_verifikasi` | Menunggu Verifikasi | Menunggu pemeriksaan admin |
| `berkas_diverifikasi` | Berkas Diverifikasi | Berkas dinyatakan sah |
| `ditolak_perlu_perbaikan` | Ditolak / Perlu Perbaikan | Otomatis kembali ke belum_lengkap |
| `mengikuti_ujian` | Mengikuti Ujian/Wawancara | Jika ada tes seleksi |
| `lolos_seleksi` | Lolos Seleksi | Dinyatakan lulus |
| `tidak_lolos` | Tidak Lolos | Dinyatakan tidak lulus |
| `daftar_ulang` | Daftar Ulang | Proses daftar ulang |
| `kadaluarsa` | Dibatalkan / Kadaluarsa | Batas waktu terlampaui |

### 4.3 Alur Bisnis Verifikasi Admin

```
ALUR VERIFIKASI ADMIN PMB
===========================

[1] Admin melihat daftar pendaftar berstatus MENUNGGU_VERIFIKASI
          |
          v
[2] Admin memeriksa detail pendaftar:
    - Data formulir (Identitas, Sekolah, Orang Tua)
    - Berkas yang diunggah (KK, KTP, Ijazah, Pas Foto)
    - Bukti pembayaran
          |
          v
[3] Verifikasi Pembayaran
    Cek kesesuaian bukti transfer dengan rekening STAICI
          |
          +-- [Ditolak + Alasan] --> Status Pembayaran: DITOLAK
          |                          Pendaftar diminta upload ulang
          v [Diterima]
[4] Verifikasi Berkas
    Cek kelengkapan & keabsahan: KK, KTP, Ijazah/SKL, Pas Foto, KIP (jika ada)
          |
          +-- [Ditolak + Alasan] --> Status: DITOLAK_PERLU_PERBAIKAN
          |                          Otomatis kembali ke BELUM_LENGKAP
          v [Diterima]
[5] Status: BERKAS_DIVERIFIKASI
          |
          v
[6] Seleksi Akhir - Admin/STAICI menentukan kelulusan akhir
          |
          +-- [Tidak Lolos] --> Status: TIDAK_LOLOS
          v [Lolos]
[7] Status: LOLOS_SELEKSI

[*] Seluruh aksi admin tercatat otomatis dalam Log Aktivitas Admin
    Format: "Admin [Nama], [Tanggal] [Waktu], [Aksi yang dilakukan]"
```

---

## 5. Kebutuhan Fungsional

### 5.1 Modul Autentikasi dan Akun

| ID | Nama Fitur | Deskripsi Detail | Prioritas |
|----|-----------|-----------------|-----------|
| FR-1.1 | Registrasi Akun | Calon mahasiswa mendaftar dengan: Nama Lengkap, Email, No. HP/WA, Password, NIK 16 digit. NIK dan Email bersifat unik. | Must Have |
| FR-1.2 | Verifikasi Email | Sistem kirim email berisi link/token verifikasi. Akun aktif hanya setelah diverifikasi. Token berlaku terbatas waktu. | Must Have |
| FR-1.3 | Login | Login menggunakan Email atau NIK + Password. Sistem return Bearer Token JWT setelah berhasil. | Must Have |
| FR-1.4 | Lupa/Reset Password | Request token reset password via email terdaftar. Halaman reset menggunakan token valid untuk mengubah password baru. | Must Have |
| FR-1.5 | Ubah Password | Pengguna yang sudah login dapat mengubah password dari dalam sesi aktif. | Should Have |
| FR-1.6 | Logout | Sesi pengguna dihapus dari client (token dibuang). | Must Have |
| FR-1.7 | Cek Profil Aktif | Endpoint GET /auth/me untuk mengambil data profil pengguna yang sedang login. | Must Have |

### 5.2 Modul Formulir Data Pendaftaran

| ID | Nama Fitur | Deskripsi Detail | Prioritas |
|----|-----------|-----------------|-----------|
| FR-2.1 | Formulir Identitas Mahasiswa | Nama Lengkap, Jenis Kelamin (L/P), Alamat, Tempat Lahir, Tanggal Lahir, Status WN (WNI/WNA + Negara jika WNA), Agama, Status Pernikahan. | Must Have |
| FR-2.2 | Formulir Asal Sekolah (SLTA) | Nama Sekolah, Status (Negeri/Swasta), Program/Jurusan, Nilai rata-rata/IP UAS (numerik), Tahun Lulus. | Must Have |
| FR-2.3 | Formulir Data Orang Tua | Data Ayah dan Ibu (diisi terpisah): Nama, NIK/KK, Tempat/Tgl Lahir, Alamat, Pendidikan, Pekerjaan (kode), Penghasilan per Bulan (kode). | Must Have |
| FR-2.4 | Formulir Identitas Wali | Nama Wali dan Alamat Wali (kondisional, jika calon mahasiswa memiliki wali). | Must Have |
| FR-2.5 | Formulir Informasi Kontak | No. HP Mahasiswa dan No. HP Orang Tua/Wali (dipakai Kopertais IV Surabaya). | Must Have |
| FR-2.6 | Pilihan Program Studi | Pendaftar memilih Pilihan 1 dan Pilihan 2 dari 3 prodi: MPI, AS, KPI. Serta memilih Gelombang yang aktif. | Must Have |
| FR-2.7 | Simpan Sebagai Draft | Data yang belum lengkap dapat disimpan sementara. Indikator progres pengisian ditampilkan. | Must Have |
| FR-2.8 | Kunci Data Setelah Submit | Setelah submit, seluruh data tidak dapat diubah oleh pendaftar (is_locked = true). | Must Have |

**Daftar Kode Pekerjaan (Data Orang Tua):**
Tidak Bekerja, Pensiunan, PNS, TNI/Polisi, Guru/Dosen, Pegawai Swasta, Pengusaha/Wiraswasta, Pengacara/Hakim/Jaksa/Notaris, Seniman/Pelukis/Artis, Dokter/Bidan/Perawat, Pilot/Pramugari, Pedagang, Petani/Peternak, Nelayan, Buruh, Sopir/Masinis/Kondektur, Politikus, Pengurus Rumah Tangga, Lainnya

**Daftar Kode Penghasilan per Bulan:**
di bawah Rp1.000.000 | Rp1.000.000-2.000.000 | Rp2.000.000-4.000.000 | Rp4.000.000-6.000.000 | di atas Rp6.000.000

### 5.3 Modul Upload Berkas

| ID | Nama Fitur | Deskripsi Detail | Prioritas |
|----|-----------|-----------------|-----------|
| FR-3.1 | Upload Berkas Wajib | KK, KTP, Ijazah/SKL, Pas Foto 3x4, Bukti Pembayaran - wajib diunggah sebelum submit. | Must Have |
| FR-3.2 | Upload Berkas Opsional | Kartu KIP dan dokumen pendukung lain (jika ada). | Must Have |
| FR-3.3 | Validasi Ukuran File | Sistem membatasi dan memvalidasi ukuran maks. 2 MB per file (divalidasi di sisi server). | Must Have |
| FR-3.4 | Validasi Format File | Format yang diizinkan: JPG/JPEG/PNG (foto); PDF/JPG/PNG (dokumen). Validasi di server. | Must Have |
| FR-3.5 | Ganti Berkas | Pendaftar dapat mengganti berkas selama belum diverifikasi/disahkan admin. | Must Have |
| FR-3.6 | Hapus Berkas | Pendaftar dapat menghapus berkas yang belum diverifikasi. | Must Have |
| FR-3.7 | Akses Berkas Aman | Berkas terenkripsi, hanya diakses melalui endpoint autentikasi (bukan URL publik langsung). | Must Have |

**Spesifikasi Berkas:**

| Jenis Dokumen | Wajib/Opsional | Format | Ukuran Maks. |
|---------------|----------------|--------|--------------|
| Kartu Keluarga (KK) | Wajib | JPG/PNG/PDF | 2 MB |
| KTP | Wajib | JPG/PNG/PDF | 2 MB |
| Ijazah / SKL | Wajib | JPG/PNG/PDF | 2 MB |
| Pas Foto 3x4 | Wajib | JPG/JPEG | 2 MB |
| Bukti Pembayaran | Wajib | JPG/PNG/PDF | 2 MB |
| Kartu KIP | Opsional | JPG/PNG/PDF | 2 MB |
| Dokumen Lainnya | Opsional | JPG/PNG/PDF | 2 MB |

### 5.4 Modul Pembayaran

| ID | Nama Fitur | Deskripsi Detail | Prioritas |
|----|-----------|-----------------|-----------|
| FR-4.1 | Info Rekening / VA | Sistem menampilkan nomor rekening tujuan transfer sesuai data bank yang diatur admin STAICI. | Must Have |
| FR-4.2 | Upload Bukti Transfer | Pendaftar mengunggah foto/file bukti transfer sebagai konfirmasi pembayaran. | Must Have |
| FR-4.3 | Status Pembayaran | Sistem menampilkan status: Menunggu Verifikasi -> Diterima / Ditolak (dengan alasan). | Must Have |
| FR-4.4 | Verifikasi Pembayaran (Admin) | Admin memverifikasi bukti transfer secara manual: Setujui / Tolak + alasan wajib jika ditolak. | Must Have |

### 5.5 Modul Status Pendaftaran

| ID | Nama Fitur | Deskripsi Detail | Prioritas |
|----|-----------|-----------------|-----------|
| FR-5.1 | Status Pendaftaran Otomatis | Sistem mengelola transisi status lengkap (lihat diagram 4.2). | Must Have |
| FR-5.2 | Alur Balik Status Ditolak | Berkas ditolak -> status otomatis kembali ke "Belum Lengkap" agar pendaftar dapat merevisi. | Must Have |
| FR-5.3 | Status Kadaluarsa | Pendaftar yang tidak melengkapi hingga batas waktu dapat ditandai "Kadaluarsa" secara otomatis. | Could Have |
| FR-5.4 | Alasan Penolakan | Pendaftar dapat melihat alasan penolakan/permintaan perbaikan berkas pada dashboard. | Must Have |
| FR-5.5 | Nomor Pendaftaran Otomatis | Format: PMB-[Tahun]-[Urutan 4 digit], contoh: PMB-2026-0001. Dibuat otomatis saat submit, unik per tahun. | Must Have |

### 5.6 Modul Seleksi dan Pengumuman

| ID | Nama Fitur | Deskripsi Detail | Prioritas |
|----|-----------|-----------------|-----------|
| FR-6.1 | Seleksi Berkas | Admin/pihak STAICI memeriksa keabsahan berkas untuk menentukan kelulusan. | Must Have |
| FR-6.2 | Ujian / Wawancara (Opsional) | Status "Mengikuti Ujian/Wawancara" tersedia jika STAICI mensyaratkan tes seleksi. | Should Have |
| FR-6.3 | Status Seleksi | Admin dapat mengubah status seleksi: Lulus / Tidak Lulus / Cadangan. | Must Have |
| FR-6.4 | Pengumuman Hasil Seleksi | Hasil tampil di akun PMB sesuai timeline yang diatur admin. | Must Have |
| FR-6.5 | Daftar Ulang | Pendaftar yang lulus melakukan konfirmasi (bayar her-registrasi, upload dokumen tambahan). | Should Have |

### 5.7 Modul Dashboard Calon Mahasiswa

| ID | Nama Fitur | Deskripsi Detail | Prioritas |
|----|-----------|-----------------|-----------|
| FR-7.1 | Overview Dashboard | Ringkasan persentase kelengkapan data, nomor pendaftaran, dan status seleksi terkini. | Must Have |
| FR-7.2 | Lihat dan Edit Data Formulir | Calon mahasiswa dapat melihat dan mengedit data formulir selama belum disubmit final. | Must Have |
| FR-7.3 | Lihat Status Real-time | Menampilkan status pendaftaran terkini beserta timeline perjalanan status. | Must Have |
| FR-7.4 | Kelola Berkas | Melihat berkas yang diunggah; mengganti berkas yang belum disahkan admin. | Must Have |
| FR-7.5 | Lihat Pembayaran | Melihat status dan riwayat pembayaran beserta alasan penolakan jika ada. | Must Have |
| FR-7.6 | Lihat Pengumuman Seleksi | Melihat hasil seleksi sesuai timeline pengumuman yang ditetapkan admin. | Must Have |
| FR-7.7 | Cetak Kartu dan Bukti Pendaftaran | Mengunduh/mencetak kartu pendaftaran dan bukti pendaftaran dalam format PDF. | Should Have |

### 5.8 Modul Admin / CMS

| ID | Nama Fitur | Deskripsi Detail | Prioritas |
|----|-----------|-----------------|-----------|
| FR-8.1 | Dashboard Statistik Admin | Statistik agregat: jumlah pendaftar per status, per prodi, per gelombang, dan pembayaran. | Should Have |
| FR-8.2 | Manajemen Data Pendaftar | Melihat, mencari (nama/NIK), dan memfilter seluruh data pendaftar dengan paginasi. | Must Have |
| FR-8.3 | Detail Pendaftar | Melihat detail lengkap formulir, berkas, dan pembayaran 1 calon mahasiswa. | Must Have |
| FR-8.4 | Verifikasi Berkas | Menyetujui / menolak berkas pendaftar dengan alasan wajib saat menolak. | Must Have |
| FR-8.5 | Verifikasi Pembayaran | Menyetujui / menolak bukti transfer dengan alasan wajib saat menolak. | Must Have |
| FR-8.6 | Manajemen Status Seleksi | Mengubah status kelulusan: Lulus, Tidak Lulus, Cadangan. | Must Have |
| FR-8.7 | Manajemen Gelombang PMB | CRUD gelombang pendaftaran (nama, tahun akademik, tanggal buka/tutup, biaya, kuota). | Should Have |
| FR-8.8 | Manajemen Program Studi | CRUD program studi (kode, nama, jenjang, deskripsi, status aktif). | Must Have |
| FR-8.9 | Manajemen Konten dan Pengaturan | Mengelola banner, teks pengumuman, info rekening bank, kontak CS, alamat kampus. | Should Have |
| FR-8.10 | Log Aktivitas Admin | Riwayat audit trail seluruh aktivitas admin (admin, waktu, aksi, IP address). | Should Have |
| FR-8.11 | Manajemen RBAC | Super Admin mengelola role, kelompok menu, menu navigasi, dan perizinan akses per role. | Should Have |

### 5.9 Modul Notifikasi

| ID | Nama Fitur | Deskripsi Detail | Prioritas |
|----|-----------|-----------------|-----------|
| FR-9.1 | Notifikasi Email | Sistem mengirim email untuk: verifikasi akun, perubahan status pendaftaran, hasil verifikasi berkas/pembayaran, pengumuman seleksi. | Must Have |

### 5.10 Modul Website Publik

| ID | Nama Fitur | Deskripsi Detail | Prioritas |
|----|-----------|-----------------|-----------|
| FR-10.1 | Landing Page PMB | Hero banner, profil 3 prodi (MPI, AS, KPI), jalur pendaftaran, persyaratan, biaya, alur, jadwal PMB, FAQ, kontak. | Must Have |
| FR-10.2 | Halaman Program Studi | Detail profil lulusan, prospek kerja, gelar akademik, dan mata kuliah unggulan per prodi. | Must Have |
| FR-10.3 | Halaman Informasi PMB | Alur 4-langkah pendaftaran, jadwal gelombang, rincian biaya, syarat berkas. | Must Have |
| FR-10.4 | Akses via Path | Sistem diakses melalui staicisitubondo.ac.id/pmb, terintegrasi dengan domain utama STAICI. | Must Have |

---

## 6. Kebutuhan Non-Fungsional

### 6.1 Keamanan

| ID | Kebutuhan | Deskripsi |
|----|-----------|-----------|
| NFR-S1 | Hash Password | Password disimpan dalam bentuk bcrypt hash, tidak pernah plain text. |
| NFR-S2 | JWT Authentication | Semua rute protected menggunakan header Authorization: Bearer TOKEN. Token berisi: user_id, email, role. |
| NFR-S3 | Role-Based Access Control (RBAC) | Middleware RequireRoles() memastikan calon mahasiswa tidak bisa akses endpoint admin. |
| NFR-S4 | HTTPS Enforced | Seluruh komunikasi client dan server menggunakan HTTPS. |
| NFR-S5 | Validasi Upload Server-Side | Validasi tipe dan ukuran file dilakukan di sisi server, bukan hanya client. |
| NFR-S6 | Protected Document Streaming | Berkas disimpan terenkripsi; hanya diakses melalui endpoint autentikasi, tidak via URL publik. |
| NFR-S7 | Rate Limiting dan Lockout | Pembatasan request per IP; lockout otomatis setelah beberapa kali percobaan login gagal. |
| NFR-S8 | Kebijakan Kompleksitas Password | Password minimum: 8 karakter, kombinasi huruf dan angka. |
| NFR-S9 | 2FA untuk Admin CMS | Autentikasi dua faktor untuk akun Admin PMB. |
| NFR-S10 | Proteksi CSRF, XSS, SQL Injection | CSRF token per-request, sanitasi input/output, parameterized query via GORM. |
| NFR-S11 | Enkripsi Data Sensitif at-rest | Field NIK, KTP/KK, data ekonomi orang tua dienkripsi saat disimpan di database. |
| NFR-S12 | Audit Trail Akses Data | Log siapa yang membuka/mengunduh data pendaftar tertentu dan kapan. |
| NFR-S13 | Kepatuhan UU PDP | Consent eksplisit, hak akses/penghapusan data, anonimisasi setelah masa retensi. |

### 6.2 Performa

| ID | Kebutuhan | Deskripsi |
|----|-----------|-----------|
| NFR-P1 | Load Time Halaman Utama | Halaman landing page, form, dashboard memuat cepat pada koneksi mobile. |
| NFR-P2 | Concurrent Users | Sistem menangani lonjakan trafik mendekati tanggal penutupan gelombang. |
| NFR-P3 | Database Connection Pool | Max 100 open connections, max 10 idle connections, lifetime 1 jam (GORM config). |

### 6.3 Usability

| ID | Kebutuhan | Deskripsi |
|----|-----------|-----------|
| NFR-U1 | Mobile-First | Seluruh halaman optimal di perangkat mobile terlebih dahulu, kemudian tablet dan desktop. |
| NFR-U2 | Multi-Step Formulir | Formulir panjang disajikan bertahap (wizard) dengan indikator progres yang jelas. |
| NFR-U3 | Pesan Error Ramah | Pesan error/validasi ditampilkan jelas dalam bahasa Indonesia (bukan pesan teknis). |
| NFR-U4 | Preview File | Preview file sebelum/sesudah upload, indikator validasi ukuran dan format real-time. |
| NFR-U5 | Badge Status Visual | Status pendaftaran ditandai dengan warna/badge berbeda di dashboard mahasiswa dan admin. |

### 6.4 Kompatibilitas

| ID | Kebutuhan | Deskripsi |
|----|-----------|-----------|
| NFR-C1 | Browser Support | Chrome, Safari, Edge, Firefox versi terbaru. |
| NFR-C2 | Responsive | Mendukung mobile (< 768px), tablet (768-1024px), dan desktop (> 1024px). |

### 6.5 Retensi dan Pengelolaan Data

| ID | Kebutuhan | Deskripsi |
|----|-----------|-----------|
| NFR-D1 | Data Mahasiswa Aktif | Data pendaftar yang lulus dan daftar ulang disimpan permanen sebagai rekam akademik. |
| NFR-D2 | Data Pendaftar Tidak Lolos | Disimpan 1-2 tahun untuk keperluan audit/pelaporan, setelah itu dihapus/diarsipkan. |
| NFR-D3 | Backup Database | Backup database dilakukan secara berkala oleh Admin IT STAICI. |

### 6.6 Observability dan Error Handling

| ID | Kebutuhan | Deskripsi |
|----|-----------|-----------|
| NFR-O1 | Structured Logging | Log dengan level: info/warning/error/critical. Mencatat request ID, timestamp, user ID. Tanpa data sensitif mentah. |
| NFR-O2 | Error Monitoring | Error monitoring otomatis (Sentry atau sejenis) yang alert ke developer saat error production. |
| NFR-O3 | Konsistensi Response Error API | Format response error konsisten: kode error, pesan teknis (developer), pesan ramah (user). |
| NFR-O4 | Environment Terpisah | Development, staging, dan production dalam environment yang terpisah. |
| NFR-O5 | SLA Insiden Kritis | Waktu respons maksimal yang ditetapkan untuk isu kritis saat gelombang aktif. |
| NFR-O6 | Rollback Cepat | Rencana rollback siap jika rilis baru menyebabkan bug pada sistem aktif. |

---

## 7. Arsitektur Sistem

### 7.1 Arsitektur Keseluruhan

```
ARSITEKTUR SISTEM PMB STAICI
==============================

  +------------------+  HTTPS  +--------------------------------+
  |     Browser      | ------> |   Next.js Frontend App         |
  | (Pengguna/Admin) |         |   (Port :3000)                 |
  +------------------+         |                                |
                               |  * App Router (halaman web)    |
                               |  * Autentikasi klien (JWT)     |
                               |  * UI Components (React 19)    |
                               +----------------+---------------+
                                                |
                                    HTTP + Bearer Token
                                                |
                                                v
                               +--------------------------------+
                               |   Golang Gin REST API          |
                               |   (Port :8080/api/v1)          |
                               |                                |
                               |  * Middleware JWT, CORS,       |
                               |    Rate Limit, Logger          |
                               |  * Handler Layer               |
                               |  * Business Logic              |
                               |  * RBAC Enforcement            |
                               +----------+-----------+---------+
                                          |           |
                                     GORM ORM     File I/O
                                          |           |
                              +---------------------+ +------------------+
                              |   MySQL Database    | | Protected Storage |
                              |   (pmb_staici_db)   | | (Encrypted Files) |
                              |                     | |                  |
                              |  * users            | | uploads/kk/      |
                              |  * pendaftars       | | uploads/ktp/     |
                              |  * orang_tuas       | | uploads/ijazah/  |
                              |  * berkases         | | uploads/foto/    |
                              |  * pembayarans      | | uploads/bukti/   |
                              |  * gelombangs       | +------------------+
                              |  * program_studis   |
                              |  * log_aktivitas_   |
                              |  * pengaturan_sis   |
                              |  * role_models      |
                              |  * menu_groups      |
                              |  * menus            |
                              |  * role_menus       |
                              +---------------------+
```

### 7.2 Struktur Direktori Backend (Golang)

```
backend/
+-- cmd/
|   +-- api/                     # Entry point aplikasi
+-- internal/
|   +-- config/                  # Konfigurasi environment (.env)
|   +-- database/
|   |   +-- database.go          # Inisialisasi DB, AutoMigrate, Seeder
|   +-- handler/
|   |   +-- auth_handler.go      # Endpoint autentikasi
|   |   +-- pendaftar_handler.go # Endpoint calon mahasiswa
|   |   +-- berkas_handler.go    # Endpoint upload & stream berkas
|   |   +-- pembayaran_handler.go# Endpoint pembayaran
|   |   +-- admin_handler.go     # Endpoint CMS admin
|   |   +-- rbac_handler.go      # Endpoint RBAC management
|   |   +-- public_handler.go    # Endpoint publik (tanpa auth)
|   |   +-- health_handler.go    # Health check
|   +-- middleware/
|   |   +-- auth.go              # JWT middleware, RequireRoles()
|   |   +-- cors.go              # CORS configuration
|   |   +-- logger.go            # Request logging
|   +-- model/
|   |   +-- models.go            # Seluruh struct model GORM (13 model)
|   +-- response/                # Format response standar API
|   +-- util/                    # Utility: hash password, JWT, dll.
+-- uploads/                     # Direktori penyimpanan berkas terproteksi
+-- .env.example
+-- go.mod
+-- go.sum
```

### 7.3 Struktur Direktori Frontend (Next.js)

```
frontend/
+-- app/
|   +-- page.tsx                 # Landing Page Publik
|   +-- layout.tsx               # Root layout
|   +-- globals.css              # Global styles
|   +-- program-studi/
|   |   +-- page.tsx             # Redirect ke /mpi
|   |   +-- [slug]/page.tsx      # Detail per prodi (mpi, as, kpi)
|   +-- pendaftaran/page.tsx     # Info PMB & Alur Pendaftaran
|   +-- daftar/page.tsx          # Redirect ke /pendaftaran
|   +-- register/page.tsx        # Form registrasi calon mahasiswa
|   +-- login/page.tsx           # Portal login calon mahasiswa
|   +-- loginadmin/page.tsx      # Portal login admin
|   +-- adminlogin/page.tsx      # Alias login admin
|   +-- lupa-password/page.tsx   # Form lupa password
|   +-- reset-password/page.tsx  # Form reset password baru
|   +-- dashboard/
|   |   +-- page.tsx             # Overview dashboard mahasiswa
|   |   +-- formulir/page.tsx    # Pengisian formulir PMB (4 tab)
|   |   +-- pembayaran/page.tsx  # Konfirmasi & upload bukti bayar
|   |   +-- pengumuman/page.tsx  # Hasil seleksi PMB
|   |   +-- cetak/page.tsx       # Cetak kartu & formulir PDF
|   +-- admin/page.tsx           # Redirect ke /admincms
|   +-- admincms/page.tsx        # Dashboard CMS Admin Terpadu
+-- components/                  # Reusable UI components
+-- lib/                         # Utility functions, API client
+-- public/                      # Static assets (logo, gambar)
+-- next.config.ts
+-- package.json
+-- tsconfig.json
```

---

## 8. Desain Database

### 8.1 Ringkasan Tabel (13 Tabel)

| No. | Nama Tabel | Deskripsi Singkat |
|-----|-----------|-------------------|
| 1 | `users` | Data akun pengguna (calon mahasiswa dan admin) |
| 2 | `program_studis` | Master data program studi |
| 3 | `gelombangs` | Master data gelombang pendaftaran |
| 4 | `pendaftars` | Data utama pendaftaran calon mahasiswa |
| 5 | `orang_tuas` | Data orang tua / wali calon mahasiswa |
| 6 | `berkases` | Data berkas yang diunggah pendaftar |
| 7 | `pembayarans` | Data transaksi pembayaran pendaftaran |
| 8 | `log_aktivitas_admins` | Audit trail aktivitas admin |
| 9 | `pengaturan_sistems` | Konfigurasi sistem (banner, bank, kontak) |
| 10 | `role_models` | Master data role sistem (RBAC) |
| 11 | `menu_groups` | Kelompok navigasi menu admin |
| 12 | `menus` | Daftar item menu navigasi admin |
| 13 | `role_menus` | Relasi role - menu (permission RBAC) |

### 8.2 Skema Tabel Detail

#### Tabel 1: `users`

```sql
CREATE TABLE users (
    id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email                VARCHAR(191) NOT NULL UNIQUE,
    password_hash        VARCHAR(255) NOT NULL,           -- bcrypt hash
    nama_lengkap         VARCHAR(191) NOT NULL,
    no_hp                VARCHAR(30) NOT NULL,
    nik                  VARCHAR(30) NOT NULL UNIQUE,     -- 16 digit NIK KTP
    role                 VARCHAR(30) DEFAULT 'calon_mahasiswa',
    is_email_verified    BOOLEAN DEFAULT FALSE,
    verification_token   VARCHAR(255),                    -- Token verifikasi email
    reset_password_token VARCHAR(255),                    -- Token reset password
    created_at           DATETIME,
    updated_at           DATETIME,
    deleted_at           DATETIME,                        -- Soft delete
    INDEX idx_deleted_at (deleted_at)
);

-- Nilai yang diizinkan untuk kolom role:
-- 'calon_mahasiswa' | 'admin_pmb' | 'super_admin'
```

#### Tabel 2: `program_studis`

```sql
CREATE TABLE program_studis (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode        VARCHAR(20) NOT NULL UNIQUE,   -- MPI, AS, KPI
    nama        VARCHAR(191) NOT NULL,
    jenjang     VARCHAR(10) DEFAULT 'S1',
    deskripsi   TEXT,
    is_aktif    BOOLEAN DEFAULT TRUE,
    created_at  DATETIME,
    updated_at  DATETIME,
    deleted_at  DATETIME
);
```

Data Seed Awal:

| Kode | Nama | Jenjang |
|------|------|---------|
| MPI | Manajemen Pendidikan Islam | S1 |
| AS | Ahwal Al-Syakhsiyah (Hukum Keluarga Islam) | S1 |
| KPI | Komunikasi dan Penyiaran Islam | S1 |

#### Tabel 3: `gelombangs`

```sql
CREATE TABLE gelombangs (
    id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama               VARCHAR(100) NOT NULL,      -- "Gelombang 1 - 2026/2027"
    tahun_akademik     VARCHAR(20) NOT NULL,        -- "2026/2027"
    tanggal_buka       DATETIME NOT NULL,
    tanggal_tutup      DATETIME NOT NULL,
    biaya_pendaftaran  DECIMAL(12,2) DEFAULT 0,     -- Contoh: 250000.00
    kuota              INT DEFAULT 0,               -- Jumlah maks. pendaftar
    is_aktif           BOOLEAN DEFAULT TRUE,
    created_at         DATETIME,
    updated_at         DATETIME,
    deleted_at         DATETIME
);
```

#### Tabel 4: `pendaftars` (Tabel Utama)

```sql
CREATE TABLE pendaftars (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT UNSIGNED NOT NULL UNIQUE,
    gelombang_id        BIGINT UNSIGNED,
    program_studi_id    BIGINT UNSIGNED,
    nomor_pendaftaran   VARCHAR(50) UNIQUE,          -- PMB-2026-0001 (NULL sampai submit)
    status_pendaftaran  VARCHAR(40) DEFAULT 'akun_terdaftar',
    catatan_revisi      TEXT,                         -- Alasan penolakan dari admin
    is_locked           BOOLEAN DEFAULT FALSE,         -- TRUE setelah submit final

    -- Identitas Mahasiswa (FR-2.1)
    jenis_kelamin       VARCHAR(20),                  -- Laki-laki / Perempuan
    alamat              TEXT,
    tempat_lahir        VARCHAR(100),
    tanggal_lahir       DATE,
    status_warga_negara VARCHAR(10) DEFAULT 'WNI',    -- WNI / WNA
    negara_wna          VARCHAR(100),                 -- Diisi jika WNA
    agama               VARCHAR(30) DEFAULT 'Islam',
    status_pernikahan   VARCHAR(30),                  -- Kawin/Tidak Kawin/Janda/Duda

    -- Asal Sekolah SLTA (FR-2.2)
    nama_sekolah        VARCHAR(191),
    status_sekolah      VARCHAR(20),                  -- Negeri / Swasta
    jurusan_sekolah     VARCHAR(100),
    nilai_rata_rata     DECIMAL(5,2),
    tahun_lulus         INT,

    created_at          DATETIME,
    updated_at          DATETIME,
    deleted_at          DATETIME,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (gelombang_id) REFERENCES gelombangs(id),
    FOREIGN KEY (program_studi_id) REFERENCES program_studis(id)
);
```

#### Tabel 5: `orang_tuas`

```sql
CREATE TABLE orang_tuas (
    id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pendaftar_id          BIGINT UNSIGNED NOT NULL UNIQUE,

    -- Data Ayah (FR-2.3)
    nama_ayah             VARCHAR(191),
    nik_ayah              VARCHAR(30),
    kk_ayah               VARCHAR(30),
    tempat_lahir_ayah     VARCHAR(100),
    tanggal_lahir_ayah    DATE,
    alamat_ayah           TEXT,
    pendidikan_ayah       VARCHAR(50),
    pekerjaan_ayah        VARCHAR(100),   -- Kode pekerjaan
    penghasilan_ayah      VARCHAR(100),   -- Kode range penghasilan

    -- Data Ibu (FR-2.3)
    nama_ibu              VARCHAR(191),
    nik_ibu               VARCHAR(30),
    kk_ibu                VARCHAR(30),
    tempat_lahir_ibu      VARCHAR(100),
    tanggal_lahir_ibu     DATE,
    alamat_ibu            TEXT,
    pendidikan_ibu        VARCHAR(50),
    pekerjaan_ibu         VARCHAR(100),
    penghasilan_ibu       VARCHAR(100),

    -- Data Wali (Kondisional FR-2.4)
    nama_wali             VARCHAR(191),
    alamat_wali           TEXT,
    no_hp_orang_tua_wali  VARCHAR(30),   -- No. HP Orang Tua/Wali (FR-2.5)

    created_at            DATETIME,
    updated_at            DATETIME,

    FOREIGN KEY (pendaftar_id) REFERENCES pendaftars(id)
);
```

#### Tabel 6: `berkases`

```sql
CREATE TABLE berkases (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pendaftar_id      BIGINT UNSIGNED NOT NULL,
    jenis_dokumen     VARCHAR(50) NOT NULL,
    -- Nilai: KK | KTP | Ijazah | Foto | BuktiBayar | KIP | Lainnya
    file_name         VARCHAR(255) NOT NULL,
    file_path         VARCHAR(255) NOT NULL,   -- Path terenkripsi (tidak dapat diakses publik)
    file_size         BIGINT,                   -- Maks. 2MB = 2.097.152 bytes
    mime_type         VARCHAR(100),
    status_verifikasi VARCHAR(30) DEFAULT 'pending',
    -- Nilai: pending | valid | invalid
    catatan_admin     TEXT,                     -- Alasan penolakan dari admin

    created_at        DATETIME,
    updated_at        DATETIME,

    FOREIGN KEY (pendaftar_id) REFERENCES pendaftars(id),
    INDEX idx_pendaftar_id (pendaftar_id)
);
```

#### Tabel 7: `pembayarans`

```sql
CREATE TABLE pembayarans (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pendaftar_id            BIGINT UNSIGNED NOT NULL,
    jumlah                  DECIMAL(12,2) NOT NULL,
    bank_tujuan             VARCHAR(100) NOT NULL,
    nomor_rekening_tujuan   VARCHAR(50) NOT NULL,
    nama_pengirim           VARCHAR(191),
    bukti_transfer_path     VARCHAR(255) NOT NULL,   -- Path file bukti transfer
    status                  VARCHAR(30) DEFAULT 'menunggu_verifikasi',
    -- Nilai: menunggu_verifikasi | diterima | ditolak
    alasan_penolakan        TEXT,
    verified_by             BIGINT UNSIGNED,          -- ID admin yang memverifikasi
    verified_at             DATETIME,
    created_at              DATETIME,
    updated_at              DATETIME,

    FOREIGN KEY (pendaftar_id) REFERENCES pendaftars(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);
```

#### Tabel 8: `log_aktivitas_admins`

```sql
CREATE TABLE log_aktivitas_admins (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id    BIGINT UNSIGNED NOT NULL,
    admin_nama  VARCHAR(191) NOT NULL,
    aksi        VARCHAR(255) NOT NULL,   -- "Mengubah status pendaftaran PMB-2026-0001"
    detail      TEXT,
    ip_address  VARCHAR(45),
    created_at  DATETIME,

    INDEX idx_admin_id (admin_id),
    INDEX idx_created_at (created_at)
);
```

#### Tabel 9: `pengaturan_sistems`

```sql
CREATE TABLE pengaturan_sistems (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    banner_title      VARCHAR(255),
    banner_subtitle   TEXT,
    announcement_text VARCHAR(255),
    bank_name         VARCHAR(100),    -- "Bank Syariah Indonesia (BSI)"
    nomor_rekening    VARCHAR(100),    -- "7148899012"
    atas_nama         VARCHAR(100),    -- "STAI Cendekia Insani PMB"
    no_whatsapp_cs    VARCHAR(50),
    email_cs          VARCHAR(100),
    alamat_kampus     TEXT,
    updated_at        DATETIME
);
```

#### Tabel 10-13: RBAC System

```sql
-- Tabel 10: role_models
CREATE TABLE role_models (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode        VARCHAR(50) NOT NULL UNIQUE,   -- super_admin, admin_pmb, dll.
    nama        VARCHAR(100) NOT NULL,
    deskripsi   TEXT,
    is_system   BOOLEAN DEFAULT FALSE,
    created_at  DATETIME,
    updated_at  DATETIME,
    deleted_at  DATETIME
);

-- Data Seed Default:
-- super_admin         -> "Super Administrator"
-- admin_pmb           -> "Admin Panitia PMB"
-- verifikator_keuangan -> "Verifikator Keuangan"
-- calon_mahasiswa     -> "Calon Mahasiswa"

-- Tabel 11: menu_groups
CREATE TABLE menu_groups (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama        VARCHAR(100) NOT NULL,
    urutan      INT DEFAULT 0,
    is_aktif    BOOLEAN DEFAULT TRUE,
    created_at  DATETIME,
    updated_at  DATETIME,
    deleted_at  DATETIME
);

-- Data Seed: "Menu Utama" | "Alat & Integrasi" | "Pengaturan"

-- Tabel 12: menus
CREATE TABLE menus (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    menu_group_id  BIGINT UNSIGNED NOT NULL,
    nama           VARCHAR(100) NOT NULL,
    key_menu       VARCHAR(50) NOT NULL UNIQUE,   -- "pendaftar", "verifikasi", dll.
    icon           VARCHAR(50) DEFAULT 'Users',
    url            VARCHAR(191),
    badge_text     VARCHAR(50),
    urutan         INT DEFAULT 0,
    is_aktif       BOOLEAN DEFAULT TRUE,
    created_at     DATETIME,
    updated_at     DATETIME,
    deleted_at     DATETIME,

    FOREIGN KEY (menu_group_id) REFERENCES menu_groups(id)
);

-- Data Seed Menu:
-- Menu Utama    : pendaftar, verifikasi, seleksi
-- Alat & Integ. : emis, export, logs, va
-- Pengaturan    : gelombang, settings, prodi, rbac

-- Tabel 13: role_menus (Permission Matrix)
CREATE TABLE role_menus (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_kode   VARCHAR(50) NOT NULL,
    menu_id     BIGINT UNSIGNED NOT NULL,
    allow_view  BOOLEAN DEFAULT TRUE,
    created_at  DATETIME,
    updated_at  DATETIME,

    FOREIGN KEY (menu_id) REFERENCES menus(id),
    INDEX idx_role_kode (role_kode)
);
```

### 8.3 Entity Relationship Diagram (ERD)

```
ERD - PMB STAICI (Relasi Antar Tabel)
=======================================

users (1) --------- (1) pendaftars (1) ---------- (1) orang_tuas
                          |
                          +-- (N) berkases
                          |
                          +-- (N) pembayarans
                          |
              gelombangs (N) --+
              program_studis (N)

users (admin) ----- (N) log_aktivitas_admins
users (admin) ----- (N) pembayarans.verified_by

role_models <----- (N:M via role_menus) -----> menus
menu_groups (1) ---- (N) menus

Kunci Relasi:
- users.id              -> pendaftars.user_id (1:1, unique)
- pendaftars.id         -> orang_tuas.pendaftar_id (1:1)
- pendaftars.id         -> berkases.pendaftar_id (1:N)
- pendaftars.id         -> pembayarans.pendaftar_id (1:N)
- gelombangs.id         -> pendaftars.gelombang_id (1:N)
- program_studis.id     -> pendaftars.program_studi_id (1:N)
- menus.id              -> role_menus.menu_id (N:M)
- role_models.kode      -> role_menus.role_kode (N:M)
```

### 8.4 Matriks RBAC (Role-Permission Default)

| Menu / Fitur | super_admin | admin_pmb | verifikator_keuangan | calon_mahasiswa |
|-------------|:-----------:|:---------:|:--------------------:|:---------------:|
| Pendaftar PMB | Ya | Ya | Ya | Tidak |
| Verifikasi Berkas | Ya | Ya | Ya | Tidak |
| Seleksi & Kelulusan | Ya | Ya | Tidak | Tidak |
| Sinkronisasi EMIS | Ya | Ya | Tidak | Tidak |
| Export Data | Ya | Ya | Ya | Tidak |
| Log Audit | Ya | Ya | Tidak | Tidak |
| Integrasi VA | Ya | Ya | Ya | Tidak |
| Kelola Gelombang | Ya | Ya | Tidak | Tidak |
| CMS Content & Banner | Ya | Ya | Tidak | Tidak |
| CMS Program Studi | Ya | Ya | Tidak | Tidak |
| Manajemen Role & RBAC | Ya | Tidak | Tidak | Tidak |
| Dashboard Mahasiswa | Tidak | Tidak | Tidak | Ya |

---

## 9. REST API Endpoint

### 9.1 Base URL dan Format Response

```
Development: http://localhost:8080/api/v1
Production:  https://staicisitubondo.ac.id/api/v1

Format Response Standar:
{
  "success": true/false,
  "message": "Pesan yang dapat dibaca user",
  "data": { ... },           -- Ada saat success
  "error_code": "ERR_XX",    -- Ada saat error
  "errors": { ... }          -- Detail validasi error
}
```

### 9.2 Endpoint Publik (Tanpa Autentikasi)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/health` | Health check server dan koneksi MySQL |
| GET | `/api/v1/info-pmb` | Alur pendaftaran, jadwal gelombang, syarat berkas |
| GET | `/api/v1/public/settings` | Pengaturan pesan pengumuman publik dan banner |
| GET | `/api/v1/program-studi` | Daftar Program Studi aktif |

### 9.3 Endpoint Autentikasi (`/api/v1/auth`)

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/auth/register` | Daftar akun calon mahasiswa baru | Tidak |
| POST | `/api/v1/auth/login` | Login -> return JWT Bearer Token | Tidak |
| POST | `/api/v1/auth/forgot-password` | Request token reset password via email | Tidak |
| POST | `/api/v1/auth/reset-password` | Ubah password menggunakan token valid | Tidak |
| GET | `/api/v1/auth/me` | Ambil data sesi dan profil pengguna aktif | Ya |
| POST | `/api/v1/auth/change-password` | Ubah password dalam sesi aktif | Ya |

**Contoh Request: POST `/api/v1/auth/register`**

```json
{
  "nama_lengkap": "Ahmad Fauzi",
  "email": "ahmad@email.com",
  "no_hp": "081234567890",
  "nik": "3513010101020001",
  "password": "Rahasia@123",
  "password_confirmation": "Rahasia@123"
}
```

**Contoh Request: POST `/api/v1/auth/login`**

```json
{
  "identifier": "ahmad@email.com",
  "password": "Rahasia@123"
}
```

**Contoh Response Login Sukses:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "ahmad@email.com",
      "nama_lengkap": "Ahmad Fauzi",
      "role": "calon_mahasiswa"
    }
  }
}
```

### 9.4 Endpoint Calon Mahasiswa

*Header wajib: `Authorization: Bearer <JWT_TOKEN>` | Role: `calon_mahasiswa`*

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/pendaftar/my` | Ambil seluruh data formulir pendaftaran sendiri |
| PUT | `/api/v1/pendaftar/identitas` | Isi/edit data identitas diri |
| PUT | `/api/v1/pendaftar/asal-sekolah` | Isi/edit data sekolah asal |
| PUT | `/api/v1/pendaftar/orang-tua` | Isi/edit data orang tua dan wali |
| PUT | `/api/v1/pendaftar/prodi-gelombang` | Pilih program studi dan gelombang |
| POST | `/api/v1/pendaftar/submit` | Final submit -> kunci data, buat nomor pendaftaran |
| POST | `/api/v1/pendaftar/berkas` | Upload dokumen berkas (multipart/form-data) |
| DELETE | `/api/v1/pendaftar/berkas/:id` | Hapus dokumen berkas yang belum diverifikasi |
| GET | `/api/v1/pembayaran/info-rekening` | Info rekening bank dan instruksi pembayaran |
| POST | `/api/v1/pembayaran/konfirmasi` | Upload bukti transfer dan konfirmasi pembayaran |
| GET | `/api/v1/pembayaran/status` | Cek status verifikasi pembayaran |
| GET | `/api/v1/berkas/:id` | Stream/download berkas terenkripsi |

**Contoh Request: PUT `/api/v1/pendaftar/identitas`**

```json
{
  "jenis_kelamin": "Laki-laki",
  "alamat": "Jl. Merdeka No. 1, Situbondo",
  "tempat_lahir": "Situbondo",
  "tanggal_lahir": "2003-01-01",
  "status_warga_negara": "WNI",
  "agama": "Islam",
  "status_pernikahan": "Tidak Kawin"
}
```

### 9.5 Endpoint Administrator (`/api/v1/admin`)

*Header wajib: `Authorization: Bearer <JWT_TOKEN>` | Role: `admin_pmb` atau `super_admin`*

| Method | Endpoint | Deskripsi | Role Min. |
|--------|----------|-----------|-----------|
| GET | `/api/v1/admin/dashboard/stats` | Statistik agregat pendaftar, pembayaran | admin_pmb |
| GET | `/api/v1/admin/pendaftar` | Daftar pendaftar (search, filter, paginasi) | admin_pmb |
| GET | `/api/v1/admin/pendaftar/:id` | Detail lengkap 1 pendaftar | admin_pmb |
| PUT | `/api/v1/admin/pendaftar/:id/verifikasi-berkas` | Setujui / Tolak berkas pendaftar | admin_pmb |
| PUT | `/api/v1/admin/pendaftar/:id/verifikasi-pembayaran` | Setujui / Tolak pembayaran pendaftar | admin_pmb |
| PUT | `/api/v1/admin/pendaftar/:id/status-seleksi` | Ubah status kelulusan | admin_pmb |
| GET | `/api/v1/admin/gelombang` | Daftar gelombang pendaftaran | admin_pmb |
| POST | `/api/v1/admin/gelombang` | Buat gelombang baru | admin_pmb |
| PUT | `/api/v1/admin/gelombang/:id` | Update data/status aktif gelombang | admin_pmb |
| GET | `/api/v1/admin/program-studi` | Daftar program studi | admin_pmb |
| POST | `/api/v1/admin/program-studi` | Tambah program studi baru | admin_pmb |
| PUT | `/api/v1/admin/program-studi/:id` | Update data program studi | admin_pmb |
| GET | `/api/v1/admin/logs` | Riwayat log audit aktivitas | admin_pmb |
| GET | `/api/v1/admin/settings` | Ambil konfigurasi pengumuman dan CMS | admin_pmb |
| PUT | `/api/v1/admin/settings` | Update pengumuman CMS dan banner | admin_pmb |
| GET | `/api/v1/admin/rbac/nav-menus` | Struktur navigasi menu berbasis role aktif | admin_pmb |
| GET | `/api/v1/admin/rbac/roles` | Daftar seluruh role sistem | super_admin |
| POST | `/api/v1/admin/rbac/roles` | Tambah role baru | super_admin |
| PUT | `/api/v1/admin/rbac/roles/:id` | Update informasi role | super_admin |
| GET | `/api/v1/admin/rbac/menu-groups` | Daftar kelompok menu navigasi | super_admin |
| POST | `/api/v1/admin/rbac/menu-groups` | Buat kelompok menu baru | super_admin |
| PUT | `/api/v1/admin/rbac/menu-groups/:id` | Update kelompok menu | super_admin |
| GET | `/api/v1/admin/rbac/menus` | Daftar menu navigasi | super_admin |
| POST | `/api/v1/admin/rbac/menus` | Tambah menu navigasi baru | super_admin |
| GET | `/api/v1/admin/rbac/role-permissions/:role_kode` | Matriks hak akses untuk role spesifik | super_admin |
| POST | `/api/v1/admin/rbac/role-permissions` | Update izin akses menu untuk suatu role | super_admin |

**Contoh Request: PUT `/api/v1/admin/pendaftar/:id/verifikasi-berkas`**

```json
{
  "status": "valid",
  "catatan_admin": "Berkas sudah lengkap dan sesuai persyaratan"
}
```

```json
{
  "status": "invalid",
  "catatan_admin": "KTP tidak terbaca dengan jelas. Mohon upload ulang dengan resolusi lebih baik."
}
```

**Contoh Request: POST `/api/v1/admin/gelombang`**

```json
{
  "nama": "Gelombang 2 - TA 2026/2027",
  "tahun_akademik": "2026/2027",
  "tanggal_buka": "2026-10-01T00:00:00Z",
  "tanggal_tutup": "2026-11-30T23:59:59Z",
  "biaya_pendaftaran": 250000,
  "kuota": 100,
  "is_aktif": true
}
```

---

## 10. Keamanan Sistem

### 10.1 Alur Autentikasi JWT

```
ALUR AUTENTIKASI JWT
======================

[1] User Login (POST /api/v1/auth/login)
         |
         v
[2] Backend validasi email/NIK + password (bcrypt compare)
         |
         +-- [Gagal] --> 401 Unauthorized
         v [Berhasil]
[3] Backend generate JWT Token
    Payload: { user_id, email, role, exp }
    Secret: JWT_SECRET (dari environment variable, tidak pernah di-commit)
         |
         v
[4] Client simpan token
         |
         v
[5] Client kirim request:
    Authorization: Bearer <JWT_TOKEN>
         |
         v
[6] Middleware auth.go validasi token
         |
         +-- [Token tidak valid/expired] --> 401 Unauthorized
         v [Token valid]
[7] Middleware RequireRoles() cek role
         |
         +-- [Role tidak sesuai] --> 403 Forbidden
         v [Role sesuai]
[8] Handler dieksekusi
```

### 10.2 Keamanan Upload File

```
Validasi yang dilakukan (SERVER-SIDE):
1. Ukuran file maks. 2 MB (2.097.152 bytes)
2. MIME type whitelist: image/jpeg, image/png, image/jpg, application/pdf
3. Ekstensi file whitelist: .jpg, .jpeg, .png, .pdf
4. File disimpan di direktori terproteksi (bukan public/static folder)
5. Nama file di-generate ulang (UUID) untuk mencegah path traversal attack
6. File hanya dapat diakses melalui endpoint autentikasi:
   GET /api/v1/berkas/:id + Bearer Token
7. Akses langsung via URL publik diblokir (403/404)
```

### 10.3 Proteksi API

| Ancaman | Mitigasi |
|---------|----------|
| SQL Injection | GORM ORM dengan parameterized query |
| XSS | Sanitasi input/output; Content-Security-Policy header |
| CSRF | Token CSRF per-request untuk operasi mutasi |
| Brute Force | Rate limiting dan lockout setelah N kali percobaan gagal |
| Data Exposure | Berkas dokumen tidak dapat diakses via URL publik langsung |
| Session Hijacking | JWT dengan expiry time; validasi setiap request |

### 10.4 Environment Variables Wajib

```env
PORT=8080
APP_ENV=development
DB_USER=root
DB_PASSWORD=<password_database>
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=pmb_staici_db
JWT_SECRET=<random_secret_yang_kuat>
UPLOAD_DIR=./uploads
```

> **PENTING**: Seluruh kredensial wajib disimpan di environment variable/secret manager, tidak pernah di-commit ke repository public.

---

## 11. Rencana Pengujian

### 11.1 Skenario Pengujian End-to-End (E2E) Utama

| No. | Skenario | Langkah Utama | Expected Result |
|-----|----------|---------------|-----------------|
| E2E-1 | Alur Pendaftaran Lengkap | Registrasi -> verifikasi email -> login -> isi 4 tab formulir -> upload semua berkas wajib -> submit | Nomor pendaftaran dibuat (PMB-XXXX-XXXX), data terkunci |
| E2E-2 | Pembayaran dan Verifikasi Admin | Upload bukti transfer -> admin login -> setujui pembayaran -> cek perubahan status | Status terupdate, email notifikasi terkirim ke pendaftar |
| E2E-3 | Penolakan dan Revisi Berkas | Admin tolak berkas + alasan -> status kembali ke belum_lengkap -> pendaftar revisi -> submit ulang | Alasan penolakan tampil di dashboard, pendaftar dapat upload ulang |
| E2E-4 | Pengumuman Seleksi | Admin publikasikan pengumuman -> hasil hanya tampil ke pendaftar terkait | Pengumuman hanya tampil setelah dipublikasikan admin |
| E2E-5 | Alur Daftar Ulang | Admin set status Lolos Seleksi -> pendaftar daftar ulang -> upload dokumen tambahan | Status berubah ke daftar_ulang, data tercatat |

### 11.2 Kasus Pengujian Khusus (Edge Case)

| No. | Kasus Uji | Skenario | Expected Result |
|-----|-----------|----------|-----------------|
| EC-1 | File melebihi 2 MB | Upload file berukuran 3 MB | Sistem tolak + tampilkan pesan error jelas |
| EC-2 | Format file tidak sesuai | Upload file .exe atau .docx | Sistem tolak + tampilkan pesan error |
| EC-3 | Duplikasi pendaftaran | Pendaftar yang sudah submit mencoba submit ulang | Sistem tolak dengan pesan "Data sudah dikunci" |
| EC-4 | Race condition verifikasi | Dua admin verifikasi pendaftar sama secara bersamaan | Hanya satu yang berhasil, satu mendapat conflict error |
| EC-5 | Gelombang tanggal tumpang tindih | Admin buat gelombang baru dengan tanggal overlapping gelombang aktif | Sistem validasi dan tolak input |
| EC-6 | Akses berkas tanpa autentikasi | Coba akses URL langsung /uploads/ktp/xxx.jpg | 403 Forbidden / 404 Not Found |
| EC-7 | Login dengan kredensial salah berulang | Percobaan login salah lebih dari N kali | Akun terkunci sementara (rate limiting) |
| EC-8 | Submit formulir tidak lengkap | Pendaftar submit tanpa mengisi semua field wajib | Validasi gagal + pesan error per field |

### 11.3 Pengujian Tambahan

| Jenis Pengujian | Tools yang Digunakan | Cakupan |
|-----------------|---------------------|---------|
| E2E Frontend | Playwright / Cypress | Seluruh skenario utama di browser |
| Load / Stress Test | k6 / JMeter | Simulasi lonjakan trafik saat gelombang aktif |
| Security Scan | OWASP ZAP / vulnerability scanner | Sebelum go-live (Tahap 4 Roadmap) |
| UAT (User Acceptance) | Checklist manual bersama STAICI | Verifikasi seluruh skenario E2E di atas |

### 11.4 Kriteria Penerimaan (Acceptance Criteria)

| Fitur | Kriteria Penerimaan |
|-------|---------------------|
| Registrasi dan Verifikasi | Pengguna dapat daftar; email verifikasi terkirim; akun aktif hanya setelah verifikasi berhasil. |
| Pengisian Formulir | Semua field wajib tervalidasi sebelum data disubmit; data tersimpan otomatis sebagai draft. |
| Upload Berkas | File lebih dari 2MB atau format salah ditolak + pesan error jelas; berkas dapat diganti sebelum diverifikasi. |
| Submit Pendaftaran | Nomor pendaftaran (PMB-XXXX-XXXX) dibuat otomatis; seluruh data terkunci dari perubahan pendaftar. |
| Pembayaran | Status berubah sesuai alur hanya melalui aksi admin; alasan penolakan wajib diisi dan tampil ke pendaftar. |
| Alur Status dan Revisi | Berkas ditolak -> status kembali ke "Belum Lengkap" + alasan tampil di dashboard pendaftar. |
| Pengumuman Seleksi | Hasil seleksi tampil ke pendaftar terkait hanya setelah admin mempublikasikan, sesuai timeline. |
| Dashboard Admin | Admin dapat cari/filter pendaftar berdasarkan nama; statistik real-time dan akurat. |
| Keamanan Akses Berkas | Berkas tidak dapat diakses langsung via URL publik tanpa otorisasi. |
| Log Aktivitas | Setiap perubahan data oleh admin tercatat: nama admin, waktu, deskripsi aksi. |
| Responsivitas | Semua halaman utama dapat digunakan dengan baik di perangkat mobile (mobile-first). |

---

## 12. Batasan dan Asumsi

### 12.1 Dalam Ruang Lingkup (In-Scope)

| Kategori | Termasuk |
|----------|----------|
| Website Publik | Halaman informasi PMB di staicisitubondo.ac.id/pmb |
| Akun dan Autentikasi | Registrasi, verifikasi email, login, lupa/reset password, ubah password |
| Pendaftaran Online | Formulir data pribadi lengkap, upload berkas digital, submit dan nomor pendaftaran otomatis |
| Pembayaran Non-Gateway | Info rekening manual, upload bukti transfer, verifikasi manual oleh admin |
| Manajemen Status | Seluruh status pendaftaran, seleksi berkas, opsional ujian/wawancara, pengumuman, daftar ulang |
| Dashboard Mahasiswa | Lihat/edit data, lihat status, kelola berkas, cetak kartu dan bukti pendaftaran |
| Admin / CMS | Manajemen konten dan proses PMB, verifikasi, statistik, log aktivitas, RBAC |
| Keamanan | Hash password, RBAC, validasi upload, HTTPS, proteksi akses berkas, backup database |
| Notifikasi | Notifikasi email untuk event penting |

### 12.2 Di Luar Ruang Lingkup (Out-of-Scope)

| Kategori | Di Luar Lingkup dan Alasan |
|----------|---------------------------|
| Payment Gateway Otomatis | Tidak digunakan; pembayaran tetap manual via transfer bank |
| Notifikasi WhatsApp/SMS | Tidak digunakan karena pertimbangan biaya API |
| Berkas Fisik (Hardcopy) | Proses langsung di kampus saat Daftar Ulang, tidak dikelola sistem |
| Jalur Pendaftaran Ganda | Saat ini hanya Jalur Reguler; KIP sebagai berkas tambahan, bukan jalur terpisah |

### 12.3 Asumsi

| No. | Asumsi |
|-----|--------|
| A-1 | Hanya ada 1 jalur pendaftaran (Reguler) selama pengembangan awal. |
| A-2 | KIP diasumsikan sebagai berkas tambahan dalam jalur reguler, bukan jalur terpisah. |
| A-3 | Gelombang pendaftaran, biaya, dan kuota bersifat dinamis dan dikelola admin via CMS. |
| A-4 | Server/hosting disediakan oleh STAICI melalui idwebhost.com. |
| A-5 | Email service tersedia dan dapat digunakan untuk notifikasi. |
| A-6 | Calon mahasiswa memiliki akses internet dan perangkat (mobile/desktop). |

---

## 13. Risiko dan Mitigasi

| No. | Risiko | Dampak | Mitigasi |
|-----|--------|--------|----------|
| R-1 | Definisi "Nilai rata-rata/IP UAS" pada formulir asal sekolah belum dikonfirmasi STAICI | Medium | Konfirmasi definisi field ke STAICI sebelum development formulir dimulai. |
| R-2 | Belum ada keputusan apakah seluruh field Data Orang Tua diisi saat pendaftaran awal atau ditunda ke Daftar Ulang | High | Diputuskan bersama STAICI sebelum perancangan database dan UI formulir dimulai. |
| R-3 | Pembayaran manual bergantung pada ketelitian admin dalam verifikasi bukti transfer | Medium | SOP verifikasi yang jelas; indikator waktu verifikasi pada dashboard admin. |
| R-4 | Data sensitif (KTP/KK, penghasilan orang tua) tersimpan dalam sistem | High | Hash password, RBAC, HTTPS, enkripsi at-rest, proteksi akses berkas, backup rutin. |
| R-5 | Ketergantungan pada hosting pihak ketiga (idwebhost.com) | Medium | Koordinasi spesifikasi hosting sejak awal; strategi backup database mandiri oleh Admin IT. |
| R-6 | Kesalahan pengaturan gelombang oleh admin (tanggal tumpang tindih) | Medium | Validasi input pada CMS: tanggal gelombang baru tidak boleh overlap dengan gelombang aktif. |
| R-7 | Race condition saat dua admin memverifikasi pendaftar yang sama bersamaan | Low | Implementasi optimistic/pessimistic locking pada endpoint verifikasi. |
| R-8 | Token JWT yang dicuri dapat disalahgunakan | Medium | Expiry time singkat; blacklist token pada logout; refresh token mechanism. |

---

## 14. Glosarium

| Istilah | Definisi |
|---------|---------|
| PMB | Penerimaan Mahasiswa Baru |
| STAICI | STAI Cendekia Insani, Situbondo |
| SRS | Software Requirements Specification - dokumen ini |
| PRD | Product Requirements Document - dokumen kebutuhan produk sumber |
| CMS | Content Management System - panel pengelolaan konten oleh admin |
| RBAC | Role-Based Access Control - kontrol akses berbasis peran |
| JWT | JSON Web Token - token autentikasi stateless |
| VA | Virtual Account - nomor rekening tujuan transfer |
| KIP | Kartu Indonesia Pintar |
| EMIS | Education Management Information System - sistem pelaporan data pendidikan agama |
| NIK | Nomor Induk Kependudukan (16 digit) |
| KK | Kartu Keluarga |
| SKL | Surat Keterangan Lulus |
| Kopertais | Koordinator Perguruan Tinggi Agama Islam Swasta |
| ORM | Object-Relational Mapping - GORM digunakan untuk operasi database |
| GORM | Go ORM library untuk Golang |
| Gin | HTTP web framework untuk Golang |
| Next.js | React framework untuk frontend dengan App Router |
| bcrypt | Algoritma hashing password yang digunakan |
| HTTPS | HyperText Transfer Protocol Secure - protokol komunikasi terenkripsi |
| CRUD | Create, Read, Update, Delete - operasi dasar database |
| UAT | User Acceptance Test - pengujian bersama pengguna akhir |
| ERD | Entity Relationship Diagram - diagram relasi antar tabel database |
| Draft | Status awal sebelum calon mahasiswa mulai mengisi formulir |
| is_locked | Flag boolean pada tabel pendaftars yang bernilai TRUE setelah submit final |
| nomor_pendaftaran | ID unik format PMB-[Tahun]-[Urutan] yang dibuat otomatis saat submit |

---

*Dokumen ini bersifat living document dan akan diperbarui seiring perkembangan proyek.*

*Versi terakhir: 27 September 2026*

*Repository: https://github.com/Davinrach/pmb-full-stack.git*
