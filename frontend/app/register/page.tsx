"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  CreditCard,
  Phone,
  Mail,
  Key,
  RotateCcw,
  Eye,
  EyeOff,
  Info,
  Headphones,
  Check,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";
import OTPVerificationModal from "@/components/OTPVerificationModal";

// Daftar kata sandi umum / diketahui bocor yang wajib ditolak
const COMMON_LEAKED_PASSWORDS = new Set([
  "password1234",
  "password12345",
  "password123456",
  "123456789012",
  "1234567890123",
  "qwertyuiopas",
  "qwertyuiopasd",
  "admin12345678",
  "administrator",
  "staici1234567",
  "staicisitubondo",
  "situbondo1234",
  "mahasiswabaru",
  "mahasiswastaici",
  "rahasia123456",
  "bismillah1234",
  "indonesia1234",
  "welcome123456",
  "iloveyou12345",
  "letmein123456",
  "sunshine12345",
]);

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-bold">Memuat Halaman Pendaftaran Akun...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/pendaftaran";
  const { lang, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    namaLengkap: "",
    nik: "",
    noWhatsapp: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evaluasi kekuatan kata sandi secara real-time
  const passwordStrength = useMemo(() => {
    const p = formData.password.trim();
    if (!p) {
      return {
        score: 0,
        label: "",
        feedback: "",
        isCommon: false,
        isValid: false,
      };
    }

    const lowered = p.toLowerCase();
    const isCommon = COMMON_LEAKED_PASSWORDS.has(lowered);
    const isAllSame = p.length > 1 && /^([a-zA-Z0-9])\1+$/.test(p);

    // 1. Kurang dari 12 karakter
    if (p.length < 12) {
      const remaining = 12 - p.length;
      return {
        score: 1,
        label: lang === "eng" ? "Weak" : "Lemah",
        feedback:
          lang === "eng"
            ? `Password needs at least ${remaining} more character${remaining > 1 ? "s" : ""} (min. 12 characters).`
            : `Kurang ${remaining} karakter lagi (minimal 12 karakter).`,
        isCommon,
        isValid: false,
      };
    }

    // 2. Password umum atau berulang
    if (isCommon || isAllSame) {
      return {
        score: 1,
        label: lang === "eng" ? "Weak" : "Lemah",
        feedback:
          lang === "eng"
            ? "This password is too common or easily guessable. Please use another combination."
            : "Kata sandi terlalu umum atau mudah ditebak. Silakan gunakan kombinasi lain.",
        isCommon: true,
        isValid: false,
      };
    }

    // 3. Hitung variasi kategori karakter
    const hasLower = /[a-z]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasDigit = /[0-9]/.test(p);
    const hasSpecial = /[^a-zA-Z0-9]/.test(p);
    const categories = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;

    // 4. Standar NIST SP 800-63B:
    // Jika passphrase panjang (>= 16 karakter), tidak wajib kombinasi kaku simbol/angka
    if (p.length >= 16) {
      if (categories >= 2) {
        return {
          score: 3,
          label: lang === "eng" ? "Strong" : "Sangat Kuat",
          feedback:
            lang === "eng"
              ? "Excellent! Long passphrase provides strong security."
              : "Sangat baik! Kata sandi panjang memenuhi standar keamanan tinggi.",
          isCommon: false,
          isValid: true,
        };
      }
      return {
        score: 2,
        label: lang === "eng" ? "Medium" : "Sedang",
        feedback:
          lang === "eng"
            ? "Passphrase length is good. Consider adding capital letters or numbers."
            : "Panjang mencukupi. Anda dapat memadukan huruf kapital atau angka agar lebih kokoh.",
        isCommon: false,
        isValid: true,
      };
    }

    // Jika 12 - 15 karakter: minimal 2 kategori karakter
    if (categories < 2) {
      return {
        score: 1,
        label: lang === "eng" ? "Weak" : "Lemah",
        feedback:
          lang === "eng"
            ? "Combine at least 2 character types (uppercase, lowercase, numbers, or symbols)."
            : "Kombinasikan minimal 2 jenis karakter (huruf besar/kecil, angka, atau simbol).",
        isCommon: false,
        isValid: false,
      };
    }

    if (categories >= 3) {
      return {
        score: 3,
        label: lang === "eng" ? "Strong" : "Kuat",
        feedback:
          lang === "eng"
            ? "Strong password with good character combination!"
            : "Kata sandi kuat dengan kombinasi karakter yang baik!",
        isCommon: false,
        isValid: true,
      };
    }

    return {
      score: 2,
      label: lang === "eng" ? "Medium" : "Sedang",
      feedback:
        lang === "eng"
          ? "Good password. Adding symbols or uppercase will make it stronger."
          : "Kata sandi cukup baik. Tambahkan simbol atau huruf besar agar semakin kuat.",
      isCommon: false,
      isValid: true,
    };
  }, [formData.password, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.agreeTerms) {
      setErrorMessage(
        lang === "eng"
          ? "You must accept the Terms & Conditions to proceed."
          : "Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan."
      );
      return;
    }
    if (formData.nik.length !== 16) {
      setErrorMessage(
        lang === "eng"
          ? "National ID (NIK) must be 16 numeric digits as in your ID Card."
          : "NIK harus terdiri dari 16 digit angka sesuai KTP/KK."
      );
      return;
    }
    if (formData.password.length < 12) {
      setErrorMessage(
        lang === "eng"
          ? "Password must be at least 12 characters long."
          : "Kata sandi harus memiliki minimal 12 karakter."
      );
      return;
    }
    if (!passwordStrength.isValid) {
      setErrorMessage(
        passwordStrength.feedback ||
          (lang === "eng"
            ? "Please use a stronger password."
            : "Silakan gunakan kata sandi yang lebih kuat.")
      );
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(
        lang === "eng"
          ? "Password confirmation does not match."
          : "Konfirmasi kata sandi tidak cocok dengan kata sandi yang dibuat."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/register", {
        nama_lengkap: formData.namaLengkap,
        nik: formData.nik,
        no_hp: formData.noWhatsapp,
        email: formData.email,
        password: formData.password,
      });

      setRegisteredEmail(formData.email);
      if (res.data?.dev_otp) {
        setDevOtp(res.data.dev_otp);
      }
      setShowOtpModal(true);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (lang === "eng"
            ? "Failed to register account. Please try again."
            : "Gagal melakukan registrasi akun.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-emerald-200 selection:text-emerald-950 font-sans">
      {/* 1. Header / Navbar */}
      <Navbar activePage="pendaftaran" />

      {/* 2. Hero / Banner Section */}
      <section className="relative w-full min-h-[200px] sm:min-h-[230px] flex items-center justify-center text-center overflow-hidden bg-[#0c2f29]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/banner.png"
            alt="Gedung Kampus STAI Cendekia Insani Situbondo"
            fill
            priority
            className="object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a2f28]/95 via-[#0e3b33]/90 to-[#07241e]/85 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 sm:py-12 flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
            {lang === "eng" ? "New Student Account Registration" : "Registrasi Akun Calon Mahasiswa"}
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-emerald-100/90 font-medium max-w-2xl leading-relaxed">
            {lang === "eng"
              ? "Register yourself as part of the STAI Cendekia Insani academic community"
              : "Daftarkan diri Anda sebagai bagian dari keluarga besar STAI Cendekia Insani Situbondo"}
          </p>
        </div>
      </section>

      {/* 3. Main Form Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 w-full flex-1">
        {/* Info Banner Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-8 flex items-center gap-3.5 text-xs sm:text-sm text-slate-700 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0d3830] border border-slate-200/70 flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <p className="leading-relaxed">
            {lang === "eng"
              ? "Complete your initial account registration to access the integrated admission form and official PMB services of STAI Cendekia Insani."
              : "Lengkapi data registrasi akun awal untuk mendapatkan akses pengisian formulir pendaftaran dan layanan administrasi PMB STAI Cendekia Insani."}
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 md:p-10 shadow-sm">
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50/70 border border-rose-200/70 rounded-xl text-xs sm:text-sm text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600/80" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field 1: Nama Lengkap */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label
                  htmlFor="namaLengkap"
                  className="font-bold text-slate-900"
                >
                  {lang === "eng" ? "Full Name" : "Nama Lengkap"} <span className="text-red-500">*</span>
                </label>
                <span className="text-slate-400 text-xs">
                  {lang === "eng" ? "As in ID Card / Diploma" : "Sesuai KTP / Ijazah"}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="namaLengkap"
                  required
                  value={formData.namaLengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, namaLengkap: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
                />
              </div>
            </div>

            {/* Field 2: NIK (16 Digit) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label htmlFor="nik" className="font-bold text-slate-900">
                  {lang === "eng" ? "National ID (NIK - 16 Digits)" : "NIK (16 Digit)"} <span className="text-red-500">*</span>
                </label>
                <span className="text-slate-400 text-xs">
                  {lang === "eng" ? "16 numeric digits" : "KTP / KK (Harus 16 Angka)"}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="nik"
                  required
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nik: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
                />
              </div>
            </div>

            {/* Field 3: Nomor WhatsApp Aktif */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label htmlFor="noWhatsapp" className="font-bold text-slate-900">
                  {lang === "eng" ? "Active WhatsApp Number" : "Nomor WhatsApp Aktif"} <span className="text-red-500">*</span>
                </label>
                <span className="text-[#0d3830] font-semibold text-xs">
                  {lang === "eng" ? "For Selection & Payment Notice" : "Notif Seleksi & VA"}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  id="noWhatsapp"
                  required
                  value={formData.noWhatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, noWhatsapp: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
                />
              </div>
            </div>

            {/* Field 4: Alamat Email Aktif */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label htmlFor="email" className="font-bold text-slate-900">
                  {lang === "eng" ? "Active Email Address" : "Alamat Email Aktif"} <span className="text-red-500">*</span>
                </label>
                <span className="text-slate-400 text-xs">
                  {lang === "eng" ? "Gmail Preferred" : "Gmail Diutamakan"}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
                />
              </div>
            </div>

            {/* Field 5: Buat Kata Sandi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label htmlFor="password" className="font-bold text-slate-900">
                  {lang === "eng" ? "Create Password" : "Buat Kata Sandi"} <span className="text-red-500">*</span>
                </label>
                <span className="text-slate-500 font-semibold text-xs">
                  {lang === "eng" ? "Min. 12 Characters" : "Min. 12 Karakter"}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  minLength={12}
                  autoComplete="off"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-10 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
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

              {/* Indikator Kekuatan Kata Sandi (Weak, Medium, Strong) */}
              {formData.password.length > 0 && (
                <div className="pt-1.5 space-y-2 animate-fadeIn">
                  {/* Progress Bar 3 Segmen */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 1
                          ? passwordStrength.score === 1
                            ? "bg-rose-500"
                            : passwordStrength.score === 2
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 2
                          ? passwordStrength.score === 2
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 3 ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  </div>

                  {/* Keterangan & Badge Kekuatan */}
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="text-slate-500 text-[11px] leading-tight flex-1">
                      {passwordStrength.feedback}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase shrink-0 border ${
                        passwordStrength.score === 3
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : passwordStrength.score === 2
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Field 6: Konfirmasi Kata Sandi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label
                  htmlFor="confirmPassword"
                  className="font-bold text-slate-900"
                >
                  {lang === "eng" ? "Confirm Password" : "Konfirmasi Kata Sandi"} <span className="text-red-500">*</span>
                </label>
                <span className="text-slate-400 text-xs">
                  {lang === "eng" ? "Repeat Password" : "Ulangi Sandi"}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  required
                  minLength={12}
                  autoComplete="off"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-10 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-[11px] text-rose-600 font-medium pt-0.5">
                  {lang === "eng" ? "Passwords do not match" : "Kata sandi tidak cocok"}
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-[11px] text-emerald-600 font-medium pt-0.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === "eng" ? "Passwords match" : "Kata sandi cocok"}</span>
                </p>
              )}
            </div>

            {/* Checkbox Persetujuan */}
            <div className="pt-2 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
              <input
                type="checkbox"
                id="agreeTerms"
                required
                checked={formData.agreeTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeTerms: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="leading-relaxed cursor-pointer select-none">
                {lang === "eng"
                  ? "I agree to the admission requirements and ensure the authenticity of all data submitted to STAI Cendekia Insani Situbondo."
                  : "Saya menyetujui seluruh persyaratan PMB serta menjamin keabsahan data registrasi yang saya daftarkan di STAI Cendekia Insani Situbondo."}
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#173a33] hover:bg-[#102b26] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <span>{lang === "eng" ? "Registering Your Account..." : "Mendaftarkan Akun Anda..."}</span>
                ) : (
                  <span>{lang === "eng" ? "Register PMB Account Now" : "Daftar Akun PMB Sekarang"}</span>
                )}
              </button>
            </div>

            {/* Auxiliary Links Bar */}
            <div className="bg-slate-100/90 border border-slate-200/60 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-700">
              <Link
                href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login"}
                className="flex items-center gap-2 hover:text-[#0d3830] transition"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{lang === "eng" ? "Already have an account? Sign in here" : "Sudah memiliki akun? Masuk di sini"}</span>
              </Link>
              <a
                href="https://wa.me/6285233432221?text=Halo%20Panitia%20PMB%20STAICI,%20saya%20mengalami%20kendala%20saat%20pendaftaran%20akun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-700 hover:text-[#0d3830] transition"
              >
                <Headphones className="w-4 h-4 text-slate-500" />
                <span>{lang === "eng" ? "Need help signing in?" : "Bantuan kendala masuk?"}</span>
              </a>
            </div>
          </form>
        </div>
      </main>

      {/* 4. Footer Section */}
      <Footer />

      {/* Pop-Up Modal: Verifikasi OTP Email */}
      <OTPVerificationModal
        isOpen={showOtpModal}
        email={registeredEmail}
        initialDevOtp={devOtp}
        onClose={() => setShowOtpModal(false)}
        autoLogin={false}
        onVerified={() => {
          setShowOtpModal(false);
          router.push(
            `/login?verified=true&email=${encodeURIComponent(registeredEmail)}&redirect=${encodeURIComponent(redirectParam)}`
          );
        }}
        redirectTo={redirectParam}
      />
    </div>
  );
}
