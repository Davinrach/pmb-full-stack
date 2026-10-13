"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Building2,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { api, authStorage } from "@/lib/api";

export default function LoginAdminPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/login", {
        identifier: identifier.trim(),
        password,
      });

      if (res.data && res.data.token) {
        authStorage.setToken(res.data.token);
        authStorage.setUser(res.data.user);

        const role = res.data.user?.role;
        if (role === "admin_pmb" || role === "super_admin") {
          router.push("/admincms");
        } else {
          setErrorMessage("Akun ini terdaftar sebagai Calon Mahasiswa. Silakan login di Portal Calon Mahasiswa.");
          authStorage.clear();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Username / Email Admin atau Kata Sandi salah");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src="/logo-staici.png"
              alt="Logo STAICI"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#0d3830] leading-tight">
              STAICI PMB
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 leading-tight">
              Panitia PMB Utama &amp; Portal Administrasi Terpadu
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs font-bold text-[#0d3830] hover:text-[#165349] hover:underline flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg transition"
        >
          <GraduationCap className="w-4 h-4 text-[#0d3830]" />
          <span>Login Calon Mahasiswa</span>
        </Link>
      </header>

      {/* Main Content Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="max-w-4xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Hero / Brand Column (5 cols) */}
          <div className="md:col-span-5 bg-[#0d3830] text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('/banner.png')] bg-cover bg-center" />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portal Resmi Pengelola PMB</span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white leading-tight">
                  Dashboard Administrasi Terpadu PMB STAICI
                </h2>
                <p className="text-xs text-emerald-100/80 leading-relaxed mt-2">
                  Kelola pendaftaran calon mahasiswa, verifikasi pembayaran VA, verifikasi dokumen berkas, dan sinkronisasi EMIS Kemenag &amp; PDDikti secara terpusat.
                </p>
              </div>

              <div className="space-y-3 pt-2 text-xs text-emerald-50 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Verifikasi pembayaran otomatis &amp; manual</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Manajemen status kelulusan &amp; seleksi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>CMS Pengaturan Banner &amp; Teks Pendaftaran</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-8 border-t border-emerald-800/80 text-[11px] text-emerald-200/70">
              © 2026 STAI Cendekia Insani Situbondo. All rights reserved.
            </div>
          </div>

          {/* Right Login Form Column (7 cols) */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                <KeyRound className="w-5 h-5 text-[#0d3830]" />
                <span>Masuk ke Akun Admin</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan username atau email admin resmi STAICI untuk melanjutkan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Field 1: Identifier */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-identifier"
                  className="block text-xs font-bold text-slate-700"
                >
                  Username / Email Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4 text-[#0d3830]" />
                  </div>
                  <input
                    type="text"
                    id="admin-identifier"
                    required
                    placeholder="Username / Email (cth: admin)"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs font-medium"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-slate-700"
                >
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-[#0d3830]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="admin-password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#0d3830] rounded focus:ring-[#0d3830] cursor-pointer"
                  />
                  <span>Ingat sesi saya</span>
                </label>

                <span className="text-[11px] text-slate-400 font-semibold">
                  Terenkripsi TLS 256-Bit
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <span>Memverifikasi Akun Admin...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Masuk ke Dashboard Admin CMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-500 font-medium">
        Portal PMB Terpadu STAI Cendekia Insani Situbondo • Sistem Informasi PMB v1.1
      </footer>
    </div>
  );
}
