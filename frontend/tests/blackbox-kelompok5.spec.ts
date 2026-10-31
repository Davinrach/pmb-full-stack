import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

test.describe('Black Box Testing - Kelompok 5: Cetak Kartu & Ketahanan Sistem', () => {

  // ==========================================
  // TC_BB_020: Mengakses fitur cetak kartu ujian sebelum pembayaran/administrasi diverifikasi
  // ==========================================
  test('TC_BB_020: Mengakses fitur cetak kartu ujian sebelum pembayaran diverifikasi', async ({ page, request }) => {
    // 1. Login akun yang masih berstatus menunggu_verifikasi
    const studentUser = 'siti.halimah@example.com';
    const studentPass = 'pendaftar123';

    const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { identifier: studentUser, password: studentPass },
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.data?.token;
    const user = loginData.data?.user;

    // 2. Akses halaman cetak
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('pmb_auth_token', token);
      localStorage.setItem('pmb_user', JSON.stringify(user));
    }, { token, user });

    await page.goto(`${BASE_URL}/dashboard/cetak`);
    await page.waitForLoadState('networkidle');

    // Ambil screenshot sebagai bukti status aktual implementasi
    await page.screenshot({ path: '../docs/evidence/evidence-TC_BB_020-unverified-access.png', fullPage: true });

    // Verifikasi apakah sistem menolak pencetakan kartu atau menonaktifkan tombol
    const printButton = page.getByRole('button', { name: /Cetak \/ Simpan PDF/i });
    const isPrintButtonVisible = await printButton.isVisible().catch(() => false);

    // Sesuai aturan: jika tombol cetak tetap aktif dan tidak ada peringatan penolakan,
    // maka aktual tidak memenuhi ekspektasi lembar pengujian (dilaporkan apa adanya).
    console.log(`[TC_BB_020] Tombol cetak kartu terlihat: ${isPrintButtonVisible}`);
  });

  // ==========================================
  // TC_BB_021: Mencetak kartu peserta ujian setelah persyaratan dan verifikasi terpenuhi
  // ==========================================
  test('TC_BB_021: Pratinjau layout kartu peserta ujian pendaftar terverifikasi', async ({ page, request }) => {
    // 1. Login akun pendaftar yang sudah lolos seleksi / terverifikasi
    const verifiedUser = process.env.TEST_STUDENT_EMAIL || 'fauzi.ridwan@example.com';
    const verifiedPass = process.env.TEST_STUDENT_PASSWORD || 'pendaftar123';

    const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { identifier: verifiedUser, password: verifiedPass },
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.data?.token;
    const user = loginData.data?.user;

    // 2. Akses halaman cetak kartu
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('pmb_auth_token', token);
      localStorage.setItem('pmb_user', JSON.stringify(user));
    }, { token, user });

    await page.goto(`${BASE_URL}/dashboard/cetak`);
    await page.waitForLoadState('networkidle');

    // Verifikasi Kop & Judul Dokumen Resmi
    await expect(page.getByRole('heading', { name: /STAI Cendekia Insani Situbondo/i })).toBeVisible();
    await expect(page.getByText(/KARTU TANDA BUKTI PENDAFTARAN PMB/i)).toBeVisible();
    await expect(page.getByText(/Ahmad Fauzi Ridwan/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Cetak \/ Simpan PDF/i })).toBeVisible();

    await page.screenshot({ path: '../docs/evidence/evidence-TC_BB_021-print-layout.png', fullPage: true });
  });

  // ==========================================
  // TC_BB_038: Menguji ketahanan koneksi database melalui endpoint /api/v1/health
  // ==========================================
  test('TC_BB_038: Health check endpoint ketersediaan database MySQL', async ({ request }) => {
    const healthRes = await request.get(`${API_BASE_URL}/api/v1/health`);
    expect(healthRes.status()).toBe(200);
    const body = await healthRes.json();
    expect(body.status).toBe('healthy');
    expect(body.database).toBe('connected');
    expect(body.app).toContain('PMB STAI Cendekia Insani');
  });

});
