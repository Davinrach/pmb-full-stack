"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  ShieldCheck,
  RotateCw,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Headphones,
  ArrowLeft,
} from "lucide-react";
import { api, authStorage } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

function VerifikasiEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const initialEmailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmailParam);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmailParam);

  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialEmailParam) {
      setEmail(initialEmailParam);
      setIsEditingEmail(false);
    }
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 200);
  }, [initialEmailParam]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const maskEmail = (rawEmail: string) => {
    if (!rawEmail || !rawEmail.includes("@")) return "pendaftar****@gmail.com";
    const [user, domain] = rawEmail.split("@");
    if (user.length <= 4) {
      return `${user.slice(0, 1)}****@${domain}`;
    }
    return `${user.slice(0, 4)}****@${domain}`;
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    const newOtp = [...otpValues];

    if (cleanVal.length > 1) {
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Silakan masukkan alamat email yang valid.");
      return;
    }

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

      if (res.data?.token) {
        authStorage.setToken(res.data.token);
        authStorage.setUser(res.data.user);
      }

      setIsSuccess(true);
      setSuccessMessage(
        lang === "eng"
          ? "Email verified successfully! Entering dashboard..."
          : "Verifikasi email akun Anda berhasil! Mengarahkan ke formulir PMB..."
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 1300);
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
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Silakan isi alamat email Anda terlebih dahulu.");
      return;
    }

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
            : "Gagal mengirim ulang kode OTP. Pastikan email sudah terdaftar.")
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-emerald-200 selection:text-emerald-950 font-sans">
      <Navbar activePage="pendaftaran" />

      {/* Hero Header */}
      <section className="relative w-full min-h-[190px] flex items-center justify-center text-center overflow-hidden bg-[#0c2f29]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/banner.png"
            alt="Kampus STAICI Situbondo"
            fill
            priority
            className="object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a2f28]/95 via-[#0e3b33]/90 to-[#07241e]/85" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 flex flex-col items-center">
          <div className="w-11 h-11 rounded-xl bg-white/10 text-emerald-200 flex items-center justify-center mb-2 border border-white/20">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {lang === "eng" ? "Email OTP Verification" : "Verifikasi OTP Email Pendaftaran"}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 max-w-lg">
            {lang === "eng"
              ? "Verify your registered email address to secure your admission account"
              : "Verifikasi alamat email Anda untuk mengamankan dan mengaktifkan akun PMB"}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-lg mx-auto px-4 py-8 sm:py-12 w-full flex-1">
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {/* Email Info Section */}
          <div className="text-center mb-6">
            <p className="text-xs sm:text-sm text-slate-600">
              {lang === "eng"
                ? "We sent a 6-digit verification code to:"
                : "Masukkan 6 digit kode OTP yang kami kirimkan ke email:"}
            </p>

            {isEditingEmail ? (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="masukkan.email@anda.com"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0d3830] focus:ring-2 focus:ring-emerald-900/10 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (email.includes("@")) setIsEditingEmail(false);
                  }}
                  className="px-3 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800">
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span>{email ? maskEmail(email) : "Belum diisi"}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="text-[11px] font-normal text-slate-600 underline hover:text-slate-900 ml-1"
                >
                  Ubah
                </button>
              </div>
            )}
          </div>

          {/* Dev OTP Helper */}
          {devOtp && (
            <div className="mb-4 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                Mode Uji Coba:
              </span>
              <button
                type="button"
                onClick={() => {
                  const digits = devOtp.split("").slice(0, 6);
                  setOtpValues(digits);
                }}
                className="font-mono font-bold bg-slate-200 hover:bg-slate-300 text-slate-900 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer"
              >
                {devOtp} (Isi Otomatis)
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-4 bg-rose-50/70 border border-rose-200/70 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600/80 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-start gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* OTP Digit Input Boxes */}
          <form onSubmit={handleVerify} className="flex flex-col items-center">
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
                  className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-extrabold rounded-xl border-2 transition-all duration-150 outline-none ${
                    val
                      ? "border-emerald-600 bg-emerald-50/40 text-emerald-950 ring-4 ring-emerald-500/10 shadow-xs"
                      : "border-slate-200 bg-slate-50 text-slate-800 focus:border-[#0d3830] focus:bg-white focus:ring-4 focus:ring-emerald-900/10"
                  }`}
                />
              ))}
            </div>

            {/* Countdown / Resend */}
            <div className="mt-5 text-xs flex items-center justify-center gap-2 text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {!canResend ? (
                <span>Kirim ulang kode dalam 00:{countdown < 10 ? `0${countdown}` : countdown}</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || isVerifying || isSuccess}
                  className="text-[#0d3830] hover:text-emerald-800 font-bold hover:underline inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                  {isResending ? "Mengirim..." : "Kirim Ulang Kode OTP"}
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={fullOtp.length !== 6 || isVerifying || isSuccess}
              className="mt-6 w-full py-3.5 bg-[#0d3830] hover:bg-[#08241f] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi OTP...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>Berhasil Diverifikasi!</span>
                </>
              ) : (
                <>
                  <span>Verifikasi & Masuk Akun</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link href="/login" className="hover:text-slate-800 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Login</span>
            </Link>

            <a
              href="https://wa.me/6285233432221?text=Halo%20Admin%20PMB%20STAICI,%20saya%20butuh%20bantuan%20kode%20OTP"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Bantuan CS PMB</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function VerifikasiEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#072520] flex items-center justify-center text-white text-xs">Memuat halaman verifikasi...</div>}>
      <VerifikasiEmailContent />
    </Suspense>
  );
}
