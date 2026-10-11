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
} from "lucide-react";
import { api, authStorage, getFileUrl } from "@/lib/api";

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
  const [rejectingBerkas, setRejectingBerkas] = useState<any | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectingPembayaran, setRejectingPembayaran] = useState<any | null>(null);
  const [rejectPembayaranNote, setRejectPembayaranNote] = useState("");

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
  const [seleksiProdiFilter, setSeleksiProdiFilter] = useState("");
  const [seleksiGelombangFilter, setSeleksiGelombangFilter] = useState("");
  const [seleksiStatusFilter, setSeleksiStatusFilter] = useState("");
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
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

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

  const loadFaqs = async () => {
    try {
      const res = await api.get("/admin/faqs");
      setFaqsList(res.data || []);
    } catch (err) {
      console.error("Gagal memuat FAQs:", err);
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
      if (seleksiStatusFilter) {
        query += `&status=${encodeURIComponent(seleksiStatusFilter)}`;
      } else {
        query += `&status=berkas_diverifikasi,mengikuti_ujian,lolos_seleksi,tidak_lolos`;
      }

      const res = await api.get(query);
      if (res.data && Array.isArray(res.data.pendaftars)) {
        setSeleksiApplicants(res.data.pendaftars);
      } else {
        setSeleksiApplicants([]);
      }
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
    else if (currStatus === "berkas_diverifikasi") initialStatus = "lolos_seleksi";
    else if (currStatus === "lolos_seleksi") initialStatus = "lolos_seleksi";

    setSeleksiForm({
      status: initialStatus,
      nilai_ujian: applicant.nilai_ujian !== undefined && applicant.nilai_ujian !== null ? String(applicant.nilai_ujian) : "",
      nilai_wawancara: applicant.nilai_wawancara !== undefined && applicant.nilai_wawancara !== null ? String(applicant.nilai_wawancara) : "",
      catatan:
        applicant.catatan_seleksi ||
        applicant.catatan_revisi ||
        "Selamat! Anda dinyatakan Lolos Seleksi Penerimaan Mahasiswa Baru STAI Cendekia Insani Situbondo.",
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
        nilai_ujian: seleksiForm.nilai_ujian ? parseFloat(seleksiForm.nilai_ujian) : null,
        nilai_wawancara: seleksiForm.nilai_wawancara ? parseFloat(seleksiForm.nilai_wawancara) : null,
      });
      alert(`Keputusan seleksi berhasil disimpan! Status pendaftar: ${seleksiForm.status}`);
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
    loadNavMenus();
    loadStats();
    loadPendaftars();
    loadGelombangs();
    loadProdis();
    loadSettings();
    loadFaqs();
    loadRBACData();
  }, []);

  useEffect(() => {
    if (activeTab === "logs") loadLogs();
    if (activeTab === "gelombang") loadGelombangs();
    if (activeTab === "prodi") loadProdis();
    if (activeTab === "export") loadExportData();
    if (activeTab === "seleksi") loadSeleksiData();
    if (activeTab === "settings") {
      loadSettings();
      loadFaqs();
    }
    if (activeTab === "rbac") {
      loadRBACData();
      loadRolePermissions(selectedRoleForMatrix);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "export") {
      loadExportData();
    }
  }, [exportProdiFilter, exportGelombangFilter, exportStatusFilter, exportStatusBayarFilter]);

  useEffect(() => {
    if (activeTab === "seleksi") {
      loadSeleksiData();
    }
  }, [seleksiSearch, seleksiProdiFilter, seleksiGelombangFilter, seleksiStatusFilter]);

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

  const handleVerifikasiSemuaDokumen = async () => {
    if (!selectedPendaftar || !selectedPendaftar.berkas || selectedPendaftar.berkas.length === 0) {
      alert("Tidak ada berkas yang perlu diverifikasi.");
      return;
    }
    setIsProcessing(true);
    try {
      for (const b of selectedPendaftar.berkas) {
        if (b.status_verifikasi !== "valid") {
          await api.put(`/admin/pendaftar/${selectedPendaftar.id}/verifikasi-berkas`, {
            berkas_id: b.id,
            status: "valid",
            catatan_admin: "",
          });
        }
      }
      const res = await api.get(`/admin/pendaftar/${selectedPendaftar.id}`);
      setSelectedPendaftar(res.data);
      loadPendaftars(meta.page);
      loadStats();
      alert("Seluruh berkas pendaftar berhasil diverifikasi sah!");
    } catch (err: any) {
      alert(err.message || "Gagal memverifikasi semua berkas");
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
      alert("Pengaturan konten banner, rekening bank, dan regulasi PMB berhasil diperbarui secara real-time!");
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan");
    } finally {
      setIsSavingSettings(false);
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
                  {activeTab === "export"
                    ? "Export Data Mahasiswa PMB"
                    : activeTab === "gelombang"
                    ? "Kelola Gelombang Pendaftaran"
                    : activeTab === "prodi"
                    ? "CMS Program Studi"
                    : activeTab === "emis"
                    ? "Sinkronisasi EMIS & Kopertais"
                    : activeTab === "seleksi"
                    ? "Seleksi & Kelulusan PMB"
                    : activeTab === "rbac"
                    ? "Manajemen Role & Menu RBAC"
                    : activeTab === "settings"
                    ? "Pengaturan CMS & Regulasi"
                    : activeTab === "logs"
                    ? "Log Aktivitas & Audit"
                    : "Data Pendaftar PMB"}
                </h2>
                <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full text-xs font-bold">
                  Gel. 1 TA 2026/2027
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === "export"
                  ? "Unduh rekapitulasi data pendaftar calon mahasiswa baru dalam format spreadsheet Microsoft Excel (.csv / .xlsx)."
                  : activeTab === "gelombang"
                  ? "Atur jadwal buka/tutup, kuota pendaftar, dan biaya pendaftaran gelombang PMB."
                  : activeTab === "prodi"
                  ? "Kelola pilihan program studi jenjang S1 yang tersedia bagi calon mahasiswa baru."
                  : activeTab === "emis"
                  ? "Integrasi dan kesiapan pemetaan format data EMIS Kementerian Agama & Kopertais Wilayah IV."
                  : activeTab === "seleksi"
                  ? "Penetapan hasil seleksi dan status kelulusan calon mahasiswa."
                  : activeTab === "rbac"
                  ? "Pengaturan hak akses, grup menu, dan matriks wewenang akun administrator."
                  : activeTab === "settings"
                  ? "Kelola konten banner, rekening bank, pengumuman, dan FAQ publik."
                  : activeTab === "logs"
                  ? "Catatan rekam jejak aktivitas operasional dan tindakan administrator."
                  : "Daftar seluruh calon mahasiswa baru yang terdaftar di sistem PMB STAICI."}
              </p>
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

          {/* SEARCH & FILTER TOOLBAR (for pendaftar) */}
          {activeTab === "pendaftar" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari Nama, NIK, No. PMB, atau Asal Sekolah..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") loadPendaftars(1);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0d3830] focus:bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => loadPendaftars(1)}
                  className="px-3.5 py-2 bg-[#0d3830] text-white rounded-xl text-xs font-bold hover:bg-[#165349] transition cursor-pointer"
                >
                  Cari
                </button>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <select
                  value={prodiFilter}
                  onChange={(e) => {
                    setProdiFilter(e.target.value);
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0d3830]"
                >
                  <option value="">Semua Program Studi</option>
                  {prodiList.map((prodi) => (
                    <option key={prodi.id} value={prodi.id}>
                      {prodi.nama}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0d3830]"
                >
                  <option value="">Semua Status</option>
                  <option value="belum_lengkap">Belum Lengkap / Perlu Revisi</option>
                  <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                  <option value="berkas_diverifikasi">Berkas Sah / Diverifikasi</option>
                  <option value="lolos_seleksi">Lolos Seleksi</option>
                  <option value="ditolak">Ditolak</option>
                </select>

                {(search || statusFilter || prodiFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("");
                      setProdiFilter("");
                      loadPendaftars(1);
                    }}
                    className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                    title="Reset Filter"
                  >
                    Reset
                  </button>
                )}
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
                  <span>Perlu Revisi / Belum Lengkap ({stats.belum_lengkap})</span>
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
                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                  gelombangTitle === "KIP-Kuliah" || p.jalur === "KIP-Kuliah"
                                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                                    : "bg-indigo-50 text-indigo-800 border border-indigo-100"
                                }`}>
                                  {gelombangTitle}
                                </span>
                              </td>

                              {/* Status Dokumen Individual */}
                              <td className="p-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {["kk", "ktp", "ijazah", "foto"].map((docKey) => {
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
                                {p.status_pendaftaran === "berkas_diverifikasi" || p.status_berkas === "Valid & Sah" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Sah / Diverifikasi</span>
                                  </span>
                                ) : p.status_pendaftaran === "belum_lengkap" || p.status_berkas === "Perlu Revisi" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 font-bold rounded-lg text-[11px]">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Perlu Revisi</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-bold rounded-lg text-[11px]">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Menunggu Verifikasi</span>
                                  </span>
                                )}
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
                      <th className="p-4">Status Biaya</th>
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

                            {/* Status Pembayaran */}
                            <td className="p-4">
                              {p.status_pembayaran === "diterima" || p.status_va === "Lunas" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                  Lunas
                                </span>
                              ) : p.status_pembayaran === "ditolak" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-900 font-bold rounded-full text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                  Ditolak
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-full text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                  Menunggu Pembayaran
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
                              ) : p.status_pendaftaran === "belum_lengkap" || p.status_berkas === "Perlu Revisi" ? (
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

                            {/* Status Akhir / Verifikasi */}
                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => openDetail(p.id)}
                                className="px-3 py-1.5 bg-[#0d3830] hover:bg-[#165349] text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Periksa →</span>
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
                        <option value="">Semua Status Biaya</option>
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

          {/* TAB CONTENT: KELOLA GELOMBANG */}
          {activeTab === "gelombang" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-700" />
                      <span>Gelombang Pendaftaran Mahasiswa Baru</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Atur kuota, jadwal buka &amp; tutup pendaftaran, biaya pendaftaran, serta status aktif tiap gelombang.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddGelombangOpen(true)}
                    className="px-4 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 text-emerald-300" />
                    <span>+ Tambah Gelombang Baru</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {gelombangList.map((gel) => {
                    const isAktif = gel.is_aktif;
                    return (
                      <div
                        key={gel.id}
                        className={`rounded-2xl border p-5 space-y-4 transition-all shadow-xs ${
                          isAktif ? "bg-white border-emerald-300 ring-2 ring-emerald-500/10" : "bg-slate-50 border-slate-200 opacity-80"
                        }`}
                      >
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
                              Rp {(gel.biaya_pendaftaran || 250000).toLocaleString("id-ID")}
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
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: CMS PROGRAM STUDI */}
          {activeTab === "prodi" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-5">
                  <h3 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-700" />
                    <span>Daftar Program Studi (Jenjang S1)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Pilihan program studi resmi STAI Cendekia Insani Situbondo yang dibuka untuk penerimaan mahasiswa baru.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {prodiList.map((prodi) => (
                    <div
                      key={prodi.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs hover:border-emerald-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-emerald-100 text-[#0d3830] border border-emerald-200">
                          {prodi.kode}
                        </span>
                        <span className="text-xs font-bold text-slate-500 font-serif">Jenjang {prodi.jenjang || "S1"}</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 font-serif leading-snug">{prodi.nama}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">{prodi.deskripsi}</p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-bold">● Status: Dibuka (Aktif)</span>
                        <span className="text-slate-400">ID #{prodi.id}</span>
                      </div>
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
                          Khusus calon mahasiswa yang telah diverifikasi berkasnya. Tetapkan hasil seleksi menjadi Lolos (Diterima), Ujian/Wawancara, atau Tidak Lolos.
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
                      <span className="text-xs font-bold text-blue-900">Ujian / Wawancara</span>
                      <Users className="w-4 h-4 text-blue-700" />
                    </div>
                    <p className="text-2xl font-black text-blue-950 font-serif">
                      {seleksiApplicants.filter((p) => p.status_pendaftaran === "mengikuti_ujian").length}
                    </p>
                    <span className="text-[10px] text-blue-800">Sesi tes atau wawancara dijadwalkan</span>
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
                    <span className="text-[10px] text-rose-800">Belum memenuhi passing grade</span>
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
                      value={seleksiGelombangFilter}
                      onChange={(e) => setSeleksiGelombangFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    >
                      <option value="">Semua Gelombang</option>
                      {gelombangList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nama}
                        </option>
                      ))}
                    </select>

                    <select
                      value={seleksiStatusFilter}
                      onChange={(e) => setSeleksiStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    >
                      <option value="">Semua Tahap Seleksi</option>
                      <option value="berkas_diverifikasi">Berkas Sah (Siap Seleksi)</option>
                      <option value="mengikuti_ujian">Mengikuti Ujian / Wawancara</option>
                      <option value="lolos_seleksi">Lolos Seleksi (Diterima)</option>
                      <option value="tidak_lolos">Tidak Lolos</option>
                    </select>

                    {(seleksiSearch || seleksiProdiFilter || seleksiGelombangFilter || seleksiStatusFilter) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSeleksiSearch("");
                          setSeleksiProdiFilter("");
                          setSeleksiGelombangFilter("");
                          setSeleksiStatusFilter("");
                        }}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Table Calon Mahasiswa Seleksi */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="p-3.5">No. PMB &amp; Nama Calon Mahasiswa</th>
                          <th className="p-3.5">Program Studi</th>
                          <th className="p-3.5">Asal Sekolah &amp; Rapor</th>
                          <th className="p-3.5">Nilai Tes &amp; Wawancara</th>
                          <th className="p-3.5 text-center">Status Kelulusan</th>
                          <th className="p-3.5">Catatan / Keputusan</th>
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
                                  <span className="text-[11px] text-slate-500">{getGelombangTitle(p.gelombang, p.jalur)}</span>
                                </td>
                                <td className="p-3.5">
                                  <p className="font-semibold text-slate-800">{p.nama_sekolah || getAsalSekolah(p)}</p>
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    Nilai Rapor: <strong className="text-slate-900">{p.nilai_rata_rata ? Number(p.nilai_rata_rata).toFixed(2) : "-"}</strong>
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <div className="space-y-0.5 font-mono text-[11px]">
                                    <p className="text-slate-700">
                                      Ujian CBT:{" "}
                                      <strong className="text-slate-900">
                                        {p.nilai_ujian !== undefined && p.nilai_ujian !== null ? Number(p.nilai_ujian).toFixed(1) : "-"}
                                      </strong>
                                    </p>
                                    <p className="text-slate-700">
                                      Wawancara:{" "}
                                      <strong className="text-slate-900">
                                        {p.nilai_wawancara !== undefined && p.nilai_wawancara !== null ? Number(p.nilai_wawancara).toFixed(1) : "-"}
                                      </strong>
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
                                      ? "Mengikuti Ujian / Wawancara"
                                      : isTidakLolos
                                      ? "Tidak Lolos"
                                      : isSiap
                                      ? "Berkas Sah (Siap Seleksi)"
                                      : p.status_pendaftaran}
                                  </span>
                                </td>
                                <td className="p-3.5 max-w-[200px]">
                                  <p className="text-[11px] text-slate-600 line-clamp-2 italic">
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

          {/* TAB CONTENT: CMS SETTINGS & FAQ MANAGEMENT */}
          {activeTab === "settings" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Top Banner Settings Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-amber-500" />
                      <span>Pengaturan Konten, Regulasi PMB &amp; FAQ (No-Coding CMS)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Kelola teks banner, informasi rekening bank, petunjuk transfer, regulasi persyaratan PMB, serta tanya jawab (FAQ) tanpa perlu mengubah kode sumber aplikasi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="px-5 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 self-start sm:self-auto"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>{isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}</span>
                  </button>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* SECTION 1: HERO BANNER */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#0d3830]" />
                      <span>1. Teks Banner Utama &amp; Pengumuman (Hero Section)</span>
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
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
                          rows={2}
                          value={settings.banner_subtitle}
                          onChange={(e) => setSettings({ ...settings, banner_subtitle: e.target.value })}
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Teks Pengumuman Pill Badge (Header Hero)</label>
                        <input
                          type="text"
                          value={settings.announcement_text}
                          onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                          placeholder="Contoh: Penerimaan Mahasiswa Baru Gelombang 1 Resmi Dibuka"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: INFORMASI REKENING BANK & WAKTU VERIFIKASI */}
                  <div className="space-y-4 bg-emerald-50/50 p-5 rounded-xl border border-emerald-200/80">
                    <h4 className="text-xs font-extrabold text-[#0d3830] uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      <span>2. Informasi Rekening Bank Resmi Pembayaran PMB</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Nama Bank Tujuan *</label>
                        <input
                          type="text"
                          value={settings.bank_name}
                          onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                          placeholder="Contoh: Bank Syariah Indonesia (BSI)"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Nomor Rekening *</label>
                        <input
                          type="text"
                          value={settings.nomor_rekening}
                          onChange={(e) => setSettings({ ...settings, nomor_rekening: e.target.value })}
                          placeholder="Contoh: 7148899012"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Atas Nama Pemilik Rekening *</label>
                        <input
                          type="text"
                          value={settings.atas_nama}
                          onChange={(e) => setSettings({ ...settings, atas_nama: e.target.value })}
                          placeholder="Contoh: STAI Cendekia Insani PMB"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Batas Waktu Konfirmasi *</label>
                        <input
                          type="text"
                          value={settings.batas_waktu_konfirmasi}
                          onChange={(e) => setSettings({ ...settings, batas_waktu_konfirmasi: e.target.value })}
                          placeholder="Contoh: 1x24 Jam Kerja"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: PETUNJUK TRANSFER & REGULASI BUKTI BAYAR */}
                  <div className="space-y-4 bg-amber-50/50 p-5 rounded-xl border border-amber-200/80">
                    <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-700" />
                      <span>3. Petunjuk Langkah Pembayaran &amp; Regulasi Bukti Bayar Sah</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Instruksi / Petunjuk Langkah Transfer</span>
                          <span className="text-[11px] font-normal text-slate-500">Tampil di dashboard calon mahasiswa</span>
                        </label>
                        <textarea
                          rows={4}
                          value={settings.petunjuk_pembayaran}
                          onChange={(e) => setSettings({ ...settings, petunjuk_pembayaran: e.target.value })}
                          placeholder="Contoh: 1. Transfer nominal ke rekening resmi di atas...&#10;2. Unggah file bukti transfer sah..."
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Regulasi &amp; Syarat Bukti Bayar yang Dinyatakan Sah</span>
                          <span className="text-[11px] font-normal text-slate-500">Aturan validasi bukti transfer</span>
                        </label>
                        <textarea
                          rows={4}
                          value={settings.regulasi_bukti_bayar}
                          onChange={(e) => setSettings({ ...settings, regulasi_bukti_bayar: e.target.value })}
                          placeholder="Contoh: 1. Bukti pembayaran harus memuat nama pengirim, nominal, dan tanggal jelas...&#10;2. Pembayaran buram akan ditolak..."
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: REGULASI PERSYARATAN & JALUR PMB */}
                  <div className="space-y-4 bg-indigo-50/50 p-5 rounded-xl border border-indigo-200/80">
                    <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-indigo-700" />
                      <span>4. Regulasi Persyaratan Dokumen &amp; Jalur Pendaftaran PMB</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Daftar Dokumen / Berkas Persyaratan (1 baris per poin)</span>
                          <span className="text-[11px] font-normal text-slate-500">Tampil di portal info PMB</span>
                        </label>
                        <textarea
                          rows={4}
                          value={settings.persyaratan_pendaftaran}
                          onChange={(e) => setSettings({ ...settings, persyaratan_pendaftaran: e.target.value })}
                          placeholder="1. Scan/Foto Kartu Keluarga (KK)&#10;2. Scan/Foto KTP Calon Mahasiswa&#10;3. Scan/Foto Ijazah / SKL..."
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Informasi Jalur Pendaftaran (Reguler, Beasiswa, KIP)</span>
                          <span className="text-[11px] font-normal text-slate-500">Keterangan jalur masuk</span>
                        </label>
                        <textarea
                          rows={4}
                          value={settings.jalur_pendaftaran_info}
                          onChange={(e) => setSettings({ ...settings, jalur_pendaftaran_info: e.target.value })}
                          placeholder="Jalur Reguler (Mandiri): Terbuka bagi seluruh lulusan...&#10;Jalur Beasiswa KIP: Terbuka bagi..."
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: KONTAK LAYANAN CS & LOKASI */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#0d3830]" />
                      <span>5. Kontak Layanan Hotline &amp; Lokasi Kampus</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Nomor WhatsApp CS PMB</label>
                        <input
                          type="text"
                          value={settings.no_whatsapp_cs}
                          onChange={(e) => setSettings({ ...settings, no_whatsapp_cs: e.target.value })}
                          placeholder="085233432221"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Email Resmi PMB</label>
                        <input
                          type="email"
                          value={settings.email_cs}
                          onChange={(e) => setSettings({ ...settings, email_cs: e.target.value })}
                          placeholder="pmb@staicisitubondo.ac.id"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Alamat Kampus</label>
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

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-3 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      <Save className="w-4 h-4 text-amber-400" />
                      <span>{isSavingSettings ? "Menyimpan Pengaturan..." : "Simpan Seluruh Pengaturan"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 6: FAQ MANAGEMENT (TANYA JAWAB PMB) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                      <span>6. Manajemen Tanya Jawab Seputar PMB (FAQ Dinamis)</span>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                        Periksa keaslian file yang diunggah dan beri status verifikasi per-dokumen.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifikasiSemuaDokumen}
                      disabled={isProcessing}
                      className="px-3.5 py-1.5 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Setujui Semua Berkas Sah</span>
                    </button>
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
                        ? selectedPendaftar.berkas.find((b: any) => b.jenis_dokumen === docType.key)
                        : null;

                      return (
                        <div key={docType.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{docType.label}</span>
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
                          {berkasItem && (
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
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-75"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Revisi / Tolak</span>
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
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              pembayaran.status === "diterima"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : pembayaran.status === "ditolak"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}>
                              {pembayaran.status === "diterima"
                                ? "Lunas & Sah"
                                : pembayaran.status === "ditolak"
                                ? "Ditolak"
                                : "Menunggu Verifikasi"}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]">
                            Bank Tujuan: <strong>{pembayaran.bank_tujuan}</strong> • Pengirim: <strong>{pembayaran.nama_pengirim || "-"}</strong>
                          </p>
                          {pembayaran.alasan_penolakan && (
                            <p className="text-rose-700 font-semibold text-[11px]">
                              Alasan Penolakan: {pembayaran.alasan_penolakan}
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
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition cursor-pointer disabled:opacity-75"
                          >
                            Setujui Sah
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => {
                              setRejectingPembayaran(pembayaran);
                              setRejectPembayaranNote("");
                            }}
                            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition cursor-pointer disabled:opacity-75"
                          >
                            Tolak Bukti
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

                {/* Section 4: Ringkasan Verifikasi Administrasi & Penerusan ke Seleksi */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 block">Status Administrasi &amp; Berkas:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        selectedPendaftar.status_pendaftaran === "berkas_diverifikasi"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : selectedPendaftar.status_pendaftaran === "ditolak_perlu_perbaikan"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}>
                        {selectedPendaftar.status_pendaftaran === "berkas_diverifikasi"
                          ? "Berkas Terverifikasi Sah (Siap Masuk Seleksi)"
                          : selectedPendaftar.status_pendaftaran === "ditolak_perlu_perbaikan"
                          ? "Perlu Revisi / Perbaikan Berkas"
                          : "Menunggu Verifikasi Berkas & Pembayaran"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedPendaftar.status_pendaftaran !== "berkas_diverifikasi" ? (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleVerifikasiSemuaDokumen}
                        className="px-4 py-2 bg-[#0d3830] hover:bg-[#165349] text-white rounded-xl font-bold text-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Sahkan Seluruh Berkas &amp; Loloskan Administrasi</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const p = selectedPendaftar;
                          setIsDetailOpen(false);
                          setSelectedPendaftar(null);
                          setActiveTab("seleksi");
                          handleOpenSeleksiModal(p);
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Award className="w-4 h-4" />
                        <span>Buka Penilaian Seleksi &amp; Kelulusan →</span>
                      </button>
                    )}
                  </div>
                </div>

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
              <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 animate-scaleUp">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base font-serif">
                        Penetapan Seleksi &amp; Kelulusan PMB
                      </h4>
                      <p className="text-xs text-slate-500">
                        {selectedForSeleksi.nomor_pendaftaran || `PMB-2026-00${selectedForSeleksi.id}`} • {getUserName(selectedForSeleksi)}
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

                {/* Candidate Info Summary */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Program Studi:</span>
                    <strong className="text-slate-900">{getProdiTitle(selectedForSeleksi.program_studi)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Jalur / Gelombang:</span>
                    <strong className="text-slate-900">{getGelombangTitle(selectedForSeleksi.gelombang, selectedForSeleksi.jalur)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Asal Sekolah:</span>
                    <span className="text-slate-800 font-medium truncate block">{selectedForSeleksi.nama_sekolah || getAsalSekolah(selectedForSeleksi)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nilai Rapor SLTA:</span>
                    <strong className="text-emerald-800 font-mono">{selectedForSeleksi.nilai_rata_rata ? Number(selectedForSeleksi.nilai_rata_rata).toFixed(2) : "-"}</strong>
                  </div>
                </div>

                <form onSubmit={handleSubmitSeleksi} className="space-y-4">
                  {/* Status Selection Cards */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Keputusan Hasil Seleksi <span className="text-rose-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSeleksiForm({
                            ...seleksiForm,
                            status: "lolos_seleksi",
                            catatan: seleksiForm.catatan || "Selamat! Anda dinyatakan Lulus Seleksi PMB STAI Cendekia Insani Situbondo.",
                          });
                        }}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          seleksiForm.status === "lolos_seleksi"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-emerald-800">Lolos Seleksi</span>
                          <CheckCircle2 className={`w-4 h-4 ${seleksiForm.status === "lolos_seleksi" ? "text-emerald-600" : "text-slate-300"}`} />
                        </div>
                        <span className="text-[10px] text-slate-500">Diterima resmi di STAICI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSeleksiForm({
                            ...seleksiForm,
                            status: "mengikuti_ujian",
                            catatan: seleksiForm.catatan || "Anda dijadwalkan mengikuti sesi tes/wawancara seleksi PMB STAICI.",
                          });
                        }}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          seleksiForm.status === "mengikuti_ujian"
                            ? "bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-blue-800">Ujian / Wawancara</span>
                          <Users className={`w-4 h-4 ${seleksiForm.status === "mengikuti_ujian" ? "text-blue-600" : "text-slate-300"}`} />
                        </div>
                        <span className="text-[10px] text-slate-500">Perlu tes atau wawancara</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSeleksiForm({
                            ...seleksiForm,
                            status: "tidak_lolos",
                            catatan: seleksiForm.catatan || "Mohon maaf, Anda belum memenuhi kualifikasi seleksi pada periode ini.",
                          });
                        }}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          seleksiForm.status === "tidak_lolos"
                            ? "bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-rose-800">Tidak Lolos</span>
                          <XCircle className={`w-4 h-4 ${seleksiForm.status === "tidak_lolos" ? "text-rose-600" : "text-slate-300"}`} />
                        </div>
                        <span className="text-[10px] text-slate-500">Tidak diterima</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Nilai Seleksi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nilai Tes CBT / Tertulis (0 - 100)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Contoh: 85.5"
                        value={seleksiForm.nilai_ujian}
                        onChange={(e) => setSeleksiForm({ ...seleksiForm, nilai_ujian: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nilai Wawancara / BTA (0 - 100)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Contoh: 90.0"
                        value={seleksiForm.nilai_wawancara}
                        onChange={(e) => setSeleksiForm({ ...seleksiForm, nilai_wawancara: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  {/* Catatan / Teks Surat Keputusan */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Catatan / Pesan Pengumuman untuk Mahasiswa
                    </label>
                    <textarea
                      rows={3}
                      value={seleksiForm.catatan}
                      onChange={(e) => setSeleksiForm({ ...seleksiForm, catatan: e.target.value })}
                      placeholder="Masukkan catatan keputusan hasil seleksi untuk calon mahasiswa..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0d3830]"
                    />
                    <p className="text-[10px] text-slate-400">
                      Pesan ini akan otomatis ditampilkan pada dashboard akun calon mahasiswa.
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
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Tolak &amp; Minta Revisi Berkas</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setRejectingBerkas(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Alasan / Catatan Revisi untuk Mahasiswa <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Contoh: Foto KTP buram dan terpotong. Mohon unggah ulang foto yang jelas dan terbaca..."
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
                    onClick={() => handleVerifikasiDokumen(rejectingBerkas.id, "invalid", rejectNote)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? "Menyimpan..." : "Kirim Catatan Revisi"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: INPUT ALASAN PENOLAKAN PEMBAYARAN */}
          {rejectingPembayaran && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Tolak Bukti Pembayaran</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setRejectingPembayaran(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Alasan Penolakan Pembayaran <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Contoh: Nominal transfer kurang dari Rp 250.000 / Rekening tujuan tidak sesuai..."
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
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? "Menyimpan..." : "Tolak Pembayaran"}
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
                      placeholder="Contoh: Gelombang 2 Reguler"
                      value={newGelombang.nama}
                      onChange={(e) => setNewGelombang({ ...newGelombang, nama: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tahun Akademik *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 2026/2027"
                        value={newGelombang.tahun_akademik}
                        onChange={(e) => setNewGelombang({ ...newGelombang, tahun_akademik: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0d3830]"
                      />
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

        </div>
      </div>

    </div>
  );
}
