import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

test.describe('Black Box Testing - Kelompok 3: Alur Pembayaran & Bukti Transfer', () => {

  // Helper untuk membuat user baru & submit pendaftaran jalur tertentu
  async function createApplicantWithJalur(request: any, jalur: 'Reguler' | 'KIP-Kuliah') {
    const timestamp = Date.now();
    const uniqueEmail = `calon.bayar.${timestamp}@example.com`;
    const uniqueNIK = `3512${Math.floor(100000000000 + Math.random() * 900000000000).toString().slice(0, 12)}`;
    const password = 'KombinasiKuat2026!';

    // Register
    const regRes = await request.post(`${API_BASE_URL}/api/v1/auth/register`, {
      data: {
        nama_lengkap: `Pendaftar Bayar ${timestamp.toString().slice(-4)}`,
        nik: uniqueNIK,
        no_hp: '081234567890',
        email: uniqueEmail,
        password: password,
      },
    });
    const regBody = await regRes.json();
    const devOtp = regBody.data?.dev_otp;

    let token = '';
    if (devOtp) {
      const verifyRes = await request.post(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
        data: { email: uniqueEmail, otp: devOtp },
      });
      token = (await verifyRes.json()).data?.token;
    } else {
      const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
        data: { identifier: uniqueEmail, password: password },
      });
      token = (await loginRes.json()).data?.token;
    }

    // Isi step 1-4
    await request.put(`${API_BASE_URL}/api/v1/pendaftar/identitas`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        jenis_kelamin: 'Laki-laki',
        alamat: 'Jl. Ahmad Yani No. 10, Situbondo',
        tempat_lahir: 'Situbondo',
        tanggal_lahir: '2004-08-10',
        status_warga_negara: 'WNI',
        agama: 'Islam',
        status_pernikahan: 'Tidak Kawin',
      },
    });

    await request.put(`${API_BASE_URL}/api/v1/pendaftar/asal-sekolah`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        nama_sekolah: 'SMA Negeri 2 Situbondo',
        status_sekolah: 'Negeri',
        jurusan_sekolah: 'MIPA',
        nilai_rata_rata: 87.5,
        tahun_lulus: 2024,
      },
    });

    await request.put(`${API_BASE_URL}/api/v1/pendaftar/orang-tua`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        nama_ayah: 'Bambang Sudiro',
        nama_ibu: 'Sri Wahyuni',
        no_hp_orang_tua_wali: '081233445566',
      },
    });

    await request.put(`${API_BASE_URL}/api/v1/pendaftar/prodi-gelombang`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        program_studi_id: 1, // MPI
        gelombang_id: 2,
        jalur_pendaftaran: jalur,
      },
    });

    // Final submit
    await request.post(`${API_BASE_URL}/api/v1/pendaftar/submit`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      email: uniqueEmail,
      nik: uniqueNIK,
      password: password,
      token: token,
    };
  }

  // ==========================================
  // TC_BB_018: Konfirmasi pembayaran via transfer bank manual (Jalur Reguler)
  // ==========================================
  test('TC_BB_018: Mengirim konfirmasi pembayaran melalui transfer bank manual (Jalur Reguler)', async ({ request }) => {
    const applicant = await createApplicantWithJalur(request, 'Reguler');

    // 1. Ambil file dummy struk transfer (gambar / PDF)
    const validReceiptPath = path.join(FIXTURES_DIR, 'dummy_valid.pdf');
    const fileContent = fs.readFileSync(validReceiptPath);

    // 2. Kirim konfirmasi pembayaran
    const konfirmasiRes = await request.post(`${API_BASE_URL}/api/v1/pembayaran/konfirmasi`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      multipart: {
        nama_pengirim: 'Bambang Sudiro',
        bank_tujuan: 'Bank Syariah Indonesia (BSI)',
        bukti_transfer: {
          name: 'struk_transfer_bsi.pdf',
          mimeType: 'application/pdf',
          buffer: fileContent,
        },
      },
    });

    expect([200, 201]).toContain(konfirmasiRes.status());
    const konfirmasiBody = await konfirmasiRes.json();
    expect(konfirmasiBody.success).toBe(true);

    // 3. Verifikasi status pembayaran menjadi menunggu verifikasi
    const statusRes = await request.get(`${API_BASE_URL}/api/v1/pembayaran/status`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
    });
    expect(statusRes.status()).toBe(200);
    const statusBody = await statusRes.json();
    expect(statusBody.data?.status_pembayaran || statusBody.data?.status_pendaftaran).toMatch(/menunggu|pending/i);
    expect(statusBody.data?.riwayat_pembayaran?.length).toBeGreaterThan(0);
  });

  // ==========================================
  // TC_BB_019: Konfirmasi pembebasan biaya pada Jalur KIP-Kuliah
  // ==========================================
  test('TC_BB_019: Konfirmasi pembebasan biaya pendaftaran pada halaman pembayaran Jalur KIP-Kuliah', async ({ page, request }) => {
    const applicant = await createApplicantWithJalur(request, 'KIP-Kuliah');

    // Login via UI
    await page.goto(`${BASE_URL}/login`);
    await page.locator('#identifier').fill(applicant.email);
    await page.locator('#password').fill(applicant.password);
    await page.getByRole('button', { name: /Masuk ke Portal Mahasiswa|Sign In to Applicant Portal/i }).click();

    // Arahkan ke rute /dashboard/pembayaran
    await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });
    await page.goto(`${BASE_URL}/dashboard/pembayaran`);
    await page.waitForLoadState('networkidle');

    // Verifikasi Banner Beasiswa KIP dan Pembebasan Biaya Rp 0
    await expect(page.getByText(/Jalur Beasiswa KIP-Kuliah/i).first()).toBeVisible();
    await expect(page.getByText(/Bebas Biaya Pendaftaran/i).first()).toBeVisible();
    await expect(page.getByText(/Rp 0/i).first()).toBeVisible();
    await expect(page.getByText(/Konfirmasi Pembayaran Tidak Diperlukan/i).first()).toBeVisible();

    // Ambil bukti screenshot
    await page.screenshot({ path: 'test-results/evidence-TC_BB_019-kip-free-payment.png', fullPage: false });
  });

});
