# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Website Penerimaan Mahasiswa Baru (PMB)**

STAI Cendekia Insani (STAICI) Situbondo

Versi Dokumen 1.1

22 September 2026

*Status: Draft (Revisi)*

## Daftar Isi

## 1. Document Information

### 1.1 Identitas Dokumen

| **Item** | **Keterangan** |
|---|---|
| Nama Dokumen | Product Requirements Document (PRD) — Website Penerimaan Mahasiswa Baru (PMB) STAICI |
| Nama Sistem | Website PMB STAI Cendekia Insani (STAICI) Situbondo |
| Versi Dokumen | 1.1 |
| Tanggal Dibuat | 19 September 2026 |
| Disusun Oleh | [Nama Penulis / Peneliti] |
| Status Dokumen | Draft (Revisi) — prototype UI/UX Figma sudah tersedia; menyesuaikan detail implementasi berdasarkan prototype tersebut serta poin-poin keamanan, observability, test plan, dan version control hasil diskusi lanjutan dengan tim. |
| Sumber Acuan | Dokumen requirement "Website PMB" (hasil wawancara/diskusi dengan pihak STAICI) & rancangan UI/UX Figma (menyusul) |

### 1.2 Riwayat Revisi

| **Versi** | **Tanggal** | **Deskripsi Perubahan** | **Penulis** |
|---|---|---|---|
| 1.0 | 19 Sep 2026 | Draf awal PRD disusun berdasarkan dokumen requirement PMB | [Nama Penulis] |
| 1.1 | 22 Sep 2026 | Penambahan detail: status desain (prototype Figma tersedia), perluasan Non-Functional Requirements Keamanan, section baru Observability & Error Handling (7.7) dan Development Workflow & Version Control (7.8), Test Plan E2E/UAT (10.5), serta referensi repository kode sumber. | [Nama Penulis] |

## 2. Product Overview & Goals

### 2.1 Latar Belakang

Setiap tahun, STAI Cendekia Insani (STAICI) Situbondo melaksanakan proses Penerimaan Mahasiswa Baru (PMB) yang saat ini dijalankan secara manual/semi-manual. Jumlah gelombang pendaftaran bersifat dinamis, disesuaikan dengan target jumlah mahasiswa per tahun, sehingga setiap gelombang dapat memiliki tanggal buka/tutup, biaya pendaftaran, dan kuota yang berbeda-beda. Kompleksitas ini, ditambah kebutuhan pengumpulan data pribadi calon mahasiswa yang sangat rinci (mengacu pada Formulir Lembar Penerimaan Mahasiswa Baru untuk pelaporan Kopertais IV Surabaya/EMIS), membuat proses PMB manual rentan terhadap kesalahan data, lambatnya verifikasi, dan sulitnya pelacakan status pendaftar.

### 2.2 Rumusan Masalah

- Proses pendaftaran, verifikasi berkas, dan verifikasi pembayaran yang manual berisiko lambat dan rawan kesalahan.
- Belum ada sistem terpusat untuk melacak status setiap calon mahasiswa dari pendaftaran hingga daftar ulang.
- Data pribadi calon mahasiswa yang sangat rinci (termasuk data orang tua) memerlukan pengelolaan yang terstruktur dan aman.
- Admin PMB memerlukan cara yang efisien untuk mencari, memfilter, dan memantau statistik pendaftar dari banyak gelombang/jalur.

### 2.3 Tujuan Produk

- Menyediakan platform pendaftaran online yang mudah diakses calon mahasiswa, mobile-first, dan dapat digunakan berulang setiap tahun/gelombang.
- Mengotomasi alur status pendaftaran mulai dari pembuatan akun hingga daftar ulang, termasuk mekanisme revisi berkas yang ditolak.
- Menyediakan CMS yang memudahkan admin PMB mengelola seluruh aspek PMB (gelombang, jalur, biaya, program studi, konten, dll.) tanpa bergantung pada pengembang.
- Menjamin keamanan data pribadi calon mahasiswa sesuai kebutuhan sensitivitas data (KTP, KK, data ekonomi orang tua).
- Menyediakan website publik informasi PMB yang informatif sebagai pintu masuk pendaftaran.

### 2.4 Ruang Lingkup Singkat

Produk mencakup: website publik informasi PMB, sistem akun & pendaftaran online untuk calon mahasiswa, sistem pembayaran manual (non-gateway), alur status & seleksi pendaftaran, dashboard mahasiswa, serta CMS/Admin untuk mengelola seluruh proses dan konten PMB. Rincian ruang lingkup dijelaskan lebih lanjut pada Bagian 10.

## 3. Users & Stakeholders

Berikut aktor-aktor yang berinteraksi dengan sistem beserta kebutuhan utamanya:

| **Aktor** | **Deskripsi** | **Kebutuhan Utama** |
|---|---|---|
| Calon Mahasiswa | Pengguna publik yang mendaftar sebagai calon mahasiswa baru STAICI. | Pendaftaran mudah, status jelas, upload berkas praktis, notifikasi tepat waktu, dapat mencetak bukti/kartu pendaftaran. |
| Admin PMB | Staf STAICI yang mengelola proses PMB melalui CMS. | Verifikasi berkas & pembayaran cepat, pencarian/filter pendaftar, statistik pendaftaran, kontrol penuh atas konten & jalur/gelombang. |
| Pihak STAICI (Manajemen/Yayasan) | Pemilik proses bisnis PMB, penentu kebijakan gelombang, jalur, biaya, dan kuota. | Data pendaftar akurat & rapi, laporan yang bisa dipertanggungjawabkan, kepatuhan terhadap format data Kopertais/EMIS. |
| Kopertais IV Surabaya | Lembaga yang membutuhkan data pelaporan mahasiswa PT keagamaan. | Data pribadi & data orang tua calon mahasiswa yang lengkap dan sesuai format pelaporan EMIS. |
| Admin IT STAICI | Pengelola infrastruktur, hosting, dan backup sistem. | Sistem stabil, aman, mudah di-maintain, backup data terjadwal. |

### 3.1 Hak Akses Login

- Calon Mahasiswa: dapat login setelah registrasi & verifikasi email berhasil, dengan akses terbatas pada data miliknya sendiri.
- Admin PMB: satu-satunya pihak yang dapat login ke CMS, dengan hak akses diatur berbasis peran (role-based access).

## 4. User Journey & Business Process

### 4.1 Alur Pendaftaran Calon Mahasiswa (End-to-End)

