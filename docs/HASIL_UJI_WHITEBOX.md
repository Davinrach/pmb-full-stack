# Laporan Hasil Pengujian White Box
**Sistem PMB STAI Cendekia Insani Situbondo (Backend Go REST API)**  
**Waktu Pengujian**: 31 Oktober 2026  
**Framework**: Standard Go Testing Package (`testing`, `httptest`)  
**Profil Cakupan**: `coverage.out` & `coverage.html`  
**Total Kasus Uji**: 23 Kasus Uji (`TC_WB_001` s/d `TC_WB_023`)  
**Hasil**: 23 Lulus (100%)

---

## 1. Tabel Hasil Pengujian Unit / White Box (TC_WB_001 s/d TC_WB_023)

| ID Kasus Uji | Skenario Uji | Kode yang Diuji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status | Catatan |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **TC_WB_001** | Validasi NIK tepat 16 digit angka | `ValidateNIK(nik string)` | `nik = "3512012345670001"` | Mengembalikan `true` (NIK valid) | `ValidateNIK("3512012345670001")` mengembalikan `true`. Regex `^[0-9]{16}$` cocok sempurna. | **Lulus** | Sesuai standar administrasi kependudukan Dukcapil. |
| **TC_WB_002** | Validasi NIK kurang dari 16 digit angka (Boundary: 5 digit) | `ValidateNIK(nik string)` | `nik = "12345"` | Mengembalikan `false` (NIK ditolak) | `ValidateNIK("12345")` mengembalikan `false`. Regex mismatch (len < 16). | **Lulus** | Mencegah NIK tidak lengkap tersimpan ke database. |
| **TC_WB_003** | Validasi NIK lebih dari 16 digit angka (Boundary: 18 digit) | `ValidateNIK(nik string)` | `nik = "351201234567000199"` | Mengembalikan `false` (NIK ditolak) | `ValidateNIK("351201234567000199")` mengembalikan `false`. Regex mismatch (len > 16). | **Lulus** | Memastikan batas ambang atas 16 digit diterapkan ketat. |
| **TC_WB_004** | Validasi NIK 16 karakter mengandung huruf/simbol non-numerik | `ValidateNIK(nik string)` | `nik = "351201234567000A"` | Mengembalikan `false` (NIK ditolak) | `ValidateNIK("351201234567000A")` mengembalikan `false`. Karakter non-digit ditolak regex. | **Lulus** | Mencegah injeksi karakter alfanumerik pada field NIK. |
| **TC_WB_005** | Validasi NIK dengan string kosong | `ValidateNIK(nik string)` | `nik = ""` | Mengembalikan `false` (NIK ditolak) | `ValidateNIK("")` mengembalikan `false`. String kosong ditolak regex. | **Lulus** | Validasi awal kelengkapan kolom wajib pendaftar. |
| **TC_WB_006** | Validasi kekuatan kata sandi memenuhi kriteria keamanan (NIST SP 800-63B >= 12 karakter) | `ValidatePasswordStrength(password string)` | `password = "StaiciPMB2026!"` | Mengembalikan `nil` (kata sandi valid) | `ValidatePasswordStrength("StaiciPMB2026!")` mengembalikan `nil`. Percabangan kombinasi karakter dan panjang >= 12 karakter terpenuhi. | **Lulus** | *Catatan*: Spesifikasi lama lembar uji mencatat input `Rahasia123` (10 karakter, asumsi batas 8 karakter). Namun backend telah diperketat mengadopsi standar NIST SP 800-63B (min 12 karakter), sehingga `Rahasia123` menghasilkan error. Pengujian unit diverifikasi menggunakan kata sandi valid aktif dan mendokumentasikan perbedaan aturan bisnis keamanan tersebut. |
| **TC_WB_007** | Validasi kekuatan kata sandi terlalu pendek (< 12 karakter) | `ValidatePasswordStrength(password string)` | `password = "pass1"` | Mengembalikan error minimal karakter | `ValidatePasswordStrength("pass1")` mengembalikan error `"kata sandi harus memiliki minimal 12 karakter"`. | **Lulus** | Mencegah penggunaan kata sandi lemah rentan brute force. |
| **TC_WB_008** | Proses hashing kata sandi algoritma bcrypt (cost 10) | `HashPassword(password string)` | `password = "MySecurePass2026"` | Hash bcrypt valid berawalan `$2a$10$` dan `err == nil` | `HashPassword` mengembalikan string hash bcrypt valid 60 karakter berawalan `$2a$10$` dengan `err == nil`. | **Lulus** | Menjamin penyimpanan kata sandi satu arah (*one-way salted hash*) yang aman dari kebocoran DB. |
| **TC_WB_009** | Verifikasi kecocokan kata sandi plain text dengan hash bcrypt | `CheckPasswordHash(password, hash string)` | `password = "Pass123"`, `hash = HashPassword("Pass123")` | Mengembalikan `true` (password cocok) | `CheckPasswordHash("Pass123", hash)` mengembalikan `true`. | **Lulus** | Memvalidasi alur verifikasi login pendaftar dan admin. |
| **TC_WB_010** | Verifikasi penolakan kata sandi salah terhadap hash bcrypt | `CheckPasswordHash(password, hash string)` | `password = "WrongPassword"`, `hash = HashPassword("Pass123")` | Mengembalikan `false` (password ditolak) | `CheckPasswordHash("WrongPassword", hash)` mengembalikan `false`. | **Lulus** | Menolak otentikasi jika kredensial kata sandi keliru. |
| **TC_WB_011** | AuthMiddleware saat request tanpa Authorization header | `AuthMiddleware(cfg *config.Config)` | Request `GET /protected` tanpa header `Authorization` | Mengembalikan HTTP 401 dan membatalkan pipeline (`c.Abort`) | Response HTTP 401 Unauthorized dengan JSON error, pipeline request langsung diaborsi (`c.AbortWithStatusJSON`). | **Lulus** | Mengamankan endpoint privat dari akses anonim tanpa header otorisasi. |
| **TC_WB_012** | AuthMiddleware saat format header tidak sesuai skema 'Bearer <token>' | `AuthMiddleware(cfg *config.Config)` | Header `Authorization: "Basic invalidtokenformat"` | Mengembalikan HTTP 401 dengan error format token tidak valid | Response HTTP 401 Unauthorized dengan pesan error skema otorisasi tidak valid. | **Lulus** | Memastikan format token Authorization Bearer dipatuhi secara konsisten. |
| **TC_WB_013** | AuthMiddleware saat token JWT memiliki signature tidak valid (secret salah) | `AuthMiddleware(cfg *config.Config)` | Token JWT dibuat menggunakan secret key lain (`"wrong_secret"`) | Mengembalikan HTTP 401 karena token verification signature mismatch | Token ditolak dengan HTTP 401 Unauthorized, verifikasi cryptographic signature gagal. | **Lulus** | Mencegah pemalsuan token JWT dari penyerang luar. |
| **TC_WB_014** | AuthMiddleware saat token JWT telah kedaluwarsa (expired) | `AuthMiddleware(cfg *config.Config)` | Token JWT valid dengan masa berlaku kedaluwarsa (`-1 jam`) | Mengembalikan HTTP 401 karena `!token.Valid` | Token kedaluwarsa ditolak dengan HTTP 401 Unauthorized (`token is expired`). | **Lulus** | Menjamin token sesi usang tidak dapat digunakan kembali. |
| **TC_WB_015** | AuthMiddleware saat token JWT valid, aktif, dan claims terverifikasi | `AuthMiddleware(cfg *config.Config)` | Token JWT valid dengan claims `UserID: 42`, `Email: "mhs@staici.ac.id"`, `Role: "calon_mahasiswa"` | Menyimpan atribut claims pada context Gin (`c.Set`) dan melanjutkan request (`c.Next`) | Request diteruskan (`c.Next`), status HTTP 200 OK, dan seluruh atribut klaim (`user_id=42`, `email="mhs@staici.ac.id"`, `role="calon_mahasiswa"`) tersimpan di context. | **Lulus** | Menguji basis path keberhasilan otentikasi token JWT. |
| **TC_WB_016** | RequireRoles saat context request tidak memiliki atribut 'role' | `RequireRoles(roles ...model.Role)` | Request melewati middleware tanpa atribut `role` di context | Mengembalikan HTTP 403 Forbidden dengan pesan role tidak ditemukan | Response HTTP 403 Forbidden dengan pesan "Akses ditolak: role tidak ditemukan". | **Lulus** | Menjamin proteksi *fail-safe* jika konteks otentikasi tidak lengkap. |
| **TC_WB_017** | RequireRoles saat role pengguna cocok dengan role yang diizinkan | `RequireRoles(model.RoleAdminPMB, model.RoleSuperAdmin)` | Context request membawa role `"admin_pmb"` | Mengizinkan request dilanjutkan (`c.Next`) menghasilkan HTTP 200 OK | Middleware mencocokkan `userRole == r`, request diizinkan lanjut (`c.Next`) dengan HTTP 200 OK. | **Lulus** | Menguji otorisasi peran berbasis Role-Based Access Control (RBAC). |
| **TC_WB_018** | RequireRoles saat role pengguna tidak memiliki wewenang (Role Mismatch) | `RequireRoles(model.RoleAdminPMB, model.RoleSuperAdmin)` | Context request membawa role `"calon_mahasiswa"` | Menolak request dengan HTTP 403 Forbidden | Akses ditolak dengan HTTP 403 Forbidden ("Akses ditolak: Anda tidak memiliki wewenang untuk aksi ini"). | **Lulus** | Mencegah calon mahasiswa mengakses endpoint khusus panitia/admin. |
| **TC_WB_019** | Validasi batas ukuran file unggahan berkas fisik (MaxFileSize = 2 MB) | `MaxFileSize` boundary check | Simulasi ukuran file 1.5 MB (sah) dan 2.5 MB (melebihi batas) | File 1.5 MB lolos verifikasi, file 2.5 MB ditolak | Logika perbandingan ukuran mengidentifikasi 1.5 MB <= 2 MB (valid) dan 2.5 MB > 2 MB (ditolak). | **Lulus** | Menjaga kapasitas media penyimpanan server PMB. |
| **TC_WB_020** | Whitelist MIME-Type berkas (format diizinkan vs berbahaya) | `allowedMimeTypes` map whitelist lookup | Format sah (`image/jpeg`, `image/png`, `application/pdf`) vs terlarang (`text/php`, `application/x-sh`) | Format sah bernilai `true`, format berbahaya bernilai `false` | Seluruh tipe MIME sah dikenali dalam whitelist; format skrip/executable terbukti ditolak. | **Lulus** | Menolak serangan unggahan web shell (RCE) di tingkat MIME whitelist. |
| **TC_WB_021** | Percabangan penentuan biaya formulir pendaftaran Jalur KIP-Kuliah (isKip == true) | Logika percabangan biaya `GetInfoRekening` | Record pendaftar dengan jalur `"KIP-Kuliah"` | Biaya ditetapkan menjadi 0 (`isKip = true`), membebaskan tagihan pendaftaran | `isKip` bernilai `true` dan variabel tagihan `biaya = 0`. | **Lulus** | Memastikan pembebasan biaya bagi penerima beasiswa KIP-Kuliah. |
| **TC_WB_022** | Percabangan penentuan biaya formulir pendaftaran Jalur Reguler berbayar (isKip == false) | Logika percabangan biaya `GetInfoRekening` | Record pendaftar dengan jalur `"Reguler"` dan konfigurasi gelombang Rp 250.000 | Biaya ditetapkan mengikuti konfigurasi gelombang aktif (`biaya = 250000`) | `isKip` bernilai `false` dan biaya ditetapkan sebesar `250000`. | **Lulus** | Memastikan tarif nominal gelombang reguler berjalan presisi. |
| **TC_WB_023** | Penanganan status kesehatan saat koneksi basis data nil (`database.DB == nil`) | `HealthHandler.Check` | HTTP Request `GET /api/v1/health` saat pointer `database.DB == nil` | Merespons JSON dengan atribut `database: "disconnected"` tanpa nil pointer panic | Endpoint merespons HTTP 200 OK dengan payload JSON `database: "disconnected"` secara aman tanpa runtime panic. | **Lulus** | Menguji kehandalan penanganan error (*defensive programming*) saat koneksi database terputus. |

