"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer, RefreshCw, Filter, CheckCircle2 } from "lucide-react";
import { api, authStorage } from "@/lib/api";

function CetakPdfContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prodiFilter = searchParams.get("prodi_id") || "";
  const gelombangFilter = searchParams.get("gelombang_id") || "";
  const statusFilter = searchParams.get("status") || "";
  const statusBayarFilter = searchParams.get("status_bayar") || "";
  const initialLengkapOnly = searchParams.get("lengkap_only") !== "0";

  const [applicants, setApplicants] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [gelombangList, setGelombangList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lengkapOnly, setLengkapOnly] = useState(initialLengkapOnly);

  useEffect(() => {
    const user = authStorage.getUser();
    const token = authStorage.getToken();
    if (!token || !user || (user.role !== "admin_pmb" && user.role !== "super_admin")) {
      router.replace("/loginadmin");
      return;
    }
    setCurrentUser(user);

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load reference lists
        const [prodiRes, gelombangRes] = await Promise.allSettled([
          api.get("/public/prodi"),
          api.get("/public/gelombang"),
        ]);
        if (prodiRes.status === "fulfilled" && prodiRes.value.data?.data) {
          setProdiList(prodiRes.value.data.data);
        }
        if (gelombangRes.status === "fulfilled" && gelombangRes.value.data?.data) {
          setGelombangList(gelombangRes.value.data.data);
        }

        // Load applicants for export
        let query = `/admin/export/pendaftar?`;
        if (prodiFilter) query += `&prodi_id=${encodeURIComponent(prodiFilter)}`;
        if (gelombangFilter) query += `&gelombang_id=${encodeURIComponent(gelombangFilter)}`;
        if (statusFilter) query += `&status=${encodeURIComponent(statusFilter)}`;

        const res = await api.get(query);
        if (res.data && Array.isArray(res.data.data)) {
          let list = res.data.data;
          if (statusBayarFilter) {
            list = list.filter((p: any) => {
              const hasLunas = p.pembayaran?.some((pay: any) => pay.status === "diterima");
              const hasPending = p.pembayaran?.some((pay: any) => pay.status === "menunggu_verifikasi");
              if (statusBayarFilter === "lunas") return hasLunas;
              if (statusBayarFilter === "menunggu") return hasPending;
              if (statusBayarFilter === "belum_bayar") return !hasLunas && !hasPending;
              return true;
            });
          }
          setApplicants(list);
        }
      } catch (err) {
        console.error("Gagal memuat data PDF:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, prodiFilter, gelombangFilter, statusFilter, statusBayarFilter]);

  // Filter for students who entered "Data Lengkap"
  const filteredApplicants = useMemo(() => {
    if (!lengkapOnly) return applicants;
    return applicants.filter((p: any) => {
      const status = p.status_pendaftaran;
      // Incomplete statuses: draft, akun_terdaftar, belum_lengkap, ditolak_perlu_perbaikan
      if (
        status === "draft" ||
        status === "akun_terdaftar" ||
        status === "belum_lengkap" ||
        status === "ditolak_perlu_perbaikan"
      ) {
        return false;
      }
      return true;
    });
  }, [applicants, lengkapOnly]);

  const handlePrint = () => {
    window.print();
  };

  const getProdiName = () => {
    if (!prodiFilter) return "Semua Program Studi";
    const found = prodiList.find((p) => String(p.id) === String(prodiFilter));
    return found ? `${found.kode ? found.kode + " - " : ""}${found.nama}` : `Prodi ID: ${prodiFilter}`;
  };

  const getGelombangName = () => {
    if (!gelombangFilter) return "Semua Gelombang";
    const found = gelombangList.find((g) => String(g.id) === String(gelombangFilter));
    return found ? `${found.nama} (${found.tahun_akademik})` : `Gelombang ID: ${gelombangFilter}`;
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "berkas_diverifikasi":
        return "Berkas Sah";
      case "lolos_seleksi":
        return "Lolos Seleksi";
      case "daftar_ulang":
        return "Mahasiswa Aktif";
      case "mengikuti_ujian":
        return "Tahap Wawancara";
      case "menunggu_verifikasi":
        return "Menunggu Verifikasi";
      case "menunggu_pembayaran":
        return "Menunggu Pembayaran";
      case "belum_lengkap":
        return "Belum Lengkap";
      case "tidak_lolos":
        return "Tidak Lolos";
      default:
        return status ? status.replace(/_/g, " ") : "-";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0d3830]" />
          <span>Mempersiapkan dokumen rekapitulasi PDF...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white flex flex-col items-center p-4 sm:p-8 font-sans text-slate-900 selection:bg-emerald-200">
      {/* Action Bar (Hidden on Print) */}
      <div className="max-w-6xl w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 print:hidden">
        <Link
          href="/admincms"
          className="p-2.5 bg-white hover:bg-slate-50 rounded-xl text-slate-700 transition flex items-center gap-1.5 text-xs font-bold border border-slate-200 shadow-2xs w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Admin CMS</span>
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              checked={lengkapOnly}
              onChange={(e) => setLengkapOnly(e.target.checked)}
              className="accent-[#0d3830] rounded cursor-pointer"
            />
            <span>Hanya Data Lengkap (Bukan Belum Lengkap)</span>
          </label>

          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (A4 Landscape Format) */}
      <div className="max-w-6xl w-full bg-white rounded-2xl print:rounded-none border border-slate-300 print:border-none p-6 sm:p-10 shadow-lg print:shadow-none space-y-6">
        {/* Kop Surat Resmi */}
        <div className="flex items-center gap-5 border-b-2 border-slate-900 pb-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src="/logo-staici.png"
              alt="Logo STAICI"
              fill
              className="object-contain"
              priority
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
        <div className="text-center py-1">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider underline font-serif">
            REKAPITULASI DATA CALON MAHASISWA BARU (DATA LENGKAP)
          </h2>
          <span className="text-xs font-mono font-bold text-slate-700">
            PENERIMAAN MAHASISWA BARU (PMB) TAHUN AKADEMIK 2026/2027
          </span>
        </div>

        {/* Metadata Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Program Studi</span>
            <span className="font-bold text-slate-800">{getProdiName()}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Gelombang</span>
            <span className="font-bold text-slate-800">{getGelombangName()}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Kriteria Rekap</span>
            <span className="font-bold text-emerald-800">
              {lengkapOnly ? "Hanya Data Lengkap" : "Semua Data Terfilter"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Mahasiswa</span>
            <span className="font-black text-[#0d3830]">{filteredApplicants.length} Orang</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-y-2 border-slate-800 bg-slate-100 text-slate-900 font-extrabold uppercase text-[10px]">
                <th className="p-2 text-center w-8 border border-slate-300">No</th>
                <th className="p-2 border border-slate-300 whitespace-nowrap">No. PMB</th>
                <th className="p-2 border border-slate-300 whitespace-nowrap">NIK</th>
                <th className="p-2 border border-slate-300">Nama Lengkap</th>
                <th className="p-2 text-center border border-slate-300">JK</th>
                <th className="p-2 border border-slate-300">Program Studi</th>
                <th className="p-2 border border-slate-300">Gelombang / Jalur</th>
                <th className="p-2 border border-slate-300">Asal Sekolah</th>
                <th className="p-2 border border-slate-300 whitespace-nowrap">No. HP / WA</th>
                <th className="p-2 border border-slate-300 whitespace-nowrap">Status Pendaftaran</th>
                <th className="p-2 border border-slate-300 whitespace-nowrap">Status Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500 font-semibold border border-slate-300">
                    Tidak ada data calon mahasiswa yang memenuhi kriteria data lengkap.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((p, idx) => {
                  const isLunas = p.pembayaran?.some((pay: any) => pay.status === "diterima");
                  const isPending = p.pembayaran?.some((pay: any) => pay.status === "menunggu_verifikasi");
                  const namaLengkap = p.nama_lengkap || p.user?.nama_lengkap || "-";
                  const nik = p.nik || p.user?.nik || "-";
                  const noHp = p.no_hp || p.user?.no_hp || "-";
                  const prodiNama = p.program_studi?.nama || p.program_studi?.kode || "-";
                  const gelombangNama = p.gelombang?.nama || p.jalur_pendaftaran || "-";
                  const asalSekolah = p.nama_sekolah || p.asal_sekolah || "-";

                  return (
                    <tr key={p.id || idx} className="hover:bg-slate-50">
                      <td className="p-2 text-center font-mono text-slate-600 border border-slate-300">
                        {idx + 1}
                      </td>
                      <td className="p-2 font-mono font-bold text-slate-900 border border-slate-300 whitespace-nowrap">
                        {p.nomor_pendaftaran || `PMB-2026-00${p.id}`}
                      </td>
                      <td className="p-2 font-mono text-slate-700 border border-slate-300 whitespace-nowrap">
                        {nik}
                      </td>
                      <td className="p-2 font-bold text-slate-900 border border-slate-300">
                        {namaLengkap}
                      </td>
                      <td className="p-2 text-center text-slate-700 border border-slate-300">
                        {p.jenis_kelamin ? p.jenis_kelamin.charAt(0).toUpperCase() : "-"}
                      </td>
                      <td className="p-2 text-slate-800 font-medium border border-slate-300">
                        {prodiNama}
                      </td>
                      <td className="p-2 text-slate-700 border border-slate-300">
                        {gelombangNama}
                      </td>
                      <td className="p-2 text-slate-700 border border-slate-300">
                        {asalSekolah}
                      </td>
                      <td className="p-2 font-mono text-slate-700 border border-slate-300 whitespace-nowrap">
                        {noHp}
                      </td>
                      <td className="p-2 text-slate-800 font-semibold border border-slate-300 whitespace-nowrap">
                        {formatStatus(p.status_pendaftaran)}
                      </td>
                      <td className="p-2 border border-slate-300 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isLunas
                              ? "bg-emerald-100 text-emerald-800"
                              : isPending
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isLunas ? "Lunas" : isPending ? "Menunggu Verifikasi" : "Belum Bayar"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Signature Block */}
        <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-800">
          <div className="space-y-1 max-w-md text-[10px] text-slate-500">
            <p className="font-bold text-slate-700">Catatan Administratif:</p>
            <p>1. Rekapitulasi ini memuat seluruh calon mahasiswa yang telah memenuhi kriteria data lengkap PMB.</p>
            <p>2. Dokumen resmi dicetak secara sistemik melalui Portal PMB STAI Cendekia Insani Situbondo.</p>
            <p>
              3. Waktu Cetak:{" "}
              {new Date().toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              WIB
            </p>
          </div>

          <div className="text-center w-64 space-y-12 self-end">
            <span className="block text-slate-700">
              Situbondo,{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <div className="border-t border-slate-900 pt-1">
              <p className="font-bold text-slate-900 underline">
                {currentUser?.nama_lengkap || "Panitia Penerimaan Mahasiswa Baru"}
              </p>
              <p className="text-[10px] text-slate-600">Panitia PMB STAICI Situbondo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CetakPdfPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
          <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-[#0d3830]" />
            <span>Memuat...</span>
          </div>
        </div>
      }
    >
      <CetakPdfContent />
    </Suspense>
  );
}

