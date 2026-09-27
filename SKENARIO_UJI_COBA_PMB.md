# Panduan & Skenario Uji Coba Terstruktur (E2E Test Plan & Security Assessment)
## Sistem Informasi Penerimaan Mahasiswa Baru (PMB) Terpadu
### STAI Cendekia Insani Situbondo

---

## 📌 Pendahuluan & Petunjuk Uji Coba

Dokumen ini disusun sebagai panduan pengujian terstruktur (*Quality Assurance & Security Assessment*) untuk meninjau seluruh fitur website PMB STAICI Situbondo, mulai dari alur calon mahasiswa, portal administrasi panitia/admin, hingga aspek keamanan sistem.

### 🌐 Lingkungan Pengujian (*Testing Environment*):
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api/v1`
- **Database**: MySQL (`pmb_staici_db`)
- **Kredensial Default Admin PMB**:
  - **URL Login Admin**: `http://localhost:3000/loginadmin`
  - **Username**: `admin`
  - **Password**: `adminpmb123`

---

## 📄 1. SKENARIO UJI COBA CALON MAHASISWA (FRONTEND & PORTAL MAHASISWA)

### **TC-01: Peninjauan Beranda Utama (Landing Page)**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 1.1 | Akses URL `http://localhost:3000` di browser. | - | Halaman utama tampil dengan cepat, banner responsive, dan konsisten dengan Tailwind CSS v4. | XSS Sanitize pada konten dinamis. | [ ] |
| 1.2 | Klik menu "Program Studi" pada Navbar. | - | Smooth scroll mengarahkan ke bagian 3 prodi unggulan (MPI, AS, KPI). | No Layout Shift. | [ ] |
| 1.3 | Periksa pengumuman dinamis di top banner. | - | Teks pengumuman memuat data realtime dari API (`/api/v1/public/settings`). | Public API Cache & CORS Safe. | [ ] |

---

### **TC-02: Detail Program Studi Dinamis**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 2.1 | Klik tombol "Detail Prodi MPI". | Slug: `/program-studi/mpi` | Tampil halaman detail Prodi S1 MPI lengkap dengan profil lulusan, kurikulum, & gelar `S.Pd.`. | Validasi parameter slug dinamis. | [ ] |
| 2.2 | Klik tombol "Detail Prodi Hukum Keluarga Islam". | Slug: `/program-studi/as` | Tampil halaman detail Prodi S1 AS lengkap dengan profil lulusan peradilan & gelar `S.H.`. | Fallback alias `hki` -> `as` berjalan mulus. | [ ] |
| 2.3 | Akses slug prodi tidak valid (`/program-studi/xyz`). | Slug: `xyz` | Sistem menampilkan halaman 404 Not Found secara anggun. | Mencegah unhandled error / crash. | [ ] |

---

### **TC-03: Registrasi Akun Calon Mahasiswa Baru**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 3.1 | Buka rute `/register` atau klik tombol "Daftar Sekarang". | - | Tampil form registrasi akun calon mahasiswa. | Form terlindungi HTTPS/TLS. | [ ] |
| 3.2 | Isi NIK kurang dari 16 digit (cth: `12345`). | NIK: `12345` | Tampil peringatan error "NIK harus terdiri dari 16 digit angka". | **Keamanan**: Validasi Sisi Klien & Backend. | [ ] |
| 3.3 | Isi password kurang dari 8 karakter atau konfirmasi password tidak cocok. | Pass: `12345` | Tampil pesan kesalahan validasi password. | **Keamanan**: Policy Kompleksitas Password. | [ ] |
| 3.4 | Submit registrasi dengan data valid NIK 16 digit dan email aktif. | NIK: `3512012345670001`<br>Email: `calon@gmail.com` | Pop-up modal sukses registrasi muncul, mengarahkan user untuk login ke akun. | **Keamanan**: Hashing password menggunakan `bcrypt`. | [ ] |

---

### **TC-04: Login Portal Calon Mahasiswa & Sesi JWT**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 4.1 | Klik tombol "Masuk" pada Navbar untuk membuka `LoginModal`. | - | Modal pop-up login mahasiswa terbuka. **Verifikasi tautan login admin telah bersih / tidak ada**. | **Keamanan**: Hidden Admin Portal Route. | [ ] |
| 4.2 | Masukkan Email/NIK dan Password salah. | Identifier: `salah@gmail.com` | Tampil pesan error "Email/NIK atau Kata Sandi salah". | **Keamanan**: Generic Error Message (Mencegah Username Enumeration). | [ ] |
| 4.3 | Masukkan kredensial yang telah terdaftar. | Identifier: `calon@gmail.com`<br>Pass: `password123` | Login berhasil, token JWT tersimpan di LocalStorage (`pmb_auth_token`), dan diarahkan ke `/dashboard`. | **Keamanan**: Stateless JWT Bearer Auth dengan masa kadaluarsa token. | [ ] |

