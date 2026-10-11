"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Home,
  CheckCircle2,
  Phone,
  Clock,
  IdCard,
  Headphones,
  Briefcase,
  BookOpen,
  X,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

export default function HomePage() {
  const { t, lang } = useLanguage();
  const [selectedProdi, setSelectedProdi] = useState<any | null>(null);
  const [backendSettings, setBackendSettings] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [persyaratanList, setPersyaratanList] = useState<string[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/public/settings"),
      api.get("/info-pmb"),
      api.get("/faqs"),
    ])
      .then(([setRes, infoRes, faqRes]) => {
        if (setRes.data) setBackendSettings(setRes.data);
        if (infoRes.data?.persyaratan) setPersyaratanList(infoRes.data.persyaratan);
        if (faqRes.data && Array.isArray(faqRes.data)) {
          setFaqs(faqRes.data);
          if (faqRes.data.length > 0) {
            setExpandedFaqId(faqRes.data[0].id);
          }
        } else if (infoRes.data?.faq) {
          setFaqs(infoRes.data.faq);
        }
      })
      .catch(() => {});
  }, []);

  const announcementText = backendSettings?.announcement_text && lang === "id" 
    ? backendSettings.announcement_text 
    : t.hero.badge;

  const bannerTitle = backendSettings?.banner_title && lang === "id"
    ? backendSettings.banner_title
    : t.hero.title;

  const bannerSubtitle = backendSettings?.banner_subtitle && lang === "id"
    ? backendSettings.banner_subtitle
    : t.hero.subtitle;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-950">
      {/* 1. Header / Navbar */}
      <Navbar activePage="beranda" />

      {/* 2. Hero / Banner Section */}
      <section
        id="beranda"
        className="relative w-full min-h-[360px] md:min-h-[420px] flex items-center overflow-hidden bg-[#0c2f29]"
      >
        {/* Banner Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/banner.png"
            alt="Gedung Kampus STAI Cendekia Insani Situbondo"
            fill
            priority
            unoptimized
            className="object-cover object-center scale-105"
          />
          {/* Emerald-Teal Translucent Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d3830]/95 via-[#0e3b33]/90 to-[#07241e]/85 backdrop-blur-[1.5px]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200/90 mb-4">
            <Home className="w-3.5 h-3.5" />
            <span>{t.navbar.beranda}</span>
          </div>

          {/* Announcement Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold backdrop-blur-md mb-6 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>{announcementText}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl drop-shadow-sm">
            {bannerTitle}
          </h1>

          {/* Subtitle */}
          <div className="mt-4 space-y-1 text-emerald-100/90 text-sm sm:text-base md:text-lg max-w-2xl font-normal leading-relaxed">
            <p>{bannerSubtitle}</p>
          </div>
        </div>
      </section>

      {/* 3. Main Content Section (Grid Layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Program Studi Unggulan (col-span-8) */}
          <section id="program-studi" className="lg:col-span-8 space-y-6">
            {/* Section Header */}
            <div>
              <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">
                {t.prodiSection.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {t.prodiSection.title}
              </h2>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {t.prodiSection.subtitle}
              </p>
            </div>

            {/* List of Prodi Cards */}
            <div className="space-y-4">
              {t.prodiList.map((prodi) => (
                <div
                  key={prodi.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
                >
                  <div className="space-y-2.5 max-w-xl">
                    {/* Badge */}
                    <span
                      className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded border ${prodi.badgeColor}`}
                    >
                      {prodi.badge}
                    </span>

                    {/* Prodi Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#0d3830] transition-colors">
                      {prodi.nama}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {prodi.deskripsi}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md">
                        {prodi.jenjang}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md">
                        {prodi.gelar}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-md">
                        {prodi.akreditasi}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="sm:self-center flex-shrink-0">
                    <Link
                      href={`/program-studi/${prodi.id}`}
                      className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white bg-[#0e3831] hover:bg-[#165349] rounded-lg shadow-sm transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{t.prodiSection.lihatDetail}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT COLUMN: Hotline & Persyaratan (col-span-4) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Card 1: Hotline Panitia PMB */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg mb-1">
                <Headphones className="w-5 h-5 text-emerald-700" />
                <h3>{t.sidebar.hotlineTitle}</h3>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {t.sidebar.hotlineDesc}
              </p>

              {/* WhatsApp Callout Card */}
              <a
                href={`https://wa.me/${(backendSettings?.no_whatsapp_cs || "085233432221").replace(/[^0-9]/g, "")}?text=Halo%20Panitia%20PMB%20STAICI,%20saya%20ingin%20berkonsultasi%20terkait%20pendaftaran%20mahasiswa%20baru`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 bg-[#e9f2ee] hover:bg-[#dfeee6] rounded-xl border border-emerald-100 transition group"
              >
                <div className="w-10 h-10 rounded-full bg-[#0d3830] text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-600 leading-tight">
                    {t.sidebar.whatsappLabel}
                  </span>
                  <span className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    {backendSettings?.no_whatsapp_cs || "0852-3343-2221"}
                  </span>
                </div>
              </a>

              {/* Operating Hours */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.sidebar.operatingHours}</span>
              </div>
            </div>

            {/* Card 3: Persyaratan Berkas PMB (Dinamis) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3>Persyaratan Berkas Pendaftaran</h3>
              </div>
              <p className="text-xs text-slate-500">
                Dokumen yang wajib disiapkan sebelum melakukan submit formulir:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                {(persyaratanList.length > 0 ? persyaratanList : [
                  "Scan/Foto Kartu Keluarga (KK) Asli/Legalisir",
                  "Scan/Foto KTP Calon Mahasiswa",
                  "Scan/Foto Ijazah / SKL SLTA Sederajat",
                  "Pas Foto Resmi Berwarna 3x4",
                  "Bukti Transfer Pembayaran Biaya Pendaftaran PMB",
                  "Scan Kartu KIP (Khusus Jalur Beasiswa KIP)",
                ]).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* 4. Bottom Banner: Jalur Masuk Reguler & KIP */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm sm:text-base">
              <IdCard className="w-5 h-5 text-[#0d3830]" />
              <h4>{t.sidebar.jalurTitle}</h4>
            </div>
            <span className="inline-block self-start sm:self-auto px-3 py-1 text-xs font-bold text-emerald-800 bg-emerald-100/90 rounded-full border border-emerald-200">
              {t.sidebar.jalurBadge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
            {backendSettings?.jalur_pendaftaran_info || t.sidebar.jalurDesc}
          </p>
        </div>

        {/* 5. Interactive Dynamic FAQ Section */}
        <section id="faq" className="mt-16 pt-10 border-t border-slate-200/80 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold tracking-wider text-emerald-800 uppercase px-3 py-1 bg-emerald-100/70 rounded-full border border-emerald-200 inline-block">
              Pusat Informasi &amp; Regulasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tanya Jawab Seputar PMB (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Pertanyaan umum mengenai alur pendaftaran, berkas, verifikasi pembayaran, dan perkuliahan di STAI Cendekia Insani Situbondo.
            </p>
          </div>

          {/* FAQ Accordion List */}
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.filter((faq) => (faq.is_aktif ?? true)).map((faq) => {
              const isOpen = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? "border-emerald-300 shadow-md ring-1 ring-emerald-100" : "border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block">
                        {faq.kategori || "Umum"}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {faq.pertanyaan}
                      </h4>
                    </div>
                    <div
                      className={`p-1.5 rounded-lg text-slate-500 transition-transform flex-shrink-0 ${
                        isOpen ? "rotate-180 text-emerald-700 bg-emerald-50" : "bg-slate-50"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80 animate-fadeIn whitespace-pre-line">
                      {faq.jawaban}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 5. Footer Section */}
      <Footer />

      {/* 6. Interactive Modal: Detail Program Studi */}
      {selectedProdi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-7 relative animate-scaleUp">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProdi(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              aria-label={t.prodiSection.tutup}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 pr-6">
              <span
                className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded border ${selectedProdi.badgeColor}`}
              >
                {selectedProdi.badge}
              </span>
              <h3 className="text-2xl font-bold text-slate-900">
                {selectedProdi.nama}
              </h3>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md">
                  {selectedProdi.jenjang}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md">
                  {selectedProdi.gelar}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-md">
                  {selectedProdi.akreditasi}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">
              {selectedProdi.deskripsi}
            </p>

            {/* Profil Lulusan / Prospek Karir */}
            <div className="mt-5 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-700" />
                <span>{t.prodiSection.prospekKarir}</span>
              </h4>
              <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                {selectedProdi.profilLulusan.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mata Kuliah Unggulan */}
            <div className="mt-5 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>{t.prodiSection.mataKuliah}</span>
              </h4>
              <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                {selectedProdi.mataKuliahUnggulan.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-7 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={() => setSelectedProdi(null)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                {t.prodiSection.tutup}
              </button>
              <Link
                href="/pendaftaran"
                onClick={() => setSelectedProdi(null)}
                className="w-full sm:w-auto px-5 py-2 text-sm font-bold text-white bg-[#0e3831] hover:bg-[#165349] rounded-lg shadow-sm transition inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.prodiSection.daftarProdiIni}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