1. Calon mahasiswa mengunjungi website publik PMB (staicisitubondo.ac.id/pmb) dan memilih "Daftar Sekarang".
2. Calon mahasiswa membuat akun (Nama Lengkap, Email, No. HP/WA, Password, NIK) — status: Akun Terdaftar.
3. Sistem mengirim email verifikasi; akun aktif setelah diverifikasi.
4. Calon mahasiswa login dan mengisi formulir data pribadi (Identitas, Asal Sekolah, Data Orang Tua, Wali jika ada, Kontak, Pilihan Program Studi) serta mengunggah berkas wajib — status: Belum Lengkap.
5. Setelah formulir & berkas lengkap, sistem meminta pembayaran biaya pendaftaran — status: Menunggu Pembayaran.
6. Calon mahasiswa transfer ke VA/rekening yang ditentukan dan mengunggah bukti transfer sebagai berkas.
7. Setelah bukti transfer diunggah, status berubah menjadi Menunggu Verifikasi.
8. Calon mahasiswa men-submit pendaftaran; sistem membuat nomor pendaftaran otomatis (PMB-[Tahun]-[Urutan]) dan mengunci data dari perubahan lebih lanjut oleh pendaftar.
9. Admin memverifikasi berkas dan pembayaran. Jika sah → Berkas Diverifikasi. Jika tidak sah → Ditolak/Perlu Perbaikan, status kembali ke Belum Lengkap agar pendaftar dapat merevisi dan mengulang alur dari langkah 4.
10. (Opsional) Jika STAICI mensyaratkan tes/wawancara, status berubah menjadi Mengikuti Ujian/Wawancara.
11. Pihak STAICI melakukan seleksi akhir berdasarkan keabsahan berkas (dan hasil ujian/wawancara jika ada) → status Lolos Seleksi atau Tidak Lolos.
12. Hasil diumumkan melalui akun PMB pendaftar sesuai timeline pengumuman.
13. Pendaftar yang Lolos Seleksi melakukan Daftar Ulang (bayar her-registrasi, upload dokumen tambahan) untuk menjadi mahasiswa aktif; data kemudian "naik kelas" menjadi data mahasiswa aktif yang disimpan permanen sebagai rekam akademik.

### 4.2 Alur Bisnis Verifikasi oleh Admin

14. Admin menerima notifikasi/melihat daftar pendaftar berstatus Menunggu Verifikasi pada dashboard admin.
15. Admin memeriksa kelengkapan & keabsahan berkas (KK, KTP, Ijazah/SKL, Pas Foto) serta bukti pembayaran.
16. Admin memverifikasi pembayaran: menyetujui (lanjut ke verifikasi berkas) atau menolak dengan alasan (status pembayaran: Pembayaran Ditolak, pendaftar diminta mengunggah ulang).
17. Admin memverifikasi berkas: menyetujui (Berkas Diverifikasi, lanjut ke tahap seleksi/ujian) atau menolak dengan alasan (status kembali ke Belum Lengkap).
18. Seluruh aksi admin tercatat otomatis dalam log aktivitas admin.

### 4.3 Diagram Alur Status (Ringkasan)

Draft (opsional) → Akun Terdaftar → Belum Lengkap ⇄ (jika ditolak) Berkas Diverifikasi/Ditolak → Menunggu Pembayaran → Menunggu Verifikasi → Berkas Diverifikasi → (opsional) Mengikuti Ujian/Wawancara → Lolos Seleksi / Tidak Lolos → Daftar Ulang. Status Dibatalkan/Kadaluarsa dapat terjadi dari status manapun sebelum verifikasi jika pendaftar tidak melengkapi persyaratan hingga batas waktu. Diagram alur visual (flowchart) akan dilampirkan pada Bagian 12 setelah tahap desain.

## 5. Functional Requirements

### 5.1 Akun & Autentikasi

| **ID** | **Kebutuhan Fungsional** | **Deskripsi** |
|---|---|---|
| FR-1.1 | Registrasi Akun | Calon mahasiswa mendaftar akun dengan Nama Lengkap, Email, No. HP/WhatsApp aktif, Password, dan NIK. |
| FR-1.2 | Verifikasi Email | Sistem mengirim email verifikasi (notifikasi ke Gmail/email pendaftar) untuk mengaktifkan akun. |
| FR-1.3 | Lupa/Reset Password | Pengguna dapat meminta reset password melalui email jika lupa password. |
| FR-1.4 | Ubah Password | Pengguna yang sudah login dapat mengubah password akun. |
| FR-1.5 | Ubah Email | Pengguna dapat mengubah alamat email dengan proses verifikasi ulang. |
| FR-1.6 | Login/Logout | Pengguna dapat login menggunakan email & password yang terdaftar. |

### 5.2 Formulir Data Pendaftaran

| **ID** | **Kebutuhan Fungsional** | **Deskripsi** |
|---|---|---|
| FR-2.1 | Formulir Identitas Mahasiswa | Nama Lengkap, Jenis Kelamin, Alamat, Tempat & Tanggal Lahir, Status Warga Negara (+ Negara jika WNA), Agama, Status Pernikahan. |
| FR-2.2 | Formulir Asal Sekolah (SLTA) | Nama Sekolah, Status Sekolah (Negeri/Swasta), Program/Jurusan, Nilai rata-rata/IP UAS, Tahun Lulus. |
| FR-2.3 | Formulir Data Orang Tua | Data Ayah dan Ibu diisi terpisah dengan field yang sama: Nama, No. KTP & KK, Tempat/Tanggal Lahir, Alamat, Pendidikan, Pekerjaan (pilih dari daftar kode), Penghasilan per Bulan (pilih dari daftar kode). |
| FR-2.4 | Formulir Identitas Wali (opsional) | Nama Wali dan Alamat Wali, diisi jika calon mahasiswa memiliki wali. |
| FR-2.5 | Formulir Informasi Kontak | No. HP Mahasiswa dan No. HP Orang Tua/Wali (juga dipakai untuk penyampaian informasi dari Kopertais IV Surabaya). |
| FR-2.6 | Pilihan Program Studi | Pendaftar memilih salah satu dari 3 program studi: MPI, AS, KPI. |
| FR-2.7 | Simpan Sebagai Draft | Data yang belum lengkap dapat disimpan sementara sebelum disubmit. |
| FR-2.8 | Kunci Data Setelah Submit | Setelah pendaftaran disubmit, seluruh data yang telah dimasukkan tidak dapat diubah lagi oleh pendaftar. |

### 5.3 Upload Berkas

