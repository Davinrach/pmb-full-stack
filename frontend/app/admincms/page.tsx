"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Check,
  X,
  FileText,
  CreditCard,
  IdCard,
  Building2,
  Calendar,
  Layers,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Award,
  Settings,
  Save,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Megaphone,
  Share2,
  Bell,
  Plus,
  SlidersHorizontal,
  Download,
  RotateCcw,
  UserCheck,
  Zap,
  ChevronDown,
  CheckSquare,
  MoreHorizontal,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Lock,
  Key,
  FolderPlus,
  Grid,
  HelpCircle,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  FileQuestion,
  Receipt,
  Info,
  ListChecks,
  FileCheck,
  Database,
  Sparkles,
  GraduationCap,
  School,
  Wallet,
  BookOpen,
  Home,
  Headphones,
} from "lucide-react";
import { api, authStorage, getFileUrl } from "@/lib/api";

// Lucide Icon Component Map
const LUCIDE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, UserCheck, UserPlus, GraduationCap, School,
  FileText, FileCheck, FileQuestion, BookOpen, Layers,
  Award, ShieldCheck, ShieldAlert, Key, Lock,
  Download, RefreshCw, History, Database,
  CreditCard, Wallet, Receipt,
  Calendar, Clock, Megaphone, Bell,
  Settings, SlidersHorizontal, Grid,
  Home, Building2, Phone, Mail, Headphones, MessageSquare,
  CheckCircle2, AlertCircle, HelpCircle, Sparkles, Zap,
  Search, Eye, MapPin, Share2, FolderPlus, ListChecks, Info,
};

// Curated Lucide Icon list with tags and keywords for instant search
const LUCIDE_ICON_LIST = [
  // Pengguna & Siswa
  { name: "Users", label: "Users (Pengguna)", category: "Pengguna", keywords: ["user", "users", "pendaftar", "orang", "mahasiswa", "akun"] },
  { name: "UserCheck", label: "UserCheck (Verifikasi)", category: "Pengguna", keywords: ["user", "check", "verifikasi", "validasi", "sukses"] },
  { name: "UserPlus", label: "UserPlus (Daftar Baru)", category: "Pengguna", keywords: ["user", "tambah", "daftar", "baru", "registrasi"] },
  { name: "GraduationCap", label: "GraduationCap (Toga/Akademik)", category: "Akademik", keywords: ["wisuda", "sarjana", "kuliah", "toga", "akademik", "lulusan"] },
  { name: "School", label: "School (Kampus/Sekolah)", category: "Akademik", keywords: ["sekolah", "kampus", "universitas", "gedung", "stai"] },
  { name: "BookOpen", label: "BookOpen (Buku/Studi)", category: "Akademik", keywords: ["buku", "kurikulum", "mata kuliah", "studi", "baca", "modul"] },
  { name: "Layers", label: "Layers (Prodi/Tingkat)", category: "Akademik", keywords: ["prodi", "program studi", "jurusan", "jenjang", "lapisan"] },
  { name: "Award", label: "Award (Prestasi/Seleksi)", category: "Akademik", keywords: ["prestasi", "juara", "seleksi", "kelulusan", "penghargaan"] },
  
  // Dokumen & Berkas
  { name: "FileText", label: "FileText (Dokumen/Berkas)", category: "Dokumen", keywords: ["dokumen", "berkas", "file", "teks", "formulir", "surat"] },
  { name: "FileCheck", label: "FileCheck (Berkas Sah)", category: "Dokumen", keywords: ["berkas", "valid", "disetujui", "verifikasi", "acc"] },
  { name: "FileQuestion", label: "FileQuestion (Syarat/FAQ)", category: "Dokumen", keywords: ["tanya", "faq", "syarat", "panduan", "bantuan"] },
  { name: "ListChecks", label: "ListChecks (Daftar Periksa)", category: "Dokumen", keywords: ["checklist", "tahapan", "langkah", "tata cara"] },

  // Keuangan & Pembayaran
  { name: "CreditCard", label: "CreditCard (Kartu/Bank)", category: "Keuangan", keywords: ["kartu", "bayar", "pembayaran", "rekening", "bank", "va"] },
  { name: "Wallet", label: "Wallet (Dompet/Kas)", category: "Keuangan", keywords: ["dompet", "keuangan", "kas", "biaya", "uang", "saldo"] },
  { name: "Receipt", label: "Receipt (Kuitansi/Bukti)", category: "Keuangan", keywords: ["kuitansi", "struk", "bukti", "transaksi", "faktur"] },

  // Kalender & Waktu
  { name: "Calendar", label: "Calendar (Kalender/Jadwal)", category: "Waktu", keywords: ["kalender", "gelombang", "jadwal", "periode", "waktu", "tanggal"] },
  { name: "Clock", label: "Clock (Jam/Waktu)", category: "Waktu", keywords: ["jam", "waktu", "menit", "deadline", "durasi"] },
  { name: "History", label: "History (Riwayat/Audit)", category: "Waktu", keywords: ["riwayat", "log", "audit", "jejak", "aktivitas"] },

  // Sistem & Integrasi
  { name: "RefreshCw", label: "RefreshCw (Sinkronisasi)", category: "Sistem", keywords: ["sinkronisasi", "sinkron", "emis", "kopertais", "pddikti", "refresh", "update"] },
  { name: "Download", label: "Download (Unduh/Export)", category: "Sistem", keywords: ["unduh", "download", "export", "ekspor", "excel", "csv"] },
  { name: "Database", label: "Database (Basis Data)", category: "Sistem", keywords: ["database", "data", "server", "master", "penyimpanan"] },

  // Keamanan & Akses
  { name: "ShieldCheck", label: "ShieldCheck (RBAC/Wewenang)", category: "Keamanan", keywords: ["keamanan", "rbac", "role", "wewenang", "hak akses", "admin", "proteksi"] },
  { name: "ShieldAlert", label: "ShieldAlert (Peringatan)", category: "Keamanan", keywords: ["peringatan", "keamanan", "bahaya", "proteksi", "alert"] },
  { name: "Key", label: "Key (Kunci Akses)", category: "Keamanan", keywords: ["kunci", "akses", "token", "password", "otorisasi"] },
  { name: "Lock", label: "Lock (Gembok/Privat)", category: "Keamanan", keywords: ["gembok", "terkunci", "privat", "keamanan"] },

  // Pengaturan & CMS
  { name: "Settings", label: "Settings (Pengaturan)", category: "Pengaturan", keywords: ["pengaturan", "setting", "konfigurasi", "cms", "kelola"] },
  { name: "SlidersHorizontal", label: "SlidersHorizontal (Filter)", category: "Pengaturan", keywords: ["filter", "opsi", "parameter", "kontrol"] },
  { name: "Grid", label: "Grid (Menu/Modul)", category: "Pengaturan", keywords: ["menu", "modul", "dashboard", "layout", "koleksi"] },
  { name: "FolderPlus", label: "FolderPlus (Grup Menu)", category: "Pengaturan", keywords: ["folder", "grup", "kelompok", "kategori"] },

  // Komunikasi & Kontak
  { name: "Home", label: "Home (Beranda/Homepage)", category: "Komunikasi", keywords: ["beranda", "homepage", "depan", "landing", "rumah"] },
  { name: "Building2", label: "Building2 (Institusi/Gedung)", category: "Komunikasi", keywords: ["gedung", "kampus", "institusi", "bank", "yayasan"] },
  { name: "Headphones", label: "Headphones (CS/Helpdesk)", category: "Komunikasi", keywords: ["cs", "customer service", "layanan", "bantuan", "call center"] },
  { name: "Phone", label: "Phone (Telepon/Kontak)", category: "Komunikasi", keywords: ["telepon", "kontak", "hotline", "wa", "whatsapp"] },
  { name: "Mail", label: "Mail (Email/Surat)", category: "Komunikasi", keywords: ["email", "surat", "pesan", "inbox"] },
  { name: "MessageSquare", label: "MessageSquare (Pesan/Chat)", category: "Komunikasi", keywords: ["pesan", "chat", "komentar", "tanya", "konsultasi"] },
  { name: "Megaphone", label: "Megaphone (Pengumuman)", category: "Komunikasi", keywords: ["pengumuman", "broadcast", "info", "berita", "notifikasi"] },
  { name: "Bell", label: "Bell (Notifikasi)", category: "Komunikasi", keywords: ["lonceng", "notifikasi", "pemberitahuan", "peringatan"] },

  // Serbaguna
  { name: "Sparkles", label: "Sparkles (Fitur Khusus)", category: "Lainnya", keywords: ["unggulan", "spesial", "ai", "fitur", "magic"] },
  { name: "CheckCircle2", label: "CheckCircle2 (Centang/OK)", category: "Lainnya", keywords: ["sukses", "selesai", "disetujui", "benar"] },
  { name: "HelpCircle", label: "HelpCircle (Pusat Bantuan)", category: "Lainnya", keywords: ["bantuan", "panduan", "petunjuk", "info"] },
  { name: "Zap", label: "Zap (Cepat/Aksi)", category: "Lainnya", keywords: ["cepat", "petir", "kilat", "aksi", "energi"] },
];

// Dynamic Icon mapper helper using Lucide library map
function renderNavIcon(iconName: string) {
  if (!iconName) return <Users className="w-4 h-4" />;
  const normalizedKey = Object.keys(LUCIDE_ICON_MAP).find(
    (k) => k.toLowerCase() === iconName.trim().toLowerCase()
  );
  const IconComp = normalizedKey ? LUCIDE_ICON_MAP[normalizedKey] : Users;
  return <IconComp className="w-4 h-4" />;
}

// Safe string extractors
function getProdiTitle(prodi: any): string {
  if (!prodi) return "-";
  if (typeof prodi === "string") return prodi;
  if (typeof prodi === "object" && prodi !== null && prodi.nama) return String(prodi.nama);
  if (typeof prodi === "object" && prodi !== null && prodi.kode) return String(prodi.kode);
  return "-";
}

function getGelombangTitle(gel: any, fallbackJalur?: string): string {
  if (typeof gel === "string" && gel) return gel;
  if (typeof gel === "object" && gel !== null && gel.nama) return String(gel.nama);
  if (typeof fallbackJalur === "string" && fallbackJalur) return fallbackJalur;
  return "-";
}

function getUserName(p: any): string {
  if (typeof p?.nama_lengkap === "string" && p.nama_lengkap) return p.nama_lengkap;
  if (typeof p?.user?.nama_lengkap === "string" && p.user.nama_lengkap) return p.user.nama_lengkap;
  if (typeof p?.user?.email === "string" && p.user.email) return p.user.email;
  return "Tanpa Nama";
}

function getUserNik(p: any): string {
  if (typeof p?.nik === "string" && p.nik) return p.nik;
  if (typeof p?.user?.nik === "string" && p.user.nik) return p.user.nik;
  return "-";
}

function getAsalSekolah(p: any): string {
  if (typeof p?.nama_sekolah === "string" && p.nama_sekolah) return p.nama_sekolah;
  if (typeof p?.asal_sekolah === "string" && p.asal_sekolah) return p.asal_sekolah;
  return "-";
}

function isKipApplicant(p: any): boolean {
  return p?.jalur_pendaftaran === "KIP-Kuliah" || p?.jalur === "KIP-Kuliah";
}

function getJalurBadge(p: any) {
  const jalur = p?.jalur_pendaftaran || p?.jalur;
  if (!jalur) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-500 border border-slate-200">
        Belum Memilih
      </span>
    );
  }

  const isKip = isKipApplicant(p);
  if (isKip) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
        KIP-Kuliah
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200">
      {jalur}
    </span>
  );
}

function getPembayaranBadge(p: any) {
  const isKip = isKipApplicant(p);
  if (isKip) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-full text-[11px] border border-emerald-200 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Bebas Biaya (KIP)
      </span>
    );
  }

  const pay = Array.isArray(p?.pembayaran) && p.pembayaran.length > 0
    ? p.pembayaran[p.pembayaran.length - 1]
    : null;

  if (!pay) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-full text-[11px] border border-slate-200 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Menunggu Pembayaran
      </span>
    );
  }

  if (pay.status === "diterima") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full text-[11px] border border-emerald-300 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        Lunas &amp; Sah
      </span>
    );
  }

  if (pay.status === "ditolak") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 font-bold rounded-full text-[11px] border border-amber-300 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        Perlu Revisi
      </span>
    );
  }

  // Default: pay.status === "menunggu_verifikasi" (Pendaftar sudah upload bukti transfer, menunggu admin validasi!)
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-full text-[11px] border border-amber-300 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
      Menunggu Validasi
    </span>
  );
}

function getBerkasBadge(p: any) {
  const berkasArr = Array.isArray(p?.berkas) ? p.berkas : [];

  if (berkasArr.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-lg text-[11px] whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>Belum Ada Berkas</span>
      </span>
    );
  }

  const hasInvalid = berkasArr.some((b: any) => b.status_verifikasi === "invalid");
  if (hasInvalid || p?.status_pendaftaran === "belum_lengkap" || p?.status_pendaftaran === "ditolak_perlu_perbaikan") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 font-bold rounded-lg text-[11px] whitespace-nowrap">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>Perlu Revisi</span>
      </span>
    );
  }

  const validMap: Record<string, boolean> = {};
  berkasArr.forEach((b: any) => {
    if (b.status_verifikasi === "valid") {
      validMap[b.jenis_dokumen?.toLowerCase()] = true;
    }
  });

  const isKip = p?.jalur_pendaftaran === "KIP-Kuliah" || p?.jalur === "KIP-Kuliah";
  const isMandatoryValid =
    validMap["kk"] &&
    validMap["ktp"] &&
    validMap["ijazah"] &&
    validMap["foto"] &&
    (!isKip || validMap["kip"]);

  if (isMandatoryValid) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg text-[11px] whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Valid &amp; Sah</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-lg text-[11px] whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 text-blue-600" />
      <span>Menunggu Verifikasi</span>
    </span>
  );
}