---

### **TC-05: Pengisian Formulir Pendaftaran 4 Tahap**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 5.1 | Akses rute `/dashboard/formulir`. | - | Tampil stepper formulir pendaftaran 4 tahap. | Proteksi Rute (`AuthMiddleware`). | [ ] |
| 5.2 | **Tahap 1**: Isi Data Diri (NIK, Tempat/Tgl Lahir, Jenis Kelamin, Alamat KTP). | Data Diri Lengkap | Data tersimpan via `PUT /api/v1/pendaftar/identitas`. | Sanitasi karakter input anti-XSS. | [ ] |
| 5.3 | **Tahap 2**: Isi Data Asal Sekolah (NPSN, Nama Sekolah, NISN, Tahun Lulus). | Data Sekolah | Data tersimpan via `PUT /api/v1/pendaftar/asal-sekolah`. | Validasi format numerik NISN/NPSN. | [ ] |
| 5.4 | **Tahap 3**: Isi Data Orang Tua / Wali (Nama Ayah, Ibu, Pekerjaan, No HP Ortu). | Data Ortu | Data tersimpan via `PUT /api/v1/pendaftar/orang-tua`. | Validation binding pada Golang Gin. | [ ] |
| 5.5 | **Tahap 4**: Pilih Program Studi & Gelombang Pendaftaran. | Prodi: MPI<br>Gelombang: Gelombang 1 | Data tersimpan via `PUT /api/v1/pendaftar/prodi-gelombang`. | Konsistensi data kuota gelombang. | [ ] |
| 5.6 | Klik **Final Submit / Kunci Formulir**. | - | Status pendaftaran berubah menjadi `terkunci`, formulir tidak dapat diubah lagi oleh user. | **Keamanan**: Immutability setelah submit akhir. | [ ] |

---

### **TC-06: Upload Dokumen Berkas Fisik PMB**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 6.1 | Unggah berkas KTP/Ijazah dengan format non-gambar/PDF (cth: `.exe` atau `.php`). | File: `virus.php` | Backend menolak file dengan pesan "Format file tidak diizinkan". | **Keamanan**: Extension & MIME Type Whitelisting. | [ ] |
| 6.2 | Unggah berkas ukuran > 2MB. | File: `foto_5mb.jpg` | Upload ditolak karena melebihi batas ukuran 2MB. | **Keamanan**: Max Body Payload Size Limit. | [ ] |
| 6.3 | Unggah berkas KTP, Ijazah, KK format `.jpg` / `.pdf` ukuran < 2MB. | File: `ktp_valid.pdf` | Berkas berhasil diunggah dan disimpan ke folder privat terenkripsi. | **Keamanan**: Obfuscated Unique Filename (UUID). | [ ] |

---

### **TC-07: Konfirmasi & Pembayaran Biaya Pendaftaran**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 7.1 | Akses rute `/dashboard/pembayaran`. | - | Menampilkan nomor Virtual Account / Rekening Bank resmi kampus & nominal biaya. | Anti-tampering nominal biaya. | [ ] |
| 7.2 | Unggah Bukti Transfer & Konfirmasi Pembayaran. | File: `bukti_tf.png`<br>Bank: BCA | Bukti transfer terunggah dan status berubah menjadi `Menunggu Verifikasi Admin`. | Audit log pencatatan tanggal transaksi. | [ ] |

---

### **TC-08: Hasil Seleksi, Pengumuman & Cetak PDF**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 8.1 | Akses rute `/dashboard/pengumuman`. | - | Menampilkan pengumuman resmi status seleksi pendaftar. | Read-only access control. | [ ] |
| 8.2 | Akses rute `/dashboard/cetak` dan klik "Cetak Kartu Peserta Ujian". | - | Berhasil mengunduh / membuka layout cetak Kartu Ujian & Formulir PDF resmi. | Verifikasi watermark & Nomor Pendaftaran unik. | [ ] |

---

## 🛡️ 2. SKENARIO UJI COBA ADMIN & CMS PENGELOLA (ADMIN PORTAL)