| **ID** | **Kebutuhan Fungsional** | **Deskripsi** |
|---|---|---|
| FR-3.1 | Upload Berkas Wajib | KK, KTP, Ijazah/SKL, Pas Foto 3x4, Bukti Pembayaran — wajib diunggah dalam bentuk digital. |
| FR-3.2 | Upload Berkas Opsional | Kartu KIP dan dokumen pendukung lainnya (jika ada). |
| FR-3.3 | Validasi Ukuran File | Sistem otomatis membatasi & memvalidasi ukuran maksimal 2 MB per file. |
| FR-3.4 | Validasi Format File | Sistem membatasi format file yang diterima (contoh untuk foto: JPG/JPEG, dll.) sesuai jenis dokumen. |
| FR-3.5 | Ganti Berkas | Pendaftar dapat mengganti berkas yang sudah diunggah selama berkas tersebut belum diverifikasi/disahkan admin. |
| FR-3.6 | Jalur KIP | Pendaftar dengan KIP mengunggah kartu KIP sebagai berkas tambahan; berkas ini diseleksi manual oleh pihak PMB (belum ada jalur pendaftaran khusus terpisah dari jalur reguler). |

### 5.4 Pembayaran

| **ID** | **Kebutuhan Fungsional** | **Deskripsi** |
|---|---|---|
| FR-4.1 | Info Rekening VA | Sistem menampilkan nomor Virtual Account/rekening tujuan transfer sesuai bank yang ditentukan STAICI (tanpa payment gateway). |
| FR-4.2 | Upload Bukti Transfer | Pendaftar mengunggah bukti transfer sebagai salah satu berkas wajib. |
| FR-4.3 | Status Pembayaran | Sistem menampilkan status: Menunggu Pembayaran → Menunggu Verifikasi → Pembayaran Terverifikasi / Pembayaran Ditolak (dengan alasan). |
| FR-4.4 | Verifikasi Manual oleh Admin | Admin PMB memverifikasi bukti transfer secara manual melalui CMS dan memilih status terverifikasi/ditolak beserta alasannya. |

### 5.5 Status Pendaftaran

| **ID** | **Kebutuhan Fungsional** | **Deskripsi** |
|---|---|---|
| FR-5.1 | Status Pendaftaran Otomatis | Sistem mengelola status: Draft (opsional) → Akun Terdaftar → Belum Lengkap → Menunggu Pembayaran → Menunggu Verifikasi → Berkas Diverifikasi / Ditolak-Perlu Perbaikan → (opsional) Mengikuti Ujian/Wawancara → Lolos Seleksi / Tidak Lolos → Daftar Ulang. |
| FR-5.2 | Alur Balik Status Ditolak | Jika berkas ditolak/perlu perbaikan, status otomatis kembali ke "Belum Lengkap" agar pendaftar dapat merevisi dan mengulang alur, bukan menjadi status akhir mati. |
| FR-5.3 | Status Kadaluarsa (opsional) | Pendaftar yang tidak membayar/melengkapi berkas hingga batas waktu tertentu dapat ditandai "Dibatalkan/Kadaluarsa" secara otomatis oleh sistem. |
| FR-5.4 | Alasan Penolakan | Mahasiswa dapat melihat alasan penolakan/permintaan perbaikan berkas pada dashboard-nya. |
| FR-5.5 | Nomor Pendaftaran Otomatis | Sistem membuat nomor pendaftaran otomatis dengan format PMB-[Tahun]-[Urutan], contoh PMB-2026-0001, dibuat saat pendaftar submit formulir. |

### 5.6 Seleksi & Pengumuman

| **ID** | **Kebutuhan Fungsional** | **Deskripsi** |
|---|---|---|
| FR-6.1 | Seleksi Berkas | Admin/pihak STAICI memeriksa keabsahan berkas untuk menentukan kelulusan tahap berkas. |
| FR-6.2 | Ujian/Wawancara (opsional) | Jika dipersyaratkan, sistem menyediakan status "Mengikuti Ujian/Wawancara" sebelum hasil akhir seleksi ditentukan. |
| FR-6.3 | Pengumuman Hasil Seleksi | Hasil (Lulus / Berkas ada yang kurang, silakan dilengkapi) ditampilkan di akun PMB masing-masing pendaftar sesuai timeline pengumuman. |
| FR-6.4 | Daftar Ulang | Pendaftar yang dinyatakan lulus melakukan konfirmasi ulang (pembayaran her-registrasi, upload dokumen tambahan) sebelum berstatus mahasiswa aktif. |

### 5.7 Dashboard Calon Mahasiswa

| **ID** | **Kebutuhan Fungsional** | **Deskripsi** |
|---|---|---|
| FR-7.1 | Lihat Data Pendaftaran | Calon mahasiswa dapat melihat seluruh data pendaftaran pribadinya. |
| FR-7.2 | Edit Data (sebelum submit) | Calon mahasiswa dapat mengedit data selama belum disubmit final. |
| FR-7.3 | Lihat Status | Menampilkan status pendaftaran terkini secara real-time. |
| FR-7.4 | Lihat & Ganti Berkas | Melihat berkas yang sudah diunggah dan mengganti berkas yang belum disahkan admin. |
| FR-7.5 | Lihat Pembayaran | Melihat status dan riwayat pembayaran. |
| FR-7.6 | Lihat Pengumuman | Melihat pengumuman hasil seleksi sesuai timeline. |
| FR-7.7 | Cetak Kartu & Bukti Pendaftaran | Mengunduh/mencetak kartu pendaftaran dan bukti pendaftaran dalam format cetak (PDF). |

### 5.8 Admin / CMS

| **ID** | **Kebutuhan Fungsional** | **Deskripsi** |
|---|---|---|
| FR-8.1 | Manajemen Header Website | Admin mengelola konten header/branding website publik PMB. |
| FR-8.2 | Manajemen Data Pendaftar | Admin melihat, mencari, dan memfilter seluruh data pendaftar (contoh: pencarian berdasarkan nama). |
| FR-8.3 | Verifikasi Berkas | Admin memeriksa dan menyetujui/menolak berkas yang diunggah pendaftar, disertai alasan penolakan. |
| FR-8.4 | Verifikasi Pembayaran | Admin memeriksa dan menyetujui/menolak bukti transfer, disertai alasan penolakan. |
| FR-8.5 | Manajemen Seleksi | Admin mencatat hasil seleksi berkas/ujian dan menentukan status kelulusan. |
| FR-8.6 | Manajemen Pengumuman | Admin mengatur timeline dan konten pengumuman hasil seleksi. |
| FR-8.7 | Manajemen Program Studi | Admin dapat menambah, mengedit, dan menghapus data program studi (AS, KPI, MPI, dan penambahan di masa depan). |
| FR-8.8 | Manajemen Jalur PMB | Admin mengelola jalur pendaftaran (saat ini: Jalur Reguler; KIP ditangani sebagai berkas tambahan dalam jalur yang sama). |
| FR-8.9 | Manajemen Gelombang PMB | Admin dapat menambah gelombang pendaftaran baru beserta tanggal buka/tutup, biaya pendaftaran, dan kuota masing-masing gelombang. |
| FR-8.10 | Manajemen Biaya & Persyaratan | Admin mengatur biaya pendaftaran per gelombang dan daftar persyaratan pendaftaran. |
| FR-8.11 | Manajemen Konten Halaman & FAQ | Admin mengelola konten halaman publik PMB (Program Studi, Alur Pendaftaran, Jadwal, FAQ, Kontak, dll.). |
| FR-8.12 | Manajemen Informasi Kontak | Admin mengelola informasi kontak yang ditampilkan di website publik. |
| FR-8.13 | Dashboard Statistik Admin | Admin melihat statistik pendaftaran (contoh: jumlah pendaftar per status, per program studi, per gelombang). |
| FR-8.14 | Log Aktivitas Admin | Sistem mencatat setiap aktivitas admin (nama admin, tanggal & waktu, aksi yang dilakukan) — contoh: "Admin Davin, 15-09-2026 09:30, Mengubah status pendaftaran PMB-00123". |
| FR-8.15 | Role-based Access Control | Hanya admin PMB yang dapat login ke CMS; hak akses diatur berdasarkan peran (role). |

