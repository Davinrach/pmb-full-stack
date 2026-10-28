# Portal PMB Terpadu - STAI Cendekia Insani Situbondo

Sistem Informasi Penerimaan Mahasiswa Baru (PMB) Terpadu & Portal Informasi Program Studi untuk **STAI Cendekia Insani Situbondo**.

---

## 📁 Struktur Direktori Monorepo

```
Staici/
├── backend/                  # RESTful API Service (Golang)
│   ├── cmd/api/             # Entry point aplikasi backend (main.go)
│   ├── internal/            # Database (GORM), Handlers, Middleware, Models, Utils
│   ├── uploads/             # Direktori penyimpanan berkas pendaftar (ignored di git)
│   ├── .env.example         # Template konfigurasi environment backend
│   └── go.mod               # Dependensi Golang
│
├── frontend/                 # Web Application (Next.js 16 + Tailwind CSS + TS)
│   ├── app/                 # App Router (Pendaftaran, Dashboard, AdminCMS, Auth, dll)
│   ├── components/          # Komponen UI (Navbar, Footer, Modal OTP, Stepper, dll)
│   ├── lib/                 # API Client, LanguageContext, Translations, Master Data
│   ├── public/              # Aset statis web (Logo, Banner, Icon)
│   ├── scripts/             # Script utilitas pemrosesan aset
│   ├── .env.example         # Template konfigurasi environment frontend
│   └── package.json         # Dependensi Next.js
│
├── docs/                     # Dokumentasi Resmi & Spesifikasi Proyek
│   ├── PRD_Website_PMB_STAICI_v1.1.md     # Product Requirement Document
│   ├── SRS_Website_PMB_STAICI.md          # Software Requirement Specification
│   ├── DOKUMENTASI_ROUTE_PMB.md           # Dokumentasi API & Routing
│   ├── SKENARIO_UJI_COBA_PMB.md           # Skenario Pengujian Sistem
│   ├── DEPLOYMENT_GUIDE.md                # Panduan Lengkap Deployment Produksi
│   └── assets/                            # Aset grafis mentah / mockups
│
├── run-dev.ps1              # Script otomatis menjalankan backend & frontend di Windows
├── package.json             # Root NPM script runner
└── README.md                # Dokumentasi utama proyek
```

---

## 🚀 Memulai Pengembangan (Local Development)

### 1. Prasyarat
- **Node.js**: v18.17 atau v20+
- **Golang**: v1.22 atau lebih baru
- **MySQL Server**: Port 3306 (misal via XAMPP)

### 2. Konfigurasi Environment

**Backend (`backend/.env`):**
Salin `backend/.env.example` ke `backend/.env`, lalu pastikan koneksi database sesuai:
```ini
PORT=8080
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=pmb_staici_db
JWT_SECRET=staici-pmb-secret-key-2026
UPLOAD_DIR=./uploads
```

**Frontend (`frontend/.env.local`):**
Salin `frontend/.env.example` ke `frontend/.env.local`:
```ini
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 3. Menjalankan Aplikasi

**Cara Praktis (Windows PowerShell):**
Jalankan script satu-pintu berikut:
```powershell
.\run-dev.ps1
```

**Cara Manual:**
- **Terminal 1 (Backend Go):**
  ```bash
  cd backend
  go run ./cmd/api
  ```
  *Server API aktif di `http://localhost:8080/api/v1`*

- **Terminal 2 (Frontend Next.js):**
  ```bash
  cd frontend
  npm run dev
  ```
  *Web Frontend aktif di `http://localhost:3000`*

---

## 🌐 Alur & Halaman Utama

| Halaman | URL | Keterangan |
| :--- | :--- | :--- |
| **Beranda** | `/` | Hero section, profil 3 prodi, alur pendaftaran, hotline |
| **Detail Prodi** | `/program-studi/[slug]` | Profil lulusan, kurikulum, capaian prodi (`mpi`, `hki`, `kpi`) |
| **Pendaftaran** | `/pendaftaran` | Stepper 3 tahap praktis (Jalur, Biodata, Sekolah, Ortu, Berkas) |
| **Dashboard** | `/dashboard` | Portal calon mahasiswa untuk memantau status seleksi & cetak bukti |
| **Portal Admin** | `/admincms` | Manajemen pendaftar, verifikasi berkas, kelola gelombang & kuota |
| **Login Admin** | `/loginadmin` | Autentikasi staf panitia PMB & Super Admin |

---

## 🚢 Panduan Deployment Produksi

Untuk melakukan rilis ke server produksi (VPS Linux Ubuntu/Debian dengan Nginx + SSL atau Vercel), silakan baca panduan teknis mendalam di:
👉 **[`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md)**

---

## 🔒 Lisensi & Hak Cipta
Hak Cipta © 2026 STAI Cendekia Insani Situbondo. Seluruh hak cipta dilindungi undang-undang.
