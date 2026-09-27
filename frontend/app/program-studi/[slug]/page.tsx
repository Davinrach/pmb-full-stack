"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import {
  Home,
  Phone,
  Clock,
  Headphones,
  ChevronRight,
} from "lucide-react";
import { getProdiDetail } from "@/lib/prodi-data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DetailProdiPage({ params }: PageProps) {
  const { slug } = use(params);
  const { t, lang } = useLanguage();
  const prodi = getProdiDetail(slug, lang);

  if (!prodi) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-emerald-200 selection:text-emerald-950 font-sans">
      {/* 1. Header / Navbar */}
      <Navbar activePage="program-studi" />

      {/* 2. Hero / Banner Section */}
      <section className="relative w-full min-h-[200px] sm:min-h-[240px] md:min-h-[270px] flex items-center overflow-hidden bg-[#0c2f29]">
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
          {/* Dark Teal Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a2f28]/95 via-[#0e3b33]/90 to-[#07241e]/85 backdrop-blur-[1px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200/90 mb-4">
            <Home className="w-3.5 h-3.5" />
            <Link href="/" className="hover:underline">
              {t.navbar.beranda}
            </Link>
            <span>/</span>
            <span className="text-white">{t.navbar.programStudi}</span>
          </nav>

          {/* Dynamic H1 Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm font-serif">
            {prodi.title}
          </h1>
        </div>
      </section>

      {/* 3. Main Content Section (Grid Layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
          {/* LEFT COLUMN: Main Prodi Detail (col-span-8) */}
          <article className="lg:col-span-8 space-y-8 text-slate-700">
            {/* Intro Paragraph */}
            <p className="text-xs sm:text-sm md:text-[15px] leading-relaxed text-slate-700 font-normal">
              {prodi.intro}
            </p>

            {/* Section 1: Profil Lulusan & Prospek Karir */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                {lang === "eng" ? "Graduate Profiles & Career Prospects" : "Profil Lulusan & Prospek Karir"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {prodi.profilLulusanIntro}
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 list-disc pl-5 marker:text-slate-700">
                {prodi.profilLulusan.map((item, idx) => (
                  <li key={idx} className="pl-1 leading-relaxed">
                    <strong className="font-bold text-slate-900">
                      {item.title}:
                    </strong>{" "}
                    <span>{item.desc}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 2: Capaian Pembelajaran & Keunggulan */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                {lang === "eng" ? "Learning Outcomes & Program Strengths" : "Capaian Pembelajaran & Keunggulan"}
              </h2>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 list-disc pl-5 marker:text-slate-700">
                {prodi.capaianPembelajaran.map((item, idx) => (
                  <li key={idx} className="pl-1 leading-relaxed">
                    <strong className="font-bold text-slate-900">
                      {item.title}:
                    </strong>{" "}
                    <span>{item.desc}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 3: Gelar Akademik */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                {lang === "eng" ? "Academic Degree" : "Gelar Akademik"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {prodi.gelarAkademik}
              </p>
            </section>

            {/* Centered CTA Button */}
            <div className="pt-6 sm:pt-10 flex justify-center">
              <Link
                href="/pendaftaran"
                className="px-8 py-3.5 bg-[#0e3831] hover:bg-[#165349] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === "eng" ? "Apply Now" : "Daftar Sekarang"}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </article>

          {/* RIGHT COLUMN: Hotline Sidebar Card (col-span-4) */}
          <aside className="lg:col-span-4 space-y-6">
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
                href="https://wa.me/6285233432221?text=Halo%20Panitia%20PMB%20STAICI,%20saya%20ingin%20berkonsultasi%20terkait%20program%20studi"
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
                    0852-3343-2221
                  </span>
                </div>
              </a>

              {/* Operating Hours */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.sidebar.operatingHours}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* 4. Footer Section */}
      <Footer />
    </div>
  );
}
