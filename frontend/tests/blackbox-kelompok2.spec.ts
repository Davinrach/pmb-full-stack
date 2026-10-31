import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

test.describe('Black Box Testing - Kelompok 2: Formulir Pendaftaran Bertahap & Alur Pendaftar', () => {

  // Helper untuk registrasi & login user calon mahasiswa baru yang belum submit/locked
  async function createFreshApplicant(request: any) {
    const timestamp = Date.now();
    const uniqueEmail = `calon.form.${timestamp}@example.com`;
    const uniqueNIK = `3512${Math.floor(100000000000 + Math.random() * 900000000000).toString().slice(0, 12)}`;
    const password = 'KombinasiKuat2026!';

    // Register
    const regRes = await request.post(`${API_BASE_URL}/api/v1/auth/register`, {
      data: {
        nama_lengkap: `Pendaftar Form ${timestamp.toString().slice(-4)}`,
        nik: uniqueNIK,
        no_hp: '081234567890',
        email: uniqueEmail,
        password: password,
      },
    });
    expect(regRes.status()).toBe(201);
    const regBody = await regRes.json();
    const devOtp = regBody.data?.dev_otp;

    // Verify OTP jika ada dev_otp
    if (devOtp) {
      const verifyRes = await request.post(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
        data: {
          email: uniqueEmail,
          otp: devOtp,
        },
      });
      expect(verifyRes.status()).toBe(200);
      const verifyBody = await verifyRes.json();
      return {
        email: uniqueEmail,
        nik: uniqueNIK,
        password: password,
        token: verifyBody.data?.token,
        userId: verifyBody.data?.user?.id,
      };
    }

    // Fallback: Login
    const loginRes = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { identifier: uniqueEmail, password: password },
    });
    const loginBody = await loginRes.json();
    return {
      email: uniqueEmail,
      nik: uniqueNIK,
      password: password,
      token: loginBody.data?.token,
      userId: loginBody.data?.user?.id,
    };
  }

  // ==========================================
  // TC_BB_011: Mengisi formulir pendaftaran bertahap dan fitur Simpan Draft
  // ==========================================
  test('TC_BB_011: Mengisi formulir pendaftaran bertahap dan fitur Simpan Draft', async ({ request }) => {
    const applicant = await createFreshApplicant(request);

    // 1. Simpan Bagian 1: Identitas Diri
    const identitasPayload = {
      jenis_kelamin: 'Laki-laki',
      alamat: 'Jl. Pemuda No. 45, Situbondo',
      tempat_lahir: 'Situbondo',
      tanggal_lahir: '2004-06-15',
      status_warga_negara: 'WNI',
      agama: 'Islam',
      status_pernikahan: 'Tidak Kawin',
    };
    const resStep1 = await request.put(`${API_BASE_URL}/api/v1/pendaftar/identitas`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      data: identitasPayload,
    });
    expect(resStep1.status()).toBe(200);

    // 2. Simpan Bagian 2: Asal Sekolah
    const sekolahPayload = {
      nama_sekolah: 'MAN 1 Situbondo',
      status_sekolah: 'Negeri',
      jurusan_sekolah: 'IPA',
      nilai_rata_rata: 88.5,
      tahun_lulus: 2024,
    };
    const resStep2 = await request.put(`${API_BASE_URL}/api/v1/pendaftar/asal-sekolah`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      data: sekolahPayload,
    });
    expect(resStep2.status()).toBe(200);

    // 3. Simpan Bagian 3: Data Orang Tua
    const orangTuaPayload = {
      nama_ayah: 'Ahmad Subagyo',
      pekerjaan_ayah: 'Wiraswasta',
      penghasilan_ayah: 'Rp2.000.000–4.000.000',
      nama_ibu: 'Siti Aminah',
      pekerjaan_ibu: 'Guru/Dosen',
      penghasilan_ibu: 'Rp2.000.000–4.000.000',
      no_hp_orang_tua_wali: '081298765432',
    };
    const resStep3 = await request.put(`${API_BASE_URL}/api/v1/pendaftar/orang-tua`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      data: orangTuaPayload,
    });
    expect(resStep3.status()).toBe(200);

    // 4. Verifikasi Data Draft Tersimpan saat Dipanggil Kembali (Get My Pendaftaran)
    const getRes = await request.get(`${API_BASE_URL}/api/v1/pendaftar/my`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
    });
    expect(getRes.status()).toBe(200);
    const getData = (await getRes.json()).data;

    expect(getData.alamat).toBe('Jl. Pemuda No. 45, Situbondo');
    expect(getData.tempat_lahir).toBe('Situbondo');
    expect(getData.nama_sekolah).toBe('MAN 1 Situbondo');
    expect(getData.data_orang_tua?.nama_ayah).toBe('Ahmad Subagyo');
    expect(getData.data_orang_tua?.nama_ibu).toBe('Siti Aminah');
  });

  // ==========================================
  // TC_BB_012: Memilih program studi, gelombang pendaftaran, dan jalur pendaftaran
  // ==========================================
  test('TC_BB_012: Memilih program studi, gelombang pendaftaran, dan jalur pendaftaran (Reguler vs KIP-Kuliah)', async ({ request }) => {
    const applicant = await createFreshApplicant(request);

    // Pilih Prodi MPI (ID: 1), Gelombang Aktif (ID: 2), Jalur Reguler
    const resProdi = await request.put(`${API_BASE_URL}/api/v1/pendaftar/prodi-gelombang`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      data: {
        program_studi_id: 1,
        gelombang_id: 2,
        jalur_pendaftaran: 'Reguler',
      },
    });
    expect(resProdi.status()).toBe(200);

    // Cek pendaftaran tersimpan
    const getRes = await request.get(`${API_BASE_URL}/api/v1/pendaftar/my`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
    });
    expect(getRes.status()).toBe(200);
    const data = (await getRes.json()).data;
    expect(data.program_studi_id).toBe(1);
    expect(data.gelombang_id).toBe(2);
    expect(data.jalur_pendaftaran).toBe('Reguler');
  });

  // ==========================================
  // TC_BB_013: Pemilihan jalur KIP-Kuliah menghasilkan pembebasan biaya Rp 0
  // ==========================================
  test('TC_BB_013: Pemilihan jalur KIP-Kuliah menghasilkan pembebasan biaya Rp 0 dan penetapan berkas KIP wajib', async ({ request }) => {
    const applicant = await createFreshApplicant(request);

    // 1. Set pilihan ke Jalur KIP-Kuliah
    const updateJalur = await request.put(`${API_BASE_URL}/api/v1/pendaftar/prodi-gelombang`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      data: {
        program_studi_id: 2, // Ahwal Al-Syakhsiyah
        gelombang_id: 2,
        jalur_pendaftaran: 'KIP-Kuliah',
      },
    });
    expect(updateJalur.status()).toBe(200);

    // 2. Ambil informasi rekening & biaya pendaftaran
    const infoRekeningRes = await request.get(`${API_BASE_URL}/api/v1/pembayaran/info-rekening`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
    });
    expect(infoRekeningRes.status()).toBe(200);
    const rekeningData = (await infoRekeningRes.json()).data;

    // Verifikasi pembebasan biaya pendaftaran Rp 0
    expect(rekeningData.is_kip).toBe(true);
    expect(rekeningData.biaya_pendaftaran).toBe(0);
  });

  // ==========================================
  // TC_BB_014: Mengunci dan mengirim formulir pendaftaran (Final Submit)
  // ==========================================
  test('TC_BB_014: Mengunci dan mengirim formulir pendaftaran (Final Submit)', async ({ request }) => {
    const applicant = await createFreshApplicant(request);

    // 1. Lengkapi Step 1
    await request.put(`${API_BASE_URL}/api/v1/pendaftar/identitas`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      data: {
        jenis_kelamin: 'Perempuan',
        alamat: 'Jl. Raya Asembagus No. 12, Situbondo',
        tempat_lahir: 'Situbondo',
        tanggal_lahir: '2005-01-20',
        status_warga_negara: 'WNI',
        agama: 'Islam',
        status_pernikahan: 'Tidak Kawin',
      },
    });

    // 2. Lengkapi Step 2
    await request.put(`${API_BASE_URL}/api/v1/pendaftar/asal-sekolah`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      data: {
        nama_sekolah: 'SMAN 1 Situbondo',
        status_sekolah: 'Negeri',
        jurusan_sekolah: 'IPS',
        nilai_rata_rata: 90.0,
        tahun_lulus: 2024,
      },
    });

    // 3. Lengkapi Step 3
    await request.put(`${API_BASE_URL}/api/v1/pendaftar/orang-tua`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      data: {
        nama_ayah: 'Mulyadi',
        pekerjaan_ayah: 'PNS',
        penghasilan_ayah: 'Rp4.000.000–6.000.000',
        nama_ibu: 'Nurul Hidayah',
        pekerjaan_ibu: 'Pengurus Rumah Tangga',
        penghasilan_ibu: 'di bawah Rp1.000.000',
        no_hp_orang_tua_wali: '085233445566',
      },
    });

    // 4. Lengkapi Step 4: Prodi & Gelombang
    await request.put(`${API_BASE_URL}/api/v1/pendaftar/prodi-gelombang`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      data: {
        program_studi_id: 3, // KPI
        gelombang_id: 2,
        jalur_pendaftaran: 'Reguler',
      },
    });

    // 5. Submit Final Pendaftaran
    const submitRes = await request.post(`${API_BASE_URL}/api/v1/pendaftar/submit`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
    });
    expect(submitRes.status()).toBe(200);
    const submitBody = await submitRes.json();
    expect(submitBody.success).toBe(true);

    // Verifikasi Nomor Pendaftaran resmi diterbitkan (format PMB-YYYY-XXXX)
    const noPendaftaran = submitBody.data?.nomor_pendaftaran;
    expect(noPendaftaran).toMatch(/^PMB-\d{4}-\d{4}$/);
    expect(submitBody.data?.is_locked).toBe(true);

    // 6. Pastikan setelah terkunci, data tidak bisa diubah kembali
    const lockedRes = await request.put(`${API_BASE_URL}/api/v1/pendaftar/identitas`, {
      headers: { Authorization: `Bearer ${applicant.token}` },
      data: {
        jenis_kelamin: 'Laki-laki',
        alamat: 'Perubahan Ilegal',
        tempat_lahir: 'Situbondo',
      },
    });
    expect(lockedRes.status()).toBe(403);
  });

});