### 5.9 Notifikasi

| **ID** | **Kebutuhan Fungsional** | **Deskripsi** |
|---|---|---|
| FR-9.1 | Notifikasi Email | Sistem mengirim notifikasi via email untuk: verifikasi akun, perubahan status pendaftaran, hasil verifikasi berkas/pembayaran, dan pengumuman seleksi. (WhatsApp/API tidak digunakan karena biaya tinggi). |

### 5.10 Website Publik

| **ID** | **Kebutuhan Fungsional** | **Deskripsi** |
|---|---|---|
| FR-10.1 | Halaman Publik PMB | Menampilkan Program Studi, Jalur Pendaftaran, Persyaratan, Biaya, Alur Pendaftaran, Jadwal PMB, FAQ, Kontak, serta tombol Login/Daftar Sekarang. |
| FR-10.2 | Akses via Subdomain/Path | Website publik PMB dapat diakses melalui staicisitubondo.ac.id/pmb, terintegrasi dengan domain utama STAICI. |

## 6. UI/UX Requirements

*Catatan (update): prototype UI/UX pada Figma sudah tersedia dan menjadi acuan utama tampilan (lihat referensi 12.1). Tim pengembang tinggal menyesuaikan detail komponen, state, dan responsivitas berdasarkan prototype tersebut — bukan lagi menunggu desain dari nol. Ringkasan Page Mapping pada 6.2 tetap berlaku sebagai daftar halaman yang harus ada di prototype.*

### 6.1 Prinsip Desain

- Mobile-first & responsive — seluruh halaman utama harus optimal di perangkat mobile terlebih dahulu, kemudian tablet dan desktop.
- Sederhana & tidak membingungkan — khususnya pada dashboard calon mahasiswa, sesuai permintaan agar tampilan "se-simple mungkin".
- Konsisten dengan identitas visual STAICI (branding, warna, logo kampus).
- Alur formulir pendaftaran yang panjang disajikan bertahap (multi-step/wizard) agar tidak membebani pengguna dalam satu halaman.

### 6.2 Pemetaan Halaman (Page Mapping)

| **Modul** | **Halaman/Layar** | **Status Referensi Desain** |
|---|---|---|
| Website Publik | Landing Page PMB (Program Studi, Jalur, Persyaratan, Biaya, Alur, Jadwal, FAQ, Kontak) | Menyusul (Figma) |
| Autentikasi | Register, Login, Verifikasi Email, Lupa/Reset Password | Menyusul (Figma) |
| Formulir Pendaftaran | Form Identitas Mahasiswa, Form Asal Sekolah, Form Data Orang Tua, Form Wali, Form Kontak, Pilihan Prodi | Menyusul (Figma) |
| Upload Berkas | Halaman Upload & Preview Dokumen, Ganti Berkas | Menyusul (Figma) |
| Pembayaran | Halaman Info VA/Rekening, Upload Bukti Bayar, Status Pembayaran | Menyusul (Figma) |
| Dashboard Mahasiswa | Ringkasan Status, Data Pribadi, Berkas, Pembayaran, Pengumuman, Cetak Kartu/Bukti | Menyusul (Figma) |
| Pengumuman | Halaman Hasil Seleksi | Menyusul (Figma) |
| Admin/CMS | Dashboard Statistik, Data Pendaftar (list/filter/search), Verifikasi Berkas, Verifikasi Pembayaran, Seleksi, Pengumuman, Program Studi, Jalur, Gelombang, Biaya, Persyaratan, Konten Halaman, FAQ, Kontak, Log Aktivitas | Menyusul (Figma) |

### 6.3 Kebutuhan Interaksi Khusus

- Indikator progres pengisian formulir pendaftaran (contoh: 3 dari 6 bagian selesai).
- Preview file sebelum/ sesudah upload, serta indikator validasi ukuran (maks. 2 MB) & format secara real-time.
- Badge/label status pendaftaran yang jelas secara visual (warna berbeda untuk tiap status) pada dashboard mahasiswa maupun admin.
- Notifikasi in-app (banner/alert) saat berkas ditolak, lengkap dengan alasan penolakan.
- Tombol cetak/unduh untuk kartu pendaftaran dan bukti pendaftaran dalam format siap cetak (PDF).
- Fitur pencarian & filter pada tabel data pendaftar di admin/CMS (contoh: filter berdasarkan status, gelombang, program studi, pencarian nama).

## 7. Non-Functional Requirements

### 7.1 Keamanan

