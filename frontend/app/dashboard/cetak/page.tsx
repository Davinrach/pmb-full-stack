"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, ShieldCheck, RefreshCw } from "lucide-react";
import { api, authStorage } from "@/lib/api";

export default function CetakKartuPage() {
  const router = useRouter();
  const [pendaftar, setPendaftar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (currentUser && (currentUser.role === "admin_pmb" || currentUser.role === "super_admin")) {
      router.replace("/admincms");
      return;
    }

    const loadData = async () => {
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
    loadData();
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0d3830]" />
          <span>Mempersiapkan dokumen cetak...</span>
        </div>
      </div>
    );
  }

  const user = pendaftar?.user;
  const prodi = pendaftar?.program_studi;
  const gelombang = pendaftar?.gelombang;
  const orangTua = pendaftar?.data_orang_tua;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white flex flex-col items-center p-4 sm:p-8 font-sans text-slate-900 selection:bg-emerald-200">
      {/* Action Bar (Hidden on Print) */}
      <div className="max-w-3xl w-full flex items-center justify-between mb-6 print:hidden">
        <Link
          href="/dashboard"
          className="p-2.5 bg-white hover:bg-slate-50 rounded-xl text-slate-700 transition flex items-center gap-1.5 text-xs font-bold border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="px-6 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF (Ctrl+P)</span>
        </button>
      </div>

      {/* Printable Sheet (A4 Format) */}
      <div className="max-w-3xl w-full bg-white rounded-2xl print:rounded-none border border-slate-300 print:border-none p-8 sm:p-12 shadow-lg print:shadow-none space-y-6">
        {/* Kop Surat Resmi */}
        <div className="flex items-center gap-5 border-b-2 border-slate-900 pb-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src="/logo-staici.png"
              alt="Logo STAICI"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-center flex-1 space-y-0.5">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-600 block">
              Yayasan Cendekia Insani Panarukan Situbondo
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-900 font-serif">
              STAI Cendekia Insani Situbondo
            </h1>
            <p className="text-[11px] text-slate-600 leading-tight">
              Jalan Raya no. 25 Paowan Panarukan Situbondo 68351 • Telp/WA: +62 852-3343-2221
            </p>
            <p className="text-[11px] font-bold text-slate-800">
              PANITIA PENERIMAAN MAHASISWA BARU (PMB) TA 2026/2027
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center py-2">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider underline font-serif">
            KARTU TANDA BUKTI PENDAFTARAN PMB
          </h2>
          <span className="text-xs font-mono font-bold text-slate-700">
            NOMOR REGISTRASI: {pendaftar?.nomor_pendaftaran || "PMB-2026-0000"}
          </span>
        </div>

        {/* Data Calon Mahasiswa */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Nama Lengkap</span>
                <span className="col-span-2 font-bold text-slate-900">: {user?.nama_lengkap}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">NIK (KTP/KK)</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">: {user?.nik}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Tempat, Tgl Lahir</span>
                <span className="col-span-2 text-slate-800">
                  : {pendaftar?.tempat_lahir || "-"},{" "}
                  {pendaftar?.tanggal_lahir
                    ? new Date(pendaftar.tanggal_lahir).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Jenis Kelamin</span>
                <span className="col-span-2 text-slate-800">: {pendaftar?.jenis_kelamin || "-"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Alamat</span>
                <span className="col-span-2 text-slate-800">: {pendaftar?.alamat || "-"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">No. Telepon / WA</span>
                <span className="col-span-2 text-slate-800">: {user?.no_hp || "-"}</span>
              </div>
            </div>

            {/* Pas Foto Box */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-2 h-36 w-28 mx-auto text-center bg-white">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Pas Foto 3 x 4 Resmi
              </span>
            </div>
          </div>

          {/* Data Akademik & Orang Tua */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-1">
                Pilihan Program Studi
              </h4>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-500 block">Program Studi:</span>
                  <strong className="text-[#0d3830]">{prodi?.nama || "MPI / AS / KPI"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Gelombang:</span>
                  <span>{gelombang?.nama || "Gelombang 1 - 2026/2027"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Asal Sekolah:</span>
                  <span>{pendaftar?.nama_sekolah || "-"} ({pendaftar?.jurusan_sekolah || "-"})</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-1">
                Data Orang Tua / Wali
              </h4>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-500 block">Nama Ayah / Ibu:</span>
                  <span>{orangTua?.nama_ayah || "-"} / {orangTua?.nama_ibu || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Pekerjaan Ayah:</span>
                  <span>{orangTua?.pekerjaan_ayah || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kontak Orang Tua:</span>
                  <span>{orangTua?.no_hp_orang_tua_wali || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs text-slate-800">
          <div className="space-y-1 max-w-xs text-[11px] text-slate-500">
            <p>Catatan:</p>
            <p>1. Kartu ini wajib dibawa saat penyerahan berkas fisik &amp; daftar ulang di kampus.</p>
            <p>2. Data tersinkronisasi otomatis dengan EMIS Kopertais IV Surabaya.</p>
          </div>

          <div className="text-center space-y-16">
            <span className="block">
              Situbondo,{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <div className="border-t border-slate-900 pt-1 font-bold">
              ( Panitia PMB STAICI )
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
