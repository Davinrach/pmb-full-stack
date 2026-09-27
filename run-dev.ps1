# Skrip runner untuk menjalankan Backend Golang & Frontend Next.js secara paralel
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Memulai Sistem PMB STAICI Situbondo    " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Pastikan MySQL berjalan
$mysqlRunning = Get-Service -Name "*mysql*", "*mariadb*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "Running" }
if (-not $mysqlRunning) {
    Write-Host "[!] Peringatan: Layanan MySQL tidak terdeteksi berjalan. Pastikan MySQL di XAMPP sudah aktif." -ForegroundColor Yellow
} else {
    Write-Host "[v] MySQL Service aktif." -ForegroundColor Green
}

# 2. Jalankan Backend Golang di jendela terpisah
Write-Host "[*] Menjalankan Backend Golang (:8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; go run ./cmd/api"

# 3. Jalankan Frontend Next.js di jendela terpisah
Write-Host "[*] Menjalankan Frontend Next.js (:3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Backend API  : http://localhost:8080/api/v1" -ForegroundColor Yellow
Write-Host " Frontend Web : http://localhost:3000" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