---

## 2. Ringkasan Persentase Cakupan Kode (Code Coverage)

### A. Cakupan per File & Fungsi yang Diuji Unit

| File Sumber | Fungsi yang Diuji | Persentase Cakupan | Status Cakupan |
| :--- | :--- | :---: | :---: |
| `internal/util/hash.go` | `HashPassword` | **100.0%** | Penuh (100%) |
| `internal/util/hash.go` | `CheckPasswordHash` | **100.0%** | Penuh (100%) |
| `internal/util/hash.go` | `ValidateNIK` | **100.0%** | Penuh (100%) |
| `internal/util/hash.go` | `ValidatePasswordStrength` | **91.2%** | Parsial (91.2%) |
| `internal/middleware/auth.go` | `AuthMiddleware` | **96.2%** | Parsial (96.2%) |
| `internal/middleware/auth.go` | `RequireRoles` | **78.9%** | Parsial (78.9%) |
| `internal/handler/health_handler.go` | `NewHealthHandler` | **100.0%** | Penuh (100%) |
| `internal/handler/health_handler.go` | `Check` | **57.1%** | Parsial (57.1%) |
| `internal/crypto/crypto.go` | Round-trip AES-256-GCM, BlindIndex, File Encrypt/Decrypt | **68.1%** | Parsial (68.1%) |

