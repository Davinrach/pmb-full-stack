import { test, expect } from '@playwright/test';

/**
 * PENGUJIAN BLACK BOX TAHAP 1 - PMB STAI CENDEKIA INSANI SITUBONDO
 * Mengacu pada Lembar_Pengujian_Capstone.md (Sheet BlackBox)
 * 
 * Kasus Uji:
 * - TC_BB_005: Registrasi akun dengan format NIK tidak valid (< 16 digit atau huruf)
 * - TC_BB_008: Login calon mahasiswa menggunakan kata sandi salah
 * - TC_BB_009: Mengakses dashboard calon mahasiswa tanpa login (Unauthenticated)
 * - TC_BB_023: Mengakses portal admin CMS tanpa login
 * - TC_BB_035: Calon mahasiswa mencoba mengakses API khusus admin (Privilege Escalation)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

test.describe('Black Box Testing - Tahap 1 (Autentikasi & Otorisasi)', () => {

  test('TC_BB_005: Registrasi akun dengan format NIK tidak valid (< 16 digit atau huruf)', async ({ page, request }) => {
    // 1. Buka halaman registrasi akun calon mahasiswa
    await page.goto(`${BASE_URL}/register`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Skenario A: NIK kurang dari 16 digit (misal: 12345)
    await page.getByLabel(/Nama Lengkap/i).fill('Calon Mahasiswa Uji');
    await page.getByLabel(/NIK/i).fill('12345');
    await page.getByLabel(/Nomor WhatsApp/i).fill('081234567890');
    await page.getByLabel(/Email/i).fill('uji.nik.invalid@example.com');
    await page.locator('#password').fill('KombinasiKuat2026!');
    await page.locator('#confirmPassword').fill('KombinasiKuat2026!');
    
    // Centang persetujuan syarat & ketentuan
    const agreeCheckbox = page.getByRole('checkbox');
    await agreeCheckbox.check();

    // Klik tombol submit registrasi
    const submitBtn = page.getByRole('button', { name: /Daftar Akun PMB Sekarang|Register PMB Account Now/i });
    await submitBtn.click();

    // Verifikasi pesan kesalahan muncul di UI
    const errorAlertA = page.getByText(/NIK harus terdiri dari 16 digit angka/i);
    await expect(errorAlertA).toBeVisible();

    // Ambil bukti screenshot
    await page.screenshot({ path: 'test-results/evidence-TC_BB_005-short-nik.png', fullPage: true });

    // Skenario B: Pengujian NIK mengandung huruf / non-digit
    await page.getByLabel(/NIK/i).fill('351201234567000A');
    const nikValue = await page.getByLabel(/NIK/i).inputValue();
    // Karakter non-digit 'A' harus otomatis dibuang oleh input sanitizer atau jika lolos panjangnya < 16 digit
    expect(nikValue).not.toContain('A');

    // Skenario B2: Uji langsung via API backend untuk memastikan validasi server-side
    const apiRes = await request.post(`${API_BASE_URL}/api/v1/auth/register`, {
      data: {
        nama_lengkap: 'Uji NIK Huruf',
        nik: '351201234567000A',
        no_hp: '081234567890',
        email: 'uji.nik.huruf@example.com',
        password: 'KombinasiKuat2026!',
      },
    });
    
    // Server harus merespons 400 Bad Request
    expect(apiRes.status()).toBe(400);
    const resBody = await apiRes.json();
    expect(resBody.success).toBe(false);
    const apiErrorMsg = resBody.error?.message || resBody.message || '';
    expect(apiErrorMsg).toContain('NIK harus terdiri dari 16 digit angka');
  });

  test('TC_BB_008: Login calon mahasiswa menggunakan kata sandi salah', async ({ page }) => {
    // 1. Buka halaman login calon mahasiswa
    await page.goto(`${BASE_URL}/login`);
    await expect(page.getByRole('button', { name: /Masuk ke Portal Mahasiswa/i })).toBeVisible();

    // 2. Isi form dengan identifier terdaftar yang valid namun kata sandi salah
    const validIdentifier = process.env.TEST_STUDENT_NIK || '3512011203020001';
    await page.getByLabel(/Email Terdaftar atau NIK/i).fill(validIdentifier);
    await page.getByLabel(/Kata Sandi/i).fill('PasswordSalahTotal123!');

    // 3. Klik tombol submit login
    await page.getByRole('button', { name: /Masuk ke Portal Mahasiswa/i }).click();

    // 4. Verifikasi munculnya pesan error generik tanpa mengungkap informasi sensitif
    const errorMessage = page.getByText(/Email \/ NIK atau Kata Sandi yang Anda masukkan salah/i);
    await expect(errorMessage).toBeVisible();

    // 5. Pastikan URL tidak berpindah ke dashboard
    expect(page.url()).not.toContain('/dashboard');

    // Ambil bukti screenshot
    await page.screenshot({ path: 'test-results/evidence-TC_BB_008-wrong-password.png', fullPage: true });
  });

  test('TC_BB_009: Mengakses dashboard calon mahasiswa tanpa login (Unauthenticated)', async ({ page }) => {
    // 1. Akses rute privat /dashboard secara langsung pada browser session yang bersih
    await page.goto(`${BASE_URL}/dashboard`);

    // 2. Verifikasi sistem menolak akses dan secara otomatis mengarahkan ke halaman login
    await expect(page).toHaveURL(/\/login/);

    // Ambil bukti screenshot
    await page.screenshot({ path: 'test-results/evidence-TC_BB_009-unauth-dashboard.png', fullPage: true });
  });

  test('TC_BB_023: Mengakses portal admin CMS tanpa login', async ({ page }) => {
    // 1. Akses rute panel admin /admincms secara langsung pada browser session yang bersih
    await page.goto(`${BASE_URL}/admincms`);

    // 2. Verifikasi sistem menolak akses dan secara otomatis mengarahkan ke halaman login admin
    await expect(page).toHaveURL(/\/loginadmin/);

    // Ambil bukti screenshot
    await page.screenshot({ path: 'test-results/evidence-TC_BB_023-unauth-admincms.png', fullPage: true });
  });

  test('TC_BB_035: Calon mahasiswa mencoba mengakses API khusus admin (Privilege Escalation)', async ({ request }) => {
    const studentIdentifier = process.env.TEST_STUDENT_EMAIL || 'fauzi.ridwan@example.com';
    const studentPassword = process.env.TEST_STUDENT_PASSWORD || 'pendaftar123';

    // 1. Login menggunakan akun calon mahasiswa untuk mendapatkan token JWT ber-role 'calon_mahasiswa'
    const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: {
        identifier: studentIdentifier,
        password: studentPassword,
      },
    });

    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    const studentToken = loginBody.data?.token;
    expect(studentToken).toBeDefined();

    // 2. Panggil endpoint yang dilindungi khusus administrator (GET /api/v1/admin/pendaftar)
    const adminEndpointRes = await request.get(`${API_BASE_URL}/api/v1/admin/pendaftar`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    // 3. Verifikasi sistem menolak akses dengan HTTP Status 403 Forbidden
    expect(adminEndpointRes.status()).toBe(403);

    const adminBody = await adminEndpointRes.json();
    expect(adminBody.success).toBe(false);
  });

});
