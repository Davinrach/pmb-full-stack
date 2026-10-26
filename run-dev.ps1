# Skrip runner untuk menjalankan Backend Golang & Frontend Next.js secara paralel
# Refresh PATH dari Machine & User environment variable
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Memulai Sistem PMB STAICI Situbondo    " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Pastikan MySQL berjalan (Cek Service, Process mysqld, atau Port 3306)
$mysqlRunning = (Get-Service -Name "*mysql*", "*mariadb*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "Running" }) -or
                (Get-Process -Name "*mysql*", "*mariadb*", "mysqld" -ErrorAction SilentlyContinue)

if (-not $mysqlRunning) {
    Write-Host "[!] Peringatan: Layanan MySQL tidak terdeteksi berjalan. Pastikan MySQL di XAMPP sudah aktif." -ForegroundColor Yellow
} else {
    Write-Host "[v] MySQL aktif (XAMPP / Service)." -ForegroundColor Green
}

# 2. Jalankan Backend Golang di jendela terpisah
Write-Host "[*] Menjalankan Backend Golang (:8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); cd '$PSScriptRoot\backend'; go run ./cmd/api"

# 3. Jalankan Frontend Next.js di jendela terpisah
Write-Host "[*] Menjalankan Frontend Next.js (:3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Backend API  : http://localhost:8080/api/v1" -ForegroundColor Yellow
Write-Host " Frontend Web : http://localhost:3000" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

