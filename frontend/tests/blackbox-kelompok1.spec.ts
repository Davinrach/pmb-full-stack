import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

test.describe('Black Box Testing - Kelompok 1: Navigasi, Informasi Publik, & Landing Page', () => {

  // ==========================================
  // TC_BB_001: Mengakses Halaman Utama PMB STAICI
  // ==========================================
  test('TC_BB_001: Mengakses halaman utama website PMB STAICI', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    // 1. Verifikasi elemen navigasi dan brand/logo
    const brandHeading = page.getByRole('heading', { level: 1 }).first();
    await expect(brandHeading).toBeVisible();

    // 2. Verifikasi 3 Program Studi (MPI, AS, KPI) tampil di bagian main content
    const mainContent = page.getByRole('main');
    await expect(mainContent.getByRole('heading', { name: /Manajemen Pendidikan Islam/i })).toBeVisible();
    await expect(mainContent.getByRole('heading', { name: /Ahwal Al-Syakhsiyah/i })).toBeVisible();
    await expect(mainContent.getByRole('heading', { name: /Komunikasi dan Penyiaran Islam/i })).toBeVisible();

    // 3. Verifikasi tombol navigasi pendaftaran / aksi utama
    const ctaButton = page.getByRole('link', { name: /Daftar Sekarang|Buka Pendaftaran|Pendaftaran/i }).first();
    await expect(ctaButton).toBeVisible();

    // Ambil bukti screenshot
    await page.screenshot({ path: 'test-results/evidence-TC_BB_001-landing-page.png', fullPage: false });
  });

  // ==========================================
  // TC_BB_002: Membuka Detail Program Studi yang Terdaftar
  // ==========================================
  test('TC_BB_002: Membuka detail program studi yang terdaftar (MPI, AS, KPI)', async ({ page }) => {
    // Uji salah satu prodi terdaftar, misal: /program-studi/mpi
    await page.goto(`${BASE_URL}/program-studi/mpi`);
    await page.waitForLoadState('networkidle');

    // 1. Verifikasi judul prodi tampil
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Manajemen Pendidikan Islam/i);

    // 2. Verifikasi informasi gelar akademik (S.Pd.)
    await expect(page.getByText(/S\.Pd/i).first()).toBeVisible();

    // 3. Verifikasi bagian profil/karir atau kurikulum
    await expect(page.getByText(/Prospek Karir|Profil Lulusan|Tentang Program Studi/i).first()).toBeVisible();

    // Ambil bukti screenshot
    await page.screenshot({ path: 'test-results/evidence-TC_BB_002-detail-prodi-mpi.png', fullPage: false });
  });

  // ==========================================
  // TC_BB_003: Mengakses Slug Program Studi Tidak Terdaftar (404)
  // ==========================================
  test('TC_BB_003: Mengakses halaman program studi dengan slug tidak terdaftar (404 Not Found)', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/program-studi/teknik-mesin`);
    await page.waitForLoadState('networkidle');

    // Sistem menampilkan halaman 404 (bisa status code 404 atau teks indikator Not Found)
    const notFoundText = page.getByText(/404|Halaman Tidak Ditemukan|This page could not be found/i).first();
    await expect(notFoundText).toBeVisible();

    // Ambil bukti screenshot
    await page.screenshot({ path: 'test-results/evidence-TC_BB_003-prodi-404.png', fullPage: false });
  });

});
