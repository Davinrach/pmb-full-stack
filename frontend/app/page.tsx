"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Home,
  CheckCircle2,
  Phone,
  IdCard,
  Headphones,
  Briefcase,
  BookOpen,
  X,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  FileText,
  Mail,
  Calendar,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

export default function HomePage() {
  const { t, lang } = useLanguage();
  const [selectedProdi, setSelectedProdi] = useState<any | null>(null);
  const [backendSettings, setBackendSettings] = useState<any>(null);
  const [masterProdis, setMasterProdis] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [persyaratanList, setPersyaratanList] = useState<string[]>([]);
  const [backendPersyaratanDocs, setBackendPersyaratanDocs] = useState<any[]>([]);
  const [backendHotlines, setBackendHotlines] = useState<any[]>([]);
  const [dynamicJalurList, setDynamicJalurList] = useState<any[]>([]);
  const [gelombangList, setGelombangList] = useState<any[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/public/settings"),
      api.get("/info-pmb"),
      api.get("/faqs"),
    ])
      .then(([setRes, infoRes, faqRes]) => {
        const setVal = (setRes as any)?.data || setRes;
        const infoVal = (infoRes as any)?.data || infoRes;

        // Merge settings from both public/settings and info-pmb so no keys are missed
        const mergedSettings = {
          ...(infoVal?.settings || {}),
          ...(setVal || {}),
        };
        if (infoVal?.jalur_pendaftaran_info && !mergedSettings.jalur_pendaftaran_info) {
          mergedSettings.jalur_pendaftaran_info = infoVal.jalur_pendaftaran_info;
        }
        if (infoVal?.settings?.homepage_prodi_list && !mergedSettings.homepage_prodi_list) {
          mergedSettings.homepage_prodi_list = infoVal.settings.homepage_prodi_list;
        }
        setBackendSettings(mergedSettings);

        if (infoVal?.program_studi && Array.isArray(infoVal.program_studi)) {
          setMasterProdis(infoVal.program_studi);
        }
        if (infoVal?.persyaratan) setPersyaratanList(infoVal.persyaratan);
        if (infoVal?.persyaratan_dokumen && Array.isArray(infoVal.persyaratan_dokumen)) {
          setBackendPersyaratanDocs(infoVal.persyaratan_dokumen);
        }
        if (infoVal?.hotline && Array.isArray(infoVal.hotline)) {
          setBackendHotlines(infoVal.hotline);
        }
        if (infoVal?.jalur_pendaftaran && Array.isArray(infoVal.jalur_pendaftaran)) {
          setDynamicJalurList(infoVal.jalur_pendaftaran);
        }
        if (infoVal?.gelombang && Array.isArray(infoVal.gelombang)) {
          setGelombangList(infoVal.gelombang);
        }

        const faqVal = (faqRes as any)?.data || faqRes;
        if (faqVal && Array.isArray(faqVal)) {
          setFaqs(faqVal);
          if (faqVal.length > 0) {
            setExpandedFaqId(faqVal[0].id);
          }
        } else if (infoVal?.faq) {
          setFaqs(infoVal.faq);
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

  // Parse Homepage Prodi List from CMS or fallback
  let displayedProdiList: any[] = [];
  const prodiRaw = backendSettings?.homepage_prodi_list;
  if (prodiRaw) {
    try {
      const parsed = typeof prodiRaw === "string" ? JSON.parse(prodiRaw) : prodiRaw;
      if (Array.isArray(parsed) && parsed.length > 0) {
        displayedProdiList = parsed;
      }
    } catch {}
  }

  if (masterProdis.length > 0 && displayedProdiList.length > 0) {
    // If master prodis loaded, remove any prodi that was deleted or inactive from homepage
    displayedProdiList = displayedProdiList.filter((dp) => {
      const found = masterProdis.find(
        (mp) => String(mp.id) === String(dp.prodi_id) || mp.kode?.toUpperCase() === dp.kode?.toUpperCase()
      );
      return found ? (found.is_aktif ?? true) : false;
    });
  }

  if (displayedProdiList.length === 0 && masterProdis.length > 0) {
    displayedProdiList = masterProdis.map((p) => ({
      prodi_id: p.id,
      kode: p.kode,
      nama: p.nama,
      deskripsi_singkat: p.deskripsi,
      badge_jenjang: p.jenjang ? `Jenjang ${p.jenjang}` : "Jenjang S1",
      badge_gelar: p.gelar_akademik ? `Gelar ${p.gelar_akademik}` : undefined,
      badge_akreditasi: "Terakreditasi BAN-PT",
    }));
  }
  if (displayedProdiList.length === 0) {
    displayedProdiList = [
      {
        prodi_id: 1,
        kode: "MPI",
        nama: "S1 Manajemen Pendidikan Islam",
        deskripsi_singkat: "Fokus pada tata kelola kelembagaan pendidikan Islam, kepemimpinan transformasional, dan sistem administrasi madrasah modern.",
        badge_jenjang: "Jenjang S1",
        badge_gelar: "Gelar Sarjana Pendidikan (S.Pd.)",
        badge_akreditasi: "Terakreditasi BAN-PT",
      },
      {
        prodi_id: 2,
        kode: "AS",
        nama: "S1 Ahwal Al-Syakhsiyah (Hukum Keluarga Islam)",
        deskripsi_singkat: "Mendalami hukum perdata Islam, kepengacaraan syariah, mediasi sengketa keluarga, serta administrasi KUA dan Pengadilan Agama.",
        badge_jenjang: "Jenjang S1",
        badge_gelar: "Gelar Sarjana Hukum (S.H.)",
        badge_akreditasi: "Terakreditasi BAN-PT",
      },
      {
        prodi_id: 3,
        kode: "KPI",
        nama: "S1 Komunikasi dan Penyiaran Islam",
        deskripsi_singkat: "Melahirkan praktisi media, jurnalis cyber, broadcaster, content creator, dan humas profesional berbasis nilai Islam.",
        badge_jenjang: "Jenjang S1",
        badge_gelar: "Gelar Sarjana Sosial (S.Sos.)",
        badge_akreditasi: "Terakreditasi BAN-PT",
      },
    ];
  }

  // Gelombang Pendaftaran logic matching reference Admission Schedule
  const formatGelombangRange = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return "-";
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return `${startStr} - ${endStr}`;
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    if (start.getFullYear() === end.getFullYear()) {
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}`;
      }
      return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${months[start.getMonth()]} ${start.getFullYear()} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  };

  const getGelombangStatus = (g: any) => {
    const now = new Date();
    const start = new Date(g.tanggal_buka);
    const end = new Date(g.tanggal_tutup);
    if (now < start) {
      return {
        label: "Akan Datang",
        badgeClass: "border border-slate-200 text-slate-600 bg-slate-100/80",
        isOpen: false,
        isUpcoming: true,
      };
    }
    if (now > end || g.is_aktif === false) {
      return {
        label: "Ditutup",
        badgeClass: "border border-slate-200 text-slate-500 bg-slate-50",
        isOpen: false,
        isUpcoming: false,
      };
    }
    return {
      label: "Sedang Dibuka",
      badgeClass: "border border-emerald-300 text-emerald-800 bg-emerald-50/80 font-semibold",
      isOpen: true,
      isUpcoming: false,
    };
  };

  const defaultGelombangList = [
    {
      id: 1,
      nama: "Pendaftaran Gelombang 1 - TA 2026/2027",
      tanggal_buka: "2026-05-01T00:00:00Z",
      tanggal_tutup: "2026-07-31T23:59:59Z",
      is_aktif: false,
      jenjang: "Sarjana (S1)",
    },
    {
      id: 2,
      nama: "Pendaftaran Gelombang 2 - TA 2026/2027",
      tanggal_buka: "2026-08-01T00:00:00Z",
      tanggal_tutup: "2026-11-30T23:59:59Z",
      is_aktif: true,
      jenjang: "Sarjana (S1)",
    },
    {
      id: 3,
      nama: "Pendaftaran Gelombang 3 - TA 2026/2027",
      tanggal_buka: "2026-12-01T00:00:00Z",
      tanggal_tutup: "2027-02-28T23:59:59Z",
      is_aktif: false,
      jenjang: "Sarjana (S1)",
    },
  ];

  const displayedGelombang = gelombangList.length > 0 ? gelombangList : defaultGelombangList;
  const currentTahunAkademik =
    displayedGelombang.find((g: any) => g.is_aktif)?.tahun_akademik ||
    displayedGelombang[0]?.tahun_akademik ||
    backendSettings?.tahun_akademik ||
    "2026/2027";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-950">
      {/* 1. Header / Navbar */}
      <Navbar activePage="beranda" />

      {/* 2. Modern Hero / Banner Section */}
      <section
        id="beranda"
        className="relative w-full min-h-[500px] md:min-h-[560px] lg:min-h-[600px] flex items-center bg-white overflow-hidden border-b border-slate-200/70"
      >
        {/* Right Photo with Soft Feathered Gradient Overlay */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[62%] xl:w-[60%] z-0 overflow-hidden">
          <Image
            src="/banner-staici.png"
            alt="Mahasiswa STAI Cendekia Insani Situbondo"
            fill
            priority
            unoptimized
            className="object-cover object-[center_15%] lg:object-[left_center]"
          />
          {/* Smooth horizontal gradient from solid white on the left into the photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 md:via-white/50 lg:via-white/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent md:hidden" />

          {/* Faint modern architectural line art accents (inspired by IUP banner) */}
          <div className="absolute inset-0 pointer-events-none opacity-20 hidden md:block">
            <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="720" cy="480" r="130" stroke="#0d3830" strokeWidth="1.5" strokeDasharray="5 5" />
              <rect x="620" y="70" width="90" height="90" rx="18" stroke="#0d3830" strokeWidth="1.5" />
              <path d="M480,240 Q620,180 740,320" stroke="#0d3830" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Content Container on the Left */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-black text-slate-900 tracking-tight leading-[1.15]">
              {lang === "eng" ? (
                <>
                  New Student Admission<br />
                  Center<br />
                  <span className="text-[#0d3830] font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[40px] block mt-2 sm:mt-3 leading-snug">
                    {t.hero.titleHighlight}
                  </span>
                </>
              ) : (
                <>
                  Pusat Pendaftaran<br />
                  Mahasiswa Baru<br />
                  <span className="text-[#0d3830] font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[40px] block mt-2 sm:mt-3 leading-snug">
                    {t.hero.titleHighlight}
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle / Description */}
            <p className="mt-5 sm:mt-6 text-slate-600 text-sm sm:text-base md:text-lg font-normal leading-relaxed">
              {bannerSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Main Content Section (Full-width Layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        {/* Profil / Nilai STAI Cendekia Insani (Full-width Grid Section) */}
        <section id="keunggulan" className="space-y-6 scroll-mt-28">
          <div className="border-b border-slate-200/80 pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
                STAI Cendekia Insani Situbondo
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
              {lang === "eng"
                ? "Commitment to providing superior, character-driven Islamic higher education in Situbondo."
                : "Alasan utama dan komitmen kami dalam menghadirkan pendidikan tinggi Islam yang unggul, berkarakter, dan berdaya saing."}
            </p>
          </div>

          {/* Grid Keunggulan 4 Kolom Responsif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {(lang === "eng"
              ? [
                  {
                    title: "Academic & Islamic Character",
                    desc: "Standard degree curriculum with strong santri ethical foundation.",
                  },
                  {
                    title: "Qur'an & Classical Studies",
                    desc: "Tahfidz reinforcement and Arabic classical text literacy.",
                  },
                  {
                    title: "Flexible Schedules",
                    desc: "Adaptive classes ideal for workers and madrasah teachers.",
                  },
                  {
                    title: "Affordable & Scholarships",
                    desc: "Low-cost tuition, KIP-Kuliah, Tahfidz & Merit scholarships.",
                  },
                ]
              : [
                  {
                    title: "Akademik & Karakter Islami",
                    desc: "Kurikulum sarjana terakreditasi berpadu adab & nilai kepesantrenan.",
                  },
                  {
                    title: "Kajian Qur'an & Kitab Kuning",
                    desc: "Penguatan tahfidz, bahasa Arab, dan literasi keagamaan.",
                  },
                  {
                    title: "Jadwal Kuliah Fleksibel",
                    desc: "Pilihan kelas adaptif bagi pekerja, guru madrasah & honorer.",
                  },
                  {
                    title: "Biaya Terjangkau & Beasiswa",
                    desc: "Akses beasiswa KIP-Kuliah, jalur Tahfidz, serta Prestasi.",
                  },
                ]
            ).map((item, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug group-hover:text-emerald-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Program Studi Unggulan (Full-width) */}
        <section id="program-studi" className="mt-14 space-y-6 scroll-mt-28 lg:scroll-mt-32">
            {/* Section Header */}
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
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
              {displayedProdiList.map((prodi: any, idx: number) => {
                const master = masterProdis.find(
                  (mp) => String(mp.id) === String(prodi.prodi_id) || mp.kode === prodi.kode
                );
                const isEng = lang === "eng";
                const title = isEng && (prodi.nama_en || master?.nama_en) ? (prodi.nama_en || master?.nama_en) : (prodi.nama || master?.nama || "Program Studi");
                const kode = prodi.kode || master?.kode || "";
                const slug = (kode || String(prodi.prodi_id || idx + 1)).toLowerCase();
                const deskripsi = isEng && (prodi.deskripsi_singkat_en || master?.deskripsi_en) ? (prodi.deskripsi_singkat_en || master?.deskripsi_en) : (prodi.deskripsi_singkat || prodi.deskripsi || master?.deskripsi || "");
                const badgeJenjang = isEng && prodi.badge_jenjang_en ? prodi.badge_jenjang_en : (prodi.badge_jenjang || (master?.jenjang ? (isEng ? `Level ${master.jenjang}` : `Jenjang ${master.jenjang}`) : (isEng ? "Undergraduate (S1)" : "Jenjang S1")));
                const badgeGelar = isEng && prodi.badge_gelar_en ? prodi.badge_gelar_en : (prodi.badge_gelar || (master?.gelar_akademik ? (isEng && master?.gelar_akademik_en ? `Degree ${master.gelar_akademik_en}` : `Gelar ${master.gelar_akademik}`) : undefined));
                const badgeAkreditasi = isEng && prodi.badge_akreditasi_en ? prodi.badge_akreditasi_en : (prodi.badge_akreditasi || (isEng ? "Accredited by BAN-PT" : "Terakreditasi BAN-PT"));

                return (
                  <div
                    key={prodi.prodi_id || idx}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
                  >
                    <div className="space-y-2.5 max-w-xl">
                      {/* Badge Kode Prodi */}
                      {kode && (
                        <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded border text-[#0d3830] bg-slate-50 border-slate-200">
                          {kode}
                        </span>
                      )}

                      {/* Prodi Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#0d3830] transition-colors">
                        {title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {deskripsi}
                      </p>

                      {/* 3 Badges: Jenjang S1, Gelar, Akreditasi BAN-PT */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {badgeJenjang && (
                          <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md border border-slate-200/80">
                            {badgeJenjang}
                          </span>
                        )}
                        {badgeGelar && (
                          <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100/90 rounded-md border border-slate-200/80">
                            {badgeGelar}
                          </span>
                        )}
                        {badgeAkreditasi && (
                          <span className="px-2.5 py-1 text-xs font-semibold text-emerald-900 bg-emerald-50/80 rounded-md border border-emerald-200/60">
                            {badgeAkreditasi}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="sm:self-center flex-shrink-0">
                      <Link
                        href={`/program-studi/${slug}`}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white bg-[#0e3831] hover:bg-[#165349] rounded-lg shadow-sm transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{t.prodiSection.lihatDetail}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        {/* 4. Jadwal Gelombang Pendaftaran PMB (Bahasa Indonesia & Warna Selaras Identitas Kampus) */}
        <section id="gelombang-pendaftaran" className="mt-14 space-y-4 scroll-mt-28">
          {/* Header Title Bahasa Indonesia */}
          <div className="border-b border-slate-200/80 pb-3">
            <span className="text-xs font-bold tracking-wider text-[#0d3830] uppercase px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/70 inline-block mb-1.5">
              Jadwal Seleksi PMB
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
                Gelombang Pendaftaran Mahasiswa Baru
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-slate-500">
                Program Sarjana (S1) • TA {currentTahunAkademik}
              </span>
            </div>
          </div>

          {/* Table / List Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {displayedGelombang.map((g: any, idx: number) => {
              const status = getGelombangStatus(g);
              const dateRange = formatGelombangRange(g.tanggal_buka, g.tanggal_tutup);
              const isEng = lang === "eng";
              const rawName = isEng && g.nama_en ? g.nama_en : g.nama;
              const displayName = rawName?.startsWith("Pendaftaran") || rawName?.startsWith("Admission") || rawName?.startsWith("Registration")
                ? rawName
                : (isEng ? `Admission ${rawName || "Wave " + (idx + 1)}` : `Pendaftaran ${rawName || "Gelombang " + (idx + 1)}`);

              return (
                <div
                  key={g.id || idx}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Bagian Kiri: Tanggal + Status Badge + Nama Gelombang */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 flex-1">
                    {/* Tanggal dengan Icon Kalender Berwarna Emerald Kampus */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 whitespace-nowrap min-w-[190px]">
                      <Calendar className="w-4 h-4 text-[#0d3830] flex-shrink-0" />
                      <span>{dateRange}</span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-xs px-3 py-1 rounded-lg border font-medium whitespace-nowrap flex-shrink-0 ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>

                    {/* Pembatas pipa */}
                    <span className="hidden sm:inline-block text-slate-300 font-light">|</span>

                    {/* Nama Pendaftaran */}
                    <span className="text-xs sm:text-sm font-medium text-slate-800">
                      {displayName}
                    </span>
                  </div>

                  {/* Bagian Kanan: Badge Jenjang & Tombol Aksi */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <span className="px-4 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                      {g.jenjang || "Sarjana (S1)"}
                    </span>

                    {status.isOpen ? (
                      <Link
                        href="/daftar"
                        className="px-5 py-1.5 text-xs font-bold rounded-full bg-[#0d3830] hover:bg-[#165349] text-white transition-all shadow-xs whitespace-nowrap border border-[#0d3830]"
                      >
                        Daftar Sekarang
                      </Link>
                    ) : status.isUpcoming ? (
                      <span className="px-5 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap cursor-default">
                        Belum Dibuka
                      </span>
                    ) : (
                      <span className="px-5 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-400 border border-slate-200 whitespace-nowrap cursor-default">
                        Ditutup
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Interactive Dynamic FAQ Section */}
        <section id="faq" className="mt-16 pt-10 border-t border-slate-200/80 space-y-8 scroll-mt-28 lg:scroll-mt-32">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold tracking-wider text-slate-600 uppercase px-3 py-1 bg-slate-100 rounded-full border border-slate-200/80 inline-block">
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
                    isOpen ? "border-[#0d3830]/30 shadow-xs ring-1 ring-[#0d3830]/10" : "border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                        {faq.kategori || "Umum"}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {lang === "eng" && faq.pertanyaan_en ? faq.pertanyaan_en : faq.pertanyaan}
                      </h4>
                    </div>
                    <div
                      className={`p-1.5 rounded-lg text-slate-500 transition-transform flex-shrink-0 ${
                        isOpen ? "rotate-180 text-[#0d3830] bg-slate-100" : "bg-slate-50"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80 animate-fadeIn whitespace-pre-line">
                      {lang === "eng" && faq.jawaban_en ? faq.jawaban_en : faq.jawaban}
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d3830]/80 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mata Kuliah Unggulan */}
            <div className="mt-5 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0d3830]" />
                <span>{t.prodiSection.mataKuliah}</span>
              </h4>
              <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                {selectedProdi.mataKuliahUnggulan.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
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