- Password pengguna disimpan dalam bentuk hash (bukan plain text).
- Role-based access control (RBAC) untuk membedakan hak akses calon mahasiswa dan admin, termasuk sub-peran admin jika diperlukan.
- Validasi upload file (tipe & ukuran) dilakukan di sisi server, bukan hanya client.
- Pembatasan ukuran file maksimal 2 MB per file, divalidasi otomatis oleh sistem.
- Session management yang aman (timeout otomatis, token/session yang tervalidasi).
- Seluruh komunikasi menggunakan HTTPS.
- Proteksi akses berkas — dokumen (KTP, KK, dll.) tidak boleh dapat diakses langsung melalui URL publik (contoh: .../uploads/ktp/123.jpg dilarang); akses berkas harus melalui endpoint yang terautentikasi dan terotorisasi.
- Backup database dilakukan secara berkala oleh Admin IT STAICI.
- Rate limiting & lockout otomatis setelah beberapa kali percobaan login gagal, untuk mencegah brute-force.
- Kebijakan kompleksitas password minimum (panjang & kombinasi karakter) diterapkan saat registrasi/ubah password.
- Autentikasi dua faktor (2FA) untuk akun Admin PMB pada CMS.
- Proteksi terhadap serangan umum pada aplikasi web: CSRF (token per-request), XSS (sanitasi input/output), dan SQL Injection (parameterized query/ORM).
- Enkripsi data sensitif saat disimpan (at-rest) untuk field NIK, KTP, KK, dan data ekonomi orang tua — tidak hanya password yang di-hash.
- Kepatuhan terhadap UU No. 27/2022 tentang Pelindungan Data Pribadi (PDP): persetujuan (consent) eksplisit saat pengumpulan data, mekanisme hak akses/penghapusan data, serta anonimisasi/penghapusan data setelah masa retensi sesuai 7.5.
- Audit trail akses data pribadi (siapa membuka/mengunduh data pendaftar tertentu dan kapan), terpisah dari log aktivitas admin pada FR-8.14.
- Security testing (vulnerability scan/penetration test dasar) dilakukan sebelum go-live, sebagai bagian dari Tahap 4 Roadmap (Bagian 10.4).

### 7.2 Performa

- Halaman utama (landing page, form, dashboard) dapat memuat dengan cepat meskipun diakses dari koneksi mobile dengan kecepatan terbatas.
- Sistem mampu menangani lonjakan trafik pada masa-masa puncak pendaftaran (mendekati tanggal penutupan gelombang).

### 7.3 Usability

- Antarmuka calon mahasiswa dirancang sederhana agar dapat digunakan tanpa panduan tambahan.
- Pesan error/validasi ditampilkan jelas dan mudah dipahami (bukan pesan teknis).

### 7.4 Kompatibilitas

- Responsive di berbagai ukuran layar (mobile, tablet, desktop) dengan pendekatan mobile-first.
- Kompatibel dengan browser modern yang umum digunakan (Chrome, Safari, Edge, Firefox versi terbaru).

### 7.5 Retensi & Pengelolaan Data

- Data pendaftar yang diterima dan melakukan daftar ulang "naik kelas" menjadi data mahasiswa aktif dan disimpan permanen sebagai rekam akademik.
- Data pendaftar yang tidak lolos/tidak daftar ulang disimpan sekitar 1–2 tahun untuk keperluan audit/pelaporan ke Kemenag/BAN-PT, setelah itu dapat dihapus/diarsipkan.

### 7.6 Teknologi

Front-end dibangun menggunakan Next.js, back-end menggunakan Golang. Hosting disediakan oleh pihak STAICI melalui idwebhost.com, dengan sistem berjalan pada staicisitubondo.ac.id/pmb.

### 7.7 Observability & Error Handling

- Logging terpusat dengan level standar (info/warning/error/critical), mencatat request ID, timestamp, dan ID user/admin terkait, tanpa menyimpan data sensitif mentah (NIK, password) di dalam log.
- Error monitoring otomatis (mis. Sentry atau sejenis) yang mengirim alert ke tim developer saat terjadi error production.
- Format response error API yang konsisten: kode error, pesan teknis untuk developer, dan pesan ramah untuk pengguna (melengkapi kebutuhan usability pada 7.3).
- Environment terpisah untuk development, staging, dan production, agar bug dapat direproduksi di staging sebelum memengaruhi pengguna asli.
- SLA penanganan insiden: target waktu respons maksimal untuk isu kritis (mis. gangguan proses pembayaran/upload) terutama saat gelombang pendaftaran sedang aktif.
- Rencana rollback cepat apabila rilis baru menyebabkan bug, mengingat sistem digunakan musiman dan tidak dapat mengalami downtime lama saat gelombang aktif.

### 7.8 Development Workflow & Version Control

- Source code dikelola pada repository Git: https://github.com/Davinrach/pmb-full-stack.git (bersifat public).
- Strategi branching: branch "main" merepresentasikan kode production, "develop" untuk integrasi fitur, serta branch "feature/*" dan "hotfix/*" untuk pengembangan dan perbaikan cepat.
- Code review wajib melalui pull request dengan minimal satu reviewer sebelum merge ke branch "develop" atau "main".
- CI/CD pipeline menjalankan build & test otomatis pada setiap push, dengan auto-deploy ke staging dan persetujuan manual sebelum deploy ke production (staicisitubondo.ac.id/pmb).
- Pemetaan environment terhadap tahapan Roadmap (10.4): MVP (Tahap 2) diuji di staging, deployment ke production dilakukan pada Tahap 4 setelah pengujian selesai.
- Penandaan rilis (tagging) untuk setiap milestone (contoh: v1.0-mvp, v1.1-modul-pendukung) agar memudahkan rollback per tahap.
- Karena repository bersifat public, kredensial (API key, connection string database, secret JWT, dll.) wajib disimpan di environment variable/secret manager, tidak pernah di-commit ke repository.

## 8. Data & Validation Rules

### 8.1 Data Identitas Mahasiswa

| **Field** | **Tipe / Pilihan** | **Wajib** |
|---|---|---|
| Nama Lengkap | Teks | Ya |
| Jenis Kelamin | Pilihan: Laki-laki / Perempuan | Ya |
| Alamat | Teks | Ya |
| Tempat Lahir | Teks | Ya |
| Tanggal Lahir | Tanggal | Ya |
| Status Warga Negara | Pilihan: WNI / WNA (isi Negara jika WNA) | Ya |
| Agama | Pilihan: Islam / Lainnya | Ya |
| Status Pernikahan | Pilihan: Kawin / Tidak Kawin / Janda / Duda | Ya |

### 8.2 Data Asal Sekolah (SLTA)

| **Field** | **Tipe / Pilihan** | **Wajib** |
|---|---|---|
| Nama Sekolah | Teks | Ya |
| Status Sekolah | Pilihan: Negeri / Swasta | Ya |
| Program/Jurusan | Teks | Ya |
| Nilai rata-rata / IP UAS | Numerik (definisi perlu konfirmasi ke STAICI) | Ya |
| Tahun Lulus | Tahun | Ya |

### 8.3 Data Orang Tua (Ayah & Ibu — diisi terpisah)

| **Field** | **Tipe / Pilihan** | **Wajib** |
|---|---|---|
| Nama (Ayah/Ibu) | Teks — diisi terpisah untuk Ayah dan Ibu | Ya |
| No. KTP dan KK | Numerik/Teks | Ya |
| Tempat & Tanggal Lahir | Teks & Tanggal | Ya |
| Alamat | Teks | Ya |
| Pendidikan | Teks/Pilihan jenjang | Ya |
| Pekerjaan | Pilihan dari daftar kode pekerjaan resmi (lihat Lampiran) | Ya |
| Penghasilan per Bulan | Pilihan dari daftar kode range penghasilan (lihat Lampiran) | Ya |

