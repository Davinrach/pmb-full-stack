"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import {
  Home,
  Phone,
  Clock,
  Headphones,
  ChevronRight,
  Mail,
} from "lucide-react";
import { getProdiDetail } from "@/lib/prodi-data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";
import { api } from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DetailProdiPage({ params }: PageProps) {
  const { slug } = use(params);
  const { t, lang } = useLanguage();
  const [backendSettings, setBackendSettings] = useState<any>(null);
  const [backendProdi, setBackendProdi] = useState<any>(null);
  const [backendTataCara, setBackendTataCara] = useState<any[]>([]);
  const [backendHotline, setBackendHotline] = useState<any[]>([]);
  const staticProdi = getProdiDetail(slug, lang);
  const [isLoading, setIsLoading] = useState(!staticProdi);
  const [hasCheckedBackend, setHasCheckedBackend] = useState(false);

  useEffect(() => {
    api.get("/public/settings")
      .then((res) => {
        const val = (res as any)?.data || res;
        if (val) setBackendSettings(val);
      })
      .catch(() => {});

    api.get(`/program-studi/${slug}`)
      .then((res) => {
        const val = (res as any)?.data?.data || (res as any)?.data;
        if (val) {
          setBackendProdi(val);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
        setHasCheckedBackend(true);
      });

    api.get("/tata-cara")
      .then((res) => {
        const val = (res as any)?.data?.data || (res as any)?.data;
        if (Array.isArray(val) && val.length > 0) {
          setBackendTataCara(val);
        }
      })
      .catch(() => {});

    api.get("/info-pmb")
      .then((res) => {
        const val = (res as any)?.data || res;
        if (val?.hotline && Array.isArray(val.hotline)) {
          setBackendHotline(val.hotline);
        }
        if (val?.settings) {
          setBackendSettings((prev: any) => ({ ...(prev || {}), ...val.settings }));
        }
      })
      .catch(() => {});

    api.get("/hotline")
      .then((res) => {
        const val = (res as any)?.data?.data || (res as any)?.data;
        if (Array.isArray(val) && val.length > 0) {
          setBackendHotline(val);
        }
      })
      .catch(() => {});
  }, [slug]);

  // Loading skeleton while fetching dynamic prodi from backend
  if (isLoading && !staticProdi && !backendProdi) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar activePage="program-studi" />
        <section className="relative w-full min-h-[220px] flex items-center bg-[#0c2f29]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-pulse">
            <div className="h-4 w-32 bg-emerald-800/60 rounded mb-4" />
            <div className="h-8 sm:h-10 w-64 sm:w-96 bg-emerald-700/60 rounded" />
          </div>
        </section>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-5/6" />
              <div className="h-4 bg-slate-200 rounded w-4/6" />
              <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200 mt-6" />
            </div>
            <div className="lg:col-span-4 space-y-4 animate-pulse">
              <div className="h-48 bg-slate-100 rounded-2xl border border-slate-200" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (hasCheckedBackend && !staticProdi && !backendProdi) {
    notFound();
  }

  // Dynamic CMS Fallback mapping
  let displayTitle = staticProdi?.title || backendProdi?.nama || "Program Studi";
  let displayIntro =
    backendProdi?.deskripsi ||
    staticProdi?.intro ||
    `Program Studi ${displayTitle} STAI Cendekia Insani Situbondo menyelenggarakan pendidikan akademik jenjang ${backendProdi?.jenjang || "S1"} yang unggul, profesional, dan berintegritas berlandaskan nilai-nilai keislaman serta keilmuan kontemporer.`;

  let displayGelarRaw = backendProdi?.gelar_akademik || staticProdi?.gelarAkademik || (backendProdi?.jenjang === "S1" || !backendProdi?.jenjang ? "Sarjana (S.Pd. / S.H. / S.Sos. / S.Ag.)" : "-");
  let displayGelar = displayGelarRaw;
  if (
    displayGelarRaw !== "-" &&
    !displayGelarRaw.toLowerCase().startsWith("lulusan") &&
    !displayGelarRaw.toLowerCase().startsWith("graduates")
  ) {
    displayGelar =
      lang === "eng"
        ? `Graduates of ${displayTitle} Program will obtain the academic degree ${displayGelarRaw}.`
        : `Lulusan Program Studi ${displayTitle} akan memperoleh gelar akademik ${displayGelarRaw}.`;
  }

  let displayProfilIntro =
    backendProdi?.profil_lulusan_intro ||
    staticProdi?.profilLulusanIntro ||
    `Lulusan Program Studi ${displayTitle} STAI Cendekia Insani Situbondo memiliki prospek karir yang luas di berbagai sektor:`;

  let displayProfilList: { title: string; desc: string }[] = staticProdi?.profilLulusan || [];
  if (backendProdi?.profil_lulusan) {
    try {
      const parsed = typeof backendProdi.profil_lulusan === "string" ? JSON.parse(backendProdi.profil_lulusan) : backendProdi.profil_lulusan;
      if (Array.isArray(parsed) && parsed.length > 0) displayProfilList = parsed;
    } catch {}
  }
  if (displayProfilList.length === 0) {
    displayProfilList = [
      {
        title: "Praktisi & Tenaga Ahli Profesional",
        desc: `Bekerja secara profesional di bidang keilmuan ${displayTitle} pada instansi pemerintah, BUMN, swasta, maupun lembaga keagamaan.`,
      },
      {
        title: "Pendidik & Akademisi",
        desc: `Mengabdi sebagai tenaga pendidik, instruktur, atau peneliti muda yang berdedikasi di berbagai institusi kependidikan.`,
      },
      {
        title: "Konsultan & Analis Bidang Terkait",
        desc: `Memberikan layanan konsultasi, evaluasi mutu, dan perumusan kebijakan di organisasi kemasyarakatan.`,
      },
      {
        title: "Wirausahawan & Sociopreneur",
        desc: `Membangun dan mengembangkan unit usaha mandiri berbasis pemberdayaan masyarakat dan teknologi modern.`,
      },
    ];
  }

  let displayCapaianList: { title: string; desc: string }[] = staticProdi?.capaianPembelajaran || [];
  if (backendProdi?.capaian_pembelajaran) {
    try {
      const parsed = typeof backendProdi.capaian_pembelajaran === "string" ? JSON.parse(backendProdi.capaian_pembelajaran) : backendProdi.capaian_pembelajaran;
      if (Array.isArray(parsed) && parsed.length > 0) displayCapaianList = parsed;
    } catch {}
  }
  if (displayCapaianList.length === 0) {
    displayCapaianList = [
      {
        title: "Integrasi Keilmuan & Nilai Keislaman",
        desc: `Menguasai landasan teori keilmuan modern yang dipadukan dengan akhlakul karimah dan karakter kepesantrenan.`,
      },
      {
        title: "Keahlian Praktis & Terapan",
        desc: `Mampu mengaplikasikan kompetensi terapan dan metodologi pemecahan masalah sesuai kebutuhan industri.`,
      },
      {
        title: "Kesiapan Karir & Daya Saing Global",
        desc: `Memiliki bekal soft skills, kepemimpinan transformasional, serta adaptabilitas terhadap kemajuan era digital.`,
      },
    ];
  }

  // Parse structured Tata Cara / Alur Pendaftaran (Global terpusat kampus)
  let displayAlurSteps: { no?: string | number; title: string; desc: string }[] = [];
  if (backendTataCara && backendTataCara.length > 0) {
    displayAlurSteps = backendTataCara.map((item: any, idx: number) => ({
      no: `${item.nomor_langkah || idx + 1}.`,
      title: item.judul || `Langkah ${idx + 1}`,
      desc: item.deskripsi || "",
    }));
  } else if (backendProdi?.alur_pendaftaran) {
    try {
      const parsed = typeof backendProdi.alur_pendaftaran === "string" ? JSON.parse(backendProdi.alur_pendaftaran) : backendProdi.alur_pendaftaran;
      if (Array.isArray(parsed) && parsed.length > 0) {
        displayAlurSteps = parsed.map((item: any, idx: number) => ({
          no: item.no ? `${item.no}.` : `${idx + 1}.`,
          title: item.title || `Langkah ${idx + 1}`,
          desc: item.desc || "",
        }));
      }
    } catch {
      // Fallback text split
      const lines = backendProdi.alur_pendaftaran.split("\n").filter((l: string) => l.trim());
      displayAlurSteps = lines.map((l: string, idx: number) => {
        const parts = l.split(" - ");
        if (parts.length > 1) {
          return {
            no: `${idx + 1}.`,
            title: parts[0].replace(/^\d+[\.\)]\s*/, ""),
            desc: parts.slice(1).join(" - "),
          };
        }
        return {
          no: `${idx + 1}.`,
          title: l.replace(/^\d+[\.\)]\s*/, ""),
          desc: "",
        };
      });
    }
  }
  if (displayAlurSteps.length === 0) {
    displayAlurSteps = t.sidebar.steps;
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
            {displayTitle}
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
              {displayIntro}
            </p>

            {/* Section 1: Profil Lulusan & Prospek Karir */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                {lang === "eng" ? "Graduate Profiles & Career Prospects" : "Profil Lulusan & Prospek Karir"}
              </h2>
              {displayProfilIntro && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {displayProfilIntro}
                </p>
              )}

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 list-disc pl-5 marker:text-slate-700">
                {displayProfilList.map((item, idx) => (
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
                {displayCapaianList.map((item, idx) => (
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
                {displayGelar}
              </p>
            </section>

            {/* Centered CTA Button */}
            <div className="pt-6 sm:pt-10 flex justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-3.5 bg-[#0e3831] hover:bg-[#165349] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === "eng" ? "Apply Now" : "Daftar Sekarang"}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </article>

          {/* RIGHT COLUMN: Tata Cara & Hotline Sidebar (col-span-4) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Card 1: Tata Cara Pendaftaran */}
            <div
              id="alur-pendaftaran"
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900">
                {t.sidebar.caraDaftarTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
                {t.sidebar.caraDaftarSubtitle}
              </p>

              <ol className="space-y-4 text-xs sm:text-sm text-slate-700">
                {displayAlurSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <span className="font-bold text-slate-900 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-[#0d3830] flex items-center justify-center text-xs font-mono font-black mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <strong className="text-slate-900 block font-bold text-xs sm:text-sm">
                        {step.title}
                      </strong>
                      {step.desc && (
                        <span className="text-slate-600 text-xs leading-relaxed block">
                          {step.desc}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Card 2: Hotline & Narahubung Panitia PMB (Seragam dengan Desain Card Page Pendaftaran) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Headphones className="w-5 h-5 text-amber-600" />
                <h3>Pusat Bantuan &amp; Narahubung PMB</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Butuh bantuan atau konsultasi pendaftaran Program Studi {displayTitle}? Hubungi tim panitia PMB resmi kami:
              </p>

              <div className="space-y-2.5">
                {(() => {
                  const seen = new Set<string>();
                  const activeList = (backendHotline.length > 0
                    ? backendHotline.filter((h: any) => h.is_aktif ?? true)
                    : [
                        {
                          id: "fb-wa",
                          nama_layanan: "WhatsApp Panitia PMB Center",
                          tipe_kontak: "whatsapp",
                          nomor_atau_email: backendSettings?.no_whatsapp_cs || "0852-3343-2221",
                        },
                        {
                          id: "fb-email",
                          nama_layanan: "Email Resmi PMB STAICI",
                          tipe_kontak: "email",
                          nomor_atau_email: backendSettings?.email_cs || "pmb@staicisitubondo.ac.id",
                        },
                      ]
                  ).filter((h: any) => {
                    const val = (h.nomor_atau_email || h.nomor_kontak || "").trim().toLowerCase();
                    if (!val || seen.has(val)) return false;
                    seen.add(val);
                    return true;
                  });

                  return activeList.map((h: any, idx: number) => {
                    const rawVal = (h.nomor_atau_email || h.nomor_kontak || "").trim();
                    const tipe = (h.tipe_kontak || h.channel || "").toLowerCase();
                    const isEmail = tipe === "email" || rawVal.includes("@");
                    const cleanNomor = rawVal.replace(/\D/g, "");
                    const isWa = !isEmail && (tipe.includes("wa") || cleanNomor.startsWith("08") || cleanNomor.startsWith("62"));

                    if (isEmail) {
                      return (
                        <a
                          key={h.id || idx}
                          href={`mailto:${rawVal}`}
                          className="flex items-center gap-3.5 p-3.5 bg-[#f0f6ff] hover:bg-[#e1eeff] rounded-2xl border border-blue-200 transition group cursor-pointer shadow-2xs"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            <Mail className="w-5 h-5 text-blue-200" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold text-slate-600 truncate">
                              {h.nama_layanan || "Email Resmi PMB STAICI"}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono truncate">
                              {rawVal}
                            </span>
                          </div>
                        </a>
                      );
                    }

                    const waNum = cleanNomor.startsWith("0") ? "62" + cleanNomor.slice(1) : cleanNomor;
                    const href = isWa
                      ? `https://wa.me/${waNum}?text=Halo%20${encodeURIComponent(h.nama_layanan || "Panitia PMB STAICI")},%20saya%20ingin%20berkonsultasi%20terkait%20pendaftaran%20program%20studi%20${encodeURIComponent(displayTitle)}`
                      : `tel:${cleanNomor}`;

                    return (
                      <a
                        key={h.id || idx}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3.5 p-3.5 bg-[#eef7f2] hover:bg-[#e2f2e9] rounded-2xl border border-emerald-200 transition group cursor-pointer shadow-2xs"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#0d3830] text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          <Phone className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-semibold text-slate-600 truncate">
                            {h.nama_layanan || "WhatsApp PMB Center"}
                          </span>
                          <span className="text-sm sm:text-base font-bold text-slate-900 font-mono tracking-tight truncate">
                            {rawVal}
                          </span>
                        </div>
                      </a>
                    );
                  });
                })()}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Jam Layanan: {backendSettings?.jam_operasional || "Senin - Sabtu: 08.00 - 16.00 WIB"}</span>
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
