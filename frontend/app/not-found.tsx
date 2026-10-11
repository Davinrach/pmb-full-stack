import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft, Headphones } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
        <div className="flex justify-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            <Image
              src="/logo-staici.png"
              alt="Logo STAICI"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-5xl sm:text-6xl font-black text-[#0d3830] tracking-tight block">
            404
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Halaman yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali ke beranda portal PMB STAICI.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Ke Beranda</span>
          </Link>
          <a
            href="https://wa.me/6285233432221?text=Halo%20Admin%20PMB%20STAICI,%20saya%20butuh%20bantuan"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-[#0d3830] font-bold text-xs sm:text-sm rounded-xl border border-emerald-200 transition flex items-center justify-center gap-2"
          >
            <Headphones className="w-4 h-4" />
            <span>Bantuan PMB</span>
          </a>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-8 font-medium">
        © 2026 STAI Cendekia Insani Situbondo • Portal PMB Terpadu
      </p>
    </div>
  );
}