### **TC-09: Access Control & Login Portal Admin**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 9.1 | Akses portal admin via URL rahasia `http://localhost:3000/loginadmin`. | - | Halaman login khusus Admin PMB terbuka. | **Keamanan**: Port terpisah / Route terisolasi dari publik. | [ ] |
| 9.2 | Coba login menggunakan akun calon mahasiswa biasa (`calon@gmail.com`). | Role: `calon_mahasiswa` | Akses ditolak dengan pesan "Akun ini bukan terdaftar sebagai Administrator". | **Keamanan**: Strictly Role Check pada Auth Login. | [ ] |
| 9.3 | Login menggunakan akun Admin PMB resmi (`admin` / `adminpmb123`). | Role: `admin_pmb` | Login sukses, token JWT disimpan, dan diarahkan ke `/admincms`. | **Keamanan**: JWT Role Claim verification. | [ ] |

---

### **TC-10: Dashboard Analytics & Manajemen Pendaftar**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 10.1 | Buka tab "Dashboard Overview" di Admin CMS. | - | Menampilkan kartu statistik realtime (Total Pendaftar, Terverifikasi, Total Transaksi, Chart Prodi). | Query Optimization & Indexing DB. | [ ] |
| 10.2 | Buka tab "Data Pendaftar" dan lakukan pencarian Nama/NIK. | Search: `Ahmad` | Tabel menyaring data pendaftar sesuai kata kunci pencarian secara cepat. | SQL Injection Protection (GORM Parameterized Query). | [ ] |
| 10.3 | Klik "Detail Pendaftar". | ID Pendaftar: `1` | Membuka modal/drawer detail lengkap biodata, orang tua, sekolah, dan dokumen berkas. | RBAC Authorization Check. | [ ] |

---

### **TC-11: Verifikasi Berkas Fisik & Verifikasi Pembayaran**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 11.1 | Klik tombol "Lihat Berkas KTP/Ijazah" pendaftar. | Stream API: `/api/v1/berkas/:id` | Berkas terbuka melalui protected streaming tanpa mengekspos direktori file fisik backend. | **Keamanan**: Protected File Streaming (PRD 7.1). | [ ] |
| 11.2 | Klik "Verifikasi Berkas" -> Setujui / Tolak dengan alasan. | Status: `Disetujui` | Status berkas terupdate dan calon mahasiswa melihat status terverifikasi di dashboard-nya. | Audit trail tercatat nama admin pemverifikasi. | [ ] |
| 11.3 | Klik "Verifikasi Pembayaran" -> Setujui transaksi transfer. | Status: `Lunas` | Status pembayaran terupdate `Lunas`, otomatis membuka akses Cetak Kartu Ujian. | Transactional Integrity (DB Commit/Rollback). | [ ] |

---

### **TC-12: Manajemen Status Seleksi Kelulusan**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 12.1 | Ubah status seleksi pendaftar menjadi `Lulus Utama` pada prodi pilihan. | Status: `Lulus` | Data terupdate di DB via `PUT /api/v1/admin/pendaftar/:id/status-seleksi`. | Restrict update tanpa token admin. | [ ] |
| 12.2 | Mahasiswa melakukan refresh halaman `/dashboard/pengumuman`. | - | Pengumuman di dashboard mahasiswa langsung berubah menampilkan Surat Keterangan Lulus. | Data sync realtime. | [ ] |

---

### **TC-13: Pengelolaan Gelombang, Prodi & Settings CMS**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 13.1 | Tambah / Edit Gelombang Pendaftaran (Tanggal Buka & Biaya Registrasi). | Gelombang 2 | Gelombang baru tersimpan dan otomatis menjadi opsi aktif pada form pendaftaran. | Admin RBAC check. | [ ] |
| 13.2 | Edit Teks Pengumuman Banner CMS pada tab Pengaturan CMS. | Teks: "Pendaftaran Gelombang 2 Resmi Dibuka!" | Teks pada Landing Page (`/`) langsung terupdate secara otomatis. | Input sanitization pada CMS Text. | [ ] |

---

