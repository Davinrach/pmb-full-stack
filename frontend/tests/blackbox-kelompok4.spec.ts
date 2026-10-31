import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

test.describe('Black Box Testing - Kelompok 4: Panel Admin, Verifikasi, & Seleksi', () => {

  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    const adminUser = process.env.TEST_ADMIN_USERNAME || 'admin';
    const adminPass = process.env.TEST_ADMIN_PASSWORD || 'adminpmb123';

    const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { identifier: adminUser, password: adminPass },
    });
    expect(loginRes.status()).toBe(200);
    const body = await loginRes.json();
    adminToken = body.data?.token;
    expect(adminToken).toBeDefined();
  });

  // ==========================================
  // TC_BB_025: Meninjau dashboard statistik pendaftar pada Admin CMS
  // ==========================================
  test('TC_BB_025: Meninjau dashboard statistik pendaftar pada Admin CMS', async ({ request, page }) => {
    // 1. Verifikasi endpoint API statistik admin
    const statsRes = await request.get(`${API_BASE_URL}/api/v1/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(statsRes.status()).toBe(200);
    const statsBody = await statsRes.json();
    expect(statsBody.success).toBe(true);
    expect(statsBody.data?.total_pendaftar).toBeDefined();
    expect(statsBody.data?.statistik_prodi).toBeInstanceOf(Array);
    expect(statsBody.data?.statistik_gelombang).toBeInstanceOf(Array);

    // 2. Verifikasi UI Overview di /admincms
    await page.goto(`${BASE_URL}/loginadmin`);
    await page.locator('#admin-identifier').fill(process.env.TEST_ADMIN_USERNAME || 'admin');
    await page.locator('#admin-password').fill(process.env.TEST_ADMIN_PASSWORD || 'adminpmb123');
    await page.getByRole('button', { name: /Masuk ke Dashboard Admin CMS/i }).click();

    await page.waitForURL(/.*admincms.*/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Data Pendaftar PMB/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pendaftar PMB/i }).first()).toBeVisible();

    await page.screenshot({ path: '../docs/evidence/evidence-TC_BB_025-admin-stats.png', fullPage: false });
  });

  // ==========================================
  // TC_BB_026: Mencari dan menyaring data calon mahasiswa pada tabel master
  // ==========================================
  test('TC_BB_026: Mencari dan menyaring data calon mahasiswa pada tabel master', async ({ request }) => {
    // Panggil pendaftar dengan filter query search
    const listRes = await request.get(`${API_BASE_URL}/api/v1/admin/pendaftar?search=Fauzi&page=1&per_page=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.success).toBe(true);
    expect(listBody.data?.length).toBeGreaterThan(0);
    expect(listBody.data[0].user?.nama_lengkap).toContain('Fauzi');
  });

  // ==========================================
  // TC_BB_027: Melihat dokumen milik calon mahasiswa melalui CMS
  // ==========================================
  test('TC_BB_027: Melihat dokumen milik calon mahasiswa melalui CMS', async ({ request }) => {
    // Ambil detail pendaftar 11
    const detailRes = await request.get(`${API_BASE_URL}/api/v1/admin/pendaftar/11`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(detailRes.status()).toBe(200);
    const detail = (await detailRes.json()).data;
    expect(detail.berkas).toBeInstanceOf(Array);
    expect(detail.berkas.length).toBeGreaterThan(0);

    const firstBerkasId = detail.berkas[0].id;
    // Buka berkas streaming API dengan token admin
    const streamRes = await request.get(`${API_BASE_URL}/api/v1/berkas/${firstBerkasId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(streamRes.status()).toBe(200);
    const contentType = streamRes.headers()['content-type'];
    expect(['application/pdf', 'image/jpeg', 'image/png']).toContain(contentType);
  });

  // ==========================================
  // TC_BB_028: Menyetujui dokumen persyaratan calon mahasiswa
  // ==========================================
  test('TC_BB_028: Menyetujui dokumen persyaratan calon mahasiswa', async ({ request }) => {
    const detailRes = await request.get(`${API_BASE_URL}/api/v1/admin/pendaftar/11`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const detail = (await detailRes.json()).data;
    const berkasId = detail.berkas[0].id;

    // Setujui berkas via PUT
    const approveRes = await request.put(`${API_BASE_URL}/api/v1/admin/pendaftar/11/verifikasi-berkas`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        berkas_id: berkasId,
        status: 'valid',
        catatan_admin: 'Berkas valid dan terbaca jelas oleh panitia',
      },
    });
    expect(approveRes.status()).toBe(200);
    const body = await approveRes.json();
    expect(body.success).toBe(true);
    expect(body.data?.berkas?.status_verifikasi).toBe('valid');
  });

  // ==========================================
  // TC_BB_029: Menolak dokumen persyaratan yang tidak sesuai beserta alasan
  // ==========================================
  test('TC_BB_029: Menolak dokumen persyaratan yang tidak sesuai beserta alasan', async ({ request }) => {
    const detailRes = await request.get(`${API_BASE_URL}/api/v1/admin/pendaftar/11`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const detail = (await detailRes.json()).data;
    const berkasId = detail.berkas[0].id;

    // Tolak berkas via PUT
    const rejectRes = await request.put(`${API_BASE_URL}/api/v1/admin/pendaftar/11/verifikasi-berkas`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        berkas_id: berkasId,
        status: 'invalid',
        catatan_admin: 'Foto buram dan tidak terbaca jelas. Harap unggah ulang scan asli.',
      },
    });
    expect(rejectRes.status()).toBe(200);
    const body = await rejectRes.json();
    expect(body.success).toBe(true);
    expect(body.data?.berkas?.status_verifikasi).toBe('invalid');

    // Kembalikan ke valid agar data kembali bersih
    await request.put(`${API_BASE_URL}/api/v1/admin/pendaftar/11/verifikasi-berkas`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        berkas_id: berkasId,
        status: 'valid',
        catatan_admin: 'Berkas valid',
      },
    });
  });

  // ==========================================
  // TC_BB_030: Memverifikasi pembayaran calon mahasiswa
  // ==========================================
  test('TC_BB_030: Memverifikasi pembayaran calon mahasiswa', async ({ request }) => {
    // Setujui pembayaran pendaftar 11 via PUT
    const verifyPayRes = await request.put(`${API_BASE_URL}/api/v1/admin/pendaftar/11/verifikasi-pembayaran`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        pembayaran_id: 11,
        status: 'diterima',
        alasan_penolakan: '',
      },
    });
    expect(verifyPayRes.status()).toBe(200);
    const body = await verifyPayRes.json();
    expect(body.success).toBe(true);
    expect(body.data?.pembayaran?.status).toBe('diterima');
  });

  // ==========================================
  // TC_BB_031: Memperbarui status seleksi kelulusan calon mahasiswa
  // ==========================================
  test('TC_BB_031: Memperbarui status seleksi kelulusan calon mahasiswa', async ({ request }) => {
    const nilaiUjian = 88.5;
    const nilaiWawancara = 90.0;

    const seleksiRes = await request.put(`${API_BASE_URL}/api/v1/admin/pendaftar/11/status-seleksi`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        status: 'lolos_seleksi',
        catatan: 'Selamat Anda dinyatakan Lulus Utama Program Sarjana MPI',
        nilai_ujian: nilaiUjian,
        nilai_wawancara: nilaiWawancara,
      },
    });
    expect(seleksiRes.status()).toBe(200);
    const body = await seleksiRes.json();
    expect(body.success).toBe(true);
    expect(body.data?.status_pendaftaran).toBe('lolos_seleksi');
  });

  // ==========================================
  // TC_BB_032: Memperbarui banner atau konten publik melalui CMS
  // ==========================================
  test('TC_BB_032: Memperbarui banner atau konten publik melalui CMS', async ({ request }) => {
    const testText = 'Pengumuman Resmi PMB TA 2026/2027 Telah Dibuka!';
    const updateRes = await request.put(`${API_BASE_URL}/api/v1/admin/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        announcement_text: testText,
        banner_title: 'Portal PMB STAICI 2026/2027',
      },
    });
    expect(updateRes.status()).toBe(200);
    const body = await updateRes.json();
    expect(body.success).toBe(true);

    // Cek pada endpoint publik
    const publicRes = await request.get(`${API_BASE_URL}/api/v1/public/settings`);
    expect(publicRes.status()).toBe(200);
    const pubData = (await publicRes.json()).data;
    expect(pubData.announcement_text).toBe(testText);
  });

  // ==========================================
  // TC_BB_033: Mengelola gelombang pendaftaran (Tambah/Ubah tanggal & biaya)
  // ==========================================
  test('TC_BB_033: Mengelola gelombang pendaftaran (Tambah/Ubah tanggal & biaya)', async ({ request }) => {
    // Buat Gelombang Uji
    const createGel = await request.post(`${API_BASE_URL}/api/v1/admin/gelombang`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        nama: 'Gelombang Uji Playwright',
        tahun_akademik: '2026/2027',
        tanggal_buka: '2026-03-01',
        tanggal_tutup: '2026-04-30',
        biaya_pendaftaran: 250000,
        kuota: 100,
        is_aktif: true,
      },
    });
    expect(createGel.status()).toBe(201);
    const created = (await createGel.json()).data;
    const gelId = created.id;

    // Update Gelombang
    const updateGel = await request.put(`${API_BASE_URL}/api/v1/admin/gelombang/${gelId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        nama: 'Gelombang Uji Playwright (Updated)',
        tahun_akademik: '2026/2027',
        tanggal_buka: '2026-03-01',
        tanggal_tutup: '2026-05-15',
        biaya_pendaftaran: 275000,
        kuota: 120,
        is_aktif: true,
      },
    });
    expect(updateGel.status()).toBe(200);
    const updated = (await updateGel.json()).data;
    expect(updated.nama).toBe('Gelombang Uji Playwright (Updated)');
    expect(updated.biaya_pendaftaran).toBe(275000);
  });

  // ==========================================
  // TC_BB_034: Mengekspor rekapitulasi data pendaftar ke Excel / CSV
  // ==========================================
  test('TC_BB_034: Mengekspor rekapitulasi data pendaftar ke Excel', async ({ request }) => {
    const exportRes = await request.get(`${API_BASE_URL}/api/v1/admin/export/pendaftar?format=csv`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(exportRes.status()).toBe(200);
    const textData = await exportRes.text();
    // Verifikasi header CSV memuat kolom penting
    expect(textData).toContain('No. Pendaftaran');
    expect(textData).toContain('Nama Lengkap');
    expect(textData).toContain('Program Studi');
  });

});
