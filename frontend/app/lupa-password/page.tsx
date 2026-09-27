"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setIsSuccess(true);
      if (res.data && res.data.reset_token) {
        setResetToken(res.data.reset_token);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses permintaan reset kata sandi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#072520] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-25 bg-[url('/banner.png')]" />

      <div className="relative z-10 bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="relative w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
            <Image
              src="/logo-staici.png"
              alt="Logo STAICI"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">PMB Online STAICI</span>
            <h2 className="text-base font-bold text-slate-900 font-serif">Lupa Kata Sandi</h2>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0d3830] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instruksi Terkirim</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tautan dan token reset kata sandi telah dikirimkan ke alamat email <strong>{email}</strong>.
            </p>
            {resetToken && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-left">
                <span className="font-bold text-amber-900 block mb-1">Token Reset (Pengujian):</span>
                <code className="text-slate-800 break-all bg-white p-1.5 rounded border border-amber-200 block text-[11px]">
                  {resetToken}
                </code>
                <Link
                  href={`/reset-password?token=${resetToken}`}
                  className="mt-2 text-[#0d3830] font-bold hover:underline block text-center"
                >
                  Lanjut ke Form Reset Password →
                </Link>
              </div>
            )}
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3 bg-[#10342d] hover:bg-[#0c2a24] text-white font-bold text-xs sm:text-sm rounded-xl transition block"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Masukkan alamat email yang terdaftar pada akun PMB Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
            </p>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="font-bold text-slate-900 text-xs sm:text-sm">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="nama@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#10342d] hover:bg-[#0c2a24] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-75 cursor-pointer"
            >
              {isSubmitting ? "Mengirim Permintaan..." : "Kirim Tautan Reset"}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0d3830] font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Batal dan kembali ke halaman login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