export default function AdminCMSDashboardPage() {
  const router = useRouter();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<string>("pendaftar");

  // Dynamic Nav Menu Groups from Backend API
  const [navMenuGroups, setNavMenuGroups] = useState<any[]>([]);

  const [stats, setStats] = useState<any>({
    total_pendaftar: 0,
    va_terverifikasi: "Rp 0",
    berkas_lengkap: 0,
    menunggu_tindakan: 0,
    belum_lengkap: 0,
    menunggu_verifikasi: 0,
    lolos_seleksi: 0,
    ditolak: 0,
  });

  const [pendaftars, setPendaftars] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({
    total: 0,
    page: 1,
    per_page: 10,
    total_pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Table selections
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [prodiFilter, setProdiFilter] = useState("");
  const [jalurFilter, setJalurFilter] = useState("");
  const [statusBayarFilter, setStatusBayarFilter] = useState("");
  const [showStats, setShowStats] = useState(true);
  const [pendaftarTahunFilter, setPendaftarTahunFilter] = useState("");
  const [pendaftarGelombangFilter, setPendaftarGelombangFilter] = useState("");

  // Modals & Selections
  const [selectedPendaftar, setSelectedPendaftar] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectingBerkas, setRejectingBerkas] = useState<any | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectingPembayaran, setRejectingPembayaran] = useState<any | null>(null);
  const [rejectPembayaranNote, setRejectPembayaranNote] = useState("");

  // Lists
  const [gelombangList, setGelombangList] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);

  // Derived Academic Years & Dependent Gelombang Options
  const availableTahunAkademik = useMemo(() => {
    const years = gelombangList.map((g) => g.tahun_akademik).filter(Boolean);
    const unique = Array.from(new Set(years)).sort().reverse();
    return unique.length > 0 ? unique : ["2026/2027"];
  }, [gelombangList]);

  const pendaftarGelombangOptions = useMemo(() => {
    if (!pendaftarTahunFilter) return gelombangList;
    return gelombangList.filter((g) => g.tahun_akademik === pendaftarTahunFilter);
  }, [gelombangList, pendaftarTahunFilter]);

  // Current Authenticated Admin User
  const [currentUser, setCurrentUser] = useState<any>(null);

  // RBAC Management State (Super Admin Only)
  const [rbacSubTab, setRbacSubTab] = useState<"matrix" | "users" | "roles" | "menus">("matrix");
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [allMenusList, setAllMenusList] = useState<any[]>([]);
  const [allMenuGroupsList, setAllMenuGroupsList] = useState<any[]>([]);
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<string>("admin_pmb");
  const [matrixAllowedMenuIDs, setMatrixAllowedMenuIDs] = useState<number[]>([]);

  // Admin Users List for Super Admin Management
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState({
    nama_lengkap: "",
    nik: "",
    email: "",
    password: "adminpmb123",
    no_hp: "",
    role: "admin_pmb",
  });

  // Allowed tabs based on RBAC permissions for non-super-admin
  const allowedTabKeys = useMemo(() => {
    const role = currentUser?.role || authStorage.getUser()?.role;
    if (role === "super_admin") return ["*"];
    const keys = new Set<string>(["pendaftar"]);
    navMenuGroups.forEach((g) => {
      g.menus?.forEach((m: any) => {
        if (m.key) keys.add(m.key);
        if (m.url) keys.add(m.url);
        if (m.key === "homepage" || m.url === "homepage") keys.add("settings");
        if (m.key === "pendaftaran" || m.url === "pendaftaran") keys.add("gelombang");
      });
    });
    return Array.from(keys);
  }, [currentUser, navMenuGroups]);

  // New Role Form State
  const [newRole, setNewRole] = useState({ kode: "", nama: "", deskripsi: "" });
  // New Menu Group Form State
  const [newGroup, setNewGroup] = useState({ nama: "", urutan: 1 });
  // New Menu Form State
  const [newMenu, setNewMenu] = useState({
    menu_group_id: 1,
    nama: "",
    key: "",
    icon: "Users",
    url: "",
    badge_text: "",
    urutan: 1,
  });

  // Lucide Icon Picker Search & Filter State
  const [iconSearchTerm, setIconSearchTerm] = useState("");
  const [iconCategoryFilter, setIconCategoryFilter] = useState("Semua");
  const filteredLucideIcons = useMemo(() => {
    return LUCIDE_ICON_LIST.filter((icon) => {
      const matchCat = iconCategoryFilter === "Semua" || icon.category === iconCategoryFilter;
      if (!matchCat) return false;
      if (!iconSearchTerm) return true;
      const q = iconSearchTerm.toLowerCase().trim();
      return (
        icon.name.toLowerCase().includes(q) ||
        icon.label.toLowerCase().includes(q) ||
        icon.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [iconSearchTerm, iconCategoryFilter]);

  // Edit Group & Menu Modal State
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);

  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any | null>(null);
  const [editMenuIconSearchTerm, setEditMenuIconSearchTerm] = useState("");
  const [editMenuIconCategoryFilter, setEditMenuIconCategoryFilter] = useState("Semua");
  const filteredEditLucideIcons = useMemo(() => {
    return LUCIDE_ICON_LIST.filter((icon) => {
      const matchCat = editMenuIconCategoryFilter === "Semua" || icon.category === editMenuIconCategoryFilter;
      if (!matchCat) return false;
      if (!editMenuIconSearchTerm) return true;
      const q = editMenuIconSearchTerm.toLowerCase().trim();
      return (
        icon.name.toLowerCase().includes(q) ||
        icon.label.toLowerCase().includes(q) ||
        icon.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [editMenuIconSearchTerm, editMenuIconCategoryFilter]);

  // Add Gelombang State
  const [isAddGelombangOpen, setIsAddGelombangOpen] = useState(false);
  const [newGelombang, setNewGelombang] = useState({
    nama: "Gelombang 2 Reguler",
    tahun_akademik: "2026/2027",
    tanggal_buka: new Date().toISOString().split("T")[0],
    tanggal_tutup: new Date(Date.now() + 60 * 24 * 3600 * 1000)
      .toISOString()
      .split("T")[0],
    biaya_pendaftaran: 250000,
    kuota: 150,
    is_aktif: true,
  });

  // Edit Gelombang State
  const [isEditGelombangOpen, setIsEditGelombangOpen] = useState(false);
  const [selectedGelombangId, setSelectedGelombangId] = useState<number | null>(null);
  const [editGelombang, setEditGelombang] = useState({
    nama: "",
    tahun_akademik: "2026/2027",
    tanggal_buka: "",
    tanggal_tutup: "",
    biaya_pendaftaran: 250000,
    kuota: 150,
    is_aktif: true,
  });

  // Program Studi (Prodi) Modal State
  const [isAddProdiOpen, setIsAddProdiOpen] = useState(false);
  const [isEditProdiOpen, setIsEditProdiOpen] = useState(false);
  const [selectedProdiId, setSelectedProdiId] = useState<number | null>(null);

  const [prodiModalTab, setProdiModalTab] = useState<"dasar" | "profil" | "capaian" | "gelar">("dasar");
  const [prodiForm, setProdiForm] = useState<{
    kode: string;
    nama: string;
    jenjang: string;
    gelar_akademik: string;
    deskripsi: string;
    profil_lulusan_intro: string;
    profil_lulusan: { title: string; desc: string }[];
    capaian_pembelajaran: { title: string; desc: string }[];
    is_aktif: boolean;
  }>({
    kode: "",
    nama: "",
    jenjang: "S1",
    gelar_akademik: "",
    deskripsi: "",
    profil_lulusan_intro: "",
    profil_lulusan: [{ title: "", desc: "" }],
    capaian_pembelajaran: [{ title: "", desc: "" }],
    is_aktif: true,
  });

  // Export Data State (FR-8.8)
  const [exportProdiFilter, setExportProdiFilter] = useState("");
  const [exportGelombangFilter, setExportGelombangFilter] = useState("");
  const [exportStatusFilter, setExportStatusFilter] = useState("");
  const [exportStatusBayarFilter, setExportStatusBayarFilter] = useState("");
  const [exportApplicants, setExportApplicants] = useState<any[]>([]);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [isDownloadingExport, setIsDownloadingExport] = useState(false);

  // Seleksi & Kelulusan State (FR-8.5, FR-6.2, FR-6.3)
  const [seleksiSearch, setSeleksiSearch] = useState("");
  const [seleksiTahunFilter, setSeleksiTahunFilter] = useState("");
  const [seleksiProdiFilter, setSeleksiProdiFilter] = useState("");
  const [seleksiGelombangFilter, setSeleksiGelombangFilter] = useState("");
  const [seleksiJalurFilter, setSeleksiJalurFilter] = useState("");
  const [seleksiStatusFilter, setSeleksiStatusFilter] = useState("");

  const seleksiGelombangOptions = useMemo(() => {
    if (!seleksiTahunFilter) return gelombangList;
    return gelombangList.filter((g) => g.tahun_akademik === seleksiTahunFilter);
  }, [gelombangList, seleksiTahunFilter]);
  const [seleksiApplicants, setSeleksiApplicants] = useState<any[]>([]);
  const [isSeleksiLoading, setIsSeleksiLoading] = useState(false);
  const [selectedForSeleksi, setSelectedForSeleksi] = useState<any | null>(null);
  const [isSeleksiModalOpen, setIsSeleksiModalOpen] = useState(false);
  const [seleksiForm, setSeleksiForm] = useState<{
    status: "lolos_seleksi" | "mengikuti_ujian" | "tidak_lolos" | "berkas_diverifikasi";
    nilai_ujian: string;
    nilai_wawancara: string;
    catatan: string;
  }>({
    status: "lolos_seleksi",
    nilai_ujian: "",
    nilai_wawancara: "",
    catatan: "",
  });

  // Dynamic CMS Settings State
  const [settings, setSettings] = useState({
    banner_title: "Pusat Pendaftaran Mahasiswa Baru & Informasi Program Studi",
    banner_subtitle:
      "Meneguhkan keilmuan Islam modern dan etika profesional santri. Mari bergabung bersama STAI Cendekia Insani Tahun Akademik 2026/2027.",
    announcement_text: "Penerimaan Mahasiswa Baru Gelombang 1 Resmi Dibuka",
    bank_name: "Bank Syariah Indonesia (BSI)",
    nomor_rekening: "7148899012",
    atas_nama: "STAI Cendekia Insani PMB",
    petunjuk_pembayaran: "",
    regulasi_bukti_bayar: "",
    batas_waktu_konfirmasi: "1x24 Jam Kerja",
    persyaratan_pendaftaran: "",
    jalur_pendaftaran_info: "",
    no_whatsapp_cs: "085233432221",
    email_cs: "pmb@staicisitubondo.ac.id",
    alamat_kampus: "Jl. Raya Panji No. 12, Situbondo, Jawa Timur",
    jam_operasional: "Senin - Jumat: 08.00 - 16.00 WIB",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isBannerDirty, setIsBannerDirty] = useState(false);
  const [isProdiDirty, setIsProdiDirty] = useState(false);
  const [isJalurDirty, setIsJalurDirty] = useState(false);
  const isAnyHomepageDirty = isBannerDirty || isProdiDirty || isJalurDirty;

  // Homepage Jalur Masuk Cards State
  const [jalurCards, setJalurCards] = useState<any[]>([
    {
      id: "reguler",
      nama: "Jalur Masuk Reguler (Mandiri)",
      badge: "Jalur Reguler",
      deskripsi: "Terbuka bagi seluruh lulusan SMA/MA/SMK/Pondok Pesantren sederajat tanpa batasan tahun kelulusan. Proses seleksi berkas administrasi dan wawancara.",
      is_aktif: true,
    },
    {
      id: "kip",
      nama: "Jalur Beasiswa KIP-Kuliah (Pemerintah)",
      badge: "Beasiswa KIP-Kuliah",
      deskripsi: "Khusus bagi calon mahasiswa berprestasi dari keluarga pemegang KIP/KKS/PKH atau terdata dalam DTKS Kemensos RI. Bebas biaya pendaftaran dan subsidi UKT.",
      is_aktif: true,
    },
  ]);

  // Homepage Program Studi Cards State
  const [homepageProdis, setHomepageProdis] = useState<any[]>([
    {
      prodi_id: 1,
      kode: "MPI",
      nama: "Manajemen Pendidikan Islam",
      deskripsi_singkat: "Mencetak sarjana yang menguasai tata kelola kelembagaan pendidikan Islam modern, kepemimpinan transformasional, dan sistem administrasi sekolah/madrasah unggul.",
      badge_jenjang: "Jenjang S1",
      badge_gelar: "Gelar Sarjana Pendidikan (S.Pd.)",
      badge_akreditasi: "Terakreditasi BAN-PT",
    },
    {
      prodi_id: 2,
      kode: "AS",
      nama: "Ahwal Al-Syakhsiyah (Hukum Keluarga Islam)",
      deskripsi_singkat: "Fokus pada penguasaan hukum perdata Islam, advokasi, mediasi peradilan agama, dan pembinaan keluarga sakinah.",
      badge_jenjang: "Jenjang S1",
      badge_gelar: "Gelar Sarjana Hukum (S.H.)",
      badge_akreditasi: "Terakreditasi BAN-PT",
    },
    {
      prodi_id: 3,
      kode: "KPI",
      nama: "Komunikasi dan Penyiaran Islam",
      deskripsi_singkat: "Mencetak praktisi media, jurnalis cyber, broadcaster, content creator, dan humas profesional berbasis nilai Islam.",
      badge_jenjang: "Jenjang S1",
      badge_gelar: "Gelar Sarjana Sosial (S.Sos.)",
      badge_akreditasi: "Terakreditasi BAN-PT",
    },
  ]);
  const [selectedProdiToAdd, setSelectedProdiToAdd] = useState<string>("");
  const [selectedJalurToAdd, setSelectedJalurToAdd] = useState<string>("");

  // Dynamic FAQ State
  const [faqsList, setFaqsList] = useState<any[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [faqForm, setFaqForm] = useState({
    kategori: "Umum",
    pertanyaan: "",
    jawaban: "",
    urutan: 1,
    is_aktif: true,
  });
  const [isSavingFaq, setIsSavingFaq] = useState(false);

  // 1. REKENING PEMBAYARAN STATE (Multi-Bank)
  const [rekeningList, setRekeningList] = useState<any[]>([]);
  const [isAddRekeningOpen, setIsAddRekeningOpen] = useState(false);
  const [isEditRekeningOpen, setIsEditRekeningOpen] = useState(false);
  const [selectedRekeningId, setSelectedRekeningId] = useState<number | null>(null);
  const [rekeningForm, setRekeningForm] = useState({
    nama_bank: "",
    nomor_rekening: "",
    atas_nama: "",
    cabang: "",
    instruksi_transfer: "",
    is_utama: false,
    is_aktif: true,
    urutan: 1,
  });

  // 2. MASTER JALUR PENDAFTARAN STATE
  const [jalurList, setJalurList] = useState<any[]>([]);
  const [isAddJalurOpen, setIsAddJalurOpen] = useState(false);
  const [isEditJalurOpen, setIsEditJalurOpen] = useState(false);
  const [selectedJalurId, setSelectedJalurId] = useState<number | null>(null);
  const [jalurForm, setJalurForm] = useState({
    kode: "",
    nama: "",
    badge_text: "",
    deskripsi: "",
    syarat_khusus: "",
    bebas_biaya: false,
    tampil_di_homepage: true,
    is_aktif: true,
    urutan: 1,
  });

  // 3. PERSYARATAN DOKUMEN STATE
  const [persyaratanDocList, setPersyaratanDocList] = useState<any[]>([]);
  const [isAddPersyaratanOpen, setIsAddPersyaratanOpen] = useState(false);
  const [isEditPersyaratanOpen, setIsEditPersyaratanOpen] = useState(false);
  const [selectedPersyaratanId, setSelectedPersyaratanId] = useState<number | null>(null);
  const [persyaratanForm, setPersyaratanForm] = useState({
    nama_dokumen: "",
    kode: "",
    deskripsi: "",
    is_wajib: true,
    jalur_khusus: "",
    tipe_file: "PDF, JPG, PNG",
    max_size_mb: 2,
    is_aktif: true,
    urutan: 1,
  });

  // 4. KONTAK HOTLINE & NARAHUBUNG STATE
  const [hotlineList, setHotlineList] = useState<any[]>([]);
  const [isAddHotlineOpen, setIsAddHotlineOpen] = useState(false);
  const [isEditHotlineOpen, setIsEditHotlineOpen] = useState(false);
  const [selectedHotlineId, setSelectedHotlineId] = useState<number | null>(null);
  const [hotlineForm, setHotlineForm] = useState({
    nama_layanan: "",
    tipe_kontak: "whatsapp",
    nomor_atau_email: "",
    nama_petugas: "",
    jam_layanan: "Senin - Sabtu: 08.00 - 16.00 WIB",
    is_aktif: true,
    urutan: 1,
  });

  // 5. TATA CARA PENDAFTARAN TERPUSAT STATE
  const [tataCaraList, setTataCaraList] = useState<any[]>([]);
  const [isSavingTataCara, setIsSavingTataCara] = useState(false);
  const [isTataCaraDirty, setIsTataCaraDirty] = useState(false);

  // Sub-tab pendaftaran
  const [pendaftaranSubTab, setPendaftaranSubTab] = useState<"gelombang" | "jalur" | "dokumen" | "rekening">("gelombang");

  const checkAuth = () => {
    const user = authStorage.getUser();
    if (!user) {
      router.push("/loginadmin");
      return false;
    }
    if (user.role !== "admin_pmb" && user.role !== "super_admin") {
      router.push("/dashboard");
      return false;
    }
    setCurrentUser(user);
    return true;
  };

  const loadNavMenus = async (userRole?: string) => {
    try {
      const res = await api.get("/admin/rbac/nav-menus");
      if (res.data && Array.isArray(res.data)) {
        const role = userRole || currentUser?.role || authStorage.getUser()?.role;
        if (role !== "super_admin") {
          const filtered = res.data
            .map((group: any) => ({
              ...group,
              menus: group.menus?.filter((m: any) => m.key !== "rbac" && m.url !== "rbac"),
            }))
            .filter((group: any) => group.menus && group.menus.length > 0);
          setNavMenuGroups(filtered);
        } else {
          setNavMenuGroups(res.data);
        }
      }
    } catch (err) {
      console.error("Gagal memuat dynamic nav menus:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get("/admin/dashboard/stats");
      if (res.data) {
        const d = res.data;
        setStats({
          total_pendaftar: d.total_pendaftar || 0,
          va_terverifikasi: d.va_terverifikasi ? `Rp ${d.va_terverifikasi}` : "Rp 0",
          berkas_lengkap: d.berkas_diverifikasi || 0,
          menunggu_tindakan: (d.belum_lengkap || 0) + (d.menunggu_verifikasi || 0),
          belum_lengkap: d.belum_lengkap || 0,
          menunggu_verifikasi: d.menunggu_verifikasi || 0,
          lolos_seleksi: d.lolos_seleksi || 0,
          ditolak: d.ditolak || 0,
        });
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const loadPendaftars = async (page = 1) => {
    setIsLoading(true);
    try {
      let query = `/admin/pendaftar?page=${page}&per_page=10`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${encodeURIComponent(statusFilter)}`;
      if (prodiFilter) query += `&prodi_id=${encodeURIComponent(prodiFilter)}`;
      if (jalurFilter) query += `&jalur=${encodeURIComponent(jalurFilter)}`;
      if (statusBayarFilter) query += `&status_pembayaran=${encodeURIComponent(statusBayarFilter)}`;
      if (pendaftarGelombangFilter) query += `&gelombang_id=${encodeURIComponent(pendaftarGelombangFilter)}`;
      else if (pendaftarTahunFilter) query += `&tahun_akademik=${encodeURIComponent(pendaftarTahunFilter)}`;

      const res = await api.get(query);
      const realData = Array.isArray(res.data) ? res.data : [];
      setPendaftars(realData);
      setMeta(res.meta || { total: realData.length, page, per_page: 10, total_pages: Math.ceil(realData.length / 10) || 1 });
    } catch (err) {
      console.error("Error loading applicants:", err);
      setPendaftars([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGelombangs = async () => {
    try {
      const res = await api.get("/admin/gelombang");
      setGelombangList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProdis = async () => {
    try {
      const res = await api.get("/admin/program-studi");
      setProdiList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await api.get("/admin/logs");
      setLogsList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
      if (res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
        if (res.data.jalur_pendaftaran_info) {
          try {
            const parsed = typeof res.data.jalur_pendaftaran_info === "string" 
              ? JSON.parse(res.data.jalur_pendaftaran_info) 
              : res.data.jalur_pendaftaran_info;
            if (Array.isArray(parsed)) {
              setJalurCards(parsed);
            }
          } catch {}
        }
        if (res.data.homepage_prodi_list) {
          try {
            const parsed = typeof res.data.homepage_prodi_list === "string"
              ? JSON.parse(res.data.homepage_prodi_list)
              : res.data.homepage_prodi_list;
            if (Array.isArray(parsed)) {
              setHomepageProdis(parsed);
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadFaqs = async () => {
    try {
      const res = await api.get("/admin/faqs");
      setFaqsList(res.data || []);
    } catch (err) {
      console.error("Gagal memuat FAQs:", err);
    }
  };

  const loadRekeningList = async () => {
    try {
      const res = await api.get("/admin/rekening");
      setRekeningList(res.data || []);
    } catch (err) {
      console.error("Gagal memuat rekening:", err);
    }
  };

  const loadJalurList = async () => {
    try {
      const res = await api.get("/admin/jalur");
      setJalurList(res.data || []);
    } catch (err) {
      console.error("Gagal memuat jalur:", err);
    }
  };

  const loadPersyaratanDocList = async () => {
    try {
      const res = await api.get("/admin/persyaratan");
      setPersyaratanDocList(res.data || []);
    } catch (err) {
      console.error("Gagal memuat persyaratan dokumen:", err);
    }
  };

  const loadHotlineList = async () => {
    try {
      const res = await api.get("/admin/hotline");
      setHotlineList(res.data || []);
    } catch (err) {
      console.error("Gagal memuat kontak hotline:", err);
    }
  };

  const loadTataCaraList = async () => {
    try {
      const res = await api.get("/admin/tata-cara");
      setTataCaraList(res.data || []);
      setIsTataCaraDirty(false);
    } catch (err) {
      console.error("Gagal memuat tata cara:", err);
    }
  };

  // RBAC Data Loaders
  const loadRBACData = async () => {
    try {
      const [resRoles, resGroups, resMenus, resUsers] = await Promise.all([
        api.get("/admin/rbac/roles"),
        api.get("/admin/rbac/menu-groups"),
        api.get("/admin/rbac/menus"),
        api.get("/admin/rbac/users").catch(() => ({ data: [] })),
      ]);
      setRolesList(resRoles.data || []);
      setAllMenuGroupsList(resGroups.data || []);
      setAllMenusList(resMenus.data || []);
      setAdminUsersList(resUsers.data || []);
      if (resGroups.data && resGroups.data.length > 0) {
        setNewMenu((prev) => ({ ...prev, menu_group_id: resGroups.data[0].id }));
      }
    } catch (err) {
      console.error("Error loading RBAC data:", err);
    }
  };

  const handleUpdateAdminRole = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/rbac/users/${userId}/role`, { role: newRole });
      alert("Role wewenang administrator berhasil diperbarui!");
      loadRBACData();
    } catch (err: any) {
      alert(err.message || "Gagal mengubah role admin");
    }
  };

  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.post("/admin/rbac/users", newAdminUser);
      alert("Akun administrator baru berhasil dibuat!");
      setIsAddAdminModalOpen(false);
      setNewAdminUser({
        nama_lengkap: "",
        nik: "",
        email: "",
        password: "adminpmb123",
        no_hp: "",
        role: "admin_pmb",
      });
      loadRBACData();
    } catch (err: any) {
      alert(err.message || "Gagal membuat akun administrator");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadRolePermissions = async (roleKode: string) => {
    try {
      const res = await api.get(`/admin/rbac/role-permissions/${roleKode}`);
      setMatrixAllowedMenuIDs(res.data?.allowed_menu_ids || []);
    } catch (err) {
      console.error("Error loading role permissions:", err);
      setMatrixAllowedMenuIDs([]);
    }
  };

  const loadExportData = async () => {
    setIsExportLoading(true);
    try {
      let query = `/admin/export/pendaftar?`;
      if (exportProdiFilter) query += `&prodi_id=${encodeURIComponent(exportProdiFilter)}`;
      if (exportGelombangFilter) query += `&gelombang_id=${encodeURIComponent(exportGelombangFilter)}`;
      if (exportStatusFilter) query += `&status=${encodeURIComponent(exportStatusFilter)}`;
      const res = await api.get(query);
      if (res.data && Array.isArray(res.data.data)) {
        let list = res.data.data;
        if (exportStatusBayarFilter) {
          list = list.filter((p: any) => {
            const hasLunas = p.pembayaran?.some((pay: any) => pay.status === "diterima");
            const hasPending = p.pembayaran?.some((pay: any) => pay.status === "menunggu_verifikasi");
            if (exportStatusBayarFilter === "lunas") return hasLunas;
            if (exportStatusBayarFilter === "menunggu") return hasPending;
            if (exportStatusBayarFilter === "belum_bayar") return !hasLunas && !hasPending;
            return true;
          });
        }
        setExportApplicants(list);
      } else {
        setExportApplicants([]);
      }
    } catch (err) {
      console.error("Gagal memuat data ekspor:", err);
      setExportApplicants([]);
    } finally {
      setIsExportLoading(false);
    }
  };

  const handleDownloadExport = async () => {
    setIsDownloadingExport(true);
    try {
      let url = `/admin/export/pendaftar?format=csv`;
      if (exportProdiFilter) url += `&prodi_id=${encodeURIComponent(exportProdiFilter)}`;
      if (exportGelombangFilter) url += `&gelombang_id=${encodeURIComponent(exportGelombangFilter)}`;
      if (exportStatusFilter) url += `&status=${encodeURIComponent(exportStatusFilter)}`;

      const token = authStorage.getToken();
      const res = await fetch(`http://localhost:8080/api/v1${url}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Gagal mengunduh file export");
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const dateStr = new Date().toISOString().split("T")[0];
      a.download = `Data_Pendaftar_PMB_STAICI_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      loadLogs();
    } catch (err: any) {
      alert(err.message || "Gagal mengunduh export data");
    } finally {
      setIsDownloadingExport(false);
    }
  };

  const loadSeleksiData = async () => {
    setIsSeleksiLoading(true);
    try {
      let query = `/admin/pendaftar?page=1&per_page=100`;
      if (seleksiSearch) query += `&search=${encodeURIComponent(seleksiSearch)}`;
      if (seleksiProdiFilter) query += `&prodi_id=${encodeURIComponent(seleksiProdiFilter)}`;
      if (seleksiGelombangFilter) query += `&gelombang_id=${encodeURIComponent(seleksiGelombangFilter)}`;
      else if (seleksiTahunFilter) query += `&tahun_akademik=${encodeURIComponent(seleksiTahunFilter)}`;
      if (seleksiJalurFilter) query += `&jalur=${encodeURIComponent(seleksiJalurFilter)}`;
      if (seleksiStatusFilter) {
        query += `&status=${encodeURIComponent(seleksiStatusFilter)}`;
      } else {
        query += `&status=berkas_diverifikasi,mengikuti_ujian,lolos_seleksi,tidak_lolos`;
      }

      const res = await api.get(query);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setSeleksiApplicants(list);
    } catch (err) {
      console.error("Gagal memuat data seleksi:", err);
      setSeleksiApplicants([]);
    } finally {
      setIsSeleksiLoading(false);
    }
  };

  const handleOpenSeleksiModal = (applicant: any) => {
    setSelectedForSeleksi(applicant);
    const currStatus = applicant.status_pendaftaran;
    let initialStatus: "lolos_seleksi" | "mengikuti_ujian" | "tidak_lolos" | "berkas_diverifikasi" = "lolos_seleksi";
    if (currStatus === "mengikuti_ujian") initialStatus = "mengikuti_ujian";
    else if (currStatus === "tidak_lolos") initialStatus = "tidak_lolos";
    else if (currStatus === "lolos_seleksi") initialStatus = "lolos_seleksi";

    setSeleksiForm({
      status: initialStatus,
      nilai_ujian: "",
      nilai_wawancara: "",
      catatan: applicant.catatan_seleksi || applicant.catatan_revisi || "",
    });
    setIsSeleksiModalOpen(true);
  };

  const handleSubmitSeleksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForSeleksi) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/pendaftar/${selectedForSeleksi.id}/status-seleksi`, {
        status: seleksiForm.status,
        catatan: seleksiForm.catatan,
        nilai_ujian: null,
        nilai_wawancara: null,
      });
      const statusLabel =
        seleksiForm.status === "lolos_seleksi"
          ? "Lolos Seleksi (Diterima)"
          : seleksiForm.status === "mengikuti_ujian"
          ? "Jadwalkan Wawancara"
          : "Tidak Lolos";
      alert(`Keputusan seleksi berhasil disimpan! Status calon mahasiswa: ${statusLabel}`);
      setIsSeleksiModalOpen(false);
      setSelectedForSeleksi(null);
      loadSeleksiData();
      loadPendaftars(meta.page);
      loadStats();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan keputusan seleksi");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!checkAuth()) return;
    const user = authStorage.getUser();
    if (user) {
      setCurrentUser(user);
      loadNavMenus(user.role);
    } else {
      loadNavMenus();
    }
    loadStats();
    loadPendaftars();
    loadGelombangs();
    loadProdis();
    loadSettings();
    loadFaqs();
    if (user?.role === "super_admin") {
      loadRBACData();
    }
    loadRekeningList();
    loadJalurList();
    loadPersyaratanDocList();
    loadHotlineList();
    loadTataCaraList();
  }, []);

  useEffect(() => {
    if (activeTab === "logs") loadLogs();
    if (activeTab === "gelombang" || activeTab === "pendaftaran") {
      loadGelombangs();
      loadJalurList();
      loadPersyaratanDocList();
      loadRekeningList();
    }
    if (activeTab === "prodi") {
      loadProdis();
      loadTataCaraList();
    }
    if (activeTab === "hotline") {
      loadHotlineList();
      loadSettings();
    }
    if (activeTab === "export") loadExportData();
    if (activeTab === "seleksi") loadSeleksiData();
    if (activeTab === "homepage" || activeTab === "settings") {
      loadSettings();
      loadFaqs();
      loadJalurList();
      loadProdis();
    }
    if (activeTab === "rbac") {
      const user = currentUser || authStorage.getUser();
      if (user?.role === "super_admin") {
        loadRBACData();
        loadRolePermissions(selectedRoleForMatrix);
      } else {
        // Non-super-admin is not allowed to access RBAC tab
        setActiveTab("pendaftar");
      }
    }
  }, [activeTab]);

  // Enforce allowed tabs for non-super-admin roles
  useEffect(() => {
    if (allowedTabKeys.length > 0 && !allowedTabKeys.includes("*") && !allowedTabKeys.includes(activeTab)) {
      setActiveTab(allowedTabKeys[0] || "pendaftar");
    }
  }, [activeTab, allowedTabKeys]);

  useEffect(() => {
    if (activeTab === "export") {
      loadExportData();
    }
  }, [exportProdiFilter, exportGelombangFilter, exportStatusFilter, exportStatusBayarFilter]);

  useEffect(() => {
    if (activeTab === "seleksi") {
      loadSeleksiData();
    }
  }, [seleksiSearch, seleksiProdiFilter, seleksiGelombangFilter, seleksiJalurFilter, seleksiStatusFilter, seleksiTahunFilter]);

  useEffect(() => {
    if (activeTab === "pendaftar" || activeTab === "verifikasi") {
      const timer = setTimeout(() => {
        loadPendaftars(1);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [search, prodiFilter, statusFilter, jalurFilter, statusBayarFilter, pendaftarTahunFilter, pendaftarGelombangFilter, activeTab]);

  useEffect(() => {
    if (activeTab === "rbac") {
      loadRolePermissions(selectedRoleForMatrix);
    }
  }, [selectedRoleForMatrix]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(pendaftars.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const openDetail = async (pendaftarId: number) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/pendaftar/${pendaftarId}`);
      setSelectedPendaftar(res.data);
      setIsDetailOpen(true);
    } catch (err) {
      const found = pendaftars.find((p) => p.id === pendaftarId);
      if (found) {
        setSelectedPendaftar(found);
        setIsDetailOpen(true);
      } else {
        alert("Gagal memuat detail pendaftar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifikasiDokumen = async (berkasId: number, status: "valid" | "invalid", catatanAdmin = "") => {
    if (!selectedPendaftar) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/pendaftar/${selectedPendaftar.id}/verifikasi-berkas`, {
        berkas_id: berkasId,
        status,
        catatan_admin: catatanAdmin,
      });
      // Refresh detail data
      const res = await api.get(`/admin/pendaftar/${selectedPendaftar.id}`);
      setSelectedPendaftar(res.data);
      setRejectingBerkas(null);
      setRejectNote("");
      loadPendaftars(meta.page);
      loadStats();
      alert(`Berkas berhasil ${status === "valid" ? "diverifikasi sah" : "ditandai perlu revisi"}!`);
    } catch (err: any) {
      alert(err.message || "Gagal memverifikasi berkas");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMintaRevisiGlobal = async (catatan: string) => {
    if (!selectedPendaftar) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/pendaftar/${selectedPendaftar.id}/status-seleksi`, {
        status: "belum_lengkap",
        catatan,
      });
      const res = await api.get(`/admin/pendaftar/${selectedPendaftar.id}`);
      setSelectedPendaftar(res.data);
      setRejectingBerkas(null);
      setRejectNote("");
      loadPendaftars(meta.page);
      loadStats();
      alert("Instruksi revisi berhasil dikirim! Status pendaftaran diubah menjadi 'Belum Lengkap / Perlu Revisi', dan formulir pendaftaran mahasiswa dibuka kembali untuk unggah ulang.");
    } catch (err: any) {
      alert(err.message || "Gagal mengirim permintaan revisi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifikasiPembayaran = async (pembayaranId: number, status: "diterima" | "ditolak", alasan = "") => {
    if (!selectedPendaftar) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/pendaftar/${selectedPendaftar.id}/verifikasi-pembayaran`, {
        pembayaran_id: pembayaranId,
        status,
        alasan_penolakan: alasan,
      });
      const res = await api.get(`/admin/pendaftar/${selectedPendaftar.id}`);
      setSelectedPendaftar(res.data);
      setRejectingPembayaran(null);
      setRejectPembayaranNote("");
      loadPendaftars(meta.page);
      loadStats();
      alert(`Status pembayaran berhasil ${status === "diterima" ? "diverifikasi sah (lunas)" : "ditolak"}!`);
    } catch (err: any) {
      alert(err.message || "Gagal memverifikasi pembayaran");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatusSeleksi = async (status: string, catatan = "") => {
    if (!selectedPendaftar) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/pendaftar/${selectedPendaftar.id}/status-seleksi`, {
        status,
        catatan,
      });
      const res = await api.get(`/admin/pendaftar/${selectedPendaftar.id}`);
      setSelectedPendaftar(res.data);
      loadPendaftars(meta.page);
      loadStats();
      alert(`Status seleksi pendaftar berhasil diperbarui menjadi ${status}!`);
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status seleksi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifikasiBerkas = async (status: string) => {
    if (!selectedPendaftar) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/pendaftar/${selectedPendaftar.id}/verifikasi-berkas`, {
        status,
        catatan: actionNotes,
      });
      alert(`Berkas pendaftar ${status === "diverifikasi" ? "diverifikasi sah" : "ditolak/revisi"}!`);
      setActionNotes("");
      setIsDetailOpen(false);
      loadPendaftars(meta.page);
      loadStats();
    } catch (err: any) {
      alert(err.message || "Gagal memverifikasi berkas");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await api.put("/admin/settings", settings);
      alert("Pengaturan berhasil disimpan secara real-time!");
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Section-specific & Global Save Actions
  const handleSaveBannerHomepage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload = {
        ...settings,
        jalur_pendaftaran_info: JSON.stringify(jalurCards),
        homepage_prodi_list: JSON.stringify(homepageProdis),
      };
      await api.put("/admin/settings", payload);
      setSettings(payload);
      setIsBannerDirty(false);
      alert("Pengaturan Teks Banner & Pengumuman berhasil disimpan!");
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan banner");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveProdiHomepage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload = {
        ...settings,
        jalur_pendaftaran_info: JSON.stringify(jalurCards),
        homepage_prodi_list: JSON.stringify(homepageProdis),
      };
      await api.put("/admin/settings", payload);
      setSettings(payload);
      setIsProdiDirty(false);
      alert("Pengaturan Kartu Program Studi Homepage berhasil disimpan!");
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kartu program studi");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveJalurHomepage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload = {
        ...settings,
        jalur_pendaftaran_info: JSON.stringify(jalurCards),
        homepage_prodi_list: JSON.stringify(homepageProdis),
      };
      await api.put("/admin/settings", payload);
      setSettings(payload);
      setIsJalurDirty(false);
      alert("Pengaturan Kartu Jalur Masuk Homepage berhasil disimpan!");
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kartu jalur pendaftaran");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveHomepageSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload = {
        ...settings,
        jalur_pendaftaran_info: JSON.stringify(jalurCards),
        homepage_prodi_list: JSON.stringify(homepageProdis),
      };
      await api.put("/admin/settings", payload);
      setSettings(payload);
      setIsBannerDirty(false);
      setIsProdiDirty(false);
      setIsJalurDirty(false);
      alert("Seluruh pengaturan konten Homepage berhasil disimpan dan langsung aktif di halaman depan!");
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan homepage");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddHomepageJalur = () => {
    if (!selectedJalurToAdd) {
      alert("Silakan pilih jalur pendaftaran yang ingin ditambahkan!");
      return;
    }
    const found = jalurList.find((j) => String(j.id) === String(selectedJalurToAdd));
    if (!found) return;

    if (jalurCards.some((c) => String(c.jalur_id || c.id) === String(found.id) || c.kode === found.kode)) {
      alert("Jalur pendaftaran ini sudah ada dalam daftar kartu Homepage!");
      return;
    }

    const newCard = {
      jalur_id: found.id,
      id: found.kode || String(found.id),
      kode: found.kode || "",
      nama: found.nama || "",
      badge: found.badge_text || found.nama,
      deskripsi: found.deskripsi || "Jalur pendaftaran resmi mahasiswa baru.",
      is_aktif: true,
    };
    setJalurCards((prev) => [...prev, newCard]);
    setSelectedJalurToAdd("");
    setIsJalurDirty(true);
  };

  const handleAddJalurCard = handleAddHomepageJalur;

  const handleUpdateJalurCard = (index: number, field: string, value: any) => {
    setJalurCards((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setIsJalurDirty(true);
  };

  const handleRemoveJalurCard = (index: number) => {
    if (confirm("Hapus kartu jalur pendaftaran ini dari homepage?")) {
      setJalurCards((prev) => prev.filter((_, i) => i !== index));
      setIsJalurDirty(true);
    }
  };

  const handleAddHomepageProdi = () => {
    if (!selectedProdiToAdd) {
      alert("Silakan pilih program studi yang ingin ditambahkan!");
      return;
    }
    const found = prodiList.find((p) => String(p.id) === String(selectedProdiToAdd));
    if (!found) return;

    if (homepageProdis.some((p) => String(p.prodi_id) === String(found.id))) {
      alert("Program studi ini sudah ada dalam daftar kartu Homepage!");
      return;
    }

    const newHomepageCard = {
      prodi_id: found.id,
      kode: found.kode || "",
      nama: found.nama || "",
      deskripsi_singkat: found.deskripsi || "Program studi unggulan berlandaskan keilmuan Islam modern dan integritas santri.",
      badge_jenjang: "Jenjang " + (found.jenjang || "S1"),
      badge_gelar: found.gelar_akademik ? `Gelar ${found.gelar_akademik}` : "Gelar Sarjana",
      badge_akreditasi: "Terakreditasi BAN-PT",
    };

    setHomepageProdis((prev) => [...prev, newHomepageCard]);
    setSelectedProdiToAdd("");
    setIsProdiDirty(true);
  };

  const handleUpdateHomepageProdi = (index: number, field: string, value: string) => {
    setHomepageProdis((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setIsProdiDirty(true);
  };

  const handleRemoveHomepageProdi = (index: number) => {
    if (confirm("Hapus kartu program studi ini dari tampilan homepage?")) {
      setHomepageProdis((prev) => prev.filter((_, i) => i !== index));
      setIsProdiDirty(true);
    }
  };

  // FAQ Modal & Actions
  const openAddFaqModal = () => {
    setEditingFaq(null);
    setFaqForm({
      kategori: "Umum",
      pertanyaan: "",
      jawaban: "",
      urutan: faqsList.length + 1,
      is_aktif: true,
    });
    setIsFaqModalOpen(true);
  };

  const openEditFaqModal = (faq: any) => {
    setEditingFaq(faq);
    setFaqForm({
      kategori: faq.kategori || "Umum",
      pertanyaan: faq.pertanyaan,
      jawaban: faq.jawaban,
      urutan: faq.urutan || 1,
      is_aktif: faq.is_aktif ?? true,
    });
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFaq(true);
    try {
      if (editingFaq) {
        await api.put(`/admin/faqs/${editingFaq.id}`, faqForm);
        alert("FAQ berhasil diperbarui!");
      } else {
        await api.post("/admin/faqs", faqForm);
        alert("FAQ baru berhasil ditambahkan!");
      }
      setIsFaqModalOpen(false);
      loadFaqs();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan FAQ");
    } finally {
      setIsSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pertanyaan FAQ ini?")) return;
    try {
      await api.delete(`/admin/faqs/${id}`);
      alert("FAQ berhasil dihapus!");
      loadFaqs();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus FAQ");
    }
  };

  const handleToggleFaq = async (id: number) => {
    try {
      await api.patch(`/admin/faqs/${id}/toggle`, {});
      loadFaqs();
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status FAQ");
    }
  };

  const handleCreateGelombang = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.post("/admin/gelombang", newGelombang);
      alert("Gelombang pendaftaran baru berhasil dibuat!");
      setIsAddGelombangOpen(false);
      loadGelombangs();
      loadStats();
    } catch (err: any) {
      alert(err.message || "Gagal membuat gelombang");
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditGelombangModal = (gel: any) => {
    setSelectedGelombangId(gel.id);
    setEditGelombang({
      nama: gel.nama || "",
      tahun_akademik: gel.tahun_akademik || "2026/2027",
      tanggal_buka: gel.tanggal_buka ? String(gel.tanggal_buka).split("T")[0] : "",
      tanggal_tutup: gel.tanggal_tutup ? String(gel.tanggal_tutup).split("T")[0] : "",
      biaya_pendaftaran: Number(gel.biaya_pendaftaran) || 0,
      kuota: Number(gel.kuota) || 0,
      is_aktif: gel.is_aktif ?? true,
    });
    setIsEditGelombangOpen(true);
  };

  const handleUpdateGelombang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGelombangId) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/gelombang/${selectedGelombangId}`, {
        ...editGelombang,
        biaya_pendaftaran: Number(editGelombang.biaya_pendaftaran),
        kuota: Number(editGelombang.kuota),
      });
      alert("Gelombang pendaftaran berhasil diperbarui!");
      setIsEditGelombangOpen(false);
      setSelectedGelombangId(null);
      loadGelombangs();
      loadStats();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui gelombang");
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // REKENING PEMBAYARAN (MULTI-BANK) HANDLERS
  // ==========================================
  const openAddRekeningModal = () => {
    setSelectedRekeningId(null);
    setRekeningForm({
      nama_bank: "",
      nomor_rekening: "",
      atas_nama: "",
      cabang: "",
      instruksi_transfer: "",
      is_utama: rekeningList.length === 0,
      is_aktif: true,
      urutan: rekeningList.length + 1,
    });
    setIsAddRekeningOpen(true);
  };

  const openEditRekeningModal = (rek: any) => {
    setSelectedRekeningId(rek.id);
    setRekeningForm({
      nama_bank: rek.nama_bank || "",
      nomor_rekening: rek.nomor_rekening || "",
      atas_nama: rek.atas_nama || "",
      cabang: rek.cabang || "",
      instruksi_transfer: rek.instruksi_transfer || "",
      is_utama: rek.is_utama ?? false,
      is_aktif: rek.is_aktif ?? true,
      urutan: rek.urutan || 1,
    });
    setIsEditRekeningOpen(true);
  };

  const handleSaveRekening = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (selectedRekeningId) {
        await api.put(`/admin/rekening/${selectedRekeningId}`, rekeningForm);
        alert("Rekening pembayaran berhasil diperbarui!");
        setIsEditRekeningOpen(false);
      } else {
        await api.post("/admin/rekening", rekeningForm);
        alert("Rekening pembayaran baru berhasil ditambahkan!");
        setIsAddRekeningOpen(false);
      }
      loadRekeningList();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan rekening pembayaran");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRekening = async (id: number, namaBank: string) => {
    if (!confirm(`Hapus rekening bank "${namaBank}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.delete(`/admin/rekening/${id}`);
      alert("Rekening berhasil dihapus!");
      loadRekeningList();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus rekening");
    }
  };

  const handleToggleRekening = async (id: number) => {
    try {
      await api.patch(`/admin/rekening/${id}/toggle`, {});
      loadRekeningList();
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status rekening");
    }
  };

  // ==========================================
  // MASTER JALUR PENDAFTARAN HANDLERS
  // ==========================================
  const openAddJalurModal = () => {
    setSelectedJalurId(null);
    setJalurForm({
      kode: "",
      nama: "",
      badge_text: "",
      deskripsi: "",
      syarat_khusus: "",
      bebas_biaya: false,
      tampil_di_homepage: true,
      is_aktif: true,
      urutan: jalurList.length + 1,
    });
    setIsAddJalurOpen(true);
  };

  const openEditJalurModal = (jal: any) => {
    setSelectedJalurId(jal.id);
    setJalurForm({
      kode: jal.kode || "",
      nama: jal.nama || "",
      badge_text: jal.badge_text || "",
      deskripsi: jal.deskripsi || "",
      syarat_khusus: jal.syarat_khusus || "",
      bebas_biaya: jal.bebas_biaya ?? false,
      tampil_di_homepage: jal.tampil_di_homepage ?? true,
      is_aktif: jal.is_aktif ?? true,
      urutan: jal.urutan || 1,
    });
    setIsEditJalurOpen(true);
  };

  const handleSaveJalur = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (selectedJalurId) {
        await api.put(`/admin/jalur/${selectedJalurId}`, jalurForm);
        alert("Jalur pendaftaran berhasil diperbarui!");
        setIsEditJalurOpen(false);
        // Sync to homepage jalur cards if present
        const updatedJalurCards = jalurCards.map((c) => {
          if (String(c.jalur_id || c.id) === String(selectedJalurId) || c.kode === jalurForm.kode) {
            return {
              ...c,
              nama: jalurForm.nama || c.nama,
              badge: jalurForm.badge_text || c.badge,
              deskripsi: jalurForm.deskripsi || c.deskripsi,
            };
          }
          return c;
        });
        if (JSON.stringify(updatedJalurCards) !== JSON.stringify(jalurCards)) {
          setJalurCards(updatedJalurCards);
          await api.put("/admin/settings", {
            ...settings,
            jalur_pendaftaran_info: JSON.stringify(updatedJalurCards),
          });
        }
      } else {
        await api.post("/admin/jalur", jalurForm);
        alert("Jalur pendaftaran baru berhasil ditambahkan!");
        setIsAddJalurOpen(false);
      }
      loadJalurList();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan jalur pendaftaran");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteJalur = async (id: number, namaJalur: string) => {
    if (!confirm(`Hapus jalur pendaftaran "${namaJalur}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.delete(`/admin/jalur/${id}`);
      alert("Jalur pendaftaran berhasil dihapus!");
      const remainingJalur = jalurCards.filter((c) => String(c.jalur_id || c.id) !== String(id));
      if (remainingJalur.length !== jalurCards.length) {
        setJalurCards(remainingJalur);
        await api.put("/admin/settings", {
          ...settings,
          jalur_pendaftaran_info: JSON.stringify(remainingJalur),
        });
      }
      loadJalurList();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus jalur pendaftaran");
    }
  };

  const handleToggleJalur = async (id: number) => {
    try {
      await api.patch(`/admin/jalur/${id}/toggle`, {});
      loadJalurList();
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status jalur");
    }
  };

  // ==========================================
  // PERSYARATAN DOKUMEN HANDLERS
  // ==========================================
  const openAddPersyaratanModal = () => {
    setSelectedPersyaratanId(null);
    setPersyaratanForm({
      nama_dokumen: "",
      kode: "",
      deskripsi: "",
      is_wajib: true,
      jalur_khusus: "",
      tipe_file: "PDF, JPG, PNG",
      max_size_mb: 2,
      is_aktif: true,
      urutan: persyaratanDocList.length + 1,
    });
    setIsAddPersyaratanOpen(true);
  };

  const openEditPersyaratanModal = (doc: any) => {
    setSelectedPersyaratanId(doc.id);
    setPersyaratanForm({
      nama_dokumen: doc.nama_dokumen || "",
      kode: doc.kode || "",
      deskripsi: doc.deskripsi || "",
      is_wajib: doc.is_wajib ?? true,
      jalur_khusus: doc.jalur_khusus || "",
      tipe_file: doc.tipe_file || "PDF, JPG, PNG",
      max_size_mb: doc.max_size_mb || 2,
      is_aktif: doc.is_aktif ?? true,
      urutan: doc.urutan || 1,
    });
    setIsEditPersyaratanOpen(true);
  };

  const handleSavePersyaratan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (selectedPersyaratanId) {
        await api.put(`/admin/persyaratan/${selectedPersyaratanId}`, persyaratanForm);
        alert("Persyaratan dokumen berhasil diperbarui!");
        setIsEditPersyaratanOpen(false);
      } else {
        await api.post("/admin/persyaratan", persyaratanForm);
        alert("Persyaratan dokumen baru berhasil dibuat!");
        setIsAddPersyaratanOpen(false);
      }
      loadPersyaratanDocList();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan persyaratan dokumen");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePersyaratan = async (id: number, namaDoc: string) => {
    if (!confirm(`Hapus persyaratan berkas "${namaDoc}"?`)) return;
    try {
      await api.delete(`/admin/persyaratan/${id}`);
      alert("Persyaratan berhasil dihapus!");
      loadPersyaratanDocList();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus persyaratan");
    }
  };

  const handleTogglePersyaratan = async (id: number) => {
    try {
      await api.patch(`/admin/persyaratan/${id}/toggle`, {});
      loadPersyaratanDocList();
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status persyaratan");
    }
  };

  // ==========================================
  // KONTAK HOTLINE & NARAHUBUNG HANDLERS
  // ==========================================
  const openAddHotlineModal = () => {
    setSelectedHotlineId(null);
    setHotlineForm({
      nama_layanan: "",
      tipe_kontak: "whatsapp",
      nomor_atau_email: "",
      nama_petugas: "",
      jam_layanan: "Senin - Sabtu: 08.00 - 16.00 WIB",
      is_aktif: true,
      urutan: hotlineList.length + 1,
    });
    setIsAddHotlineOpen(true);
  };

  const openEditHotlineModal = (hl: any) => {
    setSelectedHotlineId(hl.id);
    setHotlineForm({
      nama_layanan: hl.nama_layanan || "",
      tipe_kontak: hl.tipe_kontak || "whatsapp",
      nomor_atau_email: hl.nomor_atau_email || "",
      nama_petugas: hl.nama_petugas || "",
      jam_layanan: hl.jam_layanan || "Senin - Sabtu: 08.00 - 16.00 WIB",
      is_aktif: hl.is_aktif ?? true,
      urutan: hl.urutan || 1,
    });
    setIsEditHotlineOpen(true);
  };

  const handleSaveHotline = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (selectedHotlineId) {
        await api.put(`/admin/hotline/${selectedHotlineId}`, hotlineForm);
        alert("Kontak narahubung berhasil diperbarui!");
        setIsEditHotlineOpen(false);
      } else {
        await api.post("/admin/hotline", hotlineForm);
        alert("Kontak narahubung baru berhasil ditambahkan!");
        setIsAddHotlineOpen(false);
      }
      loadHotlineList();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kontak hotline");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteHotline = async (id: number, namaLayanan: string) => {
    if (!confirm(`Hapus narahubung "${namaLayanan}"?`)) return;
    try {
      await api.delete(`/admin/hotline/${id}`);
      alert("Narahubung berhasil dihapus!");
      loadHotlineList();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus narahubung");
    }
  };

  const handleToggleHotline = async (id: number) => {
    try {
      await api.patch(`/admin/hotline/${id}/toggle`, {});
      loadHotlineList();
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status narahubung");
    }
  };

  // ==========================================
  // TATA CARA PENDAFTARAN TERPUSAT HANDLERS
  // ==========================================
  const handleAddGlobalTataCaraStep = () => {
    setIsTataCaraDirty(true);
    setTataCaraList((prev) => [
      ...prev,
      {
        nomor_langkah: prev.length + 1,
        judul: `Langkah ${prev.length + 1}`,
        deskripsi: "",
        icon: "FileText",
        is_aktif: true,
        urutan: prev.length + 1,
      },
    ]);
  };

  const handleRemoveGlobalTataCaraStep = (index: number) => {
    setIsTataCaraDirty(true);
    setTataCaraList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleGlobalTataCaraStepChange = (index: number, field: string, value: any) => {
    setIsTataCaraDirty(true);
    setTataCaraList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleResetGlobalTataCaraSteps = () => {
    if (confirm("Reset alur tata cara pendaftaran ke template standar 5 langkah PMB STAICI?")) {
      setIsTataCaraDirty(true);
      const defaultSteps = [
        { nomor_langkah: 1, judul: "Konsultasi Pendaftaran", deskripsi: "Hubungi panitia PMB untuk memperoleh informasi gelombang, jadwal, dan biaya pendidikan.", icon: "MessageSquare", is_aktif: true, urutan: 1 },
        { nomor_langkah: 2, judul: "Pilih Jalur Pendaftaran", deskripsi: "Tentukan jalur masuk sesuai pilihan dan ketentuan kampus (Reguler atau Beasiswa KIP).", icon: "Award", is_aktif: true, urutan: 2 },
        { nomor_langkah: 3, judul: "Isi Formulir dan Unggah Berkas", deskripsi: "Mengisi formulir pendaftaran dan menyerahkan berkas persyaratan yang dibutuhkan.", icon: "FileText", is_aktif: true, urutan: 3 },
        { nomor_langkah: 4, judul: "Bayar Biaya Pendaftaran", deskripsi: "Lakukan pembayaran sesuai petunjuk dan nomor rekening resmi yang tersedia.", icon: "CreditCard", is_aktif: true, urutan: 4 },
        { nomor_langkah: 5, judul: "Tunggu Informasi", deskripsi: "Silahkan menunggu verifikasi dan pengumuman hasil seleksi melalui website resmi.", icon: "CheckCircle2", is_aktif: true, urutan: 5 },
      ];
      setTataCaraList(defaultSteps);
    }
  };

  const handleSaveBulkTataCara = async () => {
    setIsSavingTataCara(true);
    try {
      await api.post("/admin/tata-cara/bulk", tataCaraList);
      setIsTataCaraDirty(false);
      alert("Alur tata cara pendaftaran resmi berhasil disinkronkan ke seluruh sistem dan halaman prodi!");
      loadTataCaraList();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan tata cara pendaftaran");
    } finally {
      setIsSavingTataCara(false);
    }
  };

  // Program Studi CRUD Actions
  const handleAddProfilItem = () => {
    setProdiForm((prev) => ({
      ...prev,
      profil_lulusan: [...prev.profil_lulusan, { title: "", desc: "" }],
    }));
  };

  const handleRemoveProfilItem = (index: number) => {
    setProdiForm((prev) => ({
      ...prev,
      profil_lulusan: prev.profil_lulusan.filter((_, i) => i !== index),
    }));
  };

  const handleProfilItemChange = (index: number, field: "title" | "desc", value: string) => {
    setProdiForm((prev) => {
      const updated = [...prev.profil_lulusan];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, profil_lulusan: updated };
    });
  };

  const handleAddCapaianItem = () => {
    setProdiForm((prev) => ({
      ...prev,
      capaian_pembelajaran: [...prev.capaian_pembelajaran, { title: "", desc: "" }],
    }));
  };

  const handleRemoveCapaianItem = (index: number) => {
    setProdiForm((prev) => ({
      ...prev,
      capaian_pembelajaran: prev.capaian_pembelajaran.filter((_, i) => i !== index),
    }));
  };

  const handleCapaianItemChange = (index: number, field: "title" | "desc", value: string) => {
    setProdiForm((prev) => {
      const updated = [...prev.capaian_pembelajaran];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, capaian_pembelajaran: updated };
    });
  };

  const openAddProdiModal = () => {
    setSelectedProdiId(null);
    setProdiModalTab("dasar");
    setProdiForm({
      kode: "",
      nama: "",
      jenjang: "S1",
      gelar_akademik: "",
      deskripsi: "",
      profil_lulusan_intro: "",
      profil_lulusan: [{ title: "", desc: "" }],
      capaian_pembelajaran: [{ title: "", desc: "" }],
      is_aktif: true,
    });
    setIsAddProdiOpen(true);
  };

  const openEditProdiModal = (prodi: any) => {
    setSelectedProdiId(prodi.id);
    setProdiModalTab("dasar");

    let parsedProfil: any[] = [];
    if (Array.isArray(prodi.profil_lulusan)) {
      parsedProfil = prodi.profil_lulusan;
    } else if (typeof prodi.profil_lulusan === "string" && prodi.profil_lulusan) {
      try {
        parsedProfil = JSON.parse(prodi.profil_lulusan);
      } catch {
        parsedProfil = [];
      }
    }

    let parsedCapaian: any[] = [];
    if (Array.isArray(prodi.capaian_pembelajaran)) {
      parsedCapaian = prodi.capaian_pembelajaran;
    } else if (typeof prodi.capaian_pembelajaran === "string" && prodi.capaian_pembelajaran) {
      try {
        parsedCapaian = JSON.parse(prodi.capaian_pembelajaran);
      } catch {
        parsedCapaian = [];
      }
    }

    setProdiForm({
      kode: prodi.kode || "",
      nama: prodi.nama || "",
      jenjang: prodi.jenjang || "S1",
      gelar_akademik: prodi.gelar_akademik || "",
      deskripsi: prodi.deskripsi || "",
      profil_lulusan_intro: prodi.profil_lulusan_intro || "",
      profil_lulusan: parsedProfil.length > 0 ? parsedProfil : [{ title: "", desc: "" }],
      capaian_pembelajaran: parsedCapaian.length > 0 ? parsedCapaian : [{ title: "", desc: "" }],
      is_aktif: prodi.is_aktif ?? true,
    });
    setIsEditProdiOpen(true);
  };

  const handleCreateProdi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = {
        ...prodiForm,
        profil_lulusan: JSON.stringify(prodiForm.profil_lulusan.filter((p) => p.title.trim())),
        capaian_pembelajaran: JSON.stringify(prodiForm.capaian_pembelajaran.filter((c) => c.title.trim())),
        alur_pendaftaran: "",
      };
      await api.post("/admin/program-studi", payload);
      setIsAddProdiOpen(false);
      await loadProdis();
      alert("Program studi baru berhasil ditambahkan!");
    } catch (err: any) {
      alert(err.message || err.resJson?.message || "Gagal menambahkan program studi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProdi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdiId) return;
    setIsProcessing(true);
    try {
      const payload = {
        ...prodiForm,
        profil_lulusan: JSON.stringify(prodiForm.profil_lulusan.filter((p) => p.title.trim())),
        capaian_pembelajaran: JSON.stringify(prodiForm.capaian_pembelajaran.filter((c) => c.title.trim())),
        alur_pendaftaran: "",
      };
      await api.put(`/admin/program-studi/${selectedProdiId}`, payload);
      setIsEditProdiOpen(false);
      setSelectedProdiId(null);
      // Sync to homepage prodis if present
      const updatedHomepage = homepageProdis.map((hp) => {
        if (String(hp.prodi_id) === String(selectedProdiId)) {
          return {
            ...hp,
            kode: prodiForm.kode || hp.kode,
            nama: prodiForm.nama || hp.nama,
            badge_jenjang: "Jenjang " + (prodiForm.jenjang || "S1"),
            badge_gelar: prodiForm.gelar_akademik ? `Gelar ${prodiForm.gelar_akademik}` : hp.badge_gelar,
          };
        }
        return hp;
      });
      if (JSON.stringify(updatedHomepage) !== JSON.stringify(homepageProdis)) {
        setHomepageProdis(updatedHomepage);
        try {
          await api.put("/admin/settings", {
            ...settings,
            homepage_prodi_list: JSON.stringify(updatedHomepage),
          });
        } catch (settingsErr) {
          console.warn("Gagal sync homepage settings saat update:", settingsErr);
        }
      }
      await loadProdis();
      alert("Data program studi berhasil diperbarui!");
    } catch (err: any) {
      alert(err.message || err.resJson?.message || "Gagal memperbarui program studi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProdi = async (prodi: any) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus Program Studi "${prodi.nama}" (${prodi.kode})?\n\nTindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmDelete) return;

    setIsProcessing(true);
    try {
      // 1. Optimistic UI update so the prodi disappears immediately from the list
      setProdiList((prev) => prev.filter((p) => String(p.id) !== String(prodi.id)));

      // 2. Call backend delete endpoint
      await api.delete(`/admin/program-studi/${prodi.id}`);

      // 3. Remove prodi card from homepage cards if present
      const remainingHomepage = homepageProdis.filter(
        (hp) => String(hp.prodi_id) !== String(prodi.id) && String(hp.id) !== String(prodi.id) && hp.kode !== prodi.kode
      );
      if (remainingHomepage.length !== homepageProdis.length) {
        setHomepageProdis(remainingHomepage);
        try {
          await api.put("/admin/settings", {
            ...settings,
            homepage_prodi_list: JSON.stringify(remainingHomepage),
          });
        } catch (settingsErr) {
          console.warn("Gagal sinkronisasi homepage settings saat prodi dihapus:", settingsErr);
        }
      }

      await loadProdis();
      alert(`Program studi "${prodi.nama}" (${prodi.kode}) berhasil dihapus.`);
    } catch (err: any) {
      // Rollback on error
      await loadProdis();
      const errMsg = err.message || err.resJson?.message || "Gagal menghapus program studi";
      alert(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // RBAC Actions
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.post("/admin/rbac/roles", newRole);
      alert("Role baru berhasil dibuat!");
      setNewRole({ kode: "", nama: "", deskripsi: "" });
      loadRBACData();
    } catch (err: any) {
      alert(err.message || "Gagal membuat role baru");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.post("/admin/rbac/menu-groups", newGroup);
      alert("Menu Group baru berhasil dibuat!");
      setNewGroup({ nama: "", urutan: 1 });
      loadRBACData();
      loadNavMenus();
    } catch (err: any) {
      alert(err.message || "Gagal membuat menu group");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.post("/admin/rbac/menus", {
        ...newMenu,
        menu_group_id: Number(newMenu.menu_group_id),
      });
      alert("Item Menu baru berhasil dibuat!");
      setNewMenu({
        menu_group_id: allMenuGroupsList[0]?.id || 1,
        nama: "",
        key: "",
        icon: "Users",
        url: "",
        badge_text: "",
        urutan: 1,
      });
      loadRBACData();
      loadNavMenus();
    } catch (err: any) {
      alert(err.message || "Gagal membuat menu baru");
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditGroupModal = (group: any) => {
    setEditingGroup({
      id: group.id,
      nama: group.nama || "",
      urutan: group.urutan || 1,
    });
    setIsEditGroupModalOpen(true);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/rbac/menu-groups/${editingGroup.id}`, {
        nama: editingGroup.nama,
        urutan: Number(editingGroup.urutan),
      });
      alert("Menu Group berhasil diperbarui!");
      setIsEditGroupModalOpen(false);
      setEditingGroup(null);
      loadRBACData();
      loadNavMenus();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui menu group");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteGroup = async (groupId: number, groupNama: string) => {
    const hasRbac = allMenusList.some((m) => m.menu_group_id === groupId && (m.key === "rbac" || m.url === "rbac"));
    if (hasRbac) {
      alert(`Menu Group "${groupNama}" tidak dapat dihapus karena memuat modul 'Manajemen Role & RBAC' inti sistem.`);
      return;
    }
    const hasMenus = allMenusList.some((m) => m.menu_group_id === groupId);
    const msg = hasMenus
      ? `Apakah Anda yakin ingin menghapus Menu Group "${groupNama}"?\n\nPERINGATAN: Seluruh item menu di dalam grup ini beserta hak aksesnya akan ikut terhapus!`
      : `Apakah Anda yakin ingin menghapus Menu Group "${groupNama}"?`;
    if (!window.confirm(msg)) return;

    setIsProcessing(true);
    try {
      await api.delete(`/admin/rbac/menu-groups/${groupId}`);
      alert(`Menu Group "${groupNama}" berhasil dihapus!`);
      loadRBACData();
      loadNavMenus();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus menu group");
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditMenuModal = (menu: any) => {
    setEditingMenu({
      id: menu.id,
      menu_group_id: menu.menu_group_id,
      nama: menu.nama || "",
      key: menu.key || "",
      icon: menu.icon || "Users",
      url: menu.url || menu.key || "",
      badge_text: menu.badge_text || "",
      urutan: menu.urutan || 1,
    });
    setEditMenuIconSearchTerm("");
    setEditMenuIconCategoryFilter("Semua");
    setIsEditMenuModalOpen(true);
  };

  const handleUpdateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/rbac/menus/${editingMenu.id}`, {
        menu_group_id: Number(editingMenu.menu_group_id),
        nama: editingMenu.nama,
        key: editingMenu.key,
        icon: editingMenu.icon,
        url: editingMenu.url || editingMenu.key,
        badge_text: editingMenu.badge_text,
        urutan: Number(editingMenu.urutan),
      });
      alert("Item Menu berhasil diperbarui!");
      setIsEditMenuModalOpen(false);
      setEditingMenu(null);
      loadRBACData();
      loadNavMenus();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui menu");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMenu = async (menuId: number, menuNama: string, menuKey: string) => {
    if (menuKey === "rbac") {
      alert("Menu 'Manajemen Role & RBAC' adalah menu sistem inti dan tidak boleh dihapus.");
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus item menu "${menuNama}" (${menuKey})?\n\nTindakan ini juga akan mencabut wewenang menu ini dari seluruh role.`)) return;

    setIsProcessing(true);
    try {
      await api.delete(`/admin/rbac/menus/${menuId}`);
      alert(`Item Menu "${menuNama}" berhasil dihapus!`);
      loadRBACData();
      loadNavMenus();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus menu");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePermission = (menuId: number) => {
    const targetMenu = allMenusList.find((m) => m.id === menuId);
    if (selectedRoleForMatrix !== "super_admin" && (targetMenu?.key === "rbac" || targetMenu?.url === "rbac")) {
      alert("Menu Pengaturan RBAC adalah menu wewenang khusus Super Administrator dan tidak dapat diberikan kepada role lain demi keamanan sistem.");
      return;
    }
    if (matrixAllowedMenuIDs.includes(menuId)) {
      setMatrixAllowedMenuIDs(matrixAllowedMenuIDs.filter((id) => id !== menuId));
    } else {
      setMatrixAllowedMenuIDs([...matrixAllowedMenuIDs, menuId]);
    }
  };

  const handleSelectAllPermissions = () => {
    const isSuperAdminTarget = selectedRoleForMatrix === "super_admin";
    const allIds = allMenusList
      .filter((m) => isSuperAdminTarget || (m.key !== "rbac" && m.url !== "rbac"))
      .map((m) => m.id);
    setMatrixAllowedMenuIDs(allIds);
  };

  const handleClearAllPermissions = () => {
    setMatrixAllowedMenuIDs([]);
  };

  const handleToggleGroupPermissions = (groupId: number) => {
    const isSuperAdminTarget = selectedRoleForMatrix === "super_admin";
    const groupMenus = allMenusList.filter(
      (m) => m.menu_group_id === groupId && (isSuperAdminTarget || (m.key !== "rbac" && m.url !== "rbac"))
    );
    const groupMenuIds = groupMenus.map((m) => m.id);
    const allInGroupSelected = groupMenuIds.length > 0 && groupMenuIds.every((id) => matrixAllowedMenuIDs.includes(id));
    if (allInGroupSelected) {
      setMatrixAllowedMenuIDs((prev) => prev.filter((id) => !groupMenuIds.includes(id)));
    } else {
      setMatrixAllowedMenuIDs((prev) => Array.from(new Set([...prev, ...groupMenuIds])));
    }
  };

  const handleSaveRolePermissions = async () => {
    setIsProcessing(true);
    try {
      const rbacMenu = allMenusList.find((m) => m.key === "rbac" || m.url === "rbac");
      const sanitizedMenuIds = selectedRoleForMatrix === "super_admin"
        ? matrixAllowedMenuIDs
        : matrixAllowedMenuIDs.filter((id) => id !== rbacMenu?.id);

      await api.post("/admin/rbac/role-permissions", {
        role_kode: selectedRoleForMatrix,
        menu_ids: sanitizedMenuIds,
      });
      alert(`Hak akses menu untuk Role '${selectedRoleForMatrix}' berhasil diperbarui!`);
      loadNavMenus();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui hak akses role");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    authStorage.clear();
    router.push("/loginadmin");
  };

  // Filter jalur seleksi yang belum ditampilkan di homepage
  const availableJalurList = jalurList.filter(
    (j) =>
      !jalurCards.some(
        (c) =>
          String(c.jalur_id) === String(j.id) ||
          String(c.id) === String(j.id) ||
          String(c.id).toLowerCase() === String(j.kode || "").toLowerCase() ||
          (c.kode && j.kode && c.kode.toLowerCase() === j.kode.toLowerCase())
      )
  );

  // Filter program studi yang belum ditampilkan di homepage
  const availableProdiList = prodiList.filter(
    (p) =>
      !homepageProdis.some(
        (item) =>
          String(item.prodi_id) === String(p.id) ||
          String(item.id) === String(p.id) ||
          (item.kode && p.kode && item.kode.toLowerCase() === p.kode.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      
      {/* 1. DYNAMIC LEFT SIDEBAR (RBAC Dynamic Menu Groups) */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between flex-shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="relative w-11 h-11 flex-shrink-0">
              <Image
                src="/logo-staici.png"
                alt="Logo STAICI"
                width={44}
                height={44}
                unoptimized
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-base font-black text-[#0d3830] leading-tight font-serif">
                STAICI PMB
              </h1>
              <p className="text-xs font-semibold text-slate-500 leading-tight">
                Panitia PMB Utama
              </p>
            </div>
          </div>

          {/* Quick Search inside Sidebar */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pendaftar/data..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0d3830]"
              />
              <span className="absolute right-2.5 top-2 text-[10px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1 rounded">
                Ctrl K
              </span>
            </div>
          </div>

          {/* DYNAMIC RBAC MENU NAVIGATION GROUPS */}
          <nav className="p-4 space-y-6">
            {navMenuGroups.length > 0 ? (
              navMenuGroups.map((group) => (
                <div key={group.id} className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                    {group.nama}
                  </p>

                  {group.menus?.map((m: any) => {
                    const isActive =
                      activeTab === m.url ||
                      activeTab === m.key ||
                      ((m.key === "homepage" || m.url === "homepage") && (activeTab === "homepage" || activeTab === "settings")) ||
                      ((m.key === "pendaftaran" || m.url === "pendaftaran") && (activeTab === "pendaftaran" || activeTab === "gelombang"));
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setActiveTab(m.url || m.key)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? "bg-[#0d3830] text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {renderNavIcon(m.icon)}
                          <span>{m.nama}</span>
                        </div>
                        {m.badge_text && (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                              isActive
                                ? "bg-emerald-500/30 text-emerald-200"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {m.badge_text === "128" ? stats.total_pendaftar : m.badge_text}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              // Fallback Default Nav Items if API is loading or unseeded
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("pendaftar")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "pendaftar" ? "bg-[#0d3830] text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>Pendaftar PMB</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">
                    {stats.total_pendaftar}
                  </span>
                </button>

                {currentUser?.role === "super_admin" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("rbac")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "rbac" ? "bg-[#0d3830] text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Manajemen Role &amp; RBAC</span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0d3830] text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {currentUser?.nama_lengkap ? currentUser.nama_lengkap.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.nama_lengkap || "Administrator PMB"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold tracking-tight ${
                      currentUser?.role === "super_admin"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 text-[#0d3830] border border-emerald-300"
                    }`}
                  >
                    {currentUser?.role === "super_admin" ? "Super Admin" : "Admin PMB"}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          {/* Left Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="font-extrabold text-[#0d3830]">PMB STAICI</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span>Portal Administrasi Terpadu</span>
          </div>

          {/* Right Header Status & Preview */}
          <div className="flex items-center gap-2.5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Buka Website Portal PMB Utama di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#0d3830]" />
              <span>Lihat Website</span>
            </a>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Main Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif">
                {activeTab === "export"
                  ? "Export Data Mahasiswa PMB"
                  : activeTab === "pendaftaran" || activeTab === "gelombang"
                  ? "CMS Pendaftaran, Gelombang & Rekening Bank"
                  : activeTab === "homepage" || activeTab === "settings"
                  ? "CMS Homepage (Halaman Depan PMB)"
                  : activeTab === "prodi"
                  ? "CMS Program Studi"
                  : activeTab === "hotline"
                  ? "Hotline & Narahubung PMB"
                  : activeTab === "emis"
                  ? "Sinkronisasi EMIS & Kopertais"
                  : activeTab === "seleksi"
                  ? "Seleksi & Penerimaan PMB"
                  : activeTab === "rbac"
                  ? "Manajemen Role & Menu RBAC"
                  : activeTab === "logs"
                  ? "Log Aktivitas & Audit"
                  : "Data Pendaftar PMB"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === "export"
                  ? "Unduh rekapitulasi data pendaftar calon mahasiswa baru dalam format spreadsheet Microsoft Excel (.csv / .xlsx)."
                  : activeTab === "pendaftaran" || activeTab === "gelombang"
                  ? "Atur gelombang PMB, jalur pendaftaran, persyaratan berkas formulir, dan multi-rekening bank pembayaran resmi kampus."
                  : activeTab === "homepage" || activeTab === "settings"
                  ? "Kelola konten halaman depan (Landing Page): Hero Banner, Jalur Masuk, Persyaratan Berkas, dan FAQ."
                  : activeTab === "prodi"
                  ? "Kelola master program studi: deskripsi, profil lulusan & karir, capaian pembelajaran, gelar akademik, serta panduan tata cara pendaftaran terpusat kampus."
                  : activeTab === "hotline"
                  ? "Kelola kontak resmi panitia (WhatsApp CS, Helpdesk KIP, Email Resmi, Alamat Kampus, dan Jam Operasional)."
                  : activeTab === "emis"
                  ? "Integrasi dan kesiapan pemetaan format data EMIS Kementerian Agama & Kopertais Wilayah IV."
                  : activeTab === "seleksi"
                  ? "Penetapan hasil seleksi dan status penerimaan calon mahasiswa baru."
                  : activeTab === "rbac"
                  ? "Pengaturan hak akses, grup menu, dan matriks wewenang akun administrator."
                  : activeTab === "logs"
                  ? "Catatan rekam jejak aktivitas operasional dan tindakan administrator."
                  : "Daftar seluruh calon mahasiswa baru yang terdaftar di sistem PMB STAICI."}
              </p>
            </div>

            {/* PRIMARY PERIOD CONTEXT FILTER (Tahun Akademik & Gelombang) */}
            {(activeTab === "pendaftar" || activeTab === "seleksi") && (
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl shadow-2xs self-start sm:self-center flex-wrap">
                {/* 1. Tahun Akademik Filter Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-[#0d3830]" />
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">T.A:</span>
                  <select
                    value={activeTab === "pendaftar" ? pendaftarTahunFilter : seleksiTahunFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeTab === "pendaftar") {
                        setPendaftarTahunFilter(val);
                        setPendaftarGelombangFilter("");
                      } else {
                        setSeleksiTahunFilter(val);
                        setSeleksiGelombangFilter("");
                      }
                    }}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="">Semua Tahun Ajaran</option>
                    {availableTahunAkademik.map((th) => (
                      <option key={th} value={th}>
                        T.A. {th}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Gelombang Filter Pill (Dinamis bersarang di bawah Tahun Ajaran) */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Gelombang:</span>
                  <select
                    value={activeTab === "pendaftar" ? pendaftarGelombangFilter : seleksiGelombangFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeTab === "pendaftar") {
                        setPendaftarGelombangFilter(val);
                      } else {
                        setSeleksiGelombangFilter(val);
                      }
                    }}
                    className="bg-transparent text-xs font-bold text-[#0d3830] focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="">Semua Gelombang</option>
                    {(activeTab === "pendaftar" ? pendaftarGelombangOptions : seleksiGelombangOptions).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset button if active */}
                {Boolean(
                  (activeTab === "pendaftar" && (pendaftarTahunFilter || pendaftarGelombangFilter)) ||
                  (activeTab === "seleksi" && (seleksiTahunFilter || seleksiGelombangFilter))
                ) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === "pendaftar") {
                        setPendaftarTahunFilter("");
                        setPendaftarGelombangFilter("");
                      } else {
                        setSeleksiTahunFilter("");
                        setSeleksiGelombangFilter("");
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Reset Filter Periode"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TAB CONTENT: MANAJEMEN ROLE & MENU RBAC */}
          {activeTab === "rbac" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-fadeIn">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Role-Based Access Control (RBAC) &amp; Menu Manager</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Atur role admin ke-2, buat menu &amp; menu group baru, serta tetapkan hak akses menu secara dinamis tanpa perlu coding ulang.
                  </p>
                </div>

                {/* Sub Tab Switcher */}
                <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setRbacSubTab("matrix")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      rbacSubTab === "matrix"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Hak Akses Role
                  </button>

                  <button
                    type="button"
                    onClick={() => setRbacSubTab("users")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      rbacSubTab === "users"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Akun Administrator</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      rbacSubTab === "users" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {adminUsersList.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRbacSubTab("roles")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      rbacSubTab === "roles"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Master Role ({rolesList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setRbacSubTab("menus")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      rbacSubTab === "menus"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Menu &amp; Group ({allMenusList.length})
                  </button>
                </div>
              </div>

              {/* SUB TAB 1: MATRIX HAK AKSES ROLE */}
              {rbacSubTab === "matrix" && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-900 flex-shrink-0" />
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Pilih Role yang Ingin Diatur:</label>
                          <select
                            value={selectedRoleForMatrix}
                            onChange={(e) => setSelectedRoleForMatrix(e.target.value)}
                            className="mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:border-[#0d3830]"
                          >
                            {rolesList.map((r) => (
                              <option key={r.id} value={r.kode}>
                                {r.nama} ({r.kode})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Bulk Selector Shortcuts */}
                      <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-200 sm:pl-3 pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={handleSelectAllPermissions}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="Beri wewenang seluruh menu operasional PMB untuk role ini"
                        >
                          Pilih Semua Menu
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllPermissions}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="Hapus seluruh wewenang menu"
                        >
                          Kosongkan Semua
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                      <span className="text-xs font-medium text-slate-500">
                        <strong className="text-slate-800">{matrixAllowedMenuIDs.length}</strong> menu diizinkan
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveRolePermissions}
                        disabled={isProcessing}
                        className="px-5 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-75"
                      >
                        <Save className="w-4 h-4 text-amber-400" />
                        <span>{isProcessing ? "Menyimpan..." : "Simpan Hak Akses Role"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Security Notice for Non-Super Admin */}
                  {selectedRoleForMatrix !== "super_admin" && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        <strong>Catatan Keamanan:</strong> Menu <em>Manajemen Role &amp; RBAC</em> otomatis dikunci dan dilindungi hanya untuk <strong>Super Administrator</strong> agar administrator lain tidak dapat mengubah wewenang sistem.
                      </span>
                    </div>
                  )}

                  {/* Permissions Checkbox Grid */}
                  <div className="space-y-6">
                    {allMenuGroupsList.map((group) => {
                      const groupMenus = allMenusList.filter((m) => m.menu_group_id === group.id);
                      const groupMenuIds = groupMenus.map((m) => m.id);
                      const isSuperAdminTarget = selectedRoleForMatrix === "super_admin";
                      const effectiveGroupIds = groupMenus
                        .filter((m) => isSuperAdminTarget || (m.key !== "rbac" && m.url !== "rbac"))
                        .map((m) => m.id);
                      const allGroupChecked = effectiveGroupIds.length > 0 && effectiveGroupIds.every((id) => matrixAllowedMenuIDs.includes(id));

                      return (
                        <div key={group.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                Group: {group.nama}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">
                                {groupMenus.length} Menu
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleGroupPermissions(group.id)}
                              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-slate-300 transition cursor-pointer"
                            >
                              {allGroupChecked ? "Hapus Centang Grup Ini" : "Pilih Semua di Grup Ini"}
                            </button>
                          </div>

                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {groupMenus.map((m) => {
                              const isChecked = matrixAllowedMenuIDs.includes(m.id);
                              const isRbacLock = (m.key === "rbac" || m.url === "rbac") && selectedRoleForMatrix !== "super_admin";

                              if (isRbacLock) {
                                return (
                                  <div
                                    key={m.id}
                                    className="p-3 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-400 flex items-center justify-between opacity-80 cursor-not-allowed"
                                    title="Menu RBAC hanya dapat diakses oleh Super Administrator"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <Lock className="w-4 h-4 text-rose-500" />
                                      <div>
                                        <p className="text-xs font-semibold text-slate-600 leading-tight">{m.nama}</p>
                                        <span className="text-[9px] font-extrabold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded mt-0.5 inline-block border border-rose-200">
                                          Khusus Super Admin
                                        </span>
                                      </div>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={false}
                                      disabled
                                      className="w-4 h-4 cursor-not-allowed opacity-40"
                                    />
                                  </div>
                                );
                              }

                              return (
                                <label
                                  key={m.id}
                                  className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                                    isChecked
                                      ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold"
                                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {renderNavIcon(m.icon)}
                                    <div>
                                      <p className="text-xs leading-tight">{m.nama}</p>
                                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">Key: {m.key}</p>
                                    </div>
                                  </div>

                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleTogglePermission(m.id)}
                                    className="w-4 h-4 text-[#0d3830] rounded focus:ring-[#0d3830] cursor-pointer"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB TAB: DAFTAR AKUN ADMINISTRATOR */}
              {rbacSubTab === "users" && (
                <div className="space-y-6">
                  {/* Top Bar for Admin Users */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0d3830]" />
                        <span>Kelola Pengguna Administrator ({adminUsersList.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Kelola akun panitia dan ubah tingkat wewenang akses (Role) secara langsung.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddAdminModalOpen(true)}
                      className="px-4 py-2 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-center"
                    >
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span>+ Tambah Administrator Baru</span>
                    </button>
                  </div>

                  {/* Users Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase">
                        <tr>
                          <th className="p-3">Nama &amp; NIK</th>
                          <th className="p-3">Kontak</th>
                          <th className="p-3">Role Saat Ini</th>
                          <th className="p-3">Tingkat Hak Akses</th>
                          <th className="p-3 text-right">Ubah Wewenang Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminUsersList.map((user) => {
                          const isSelf = currentUser?.id === user.id;
                          const isSuper = user.role === "super_admin";

                          return (
                            <tr key={user.id} className="hover:bg-slate-50 transition">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                    isSuper ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                                  }`}>
                                    {user.nama_lengkap?.charAt(0) || "A"}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-slate-900">{user.nama_lengkap}</p>
                                      {isSelf && (
                                        <span className="text-[9px] font-extrabold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">
                                          Akun Anda
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] font-mono text-slate-400">NIK: {user.nik}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3">
                                <p className="text-slate-700 font-medium">{user.email || "-"}</p>
                                <p className="text-[11px] text-slate-400">{user.no_hp || "-"}</p>
                              </td>

                              <td className="p-3">
                                {isSuper ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                                    <ShieldCheck className="w-3 h-3 text-rose-600" />
                                    Super Administrator
                                  </span>
                                ) : user.role === "admin_pmb" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    <UserCheck className="w-3 h-3 text-indigo-600" />
                                    Admin Panitia PMB
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                                    {user.role}
                                  </span>
                                )}
                              </td>

                              <td className="p-3">
                                <p className="text-[11px] text-slate-500">
                                  {isSuper
                                    ? "Akses tak terbatas ke seluruh modul + RBAC"
                                    : "Akses sesuai pengaturan matriks izin"}
                                </p>
                              </td>

                              <td className="p-3 text-right">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUpdateAdminRole(user.id, e.target.value)}
                                  disabled={isSelf}
                                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d3830] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={isSelf ? "Tidak dapat mengubah role akun sendiri demi keamanan" : "Pilih role baru"}
                                >
                                  {rolesList.length > 0 ? (
                                    rolesList.map((r) => (
                                      <option key={r.id} value={r.kode}>
                                        {r.nama}
                                      </option>
                                    ))
                                  ) : (
                                    <>
                                      <option value="super_admin">Super Administrator</option>
                                      <option value="admin_pmb">Admin Panitia PMB</option>
                                      <option value="verifikator_keuangan">Verifikator Keuangan</option>
                                    </>
                                  )}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB 2: DAFTAR ROLE */}
              {rbacSubTab === "roles" && (
                <div className="space-y-6">
                  {/* Form Tambah Role */}
                  <form onSubmit={handleCreateRole} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#0d3830]" />
                      <span>Tambah Role Pengguna Baru</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nama Role</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: Admin Keuangan"
                          value={newRole.nama}
                          onChange={(e) => setNewRole({ ...newRole, nama: e.target.value, kode: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kode Role (Unique Key)</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: admin_keuangan"
                          value={newRole.kode}
                          onChange={(e) => setNewRole({ ...newRole, kode: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Role</label>
                      <input
                        type="text"
                        placeholder="Deskripsi tugas dan cakupan tanggung jawab role..."
                        value={newRole.deskripsi}
                        onChange={(e) => setNewRole({ ...newRole, deskripsi: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="px-4 py-2 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        + Simpan Role Baru
                      </button>
                    </div>
                  </form>

                  {/* Table Roles */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">Kode Role</th>
                          <th className="p-3">Nama Role</th>
                          <th className="p-3">Deskripsi</th>
                          <th className="p-3">Tipe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rolesList.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-500">{r.id}</td>
                            <td className="p-3 font-mono font-bold text-indigo-900">{r.kode}</td>
                            <td className="p-3 font-bold text-slate-900">{r.nama}</td>
                            <td className="p-3 text-slate-600">{r.deskripsi || "-"}</td>
                            <td className="p-3">
                              {r.is_system ? (
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded-md text-[10px]">
                                  System
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                                  Custom
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB 3: DAFTAR MENU & GROUP */}
              {rbacSubTab === "menus" && (
                <div className="space-y-6">
                  {/* Top Info Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Grid className="w-4 h-4 text-[#0d3830]" />
                        <span>Struktur Navigasi &amp; Grup Menu PMB</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Kelola grup pengelompokan menu sidebar, urutan posisi, serta item modul navigasi dengan keyword icon Lucide.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 shadow-2xs">
                        <strong className="text-emerald-800">{allMenuGroupsList.length}</strong> Grup Menu
                      </span>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 shadow-2xs">
                        <strong className="text-emerald-800">{allMenusList.length}</strong> Total Item Menu
                      </span>
                    </div>
                  </div>

                  {/* Top Balanced 2-Column Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    
                    {/* KOLOM KIRI (5 COLS): KELOLA MENU GROUP (FORM + LIST GROUP DENGAN EDIT & HAPUS) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      {/* Form Tambah Menu Group Baru */}
                      <form onSubmit={handleCreateGroup} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                        <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <FolderPlus className="w-4 h-4 text-[#0d3830]" />
                          <span>Tambah Menu Group Baru</span>
                        </h5>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Group *</label>
                            <input
                              type="text"
                              required
                              placeholder="contoh: Laporan & Analitik"
                              value={newGroup.nama}
                              onChange={(e) => setNewGroup({ ...newGroup, nama: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Urutan *</label>
                            <input
                              type="number"
                              required
                              min={1}
                              value={newGroup.urutan}
                              onChange={(e) => setNewGroup({ ...newGroup, urutan: Number(e.target.value) })}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full py-2 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-75"
                        >
                          + Simpan Menu Group
                        </button>
                      </form>

                      {/* Daftar Menu Group yang Sudah Ada (Mengisi space agar tidak kosong & ada fitur edit/hapus) */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex-1 flex flex-col min-h-[220px]">
                        <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-600" />
                            <span>Daftar Menu Group ({allMenuGroupsList.length})</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">Aksi Edit &amp; Hapus</span>
                        </div>

                        <div className="divide-y divide-slate-100 overflow-y-auto max-h-64 flex-1">
                          {allMenuGroupsList.map((g) => {
                            const childCount = allMenusList.filter((m) => m.menu_group_id === g.id).length;
                            return (
                              <div key={g.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center border border-slate-200 flex-shrink-0">
                                    #{g.urutan}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">{g.nama}</p>
                                    <span className="text-[10px] font-medium text-slate-400">
                                      {childCount} item menu di dalamnya
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons for Group */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openEditGroupModal(g)}
                                    className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                    title="Edit Nama / Urutan Group"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  {allMenusList.some((m) => m.menu_group_id === g.id && (m.key === "rbac" || m.url === "rbac")) ? (
                                    <span
                                      className="p-1.5 text-slate-300 cursor-not-allowed"
                                      title="Grup ini memuat modul RBAC inti sistem dan tidak boleh dihapus"
                                    >
                                      <Lock className="w-3.5 h-3.5" />
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGroup(g.id, g.nama)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      title="Hapus Menu Group"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* KOLOM KANAN (7 COLS): FORM TAMBAH ITEM MENU BARU */}
                    <div className="lg:col-span-7">
                      <form onSubmit={handleCreateMenu} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs h-full flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Plus className="w-4 h-4 text-[#0d3830]" />
                            <span>Tambah Item Menu Baru</span>
                          </h4>

                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Group *</label>
                              <select
                                value={newMenu.menu_group_id}
                                onChange={(e) => setNewMenu({ ...newMenu, menu_group_id: Number(e.target.value) })}
                                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0d3830]"
                              >
                                {allMenuGroupsList.map((g) => (
                                  <option key={g.id} value={g.id}>
                                    {g.nama}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Menu *</label>
                              <input
                                type="text"
                                required
                                placeholder="contoh: Verifikasi VA"
                                value={newMenu.nama}
                                onChange={(e) => setNewMenu({ ...newMenu, nama: e.target.value, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="col-span-2">
                              <label className="block text-xs font-bold text-slate-700 mb-1">Key Unique (Routing Tab) *</label>
                              <input
                                type="text"
                                required
                                placeholder="contoh: va_verif / pendaftar"
                                value={newMenu.key}
                                onChange={(e) => setNewMenu({ ...newMenu, key: e.target.value })}
                                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0d3830]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Urutan</label>
                              <input
                                type="number"
                                min={1}
                                value={newMenu.urutan}
                                onChange={(e) => setNewMenu({ ...newMenu, urutan: Number(e.target.value) })}
                                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                              />
                            </div>
                          </div>

                          {/* Interactive Lucide Icon Picker */}
                          <div className="space-y-1.5 p-3 bg-white border border-slate-200 rounded-xl">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-slate-700">
                                Pilih Icon Menu (Sistem Keyword Lucide)
                              </label>
                              {/* Live Active Icon Preview */}
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950 font-bold text-xs shadow-2xs">
                                <span className="text-[10px] uppercase font-extrabold text-emerald-700">Terpilih:</span>
                                {renderNavIcon(newMenu.icon)}
                                <span className="font-mono text-xs">{newMenu.icon || "Users"}</span>
                              </div>
                            </div>

                            {/* Search Keyword Input */}
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Ketik keyword icon (cth: user, card, lock, book, setting, check, bell)..."
                                value={iconSearchTerm}
                                onChange={(e) => {
                                  setIconSearchTerm(e.target.value);
                                  const match = LUCIDE_ICON_LIST.find((i) => i.name.toLowerCase() === e.target.value.toLowerCase().trim());
                                  if (match) {
                                    setNewMenu({ ...newMenu, icon: match.name });
                                  }
                                }}
                                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                              />
                              {iconSearchTerm && (
                                <button
                                  type="button"
                                  onClick={() => setIconSearchTerm("")}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Quick Category Filter Pills */}
                            <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
                              {["Semua", "Pengguna", "Akademik", "Dokumen", "Keuangan", "Waktu", "Keamanan", "Sistem", "Pengaturan", "Komunikasi"].map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setIconCategoryFilter(cat)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                                    iconCategoryFilter === cat
                                      ? "bg-[#0d3830] text-white"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>

                            {/* Clickable Lucide Icon Grid */}
                            <div className="max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                              {filteredLucideIcons.length > 0 ? (
                                filteredLucideIcons.map((item) => {
                                  const isSelected = newMenu.icon?.toLowerCase() === item.name.toLowerCase();
                                  return (
                                    <button
                                      key={item.name}
                                      type="button"
                                      onClick={() => setNewMenu({ ...newMenu, icon: item.name })}
                                      className={`p-1.5 rounded-lg text-left transition flex items-center gap-2 border cursor-pointer ${
                                        isSelected
                                          ? "bg-emerald-100/90 border-emerald-400 text-emerald-950 font-bold shadow-2xs"
                                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                                      }`}
                                    >
                                      <span className={isSelected ? "text-emerald-700" : "text-slate-500"}>
                                        {renderNavIcon(item.name)}
                                      </span>
                                      <span className="text-[11px] truncate font-mono">{item.name}</span>
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="col-span-full p-2.5 text-center text-xs text-slate-500 space-y-1">
                                  <p>Tidak ada icon yang cocok dengan keyword &quot;{iconSearchTerm}&quot;.</p>
                                  <button
                                    type="button"
                                    onClick={() => setNewMenu({ ...newMenu, icon: iconSearchTerm.trim() })}
                                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                  >
                                    Gunakan teks &quot;{iconSearchTerm}&quot; sebagai nama icon kustom &rarr;
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full py-2 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-75"
                        >
                          + Simpan Item Menu Baru
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Table Menus dengan Action Buttons Edit & Hapus */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                    <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Grid className="w-4 h-4 text-[#0d3830]" />
                        <span>Daftar Seluruh Item Menu ({allMenusList.length})</span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Klik tombol Edit untuk memperbarui icon atau nama menu
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase">
                          <tr>
                            <th className="p-3">Urutan</th>
                            <th className="p-3">Icon</th>
                            <th className="p-3">Nama Menu</th>
                            <th className="p-3">Key Routing</th>
                            <th className="p-3">Parent Group</th>
                            <th className="p-3">Tipe Modul</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {allMenusList.map((m) => {
                            const isRbac = m.key === "rbac" || m.url === "rbac";
                            return (
                              <tr key={m.id} className="hover:bg-slate-50 transition">
                                <td className="p-3 font-mono font-bold text-slate-600">
                                  #{m.urutan}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-slate-100 w-fit">
                                    {renderNavIcon(m.icon)}
                                    <span className="font-mono text-[10px] text-slate-600">{m.icon}</span>
                                  </div>
                                </td>
                                <td className="p-3 font-bold text-slate-900">{m.nama}</td>
                                <td className="p-3 font-mono font-bold text-indigo-900">{m.key}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    {m.menu_group?.nama || m.menu_group_id}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {isRbac ? (
                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded text-[10px] border border-rose-200">
                                      Sistem RBAC
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                                      Modul PMB
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openEditMenuModal(m)}
                                      className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                                      title="Edit Item Menu"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Edit</span>
                                    </button>

                                    {isRbac ? (
                                      <span
                                        className="p-1.5 text-slate-300 cursor-not-allowed text-[11px] flex items-center gap-1"
                                        title="Menu RBAC sistem dilindungi dan tidak boleh dihapus"
                                      >
                                        <Lock className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Terkunci</span>
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteMenu(m.id, m.nama, m.key)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                                        title="Hapus Item Menu"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Hapus</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* SEARCH & FILTER TOOLBAR (for pendaftar) */}
          {activeTab === "pendaftar" && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs animate-fadeIn">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Nama, NIK, No. PMB, atau Asal Sekolah..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={prodiFilter}
                  onChange={(e) => setProdiFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                >
                  <option value="">Semua Program Studi</option>
                  {prodiList.map((prodi) => (
                    <option key={prodi.id} value={prodi.id}>
                      {prodi.kode ? `${prodi.kode} - ` : ""}{prodi.nama}
                    </option>
                  ))}
                </select>

                <select
                  value={jalurFilter}
                  onChange={(e) => setJalurFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                >
                  <option value="">Semua Jalur</option>
                  <option value="Reguler">Reguler</option>
                  <option value="KIP-Kuliah">KIP-Kuliah</option>
                </select>

                <select
                  value={statusBayarFilter}
                  onChange={(e) => setStatusBayarFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                >
                  <option value="">Semua Status Pembayaran</option>
                  <option value="diterima">Lunas &amp; Sah</option>
                  <option value="menunggu_verifikasi">Menunggu Validasi</option>
                  <option value="belum_bayar">Menunggu Pembayaran</option>
                  <option value="ditolak">Perlu Revisi</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                >
                  <option value="">Semua Status Berkas</option>
                  <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                  <option value="berkas_diverifikasi">Berkas Sah</option>
                  <option value="belum_lengkap">Perlu Revisi</option>
                </select>

                <button
                  type="button"
                  disabled={!Boolean(search || statusFilter || prodiFilter || jalurFilter || statusBayarFilter || pendaftarTahunFilter || pendaftarGelombangFilter)}
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setProdiFilter("");
                    setJalurFilter("");
                    setStatusBayarFilter("");
                    setPendaftarTahunFilter("");
                    setPendaftarGelombangFilter("");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                    Boolean(search || statusFilter || prodiFilter || jalurFilter || statusBayarFilter || pendaftarTahunFilter || pendaftarGelombangFilter)
                      ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer shadow-2xs"
                      : "bg-slate-100/70 text-slate-400 border-slate-200/80 cursor-not-allowed opacity-60"
                  }`}
                  title={
                    Boolean(search || statusFilter || prodiFilter || jalurFilter || statusBayarFilter || pendaftarTahunFilter || pendaftarGelombangFilter)
                      ? "Reset Seluruh Filter"
                      : "Filter belum diterapkan"
                  }
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: VERIFIKASI BERKAS VIEW */}
          {activeTab === "verifikasi" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Quick Status Filter Pills for Verifikasi */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("");
                    loadPendaftars(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                    statusFilter === ""
                      ? "bg-[#0d3830] text-white border-[#0d3830]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Semua ({stats.total_pendaftar})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("menunggu_verifikasi");
                    loadPendaftars(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === "menunggu_verifikasi"
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-amber-800 border-amber-200 hover:bg-amber-50"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Menunggu Verifikasi ({stats.menunggu_verifikasi})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("berkas_diverifikasi");
                    loadPendaftars(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === "berkas_diverifikasi"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Berkas Sah ({stats.berkas_lengkap})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("belum_lengkap");
                    loadPendaftars(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === "belum_lengkap"
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-white text-rose-800 border-rose-200 hover:bg-rose-50"
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Perlu Revisi ({stats.belum_lengkap})</span>
                </button>
              </div>

              {/* Table Verifikasi Berkas */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">No. PMB &amp; Nama Pendaftar</th>
                        <th className="p-4">Program Studi</th>
                        <th className="p-4">Jalur</th>
                        <th className="p-4">Dokumen Diunggah</th>
                        <th className="p-4">Status Berkas</th>
                        <th className="p-4 text-center">Tindakan Verifikasi</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 text-xs">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                            Memuat data pendaftar &amp; berkas...
                          </td>
                        </tr>
                      ) : pendaftars.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <FileText className="w-10 h-10 text-slate-300" />
                              <p className="font-extrabold text-base text-slate-800">
                                Tidak ada berkas pendaftar yang cocok
                              </p>
                              <p className="text-xs text-slate-500 max-w-sm">
                                Belum ada berkas pendaftar pada filter ini atau belum ada pendaftar yang mengunggah dokumen.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pendaftars.map((p) => {
                          const namaLengkap = getUserName(p);
                          const nik = getUserNik(p);
                          const prodiTitle = getProdiTitle(p.program_studi);
                          const gelombangTitle = getGelombangTitle(p.gelombang, p.jalur);

                          // Berkas status map
                          const berkasMap: Record<string, any> = {};
                          if (Array.isArray(p.berkas)) {
                            p.berkas.forEach((b: any) => {
                              berkasMap[b.jenis_dokumen] = b;
                            });
                          }

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition">
                              {/* Nama & PMB */}
                              <td className="p-4">
                                <button
                                  type="button"
                                  onClick={() => openDetail(p.id)}
                                  className="text-left group cursor-pointer"
                                >
                                  <p className="font-extrabold text-slate-900 group-hover:text-[#0d3830] transition">
                                    {namaLengkap}
                                  </p>
                                  <p className="text-[11px] font-mono text-emerald-800 font-bold mt-0.5">
                                    {p.nomor_pendaftaran || `PMB-2026-00${p.id}`}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">NIK: {nik}</p>
                                </button>
                              </td>

                              {/* Prodi */}
                              <td className="p-4 font-bold text-slate-800">{prodiTitle}</td>

                              {/* Jalur */}
                              <td className="p-4">
                                {getJalurBadge(p)}
                              </td>

                              {/* Status Dokumen Individual */}
                              <td className="p-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {(p.jalur_pendaftaran === "KIP-Kuliah" || p.jalur === "KIP-Kuliah"
                                    ? ["kk", "ktp", "ijazah", "foto", "kip"]
                                    : ["kk", "ktp", "ijazah", "foto"]
                                  ).map((docKey) => {
                                    const doc = berkasMap[docKey];
                                    const isUploaded = !!doc;
                                    const isValid = doc?.status_verifikasi === "valid";
                                    const isInvalid = doc?.status_verifikasi === "invalid";

                                    return (
                                      <span
                                        key={docKey}
                                        title={`${docKey.toUpperCase()}: ${
                                          isValid
                                            ? "Valid & Sah"
                                            : isInvalid
                                            ? "Perlu Revisi"
                                            : isUploaded
                                            ? "Sudah Diunggah (Menunggu Verifikasi)"
                                            : "Belum Diunggah"
                                        }`}
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                                          isValid
                                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                            : isInvalid
                                            ? "bg-rose-50 text-rose-800 border-rose-200"
                                            : isUploaded
                                            ? "bg-amber-50 text-amber-800 border-amber-200"
                                            : "bg-slate-100 text-slate-400 border-slate-200"
                                        }`}
                                      >
                                        {docKey}
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>

                              {/* Status Berkas Global */}
                              <td className="p-4">
                                {getBerkasBadge(p)}
                              </td>

                              {/* Action Button */}
                              <td className="p-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => openDetail(p.id)}
                                  className="px-3.5 py-1.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 mx-auto cursor-pointer"
                                >
                                  <FileCheck className="w-3.5 h-3.5" />
                                  <span>Periksa Berkas</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: PENDAFTAR TABLE VIEW */}
          {activeTab === "pendaftar" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-3 w-10 text-center font-mono">No.</th>
                      <th className="py-3 px-3 min-w-[170px]">Pendaftar &amp; No. PMB</th>
                      <th className="py-3 px-3 min-w-[140px]">Asal Sekolah &amp; NIK</th>
                      <th className="py-3 px-3 min-w-[140px]">Program Studi</th>
                      <th className="py-3 px-3 min-w-[110px]">Jalur</th>
                      <th className="py-3 px-3 min-w-[120px]">Status Pembayaran</th>
                      <th className="py-3 px-3 min-w-[115px]">Status Berkas</th>
                      <th className="py-3 px-3 w-[100px] text-center">Status Akhir</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs">
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                          Memuat data pendaftar dari database real...
                        </td>
                      </tr>
                    ) : pendaftars.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Users className="w-10 h-10 text-slate-300" />
                            <p className="font-extrabold text-base text-slate-800">Belum ada pendaftar terdaftar</p>
                            <p className="text-xs text-slate-500 max-w-sm">
                              Setiap calon mahasiswa yang membuat akun dan mendaftar melalui portal web akan otomatis muncul di sini secara real-time.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pendaftars.map((p, idx) => {
                        const namaLengkap = getUserName(p);
                        const nik = getUserNik(p);
                        const asalSekolah = getAsalSekolah(p);
                        const prodiTitle = getProdiTitle(p.program_studi);
                        const gelombangTitle = getGelombangTitle(p.gelombang, p.jalur);

                        // Split Gelombang title into main badge name and TA subtext if contains ' - '
                        const gelombangMain = gelombangTitle.includes(" - ") ? gelombangTitle.split(" - ")[0] : gelombangTitle;
                        const gelombangSub = gelombangTitle.includes(" - ") ? gelombangTitle.split(" - ")[1] : null;

                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50/80 transition"
                          >
                            {/* Nomor Urut */}
                            <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400 align-middle">
                              {(meta.page - 1) * (meta.per_page || 10) + idx + 1}
                            </td>

                            {/* Pendaftar & No PMB */}
                            <td className="py-3.5 px-3 align-middle">
                              <button
                                type="button"
                                onClick={() => openDetail(p.id)}
                                className="text-left group cursor-pointer block"
                              >
                                <p className="font-extrabold text-slate-900 group-hover:text-[#0d3830] transition leading-snug">
                                  {namaLengkap}
                                </p>
                                <p className="text-[11px] font-mono text-emerald-800 font-bold mt-0.5">
                                  {p.nomor_pendaftaran || `PMB-2026-00${p.id}`}
                                </p>
                              </button>
                            </td>

                            {/* Asal Sekolah & NIK */}
                            <td className="py-3.5 px-3 align-middle">
                              <p className="font-semibold text-slate-800 leading-snug">
                                {asalSekolah}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                NIK: {nik}
                              </p>
                            </td>

                            {/* Program Studi */}
                            <td className="py-3.5 px-3 align-middle">
                              <p className="font-bold text-slate-800 leading-snug">
                                {prodiTitle}
                              </p>
                            </td>

                            {/* Jalur */}
                            <td className="py-3.5 px-3 align-middle">
                              <div className="flex flex-col items-start gap-1">
                                {getJalurBadge(p)}
                                {gelombangMain && (
                                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                    {gelombangMain}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Status Pembayaran */}
                            <td className="py-3.5 px-3 align-middle">
                              {getPembayaranBadge(p)}
                            </td>

                            {/* Status Berkas */}
                            <td className="py-3.5 px-3 align-middle">
                              {getBerkasBadge(p)}
                            </td>

                            {/* Status Akhir / Verifikasi */}
                            <td className="py-3.5 px-3 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => openDetail(p.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer mx-auto"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Periksa</span>
                                <ArrowRight className="w-3 h-3 opacity-80" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: EXPORT DATA PMB (FR-8.8) */}
          {activeTab === "export" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Main Export Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-700">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
                        <span>Ekspor Data Pendaftar PMB ke Excel</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Format .CSV / .XLSX
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                        Unduh rekapitulasi data diri calon mahasiswa baru (identitas diri, asal sekolah, jalur, prodi pilihan, dan orang tua) dalam bentuk spreadsheet Excel.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={loadExportData}
                      disabled={isExportLoading}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isExportLoading ? "animate-spin" : ""}`} />
                      <span>Segarkan</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadExport}
                      disabled={isDownloadingExport || exportApplicants.length === 0}
                      className="px-5 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-emerald-300" />
                      <span>{isDownloadingExport ? "Mengunduh..." : "Unduh File Excel (.csv)"}</span>
                    </button>
                  </div>
                </div>

                {/* Filter Parameters */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Filter className="w-4 h-4 text-[#0d3830]" />
                      <span>Filter Kriteria Data yang Diekspor</span>
                    </h4>
                    <span className="text-[11px] font-bold text-slate-500">
                      Ditemukan: <strong className="text-emerald-700 font-black">{exportApplicants.length}</strong> pendaftar
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Gelombang Pendaftaran</label>
                      <select
                        value={exportGelombangFilter}
                        onChange={(e) => setExportGelombangFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="">Semua Gelombang</option>
                        {gelombangList.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nama} ({g.tahun_akademik})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Program Studi</label>
                      <select
                        value={exportProdiFilter}
                        onChange={(e) => setExportProdiFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="">Semua Program Studi</option>
                        {prodiList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.kode} - {p.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Pendaftaran</label>
                      <select
                        value={exportStatusFilter}
                        onChange={(e) => setExportStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="">Semua Status Pendaftaran</option>
                        <option value="akun_terdaftar">Akun Terdaftar</option>
                        <option value="belum_lengkap">Belum Lengkap / Perlu Revisi</option>
                        <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                        <option value="berkas_diverifikasi">Berkas Sah / Diverifikasi</option>
                        <option value="lolos_seleksi">Lolos Seleksi</option>
                        <option value="ditolak_perlu_perbaikan">Ditolak</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Pembayaran</label>
                      <select
                        value={exportStatusBayarFilter}
                        onChange={(e) => setExportStatusBayarFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="">Semua Status Pembayaran</option>
                        <option value="lunas">Lunas</option>
                        <option value="menunggu">Menunggu Verifikasi</option>
                        <option value="belum_bayar">Belum Bayar</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Field Inclusion Info */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs font-extrabold text-[#0d3830] uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span>Cakupan Kolom Ekspor Data Diri</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    File spreadsheet Excel yang diunduh mencakup <strong>30 kolom data diri lengkap</strong>. Berkas scan dokumen fisik tidak disertakan dalam tabel ini sesuai konfigurasi ekspor administratif.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      "No. Pendaftaran", "NIK (16 Digit Teks)", "Nama Lengkap", "Jenis Kelamin",
                      "Tempat & Tgl Lahir", "Agama", "Status Pernikahan", "Alamat Tinggal",
                      "No. HP / WA", "Email", "Asal Sekolah", "Jurusan", "Tahun Lulus", "Nilai Rata-rata",
                      "Program Studi Pilihan", "Gelombang", "Nama Ayah & Ibu", "Pekerjaan Orang Tua",
                      "No. HP Orang Tua", "Status Pendaftaran", "Status Pembayaran", "Waktu Daftar"
                    ].map((col, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-900 text-[10px] font-bold">
                        ✓ {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preview Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Pratinjau Data Calon Mahasiswa ({exportApplicants.length} Data)
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Format NIK tersimpan rapi tanpa konversi notasi ilmiah (E+15)
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase">
                          <tr>
                            <th className="p-3 w-10 text-center">No</th>
                            <th className="p-3">No. PMB</th>
                            <th className="p-3">NIK</th>
                            <th className="p-3">Nama Lengkap</th>
                            <th className="p-3">JK</th>
                            <th className="p-3">Asal Sekolah</th>
                            <th className="p-3">Program Studi</th>
                            <th className="p-3">Gelombang</th>
                            <th className="p-3">No. HP</th>
                            <th className="p-3">Status Bayar</th>
                            <th className="p-3">Status Pendaftaran</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {isExportLoading ? (
                            <tr>
                              <td colSpan={11} className="p-8 text-center text-slate-500">
                                Memuat pratinjau data ekspor...
                              </td>
                            </tr>
                          ) : exportApplicants.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="p-10 text-center text-slate-500">
                                Tidak ada data pendaftar yang cocok dengan filter yang dipilih.
                              </td>
                            </tr>
                          ) : (
                            exportApplicants.map((p, idx) => {
                              const isLunas = p.pembayaran?.some((pay: any) => pay.status === "diterima");
                              const isPending = p.pembayaran?.some((pay: any) => pay.status === "menunggu_verifikasi");
                              return (
                                <tr key={p.id} className="hover:bg-slate-50/80">
                                  <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                                  <td className="p-3 font-mono font-bold text-emerald-800">
                                    {p.nomor_pendaftaran || `PMB-2026-00${p.id}`}
                                  </td>
                                  <td className="p-3 font-mono text-slate-600 font-semibold">{getUserNik(p)}</td>
                                  <td className="p-3 font-bold text-slate-900">{getUserName(p)}</td>
                                  <td className="p-3 text-slate-600">{p.jenis_kelamin || "-"}</td>
                                  <td className="p-3 text-slate-700">{p.nama_sekolah || getAsalSekolah(p)}</td>
                                  <td className="p-3 font-bold text-slate-800">{getProdiTitle(p.program_studi)}</td>
                                  <td className="p-3 text-slate-600">{getGelombangTitle(p.gelombang, p.jalur)}</td>
                                  <td className="p-3 font-mono text-slate-600">{p.user?.no_hp || "-"}</td>
                                  <td className="p-3">
                                    {isLunas ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        Lunas
                                      </span>
                                    ) : isPending ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                        Menunggu Verifikasi
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                        Belum Bayar
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                      {p.status_pendaftaran || "Akun Terdaftar"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB CONTENT: CMS PENDAFTARAN & BIAYA (GELOMBANG, JALUR, DOKUMEN, MULTI-REKENING) */}
          {(activeTab === "pendaftaran" || activeTab === "gelombang") && (
            <div className="space-y-6 animate-fadeIn">
              {/* Module Header & Sub-Tab Navigation */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-700" />
                      <span>CMS Halaman Pendaftaran, Gelombang &amp; Biaya</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Pusat konfigurasi alur pendaftaran calon mahasiswa: kelola gelombang PMB, master jalur seleksi, persyaratan dokumen berkas, dan nomor rekening bank pembayaran.
                    </p>
                  </div>
                </div>

                {/* Sub-Tabs Pills */}
                <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setPendaftaranSubTab("gelombang")}
                    className={`px-3.5 py-2 font-bold rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      pendaftaranSubTab === "gelombang"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>1. Gelombang PMB</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-white font-mono">
                      {gelombangList.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendaftaranSubTab("jalur")}
                    className={`px-3.5 py-2 font-bold rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      pendaftaranSubTab === "jalur"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>2. Master Jalur Seleksi</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 font-mono">
                      {jalurList.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendaftaranSubTab("dokumen")}
                    className={`px-3.5 py-2 font-bold rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      pendaftaranSubTab === "dokumen"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>3. Persyaratan Berkas</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 font-mono">
                      {persyaratanDocList.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendaftaranSubTab("rekening")}
                    className={`px-3.5 py-2 font-bold rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      pendaftaranSubTab === "rekening"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>4. Rekening Pembayaran (Multi-Bank)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-bold font-mono">
                      {rekeningList.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* SUB-TAB 1: GELOMBANG PMB */}
              {pendaftaranSubTab === "gelombang" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-700" />
                        <span>Gelombang Pendaftaran Mahasiswa Baru</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Atur kuota, periode buka &amp; tutup pendaftaran, biaya formulir, serta status aktif tiap gelombang.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddGelombangOpen(true)}
                      className="px-4 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                      title="Tambah Gelombang Baru"
                    >
                      <Plus className="w-4 h-4 text-emerald-300" />
                      <span>Tambah Gelombang Baru</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {gelombangList.map((gel) => {
                      const isAktif = gel.is_aktif;
                      return (
                        <div
                          key={gel.id}
                          className={`rounded-2xl border p-5 space-y-4 transition-all shadow-xs flex flex-col justify-between ${
                            isAktif ? "bg-white border-emerald-300 ring-2 ring-emerald-500/10" : "bg-slate-50 border-slate-200 opacity-80"
                          }`}
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  T.A. {gel.tahun_akademik || "2026/2027"}
                                </span>
                                <h4 className="text-base font-black text-slate-900 font-serif mt-0.5">{gel.nama}</h4>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isAktif
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {isAktif ? "● Sedang Dibuka" : "Ditutup"}
                              </span>
                            </div>

                            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Biaya Pendaftaran:</span>
                                <strong className="text-slate-900 font-bold">
                                  Rp {(Number(gel.biaya_pendaftaran) || 250000).toLocaleString("id-ID")}
                                </strong>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Kapasitas Kuota:</span>
                                <span className="font-bold text-slate-800">{gel.kuota || 150} Calon Mahasiswa</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Periode Pendaftaran:</span>
                                <span className="font-mono text-[11px] text-slate-600">
                                  {gel.tanggal_buka ? new Date(gel.tanggal_buka).toLocaleDateString("id-ID") : "-"} s/d{" "}
                                  {gel.tanggal_tutup ? new Date(gel.tanggal_tutup).toLocaleDateString("id-ID") : "-"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="font-mono text-slate-400">ID #{gel.id}</span>
                            <button
                              type="button"
                              onClick={() => openEditGelombangModal(gel)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Gelombang</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: MASTER JALUR PENDAFTARAN */}
              {pendaftaranSubTab === "jalur" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-700" />
                        <span>Master Jalur Seleksi PMB (Reguler, KIP-Kuliah, Tahfidz, Prestasi)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Skalakan jalur pendaftaran secara fleksibel: tambahkan jalur baru, atur pembebasan biaya formulir, dan tentukan apakah tampil di landing page.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openAddJalurModal}
                      className="px-4 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4 text-emerald-300" />
                      <span>Tambah Jalur Pendaftaran</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {jalurList.map((jal) => (
                      <div
                        key={jal.id}
                        className={`rounded-2xl border p-5 space-y-4 shadow-xs transition flex flex-col justify-between ${
                          jal.is_aktif ? "bg-white border-slate-200 hover:border-emerald-300" : "bg-slate-50 border-slate-200 opacity-75"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-emerald-100 text-[#0d3830]">
                              {jal.kode}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {jal.bebas_biaya && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  Bebas Biaya (Rp 0)
                                </span>
                              )}
                              {jal.tampil_di_homepage && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                                  Tampil Beranda
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-base font-black text-slate-900">{jal.nama}</h4>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-slate-700">
                              Badge: {jal.badge_text || jal.nama}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {jal.deskripsi || "Tidak ada keterangan deskripsi."}
                          </p>

                          {jal.syarat_khusus && (
                            <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                              <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-800">Syarat Khusus:</span>
                              <p>{jal.syarat_khusus}</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleToggleJalur(jal.id)}
                            className="font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            {jal.is_aktif ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <ToggleRight className="w-5 h-5 text-emerald-600" /> Aktif
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-1">
                                <ToggleLeft className="w-5 h-5 text-slate-400" /> Nonaktif
                              </span>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditJalurModal(jal)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteJalur(jal.id, jal.nama)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Hapus Jalur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: PERSYARATAN BERKAS & DOKUMEN */}
              {pendaftaranSubTab === "dokumen" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-700" />
                        <span>Master Persyaratan Berkas &amp; Dokumen Calon Mahasiswa</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Kelola dokumen yang wajib diunggah oleh pendaftar (KK, KTP, Ijazah, Foto, KIP, dsb), batas ukuran file, dan ketentuan jalur khusus.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openAddPersyaratanModal}
                      className="px-4 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4 text-emerald-300" />
                      <span>Tambah Persyaratan Dokumen</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {persyaratanDocList.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-2xl border space-y-3 shadow-xs flex flex-col justify-between ${
                          doc.is_aktif ? "bg-white border-slate-200 hover:border-emerald-300" : "bg-slate-50 border-slate-200 opacity-75"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-bold">
                              {doc.kode || `DOK-${doc.id}`}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                doc.is_wajib
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {doc.is_wajib ? "Wajib Diunggah" : "Opsional"}
                            </span>
                          </div>

                          <h5 className="text-sm font-extrabold text-slate-900 leading-snug">{doc.nama_dokumen}</h5>

                          {doc.deskripsi && (
                            <p className="text-xs text-slate-600 leading-relaxed">{doc.deskripsi}</p>
                          )}

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                            <span>Format: <strong>{doc.tipe_file || "PDF/JPG"}</strong></span>
                            <span>•</span>
                            <span>Maks: <strong>{doc.max_size_mb || 2} MB</strong></span>
                          </div>

                          {doc.jalur_khusus && (
                            <span className="inline-block text-[10px] px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded font-bold">
                              Khusus: {doc.jalur_khusus}
                            </span>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditPersyaratanModal(doc)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePersyaratan(doc.id, doc.nama_dokumen)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: REKENING PEMBAYARAN MULTI-BANK */}
              {pendaftaranSubTab === "rekening" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-700" />
                        <span>Rekening Bank Resmi Pembayaran PMB (Mendukung 2 atau Lebih Bank)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Sistem kini mendukung multi-rekening bank agar kampus dapat menaikkan skala operasional (contoh: BSI, Bank Jatim Syariah, BRI, Mandiri).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openAddRekeningModal}
                      className="px-4 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4 text-emerald-300" />
                      <span>Tambah Rekening Bank Baru</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rekeningList.map((rek) => (
                      <div
                        key={rek.id}
                        className={`rounded-2xl border p-5 space-y-4 shadow-xs transition flex flex-col justify-between ${
                          rek.is_utama
                            ? "bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-500/10"
                            : rek.is_aktif
                            ? "bg-white border-slate-200 hover:border-slate-300"
                            : "bg-slate-50 border-slate-200 opacity-75"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {rek.cabang ? `KCP / Cabang ${rek.cabang}` : "Kantor Cabang Utama"}
                              </span>
                              <h5 className="text-base font-black text-slate-900 mt-0.5">{rek.nama_bank}</h5>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {rek.is_utama && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0d3830] text-white">
                                  Rekening Utama
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  rek.is_aktif ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {rek.is_aktif ? "● Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </div>

                          {/* Account Number Box with Copy */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-400 block">Nomor Rekening:</span>
                              <span className="text-base font-mono font-black text-slate-900 tracking-wider">
                                {rek.nomor_rekening}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(rek.nomor_rekening);
                                alert(`Nomor rekening ${rek.nomor_rekening} berhasil disalin!`);
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-lg transition border border-emerald-200 cursor-pointer"
                            >
                              Salin
                            </button>
                          </div>

                          <div className="space-y-1 text-xs">
                            <span className="text-slate-500">Atas Nama:</span>
                            <p className="font-bold text-slate-800">{rek.atas_nama}</p>
                          </div>

                          {rek.instruksi_transfer && (
                            <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200/80">
                              <span className="text-slate-400 font-bold block text-[10px]">Petunjuk Transfer:</span>
                              <p className="line-clamp-2 mt-0.5">{rek.instruksi_transfer}</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleToggleRekening(rek.id)}
                            className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                          >
                            {rek.is_aktif ? "Nonaktifkan" : "Aktifkan"}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditRekeningModal(rek)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRekening(rek.id, rek.nama_bank)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                              title="Hapus Rekening"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: CMS PROGRAM STUDI */}
          {activeTab === "prodi" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-700" />
                      <span>Manajemen Informasi Program Studi</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Atur seluruh informasi lengkap program studi yang ditampilkan kepada calon mahasiswa: profil lulusan &amp; prospek karir, capaian pembelajaran, gelar akademik, serta panduan pendaftaran.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openAddProdiModal}
                    className="px-4 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 text-emerald-300" />
                    <span>Tambah Program Studi</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {prodiList.map((prodi) => {
                    let profilCount = 0;
                    if (Array.isArray(prodi.profil_lulusan)) {
                      profilCount = prodi.profil_lulusan.length;
                    } else if (typeof prodi.profil_lulusan === "string" && prodi.profil_lulusan) {
                      try {
                        profilCount = JSON.parse(prodi.profil_lulusan).length;
                      } catch {
                        profilCount = 0;
                      }
                    }

                    let capaianCount = 0;
                    if (Array.isArray(prodi.capaian_pembelajaran)) {
                      capaianCount = prodi.capaian_pembelajaran.length;
                    } else if (typeof prodi.capaian_pembelajaran === "string" && prodi.capaian_pembelajaran) {
                      try {
                        capaianCount = JSON.parse(prodi.capaian_pembelajaran).length;
                      } catch {
                        capaianCount = 0;
                      }
                    }

                    return (
                      <div
                        key={prodi.id}
                        className={`rounded-2xl border p-5 space-y-4 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between ${
                          prodi.is_aktif ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 opacity-80"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-emerald-100 text-[#0d3830] border border-emerald-200">
                              {prodi.kode}
                            </span>
                            <span className="text-xs font-bold text-slate-500 font-serif">
                              Jenjang {prodi.jenjang || "S1"}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-base font-black text-slate-900 font-serif leading-snug">{prodi.nama}</h4>
                            <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                              {prodi.gelar_akademik || "Gelar: -"}
                            </p>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {prodi.deskripsi || "Belum ada deskripsi pengantar program studi."}
                          </p>

                          {/* Quick Summary Pill Box */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                              <span className="text-slate-400 block text-[10px]">Profil Lulusan:</span>
                              <strong className="text-slate-800 font-bold">{profilCount} Prospek Karir</strong>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                              <span className="text-slate-400 block text-[10px]">Capaian Belajar:</span>
                              <strong className="text-slate-800 font-bold">{capaianCount} Keunggulan</strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className={prodi.is_aktif ? "text-emerald-700 font-bold" : "text-slate-400 font-bold"}>
                            {prodi.is_aktif ? "● Status: Dibuka" : "○ Status: Ditutup"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditProdiModal(prodi)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProdi(prodi)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Hapus Program Studi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: TATA CARA PENDAFTARAN (ALUR TERPUSAT PMB KAMPUS) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="max-w-xl">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                      <span>Tata Cara Pendaftaran (Panduan Alur Terpusat Kampus)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Alur panduan pendaftaran resmi yang tampil pada sidebar seluruh halaman program studi dan informasi pendaftaran calon mahasiswa.
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start xl:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleResetGlobalTataCaraSteps}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      title="Reset alur ke template standar"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddGlobalTataCaraStep}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0d3830] border border-emerald-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tambah Langkah</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBulkTataCara}
                      disabled={isSavingTataCara || !isTataCaraDirty}
                      className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 whitespace-nowrap ${
                        isTataCaraDirty
                          ? "bg-[#0d3830] hover:bg-[#165349] text-white cursor-pointer"
                          : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      {isTataCaraDirty ? (
                        <>
                          <Save className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isSavingTataCara ? "Menyimpan..." : "Simpan Alur"}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                          <span>Alur Tersimpan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {tataCaraList.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 relative group"
                    >
                      <div className="flex items-center gap-3 md:w-48 flex-shrink-0">
                        <span className="w-8 h-8 rounded-full bg-[#0d3830] text-white flex items-center justify-center font-mono font-black text-xs shadow-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Urutan #{idx + 1}</span>
                          <span className="text-xs font-bold text-slate-800">Langkah {idx + 1}</span>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Judul Langkah *</label>
                          <input
                            type="text"
                            value={step.judul}
                            onChange={(e) => handleGlobalTataCaraStepChange(idx, "judul", e.target.value)}
                            placeholder="Contoh: Konsultasi Pendaftaran"
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Penjelasan / Deskripsi *</label>
                          <input
                            type="text"
                            value={step.deskripsi}
                            onChange={(e) => handleGlobalTataCaraStepChange(idx, "deskripsi", e.target.value)}
                            placeholder="Penjelasan ringkas instruksi langkah..."
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveGlobalTataCaraStep(idx)}
                        disabled={tataCaraList.length <= 1}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer disabled:opacity-30 self-end md:self-center"
                        title="Hapus langkah"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: SELEKSI & KELULUSAN */}
          {activeTab === "seleksi" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 font-serif flex items-center gap-2">
                          <span>Seleksi &amp; Penetapan Kelulusan Calon Mahasiswa</span>
                          <span className="text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0d3830] border border-emerald-200">
                            PMB 2026/2027
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Khusus calon mahasiswa yang telah diverifikasi berkasnya. Tetapkan hasil seleksi menjadi Lolos (Diterima), Jadwalkan Wawancara, atau Tidak Lolos.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadSeleksiData()}
                      disabled={isSeleksiLoading}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSeleksiLoading ? "animate-spin" : ""}`} />
                      <span>Segarkan Data</span>
                    </button>
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">Berkas Sah (Siap Seleksi)</span>
                      <FileCheck className="w-4 h-4 text-amber-700" />
                    </div>
                    <p className="text-2xl font-black text-amber-950 font-serif">
                      {seleksiApplicants.filter((p) => p.status_pendaftaran === "berkas_diverifikasi").length}
                    </p>
                    <span className="text-[10px] text-amber-800">Menunggu penilaian akhir</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">Tahap Wawancara</span>
                      <Users className="w-4 h-4 text-blue-700" />
                    </div>
                    <p className="text-2xl font-black text-blue-950 font-serif">
                      {seleksiApplicants.filter((p) => p.status_pendaftaran === "mengikuti_ujian").length}
                    </p>
                    <span className="text-[10px] text-blue-800">Sesi wawancara dijadwalkan</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Lolos Seleksi (Diterima)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    </div>
                    <p className="text-2xl font-black text-emerald-950 font-serif">
                      {seleksiApplicants.filter((p) => p.status_pendaftaran === "lolos_seleksi").length}
                    </p>
                    <span className="text-[10px] text-emerald-800">Dinyatakan lulus PMB STAICI</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-900">Tidak Lolos</span>
                      <XCircle className="w-4 h-4 text-rose-700" />
                    </div>
                    <p className="text-2xl font-black text-rose-950 font-serif">
                      {seleksiApplicants.filter((p) => p.status_pendaftaran === "tidak_lolos").length}
                    </p>
                    <span className="text-[10px] text-rose-800">Belum memenuhi kualifikasi</span>
                  </div>
                </div>

                {/* Filter Toolbar */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari Nama, NIK, No. PMB, Asal Sekolah..."
                      value={seleksiSearch}
                      onChange={(e) => setSeleksiSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={seleksiProdiFilter}
                      onChange={(e) => setSeleksiProdiFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    >
                      <option value="">Semua Program Studi</option>
                      {prodiList.map((pr) => (
                        <option key={pr.id} value={pr.id}>
                          {pr.kode} - {pr.nama}
                        </option>
                      ))}
                    </select>

                    <select
                      value={seleksiJalurFilter}
                      onChange={(e) => setSeleksiJalurFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    >
                      <option value="">Semua Jalur Pendaftaran</option>
                      <option value="Reguler">Jalur Reguler</option>
                      <option value="KIP-Kuliah">Jalur KIP-Kuliah</option>
                    </select>

                    <select
                      value={seleksiStatusFilter}
                      onChange={(e) => setSeleksiStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    >
                      <option value="">Semua Tahap Seleksi</option>
                      <option value="berkas_diverifikasi">Berkas Sah (Siap Seleksi)</option>
                      <option value="mengikuti_ujian">Tahap Wawancara</option>
                      <option value="lolos_seleksi">Lolos Seleksi (Diterima)</option>
                      <option value="tidak_lolos">Tidak Lolos</option>
                    </select>

                    <button
                      type="button"
                      disabled={!Boolean(seleksiSearch || seleksiProdiFilter || seleksiGelombangFilter || seleksiTahunFilter || seleksiJalurFilter || seleksiStatusFilter)}
                      onClick={() => {
                        setSeleksiSearch("");
                        setSeleksiProdiFilter("");
                        setSeleksiTahunFilter("");
                        setSeleksiGelombangFilter("");
                        setSeleksiJalurFilter("");
                        setSeleksiStatusFilter("");
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                        Boolean(seleksiSearch || seleksiProdiFilter || seleksiGelombangFilter || seleksiTahunFilter || seleksiJalurFilter || seleksiStatusFilter)
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer shadow-2xs"
                          : "bg-slate-100/70 text-slate-400 border-slate-200/80 cursor-not-allowed opacity-60"
                      }`}
                      title={
                        Boolean(seleksiSearch || seleksiProdiFilter || seleksiGelombangFilter || seleksiTahunFilter || seleksiJalurFilter || seleksiStatusFilter)
                          ? "Reset Seluruh Filter"
                          : "Filter belum diterapkan"
                      }
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Table Calon Mahasiswa Seleksi */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="p-3.5">No. PMB &amp; Nama Calon Mahasiswa</th>
                          <th className="p-3.5">Program Studi &amp; Jalur</th>
                          <th className="p-3.5">Asal Sekolah &amp; Rapor</th>
                          <th className="p-3.5">Sosial-Ekonomi (Ortu)</th>
                          <th className="p-3.5 text-center">Status Seleksi</th>
                          <th className="p-3.5">Catatan / Jadwal Panitia</th>
                          <th className="p-3.5 text-center">Aksi Seleksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {isSeleksiLoading ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-800 mb-2" />
                              <span>Memuat data seleksi calon mahasiswa...</span>
                            </td>
                          </tr>
                        ) : seleksiApplicants.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              <FileQuestion className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                              <p className="font-bold text-slate-700 text-sm">Belum Ada Calon Mahasiswa untuk Seleksi</p>
                              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                                Pendaftar yang telah diverifikasi seluruh berkasnya di menu &quot;Pendaftar PMB&quot; akan otomatis masuk ke daftar seleksi ini.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          seleksiApplicants.map((p) => {
                            const isLolos = p.status_pendaftaran === "lolos_seleksi";
                            const isUjian = p.status_pendaftaran === "mengikuti_ujian";
                            const isTidakLolos = p.status_pendaftaran === "tidak_lolos";
                            const isSiap = p.status_pendaftaran === "berkas_diverifikasi";

                            return (
                              <tr key={p.id} className="hover:bg-slate-50/80 transition">
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-[#0d3830] text-emerald-200 font-extrabold text-[11px] flex items-center justify-center flex-shrink-0">
                                      {getUserName(p).slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-slate-900 leading-tight">{getUserName(p)}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                          {p.nomor_pendaftaran || `PMB-2026-00${p.id}`}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">NIK: {getUserNik(p)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5">
                                  <strong className="text-slate-900 font-serif block">{getProdiTitle(p.program_studi)}</strong>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    {getJalurBadge(p)}
                                    <span className="text-[11px] text-slate-500">{getGelombangTitle(p.gelombang, p.jalur)}</span>
                                  </div>
                                </td>
                                <td className="p-3.5">
                                  <p className="font-semibold text-slate-800">{p.nama_sekolah || getAsalSekolah(p)}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[11px] text-slate-500">
                                      {p.jurusan_sekolah || "Umum"} {p.tahun_lulus ? `(${p.tahun_lulus})` : ""}
                                    </span>
                                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                      Rapor: {p.nilai_rata_rata ? Number(p.nilai_rata_rata).toFixed(2) : "-"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3.5">
                                  <div className="space-y-0.5 text-[11px]">
                                    <p className="text-slate-700">
                                      Ayah: <strong className="text-slate-900">{p.data_orang_tua?.pekerjaan_ayah || "-"}</strong>{" "}
                                      <span className="text-slate-400">({p.data_orang_tua?.penghasilan_ayah || "-"})</span>
                                    </p>
                                    <p className="text-slate-700">
                                      Ibu: <strong className="text-slate-900">{p.data_orang_tua?.pekerjaan_ibu || "-"}</strong>{" "}
                                      <span className="text-slate-400">({p.data_orang_tua?.penghasilan_ibu || "-"})</span>
                                    </p>
                                  </div>
                                </td>
                                <td className="p-3.5 text-center">
                                  <span
                                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold inline-block border ${
                                      isLolos
                                        ? "bg-emerald-100 text-[#0d3830] border-emerald-300"
                                        : isUjian
                                        ? "bg-blue-100 text-blue-900 border-blue-300"
                                        : isTidakLolos
                                        ? "bg-rose-100 text-rose-900 border-rose-300"
                                        : isSiap
                                        ? "bg-amber-100 text-amber-900 border-amber-300"
                                        : "bg-slate-100 text-slate-700 border-slate-300"
                                    }`}
                                  >
                                    {isLolos
                                      ? "Lolos Seleksi (Diterima)"
                                      : isUjian
                                      ? "Tahap Wawancara"
                                      : isTidakLolos
                                      ? "Tidak Lolos"
                                      : isSiap
                                      ? "Berkas Sah (Siap Seleksi)"
                                      : p.status_pendaftaran}
                                  </span>
                                </td>
                                <td className="p-3.5 max-w-[200px]">
                                  <p
                                    className="text-[11px] text-slate-600 line-clamp-2 italic"
                                    title={p.catatan_seleksi || p.catatan_revisi || ""}
                                  >
                                    {p.catatan_seleksi || p.catatan_revisi || "Belum ada catatan panitia"}
                                  </p>
                                </td>
                                <td className="p-3.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSeleksiModal(p)}
                                    className="px-3.5 py-1.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 mx-auto shadow-2xs hover:scale-102"
                                  >
                                    <Award className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Tentukan Kelulusan</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: SINKRONISASI EMIS */}
          {activeTab === "emis" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-emerald-700" />
                      <span>Sinkronisasi EMIS Kemenag &amp; Kopertais IV Surabaya</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Integrasi dan pelaporan data calon mahasiswa baru sesuai standar Education Management Information System (EMIS 4.0).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadExport}
                    className="px-5 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <Download className="w-4 h-4 text-emerald-300" />
                    <span>Unduh Rekap Format EMIS (.csv)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-medium">Status Pemetaan Kolom</span>
                    <p className="text-sm font-black text-emerald-800">100% Sesuai Standar EMIS</p>
                    <p className="text-[11px] text-slate-500">NIK, Nama Ibu, Asal Sekolah, Jenjang &amp; Prodi valid.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-medium">Kopertais Wilayah IV</span>
                    <p className="text-sm font-black text-emerald-800">Surabaya, Jawa Timur</p>
                    <p className="text-[11px] text-slate-500">Kode Institusi STAICI Situbondo terdaftar.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-medium">Data Calon Mahasiswa</span>
                    <p className="text-sm font-black text-slate-900">{pendaftars.length} Terdata di Sistem</p>
                    <p className="text-[11px] text-slate-500">Siap diekspor ke format pelaporan semester.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: LOG AUDIT VIEW */}
          {activeTab === "logs" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Catatan Rekam Jejak (Audit Logs)</h3>
                  <p className="text-xs text-slate-500">Histori operasional dan tindakan verifikasi oleh administrator.</p>
                </div>
                <button
                  type="button"
                  onClick={loadLogs}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="p-3.5">Waktu</th>
                      <th className="p-3.5">Administrator</th>
                      <th className="p-3.5">Tindakan / Aksi</th>
                      <th className="p-3.5">Keterangan Detail</th>
                      <th className="p-3.5">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          Belum ada catatan log aktivitas yang terekam.
                        </td>
                      </tr>
                    ) : (
                      logsList.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70">
                          <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                            {new Date(log.created_at).toLocaleString("id-ID")}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">{log.admin_nama || "Admin"}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#0d3830] font-bold text-[11px] border border-emerald-200">
                              {log.aksi}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-700 max-w-md">{log.detail}</td>
                          <td className="p-3.5 text-slate-400 font-mono text-[11px]">{log.ip_address || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: CMS HOMEPAGE & FAQ MANAGEMENT */}
          {(activeTab === "homepage" || activeTab === "settings") && (
            <div className="space-y-8 animate-fadeIn">
              {/* Top CMS Homepage Header & Global Action */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Home className="w-5 h-5 text-emerald-600" />
                    <span>CMS Homepage &amp; Konten Portal PMB</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Atur konten publik landing page utama secara terpisah: Banner Hero, Kartu Jalur Masuk, Persyaratan Berkas, Kartu Program Studi Unggulan, serta FAQ Tanya Jawab.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveHomepageSettings}
                  disabled={isSavingSettings || !isAnyHomepageDirty}
                  className={`px-6 py-2.5 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 self-start sm:self-auto ${
                    isAnyHomepageDirty
                      ? "bg-[#0d3830] hover:bg-[#165349] text-white cursor-pointer"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  }`}
                >
                  {isAnyHomepageDirty ? (
                    <>
                      <Save className="w-4 h-4 text-amber-400" />
                      <span>{isSavingSettings ? "Menyimpan..." : "Simpan Seluruh Konten Homepage"}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-slate-400" />
                      <span>Seluruh Konten Homepage Tersimpan</span>
                    </>
                  )}
                </button>
              </div>

              {/* CARD 1: HERO BANNER & PENGUMUMAN */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#0d3830]" />
                      <span>1. Teks Banner Utama &amp; Pengumuman (Hero Section)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Teks headline utama dan pengumuman yang langsung dilihat calon mahasiswa di bagian atas landing page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveBannerHomepage}
                    disabled={isSavingSettings || !isBannerDirty}
                    className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 ${
                      isBannerDirty
                        ? "bg-[#0d3830] hover:bg-[#165349] text-white cursor-pointer"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    {isBannerDirty ? (
                      <>
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isSavingSettings ? "Menyimpan..." : "Simpan Banner"}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                        <span>Banner Tersimpan</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Judul Utama Banner (Headline) *</label>
                    <input
                      type="text"
                      value={settings.banner_title}
                      onChange={(e) => {
                        setSettings({ ...settings, banner_title: e.target.value });
                        setIsBannerDirty(true);
                      }}
                      placeholder="Contoh: Pusat Pendaftaran Mahasiswa Baru & Informasi Program Studi"
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Subtitle Deskripsi Banner</label>
                    <textarea
                      rows={2}
                      value={settings.banner_subtitle}
                      onChange={(e) => {
                        setSettings({ ...settings, banner_subtitle: e.target.value });
                        setIsBannerDirty(true);
                      }}
                      placeholder="Contoh: Meneguhkan keilmuan Islam modern dan etika profesional santri..."
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Teks Pengumuman Pill Badge (Header Hero)</label>
                    <input
                      type="text"
                      value={settings.announcement_text}
                      onChange={(e) => {
                        setSettings({ ...settings, announcement_text: e.target.value });
                        setIsBannerDirty(true);
                      }}
                      placeholder="Contoh: Penerimaan Mahasiswa Baru Gelombang 1 Resmi Dibuka"
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: PROGRAM STUDI YANG DITAMPILKAN DI HOMEPAGE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#0d3830]" />
                      <span>2. Program Studi yang Ditampilkan di Homepage</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pilih program studi dari master data Program Studi untuk ditampilkan sebagai kartu unggulan di landing page utama. Anda dapat menyesuaikan deskripsi singkat dan memilih 3 badge yang tampil.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveProdiHomepage}
                    disabled={isSavingSettings || !isProdiDirty}
                    className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 ${
                      isProdiDirty
                        ? "bg-[#0d3830] hover:bg-[#165349] text-white cursor-pointer"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    {isProdiDirty ? (
                      <>
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isSavingSettings ? "Menyimpan..." : "Simpan Kartu Prodi"}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                        <span>Kartu Prodi Tersimpan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Dropdown Selector to Add Prodi */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center justify-between">
                      <span>Pilih Program Studi Terdaftar *</span>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        {availableProdiList.length} prodi belum ditampilkan
                      </span>
                    </label>
                    <select
                      value={selectedProdiToAdd}
                      onChange={(e) => setSelectedProdiToAdd(e.target.value)}
                      disabled={availableProdiList.length === 0}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0d3830] disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">
                        {availableProdiList.length === 0
                          ? "-- Semua Program Studi Sudah Ditampilkan di Homepage --"
                          : "-- Pilih Program Studi untuk Ditambahkan ke Homepage --"}
                      </option>
                      {availableProdiList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.kode} - {p.nama} ({p.jenjang || "S1"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddHomepageProdi}
                    disabled={availableProdiList.length === 0 || !selectedProdiToAdd}
                    className="px-5 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer sm:self-end disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 text-emerald-300" />
                    <span>Tambahkan ke Homepage</span>
                  </button>
                </div>

                {/* List of Configured Homepage Prodi Cards */}
                {homepageProdis.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                    Belum ada kartu program studi yang dipilih untuk homepage. Silakan pilih prodi di atas.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {homepageProdis.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-emerald-300 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-emerald-100 text-[#0d3830] border border-emerald-200">
                              {item.kode}
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 font-serif">
                              {item.nama}
                            </h5>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveHomepageProdi(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                            title="Hapus kartu prodi ini dari homepage"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus Card</span>
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Deskripsi Singkat (Tampil di Homepage) *
                          </label>
                          <textarea
                            rows={2}
                            value={item.deskripsi_singkat}
                            onChange={(e) => handleUpdateHomepageProdi(idx, "deskripsi_singkat", e.target.value)}
                            placeholder="Deskripsi singkat program studi yang memikat calon mahasiswa..."
                            className="w-full p-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs font-normal text-slate-700 focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>

                        {/* Badges Customizer: 3 Columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500">Badge 1: Jenjang</label>
                            <input
                              type="text"
                              value={item.badge_jenjang}
                              onChange={(e) => handleUpdateHomepageProdi(idx, "badge_jenjang", e.target.value)}
                              placeholder="Contoh: Jenjang S1"
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500">Badge 2: Gelar Akademik</label>
                            <input
                              type="text"
                              value={item.badge_gelar}
                              onChange={(e) => handleUpdateHomepageProdi(idx, "badge_gelar", e.target.value)}
                              placeholder="Contoh: Gelar Sarjana Hukum (S.H.)"
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500">Badge 3: Akreditasi</label>
                            <input
                              type="text"
                              value={item.badge_akreditasi}
                              onChange={(e) => handleUpdateHomepageProdi(idx, "badge_akreditasi", e.target.value)}
                              placeholder="Contoh: Terakreditasi BAN-PT"
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD 3: PERSYARATAN BERKAS DOKUMEN (TERSINKRONISASI DARI MASTER) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-emerald-700" />
                      <span>3. Persyaratan Dokumen &amp; Berkas Pendaftaran</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Tersinkronisasi Otomatis
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftar berkas yang tampil di landing page publik diambil langsung dari Master Persyaratan Dokumen di menu Pendaftaran &amp; Biaya.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("pendaftaran");
                      setPendaftaranSubTab("dokumen");
                    }}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0d3830] border border-emerald-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Settings className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Kelola Master Dokumen di Pendaftaran &amp; Biaya &rarr;</span>
                  </button>
                </div>

                {/* Preview of active documents from persyaratanDocList */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    Pratinjau Dokumen Berkas yang Aktif Ditampilkan di Beranda Publik ({persyaratanDocList.filter((d: any) => d.is_aktif).length} Dokumen):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {persyaratanDocList.filter((d: any) => d.is_aktif).map((doc: any, idx: number) => (
                      <div key={doc.id || idx} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{doc.nama_dokumen}</span>
                        {doc.is_wajib && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 ml-auto flex-shrink-0">
                            Wajib
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 4: INFORMASI JALUR MASUK PMB (PILIH DARI MASTER JALUR) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-emerald-700" />
                      <span>4. Informasi Jalur Masuk yang Ditampilkan di Homepage</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pilih jalur pendaftaran dari master data Jalur Seleksi (di menu Pendaftaran &amp; Biaya) untuk ditampilkan sebagai kartu di landing page utama.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveJalurHomepage}
                    disabled={isSavingSettings || !isJalurDirty}
                    className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 ${
                      isJalurDirty
                        ? "bg-[#0d3830] hover:bg-[#165349] text-white cursor-pointer"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    {isJalurDirty ? (
                      <>
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isSavingSettings ? "Menyimpan..." : "Simpan Kartu Jalur"}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                        <span>Kartu Jalur Tersimpan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Dropdown Selector to Add Jalur from Master */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center justify-between">
                      <span>Pilih Jalur Pendaftaran Terdaftar *</span>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        {availableJalurList.length} jalur belum ditampilkan
                      </span>
                    </label>
                    <select
                      value={selectedJalurToAdd}
                      onChange={(e) => setSelectedJalurToAdd(e.target.value)}
                      disabled={availableJalurList.length === 0}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0d3830] disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">
                        {availableJalurList.length === 0
                          ? "-- Semua Jalur Seleksi Sudah Ditampilkan di Homepage --"
                          : "-- Pilih Jalur Seleksi dari Master untuk Ditambahkan ke Homepage --"}
                      </option>
                      {availableJalurList.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.kode} - {j.nama} {j.bebas_biaya ? "(Bebas Biaya / Gratis)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddHomepageJalur}
                    disabled={availableJalurList.length === 0 || !selectedJalurToAdd}
                    className="px-5 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer sm:self-end disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 text-emerald-300" />
                    <span>Tambahkan ke Homepage</span>
                  </button>
                </div>

                {/* List of Jalur Cards */}
                {jalurCards.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                    Belum ada kartu jalur masuk yang dipilih untuk homepage. Silakan pilih jalur dari master data di atas.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jalurCards.map((card, idx) => (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all space-y-3 bg-white shadow-xs ${
                          card.is_aktif ? "border-slate-300" : "border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            {card.kode && (
                              <span className="text-[11px] font-bold font-mono text-[#0d3830] bg-emerald-100 px-2 py-0.5 rounded-md">
                                {card.kode}
                              </span>
                            )}
                            <h5 className="text-sm font-bold text-slate-900 font-serif">{card.nama}</h5>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={card.is_aktif}
                                onChange={(e) => handleUpdateJalurCard(idx, "is_aktif", e.target.checked)}
                                className="w-3.5 h-3.5 text-[#0d3830] border-slate-300 rounded cursor-pointer"
                              />
                              <span>{card.is_aktif ? "Aktif" : "Nonaktif"}</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveJalurCard(idx)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Hapus kartu jalur ini dari homepage"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-700">Teks Badge Label *</label>
                          <input
                            type="text"
                            value={card.badge}
                            onChange={(e) => handleUpdateJalurCard(idx, "badge", e.target.value)}
                            placeholder="Contoh: Jalur Reguler / Beasiswa KIP"
                            className="w-full p-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs font-semibold text-emerald-800 focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-700">Deskripsi Penjelasan Jalur di Homepage *</label>
                          <textarea
                            rows={3}
                            value={card.deskripsi}
                            onChange={(e) => handleUpdateJalurCard(idx, "deskripsi", e.target.value)}
                            placeholder="Keterangan kriteria penerima, benefit, dan ketentuan seleksi..."
                            className="w-full p-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs font-normal text-slate-700 leading-relaxed focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD 5: FAQ MANAGEMENT (TANYA JAWAB PMB) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                      <span>5. Manajemen Tanya Jawab Seputar PMB (FAQ Dinamis)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Admin dapat menambah, mengedit, menghapus, atau menonaktifkan pertanyaan &amp; jawaban seputar regulasi baru kapan saja secara dinamis.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openAddFaqModal}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah FAQ Baru</span>
                  </button>
                </div>

                {faqsList.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">Belum ada data FAQ</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Klik tombol &quot;Tambah FAQ Baru&quot; untuk menambahkan tanya jawab pendaftaran.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {faqsList.map((faq) => (
                      <div
                        key={faq.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          faq.is_aktif
                            ? "bg-white border-slate-200 hover:border-emerald-300 shadow-xs"
                            : "bg-slate-50/80 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {faq.kategori || "Umum"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Urutan #{faq.urutan}
                              </span>
                              {!faq.is_aktif && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                                  Nonaktif
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 pt-1 leading-snug">
                              {faq.pertanyaan}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleFaq(faq.id)}
                              title={faq.is_aktif ? "Nonaktifkan FAQ" : "Aktifkan FAQ"}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition cursor-pointer"
                            >
                              {faq.is_aktif ? (
                                <ToggleRight className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-slate-400" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditFaqModal(faq)}
                              title="Edit FAQ"
                              className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteFaq(faq.id)}
                              title="Hapus FAQ"
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed line-clamp-3">
                          {faq.jawaban}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: CMS HOTLINE & NARAHUBUNG */}
          {activeTab === "hotline" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-emerald-700" />
                      <span>CMS Hotline &amp; Narahubung Layanan PMB</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Pusat kelola helpdesk multi-kanal (WhatsApp, Telepon, Email Layanan) dan kontak operasional resmi kampus untuk melayani calon mahasiswa baru.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={openAddHotlineModal}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Narahubung</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="px-4 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                    >
                      <Save className="w-4 h-4 text-amber-400" />
                      <span>{isSavingSettings ? "Menyimpan..." : "Simpan Info Kampus"}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Section 1: Multi-Channel Helpdesk / Narahubung Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-700" />
                        <span>1. Saluran Helpdesk &amp; Narahubung Petugas PMB</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Kontak helpdesk di bawah ini ditampilkan secara interaktif pada tombol bantuan dan narahubung di halaman publik maupun dashboard calon mahasiswa.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {hotlineList.length} Saluran Kontak
                    </span>
                  </div>

                  {hotlineList.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3 bg-slate-50/50">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Phone className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Belum ada data kontak narahubung/helpdesk khusus. Klik tombol di bawah untuk menambahkan narahubung baru.
                      </p>
                      <button
                        type="button"
                        onClick={openAddHotlineModal}
                        className="px-4 py-2 bg-[#0d3830] hover:bg-[#165349] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                      >
                        + Tambah Narahubung Pertama
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                            <th className="p-3 w-12 text-center">Urutan</th>
                            <th className="p-3">Layanan &amp; Petugas</th>
                            <th className="p-3">Saluran &amp; Kontak</th>
                            <th className="p-3">Jam Layanan</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {hotlineList.map((hl, idx) => (
                            <tr key={hl.id || idx} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 text-center font-mono font-bold text-slate-500">
                                {hl.urutan || idx + 1}
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-slate-900">{hl.nama_layanan}</div>
                                {hl.nama_petugas && (
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    PIC: <span className="font-medium text-slate-700">{hl.nama_petugas}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                      hl.tipe_kontak === "whatsapp"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : hl.tipe_kontak === "email"
                                        ? "bg-amber-100 text-amber-900"
                                        : "bg-blue-100 text-blue-900"
                                    }`}
                                  >
                                    {hl.tipe_kontak || "whatsapp"}
                                  </span>
                                  <span className="font-mono font-bold text-slate-800">
                                    {hl.nomor_atau_email}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-slate-600 text-[11px]">
                                {hl.jam_layanan || "08.00 - 16.00 WIB"}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleHotline(hl.id)}
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                    hl.is_aktif
                                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                  }`}
                                  title="Klik untuk mengubah status aktif"
                                >
                                  {hl.is_aktif ? "Aktif" : "Non-aktif"}
                                </button>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditHotlineModal(hl)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                    title="Edit Narahubung"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteHotline(hl.id, hl.nama_layanan)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                                    title="Hapus Narahubung"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Sub-Section 2: Official Campus & General Contact Form */}
                <form onSubmit={handleSaveSettings} className="space-y-6 pt-4 border-t border-slate-100">
                  <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#0d3830]" />
                      <span>2. Identitas Kampus &amp; Layanan Pusat PMB</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Nomor WhatsApp Utama *</label>
                        <input
                          type="text"
                          value={settings.no_whatsapp_cs}
                          onChange={(e) => setSettings({ ...settings, no_whatsapp_cs: e.target.value })}
                          placeholder="085233432221"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Jam Operasional Layanan *</label>
                        <input
                          type="text"
                          value={settings.jam_operasional}
                          onChange={(e) => setSettings({ ...settings, jam_operasional: e.target.value })}
                          placeholder="Senin - Sabtu: 08.00 - 15.00 WIB"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Email Resmi PMB *</label>
                        <input
                          type="email"
                          value={settings.email_cs}
                          onChange={(e) => setSettings({ ...settings, email_cs: e.target.value })}
                          placeholder="pmb@staicisitubondo.ac.id"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Alamat Kampus *</label>
                        <input
                          type="text"
                          value={settings.alamat_kampus}
                          onChange={(e) => setSettings({ ...settings, alamat_kampus: e.target.value })}
                          placeholder="Jl. Raya Panji No. 12, Situbondo, Jawa Timur"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informational Callout: Rekening Bank PMB */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-900 block">Pengaturan Rekening Bank PMB &amp; Panduan Pembayaran</span>
                      <p className="text-emerald-700 mt-0.5">
                        Rekening bank pembayaran multi-rekening (BSI, Mandiri, BRI, dll.) serta petunjuk transfer dan regulasi bukti bayar sekarang dikelola terpusat di menu <strong>CMS Pendaftaran &amp; Biaya</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("pendaftaran");
                          setPendaftaranSubTab("rekening");
                        }}
                        className="mt-2 inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                      >
                        Buka CMS Rekening Bank Pembayaran &rarr;
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-3 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      <Save className="w-4 h-4 text-amber-400" />
                      <span>{isSavingSettings ? "Menyimpan Informasi..." : "Simpan Informasi Kampus"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: TAMBAH / EDIT FAQ */}
          {isFaqModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 relative animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-700" />
                    <span>{editingFaq ? "Edit Pertanyaan FAQ" : "Tambah FAQ Baru"}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsFaqModalOpen(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveFaq} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Kategori FAQ *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Pendaftaran / Berkas / Biaya"
                        value={faqForm.kategori}
                        onChange={(e) => setFaqForm({ ...faqForm, kategori: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Urutan Tampil *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={faqForm.urutan}
                        onChange={(e) => setFaqForm({ ...faqForm, urutan: parseInt(e.target.value) || 1 })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Pertanyaan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kapan waktu pendaftaran dibuka?"
                      value={faqForm.pertanyaan}
                      onChange={(e) => setFaqForm({ ...faqForm, pertanyaan: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Jawaban / Penjelasan Lengkap *</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Masukkan jawaban yang jelas dan mudah dipahami calon mahasiswa..."
                      value={faqForm.jawaban}
                      onChange={(e) => setFaqForm({ ...faqForm, jawaban: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="faq_is_aktif"
                      checked={faqForm.is_aktif}
                      onChange={(e) => setFaqForm({ ...faqForm, is_aktif: e.target.checked })}
                      className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                    />
                    <label htmlFor="faq_is_aktif" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Tampilkan FAQ ini di Halaman Utama (Aktif)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsFaqModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingFaq}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-75"
                    >
                      {isSavingFaq ? "Menyimpan..." : editingFaq ? "Simpan Perubahan" : "Tambahkan FAQ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: DETAIL PENDAFTAR & VERIFIKASI BERKAS */}
          {isDetailOpen && selectedPendaftar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-scaleUp">
                
                {/* Header Modal */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0d3830] text-emerald-300 font-extrabold text-base flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden border border-emerald-300/30">
                      {selectedPendaftar.foto_profil ? (
                        <Image
                          src={getFileUrl(selectedPendaftar.foto_profil)}
                          alt={getUserName(selectedPendaftar)}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getUserName(selectedPendaftar).slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-slate-900 font-serif">
                          {getUserName(selectedPendaftar)}
                        </h3>
                        <span className="font-mono text-xs font-bold text-[#0d3830] bg-[#eaf6f2] px-2.5 py-0.5 rounded-lg border border-[#b2e2d5]">
                          {selectedPendaftar.nomor_pendaftaran || `PMB-2026-00${selectedPendaftar.id}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        NIK: <span className="font-mono font-semibold">{getUserNik(selectedPendaftar)}</span> • Prodi:{" "}
                        <strong className="text-slate-800">{getProdiTitle(selectedPendaftar.program_studi)}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailOpen(false);
                      setSelectedPendaftar(null);
                    }}
                    className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition cursor-pointer flex-shrink-0"
                    title="Tutup Modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Section 1: Profil & Kontak Calon Mahasiswa */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#0d3830]" />
                    <span>Biodata &amp; Informasi Kontak Pendaftar</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Jalur Pendaftaran:</span>
                      <div className="mt-1">
                        {getJalurBadge(selectedPendaftar)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Asal Sekolah (SLTA):</span>
                      <strong className="text-slate-900 font-bold">{selectedPendaftar.nama_sekolah || getAsalSekolah(selectedPendaftar)}</strong>
                      {selectedPendaftar.jurusan_sekolah && (
                        <span className="text-slate-500 block text-[11px]">Jurusan: {selectedPendaftar.jurusan_sekolah} ({selectedPendaftar.tahun_lulus || "-"})</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">WhatsApp &amp; Email:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <strong className="text-slate-900 font-bold">{selectedPendaftar.user?.no_hp || "-"}</strong>
                        {selectedPendaftar.user?.no_hp && (
                          <a
                            href={`https://wa.me/${selectedPendaftar.user.no_hp.replace(/^0/, "62")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700"
                          >
                            Chat WA
                          </a>
                        )}
                      </div>
                      <span className="text-slate-500 block text-[11px] truncate">{selectedPendaftar.user?.email || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Orang Tua Kandung:</span>
                      <span className="text-slate-800 block">Ayah: <strong>{selectedPendaftar.data_orang_tua?.nama_ayah || "-"}</strong></span>
                      <span className="text-slate-800 block">Ibu: <strong>{selectedPendaftar.data_orang_tua?.nama_ibu || "-"}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Pemeriksaan & Verifikasi Dokumen Berkas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0d3830]" />
                        <span>Dokumen Persyaratan Calon Mahasiswa (FR-8.3)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Periksa keaslian file yang diunggah dan beri status verifikasi per-dokumen di bawah ini.
                      </p>
                    </div>
                  </div>

                  {/* List of Documents */}
                  <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-white">
                    {[
                      { key: "kk", label: "Kartu Keluarga (KK)" },
                      { key: "ktp", label: "KTP Calon Mahasiswa" },
                      { key: "ijazah", label: "Ijazah / SKL SLTA" },
                      { key: "foto", label: "Pas Foto 3x4 Berwarna" },
                      { key: "kip", label: "Kartu KIP (Khusus Jalur KIP)" },
                      { key: "lainnya", label: "Dokumen Pendukung Lainnya" },
                    ].map((docType) => {
                      const berkasItem = Array.isArray(selectedPendaftar.berkas)
                        ? selectedPendaftar.berkas.find((b: any) => b.jenis_dokumen?.toLowerCase() === docType.key.toLowerCase())
                        : null;

                      return (
                        <div key={docType.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{docType.label}</span>
                              {docType.key === "kip" && (
                                selectedPendaftar.jalur_pendaftaran === "KIP-Kuliah" || selectedPendaftar.jalur === "KIP-Kuliah" ? (
                                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-extrabold uppercase">
                                    Wajib (Jalur KIP)
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[10px] font-medium">
                                    Opsional (Jalur Reguler)
                                  </span>
                                )
                              )}
                              {berkasItem ? (
                                berkasItem.status_verifikasi === "valid" ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold">
                                    Valid &amp; Sah
                                  </span>
                                ) : berkasItem.status_verifikasi === "invalid" ? (
                                  <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-md text-[10px] font-bold">
                                    Perlu Revisi
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-bold">
                                    Menunggu Verifikasi
                                  </span>
                                )
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-md text-[10px] font-bold">
                                  Belum Diunggah
                                </span>
                              )}
                            </div>

                            {berkasItem ? (
                              <p className="text-[11px] text-slate-500 font-mono">
                                File: {berkasItem.file_name} • {(berkasItem.file_size / 1024).toFixed(0)} KB
                                {berkasItem.catatan_admin && (
                                  <span className="text-red-700 block font-sans font-medium mt-0.5">
                                    Catatan Revisi: {berkasItem.catatan_admin}
                                  </span>
                                )}
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">Pendaftar belum mengunggah dokumen ini.</p>
                            )}
                          </div>

                          {/* Action Buttons for Document */}
                          {berkasItem ? (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <a
                                href={getFileUrl(berkasItem.file_path)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition flex items-center gap-1.5"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Lihat File</span>
                              </a>

                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleVerifikasiDokumen(berkasItem.id, "valid")}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-75"
                                title="Sahkan berkas ini"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Valid</span>
                              </button>

                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => {
                                  setRejectingBerkas(berkasItem);
                                  setRejectNote(berkasItem.catatan_admin || "");
                                }}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                                title="Minta mahasiswa mengunggah ulang berkas ini"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                                <span>Minta Revisi</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => {
                                  setRejectingBerkas({
                                    id: 0,
                                    jenis_dokumen: docType.key,
                                    file_name: docType.label,
                                  });
                                  setRejectNote(`Mohon segera unggah dokumen ${docType.label} untuk kelengkapan administrasi PMB.`);
                                }}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                                title="Minta mahasiswa mengunggah dokumen ini"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                <span>Minta Unggah</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Verifikasi Bukti Transfer Pembayaran */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#0d3830]" />
                    <span>Konfirmasi Pembayaran Biaya PMB (FR-8.4)</span>
                  </h4>

                  {Array.isArray(selectedPendaftar.pembayaran) && selectedPendaftar.pembayaran.length > 0 ? (
                    selectedPendaftar.pembayaran.map((pembayaran: any) => (
                      <div key={pembayaran.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 font-bold text-sm">
                              Transfer Rp {Number(pembayaran.jumlah).toLocaleString("id-ID")}
                            </strong>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                              pembayaran.status === "diterima"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : pembayaran.status === "ditolak"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-blue-50 text-blue-800 border-blue-200"
                            }`}>
                              {pembayaran.status === "diterima"
                                ? "Lunas & Sah"
                                : pembayaran.status === "ditolak"
                                ? "Perlu Revisi"
                                : "Menunggu Verifikasi"}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]">
                            Bank Tujuan: <strong>{pembayaran.bank_tujuan}</strong> • Pengirim: <strong>{pembayaran.nama_pengirim || "-"}</strong>
                          </p>
                          {pembayaran.alasan_penolakan && (
                            <p className="text-amber-800 font-semibold text-[11px]">
                              Catatan Revisi: {pembayaran.alasan_penolakan}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {pembayaran.bukti_transfer_path && (
                            <a
                              href={getFileUrl(pembayaran.bukti_transfer_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs transition flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Lihat Bukti Struk</span>
                            </a>
                          )}

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleVerifikasiPembayaran(pembayaran.id, "diterima")}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui Sah</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => {
                              setRejectingPembayaran(pembayaran);
                              setRejectPembayaranNote("");
                            }}
                            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold text-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                            <span>Minta Revisi</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 italic">
                      Pendaftar belum mengirimkan konfirmasi bukti transfer pembayaran.
                    </div>
                  )}
                </div>

                {(() => {
                  const isKip = selectedPendaftar.jalur_pendaftaran === "KIP-Kuliah" || selectedPendaftar.jalur === "KIP-Kuliah";
                  const isPayApproved = isKip || (Array.isArray(selectedPendaftar.pembayaran) && selectedPendaftar.pembayaran.some((payItem: any) => payItem.status === "diterima"));
                  const berkasArr = Array.isArray(selectedPendaftar.berkas) ? selectedPendaftar.berkas : [];
                  const validMap: Record<string, boolean> = {};
                  berkasArr.forEach((b: any) => {
                    if (b.status_verifikasi === "valid") validMap[b.jenis_dokumen?.toLowerCase()] = true;
                  });
                  const isBerkasComplete = validMap["kk"] && validMap["ktp"] && validMap["ijazah"] && validMap["foto"] && (!isKip || validMap["kip"]);

                  return (
                    <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs">
                      <span className="font-extrabold text-slate-900 block">Status Administrasi &amp; Berkas:</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          selectedPendaftar.status_pendaftaran === "berkas_diverifikasi"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : selectedPendaftar.status_pendaftaran === "belum_lengkap" || selectedPendaftar.status_pendaftaran === "ditolak_perlu_perbaikan"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}>
                          {selectedPendaftar.status_pendaftaran === "berkas_diverifikasi"
                            ? "Berkas & Pembayaran Terverifikasi Sah"
                            : selectedPendaftar.status_pendaftaran === "belum_lengkap" || selectedPendaftar.status_pendaftaran === "ditolak_perlu_perbaikan"
                            ? "Perlu Revisi / Perbaikan Berkas"
                            : isKip && isBerkasComplete
                            ? "Berkas Terverifikasi Sah (Bebas Biaya KIP)"
                            : isPayApproved && !isBerkasComplete
                            ? "Pembayaran Sah — Menunggu Verifikasi Berkas"
                            : isBerkasComplete && !isPayApproved
                            ? "Berkas Sah — Menunggu Validasi Pembayaran"
                            : "Menunggu Verifikasi Berkas & Pembayaran"}
                        </span>
                      </div>

                      {selectedPendaftar.status_pendaftaran === "berkas_diverifikasi" ? (
                        <p className="text-[11px] text-slate-500">
                          Seluruh berkas dan pembayaran calon mahasiswa ini telah sah. Silakan buka menu <strong>Seleksi &amp; Penerimaan</strong> pada sidebar untuk menentukan status kelolosan.
                        </p>
                      ) : isKip ? (
                        <p className="text-[11px] text-slate-500">
                          Pendaftar jalur <strong>KIP-Kuliah bebas biaya pendaftaran</strong>. Pendaftar berstatus sah dan siap seleksi apabila <strong>seluruh berkas wajib valid</strong>.
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Calon mahasiswa akan berstatus sah dan siap seleksi apabila <strong>seluruh berkas wajib valid</strong> dan <strong>pembayaran telah disetujui</strong>.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Footer Modal */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailOpen(false);
                      setSelectedPendaftar(null);
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: PENETAPAN SELEKSI & KELULUSAN */}
          {isSeleksiModalOpen && selectedForSeleksi && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto">
                {/* Header Modal */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold shadow-2xs">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base font-serif">
                        Penetapan Seleksi &amp; Kelulusan PMB
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {selectedForSeleksi.nomor_pendaftaran || `PMB-2026-00${selectedForSeleksi.id}`}
                        </span>
                        <span className="font-bold text-slate-800">{getUserName(selectedForSeleksi)}</span>
                        <span className="text-slate-400 font-mono">NIK: {getUserNik(selectedForSeleksi)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSeleksiModalOpen(false);
                      setSelectedForSeleksi(null);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 4 Kartu Pertimbangan Calon Mahasiswa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Kartu 1: Program Studi & Jalur Pendaftaran */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <span>Program Studi &amp; Jalur</span>
                      </div>
                      {getJalurBadge(selectedForSeleksi)}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Program Studi Pilihan
                        </span>
                        <p className="font-extrabold text-slate-900 text-sm font-serif">
                          {getProdiTitle(selectedForSeleksi.program_studi)}
                        </p>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Jenjang {selectedForSeleksi.program_studi?.jenjang || "S1"} • Kode:{" "}
                          {selectedForSeleksi.program_studi?.kode || "-"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Gelombang PMB:</span>
                          <strong className="text-slate-800">
                            {getGelombangTitle(selectedForSeleksi.gelombang, selectedForSeleksi.jalur)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Biaya Pendaftaran:</span>
                          {isKipApplicant(selectedForSeleksi) ? (
                            <span className="text-emerald-700 font-bold">Bebas Biaya (KIP)</span>
                          ) : (
                            <span className="text-slate-800 font-bold">
                              {selectedForSeleksi.pembayaran?.some((pay: any) => pay.status === "diterima")
                                ? "Lunas & Sah"
                                : "Menunggu / Belum Lunas"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kartu 2: Rekam Jejak Akademik SLTA */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                          <School className="w-4 h-4" />
                        </div>
                        <span>Rekam Jejak Akademik SLTA</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-bold">
                        Lulus {selectedForSeleksi.tahun_lulus || "-"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Asal Sekolah &amp; Jurusan
                        </span>
                        <p className="font-extrabold text-slate-900 text-sm">
                          {selectedForSeleksi.nama_sekolah || getAsalSekolah(selectedForSeleksi)}
                        </p>
                        <span className="text-[11px] text-slate-500">
                          Jurusan: <strong className="text-slate-700">{selectedForSeleksi.jurusan_sekolah || "-"}</strong> • Status:{" "}
                          <strong className="text-slate-700">{selectedForSeleksi.status_sekolah || "-"}</strong>
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Nilai Rapor / Ijazah:</span>
                          <span className="text-[11px] text-slate-500">Skala standar kelulusan</span>
                        </div>
                        <div className="px-3 py-1 bg-emerald-50 border border-emerald-300 rounded-xl text-center">
                          <span className="text-xs text-emerald-800 font-mono font-black">
                            {selectedForSeleksi.nilai_rata_rata
                              ? Number(selectedForSeleksi.nilai_rata_rata).toFixed(2)
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kartu 3: Kondisi Sosial-Ekonomi Orang Tua */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                          <Users className="w-4 h-4" />
                        </div>
                        <span>Kondisi Sosial-Ekonomi (Orang Tua)</span>
                      </div>
                      {isKipApplicant(selectedForSeleksi) && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                          Verifikasi KIP
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200/60">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Data Ayah:</span>
                          <p className="font-bold text-slate-800 truncate">
                            {selectedForSeleksi.data_orang_tua?.nama_ayah || "-"}
                          </p>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {selectedForSeleksi.data_orang_tua?.pekerjaan_ayah || "Pekerjaan -"}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            Gaji: {selectedForSeleksi.data_orang_tua?.penghasilan_ayah || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Data Ibu:</span>
                          <p className="font-bold text-slate-800 truncate">
                            {selectedForSeleksi.data_orang_tua?.nama_ibu || "-"}
                          </p>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {selectedForSeleksi.data_orang_tua?.pekerjaan_ibu || "Pekerjaan -"}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            Gaji: {selectedForSeleksi.data_orang_tua?.penghasilan_ibu || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-0.5 text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          Kontak Ortu/Wali:
                        </span>
                        <strong className="text-slate-800 font-mono">
                          {selectedForSeleksi.data_orang_tua?.no_hp_orang_tua_wali ||
                            selectedForSeleksi.user?.nomor_telepon ||
                            "-"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Kartu 4: Quick Preview Berkas Pendukung */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                        <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <span>Quick Preview Berkas Dokumen</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {Array.isArray(selectedForSeleksi.berkas) ? selectedForSeleksi.berkas.length : 0} Dokumen
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs max-h-[140px] overflow-y-auto pr-1">
                      {Array.isArray(selectedForSeleksi.berkas) && selectedForSeleksi.berkas.length > 0 ? (
                        selectedForSeleksi.berkas.map((b: any) => {
                          const isDocValid = b.status_verifikasi === "valid";
                          const isDocInvalid = b.status_verifikasi === "invalid";
                          return (
                            <div
                              key={b.id || b.jenis_dokumen}
                              className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition text-[11px]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    isDocValid
                                      ? "bg-emerald-500"
                                      : isDocInvalid
                                      ? "bg-rose-500"
                                      : "bg-amber-500"
                                  }`}
                                />
                                <span className="font-bold text-slate-800 truncate">{b.jenis_dokumen}</span>
                                <span className="text-[10px] text-slate-400 truncate hidden sm:inline max-w-[120px]">
                                  {b.file_name}
                                </span>
                              </div>
                              {b.file_path ? (
                                <a
                                  href={getFileUrl(b.file_path)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0d3830] hover:text-[#165349] bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition flex-shrink-0 cursor-pointer"
                                >
                                  <span>Buka</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Tanpa file</span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[11px] text-slate-400 italic text-center py-4">
                          Belum ada berkas yang diunggah
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Penetapan Keputusan Hasil Seleksi */}
                <form onSubmit={handleSubmitSeleksi} className="space-y-4 pt-1">
                  {/* Status Selection Cards */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 block">
                        Penetapan Keputusan Hasil Seleksi <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">Pilih salah satu status</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* 1. Lolos Seleksi */}
                      <button
                        type="button"
                        onClick={() => {
                          setSeleksiForm({
                            ...seleksiForm,
                            status: "lolos_seleksi",
                          });
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          seleksiForm.status === "lolos_seleksi"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Lolos Seleksi
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Diterima
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          Calon mahasiswa resmi diterima dan berhak daftar ulang.
                        </p>
                      </button>

                      {/* 2. Jadwalkan Wawancara */}
                      <button
                        type="button"
                        onClick={() => {
                          setSeleksiForm({
                            ...seleksiForm,
                            status: "mengikuti_ujian",
                          });
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          seleksiForm.status === "mengikuti_ujian"
                            ? "bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-blue-600" />
                            Jadwalkan Wawancara
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Wawancara
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          Wawancara offline / di luar sistem. Tulis jadwal pada catatan di bawah.
                        </p>
                      </button>

                      {/* 3. Tidak Lolos */}
                      <button
                        type="button"
                        onClick={() => {
                          setSeleksiForm({
                            ...seleksiForm,
                            status: "tidak_lolos",
                          });
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          seleksiForm.status === "tidak_lolos"
                            ? "bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20 shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            Tidak Lolos
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            Ditolak
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          Belum memenuhi standar kualifikasi pada gelombang ini.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Catatan / Pesan Pengumuman Panitia dengan Quick Templates */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>Catatan &amp; Pengumuman untuk Mahasiswa</span>
                      </label>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">Template:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSeleksiForm({
                              ...seleksiForm,
                              catatan:
                                "Selamat! Anda dinyatakan Lolos Seleksi Penerimaan Mahasiswa Baru STAI Cendekia Insani Situbondo Tahun Akademik 2026/2027. Silakan segera melakukan daftar ulang di kampus atau melalui portal.",
                            })
                          }
                          className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
                        >
                          Lolos
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSeleksiForm({
                              ...seleksiForm,
                              catatan:
                                "Yth. Calon Mahasiswa, Anda dijadwalkan mengikuti sesi wawancara tatap muka di Kampus STAI Cendekia Insani Situbondo pada [Hari, Tanggal, Jam]. Harap membawa berkas fisik asli.",
                            })
                          }
                          className="text-[10px] px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition cursor-pointer"
                        >
                          Wawancara Kampus
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSeleksiForm({
                              ...seleksiForm,
                              catatan:
                                "Yth. Calon Mahasiswa, Anda dijadwalkan mengikuti sesi wawancara via WhatsApp / Telepon oleh panitia seleksi. Harap pastikan nomor HP Anda aktif.",
                            })
                          }
                          className="text-[10px] px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition cursor-pointer"
                        >
                          Wawancara WA/Online
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSeleksiForm({
                              ...seleksiForm,
                              catatan:
                                "Mohon maaf, Anda belum memenuhi kualifikasi seleksi penerimaan mahasiswa baru STAI Cendekia Insani Situbondo pada periode ini. Tetap semangat!",
                            })
                          }
                          className="text-[10px] px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition cursor-pointer"
                        >
                          Tidak Lolos
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={seleksiForm.catatan}
                      onChange={(e) => setSeleksiForm({ ...seleksiForm, catatan: e.target.value })}
                      placeholder="Masukkan catatan keputusan hasil seleksi atau instruksi jadwal wawancara untuk calon mahasiswa..."
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830] transition leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-400">
                      * Pesan ini akan otomatis tampil di dashboard portal calon mahasiswa.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSeleksiModalOpen(false);
                        setSelectedForSeleksi(null);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-75 flex items-center gap-1.5 shadow-sm"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>{isProcessing ? "Menyimpan..." : "Simpan Keputusan"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: INPUT CATATAN PENOLAKAN / REVISI BERKAS */}
          {rejectingBerkas && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>Minta Revisi &amp; Unggah Ulang Berkas</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setRejectingBerkas(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Dokumen: {rejectingBerkas.file_name || rejectingBerkas.jenis_dokumen}</span>
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Status calon mahasiswa akan otomatis berubah menjadi <strong>Belum Lengkap / Perlu Revisi</strong>, dan kunci pengisian formulir akan dibuka kembali agar mahasiswa dapat mengunggah berkas pengganti yang sah.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Instruksi / Catatan Revisi untuk Mahasiswa <span className="text-rose-600">*</span>
                  </label>

                  {/* Template Pilihan Cepat */}
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {[
                      "Foto/Scan dokumen buram dan terpotong",
                      "Dokumen tidak terbaca dengan jelas",
                      "Dokumen salah / tidak sesuai ketentuan",
                      "Mohon unggah dokumen asli",
                    ].map((tpl) => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => setRejectNote(tpl)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium transition cursor-pointer"
                      >
                        + {tpl}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={4}
                    required
                    placeholder="Contoh: Foto dokumen buram dan terpotong. Mohon unggah ulang scan asli yang jelas..."
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                  />
                  <p className="text-[11px] text-slate-500">
                    Catatan ini akan otomatis muncul pada dashboard calon mahasiswa agar mereka segera memperbaikinya.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingBerkas(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing || !rejectNote.trim()}
                    onClick={() => {
                      if (rejectingBerkas.id === 0) {
                        handleMintaRevisiGlobal(rejectNote);
                        setRejectingBerkas(null);
                      } else {
                        handleVerifikasiDokumen(rejectingBerkas.id, "invalid", rejectNote);
                      }
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? "Menyimpan..." : "Kirim Permintaan Revisi"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: MINTA REVISI BUKTI PEMBAYARAN */}
          {rejectingPembayaran && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>Minta Revisi Bukti Pembayaran</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setRejectingPembayaran(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <p className="font-bold">
                    Pendaftar: {getUserName(selectedPendaftar)} ({selectedPendaftar.nomor_pendaftaran || `PMB-2026-00${selectedPendaftar.id}`})
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Status bukti pembayaran akan diubah menjadi <strong>Perlu Revisi</strong>, dan calon mahasiswa diminta mengunggah ulang bukti transfer yang sah melalui portal akun mereka.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Instruksi / Catatan Revisi Pembayaran <span className="text-rose-600">*</span>
                  </label>

                  {/* Template Pilihan Cepat */}
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {[
                      "Nominal transfer tidak sesuai",
                      "Foto struk buram / terpotong",
                      "Rekening tujuan salah",
                      "Mohon upload bukti transfer sah",
                    ].map((tpl) => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => setRejectPembayaranNote(tpl)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium transition cursor-pointer"
                      >
                        + {tpl}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={4}
                    required
                    placeholder="Contoh: Nominal transfer kurang dari ketentuan / Foto bukti struk tidak terbaca, silakan unggah ulang bukti transfer yang jelas..."
                    value={rejectPembayaranNote}
                    onChange={(e) => setRejectPembayaranNote(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingPembayaran(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing || !rejectPembayaranNote.trim()}
                    onClick={() => handleVerifikasiPembayaran(rejectingPembayaran.id, "ditolak", rejectPembayaranNote)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? "Menyimpan..." : "Kirim Permintaan Revisi"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: TAMBAH GELOMBANG PENDAFTARAN */}
          {isAddGelombangOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-7 relative animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-black text-slate-900 font-serif flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-700" />
                    <span>Tambah Gelombang Pendaftaran Baru</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddGelombangOpen(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateGelombang} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Nama Gelombang *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Gelombang 1 Reguler"
                      value={newGelombang.nama}
                      onChange={(e) => setNewGelombang({ ...newGelombang, nama: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    />
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-medium">Preset:</span>
                      {["Gelombang 1 Reguler", "Gelombang 2 Reguler", "Gelombang 3 Reguler", "Gelombang Beasiswa KIP"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setNewGelombang({ ...newGelombang, nama: preset })}
                          className={`px-2 py-0.5 text-[10px] rounded-md border transition cursor-pointer ${
                            newGelombang.nama === preset
                              ? "bg-emerald-100 text-[#0d3830] border-emerald-300 font-bold"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">Tahun Akademik *</label>
                        <span className="text-[10px] text-slate-400 font-mono">YYYY/YYYY</span>
                      </div>
                      <input
                        type="text"
                        required
                        pattern="[0-9]{4}/[0-9]{4}"
                        title="Format wajib YYYY/YYYY (contoh: 2026/2027)"
                        placeholder="Contoh: 2026/2027"
                        value={newGelombang.tahun_akademik}
                        onChange={(e) => setNewGelombang({ ...newGelombang, tahun_akademik: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                      />
                      <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                        {["2025/2026", "2026/2027", "2027/2028"].map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setNewGelombang({ ...newGelombang, tahun_akademik: yr })}
                            className={`px-1.5 py-0.5 text-[10px] rounded border transition cursor-pointer ${
                              newGelombang.tahun_akademik === yr
                                ? "bg-emerald-100 text-[#0d3830] border-emerald-300 font-bold"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {yr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Kuota Pendaftar *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={newGelombang.kuota}
                        onChange={(e) => setNewGelombang({ ...newGelombang, kuota: Number(e.target.value) || 0 })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tanggal Buka *</label>
                      <input
                        type="date"
                        required
                        value={newGelombang.tanggal_buka}
                        onChange={(e) => setNewGelombang({ ...newGelombang, tanggal_buka: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tanggal Tutup *</label>
                      <input
                        type="date"
                        required
                        value={newGelombang.tanggal_tutup}
                        onChange={(e) => setNewGelombang({ ...newGelombang, tanggal_tutup: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Biaya Pendaftaran (Rp) *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={newGelombang.biaya_pendaftaran}
                      onChange={(e) => setNewGelombang({ ...newGelombang, biaya_pendaftaran: Number(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="gelombang_is_aktif"
                      checked={newGelombang.is_aktif}
                      onChange={(e) => setNewGelombang({ ...newGelombang, is_aktif: e.target.checked })}
                      className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                    />
                    <label htmlFor="gelombang_is_aktif" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Aktifkan Gelombang ini Sekarang (Bisa Dipilih Calon Mahasiswa)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddGelombangOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75"
                    >
                      {isProcessing ? "Menyimpan..." : "Simpan Gelombang Baru"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: EDIT GELOMBANG PENDAFTARAN */}
          {isEditGelombangOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-7 relative animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-black text-slate-900 font-serif flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-emerald-700" />
                    <span>Edit Gelombang Pendaftaran</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditGelombangOpen(false);
                      setSelectedGelombangId(null);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateGelombang} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Nama Gelombang *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Gelombang 1 Reguler"
                      value={editGelombang.nama}
                      onChange={(e) => setEditGelombang({ ...editGelombang, nama: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    />
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-medium">Preset:</span>
                      {["Gelombang 1 Reguler", "Gelombang 2 Reguler", "Gelombang 3 Reguler", "Gelombang Beasiswa KIP"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEditGelombang({ ...editGelombang, nama: preset })}
                          className={`px-2 py-0.5 text-[10px] rounded-md border transition cursor-pointer ${
                            editGelombang.nama === preset
                              ? "bg-emerald-100 text-[#0d3830] border-emerald-300 font-bold"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">Tahun Akademik *</label>
                        <span className="text-[10px] text-slate-400 font-mono">YYYY/YYYY</span>
                      </div>
                      <input
                        type="text"
                        required
                        pattern="[0-9]{4}/[0-9]{4}"
                        title="Format wajib YYYY/YYYY (contoh: 2026/2027)"
                        placeholder="Contoh: 2026/2027"
                        value={editGelombang.tahun_akademik}
                        onChange={(e) => setEditGelombang({ ...editGelombang, tahun_akademik: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                      />
                      <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                        {["2025/2026", "2026/2027", "2027/2028"].map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setEditGelombang({ ...editGelombang, tahun_akademik: yr })}
                            className={`px-1.5 py-0.5 text-[10px] rounded border transition cursor-pointer ${
                              editGelombang.tahun_akademik === yr
                                ? "bg-emerald-100 text-[#0d3830] border-emerald-300 font-bold"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {yr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Kuota Pendaftar *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={editGelombang.kuota}
                        onChange={(e) => setEditGelombang({ ...editGelombang, kuota: Number(e.target.value) || 0 })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tanggal Buka *</label>
                      <input
                        type="date"
                        required
                        value={editGelombang.tanggal_buka}
                        onChange={(e) => setEditGelombang({ ...editGelombang, tanggal_buka: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tanggal Tutup *</label>
                      <input
                        type="date"
                        required
                        value={editGelombang.tanggal_tutup}
                        onChange={(e) => setEditGelombang({ ...editGelombang, tanggal_tutup: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Biaya Pendaftaran (Rp) *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={editGelombang.biaya_pendaftaran}
                      onChange={(e) => setEditGelombang({ ...editGelombang, biaya_pendaftaran: Number(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="edit_gelombang_is_aktif"
                      checked={editGelombang.is_aktif}
                      onChange={(e) => setEditGelombang({ ...editGelombang, is_aktif: e.target.checked })}
                      className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                    />
                    <label htmlFor="edit_gelombang_is_aktif" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Aktifkan Gelombang ini (Bisa Dipilih Calon Mahasiswa)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditGelombangOpen(false);
                        setSelectedGelombangId(null);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75"
                    >
                      {isProcessing ? "Menyimpan..." : "Perbarui Gelombang"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: TAMBAH / EDIT PROGRAM STUDI DENGAN CMS LENGKAP */}
          {(isAddProdiOpen || isEditProdiOpen) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-7 relative animate-scaleUp">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    {isEditProdiOpen ? (
                      <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                        <Edit2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0d3830]">
                        <Layers className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-black text-slate-900 font-serif">
                        {isEditProdiOpen ? "Edit Informasi Lengkap Program Studi" : "Tambah Program Studi Baru"}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Kelola data akademik, profil karir, capaian pembelajaran, dan panduan pendaftaran prodi.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddProdiOpen(false);
                      setIsEditProdiOpen(false);
                      setSelectedProdiId(null);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Sub-Tabs */}
                <div className="flex border-b border-slate-200 mb-5 gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setProdiModalTab("dasar")}
                    className={`px-3 py-2 font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
                      prodiModalTab === "dasar"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    1. Identitas &amp; Info Dasar
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdiModalTab("profil")}
                    className={`px-3 py-2 font-bold rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      prodiModalTab === "profil"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>2. Deskripsi &amp; Profil</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 font-mono">
                      {prodiForm.profil_lulusan.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdiModalTab("capaian")}
                    className={`px-3 py-2 font-bold rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      prodiModalTab === "capaian"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>3. Capaian &amp; Keunggulan</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 font-mono">
                      {prodiForm.capaian_pembelajaran.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdiModalTab("gelar")}
                    className={`px-3 py-2 font-bold rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      prodiModalTab === "gelar"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>4. Gelar Akademik</span>
                    {prodiForm.gelar_akademik && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold">
                        {prodiForm.gelar_akademik}
                      </span>
                    )}
                  </button>
                </div>

                <form onSubmit={isEditProdiOpen ? handleUpdateProdi : handleCreateProdi} className="space-y-4">
                  {/* TAB 1: INFO DASAR */}
                  {prodiModalTab === "dasar" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Kode Program Studi *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: MPI / AS / KPI"
                            value={prodiForm.kode}
                            onChange={(e) => setProdiForm({ ...prodiForm, kode: e.target.value.toUpperCase() })}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Jenjang Pendidikan *</label>
                          <select
                            value={prodiForm.jenjang}
                            onChange={(e) => setProdiForm({ ...prodiForm, jenjang: e.target.value })}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                          >
                            <option value="S1">S1 (Strata Satu)</option>
                            <option value="D3">D3 (Diploma Tiga)</option>
                            <option value="S2">S2 (Magister)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Nama Lengkap Program Studi *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Manajemen Pendidikan Islam"
                          value={prodiForm.nama}
                          onChange={(e) => setProdiForm({ ...prodiForm, nama: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#0d3830]">Status Pembukaan Pendaftaran Mahasiswa</p>
                          <p className="text-[11px] text-slate-500">
                            Jika diaktifkan, program studi ini akan muncul di formulir pendaftaran PMB calon mahasiswa.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id="prodi_modal_is_aktif"
                          checked={prodiForm.is_aktif}
                          onChange={(e) => setProdiForm({ ...prodiForm, is_aktif: e.target.checked })}
                          className="w-5 h-5 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DESKRIPSI & PROFIL LULUSAN */}
                  {prodiModalTab === "profil" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Deskripsi / Pengantar Program Studi</label>
                        <textarea
                          rows={3}
                          placeholder="Contoh: Program studi unggulan yang membekali lulusan dengan kompetensi manajerial lembaga pendidikan berbasis nilai-nilai Islam..."
                          value={prodiForm.deskripsi}
                          onChange={(e) => setProdiForm({ ...prodiForm, deskripsi: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Teks Pengantar Profil Lulusan &amp; Prospek Karir</label>
                        <input
                          type="text"
                          placeholder="Contoh: Lulusan program studi disiapkan menjadi tenaga profesional yang adaptif dan siap berkarir di berbagai sektor:"
                          value={prodiForm.profil_lulusan_intro}
                          onChange={(e) => setProdiForm({ ...prodiForm, profil_lulusan_intro: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                            Daftar Profil Lulusan &amp; Aspek Karir ({prodiForm.profil_lulusan.length})
                          </label>
                          <button
                            type="button"
                            onClick={handleAddProfilItem}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0d3830] border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Aspek Karir</span>
                          </button>
                        </div>

                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                          {prodiForm.profil_lulusan.map((item, idx) => (
                            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative group">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono font-bold text-slate-400">Karir #{idx + 1}</span>
                                {prodiForm.profil_lulusan.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProfilItem(idx)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-md transition cursor-pointer"
                                    title="Hapus poin karir"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="Judul Karir (Contoh: Pengelola & Manajer Pendidikan Islam)"
                                value={item.title}
                                onChange={(e) => handleProfilItemChange(idx, "title", e.target.value)}
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                              />
                              <textarea
                                rows={2}
                                placeholder="Uraian prospek karir dan keunggulan peran..."
                                value={item.desc}
                                onChange={(e) => handleProfilItemChange(idx, "desc", e.target.value)}
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-normal focus:outline-none focus:border-[#0d3830]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CAPAIAN PEMBELAJARAN & KEUNGGULAN */}
                  {prodiModalTab === "capaian" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                            Daftar Capaian Pembelajaran &amp; Keunggulan ({prodiForm.capaian_pembelajaran.length})
                          </label>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Poin kompetensi utama (CPL) dan distingsi keunggulan program studi.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCapaianItem}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0d3830] border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Capaian</span>
                        </button>
                      </div>

                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {prodiForm.capaian_pembelajaran.map((item, idx) => (
                          <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative group">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold text-slate-400">Capaian #{idx + 1}</span>
                              {prodiForm.capaian_pembelajaran.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCapaianItem(idx)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded-md transition cursor-pointer"
                                  title="Hapus capaian"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Judul Capaian (Contoh: Kompetensi Manajerial Modern Berbasis Riset)"
                              value={item.title}
                              onChange={(e) => handleCapaianItemChange(idx, "title", e.target.value)}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                            />
                            <textarea
                              rows={2}
                              placeholder="Deskripsi kompetensi yang dikuasai mahasiswa setelah menyelesaikan studi..."
                              value={item.desc}
                              onChange={(e) => handleCapaianItemChange(idx, "desc", e.target.value)}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-normal focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: GELAR AKADEMIK */}
                  {prodiModalTab === "gelar" && (
                    <div className="space-y-5 animate-fadeIn">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Pengaturan Gelar Akademik Kelulusan
                        </label>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Atur gelar akademik resmi yang disandang lulusan. Nilai ini akan tampil pada Section 3 di halaman profil program studi calon mahasiswa dan badge kartu beranda.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <label className="block text-xs font-bold text-slate-700">
                          Penulisan Gelar Akademik Resmi *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Sarjana Pendidikan (S.Pd.) / Sarjana Hukum (S.H.)"
                          value={prodiForm.gelar_akademik}
                          onChange={(e) => setProdiForm({ ...prodiForm, gelar_akademik: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0d3830]"
                        />

                        {/* Quick Presets */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-slate-500 block">
                            Pilihan Cepat Gelar Populer:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              "Sarjana Pendidikan (S.Pd.)",
                              "Sarjana Hukum (S.H.)",
                              "Sarjana Sosial (S.Sos.)",
                              "Sarjana Ekonomi (S.E.)",
                              "Sarjana Agama (S.Ag.)",
                              "Sarjana Komputer (S.Kom.)",
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setProdiForm({ ...prodiForm, gelar_akademik: preset })}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition cursor-pointer ${
                                  prodiForm.gelar_akademik === preset
                                    ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Live Preview Section */}
                      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                          Pratinjau Tampilan di Halaman Program Studi (Section 3: Gelar Akademik)
                        </span>
                        <div className="p-3.5 bg-white rounded-xl border border-emerald-100 shadow-2xs space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-900">Gelar Akademik</h4>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {prodiForm.gelar_akademik
                              ? `Lulusan Program Studi ${prodiForm.jenjang || "S1"} ${prodiForm.nama || "Program Studi"} akan memperoleh gelar akademik ${prodiForm.gelar_akademik}.`
                              : "Lulusan Program Studi ini akan memperoleh gelar akademik (Belum diatur)."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal Footer Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddProdiOpen(false);
                        setIsEditProdiOpen(false);
                        setSelectedProdiId(null);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>

                    <div className="flex items-center gap-2">
                      {prodiModalTab !== "gelar" && (
                        <button
                          type="button"
                          onClick={() => {
                            if (prodiModalTab === "dasar") setProdiModalTab("profil");
                            else if (prodiModalTab === "profil") setProdiModalTab("capaian");
                            else if (prodiModalTab === "capaian") setProdiModalTab("gelar");
                          }}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Lanjut Tab Berikutnya &rarr;
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-2"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {isProcessing
                            ? "Menyimpan..."
                            : isEditProdiOpen
                            ? "Perbarui Program Studi"
                            : "Simpan Program Studi Baru"}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: TAMBAH / EDIT REKENING BANK */}
          {(isAddRekeningOpen || isEditRekeningOpen) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 relative animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-700" />
                    <span>{isEditRekeningOpen ? "Edit Rekening Bank Pembayaran" : "Tambah Rekening Bank Baru"}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddRekeningOpen(false);
                      setIsEditRekeningOpen(false);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveRekening} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Nama Bank *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bank Syariah Indonesia (BSI) / Bank Mandiri"
                      value={rekeningForm.nama_bank}
                      onChange={(e) => setRekeningForm({ ...rekeningForm, nama_bank: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Nomor Rekening *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 7148899012"
                        value={rekeningForm.nomor_rekening}
                        onChange={(e) => setRekeningForm({ ...rekeningForm, nomor_rekening: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Atas Nama Pemilik *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: STAI Cendekia Insani PMB"
                        value={rekeningForm.atas_nama}
                        onChange={(e) => setRekeningForm({ ...rekeningForm, atas_nama: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Kantor Cabang (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Contoh: KC Situbondo Panji"
                        value={rekeningForm.cabang}
                        onChange={(e) => setRekeningForm({ ...rekeningForm, cabang: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Urutan Tampil</label>
                      <input
                        type="number"
                        min={1}
                        value={rekeningForm.urutan}
                        onChange={(e) => setRekeningForm({ ...rekeningForm, urutan: parseInt(e.target.value) || 1 })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Instruksi Khusus / Catatan Bank</label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Masukkan berita transfer 'PMB - NIK/Nama Calon Mahasiswa' saat transaksi."
                      value={rekeningForm.instruksi_transfer}
                      onChange={(e) => setRekeningForm({ ...rekeningForm, instruksi_transfer: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="rek_is_utama"
                        checked={rekeningForm.is_utama}
                        onChange={(e) => setRekeningForm({ ...rekeningForm, is_utama: e.target.checked })}
                        className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                      />
                      <label htmlFor="rek_is_utama" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Jadikan Rekening Utama Prioritas PMB
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="rek_is_aktif"
                        checked={rekeningForm.is_aktif}
                        onChange={(e) => setRekeningForm({ ...rekeningForm, is_aktif: e.target.checked })}
                        className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                      />
                      <label htmlFor="rek_is_aktif" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Status Rekening Aktif (Dapat dipilih calon mahasiswa)
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddRekeningOpen(false);
                        setIsEditRekeningOpen(false);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isProcessing ? "Menyimpan..." : isEditRekeningOpen ? "Perbarui Rekening" : "Simpan Rekening"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: TAMBAH / EDIT JALUR PENDAFTARAN */}
          {(isAddJalurOpen || isEditJalurOpen) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 relative animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-700" />
                    <span>{isEditJalurOpen ? "Edit Jalur Seleksi PMB" : "Tambah Jalur Seleksi PMB Baru"}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddJalurOpen(false);
                      setIsEditJalurOpen(false);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveJalur} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Kode Jalur (Singkat) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: REGULER / KIP / PRESTASI"
                        value={jalurForm.kode}
                        onChange={(e) => setJalurForm({ ...jalurForm, kode: e.target.value.toUpperCase() })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Label Badge / Tag</label>
                      <input
                        type="text"
                        placeholder="Contoh: Jalur Mandiri / Beasiswa KIP"
                        value={jalurForm.badge_text}
                        onChange={(e) => setJalurForm({ ...jalurForm, badge_text: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Nama Jalur Pendaftaran *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Jalur Masuk Reguler (Mandiri)"
                      value={jalurForm.nama}
                      onChange={(e) => setJalurForm({ ...jalurForm, nama: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Deskripsi Jalur *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Jelaskan sasaran pendaftar, kriteria umum, dan keunggulan jalur seleksi ini..."
                      value={jalurForm.deskripsi}
                      onChange={(e) => setJalurForm({ ...jalurForm, deskripsi: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Syarat Khusus Jalur (Opsional)</label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Memiliki KIP/KKS/PKH atau sertifikat prestasi tahfidz minimal 5 juz."
                      value={jalurForm.syarat_khusus}
                      onChange={(e) => setJalurForm({ ...jalurForm, syarat_khusus: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="jalur_bebas_biaya"
                        checked={jalurForm.bebas_biaya}
                        onChange={(e) => setJalurForm({ ...jalurForm, bebas_biaya: e.target.checked })}
                        className="w-4 h-4 text-[#0d3830] border-slate-300 rounded-focus:ring-[#0d3830] cursor-pointer"
                      />
                      <label htmlFor="jalur_bebas_biaya" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Bebas Biaya Pendaftaran (Rp 0 / Gratis Formulir)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="jalur_tampil_homepage"
                        checked={jalurForm.tampil_di_homepage}
                        onChange={(e) => setJalurForm({ ...jalurForm, tampil_di_homepage: e.target.checked })}
                        className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                      />
                      <label htmlFor="jalur_tampil_homepage" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Tampilkan Card Jalur Ini di Halaman Beranda (Homepage)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="jalur_is_aktif"
                        checked={jalurForm.is_aktif}
                        onChange={(e) => setJalurForm({ ...jalurForm, is_aktif: e.target.checked })}
                        className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                      />
                      <label htmlFor="jalur_is_aktif" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Jalur Aktif (Dapat dipilih calon pendaftar saat registrasi)
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddJalurOpen(false);
                        setIsEditJalurOpen(false);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isProcessing ? "Menyimpan..." : isEditJalurOpen ? "Perbarui Jalur" : "Simpan Jalur"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: TAMBAH / EDIT PERSYARATAN DOKUMEN */}
          {(isAddPersyaratanOpen || isEditPersyaratanOpen) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 relative animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-700" />
                    <span>{isEditPersyaratanOpen ? "Edit Dokumen Persyaratan" : "Tambah Dokumen Persyaratan Baru"}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddPersyaratanOpen(false);
                      setIsEditPersyaratanOpen(false);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePersyaratan} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Nama Dokumen Berkas *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kartu Keluarga (KK) Asli / Ijazah Legalitas"
                      value={persyaratanForm.nama_dokumen}
                      onChange={(e) => setPersyaratanForm({ ...persyaratanForm, nama_dokumen: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Kode Unik Berkas *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: KK / KTP / IJAZAH / KIP"
                        value={persyaratanForm.kode}
                        onChange={(e) => setPersyaratanForm({ ...persyaratanForm, kode: e.target.value.toLowerCase() })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Jalur Khusus (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Kosongkan jika semua jalur"
                        value={persyaratanForm.jalur_khusus}
                        onChange={(e) => setPersyaratanForm({ ...persyaratanForm, jalur_khusus: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Keterangan / Petunjuk Unggah</label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Scan dokumen asli atau fotokopi legalisir basah yang terbaca jelas."
                      value={persyaratanForm.deskripsi}
                      onChange={(e) => setPersyaratanForm({ ...persyaratanForm, deskripsi: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Format File yang Diizinkan</label>
                      <input
                        type="text"
                        placeholder="Contoh: PDF, JPG, PNG"
                        value={persyaratanForm.tipe_file}
                        onChange={(e) => setPersyaratanForm({ ...persyaratanForm, tipe_file: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Ukuran Maksimal (MB)</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={persyaratanForm.max_size_mb}
                        onChange={(e) => setPersyaratanForm({ ...persyaratanForm, max_size_mb: parseInt(e.target.value) || 2 })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="persyaratan_is_wajib"
                        checked={persyaratanForm.is_wajib}
                        onChange={(e) => setPersyaratanForm({ ...persyaratanForm, is_wajib: e.target.checked })}
                        className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                      />
                      <label htmlFor="persyaratan_is_wajib" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Dokumen Wajib Diunggah (Mandatory)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="persyaratan_is_aktif"
                        checked={persyaratanForm.is_aktif}
                        onChange={(e) => setPersyaratanForm({ ...persyaratanForm, is_aktif: e.target.checked })}
                        className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                      />
                      <label htmlFor="persyaratan_is_aktif" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Status Aktif
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddPersyaratanOpen(false);
                        setIsEditPersyaratanOpen(false);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isProcessing ? "Menyimpan..." : isEditPersyaratanOpen ? "Perbarui Dokumen" : "Simpan Dokumen"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: TAMBAH / EDIT KONTAK HOTLINE & NARAHUBUNG */}
          {(isAddHotlineOpen || isEditHotlineOpen) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 relative animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-emerald-700" />
                    <span>{isEditHotlineOpen ? "Edit Kontak Narahubung" : "Tambah Kontak Narahubung Baru"}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddHotlineOpen(false);
                      setIsEditHotlineOpen(false);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveHotline} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Nama Layanan / Unit *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Panitia PMB Utama / Helpdesk Beasiswa KIP"
                      value={hotlineForm.nama_layanan}
                      onChange={(e) => setHotlineForm({ ...hotlineForm, nama_layanan: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Saluran Kontak *</label>
                      <select
                        value={hotlineForm.tipe_kontak}
                        onChange={(e) => setHotlineForm({ ...hotlineForm, tipe_kontak: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="whatsapp">WhatsApp (WA)</option>
                        <option value="telepon">Telepon Kantor</option>
                        <option value="email">Email Resmi</option>
                        <option value="telegram">Telegram</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Nomor / Alamat Email *</label>
                      <input
                        type="text"
                        required
                        placeholder="085233432221 atau email"
                        value={hotlineForm.nomor_atau_email}
                        onChange={(e) => setHotlineForm({ ...hotlineForm, nomor_atau_email: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Nama Petugas PIC</label>
                      <input
                        type="text"
                        placeholder="Contoh: Ustadz Ahmad / Ibu Siti"
                        value={hotlineForm.nama_petugas}
                        onChange={(e) => setHotlineForm({ ...hotlineForm, nama_petugas: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Urutan Tampil</label>
                      <input
                        type="number"
                        min={1}
                        value={hotlineForm.urutan}
                        onChange={(e) => setHotlineForm({ ...hotlineForm, urutan: parseInt(e.target.value) || 1 })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Jam Layanan Operasional</label>
                    <input
                      type="text"
                      placeholder="Contoh: Senin - Sabtu: 08.00 - 16.00 WIB"
                      value={hotlineForm.jam_layanan}
                      onChange={(e) => setHotlineForm({ ...hotlineForm, jam_layanan: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <input
                      type="checkbox"
                      id="hotline_is_aktif"
                      checked={hotlineForm.is_aktif}
                      onChange={(e) => setHotlineForm({ ...hotlineForm, is_aktif: e.target.checked })}
                      className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                    />
                    <label htmlFor="hotline_is_aktif" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Aktifkan Saluran Bantuan Ini
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddHotlineOpen(false);
                        setIsEditHotlineOpen(false);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isProcessing ? "Menyimpan..." : isEditHotlineOpen ? "Perbarui Narahubung" : "Simpan Narahubung"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: TAMBAH AKUN ADMINISTRATOR BARU */}
          {isAddAdminModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 relative animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-700" />
                    <span>Tambah Akun Administrator Baru</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddAdminModalOpen(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAdminUser} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Nama Lengkap Petugas / Pejabat *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ust. Ahmad Fauzan, M.Pd"
                      value={newAdminUser.nama_lengkap}
                      onChange={(e) => setNewAdminUser({ ...newAdminUser, nama_lengkap: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      NIK / Username Login PMB *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: adminpmb2 atau 3201..."
                      value={newAdminUser.nik}
                      onChange={(e) => setNewAdminUser({ ...newAdminUser, nik: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0d3830]"
                    />
                    <p className="text-[10px] text-slate-400">
                      Digunakan oleh admin untuk autentikasi masuk ke Dashboard CMS.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Alamat Email</label>
                      <input
                        type="email"
                        placeholder="admin@staici.ac.id"
                        value={newAdminUser.email}
                        onChange={(e) => setNewAdminUser({ ...newAdminUser, email: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">No. WhatsApp / HP</label>
                      <input
                        type="tel"
                        placeholder="081234567890"
                        value={newAdminUser.no_hp}
                        onChange={(e) => setNewAdminUser({ ...newAdminUser, no_hp: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Password Awal *</label>
                      <input
                        type="text"
                        required
                        value={newAdminUser.password}
                        onChange={(e) => setNewAdminUser({ ...newAdminUser, password: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tingkat Wewenang (Role) *</label>
                      <select
                        value={newAdminUser.role}
                        onChange={(e) => setNewAdminUser({ ...newAdminUser, role: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0d3830]"
                      >
                        {rolesList.length > 0 ? (
                          rolesList.map((r) => (
                            <option key={r.id} value={r.kode}>
                              {r.nama} ({r.kode})
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="admin_pmb">Admin Panitia PMB</option>
                            <option value="super_admin">Super Administrator</option>
                            <option value="verifikator_keuangan">Verifikator Keuangan</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {newAdminUser.role === "super_admin" && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>
                        <strong>Perhatian:</strong> Akun ini akan memiliki hak istimewa penuh (Super Admin) termasuk konfigurasi RBAC dan pengelolaan akun admin lain.
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddAdminModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isProcessing ? "Menyimpan..." : "Buat Akun Administrator"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: EDIT MENU GROUP */}
          {isEditGroupModalOpen && editingGroup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 relative animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-[#0d3830]" />
                    <span>Edit Menu Group</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditGroupModalOpen(false);
                      setEditingGroup(null);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateGroup} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Nama Menu Group *</label>
                    <input
                      type="text"
                      required
                      placeholder="contoh: Pengaturan Sistem"
                      value={editingGroup.nama}
                      onChange={(e) => setEditingGroup({ ...editingGroup, nama: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Urutan Tampilan Sidebar *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingGroup.urutan}
                      onChange={(e) => setEditingGroup({ ...editingGroup, urutan: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                    />
                    <p className="text-[10px] text-slate-400">
                      Grup dengan nomor urut lebih kecil akan tampil lebih atas pada menu samping (sidebar).
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditGroupModalOpen(false);
                        setEditingGroup(null);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isProcessing ? "Menyimpan..." : "Simpan Perubahan Group"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: EDIT ITEM MENU */}
          {isEditMenuModalOpen && editingMenu && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 relative animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-[#0d3830]">
                      {renderNavIcon(editingMenu.icon)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Edit Item Menu</h3>
                      <p className="text-[11px] text-slate-500 font-mono">Modul: {editingMenu.key}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMenuModalOpen(false);
                      setEditingMenu(null);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateMenu} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Parent Menu Group *</label>
                      <select
                        value={editingMenu.menu_group_id}
                        onChange={(e) => setEditingMenu({ ...editingMenu, menu_group_id: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0d3830]"
                      >
                        {allMenuGroupsList.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Nama Menu *</label>
                      <input
                        type="text"
                        required
                        value={editingMenu.nama}
                        onChange={(e) => setEditingMenu({ ...editingMenu, nama: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Key Unique (Routing Tab) *</label>
                      <input
                        type="text"
                        required
                        disabled={editingMenu.key === "rbac"}
                        value={editingMenu.key}
                        onChange={(e) => setEditingMenu({ ...editingMenu, key: e.target.value, url: e.target.value })}
                        className={`w-full p-2.5 bg-white border rounded-xl text-xs font-mono font-bold focus:outline-none ${
                          editingMenu.key === "rbac"
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            : "border-slate-300 focus:border-[#0d3830]"
                        }`}
                      />
                      {editingMenu.key === "rbac" && (
                        <p className="text-[10px] text-amber-700 font-medium">Key menu sistem dilindungi.</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Urutan</label>
                      <input
                        type="number"
                        min={1}
                        value={editingMenu.urutan}
                        onChange={(e) => setEditingMenu({ ...editingMenu, urutan: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Badge Text (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Baru, VA, Live"
                      value={editingMenu.badge_text || ""}
                      onChange={(e) => setEditingMenu({ ...editingMenu, badge_text: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  {/* Lucide Icon Picker for Edit Modal */}
                  <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        Pilih Icon Menu (Keyword Lucide)
                      </label>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs shadow-2xs">
                        <span className="text-[10px] uppercase font-extrabold text-[#0d3830]">Terpilih:</span>
                        {renderNavIcon(editingMenu.icon)}
                        <span className="font-mono text-xs">{editingMenu.icon || "Users"}</span>
                      </div>
                    </div>

                    {/* Search Keyword in Modal */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ketik keyword icon (cth: card, book, bell, users, lock, table)..."
                        value={editMenuIconSearchTerm}
                        onChange={(e) => {
                          setEditMenuIconSearchTerm(e.target.value);
                          const match = LUCIDE_ICON_LIST.find((i) => i.name.toLowerCase() === e.target.value.toLowerCase().trim());
                          if (match) {
                            setEditingMenu({ ...editingMenu, icon: match.name });
                          }
                        }}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                      />
                      {editMenuIconSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setEditMenuIconSearchTerm("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Pills in Modal */}
                    <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
                      {["Semua", "Pengguna", "Akademik", "Dokumen", "Keuangan", "Waktu", "Keamanan", "Sistem", "Pengaturan", "Komunikasi"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEditMenuIconCategoryFilter(cat)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                            editMenuIconCategoryFilter === cat
                              ? "bg-[#0d3830] text-white"
                              : "bg-white hover:bg-slate-200 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Clickable Icon Grid in Modal */}
                    <div className="max-h-36 overflow-y-auto p-2 bg-white border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {filteredEditLucideIcons.length > 0 ? (
                        filteredEditLucideIcons.map((item) => {
                          const isSelected = editingMenu.icon?.toLowerCase() === item.name.toLowerCase();
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => setEditingMenu({ ...editingMenu, icon: item.name })}
                              className={`p-1.5 rounded-lg text-left transition flex items-center gap-2 border cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-100/90 border-emerald-400 text-emerald-950 font-bold shadow-2xs"
                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                              }`}
                            >
                              <span className={isSelected ? "text-emerald-700" : "text-slate-500"}>
                                {renderNavIcon(item.name)}
                              </span>
                              <span className="text-[11px] truncate font-mono">{item.name}</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-full p-2.5 text-center text-xs text-slate-500 space-y-1">
                          <p>Tidak ada icon yang cocok dengan keyword &quot;{editMenuIconSearchTerm}&quot;.</p>
                          <button
                            type="button"
                            onClick={() => setEditingMenu({ ...editingMenu, icon: editMenuIconSearchTerm.trim() })}
                            className="text-[11px] font-bold text-[#0d3830] hover:underline cursor-pointer"
                          >
                            Gunakan teks &quot;{editMenuIconSearchTerm}&quot; sebagai nama icon kustom &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditMenuModalOpen(false);
                        setEditingMenu(null);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isProcessing ? "Menyimpan..." : "Simpan Perubahan Menu"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
