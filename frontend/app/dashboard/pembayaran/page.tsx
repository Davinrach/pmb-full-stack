"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  FileCheck,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  FileText,
  HelpCircle,
} from "lucide-react";
import { api, authStorage } from "@/lib/api";

export default function PembayaranPage() {
  const router = useRouter();
  const [infoRekening, setInfoRekening] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [statusPendaftaran, setStatusPendaftaran] = useState("");
  const [namaPengirim, setNamaPengirim] = useState("");
  const [bankTujuan, setBankTujuan] = useState("Bank Syariah Indonesia (BSI)");
  const [fileBukti, setFileBukti] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      const [rekRes, statRes] = await Promise.all([
        api.get("/pembayaran/info-rekening"),
        api.get("/pembayaran/status"),
      ]);
      setInfoRekening(rekRes.data);
      if (rekRes.data?.bank_name) {
        setBankTujuan(rekRes.data.bank_name);
      }
      setRiwayat(statRes.data.riwayat_pembayaran || []);
      setStatusPendaftaran(statRes.data.status_pendaftaran);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memuat data pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (currentUser && (currentUser.role === "admin_pmb" || currentUser.role === "super_admin")) {
      router.replace("/admincms");
      return;
    }
    loadData();
  }, []);

  const handleCopyRekening = () => {
    if (infoRekening?.nomor_rekening) {
      navigator.clipboard.writeText(infoRekening.nomor_rekening);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUploadBukti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileBukti) {
      setErrorMessage("Silakan pilih file bukti transfer.");
      return;
    }

    if (fileBukti.size > 2 * 1024 * 1024) {
      setErrorMessage("Ukuran file bukti pembayaran melebihi batas 2 MB.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("nama_pengirim", namaPengirim);
    formData.append("bank_tujuan", bankTujuan);
    formData.append("bukti_transfer", fileBukti);

    try {
      await api.upload("/pembayaran/konfirmasi", formData);
      setSuccessMessage("Bukti transfer berhasil diunggah! Panitia PMB akan memverifikasi pembayaran Anda.");
      setFileBukti(null);
      setNamaPengirim("");
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah bukti pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0d3830]" />
          <span>Memuat info pembayaran...</span>
        </div>
      </div>
    );
  }

  const latestPayment = riwayat[0];

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
          <span className="text-xs font-bold text-[#0d3830] font-mono bg-[#eaf6f2] px-2.5 py-1 rounded-lg border border-[#b2e2d5]">
            {infoRekening?.nomor_pendaftaran || "PMB 2026/2027"}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Pembayaran Biaya PMB
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Silakan lakukan transfer bank manual ke rekening resmi STAI Cendekia Insani Situbondo.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-700 flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Bank Account Info Card (Solid Deep Green - Campus Signature) */}
        <div className="bg-[#0d3830] rounded-2xl text-white p-6 sm:p-8 shadow-sm border border-[#092621]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#165349] flex items-center justify-center text-white border border-[#1e6b5e] flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-200 block">
                    Bank Tujuan Transfer
                  </span>
                  <span className="text-base sm:text-lg font-bold text-white">
                    {infoRekening?.bank_name || "Bank Syariah Indonesia (BSI)"}
                  </span>
                </div>
              </div>

              {/* Kotak Nomor Rekening Solid */}
              <div className="bg-[#07241e] border border-[#144f43] rounded-xl p-3.5 sm:p-4 max-w-lg">
                <span className="text-[11px] font-semibold text-emerald-300 block mb-1">
                  Nomor Rekening Tujuan:
                </span>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider text-white select-all">
                    {infoRekening?.nomor_rekening || "7148899012"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRekening}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin No. Rekening</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs text-emerald-100 flex items-center gap-2">
                <span className="text-emerald-200">Atas Nama:</span>
                <strong className="font-bold text-white bg-[#165349] px-2.5 py-0.5 rounded border border-[#1e6b5e]">
                  {infoRekening?.atas_nama || "STAI Cendekia Insani PMB"}
                </strong>
              </div>
            </div>

            {/* Kotak Nominal Biaya Solid */}
            <div className="bg-[#07241e] border border-[#144f43] rounded-2xl p-5 text-left md:text-right flex flex-col justify-center min-w-[220px]">
              <span className="text-xs text-emerald-300 font-medium">Total Biaya Pendaftaran</span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                Rp {Number(infoRekening?.biaya_pendaftaran || 250000).toLocaleString("id-ID")}
              </span>
              <div className="mt-2 pt-2 border-t border-[#144f43] flex items-center justify-between md:justify-end gap-2 text-[11px] text-emerald-200">
                <span>Kode Ref:</span>
                <span className="font-mono font-bold text-white bg-[#165349] px-2 py-0.5 rounded border border-[#1e6b5e]">
                  {infoRekening?.kode_pembayaran_unik || "PMB-0001"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Petunjuk Transfer & Regulasi Bukti Bayar (Solid Colored Cards) */}
        {(infoRekening?.petunjuk_pembayaran || infoRekening?.regulasi_bukti_bayar) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoRekening?.petunjuk_pembayaran && (
              <div className="bg-[#eaf6f2] border border-[#b2e2d5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2.5 text-[#0d3830] font-bold text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#0d3830] text-white flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4>Petunjuk Langkah Transfer</h4>
                </div>
                <p className="text-xs text-[#13493f] leading-relaxed whitespace-pre-line font-medium">
                  {infoRekening.petunjuk_pembayaran}
                </p>
                {infoRekening.batas_waktu_konfirmasi && (
                  <div className="pt-2 border-t border-[#b2e2d5] text-[11px] font-bold text-[#0d3830] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0d3830]" />
                    <span>Batas Verifikasi Tim Keuangan: {infoRekening.batas_waktu_konfirmasi}</span>
                  </div>
                )}
              </div>
            )}

            {infoRekening?.regulasi_bukti_bayar && (
              <div className="bg-[#fef9ec] border border-[#fde2a4] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2.5 text-[#78350f] font-bold text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#92400e] text-white flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4>Regulasi Bukti Bayar Sah</h4>
                </div>
                <p className="text-xs text-[#78350f] leading-relaxed whitespace-pre-line font-medium">
                  {infoRekening.regulasi_bukti_bayar}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload Bukti Bayar Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              Konfirmasi &amp; Unggah Bukti Transfer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unggah foto / scan struk transfer ATM, mobile banking, atau teller (Maksimal 2 MB).
            </p>
          </div>

          <form onSubmit={handleUploadBukti} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Nama Pemilik Rekening Pengirim *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi / Orang Tua"
                  value={namaPengirim}
                  onChange={(e) => setNamaPengirim(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Bank Tujuan *</label>
                <select
                  value={bankTujuan}
                  onChange={(e) => setBankTujuan(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                >
                  <option value={infoRekening?.bank_name || "Bank Syariah Indonesia (BSI)"}>
                    {infoRekening?.bank_name || "Bank Syariah Indonesia (BSI)"} - {infoRekening?.nomor_rekening || "7148899012"}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-900">Pilih File Bukti Transfer (JPG / PNG / PDF) *</label>
                <input
                  type="file"
                  required
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => setFileBukti(e.target.files?.[0] || null)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSubmitting ? "Mengunggah Bukti Bayar..." : "Kirim Konfirmasi Pembayaran"}</span>
            </button>
          </form>
        </div>

        {/* Riwayat Pembayaran */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Riwayat Pembayaran PMB</h3>
          {riwayat.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">Belum ada riwayat konfirmasi pembayaran.</p>
          ) : (
            <div className="space-y-3">
              {riwayat.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">
                      Transfer Rp {Number(item.jumlah).toLocaleString("id-ID")} ({item.bank_tujuan})
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Pengirim: {item.nama_pengirim || "-"} • Tanggal:{" "}
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    {item.alasan_penolakan && (
                      <p className="text-red-700 font-semibold text-[11px] pt-1">
                        Alasan Penolakan: {item.alasan_penolakan}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl font-bold uppercase text-[11px] border self-start sm:self-center ${
                      item.status === "diterima"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : item.status === "ditolak"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {item.status === "diterima"
                      ? "Terverifikasi Sah"
                      : item.status === "ditolak"
                      ? "Pembayaran Ditolak"
                      : "Menunggu Verifikasi"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
