import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Muat environment variable uji dari .env.test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

test.describe('Black Box Testing - Tahap 2 (Formulir, Berkas, Admin Portal, & Keamanan IDOR)', () => {

  // ==========================================
  // TC_BB_004: Registrasi Akun Valid
  // ==========================================
  test('TC_BB_004: Registrasi akun calon mahasiswa dengan data valid', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const timestamp = Date.now();
    const uniqueEmail = `calon.valid.${timestamp}@example.com`;
    // Buat NIK 16 digit angka valid dan unik
    const uniqueNIK = `3512${Math.floor(100000000000 + Math.random() * 900000000000).toString().slice(0, 12)}`;

    await page.getByLabel(/Nama Lengkap/i).fill('Calon Mahasiswa Valid');
    await page.getByLabel(/NIK/i).fill(uniqueNIK);
    await page.getByLabel(/Nomor WhatsApp/i).fill('081234567890');
    await page.getByLabel(/Email/i).fill(uniqueEmail);
    await page.locator('#password').fill('KombinasiKuat2026!');
    await page.locator('#confirmPassword').fill('KombinasiKuat2026!');

    const agreeCheckbox = page.getByRole('checkbox');
    await agreeCheckbox.check();

    const submitBtn = page.getByRole('button', { name: /Daftar Akun PMB Sekarang|Register PMB Account Now/i });
    await submitBtn.click();

    // Verifikasi modal pop-up verifikasi OTP 6 digit muncul
    const otpModalHeader = page.getByText(/Verifikasi Email Akun|Email Verification/i);
    await expect(otpModalHeader).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/evidence-TC_BB_004-register-success.png', fullPage: true });
  });

  // ==========================================
  // TC_BB_006: Registrasi NIK / Email Duplikat
  // ==========================================
  test('TC_BB_006: Registrasi menggunakan NIK atau Email yang sudah terdaftar', async ({ page, request }) => {
    const existingEmail = process.env.TEST_STUDENT_EMAIL || 'fauzi.ridwan@example.com';
    const existingNIK = process.env.TEST_STUDENT_NIK || '3512011203020001';

    // 1. Pengujian via UI Form Registrasi
    await page.goto(`${BASE_URL}/register`);
    await page.getByLabel(/Nama Lengkap/i).fill('Pendaftar Duplikat');
    await page.getByLabel(/NIK/i).fill(existingNIK);
    await page.getByLabel(/Nomor WhatsApp/i).fill('081234567890');
    await page.getByLabel(/Email/i).fill(existingEmail);
    await page.locator('#password').fill('KombinasiKuat2026!');
    await page.locator('#confirmPassword').fill('KombinasiKuat2026!');

    const agreeCheckbox = page.getByRole('checkbox');
    await agreeCheckbox.check();

    const submitBtn = page.getByRole('button', { name: /Daftar Akun PMB Sekarang|Register PMB Account Now/i });
    await submitBtn.click();

    // Verifikasi pesan kesalahan duplikasi muncul di UI
    const duplicateAlert = page.getByText(/sudah terdaftar/i);
    await expect(duplicateAlert).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/evidence-TC_BB_006-duplicate-register.png', fullPage: true });

    // 2. Verifikasi Backend API Integrity (HTTP 400 Bad Request)
    const apiRes = await request.post(`${API_BASE_URL}/api/v1/auth/register`, {
      data: {
        nama_lengkap: 'Pendaftar Duplikat API',
        nik: existingNIK,
        no_hp: '081234567890',
        email: existingEmail,
        password: 'KombinasiKuat2026!',
      },
    });

    expect(apiRes.status()).toBe(400);
    const apiBody = await apiRes.json();
    expect(apiBody.success).toBe(false);
    const errorMsg = apiBody.error?.message || apiBody.message || '';
    expect(errorMsg).toMatch(/sudah terdaftar/i);
  });

  // ==========================================
  // TC_BB_007: Login Calon Mahasiswa Valid
  // ==========================================
  test('TC_BB_007: Login calon mahasiswa dengan kredensial valid (Email atau NIK)', async ({ page }) => {
    const validIdentifier = process.env.TEST_STUDENT_EMAIL || 'fauzi.ridwan@example.com';
    const validPassword = process.env.TEST_STUDENT_PASSWORD || 'pendaftar123';

    await page.goto(`${BASE_URL}/login`);

    await page.locator('#identifier').fill(validIdentifier);
    await page.locator('#password').fill(validPassword);

    const loginBtn = page.getByRole('button', { name: /Masuk ke Portal Mahasiswa|Sign In to Applicant Portal/i });
    await loginBtn.click();

    // Verifikasi ekspektasi pengalihan ke dashboard
    try {
      await page.waitForURL(/.*(dashboard|formulir).*/, { timeout: 5000 });
      await page.screenshot({ path: 'test-results/evidence-TC_BB_007-valid-login.png', fullPage: true });
    } catch (err) {
      await page.screenshot({ path: 'test-results/evidence-TC_BB_007-redirect-to-homepage.png', fullPage: true });
      throw new Error(`Hasil Aktual tidak sesuai Lembar Pengujian: Pengguna dialihkan ke "${page.url()}" alih-alih rute "/dashboard"`);
    }
  });

  // ==========================================
  // TC_BB_010: Form Kolom Wajib Kosong
  // ==========================================
  test('TC_BB_010: Mengirim formulir pendaftaran dengan kolom wajib yang kosong', async ({ request }) => {
    // 1. Dapatkan token calon mahasiswa
    const studentIdentifier = process.env.TEST_STUDENT_EMAIL || 'fauzi.ridwan@example.com';
    const studentPassword = process.env.TEST_STUDENT_PASSWORD || 'pendaftar123';

    const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { identifier: studentIdentifier, password: studentPassword },
    });
    const loginBody = await loginRes.json();
    const token = loginBody.data?.token;

    // 2. Kirim update identitas dengan mengosongkan field wajib (alamat, tempat_lahir kosong)
    const updateRes = await request.put(`${API_BASE_URL}/api/v1/pendaftar/identitas`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        jenis_kelamin: '',
        alamat: '',
        tempat_lahir: '',
        status_warga_negara: 'WNI',
        agama: 'Islam',
      },
    });

    // 3. Sistem menolak dengan HTTP 400 Bad Request
    expect([400, 403]).toContain(updateRes.status());
    const resBody = await updateRes.json();
    expect(resBody.success).toBe(false);
  });

  // ==========================================
  // TC_BB_015: Upload Berkas Format Terlarang (.php)
  // ==========================================
  test('TC_BB_015: Mengunggah dokumen dengan format yang tidak diizinkan (.php skrip)', async ({ request }) => {
    const studentIdentifier = process.env.TEST_STUDENT_EMAIL || 'fauzi.ridwan@example.com';
    const studentPassword = process.env.TEST_STUDENT_PASSWORD || 'pendaftar123';

    const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { identifier: studentIdentifier, password: studentPassword },
    });
    const loginBody = await loginRes.json();
    const token = loginBody.data?.token;

    const exploitFilePath = path.join(FIXTURES_DIR, 'dummy_exploit.php');
    const fileContent = fs.readFileSync(exploitFilePath);

    const uploadRes = await request.post(`${API_BASE_URL}/api/v1/pendaftar/berkas`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        jenis_dokumen: 'ktp',
        file: {
          name: 'dummy_exploit.php',
          mimeType: 'application/x-php',
          buffer: fileContent,
        },
      },
    });

    // Sistem wajib menolak file berformat tidak didukung dengan HTTP 400
    expect(uploadRes.status()).toBe(400);
    const body = await uploadRes.json();
    expect(body.success).toBe(false);
    const errorMsg = body.error?.message || body.message || '';
    expect(errorMsg).toMatch(/format file tidak didukung/i);
  });

  // ==========================================
  // TC_BB_016: Upload Berkas Melebihi 2 MB
  // ==========================================
  test('TC_BB_016: Mengunggah dokumen yang melebihi batas ukuran maksimum (> 2 MB)', async ({ request }) => {
    const studentIdentifier = process.env.TEST_STUDENT_EMAIL || 'fauzi.ridwan@example.com';
    const studentPassword = process.env.TEST_STUDENT_PASSWORD || 'pendaftar123';

    const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { identifier: studentIdentifier, password: studentPassword },
    });
    const loginBody = await loginRes.json();
    const token = loginBody.data?.token;

    const largeFilePath = path.join(FIXTURES_DIR, 'dummy_large.pdf');
    const fileContent = fs.readFileSync(largeFilePath);

    const uploadRes = await request.post(`${API_BASE_URL}/api/v1/pendaftar/berkas`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        jenis_dokumen: 'ktp',
        file: {
          name: 'dummy_large.pdf',
          mimeType: 'application/pdf',
          buffer: fileContent,
        },
      },
    });

    // Sistem wajib menolak file > 2 MB dengan HTTP 400
    expect(uploadRes.status()).toBe(400);
    const body = await uploadRes.json();
    expect(body.success).toBe(false);
    const errorMsg = body.error?.message || body.message || '';
    expect(errorMsg).toMatch(/melebihi batas maksimal 2 MB/i);
  });

  // ==========================================
  // TC_BB_017: Upload Berkas Format & Ukuran Valid
  // ==========================================
  test('TC_BB_017: Mengunggah dokumen persyaratan dengan format dan ukuran valid (<= 2 MB)', async ({ request }) => {
    const studentIdentifier = process.env.TEST_STUDENT_EMAIL || 'fauzi.ridwan@example.com';
    const studentPassword = process.env.TEST_STUDENT_PASSWORD || 'pendaftar123';

    const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { identifier: studentIdentifier, password: studentPassword },
    });
    const loginBody = await loginRes.json();
    const token = loginBody.data?.token;

    const validFilePath = path.join(FIXTURES_DIR, 'dummy_valid.pdf');
    const fileContent = fs.readFileSync(validFilePath);

    const uploadRes = await request.post(`${API_BASE_URL}/api/v1/pendaftar/berkas`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        jenis_dokumen: 'ktp',
        file: {
          name: 'dummy_valid.pdf',
          mimeType: 'application/pdf',
          buffer: fileContent,
        },
      },
    });

    // Sistem menerima unggahan berkas dengan status 200 OK
    expect(uploadRes.status()).toBe(200);
    const body = await uploadRes.json();
    expect(body.success).toBe(true);
  });

  // ==========================================
  // TC_BB_022: Login Admin Valid
  // ==========================================
  test('TC_BB_022: Login admin PMB menggunakan akun yang valid pada portal admin', async ({ page }) => {
    const adminUser = process.env.TEST_ADMIN_USERNAME || 'admin';
    const adminPass = process.env.TEST_ADMIN_PASSWORD || 'adminpmb123';

    await page.goto(`${BASE_URL}/loginadmin`);

    await page.getByLabel(/Username \/ Email Admin/i).fill(adminUser);
    await page.getByLabel(/Kata Sandi/i).fill(adminPass);

    const loginBtn = page.getByRole('button', { name: /Masuk ke Dashboard Admin CMS/i });
    await loginBtn.click();

    // Sistem mengarahkan ke /admincms
    await page.waitForURL(/.*admincms.*/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*admincms.*/);

    await page.screenshot({ path: 'test-results/evidence-TC_BB_022-admin-login-success.png', fullPage: true });
  });

  // ==========================================
  // TC_BB_024: Akses Portal Admin oleh Calon Mhs
  // ==========================================
  test('TC_BB_024: Mengakses portal admin menggunakan akun calon mahasiswa', async ({ page }) => {
    const studentIdentifier = process.env.TEST_STUDENT_EMAIL || 'fauzi.ridwan@example.com';
    const studentPassword = process.env.TEST_STUDENT_PASSWORD || 'pendaftar123';

    await page.goto(`${BASE_URL}/loginadmin`);

    await page.getByLabel(/Username \/ Email Admin/i).fill(studentIdentifier);
    await page.getByLabel(/Kata Sandi/i).fill(studentPassword);

    const loginBtn = page.getByRole('button', { name: /Masuk ke Dashboard Admin CMS/i });
    await loginBtn.click();

    // Sistem menolak dan menampilkan pesan larangan peran calon mahasiswa
    const rejectionAlert = page.getByText(/Akun ini terdaftar sebagai Calon Mahasiswa. Silakan login di Portal Calon Mahasiswa./i);
    await expect(rejectionAlert).toBeVisible({ timeout: 10000 });

    // Memastikan tidak dialihkan ke /admincms
    expect(page.url()).toContain('/loginadmin');

    await page.screenshot({ path: 'test-results/evidence-TC_BB_024-admin-role-rejection.png', fullPage: true });
  });

  // ==========================================
  // TC_BB_036: Direct File Access / IDOR Protection
  // ==========================================
  test('TC_BB_036: Mengakses berkas pendaftar melalui URL langsung tanpa otorisasi (Direct IDOR Access)', async ({ request }) => {
    // 1. Coba akses folder fisik direktori uploads secara langsung
    const directFileRes = await request.get(`${API_BASE_URL}/uploads/berkas/ktp_1.pdf`);
    // Sistem menolak akses langsung (HTTP 404 Not Found atau 403 Forbidden)
    expect([404, 403]).toContain(directFileRes.status());

    // 2. Coba panggil streaming API berkas tanpa menyertakan token otorisasi
    const unauthStreamingRes = await request.get(`${API_BASE_URL}/api/v1/berkas/1`);
    // Sistem menolak dengan HTTP 401 Unauthorized
    expect(unauthStreamingRes.status()).toBe(401);
  });

  // ==========================================
  // TC_BB_037: Form Resubmit saat Locked
  // ==========================================
  test('TC_BB_037: Mengirim formulir pendaftaran berulang kali saat sudah berstatus terkunci', async ({ request }) => {
    const studentIdentifier = process.env.TEST_STUDENT_EMAIL || 'fauzi.ridwan@example.com';
    const studentPassword = process.env.TEST_STUDENT_PASSWORD || 'pendaftar123';

    // 1. Dapatkan token akun calon mahasiswa yang sudah submit & terkunci (is_locked = true)
    const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { identifier: studentIdentifier, password: studentPassword },
    });
    const loginBody = await loginRes.json();
    const token = loginBody.data?.token;

    // Pastikan status formulir pendaftar dalam kondisi terkunci (is_locked = true)
    await request.post(`${API_BASE_URL}/api/v1/pendaftar/submit`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2. Coba kirim perubahan data formulir identitas
    const updateRes = await request.put(`${API_BASE_URL}/api/v1/pendaftar/identitas`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        jenis_kelamin: 'Laki-laki',
        alamat: 'Jl. Percobaan No. 99, Situbondo',
        tempat_lahir: 'Situbondo',
        tanggal_lahir: '2004-05-15',
        status_warga_negara: 'WNI',
        agama: 'Islam',
        status_pernikahan: 'Tidak Kawin',
      },
    });

    // 3. Backend menolak dengan HTTP 403 Forbidden
    expect(updateRes.status()).toBe(403);
    const body = await updateRes.json();
    expect(body.success).toBe(false);
    const errorMsg = body.error?.message || body.message || '';
    expect(errorMsg).toMatch(/dikunci/i);
  });

});