### B. Cakupan per Paket Backend (`go test -cover ./...`)

| Paket (*Package*) | Cakupan Pernyataan (*Statements Coverage*) | Catatan |
| :--- | :---: | :--- |
| `pmb-staici-backend/internal/crypto` | **68.1%** | Pengujian enkripsi data pribadi, blind index, dan rotasi kunci |
| `pmb-staici-backend/internal/middleware` | **41.7%** | Pengujian JWT Auth & RBAC Middleware |
| `pmb-staici-backend/internal/util` | **25.7%** | Pengujian validasi NIK, kata sandi, dan hashing bcrypt |
| `pmb-staici-backend/internal/handler` | **0.3%** | Pengujian logika validasi berkas, penentuan tarif KIP, & health nil DB |
| `pmb-staici-backend/internal/config` | 0.0% | Diuji secara fungsional melalui integrasi sistem |
| `pmb-staici-backend/internal/database` | 0.0% | Seeder dan migrasi diuji melalui E2E Black Box |
| `pmb-staici-backend/internal/model` | 0.0% | Definisi struct & GORM hook |
| `pmb-staici-backend/internal/response` | 0.0% | Helper JSON response serializer |
| **Total Seluruh Statement Backend** | **6.6%** | *(Seluruh modul handler lainnya telah terverifikasi penuh melalui 38 skenario Black Box E2E)* |

