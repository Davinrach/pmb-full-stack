"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  ShieldCheck,
  RotateCw,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { api, authStorage } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

interface OTPVerificationModalProps {
  isOpen: boolean;
  email: string;
  initialDevOtp?: string;
  onClose?: () => void;
  onVerified?: (resData: any) => void;
  redirectTo?: string;
  autoLogin?: boolean;
}

export default function OTPVerificationModal({
  isOpen,
  email,
  initialDevOtp,
  onClose,
  onVerified,
  redirectTo = "/dashboard/formulir",
  autoLogin = false,
}: OTPVerificationModalProps) {
  const router = useRouter();
  const { lang } = useLanguage();

  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>(initialDevOtp);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs & countdown
  useEffect(() => {
    if (isOpen) {
      setCountdown(60);
      setCanResend(false);
      setErrorMessage("");
      setSuccessMessage("");
      setOtpValues(["", "", "", "", "", ""]);
      setIsSuccess(false);

      // Focus first input after modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen, email]);

  useEffect(() => {
    if (initialDevOtp) {
      setDevOtp(initialDevOtp);
    }
  }, [initialDevOtp]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const maskEmail = (rawEmail: string) => {
    if (!rawEmail || !rawEmail.includes("@")) return "pendaftar****@gmail.com";
    const [user, domain] = rawEmail.split("@");
    if (user.length <= 4) {
      return `${user.slice(0, 1)}****@${domain}`;
    }
    return `${user.slice(0, 4)}****@${domain}`;
  };

  const handleDigitChange = (index: number, val: string) => {
    // Only digits allowed
    const cleanVal = val.replace(/\D/g, "");
    const newOtp = [...otpValues];

    if (cleanVal.length > 1) {
      // User pasted multiple characters
      const pastedDigits = cleanVal.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedDigits[i] || "";
      }
      setOtpValues(newOtp);
      const nextIdx = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newOtp[index] = cleanVal;
    setOtpValues(newOtp);
    setErrorMessage("");

    // Auto-advance to next input if single digit entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otpValues];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtpValues(newOtp);
    const nextIdx = Math.min(pasted.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const fullOtp = otpValues.join("");

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullOtp.length !== 6) {
      setErrorMessage(
        lang === "eng"
          ? "Please enter the complete 6-digit OTP code."
          : "Silakan masukkan 6 digit kode OTP secara lengkap."
      );
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const res = await api.post("/auth/verify-otp", {
        email: email.trim(),
        otp: fullOtp.trim(),
      });

      if (autoLogin && res.data?.token) {
        authStorage.setToken(res.data.token);
        authStorage.setUser(res.data.user);
      }

      setIsSuccess(true);
      setSuccessMessage(
        lang === "eng"
          ? (autoLogin ? "Email verified successfully! Entering dashboard..." : "Account verified successfully! Redirecting to login...")
          : (autoLogin ? "Verifikasi email berhasil! Membuka dashboard..." : "Akun berhasil diverifikasi! Mengarahkan ke halaman login...")
      );

      setTimeout(() => {
        if (onVerified) {
          onVerified(res.data);
        } else if (!autoLogin) {
          router.push(
            `/login?verified=true&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(
              redirectTo || "/dashboard/formulir"
            )}`
          );
        } else {
          router.push(redirectTo);
        }
      }, 1200);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (lang === "eng"
            ? "Invalid or expired OTP code. Please try again."
            : "Kode OTP salah atau telah kedaluwarsa. Silakan periksa kembali.")
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await api.post("/auth/resend-otp", {
        email: email.trim(),
      });

      if (res.data?.dev_otp) {
        setDevOtp(res.data.dev_otp);
      }

      setSuccessMessage(
        lang === "eng"
          ? "A new 6-digit OTP code has been sent to your email."
          : "Kode OTP baru telah berhasil dikirimkan ke email Anda."
      );
      setCountdown(60);
      setCanResend(false);
      setOtpValues(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (lang === "eng"
            ? "Failed to resend OTP. Please try again later."
            : "Gagal mengirim ulang kode OTP. Silakan coba lagi.")
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[28px] max-w-md w-full shadow-2xl overflow-hidden border border-emerald-950/10 relative animate-scaleUp">
        {/* Top Accent Gradient Header */}
        <div className="h-2 w-full bg-gradient-to-r from-[#0d3830] via-[#10b981] to-amber-500" />

        {/* Close Button if applicable */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer z-10"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-6 sm:p-8 text-center flex flex-col items-center">
          {/* Brand Logo & Icon */}
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0d3830] shadow-xs">
              {isSuccess ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
              ) : (
                <ShieldCheck className="w-8 h-8 stroke-[2.2] text-[#0d3830]" />
              )}
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {lang === "eng" ? "Email Verification" : "Verifikasi Email Akun"}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xs leading-relaxed">
            {lang === "eng"
              ? "We've sent a 6-digit OTP verification code to "
              : "Kami telah mengirimkan 6 digit kode OTP verifikasi ke "}
            <br />
            <span className="font-bold text-[#0d3830] inline-flex items-center gap-1.5 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100 mt-1">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              {maskEmail(email)}
            </span>
          </p>

          {/* Dev OTP Helper Banner (for local development testing) */}
          {devOtp && (
            <div className="mt-3 w-full bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Mode Uji Coba (Dev OTP):
              </span>
              <button
                type="button"
                onClick={() => {
                  const digits = devOtp.split("").slice(0, 6);
                  setOtpValues(digits);
                }}
                className="font-mono font-bold bg-amber-200/80 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded text-xs transition cursor-pointer"
                title="Klik untuk memasukkan OTP otomatis"
              >
                {devOtp} (Isi Otomatis)
              </button>
            </div>
          )}

          {/* Error / Success Feedback */}
          {errorMessage && (
            <div className="mt-3.5 w-full bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-3.5 w-full bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-start gap-2 text-left font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 6 Digit Input Boxes */}
          <form onSubmit={handleVerify} className="w-full mt-6 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 w-full" onPaste={handlePaste}>
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isVerifying || isSuccess}
                  className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-extrabold rounded-xl border-2 transition-all duration-150 outline-none select-all ${
                    val
                      ? "border-emerald-600 bg-emerald-50/40 text-emerald-950 ring-4 ring-emerald-500/10 shadow-xs"
                      : "border-slate-200 bg-slate-50/80 text-slate-800 hover:border-slate-300 focus:border-[#0d3830] focus:bg-white focus:ring-4 focus:ring-emerald-900/10"
                  }`}
                />
              ))}
            </div>

            {/* Countdown and Resend Link */}
            <div className="mt-5 text-xs flex items-center justify-center gap-2 text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {!canResend ? (
                <span>
                  {lang === "eng"
                    ? `Resend code in 00:${countdown < 10 ? `0${countdown}` : countdown}`
                    : `Kirim ulang kode dalam 00:${countdown < 10 ? `0${countdown}` : countdown}`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || isVerifying || isSuccess}
                  className="text-[#0d3830] hover:text-emerald-800 font-bold hover:underline inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                  {isResending
                    ? lang === "eng"
                      ? "Sending..."
                      : "Mengirim..."
                    : lang === "eng"
                    ? "Resend OTP Code"
                    : "Kirim Ulang Kode OTP"}
                </button>
              )}
            </div>

            {/* Submit Verification Button */}
            <button
              type="submit"
              disabled={fullOtp.length !== 6 || isVerifying || isSuccess}
              className="mt-6 w-full py-3.5 bg-[#0d3830] hover:bg-[#08241f] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{lang === "eng" ? "Verifying OTP..." : "Memverifikasi OTP..."}</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>{lang === "eng" ? "Success!" : "Berhasil Diverifikasi!"}</span>
                </>
              ) : (
                <>
                  <span>{lang === "eng" ? "Verify & Enter Account" : "Verifikasi & Masuk Akun"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Help Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 w-full text-center">
            <p className="text-[11px] text-slate-400">
              Tidak menerima email? Periksa folder <strong>Spam / Promosi</strong> atau hubungi Admin PMB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
