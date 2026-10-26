"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Calendar,
  Building,
  Phone,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { api, authStorage } from "@/lib/api";

export default function PengumumanPage() {
  const router = useRouter();
  const [pendaftar, setPendaftar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (currentUser && (currentUser.role === "admin_pmb" || currentUser.role === "super_admin")) {
      router.replace("/admincms");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data) {
          const role = res.data.user?.role;
          if (role === "admin_pmb" || role === "super_admin") {
            router.replace("/admincms");
            return;
          }
          setPendaftar(res.data.pendaftar);
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0d3830]" />
          <span>Memuat status pengumuman...</span>
        </div>
      </div>
    );
  }

  const status = pendaftar?.status_pendaftaran || "akun_terdaftar";
  const isLolos = status === "lolos_seleksi" || status === "daftar_ulang";
  const isTidakLolos = status === "tidak_lolos";
  const isUjian = status === "mengikuti_ujian";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <span className="text-xs font-bold text-[#0d3830] font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {pendaftar?.nomor_pendaftaran || "PMB 2026/2027"}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Hasil Seleksi PMB STAICI
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Status pengumuman seleksi berkas dan penerimaan mahasiswa baru tahun akademik 2026/2027.
          </p>
        </div>

        {/* LOLOS SELEKSI */}
        {isLolos && (
          <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 sm:p-10 shadow-xs space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0d3830] border border-emerald-100 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0d3830] bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/80">
                PENGUMUMAN KELULUSAN RESMI
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                SELAMAT! ANDA DINYATAKAN LOLOS SELEKSI
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Calon Mahasiswa atas nama <strong>{pendaftar?.user?.nama_lengkap}</strong> (No. Registrasi: <strong className="font-mono">{pendaftar?.nomor_pendaftaran}</strong>) dinyatakan diterima sebagai Calon Mahasiswa Baru pada program studi:
              </p>
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 text-[#0d3830] font-bold text-base sm:text-lg">
                {pendaftar?.program_studi?.nama} ({pendaftar?.program_studi?.kode})
              </div>
            </div>

            {/* Next Step: Daftar Ulang */}
            <div className="text-left bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 text-xs sm:text-sm">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#0d3830]" />
                <span>Tahapan Selanjutnya: Daftar Ulang (Her-Registrasi)</span>
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-slate-700 leading-relaxed">
                <li>
                  Cetak <strong>Kartu Pendaftaran PMB</strong> dan <strong>Bukti Kelulusan</strong> melalui portal ini.
                </li>
                <li>
                  Menyerahkan berkas fisik (Fotokopi KK, KTP, Ijazah Legalisir, Pas Foto Cetak) langsung ke Bagian Akademik Kampus STAICI Situbondo.
                </li>
                <li>
                  Melakukan pembayaran biaya her-registrasi/SPP semester 1 sesuai rincian pada saat penyerahan berkas fisik di kampus.
                </li>
                <li>
                  Data Anda akan resmi tercatat sebagai Mahasiswa Aktif di Kopertais IV Surabaya dan EMIS Kemenag RI.
                </li>
              </ol>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard/cetak"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Bukti Kelulusan &amp; Kartu Peserta</span>
              </Link>
            </div>
          </div>
        )}

        {/* TIDAK LOLOS */}
        {isTidakLolos && (
          <div className="bg-white rounded-3xl border border-rose-200/70 p-6 sm:p-10 shadow-xs space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-800 border border-rose-100 flex items-center justify-center mx-auto shadow-2xs">
              <XCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-800 bg-rose-50/80 px-3 py-1 rounded-full border border-rose-200/60">
                HASIL SELEKSI
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                MOHON MAAF, ANDA BELUM LOLOS SELEKSI
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Terima kasih atas partisipasi dan minat Anda mendaftar di STAI Cendekia Insani Situbondo. Anda dapat mencoba mendaftar kembali pada gelombang berikutnya atau program studi pilihan lain.
              </p>
            </div>
          </div>
        )}

        {/* MENGIKUTI UJIAN */}
        {isUjian && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center mx-auto shadow-2xs">
              <Clock className="w-9 h-9" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                TAHAP SELEKSI
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                TAHAP UJIAN &amp; WAWANCARA SELEKSI
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Anda dijadwalkan untuk mengikuti sesi tes / wawancara PMB STAI Cendekia Insani Situbondo. Silakan hubungi sekretariat panitia PMB untuk detail ruangan/sesi.
              </p>
            </div>
          </div>
        )}

        {/* MASIH MENUNGGU SELEKSI / BERKAS */}
        {!isLolos && !isTidakLolos && !isUjian && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center mx-auto shadow-2xs">
              <Clock className="w-9 h-9" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                Seleksi Masih Dalam Proses Verifikasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hasil seleksi akan dipublikasikan oleh panitia PMB sesuai dengan jadwal penutupan gelombang pendaftaran. Pastikan berkas dan pembayaran Anda telah lengkap diverifikasi.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition inline-block"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
