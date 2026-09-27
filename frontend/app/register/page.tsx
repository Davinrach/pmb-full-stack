"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
} from "lucide-react";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

export default function RegisterPage() {
  const { lang, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  const maskEmail = (email: string) => {
    if (!email || !email.includes("@")) return "pendaftar****@gmail.com";
    const [user, domain] = email.split("@");
    if (user.length <= 4) {
      return `${user.slice(0, 1)}****@${domain}`;
    }
    return `${user.slice(0, 4)}****@${domain}`;
  };

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
    if (formData.password.length < 8) {
      setErrorMessage(
        lang === "eng"
          ? "Password must be at least 8 characters long."
          : "Kata sandi harus memiliki minimal 8 karakter."
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
      await api.post("/auth/register", {
        nama_lengkap: formData.namaLengkap,
        nik: formData.nik,
        no_hp: formData.noWhatsapp,
        email: formData.email,
        password: formData.password,
      });

      setShowSuccessModal(true);
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
        <div className="bg-[#f0f5ff] border border-blue-200/90 rounded-2xl p-4 sm:p-5 mb-8 flex items-center gap-3.5 text-xs sm:text-sm text-slate-700 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <p className="leading-relaxed">
            {lang === "eng"
              ? "Complete your initial account registration to access the integrated admission form and sync data with Ministry of Religious Affairs (EMIS)."
              : "Lengkapi data registrasi akun awal untuk mendapatkan akses pengisian formulir PMB terpadu dan sinkronisasi data EMIS Kopertais IV Surabaya."}
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 md:p-10 shadow-sm">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
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
                  placeholder={lang === "eng" ? "Ahmad Fauzi Rahman" : "Ahmad Fauzi Rahman"}
                  value={formData.namaLengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, namaLengkap: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
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
                  placeholder="3512xxxxxxxxxxxx"
                  value={formData.nik}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nik: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
                />
              </div>
            </div>

            {/* Field 3: Nomor WhatsApp Aktif */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label htmlFor="noWhatsapp" className="font-bold text-slate-900">
                  {lang === "eng" ? "Active WhatsApp Number" : "Nomor WhatsApp Aktif"} <span className="text-red-500">*</span>
                </label>
                <span className="text-amber-700 font-bold text-xs">
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
                  placeholder="08xxxxxxxxxx"
                  value={formData.noWhatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, noWhatsapp: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
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
                  placeholder="nama@gmail.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
                />
              </div>
            </div>

            {/* Field 5: Buat Kata Sandi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label htmlFor="password" className="font-bold text-slate-900">
                  {lang === "eng" ? "Create Password" : "Buat Kata Sandi"} <span className="text-red-500">*</span>
                </label>
                <span className="text-slate-400 text-xs">
                  {lang === "eng" ? "Min. 8 Characters" : "Min. 8 Karakter"}
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
                  minLength={8}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-10 py-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
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
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-10 py-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] transition shadow-xs"
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
                  ? "I agree to the admission requirements and ensure the authenticity of all registration data for EMIS Kopertais IV Surabaya reporting."
                  : "Saya menyetujui persyaratan PMB serta menjamin keabsahan data registrasi untuk keperluan pelaporan EMIS Kopertais IV Surabaya."}
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
                href="/login"
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
                <Headphones className="w-4 h-4 text-amber-600" />
                <span>{lang === "eng" ? "Need help signing in?" : "Bantuan kendala masuk?"}</span>
              </a>
            </div>
          </form>
        </div>
      </main>

      {/* 4. Footer Section */}
      <Footer />

      {/* Pop-Up Modal: Pendaftaran Akun Berhasil */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-sm sm:max-w-[420px] w-full p-6 sm:p-8 shadow-2xl relative text-center flex flex-col items-center border border-slate-100 animate-scaleUp">
            <div className="relative w-12 h-12 mb-3">
              <Image
                src="/logo-staici.png"
                alt="Logo STAICI"
                fill
                className="object-contain"
              />
            </div>

            <div className="w-12 h-12 rounded-full bg-[#e8f8f2] text-[#0d3830] flex items-center justify-center mb-5 shadow-xs">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              {lang === "eng" ? "Account Registration Successful!" : "Pendaftaran Akun Berhasil!"}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mb-7">
              {lang === "eng" ? "Your account has been registered for email (" : "Akun Anda telah terdaftar untuk email ("}
              <span className="font-semibold text-slate-800">
                {maskEmail(formData.email)}
              </span>
              {lang === "eng" ? "). Please sign in to fill out your admission data and documents." : "). Silakan login untuk melengkapi formulir data pribadi dan berkas PMB."}
            </p>

            <Link
              href="/login"
              className="w-full py-3.5 bg-[#173a33] hover:bg-[#102b26] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center block"
            >
              {lang === "eng" ? "Sign In to My Account" : "Masuk ke Akun Saya"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
