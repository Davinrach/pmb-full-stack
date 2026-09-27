import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Portal PMB Terpadu - STAI Cendekia Insani Situbondo",
  description:
    "Pusat Pendaftaran Mahasiswa Baru & Informasi Program Studi STAI Cendekia Insani (STAICI) Situbondo. Tersedia program studi S1 MPI, Hukum Keluarga Islam (AS), dan Komunikasi Penyiaran Islam.",
  keywords: [
    "PMB STAICI",
    "STAI Cendekia Insani Situbondo",
    "Pendaftaran Mahasiswa Baru",
    "Kuliah Situbondo",
    "MPI",
    "Hukum Keluarga Islam",
    "KPI",
    "KIP Kuliah",
  ],
};

import { LanguageProvider } from "@/lib/LanguageContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakartaSans.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#f8fafc] text-slate-900 antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
