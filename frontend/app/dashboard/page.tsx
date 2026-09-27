"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  FileText,
  CreditCard,
  Award,
  Printer,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { api, authStorage, UserSession } from "@/lib/api";

const statusConfig: Record<
  string,
  { label: string; color: string; desc: string }
> = {
  draft: {
    label: "Draft",
    color: "bg-slate-100 text-slate-700 border-slate-300",
    desc: "Akun telah dibuat. Silakan mulai melengkapi data formulir pendaftaran.",
  },
  akun_terdaftar: {
    label: "Akun Terdaftar",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    desc: "Akun Anda aktif. Silakan isi formulir data calon mahasiswa dan unggah berkas.",
  },
  belum_lengkap: {
    label: "Belum Lengkap",
    color: "bg-amber-50 text-amber-800 border-amber-300",
    desc: "Formulir pendaftaran atau berkas wajib sedang dalam pengisian / memerlukan revisi.",
  },
  menunggu_pembayaran: {
    label: "Menunggu Pembayaran",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    desc: "Formulir telah disubmit. Silakan transfer biaya pendaftaran & unggah bukti bayar.",
  },
  menunggu_verifikasi: {
    label: "Menunggu Verifikasi",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    desc: "Berkas & pembayaran Anda telah masuk. Panitia PMB sedang memverifikasi data Anda.",
  },
  berkas_diverifikasi: {
    label: "Berkas Diverifikasi",
    color: "bg-emerald-50 text-emerald-800 border-emerald-300",
    desc: "Seluruh berkas dan pembayaran sah. Menunggu jadwal seleksi/pengumuman kelulusan.",
  },
  ditolak_perlu_perbaikan: {
    label: "Perlu Perbaikan",
    color: "bg-red-50 text-red-700 border-red-300",
    desc: "Terdapat berkas yang perlu diperbaiki. Silakan periksa catatan revisi di bawah.",
  },
  mengikuti_ujian: {
    label: "Mengikuti Ujian / Wawancara",
    color: "bg-sky-50 text-sky-800 border-sky-300",
    desc: "Anda dijadwalkan mengikuti sesi tes/wawancara seleksi PMB STAICI.",
  },
  lolos_seleksi: {
    label: "Lolos Seleksi (Diterima)",
    color: "bg-emerald-600 text-white border-emerald-700 font-bold",
    desc: "Selamat! Anda dinyatakan LULUS seleksi PMB STAI Cendekia Insani Situbondo.",
  },
  tidak_lolos: {
    label: "Tidak Lolos",
    color: "bg-rose-100 text-rose-800 border-rose-300",
    desc: "Mohon maaf, Anda belum berhasil pada periode seleksi ini.",
  },
  daftar_ulang: {
    label: "Daftar Ulang (Mahasiswa Aktif)",
    color: "bg-teal-700 text-white border-teal-800 font-bold",
    desc: "Selamat datang Mahasiswa Baru! Berkas daftar ulang her-registrasi telah diverifikasi.",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [pendaftar, setPendaftar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data && res.data.user) {
        const role = res.data.user.role;
        if (role === "admin_pmb" || role === "super_admin") {
          router.replace("/admincms");
          return;
        }
        setUser(res.data.user);
        setPendaftar(res.data.pendaftar);
      }
    } catch (err) {
      authStorage.clear();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = authStorage.getToken();
    const currentUser = authStorage.getUser();
    if (!token) {
      router.push("/login");
      return;
    }
    if (currentUser && (currentUser.role === "admin_pmb" || currentUser.role === "super_admin")) {
      router.replace("/admincms");
      return;
    }
    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    authStorage.clear();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0d3830]" />
          <span>Memuat Dashboard PMB...</span>
        </div>
      </div>
    );
  }

  const currentStatus = pendaftar?.status_pendaftaran || "akun_terdaftar";
  const statusInfo = statusConfig[currentStatus] || statusConfig.akun_terdaftar;

  // Calculate progress
  let completedSteps = 0;
  if (pendaftar?.jenis_kelamin) completedSteps += 1;
  if (pendaftar?.nama_sekolah) completedSteps += 1;
  if (pendaftar?.data_orang_tua?.nama_ayah) completedSteps += 1;
  if (pendaftar?.program_studi_id) completedSteps += 1;
  if (pendaftar?.berkas && pendaftar?.berkas?.length >= 3) completedSteps += 1;
  if (pendaftar?.is_locked) completedSteps = 6;
  const progressPercent = Math.round((completedSteps / 6) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src="/logo-staici.png"
                  alt="Logo STAICI"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Portal PMB Calon Mahasiswa
                </span>
                <span className="text-sm sm:text-base font-extrabold text-[#0d3830] font-serif">
                  STAI Cendekia Insani Situbondo
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right text-xs">
              <span className="font-bold text-slate-900">{user?.nama_lengkap}</span>
              <span className="text-slate-500 font-mono text-[11px]">
                {pendaftar?.nomor_pendaftaran || user?.nik}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5 border border-rose-200/60 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* Welcome Card & Status Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#e8f8f2] text-[#0d3830] border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Akun Terverifikasi EMIS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                Ahlan wa Sahlan, {user?.nama_lengkap}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {statusInfo.desc}
              </p>
            </div>

            {/* Status Badge Box */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col gap-2.5 min-w-[260px] shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Status Pendaftaran Saat Ini
              </span>
              <div
                className={`px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between ${statusInfo.color}`}
              >
                <span>{statusInfo.label}</span>
                <Clock className="w-4 h-4 opacity-75" />
              </div>
              {pendaftar?.nomor_pendaftaran && (
                <div className="text-xs pt-1 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-slate-500">No. Registrasi:</span>
                  <strong className="font-mono font-bold text-[#0d3830]">
                    {pendaftar.nomor_pendaftaran}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar (FR-6.3) */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-700">
                Kelengkapan Formulir &amp; Berkas PMB ({completedSteps}/6 Bagian Selesai)
              </span>
              <span className="text-[#0d3830]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0d3830] to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Rejection / Revision Alert Banner (FR-5.2, FR-5.4) */}
        {pendaftar?.catatan_revisi && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 text-red-800 shadow-2xs animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <h4 className="font-bold text-red-900">Catatan Perbaikan dari Panitia PMB:</h4>
              <p className="leading-relaxed">{pendaftar.catatan_revisi}</p>
              <div className="pt-2">
                <Link
                  href="/dashboard/formulir"
                  className="inline-flex items-center gap-1 font-bold text-red-700 hover:underline"
                >
                  <span>Revisi Berkas / Data Sekarang</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Formulir Biodata */}
          <Link
            href="/dashboard/formulir"
            className="group bg-white rounded-2xl border border-slate-200/80 p-6 hover:border-[#0d3830] hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0d3830] flex items-center justify-center group-hover:bg-[#0d3830] group-hover:text-white transition">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0d3830] transition">
                Formulir Pendaftaran
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Isi identitas diri, data asal sekolah SLTA, data orang tua / wali, serta pilihan program studi.
              </p>
            </div>
            <div className="pt-5 flex items-center justify-between text-xs font-bold text-[#0d3830]">
              <span>{pendaftar?.is_locked ? "Lihat Formulir Terkunci" : "Buka Formulir"}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: Pembayaran Manual */}
          <Link
            href="/dashboard/pembayaran"
            className="group bg-white rounded-2xl border border-slate-200/80 p-6 hover:border-[#0d3830] hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition">
                Informasi &amp; Bukti Pembayaran
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lihat nomor rekening bank tujuan, rincian biaya pendaftaran gelombang, dan unggah bukti transfer.
              </p>
            </div>
            <div className="pt-5 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Kelola Pembayaran</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: Pengumuman Seleksi */}
          <Link
            href="/dashboard/pengumuman"
            className="group bg-white rounded-2xl border border-slate-200/80 p-6 hover:border-[#0d3830] hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition">
                Hasil Seleksi &amp; Daftar Ulang
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cek kelulusan seleksi administrasi/ujian dan panduan her-registrasi mahasiswa baru.
              </p>
            </div>
            <div className="pt-5 flex items-center justify-between text-xs font-bold text-blue-800">
              <span>Cek Pengumuman</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 4: Cetak Kartu & Bukti Pendaftaran */}
          <Link
            href="/dashboard/cetak"
            className="group bg-white rounded-2xl border border-slate-200/80 p-6 hover:border-[#0d3830] hover:shadow-md transition flex flex-col justify-between sm:col-span-2 lg:col-span-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition flex-shrink-0">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cetak Kartu &amp; Bukti Pendaftaran PMB (PDF)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Unduh atau cetak langsung kartu peserta PMB dan tanda bukti pendaftaran resmi STAICI.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d3830] group-hover:translate-x-1 transition flex-shrink-0">
                <span>Cetak Dokumen Sekarang</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <span>© 2026 STAI Cendekia Insani Situbondo — Layanan Bantuan PMB: +62 852-3343-2221</span>
        </div>
      </footer>
    </div>
  );
}