---

## 3. Analisis File dan Fungsi yang Belum Mencapai Cakupan 100%

1. **`internal/util/hash.go` — `ValidatePasswordStrength` (91.2%)**:
   * *Bagian belum tersentuh*: Percabangan deteksi karakter tunggal yang diulang beruntun (misalnya input `"aaaaaaaaaaaa"`) dan kondisi minimal 2 kategori pada panjang di bawah 16 karakter yang hanya memuat satu jenis karakter saja.
2. **`internal/middleware/auth.go` — `AuthMiddleware` (96.2%) & `RequireRoles` (78.9%)**:
   * *Bagian belum tersentuh pada AuthMiddleware*: Percabangan token parsing error spesifik untuk token non-HS256 (algoritma signature tidak terdaftar) dan kegagalan tipe data klaim `jwt.MapClaims`.
   * *Bagian belum tersentuh pada RequireRoles*: Percabangan konversi type assertion ketika objek `role` pada context tidak bertipe `string` atau kosong.
   * *Fungsi `RequireAdminStaff` (0.0%)*: Helper middleware internal untuk staff operasional yang tidak terdaftar dalam cakupan 23 kasus uji White Box.
3. **`internal/handler/health_handler.go` — `Check` (57.1%)**:
   * *Bagian belum tersentuh*: Jalur ketika koneksi database aktif (`database.DB != nil`) dan `sqlDB.Ping()` berhasil dijalankan. Pada unit test White Box `TC_WB_023`, pengujian secara sengaja memutus koneksi (`database.DB = nil`) guna menguji ketahanan kegagalan sistem (*defensive nil safety*). Pengujian jalur aktif `connected` telah terverifikasi melalui skenario Black Box `TC_BB_038`.
4. **Modul Handler & Database Seeder**:
   * Paket `internal/handler/` lainnya (`admin_handler.go`, `pendaftar_handler.go`, `cms_handler.go`, `rbac_handler.go`) memiliki cakupan unit test 0.3% karena alur prosesnya membutuhkan state database relasional penuh, transaksi GORM, dan session login multi-peran yang secara komprehensif telah diuji secara End-to-End pada 38 kasus uji Black Box (`TC_BB_001` s/d `TC_BB_038`).

---

## 4. Berkas Laporan & Artefak HTML
Laporan visual cakupan kode telah digenerate menggunakan tool coverage resmi Go:
* File profil mentah: [`backend/coverage.out`](file:///c:/Users/rachd/OneDrive/Documents/Staici/backend/coverage.out)
* File visualisasi HTML: [`backend/coverage.html`](file:///c:/Users/rachd/OneDrive/Documents/Staici/backend/coverage.html)
