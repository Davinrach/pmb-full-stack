"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Headphones,
  ExternalLink,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { api, authStorage } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalonePage?: boolean;
  allowClose?: boolean;
  onSuccess?: (user: any) => void;
  redirectTo?: string | null;
}

export default function LoginModal({
  isOpen,
  onClose,
  isStandalonePage = false,
  allowClose = true,
  onSuccess,
  redirectTo,
}: LoginModalProps) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

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

        const userRole = res.data.user?.role;

        if (onSuccess) {
          onSuccess(res.data.user);
        } else if (redirectTo !== null) {
          if (redirectTo) {
            router.push(redirectTo);
          } else if (userRole === "admin_pmb" || userRole === "super_admin") {
            router.push("/admincms");
          } else {
            router.push("/dashboard");
          }
        }
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (lang === "eng"
            ? "Invalid Email / National ID (NIK) or Password"
            : "Email / NIK atau Kata Sandi salah")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative border border-slate-100 animate-scaleUp my-8">
        
        {/* Top Accent Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0d3830] via-[#1b5e52] to-amber-500" />

        {/* 1. Modal Header Section */}
        <div className="bg-slate-50/90 px-6 sm:px-8 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            {/* Logo & Brand Info */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex-shrink-0 shadow-xs flex items-center justify-center">
                <Image
                  src="/logo-staici.png"
                  alt="Logo STAICI"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 leading-tight">
                  {lang === "eng"
                    ? "New Student Admission Information System"
                    : "Sistem Informasi Penerimaan Mahasiswa Baru"}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  {lang === "eng" ? "STAICI Admission Portal" : "Portal PMB Terpadu STAICI"}
                </span>
              </div>
            </div>

            {/* Close Button (only if allowClose is true) */}
            {allowClose && (
              !isStandalonePage ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-500 flex items-center justify-center transition cursor-pointer flex-shrink-0"
                  aria-label={lang === "eng" ? "Close" : "Tutup"}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/"
                  className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-500 flex items-center justify-center transition cursor-pointer flex-shrink-0"
                  aria-label={lang === "eng" ? "Back to Home" : "Kembali ke Beranda"}
                >
                  <X className="w-4 h-4" />
                </Link>
              )
            )}
          </div>

          {/* Subtitle */}
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              {lang === "eng" ? "Applicant Portal" : "Portal Calon Mahasiswa"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 font-normal">
            {lang === "eng"
              ? "Sign in to fill out the admission form, upload documents, check payment status, and view selection results."
              : "Masuk untuk pengisian formulir pendaftaran, unggah berkas, cek status VA, dan melihat hasil seleksi."}
          </p>
        </div>

        {/* 2. Modal Body / Form Section */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 bg-white">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Field 1: Email / NIK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label htmlFor="identifier" className="font-bold text-slate-900">
                {lang === "eng"
                  ? "Registered Email or National ID (NIK)"
                  : "Email Terdaftar atau NIK (16 Digit)"}
              </label>
              <span className="text-xs font-semibold text-amber-700">
                {lang === "eng" ? "*Required" : "*Wajib"}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-4 h-4 text-[#0d3830]" />
              </div>
              <input
                type="text"
                id="identifier"
                required
                placeholder={lang === "eng" ? "email@example.com / 3512xxxxxxxxxxxx" : "contoh@gmail.com / 3512xxxxxxxxxxxx"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-tight pt-0.5">
              {lang === "eng"
                ? "Enter the active email or 16-digit National ID used when creating your account"
                : "Masukkan email aktif atau 16 digit NIK saat Anda mendaftar akun"}
            </p>
          </div>

          {/* Field 2: Kata Sandi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label htmlFor="password" className="font-bold text-slate-900">
                {lang === "eng" ? "Password" : "Kata Sandi (Password)"}
              </label>
              <span className="text-xs font-semibold text-amber-700">
                {lang === "eng" ? "*Required" : "*Wajib"}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-[#0d3830]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Options Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
              />
              <span>{lang === "eng" ? "Remember me" : "Ingat saya"}</span>
            </label>

            <Link
              href="/lupa-password"
              onClick={() => allowClose && !isStandalonePage && onClose()}
              className="font-bold text-amber-800 hover:underline"
            >
              {lang === "eng" ? "Forgot Password?" : "Lupa Kata Sandi?"}
            </Link>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#10342d] hover:bg-[#0c2a24] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isSubmitting ? (
                <span>{lang === "eng" ? "Verifying Account..." : "Memverifikasi Akun Mahasiswa..."}</span>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5 text-emerald-300" />
                  <span>{lang === "eng" ? "Sign In to Applicant Portal" : "Masuk ke Portal Mahasiswa"}</span>
                </>
              )}
            </button>
          </div>

          {/* Auxiliary Card */}
          <div className="bg-[#f0f3ff] border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-medium">{lang === "eng" ? "Need account assistance?" : "Butuh bantuan akun?"}</span>
              </div>
              <Link
                href="/lupa-password"
                onClick={() => allowClose && !isStandalonePage && onClose()}
                className="font-bold text-amber-800 hover:underline flex-shrink-0"
              >
                {lang === "eng" ? "Reset Password" : "Reset Kata Sandi"}
              </Link>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <Headphones className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <a
                href="https://wa.me/6285233432221?text=Halo%20Panitia%20PMB%20STAICI,%20saya%20mengalami%20kendala%20saat%20login%20ke%20akun"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-700 hover:underline"
              >
                {lang === "eng" ? "PMB Help Center WhatsApp" : "Kontak Layanan PMB"}
              </a>
            </div>
          </div>

          {/* Bottom Redirect Link */}
          <div className="pt-2 flex flex-col items-center justify-center gap-3 text-xs text-slate-600">
            <div>
              <span>{lang === "eng" ? "Don't have an applicant account?" : "Belum punya akun calon mahasiswa?"}</span>{" "}
              <Link
                href="/register"
                onClick={() => allowClose && !isStandalonePage && onClose()}
                className="font-bold text-amber-800 hover:underline inline-flex items-center gap-0.5"
              >
                <span>{lang === "eng" ? "Register Now" : "Daftar Sekarang"}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* If close is not allowed, provide Back to Home button */}
            {!allowClose && (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold transition pt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === "eng" ? "Back to Homepage" : "Kembali ke Halaman Utama"}</span>
              </Link>
            )}
          </div>
        </form>

        {/* 3. Modal Footer Security Bar */}
        <div className="bg-[#e8eeff] px-6 py-3.5 flex items-center justify-between text-[11px] font-semibold text-slate-600 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === "eng" ? "Secure TLS 256-Bit Encrypted" : "Koneksi Aman TLS 256-Bit Terenkripsi"}</span>
          </div>
          <span>PMB PORTAL STAICI</span>
        </div>
      </div>
    </div>
  );
}
