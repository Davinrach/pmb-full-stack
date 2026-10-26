"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Menu, User as UserIcon, LogOut, LayoutDashboard, UserCheck, Settings } from "lucide-react";
import LoginModal from "@/components/LoginModal";
import ProfileModal from "@/components/ProfileModal";
import { authStorage, UserSession, getFileUrl, api } from "@/lib/api";

import { useLanguage } from "@/lib/LanguageContext";

interface NavbarProps {
  activePage?: "beranda" | "pendaftaran" | "program-studi";
}

export default function Navbar({ activePage = "beranda" }: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [prodiDropdownOpen, setProdiDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [dynamicProdis, setDynamicProdis] = useState<any[]>([]);

  // Fetch dynamic prodis for navbar dropdowns
  useEffect(() => {
    api.get("/program-studi")
      .then((res) => {
        const val = (res as any)?.data?.data || (res as any)?.data;
        if (Array.isArray(val) && val.length > 0) {
          setDynamicProdis(
            val.map((p: any) => ({
              id: (p.kode || String(p.id)).toLowerCase(),
              nama: p.nama,
              badge: p.jenjang || "S1",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const activeProdiList = dynamicProdis.length > 0 ? dynamicProdis : t.prodiList;

  // Read auth state on mount and sync
  useEffect(() => {
    const checkAuth = () => {
      const token = authStorage.getToken();
      const currentUser = authStorage.getUser();
      if (token && currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    };

    checkAuth();

    // Listen for cross-tab or local storage changes & same-tab auth events
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-changed", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-changed", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    authStorage.clear();
    setUser(null);
    setUserDropdownOpen(false);
    window.location.href = "/";
  };

  const getInitials = (name?: string) => {
    if (!name) return "PM";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const dashboardUrl = user?.role === "admin_pmb" || user?.role === "super_admin" ? "/admincms" : "/dashboard";

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#0d3830] border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (typeof window !== "undefined" && window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center py-1 group"
          >
            <div className="flex items-center flex-shrink-0 transition-transform duration-200 group-hover:scale-[1.02]">
              <Image
                src="/logo.png"
                alt="Portal Penerimaan Mahasiswa Baru STAI Cendekia Insani Situbondo"
                width={220}
                height={34}
                priority
                unoptimized
                className="h-8 sm:h-[34px] lg:h-9 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <Link
              href="/"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.location.pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={
                activePage === "beranda"
                  ? "text-[#0d3830] hover:text-[#165349] font-bold border-b-2 border-[#0d3830] pb-0.5"
                  : "text-slate-600 hover:text-[#0d3830] transition-colors"
              }
            >
              {t.navbar.beranda}
            </Link>

            {/* Program Studi Link + Dropdown */}
            <div
              className="relative group py-2"
              onMouseEnter={() => setProdiDropdownOpen(true)}
              onMouseLeave={() => setProdiDropdownOpen(false)}
            >
              <Link
                href="/#program-studi"
                onClick={(e) => {
                  setProdiDropdownOpen(false);
                  if (typeof window !== "undefined" && window.location.pathname === "/") {
                    const el = document.getElementById("program-studi");
                    if (el) {
                      e.preventDefault();
                      const yOffset = -75;
                      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }
                }}
                className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
                  activePage === "program-studi"
                    ? "text-[#0d3830] font-bold border-b-2 border-[#0d3830] pb-0.5"
                    : "text-slate-600 hover:text-[#0d3830]"
                }`}
              >
                <span>{t.navbar.programStudi}</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${prodiDropdownOpen ? "rotate-180" : "group-hover:rotate-180"}`} />
              </Link>
              {/* Dropdown Options (pt-2 padding prevents hover gap bug) */}
              <div className={`absolute top-full left-0 pt-2 w-72 z-50 ${prodiDropdownOpen ? "block animate-fadeIn" : "hidden group-hover:block"}`}>
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-1">
                  <Link
                    href="/#program-studi"
                    onClick={(e) => {
                      setProdiDropdownOpen(false);
                      if (typeof window !== "undefined" && window.location.pathname === "/") {
                        const el = document.getElementById("program-studi");
                        if (el) {
                          e.preventDefault();
                          const yOffset = -75;
                          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                          window.scrollTo({ top: y, behavior: "smooth" });
                        }
                      }
                    }}
                    className="block px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors border-b border-slate-100 mb-1"
                  >
                    {t.navbar.lihatSemuaProdi}
                  </Link>
                  {activeProdiList.map((prodi) => (
                    <Link
                      key={prodi.id}
                      href={`/program-studi/${prodi.id}`}
                      onClick={() => setProdiDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0d3830] rounded-xl transition-colors group/item"
                    >
                      <span className="truncate">{prodi.nama}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 group-hover/item:bg-emerald-100 group-hover/item:text-[#0d3830] rounded text-slate-500 flex-shrink-0 ml-2">
                        {prodi.badge}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ (Ditukar posisinya sebelum Pendaftaran) */}
            <Link
              href="/#faq"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.location.pathname === "/") {
                  const el = document.getElementById("faq");
                  if (el) {
                    e.preventDefault();
                    const yOffset = -75;
                    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }
              }}
              className="text-slate-600 hover:text-[#0d3830] transition-colors py-2 cursor-pointer"
            >
              FAQ
            </Link>

            {/* Pendaftaran (Tombol Hijau Resmi) */}
            <Link
              href="/dashboard"
              className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                activePage === "pendaftaran"
                  ? "bg-[#0d3830] text-white ring-2 ring-emerald-600/30 shadow-sm"
                  : "bg-[#0d3830] hover:bg-[#165349] text-white shadow-xs hover:shadow-sm"
              }`}
            >
              <span>{t.navbar.pendaftaran}</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLang("id")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  lang === "id"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLang("eng")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  lang === "eng"
                    ? "bg-[#0d3830] text-white shadow-xs font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                ENG
              </button>
            </div>

            {/* Auth State: Logged In vs Not Logged In */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-full transition shadow-xs cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0d3830] text-emerald-300 font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden border border-emerald-300/30">
                    {user.foto_profil ? (
                      <Image
                        src={getFileUrl(user.foto_profil)}
                        alt={user.nama_lengkap}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(user.nama_lengkap)
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                    {user.nama_lengkap}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-fadeIn overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
                      <p className="text-[11px] font-semibold text-slate-400">{t.navbar.masukSebagai}</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0d3830] transition text-left cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-emerald-700" />
                        <span>Pengaturan Akun & Profil</span>
                      </button>

                      <Link
                        href={dashboardUrl}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0d3830] transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                        <span>{t.navbar.dashboardPmb}</span>
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-rose-700 hover:bg-slate-50 transition text-left cursor-pointer border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                      <span>{t.navbar.keluar}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
                >
                  {t.navbar.daftar}
                </Link>
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#0e3831] hover:bg-[#165349] rounded-lg shadow-sm transition cursor-pointer"
                >
                  {t.navbar.masuk}
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100"
            aria-label={t.navbar.bukaMenu}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => {
                setMobileMenuOpen(false);
                if (typeof window !== "undefined" && window.location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={`block text-sm font-bold ${
                activePage === "beranda" ? "text-[#0d3830]" : "text-slate-700 hover:text-[#0d3830]"
              }`}
            >
              {t.navbar.beranda}
            </Link>

            <div className="space-y-1 pl-2 border-l-2 border-emerald-500">
              <Link
                href="/#program-studi"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (typeof window !== "undefined" && window.location.pathname === "/") {
                    const el = document.getElementById("program-studi");
                    if (el) {
                      const yOffset = -110;
                      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }
                }}
                className="block text-xs font-bold text-[#0d3830] uppercase tracking-wider mb-1"
              >
                {t.navbar.programStudi} ↓
              </Link>
              {activeProdiList.map((prodi) => (
                <Link
                  key={prodi.id}
                  href={`/program-studi/${prodi.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-medium text-slate-700 py-1 hover:text-[#0d3830]"
                >
                  {prodi.nama} ({prodi.badge})
                </Link>
              ))}
            </div>

            <Link
              href="/#faq"
              onClick={() => {
                setMobileMenuOpen(false);
                if (typeof window !== "undefined" && window.location.pathname === "/") {
                  const el = document.getElementById("faq");
                  if (el) {
                    const yOffset = -110;
                    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }
              }}
              className="block text-sm font-medium text-slate-700 hover:text-[#0d3830]"
            >
              FAQ PMB
            </Link>

            {/* Mobile Pendaftaran */}
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d3830] text-white text-xs font-bold shadow-xs transition-all"
            >
              <span>{t.navbar.pendaftaran}</span>
              <ChevronRight className="w-4 h-4 text-emerald-300" />
            </Link>

            {/* Mobile Language Switcher */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{t.navbar.bahasa}:</span>
              <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLang("id")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    lang === "id"
                      ? "bg-white text-slate-900 border border-slate-200 font-extrabold shadow-2xs"
                      : "text-slate-500"
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLang("eng")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    lang === "eng"
                      ? "bg-[#0d3830] text-white font-extrabold shadow-2xs"
                      : "text-slate-500"
                  }`}
                >
                  ENG
                </button>
              </div>
            </div>

            {/* Mobile Auth Buttons */}
            {user ? (
              <div className="pt-2 space-y-2">
                <Link
                  href={dashboardUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0d3830] text-emerald-300 font-extrabold text-xs flex items-center justify-center">
                      {getInitials(user.nama_lengkap)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{user.nama_lengkap}</p>
                      <p className="text-[11px] text-slate-600 font-medium">{t.navbar.dashboardBtn}</p>
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 px-3 text-xs font-bold text-slate-600 hover:text-rose-700 bg-slate-100/80 hover:bg-rose-50/50 border border-slate-200/70 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.navbar.keluar}</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-bold text-slate-800 border border-slate-300 rounded-lg"
                >
                  {t.navbar.daftar}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="flex-1 text-center py-2 text-sm font-bold text-white bg-[#0e3831] rounded-lg cursor-pointer"
                >
                  {t.navbar.masuk}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          const u = authStorage.getUser();
          if (u) setUser(u);
        }}
      />

      {/* Profile Management & Password Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onUserUpdated={(updatedUser) => {
          setUser(updatedUser);
        }}
      />
    </>
  );
}