*Daftar kode Pekerjaan: Tidak Bekerja, Pensiunan, PNS, TNI/Polisi, Guru/Dosen, Pegawai Swasta, Pengusaha/Wiraswasta, Pengacara/Hakim/Jaksa/Notaris, Seniman/Pelukis/Artis, Dokter/Bidan/Perawat, Pilot/Pramugari, Pedagang, Petani/Peternak, Nelayan, Buruh, Sopir/Masinis/Kondektur, Politikus, Pengurus Rumah Tangga, Lainnya. Daftar kode Penghasilan per Bulan: di bawah Rp1.000.000; Rp1.000.000–2.000.000; Rp2.000.000–4.000.000; Rp4.000.000–6.000.000; di atas Rp6.000.000.*

### 8.4 Data Identitas Wali (Kondisional)

| **Field** | **Tipe / Pilihan** | **Wajib** |
|---|---|---|
| Nama Wali | Teks | Kondisional (jika ada wali) |
| Alamat Wali | Teks | Kondisional (jika ada wali) |

### 8.5 Informasi Kontak

| **Field** | **Tipe / Pilihan** | **Wajib** |
|---|---|---|
| No. HP Mahasiswa | Numerik | Ya |
| No. HP Orang Tua/Wali | Numerik (juga dipakai Kopertais IV Surabaya) | Ya |

### 8.6 Pilihan Program Studi

| **Kode** | **Nama Program Studi** |
|---|---|
| MPI | Manajemen Pendidikan Islam |
| AS | Ahwal Al-Syakhsiyah |
| KPI | Komunikasi dan Penyiaran Islam |

*Admin dapat menambah, mengedit, dan menghapus data program studi melalui CMS setelah aplikasi dibuat.*

### 8.7 Upload Berkas & Validasi

| **Jenis Dokumen** | **Wajib/Opsional** | **Format** | **Ukuran Maks.** |
|---|---|---|---|
| Kartu Keluarga (KK) | Wajib | Gambar/PDF (mengikuti kebutuhan) | 2 MB |
| KTP | Wajib | Gambar/PDF | 2 MB |
| Ijazah/SKL | Wajib | Gambar/PDF | 2 MB |
| Pas Foto 3x4 | Wajib | JPG/JPEG, dll. | 2 MB |
| Bukti Pembayaran | Wajib | Gambar/PDF | 2 MB |
| Kartu KIP | Opsional | Gambar/PDF | 2 MB |
| Dokumen Pendukung Lain | Opsional | Gambar/PDF | 2 MB |

- Sistem otomatis memvalidasi ukuran file maksimal 2 MB per file dan menolak file yang melebihi batas.
- Calon mahasiswa dapat mengganti berkas yang sudah diunggah selama belum diverifikasi/disahkan admin.
- Setelah pendaftaran disubmit, seluruh data (termasuk berkas) tidak dapat diubah oleh pendaftar.

### 8.8 Status Pendaftaran

| **No.** | **Status** | **Keterangan** |
|---|---|---|
| 0 | Draft (opsional) | Akun baru dibuat, calon mahasiswa belum mulai mengisi formulir sama sekali. |
| 1 | Akun Terdaftar | Status awal saat akun berhasil dibuat, sebelum mengisi formulir. |
| 2 | Belum Lengkap | Pendaftar masih mengisi data/mengunggah berkas. |
| 3 | Menunggu Pembayaran | Formulir lengkap, menunggu bukti transfer diunggah/diverifikasi. |
| 4 | Menunggu Verifikasi | Berkas lengkap dan pembayaran masuk, menunggu pemeriksaan admin. |
| 5a | Berkas Diverifikasi | Berkas dinyatakan sah oleh admin/pihak STAICI. |
| 5b | Ditolak/Perlu Perbaikan | Berkas tidak sah; status otomatis kembali ke "Belum Lengkap" agar dapat direvisi. |
| 6 | Mengikuti Ujian/Wawancara (opsional) | Berlaku jika STAICI mensyaratkan tes seleksi/wawancara sebelum hasil akhir. |
| 7a | Lolos Seleksi | Dinyatakan lulus tahap seleksi. |
| 7b | Tidak Lolos | Dinyatakan tidak lulus tahap seleksi. |
| 8 | Daftar Ulang | Konfirmasi ulang (bayar her-registrasi, upload dokumen tambahan) sebelum menjadi mahasiswa aktif. |
| 9 | Dibatalkan/Kadaluarsa (opsional) | Pendaftar tidak membayar/melengkapi berkas hingga batas waktu tertentu. |

### 8.9 Nomor Pendaftaran

Format: PMB-[Tahun]-[Nomor Urut 4 digit], contoh: PMB-2026-0001, PMB-2026-0002. Nomor dibuat otomatis oleh sistem pada saat calon mahasiswa submit pendaftaran, bersifat unik dan berurutan per tahun.

### 8.10 Catatan Terbuka (Perlu Konfirmasi STAICI)

- Definisi pasti "Nilai rata-rata/IP UAS" pada data Asal Sekolah.
- Keputusan apakah seluruh field Data Orang Tua yang rinci diisi saat pendaftaran online tahap awal, atau sebagian ditunda ke tahap Daftar Ulang.

## 9. Acceptance Criteria

