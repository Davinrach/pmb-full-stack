"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  Lock,
  Key,
  FolderPlus,
  Grid,
} from "lucide-react";
import { api, authStorage } from "@/lib/api";

// Icon mapper helper
function renderNavIcon(iconName: string) {
  switch (iconName) {
    case "Users":
      return <Users className="w-4 h-4" />;
    case "FileText":
      return <FileText className="w-4 h-4" />;
    case "Award":
      return <Award className="w-4 h-4" />;
    case "RefreshCw":
      return <RefreshCw className="w-4 h-4" />;
    case "Download":
      return <Download className="w-4 h-4" />;
    case "History":
      return <History className="w-4 h-4" />;
    case "CreditCard":
      return <CreditCard className="w-4 h-4" />;
    case "Calendar":
      return <Calendar className="w-4 h-4" />;
    case "Settings":
      return <Settings className="w-4 h-4 text-amber-500" />;
    case "Layers":
      return <Layers className="w-4 h-4" />;
    case "ShieldCheck":
      return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    default:
      return <Users className="w-4 h-4" />;
  }
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
  if (typeof p?.asal_sekolah === "string" && p.asal_sekolah) return p.asal_sekolah;
  return "-";
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
  const [showStats, setShowStats] = useState(true);

  // Modals & Selections
  const [selectedPendaftar, setSelectedPendaftar] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Lists
  const [gelombangList, setGelombangList] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);

  // RBAC Management State
  const [rbacSubTab, setRbacSubTab] = useState<"roles" | "menus" | "matrix">("matrix");
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [allMenusList, setAllMenusList] = useState<any[]>([]);
  const [allMenuGroupsList, setAllMenuGroupsList] = useState<any[]>([]);
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<string>("admin_pmb");
  const [matrixAllowedMenuIDs, setMatrixAllowedMenuIDs] = useState<number[]>([]);

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

  // Dynamic CMS Settings State
  const [settings, setSettings] = useState({
    banner_title: "Pusat Pendaftaran Mahasiswa Baru & Informasi Program Studi",
    banner_subtitle:
      "Meneguhkan keilmuan Islam modern dan etika profesional santri. Mari bergabung bersama STAI Cendekia Insani Tahun Akademik 2026/2027.",
    announcement_text: "Penerimaan Mahasiswa Baru Gelombang 1 Resmi Dibuka",
    bank_name: "Bank Syariah Indonesia (BSI)",
    nomor_rekening: "7148899012",
    atas_nama: "STAI Cendekia Insani PMB",
    no_whatsapp_cs: "085233432221",
    email_cs: "pmb@staicisitubondo.ac.id",
    alamat_kampus: "Jl. Raya Panji No. 12, Situbondo, Jawa Timur",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

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
    return true;
  };

  const loadNavMenus = async () => {
    try {
      const res = await api.get("/admin/rbac/nav-menus");
      if (res.data && Array.isArray(res.data)) {
        setNavMenuGroups(res.data);
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  // RBAC Data Loaders
  const loadRBACData = async () => {
    try {
      const [resRoles, resGroups, resMenus] = await Promise.all([
        api.get("/admin/rbac/roles"),
        api.get("/admin/rbac/menu-groups"),
        api.get("/admin/rbac/menus"),
      ]);
      setRolesList(resRoles.data || []);
      setAllMenuGroupsList(resGroups.data || []);
      setAllMenusList(resMenus.data || []);
      if (resGroups.data && resGroups.data.length > 0) {
        setNewMenu((prev) => ({ ...prev, menu_group_id: resGroups.data[0].id }));
      }
    } catch (err) {
      console.error("Error loading RBAC data:", err);
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

  useEffect(() => {
    if (!checkAuth()) return;
    loadNavMenus();
    loadStats();
    loadPendaftars();
    loadGelombangs();
    loadProdis();
    loadSettings();
    loadRBACData();
  }, []);

  useEffect(() => {
    if (activeTab === "logs") loadLogs();
    if (activeTab === "settings") loadSettings();
    if (activeTab === "rbac") {
      loadRBACData();
      loadRolePermissions(selectedRoleForMatrix);
    }
  }, [activeTab]);

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
      alert("Pengaturan konten banner & informasi PMB berhasil diperbarui secara real-time!");
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan");
    } finally {
      setIsSavingSettings(false);
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

  const handleTogglePermission = (menuId: number) => {
    if (matrixAllowedMenuIDs.includes(menuId)) {
      setMatrixAllowedMenuIDs(matrixAllowedMenuIDs.filter((id) => id !== menuId));
    } else {
      setMatrixAllowedMenuIDs([...matrixAllowedMenuIDs, menuId]);
    }
  };

  const handleSaveRolePermissions = async () => {
    setIsProcessing(true);
    try {
      await api.post("/admin/rbac/role-permissions", {
        role_kode: selectedRoleForMatrix,
        menu_ids: matrixAllowedMenuIDs,
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
                    const isActive = activeTab === m.url || activeTab === m.key;
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
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0d3830] text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                AF
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Ust. Ahmad Fauzan</p>
                <p className="text-[10px] text-slate-500 truncate">Admin PMB Utama</p>
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

          {/* Right Controls Header */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-[#0d3830]" />
              <span>T.A. 2026/2027 Gelombang 1</span>
            </div>

            <button
              type="button"
              onClick={() => setIsAddGelombangOpen(true)}
              className="px-3.5 py-1.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pendaftaran Baru</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Main Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {activeTab === "rbac" ? "Manajemen Role & Menu RBAC" : "Data Pendaftar PMB"}
                </h2>
                <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full text-xs font-bold">
                  Gel. 1 TA 2026/2027
                </span>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab("rbac")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === "rbac"
                    ? "bg-[#0d3830] text-white border-[#0d3830]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Pengaturan RBAC</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddGelombangOpen(true)}
                className="px-4 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pendaftar</span>
              </button>
            </div>
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
                <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRbacSubTab("matrix")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      rbacSubTab === "matrix"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Hak Akses Role
                  </button>

                  <button
                    type="button"
                    onClick={() => setRbacSubTab("roles")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      rbacSubTab === "roles"
                        ? "bg-[#0d3830] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Daftar Role ({rolesList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setRbacSubTab("menus")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-indigo-900 flex-shrink-0" />
                      <div>
                        <label className="block text-xs font-bold text-slate-700">Pilih Role Pengguna untuk Diatur Hak Aksesnya:</label>
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

                  {/* Permissions Checkbox Grid */}
                  <div className="space-y-6">
                    {allMenuGroupsList.map((group) => {
                      const groupMenus = allMenusList.filter((m) => m.menu_group_id === group.id);
                      return (
                        <div key={group.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Group: {group.nama}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              {groupMenus.length} Menu
                            </span>
                          </div>

                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {groupMenus.map((m) => {
                              const isChecked = matrixAllowedMenuIDs.includes(m.id);
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
                  {/* Grid 2 Forms: Group Form & Menu Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Form Group Baru */}
                    <form onSubmit={handleCreateGroup} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <FolderPlus className="w-4 h-4 text-[#0d3830]" />
                        <span>Tambah Menu Group Baru</span>
                      </h4>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nama Group</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: Laporan & Analistik"
                          value={newGroup.nama}
                          onChange={(e) => setNewGroup({ ...newGroup, nama: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Urutan (Sort Order)</label>
                        <input
                          type="number"
                          required
                          value={newGroup.urutan}
                          onChange={(e) => setNewGroup({ ...newGroup, urutan: Number(e.target.value) })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-2 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        + Simpan Menu Group
                      </button>
                    </form>

                    {/* Form Menu Baru */}
                    <form onSubmit={handleCreateMenu} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Plus className="w-4 h-4 text-[#0d3830]" />
                        <span>Tambah Item Menu Baru</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Parent Group</label>
                          <select
                            value={newMenu.menu_group_id}
                            onChange={(e) => setNewMenu({ ...newMenu, menu_group_id: Number(e.target.value) })}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                          >
                            {allMenuGroupsList.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.nama}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Nama Menu</label>
                          <input
                            type="text"
                            required
                            placeholder="contoh: Verifikasi VA"
                            value={newMenu.nama}
                            onChange={(e) => setNewMenu({ ...newMenu, nama: e.target.value, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Key Unique</label>
                          <input
                            type="text"
                            required
                            placeholder="contoh: va_verif"
                            value={newMenu.key}
                            onChange={(e) => setNewMenu({ ...newMenu, key: e.target.value })}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Icon Name</label>
                          <select
                            value={newMenu.icon}
                            onChange={(e) => setNewMenu({ ...newMenu, icon: e.target.value })}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                          >
                            <option value="Users">Users</option>
                            <option value="FileText">FileText</option>
                            <option value="Award">Award</option>
                            <option value="RefreshCw">RefreshCw</option>
                            <option value="Download">Download</option>
                            <option value="History">History</option>
                            <option value="CreditCard">CreditCard</option>
                            <option value="Calendar">Calendar</option>
                            <option value="Settings">Settings</option>
                            <option value="Layers">Layers</option>
                            <option value="ShieldCheck">ShieldCheck</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-2 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        + Simpan Item Menu
                      </button>
                    </form>
                  </div>

                  {/* Table Menus */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">Group Parent</th>
                          <th className="p-3">Nama Menu</th>
                          <th className="p-3">Key</th>
                          <th className="p-3">Icon</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allMenusList.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-500">{m.id}</td>
                            <td className="p-3 font-bold text-slate-800">{m.menu_group?.nama || m.menu_group_id}</td>
                            <td className="p-3 font-bold text-slate-900">{m.nama}</td>
                            <td className="p-3 font-mono font-bold text-indigo-900">{m.key}</td>
                            <td className="p-3 flex items-center gap-1.5">
                              {renderNavIcon(m.icon)}
                              <span className="font-mono text-slate-600">{m.icon}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB CONTENT: PENDAFTAR TABLE VIEW */}
          {activeTab === "pendaftar" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="p-4 w-10 text-center">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={selectedIds.length === pendaftars.length && pendaftars.length > 0}
                          className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Pendaftar &amp; No. PMB</th>
                      <th className="p-4">Asal Sekolah &amp; NIK</th>
                      <th className="p-4">Program Studi</th>
                      <th className="p-4">Jalur</th>
                      <th className="p-4">Status VA (Biaya)</th>
                      <th className="p-4">Status Berkas</th>
                      <th className="p-4">Status Akhir</th>
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
                      pendaftars.map((p) => {
                        const isChecked = selectedIds.includes(p.id);
                        const namaLengkap = getUserName(p);
                        const nik = getUserNik(p);
                        const asalSekolah = getAsalSekolah(p);
                        const prodiTitle = getProdiTitle(p.program_studi);
                        const gelombangTitle = getGelombangTitle(p.gelombang, p.jalur);

                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-slate-50/80 transition ${
                              isChecked ? "bg-emerald-50/40" : ""
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleSelectOne(p.id)}
                                className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                              />
                            </td>

                            {/* Pendaftar & No PMB */}
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
                              </button>
                            </td>

                            {/* Asal Sekolah & NIK */}
                            <td className="p-4">
                              <p className="font-semibold text-slate-800">
                                {asalSekolah}
                              </p>
                              <p className="text-[11px] font-mono text-slate-500">
                                NIK: {nik}
                              </p>
                            </td>

                            {/* Program Studi */}
                            <td className="p-4 font-bold text-slate-800">
                              {prodiTitle}
                            </td>

                            {/* Jalur */}
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                gelombangTitle === "KIP-Kuliah" || p.jalur === "KIP-Kuliah"
                                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                                  : "bg-indigo-50 text-indigo-800 border border-indigo-100"
                              }`}>
                                {gelombangTitle}
                              </span>
                            </td>

                            {/* Status VA */}
                            <td className="p-4">
                              {p.status_pembayaran === "diterima" || p.status_va === "Lunas" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                  Lunas (Rp 150k)
                                </span>
                              ) : p.status_pembayaran === "ditolak" || p.status_va === "Verifikasi Gagal" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-900 font-bold rounded-full text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                  Verifikasi Gagal
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-full text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                  Menunggu VA
                                </span>
                              )}
                            </td>

                            {/* Status Berkas */}
                            <td className="p-4">
                              {p.status_pendaftaran === "berkas_diverifikasi" || p.status_berkas === "Valid & Sah" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Valid &amp; Sah
                                </span>
                              ) : p.status_berkas === "Perlu Revisi" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 font-bold rounded-lg text-[11px]">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                  Perlu Revisi
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-lg text-[11px]">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  {p.status_pendaftaran || "Sedang Ditinjau"}
                                </span>
                              )}
                            </td>

                            {/* Status Akhir */}
                            <td className="p-4">
                              {p.status_pendaftaran === "lolos_seleksi" || p.status_seleksi === "Lolos" ? (
                                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold" title="Lolos Seleksi">
                                  <Check className="w-4 h-4" />
                                </span>
                              ) : p.status_pendaftaran === "ditolak" || p.status_seleksi === "Ditolak" ? (
                                <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold" title="Ditolak">
                                  <X className="w-4 h-4" />
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openDetail(p.id)}
                                  className="px-3 py-1 bg-slate-100 hover:bg-[#0d3830] hover:text-white rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer"
                                >
                                  Verifikasi →
                                </button>
                              )}
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

          {/* TAB CONTENT: CMS SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" />
                    <span>Pengaturan Konten Landing Page &amp; Banner (No-Coding)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Ubah teks banner hero, pengumuman, rekening pembayaran, dan kontak CS tanpa harus mengubah kode pemrograman.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="px-5 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}</span>
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#0d3830]" />
                    <span>1. Teks Banner Utama (Hero Banner)</span>
                  </h4>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Judul Utama Banner (Headline)</label>
                    <input
                      type="text"
                      value={settings.banner_title}
                      onChange={(e) => setSettings({ ...settings, banner_title: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Subtitle Deskripsi Banner</label>
                    <textarea
                      rows={3}
                      value={settings.banner_subtitle}
                      onChange={(e) => setSettings({ ...settings, banner_subtitle: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