### **TC-14: Dynamic RBAC & Audit Trail Logs (Super Admin)**
| No | Langkah Pengujian | Data Uji | Ekspektasi Hasil | Tingkat Keamanan / Catatan | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 14.1 | Buka tab "Manajemen Role & Hak Akses (RBAC)". | - | Menampilkan matriks perizinan menu dan tombol aksi untuk tiap role (`super_admin`, `admin_pmb`). | **Keamanan**: Least Privilege Principle. | [ ] |
| 14.2 | Buka tab "Audit Trail / Log Aktivitas". | - | Menampilkan log kronologis aksi admin (waktu, IP address, aksi verifikasi, ID target). | **Keamanan**: Immutable Audit Trail (Non-repudiation). | [ ] |

---

## 🔒 3. MATRIKS EVALUASI KEAMANAN SISTEM (SECURITY ASSESSMENT MATRIX)

| Kode Uji | Kategori Keamanan | Parameter Pengujian | Tingkat Risiko | Ekspektasi Keamanan & Hasil Evaluasi | Status |
| :-: | :--- | :--- | :-: | :--- | :-: |
| **SEC-01** | **Authentication & Session** | Mencoba akses `/dashboard` atau `/admincms` tanpa membawa Token JWT (Header Authorization kosong). | **CRITICAL** | Request ditolak dengan HTTP Status `401 Unauthorized`. Pengguna otomatis di-redirect ke halaman login. | [ ] |
| **SEC-02** | **Broken Access Control (IDOR)** | Akun Mahasiswa A mencoba mengubah formulir milik Mahasiswa B dengan mengganti `pendaftar_id` pada payload HTTP Request. | **CRITICAL** | Backend menolak request karena data hanya diproses berdasarkan `user_id` yang diekstrak dari JWT token terverifikasi. | [ ] |
| **SEC-03** | **Privilege Escalation** | Akun Calon Mahasiswa mencoba memanggil API Admin (`GET /api/v1/admin/pendaftar`). | **HIGH** | Middleware `RequireRoles(admin_pmb, super_admin)` menolak request dengan HTTP Status `403 Forbidden`. | [ ] |
| **SEC-04** | **Unrestricted File Upload** | Mengunggah script executable (`shell.php`, `.exe`, `.jsp`) pada endpoint upload berkas pendaftar. | **CRITICAL** | Backend memeriksa ekstensi file & Magic Bytes MIME Type. File berbahaya langsung ditolak. | [ ] |
| **SEC-05** | **Protected File Storage** | Mencoba mengakses file dokumen pendaftar secara langsung via URL publik browser (cth: `http://localhost:8080/uploads/ktp123.pdf`). | **HIGH** | Akses direktori langsung ditolak (HTTP 403/404). File hanya bisa diakses via streaming terautentikasi `/api/v1/berkas/:id`. | [ ] |
| **SEC-06** | **SQL Injection (SQLi)** | Memasukkan payload SQL Injection (cth: `' OR '1'='1`) pada kolom login atau pencarian pendaftar. | **CRITICAL** | GORM ORM menggunakan Parameterized Queries / Prepared Statements, sehingga payload dianggap sebagai string biasa. | [ ] |
| **SEC-07** | **Password Storage Hashing** | Memeriksa tabel `users` pada basis data MySQL. | **CRITICAL** | Password tidak disimpan dalam teks polos (plain text), melainkan di-hash menggunakan algoritma **bcrypt** dengan salt cost aman. | [ ] |
| **SEC-08** | **Cross-Site Scripting (XSS)** | Memasukkan script `<script>alert('xss')</script>` pada nama lengkap pendaftar atau formulir CMS. | **HIGH** | React secara otomatis melakukan HTML-entity escaping saat merender variabel ke DOM, mencegah eksekusi script. | [ ] |
| **SEC-09** | **CORS & Header Security** | Memeriksa response header API pada browser. | **MEDIUM** | Response memuat `Access-Control-Allow-Origin` terkonfigurasi, `X-Content-Type-Options: nosniff`, dan `X-Frame-Options: DENY`. | [ ] |

---

## 📋 4. LEMBAR CATATAN REVIEW & REVISI PENGUJIAN

Gunakan tabel ini untuk mencatat temuan atau perbaikan saat Anda melakukan peninjauan website:

| Tanggal | Modul / Fitur | Catatan Temuan / Perbaikan | Prioritas (High/Med/Low) | Status Perbaikan |
| :--- | :--- | :--- | :-: | :-: |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

---

> **Petunjuk Pelaksanaan Review:**
> Anda dapat menandai checkbox `[ ]` menjadi `[x]` pada dokumen ini saat melakukan pengujian satu per satu. Jika ditemukan bugs atau kekurangan pada fitur tertentu, cukup infokan ke saya untuk segera diperbaiki!