| **Fitur** | **Kriteria Penerimaan (Acceptance Criteria)** |
|---|---|
| Registrasi & Verifikasi Akun | Pengguna dapat mendaftar dengan data yang disyaratkan; email verifikasi terkirim dalam waktu wajar; akun berstatus aktif hanya setelah verifikasi berhasil. |
| Pengisian Formulir Data Pribadi | Seluruh field wajib pada Formulir Lembar Penerimaan Mahasiswa Baru tervalidasi sebelum data dapat disimpan/disubmit; data tersimpan otomatis sebagai draft selama pengisian. |
| Upload Berkas | File yang melebihi 2 MB atau berformat tidak sesuai ditolak sistem dengan pesan error yang jelas; berkas yang sudah diunggah dapat diganti selama belum diverifikasi. |
| Submit Pendaftaran | Setelah submit, sistem membuat nomor pendaftaran otomatis (format PMB-[Tahun]-[Urutan]) dan mengunci seluruh data dari perubahan oleh pendaftar. |
| Pembayaran | Status pembayaran berubah sesuai alur (Menunggu Pembayaran → Menunggu Verifikasi → Terverifikasi/Ditolak) hanya melalui aksi verifikasi admin; alasan penolakan wajib diisi admin dan tampil ke pendaftar. |
| Alur Status & Revisi | Ketika admin menolak berkas, status otomatis kembali ke "Belum Lengkap" dan alasan penolakan dapat dilihat pendaftar di dashboard. |
| Pengumuman Hasil Seleksi | Hasil seleksi hanya tampil ke pendaftar terkait setelah admin mempublikasikan pengumuman, sesuai timeline yang ditentukan. |
| Dashboard Admin | Admin dapat mencari/memfilter pendaftar berdasarkan nama; statistik menampilkan data agregat pendaftaran secara akurat dan real-time. |
| Keamanan Akses Berkas | Berkas pendaftar tidak dapat diakses langsung melalui URL publik tanpa otorisasi (contoh: staicisitubondo.ac.id/uploads/ktp/123.jpg harus diblokir). |
| Log Aktivitas Admin | Setiap perubahan data oleh admin (status, verifikasi, dll.) tercatat dengan nama admin, waktu, dan deskripsi aksi. |
| Responsivitas | Seluruh halaman utama dapat diakses dan digunakan dengan baik pada perangkat mobile (mobile-first) tanpa kehilangan fungsi. |

## 10. Scope, Priority & Roadmap

### 10.1 Ruang Lingkup (In-Scope)

| **Kategori** | **Termasuk dalam Ruang Lingkup (In-Scope)** |
|---|---|
| Website Publik | Halaman informasi PMB (Program Studi, Jalur, Persyaratan, Biaya, Alur, Jadwal, FAQ, Kontak) di staicisitubondo.ac.id/pmb. |
| Akun & Autentikasi | Registrasi, verifikasi email, login, lupa/reset password, ubah password/email. |
| Pendaftaran Online | Formulir data pribadi sesuai Formulir Lembar Penerimaan Mahasiswa Baru, upload berkas digital, submit pendaftaran, nomor pendaftaran otomatis. |
| Pembayaran Non-Gateway | Info VA/rekening manual, upload bukti transfer, verifikasi manual oleh admin. |
| Manajemen Status & Seleksi | Seluruh status pendaftaran, seleksi berkas, opsional ujian/wawancara, pengumuman, daftar ulang. |
| Dashboard Mahasiswa | Lihat/edit data, lihat status, kelola berkas, lihat pembayaran, lihat pengumuman, cetak kartu & bukti pendaftaran. |
| Admin/CMS | Manajemen seluruh konten & proses PMB, verifikasi berkas/pembayaran, statistik, log aktivitas, role-based access. |
| Keamanan | Hash password, RBAC, validasi upload, pembatasan ukuran file, session management, HTTPS, proteksi akses berkas, backup database. |
| Notifikasi | Notifikasi berbasis email untuk seluruh event penting (tanpa WhatsApp/API berbayar). |

### 10.2 Batasan (Out-of-Scope)

| **Kategori** | **Di Luar Ruang Lingkup (Out-of-Scope)** |
|---|---|
| Payment Gateway | Integrasi payment gateway otomatis tidak digunakan; pembayaran tetap manual via transfer bank. |
| Notifikasi WhatsApp/SMS | Tidak digunakan karena pertimbangan biaya API. |
| Berkas Fisik (Hardcopy) | Persyaratan fisik (FC KK/KTP, pas foto cetak, dsb.) diproses langsung di kampus saat Daftar Ulang, tidak dikelola oleh sistem. |
| Jalur Pendaftaran Ganda | Saat ini hanya Jalur Reguler; jalur KIP masih berupa berkas tambahan dalam jalur yang sama, bukan jalur terpisah. |

### 10.3 Prioritas Fitur

| **Prioritas** | **Fitur/Modul** | **Justifikasi** |
|---|---|---|
| Must Have (MVP) | Registrasi & login, formulir pendaftaran lengkap, upload berkas, status pendaftaran inti (Akun Terdaftar s.d. Daftar Ulang), pembayaran manual, admin/CMS inti (verifikasi berkas & pembayaran, manajemen data pendaftar, program studi), notifikasi email, website publik PMB, keamanan dasar. | Tanpa modul ini, proses PMB inti tidak dapat berjalan. |
| Should Have | Dashboard statistik admin, manajemen gelombang & jalur PMB, log aktivitas admin, fitur cetak kartu/bukti pendaftaran, alur ujian/wawancara. | Meningkatkan efisiensi operasional dan transparansi, namun proses inti tetap bisa berjalan tanpa ini di tahap awal. |
| Could Have (Opsional) | Status Draft & Dibatalkan/Kadaluarsa otomatis, manajemen FAQ & konten halaman dinamis melalui CMS. | Nilai tambah untuk pengalaman pengguna dan kerapian data, dapat menyusul pada iterasi berikutnya. |
| Won't Have (saat ini) | Payment gateway otomatis, notifikasi WhatsApp/SMS berbayar, jalur pendaftaran terpisah untuk KIP. | Dikeluarkan dari lingkup berdasarkan keputusan biaya dan kebutuhan STAICI saat ini. |

### 10.4 Roadmap Implementasi

| **Tahap** | **Cakupan** | **Target Output** |
|---|---|---|
| Tahap 1 — Analisis & Perancangan | Finalisasi requirement (dokumen ini), perancangan UI/UX (Figma), perancangan arsitektur & database. | PRD final, desain UI/UX final, ERD & arsitektur sistem. |
| Tahap 2 — Pengembangan Modul Inti (MVP) | Autentikasi, formulir pendaftaran, upload berkas, status pendaftaran, pembayaran manual, admin/CMS inti. | Sistem PMB fungsional untuk 1 siklus pendaftaran penuh. |
| Tahap 3 — Pengembangan Modul Pendukung | Dashboard statistik, manajemen gelombang/jalur, log aktivitas, cetak kartu/bukti pendaftaran, alur ujian/wawancara. | Sistem PMB dengan fitur operasional lengkap. |
| Tahap 4 — Pengujian & Deployment | Unit/integration testing, User Acceptance Test (UAT) bersama pihak STAICI, deployment ke hosting idwebhost.com pada staicisitubondo.ac.id/pmb. | Sistem live dan siap digunakan untuk masa pendaftaran berjalan. |
| Tahap 5 — Evaluasi & Iterasi | Evaluasi pasca-implementasi, penambahan fitur opsional (Draft, Kadaluarsa, dsb.) sesuai kebutuhan. | Sistem PMB yang lebih matang untuk siklus pendaftaran berikutnya. |

### 10.5 Test Plan (E2E & UAT)

