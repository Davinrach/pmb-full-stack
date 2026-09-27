"use client";

import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/lib/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#08221c] text-slate-300 pt-14 pb-8 border-t border-emerald-950 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Col 1: Identity & Accreditation (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                <Image
                  src="/logo-staici.png"
                  alt="Logo STAI Cendekia Insani"
                  width={56}
                  height={56}
                  unoptimized
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-white tracking-tight font-serif leading-tight">
                  {t.footer.identitasTitle}
                </span>
                <span className="text-xs text-emerald-300 font-medium">
                  {t.footer.identitasLocation}
                </span>
              </div>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-sm">
              {t.footer.identitasDesc}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-800/60">
                {t.footer.akreditasiBanpt}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-800/60">
                {t.footer.akreditasiKemenag}
              </span>
            </div>
          </div>

          {/* Col 2: Program Studi (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">
              {t.footer.prodiTitle}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              {t.prodiList.map((prodi) => (
                <li key={prodi.id}>
                  <Link
                    href={`/program-studi/${prodi.id}`}
                    className="hover:text-white transition text-left cursor-pointer block"
                  >
                    {prodi.nama} ({prodi.badge})
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Tautan Cepat (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">
              {t.footer.tautanTitle}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li>
                <Link href="/pendaftaran" className="hover:text-white transition block">
                  {t.footer.tautanPendaftaran}
                </Link>
              </li>
              <li>
                <Link href="/#program-studi" className="hover:text-white transition block">
                  {t.footer.tautanProdi}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition block">
                  {t.footer.tautanPortal}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak & Kampus (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">
              {t.footer.kontakTitle}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80 leading-relaxed">
              <li>{t.footer.alamat}</li>
              <li>
                Email:{" "}
                <a
                  href={`mailto:${t.footer.email}`}
                  className="text-white hover:underline"
                >
                  {t.footer.email}
                </a>
              </li>
              <li>
                Telepon / WA:{" "}
                <a
                  href="tel:085233432221"
                  className="text-white hover:underline"
                >
                  {t.footer.telepon}
                </a>
              </li>
              <li>{t.footer.jamOperasional}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/60">
          <p>{t.footer.copyright}</p>
          <div className="flex items-center gap-6">
            <Link href="/#hotline" className="hover:text-emerald-100 transition">
              {t.footer.bantuan}
            </Link>
            <Link href="/#privasi" className="hover:text-emerald-100 transition">
              {t.footer.privasi}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
