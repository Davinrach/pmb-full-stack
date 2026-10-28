# Panduan Deployment Sistem PMB STAI Cendekia Insani

Dokumen ini merupakan panduan teknis langkah demi langkah untuk melakukan deployment sistem Penerimaan Mahasiswa Baru (PMB) STAI Cendekia Insani Situbondo ke lingkungan produksi (production server).

---

## 1. Arsitektur Sistem

- **Frontend**: Next.js 16 (App Router, Tailwind CSS, TypeScript)
  - Port default development: `3000`
  - Direkomendasikan deploy: **Vercel** atau **VPS Linux (Node.js + PM2 / Docker)**
- **Backend**: Golang (Go 1.22+), GORM, JWT Auth, Gorilla Mux / Standard HTTP
  - Port default: `8080`
  - Direkomendasikan deploy: **VPS Linux (systemd service / Docker) + Nginx Reverse Proxy**
- **Database**: MySQL 8.0+ / MariaDB 10.6+
  - Charset: `utf8mb4_unicode_ci`

---

## 2. Persiapan Server Produksi (VPS Ubuntu 22.04 / 24.04 LTS)

### A. Update Server & Instalasi Dependensi Dasar
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx mysql-server
```

### B. Install Node.js 20 LTS & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### C. Install Golang
```bash
wget https://go.dev/dl/go1.23.0.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.profile
source ~/.profile
go version
```

---

## 3. Konfigurasi Database MySQL

1. Masuk ke MySQL console:
   ```bash
   sudo mysql -u root
   ```

2. Buat database dan user khusus PMB:
   ```sql
   CREATE DATABASE pmb_staici_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'staici_user'@'localhost' IDENTIFIED BY 'PASSWORD_KUAT_DATABASE_ANDA';
   GRANT ALL PRIVILEGES ON pmb_staici_db.* TO 'staici_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

---

## 4. Deployment Backend (Golang)

1. Clone repositori ke direktori server:
   ```bash
   sudo mkdir -p /var/www/pmb-staici
   sudo chown -R $USER:$USER /var/www/pmb-staici
   git clone <URL_REPOSITORY_ANDA> /var/www/pmb-staici
   cd /var/www/pmb-staici/backend
   ```

2. Konfigurasi environment backend:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Sesuaikan parameter produksi:
   ```ini
   PORT=8080
   APP_ENV=production
   DB_USER=staici_user
   DB_PASSWORD=PASSWORD_KUAT_DATABASE_ANDA
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=pmb_staici_db
   JWT_SECRET=BUAT_RANDOM_STRING_PANJANG_MINIMAL_32_KARAKTER
   UPLOAD_DIR=/var/www/pmb-staici/backend/uploads

   # SMTP Email untuk pengiriman OTP & notifikasi pendaftaran
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=pmb@staici.ac.id
   SMTP_PASS=APP_PASSWORD_DARI_EMAIL_ANDA
   SMTP_FROM=pmb@staici.ac.id
   SMTP_FROM_NAME="PMB STAI Cendekia Insani"
   ```

3. Buat folder `uploads` dan berikan izin:
   ```bash
   mkdir -p /var/www/pmb-staici/backend/uploads
   chmod -R 755 /var/www/pmb-staici/backend/uploads
   ```

4. Build binary Go:
   ```bash
   go build -o /var/www/pmb-staici/backend/bin/api ./cmd/api
   ```

5. Buat Systemd Service agar backend berjalan otomatis dan hidup kembali jika server restart:
   ```bash
   sudo nano /etc/systemd/system/pmb-backend.service
   ```
   Isi konfigurasi service:
   ```ini
   [Unit]
   Description=STAICI PMB Backend API Service
   After=network.target mysql.service

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/pmb-staici/backend
   ExecStart=/var/www/pmb-staici/backend/bin/api
   Restart=always
   RestartSec=5
   EnvironmentFile=/var/www/pmb-staici/backend/.env

   [Install]
   WantedBy=multi-user.target
   ```

6. Jalankan dan aktifkan service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable pmb-backend
   sudo systemctl start pmb-backend
   sudo systemctl status pmb-backend
   ```
   *(Saat pertama kali start, seeder database akan otomatis berjalan dan mengisi data master, jalur, gelombang, rekening, serta tabel terjemahan).*

---

## 5. Deployment Frontend (Next.js)

### Opsi A: Menggunakan VPS (PM2)
1. Masuk ke direktori frontend:
   ```bash
   cd /var/www/pmb-staici/frontend
   ```

2. Konfigurasi environment:
   ```bash
   cp .env.example .env.local
   nano .env.local
   ```
   Isi dengan domain backend produksi:
   ```ini
   NEXT_PUBLIC_API_URL=https://api.pmb.staici.ac.id/api/v1
   ```

3. Install dependensi dan build aplikasi:
   ```bash
   npm install --production=false
   npm run build
   ```

4. Jalankan aplikasi menggunakan PM2:
   ```bash
   pm2 start npm --name "pmb-frontend" -- start -- -p 3000
   pm2 save
   pm2 startup
   ```

### Opsi B: Menggunakan Vercel (Rekomendasi untuk Frontend)
1. Push kode ke repository GitHub/GitLab.
2. Buka dashboard [Vercel](https://vercel.com) dan pilih **Add New Project**.
3. Pilih **Root Directory**: `frontend`.
4. Tambahkan **Environment Variable**:
   - `NEXT_PUBLIC_API_URL`: `https://api.pmb.staici.ac.id/api/v1`
5. Klik **Deploy**.

---

## 6. Konfigurasi Nginx & SSL (Let's Encrypt)

1. Buat file konfigurasi Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/pmb-staici
   ```

2. Masukkan konfigurasi reverse proxy:
   ```nginx
   # 1. Backend API & Uploads
   server {
       server_name api.pmb.staici.ac.id;

       location /uploads/ {
           alias /var/www/pmb-staici/backend/uploads/;
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }

       location / {
           proxy_pass http://127.0.0.1:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           client_max_body_size 10M;
       }
   }

   # 2. Frontend Web (Jika host di VPS yang sama)
   server {
       server_name pmb.staici.ac.id;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. Aktifkan konfigurasi dan test Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/pmb-staici /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. Pasang SSL Gratis dengan Certbot:
   ```bash
   sudo certbot --nginx -d pmb.staici.ac.id -d api.pmb.staici.ac.id
   ```

---

## 7. Checklist Verifikasi Pasca Deploy

- [ ] Endpoint Public API bekerja: `curl https://api.pmb.staici.ac.id/api/v1/info-pmb`
- [ ] Endpoint Terjemahan bekerja: `curl https://api.pmb.staici.ac.id/api/v1/public/translations`
- [ ] Halaman utama dapat diakses via HTTPS: `https://pmb.staici.ac.id`
- [ ] Formulir `/pendaftaran` memuat data jalur dan gelombang aktif dengan benar
- [ ] Fitur alih bahasa (ID / ENG) berfungsi lancar
- [ ] Registrasi & pengiriman OTP via SMTP berhasil sampai ke email pendaftar
- [ ] Unggah berkas berhasil tersimpan dan dapat dilihat admin di `/admincms`
- [ ] Password Super Admin default telah diubah ke password aman produksi