Skenario end-to-end (E2E) utama yang wajib diuji sebelum deployment production:

- Registrasi akun → verifikasi email → login → isi formulir data pribadi lengkap → upload seluruh berkas wajib → submit → nomor pendaftaran otomatis dibuat.
- Upload bukti transfer → admin menyetujui pembayaran → status berubah otomatis ke tahap verifikasi berkas.
- Admin menolak berkas/pembayaran dengan alasan → status kembali ke "Belum Lengkap" → pendaftar merevisi → submit ulang.
- Publikasi pengumuman hasil seleksi oleh admin → hasil hanya tampil ke pendaftar terkait sesuai timeline.
- Daftar ulang (bayar her-registrasi, upload dokumen tambahan) → data pendaftar "naik kelas" menjadi data mahasiswa aktif.

Kasus khusus (edge case) yang wajib diuji:

- File upload melebihi 2 MB atau berformat tidak sesuai ditolak sistem dengan pesan error yang jelas.
- Dua admin melakukan verifikasi pada pendaftar yang sama secara bersamaan (race condition).
- Admin membuat gelombang baru dengan tanggal yang tumpang tindih dengan gelombang aktif lain (harus divalidasi/ditolak, sesuai mitigasi risiko No. 8 pada Bagian 11).
- Pendaftar mencoba submit pendaftaran lebih dari satu kali (duplikasi).

Pengujian tambahan:

- Load/stress test untuk mensimulasikan lonjakan trafik mendekati tanggal penutupan gelombang, sesuai kebutuhan performa pada 7.2.
- Tools yang digunakan: Playwright/Cypress untuk pengujian E2E front-end, serta k6/JMeter untuk load test back-end (dapat disesuaikan oleh tim developer).
- UAT (User Acceptance Test) dilakukan bersama pihak STAICI menggunakan checklist skenario di atas, dengan kriteria lulus/tidak lulus yang disepakati sebelum sesi UAT dimulai.

## 11. Risks & Assumptions

| **No.** | **Risiko/Asumsi** | **Dampak** | **Mitigasi** |
|---|---|---|---|
| 1 | Definisi "Nilai rata-rata/IP UAS" pada formulir asal sekolah belum dikonfirmasi secara pasti oleh pihak STAICI. | Field data bisa tidak sesuai kebutuhan pelaporan Kopertais/EMIS. | Konfirmasi definisi field ke pihak STAICI sebelum development formulir dimulai. |
| 2 | Belum ada keputusan final apakah seluruh field Data Orang Tua (KTP/KK, pekerjaan, penghasilan) diisi saat pendaftaran online awal atau ditunda ke tahap Daftar Ulang. | Perubahan struktur formulir di tengah development dapat menambah waktu pengerjaan. | Diputuskan bersama STAICI di tahap analisis sebelum perancangan database & UI formulir dimulai. |
| 3 | Sistem pembayaran manual (tanpa payment gateway) bergantung pada ketelitian admin dalam verifikasi bukti transfer. | Potensi keterlambatan verifikasi atau kesalahan input status pembayaran. | SOP verifikasi pembayaran yang jelas dan indikator waktu verifikasi pada dashboard admin. |
| 4 | Data sensitif (KTP/KK, penghasilan orang tua) tersimpan dalam sistem sehingga risiko kebocoran data cukup tinggi. | Risiko keamanan data pribadi calon mahasiswa dan keluarganya. | Menerapkan lapisan keamanan berlapis: hash password, RBAC, HTTPS, proteksi akses berkas (bukan folder publik), validasi upload, backup rutin. |
| 5 | Ketergantungan pada hosting pihak ketiga (idwebhost.com) yang disediakan STAICI. | Keterbatasan kontrol atas performa/downtime server di luar kendali tim pengembang. | Koordinasi kebutuhan spesifikasi hosting sejak awal dan strategi backup database mandiri oleh Admin IT STAICI. |
| 6 | Dokumen UI/UX (Figma) belum tersedia saat PRD ini disusun. | Bagian UI/UX Requirements pada dokumen ini masih berupa kerangka, belum final. | PRD akan diperbarui (versi berikutnya) setelah desain Figma final diterima dan direview. |
| 7 | Asumsi: hanya ada 1 jalur pendaftaran (Reguler) selama pengembangan awal; KIP diasumsikan sebagai berkas tambahan, bukan jalur terpisah. | Jika di kemudian hari STAICI menambah jalur pendaftaran baru, struktur data jalur perlu dirancang agar fleksibel sejak awal. | Merancang tabel/skema "Jalur PMB" pada database agar dapat menampung penambahan jalur baru tanpa perubahan struktur besar. |
| 8 | Asumsi: gelombang pendaftaran, biaya, dan kuota bersifat dinamis dan diatur sepenuhnya oleh admin melalui CMS. | Kesalahan pengaturan gelombang oleh admin (tanggal tumpang tindih, dsb.) dapat mengganggu proses pendaftaran. | Validasi input pada CMS (contoh: tanggal gelombang baru tidak boleh tumpang tindih dengan gelombang aktif lain). |

## 12. References & Appendix

### 12.1 Dokumen Referensi

- Dokumen requirement "Website PMB" (hasil diskusi/wawancara dengan pihak STAICI) — sumber utama penyusunan PRD ini.
- Formulir Lembar Penerimaan Mahasiswa Baru (Pangkalan Data Pendidikan Agama Islam) yang digunakan STAICI, sebagai acuan seluruh field data pribadi calon mahasiswa.
- Rancangan UI/UX pada Figma: "Website PMB STAICI" — akan dilampirkan setelah diterima (link: https://www.figma.com/design/ENFH84Tfx5vSKiiRhw6zrr/Website-PMB-STAICI).
- Repository kode sumber (source code): https://github.com/Davinrach/pmb-full-stack.git (repository bersifat public).

### 12.2 Lampiran yang Menyusul

- Wireframe/mockup UI seluruh halaman (publik, dashboard mahasiswa, admin/CMS).
- Diagram alur (flowchart) proses bisnis PMB secara visual.
- Entity Relationship Diagram (ERD) basis data.
- Contoh format cetak Kartu Pendaftaran dan Bukti Pendaftaran.

### 12.3 Glosarium Singkat

- PMB: Penerimaan Mahasiswa Baru.
- STAICI: STAI Cendekia Insani, Situbondo.
- Kopertais: Koordinator Perguruan Tinggi Agama Islam Swasta.
- EMIS: Education Management Information System, sistem pelaporan data pendidikan agama Islam.
- VA: Virtual Account, nomor rekening tujuan transfer pembayaran.
- KIP: Kartu Indonesia Pintar.
- RBAC: Role-Based Access Control.
