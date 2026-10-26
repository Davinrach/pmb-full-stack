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
  Award,
  GraduationCap,
  Mail,
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

  // Parse Jalur Masuk Cards from CMS settings or dynamic database table or fallback
  let displayedJalurList: any[] = [];
  const jalurRaw = backendSettings?.jalur_pendaftaran_info;
  if (jalurRaw) {
    try {
      const parsed = typeof jalurRaw === "string" ? JSON.parse(jalurRaw) : jalurRaw;
      if (Array.isArray(parsed) && parsed.length > 0) {
        displayedJalurList = parsed.filter((j: any) => j.is_aktif ?? true);
      }
    } catch {}
  }
  if (displayedJalurList.length === 0 && dynamicJalurList.length > 0) {
    displayedJalurList = dynamicJalurList
      .filter((j: any) => (j.tampil_di_homepage ?? true) && (j.is_aktif ?? true))
      .map((j: any) => ({
        id: j.kode || String(j.id),
        jalur_id: j.id,
        nama: j.nama,
        badge: j.badge_text || j.nama,
        deskripsi: j.deskripsi,
        is_aktif: j.is_aktif ?? true,
      }));
  }
  if (displayedJalurList.length === 0) {
    displayedJalurList = [
      {
        id: "reguler",
        nama: "Jalur Masuk Reguler (Mandiri)",
        badge: "Jalur Reguler",
        deskripsi: "Terbuka bagi seluruh lulusan SMA/MA/SMK/Pondok Pesantren sederajat tanpa batasan tahun kelulusan. Proses seleksi administrasi berkas dan wawancara mandiri.",
        is_aktif: true,
      },
      {
        id: "kip",
        nama: "Jalur Beasiswa KIP-Kuliah (Pemerintah)",
        badge: "Beasiswa KIP-Kuliah",
        deskripsi: "Khusus bagi calon mahasiswa berprestasi dari keluarga pemegang KIP/KKS/PKH atau terdata dalam DTKS Kemensos RI. Bebas biaya pendaftaran dan subsidi UKT penuh.",
        is_aktif: true,
      },
    ];
  }

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

      {/* 3. Main Content Section (Grid Layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Program Studi Unggulan (col-span-8) */}
          <section id="program-studi" className="lg:col-span-8 space-y-6 scroll-mt-28 lg:scroll-mt-32">
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
                const title = prodi.nama || master?.nama || "Program Studi";
                const kode = prodi.kode || master?.kode || "";
                const slug = (kode || String(prodi.prodi_id || idx + 1)).toLowerCase();
                const deskripsi = prodi.deskripsi_singkat || prodi.deskripsi || master?.deskripsi || "";
                const badgeJenjang = prodi.badge_jenjang || (master?.jenjang ? `Jenjang ${master.jenjang}` : "Jenjang S1");
                const badgeGelar = prodi.badge_gelar || (master?.gelar_akademik ? `Gelar ${master.gelar_akademik}` : undefined);
                const badgeAkreditasi = prodi.badge_akreditasi || "Terakreditasi BAN-PT";

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

          {/* RIGHT COLUMN: Keunggulan STAICI & Hotline Narahubung (col-span-4) */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Card 1 (ATAS): Keunggulan Kampus STAI Cendekia Insani */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Award className="w-4.5 h-4.5 text-emerald-700" />
                </div>
                <h3>{lang === "eng" ? "STAICI Core Advantages" : "Keunggulan STAI Cendekia Insani"}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {lang === "eng"
                  ? "Integrating Islamic scholarship and moral development with professional career readiness in education and socio-religious sectors."
                  : "Fokus pada integrasi nilai keislaman dan kesiapan kerja profesional di bidang kependidikan Islam serta sosial-keagamaan."}
              </p>

              {/* List Keunggulan (Ringkas & Soft) */}
              <div className="space-y-2.5 pt-1">
                {(lang === "eng"
                  ? [
                      {
                        title: "Academic & Moral Integration",
                        desc: "Blending standardized higher education curriculum with spiritual values and solid character building.",
                        icon: <GraduationCap className="w-4 h-4 text-emerald-700" />,
                      },
                      {
                        title: "Qur'anic & Religious Reinforcement",
                        desc: "Qur'anic literacy, tahfidz, Arabic language, and classical text studies as the core student competence.",
                        icon: <BookOpen className="w-4 h-4 text-emerald-700" />,
                      },
                      {
                        title: "Flexible Class Schedules",
                        desc: "Adaptive learning schemes tailored for workers, madrasah teachers, and honorary staff.",
                        icon: <Clock className="w-4 h-4 text-emerald-700" />,
                      },
                      {
                        title: "Affordable Tuition & Scholarships",
                        desc: "Budget-friendly tuition supported by Tahfidz, Merit, and government KIP-Kuliah scholarships.",
                        icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
                      },
                      {
                        title: "Practical & Targeted Community Service",
                        desc: "Hands-on real-world experience through teaching practice, partner internships, and community empowerment.",
                        icon: <Briefcase className="w-4 h-4 text-emerald-700" />,
                      },
                    ]
                  : [
                      {
                        title: "Integrasi Keilmuan & Pembinaan Akhlak",
                        desc: "Memadukan kurikulum akademik standar dengan penanaman nilai spiritual dan karakter santri yang kuat.",
                        icon: <GraduationCap className="w-4 h-4 text-emerald-700" />,
                      },
                      {
                        title: "Penguatan Al-Qur'an & Keagamaan",
                        desc: "Literasi Al-Qur'an, tahfidz, bahasa Arab, dan kajian kitab keagamaan sebagai fondasi utama kompetensi.",
                        icon: <BookOpen className="w-4 h-4 text-emerald-700" />,
                      },
                      {
                        title: "Fleksibilitas Waktu Perkuliahan",
                        desc: "Pilihan skema kelas adaptif dan ramah bagi pekerja, guru madrasah, serta tenaga honorer.",
                        icon: <Clock className="w-4 h-4 text-emerald-700" />,
                      },
                      {
                        title: "Biaya Terjangkau & Akses Beasiswa",
                        desc: "Biaya studi ramah kantong didukung beasiswa jalur Tahfidz, Prestasi, dan KIP-Kuliah pemerintah.",
                        icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
                      },
                      {
                        title: "Praktik Lapangan & Pengabdian Terarah",
                        desc: "Pengalaman praktis riil melalui praktik mengajar, magang instansi, dan KKN pemberdayaan masyarakat.",
                        icon: <Briefcase className="w-4 h-4 text-emerald-700" />,
                      },
                    ]
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-emerald-50/30 hover:border-emerald-100/70 transition group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center flex-shrink-0 mt-0.5 text-emerald-700 shadow-2xs group-hover:scale-105 transition-transform">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* 4. Pilihan Jalur Masuk (Grid Card: Reguler & KIP Kuliah) */}
        <section id="jalur-masuk" className="mt-12 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-700 uppercase px-2.5 py-1 bg-slate-100 rounded-full border border-slate-200/80">
                Pilihan Jalur Masuk
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                Jalur Penerimaan Mahasiswa Baru
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md">
              Pilih jalur pendaftaran yang sesuai dengan kualifikasi dan kebutuhan studi Anda di STAI Cendekia Insani.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedJalurList.map((jalur: any, idx: number) => {
              const masterJalur = dynamicJalurList.find(
                (dj) => String(dj.id) === String(jalur.jalur_id || jalur.id) || dj.kode === jalur.kode
              );
              const cardNama = jalur.nama || masterJalur?.nama || "Jalur Pendaftaran";
              const isKip = jalur.id === "kip" || cardNama.toLowerCase().includes("kip");
              const cardBadge = jalur.badge || masterJalur?.badge_text || (isKip ? "Beasiswa KIP-Kuliah" : "Jalur Reguler");
              const cardDesc = jalur.deskripsi || masterJalur?.deskripsi || "";

              return (
                <div
                  key={jalur.id || idx}
                  className={`rounded-2xl border p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between relative overflow-hidden bg-white ${
                    isKip
                      ? "border-amber-200/70 hover:border-amber-300/80"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Badge & Icon */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          isKip
                            ? "bg-amber-50/70 text-amber-900 border-amber-200/60"
                            : "bg-slate-100 text-slate-800 border-slate-200/80"
                        }`}
                      >
                        {cardBadge}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          isKip
                            ? "bg-amber-50 text-amber-800 border-amber-100"
                            : "bg-slate-50 text-slate-700 border-slate-200/70"
                        }`}
                      >
                        {isKip ? <Award className="w-5 h-5 text-amber-700" /> : <GraduationCap className="w-5 h-5 text-[#0d3830]" />}
                      </div>
                    </div>

                    {/* Card Title & Desc */}
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {cardNama}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {cardDesc}
                    </p>
                  </div>

                  {/* Card Action */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      Status: <span className="text-[#0d3830] font-bold">Pendaftaran Aktif</span>
                    </span>
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 shadow-xs bg-[#0e3831] hover:bg-[#165349] text-white"
                    >
                      <span>Daftar Jalur Ini</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
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
                        {faq.pertanyaan}
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
                href="/dashboard"
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
