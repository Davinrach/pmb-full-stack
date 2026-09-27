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
          <span className="text-xs font-bold text-[#0d3830] font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {infoRekening?.nomor_pendaftaran || "PMB 2026/2027"}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Pembayaran Biaya PMB (FR-4.1 - FR-4.4)
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

        {/* Bank Account Info Card */}
        <div className="bg-gradient-to-br from-[#0c2f29] via-[#0d3830] to-[#165349] rounded-3xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-amber-400" />
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                  {infoRekening?.bank_name}
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-100/70 block">Nomor Rekening Tujuan:</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider">
                    {infoRekening?.nomor_rekening}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRekening}
                    className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
              </div>
              <div className="text-xs text-emerald-100/90">
                <span>Atas Nama: </span>
                <strong className="font-bold text-white">{infoRekening?.atas_nama}</strong>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-4 sm:p-5 text-right flex flex-col items-start sm:items-end justify-center min-w-[200px]">
              <span className="text-xs text-emerald-200 font-medium">Total Biaya Pendaftaran</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-1">
                Rp {Number(infoRekening?.biaya_pendaftaran || 250000).toLocaleString("id-ID")}
              </span>
              <span className="text-[11px] text-emerald-200/80 mt-1">
                Kode Ref: {infoRekening?.kode_pembayaran_unik}
              </span>
            </div>
          </div>
        </div>

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
                  <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI) - 7148899012</option>
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
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : item.status === "ditolak"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-purple-100 text-purple-800 border-purple-200"
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
