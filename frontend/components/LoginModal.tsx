"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { api, authStorage } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import OTPVerificationModal from "@/components/OTPVerificationModal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalonePage?: boolean;
  allowClose?: boolean;
  onSuccess?: (user: any) => void;
  redirectTo?: string | null;
  initialIdentifier?: string;
  initialSuccessMessage?: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  isStandalonePage = false,
  allowClose = true,
  onSuccess,
  redirectTo,
  initialIdentifier = "",
  initialSuccessMessage = "",
}: LoginModalProps) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(initialSuccessMessage);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  // Update identifier atau pesan sukses jika ada prop baru (misal dari redirect verifikasi OTP)
  useEffect(() => {
    if (initialIdentifier) {
      setIdentifier(initialIdentifier);
    }
  }, [initialIdentifier]);

  useEffect(() => {
    if (initialSuccessMessage) {
      setSuccessMessage(initialSuccessMessage);
    }
  }, [initialSuccessMessage]);

  // Ambil identifier tersimpan jika user sebelumnya mencentang "Ingat saya"
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const savedIdentifier = localStorage.getItem("pmb_remembered_identifier");
      const isRemembered = localStorage.getItem("pmb_remember_me") === "true";
      if (!initialIdentifier && savedIdentifier && isRemembered) {
        setIdentifier(savedIdentifier);
        setRememberMe(true);
      }
    }
  }, [isOpen, initialIdentifier]);

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

        // Simpan / perbarui identitas jika opsi "Ingat saya" aktif
        if (typeof window !== "undefined") {
          if (rememberMe) {
            localStorage.setItem("pmb_remembered_identifier", identifier.trim());
            localStorage.setItem("pmb_remember_me", "true");
          } else {
            localStorage.removeItem("pmb_remembered_identifier");
            localStorage.removeItem("pmb_remember_me");
          }
        }

        const userRole = res.data.user?.role;

        if (onSuccess) {
          onSuccess(res.data.user);
          if (!isStandalonePage) onClose();
        } else if (redirectTo !== null) {
          if (redirectTo) {
            router.push(redirectTo);
          } else if (userRole === "admin_pmb" || userRole === "super_admin") {
            router.push("/admincms");
          } else {
            router.push("/dashboard");
          }
          if (!isStandalonePage) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      if (err.data?.need_email_verification || err.code === "UNVERIFIED_EMAIL" || err.message?.toLowerCase().includes("belum diverifikasi")) {
        const targetEmail = err.data?.email || (identifier.includes("@") ? identifier.trim() : "");
        if (targetEmail) {
          setUnverifiedEmail(targetEmail);
          setShowOtpModal(true);
          return;
        }
      }

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
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0d3830] via-[#165349] to-[#0d3830]" />

        {/* 1. Modal Header Section */}
        <div className="bg-slate-50/80 px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Portal PMB STAI Cendekia Insani"
              width={220}
              height={36}
              priority
              unoptimized
              className="h-8 sm:h-9 w-auto object-contain"
            />
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

        {/* 2. Modal Body / Form Section */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 bg-white">
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 animate-fadeIn font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600/80" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Field 1: Email / NIK */}
          <div className="space-y-1.5">
            <label htmlFor="identifier" className="block font-bold text-slate-900 text-xs sm:text-sm">
              {lang === "eng"
                ? "Registered Email or National ID (NIK)"
                : "Email Terdaftar atau NIK (16 Digit)"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-4 h-4 text-[#0d3830]" />
              </div>
              <input
                type="text"
                id="identifier"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs font-medium"
              />
            </div>
          </div>

          {/* Field 2: Kata Sandi */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block font-bold text-slate-900 text-xs sm:text-sm">
              {lang === "eng" ? "Password" : "Kata Sandi (Password)"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-[#0d3830]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs font-medium"
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

          {/* Options Row: Remember Me */}
          <div className="flex items-center text-xs pt-1">
            <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
              />
              <span>{lang === "eng" ? "Remember me" : "Ingat saya"}</span>
            </label>
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
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <a
                href="mailto:staicendekia2010@gmail.com?subject=Bantuan%20Akun%20PMB%20STAICI"
                className="flex items-center gap-2 text-slate-700 hover:text-[#0d3830] transition group font-medium"
              >
                <Mail className="w-4 h-4 text-slate-400 group-hover:text-[#0d3830] flex-shrink-0" />
                <span className="group-hover:underline">
                  {lang === "eng" ? "Need account assistance?" : "Butuh bantuan akun?"}
                </span>
              </a>
              <Link
                href="/lupa-password"
                onClick={() => allowClose && !isStandalonePage && onClose()}
                className="font-bold text-[#0d3830] hover:underline flex-shrink-0"
              >
                {lang === "eng" ? "Forgot Password?" : "Lupa Kata Sandi"}
              </Link>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <Headphones className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a
                href="https://wa.me/6285233432221?text=Halo%20Panitia%20PMB%20STAICI,%20saya%20mengalami%20kendala%20saat%20login%20ke%20akun"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-700 hover:text-[#0d3830] hover:underline"
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
                href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
                onClick={() => allowClose && !isStandalonePage && onClose()}
                className="font-bold text-[#0d3830] hover:underline inline-flex items-center gap-0.5"
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
      </div>

      {/* OTP Verification Modal if login requires verification */}
      <OTPVerificationModal
        isOpen={showOtpModal}
        email={unverifiedEmail}
        onClose={() => setShowOtpModal(false)}
        onVerified={(data) => {
          setShowOtpModal(false);
          if (onSuccess) {
            onSuccess(data?.user);
          } else {
            router.push(redirectTo || "/dashboard");
          }
          onClose();
        }}
      />
    </div>
  );
}
