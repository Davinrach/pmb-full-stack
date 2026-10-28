"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  CheckCircle2,
  Check,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Clock,
  Headphones,
  Building2,
  User,
  Copy,
  Camera,
  Paperclip,
  ArrowRight,
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  Lock,
  Smartphone,
  BookOpen,
  GraduationCap,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { api, authStorage, UserSession } from "@/lib/api";
import LoginModal from "@/components/LoginModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

// Format currency IDR helper
const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

// Format date ID helper
const formatDateIndo = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const PEKERJAAN_LIST = [
  "PNS / TNI / Polri",
  "Guru / Dosen",
  "Pegawai Swasta",
  "Wiraswasta / Pengusaha",
  "Petani / Peternak / Nelayan",
  "Buruh / Pekerja Lepas",
  "Pengurus Rumah Tangga",
  "Pensiunan",
  "Lainnya",
];

const PENGHASILAN_LIST = [
  "Di bawah Rp 1.000.000",
  "Rp 1.000.000 - Rp 2.500.000",
  "Rp 2.500.000 - Rp 5.000.000",
  "Di atas Rp 5.000.000",
  "Tidak Berpenghasilan",
];

export default function PendaftaranPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-500 font-bold">
          Memuat Formulir Pendaftaran PMB STAICI...
        </div>
      }
    >
      <PendaftaranFormContent />
    </Suspense>
  );
}

function PendaftaranFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jalurParam = searchParams.get("jalur");
  const { t, lang } = useLanguage();
  const p = (t.pendaftaranPage || {}) as any;

  // Navigation & User State
  const [user, setUser] = useState<UserSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Stepper State (1: Jalur, Gelombang, Prodi & Biodata, 2: Sekolah & Keluarga, 3: Berkas & Finalisasi)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Success Final Submit Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedNomor, setSubmittedNomor] = useState("");

  // ===================== MASTER DATA STATE =====================
  const [masterProdis, setMasterProdis] = useState<any[]>([]);
  const [masterGelombangList, setMasterGelombangList] = useState<any[]>([]);
  const [masterJalurList, setMasterJalurList] = useState<any[]>([]);
  const [masterRekeningList, setMasterRekeningList] = useState<any[]>([]);
  const [masterPersyaratanDocs, setMasterPersyaratanDocs] = useState<any[]>([]);
  const [masterHotlines, setMasterHotlines] = useState<any[]>([]);
  const [copiedRekeningId, setCopiedRekeningId] = useState<number | string | null>(null);

  // ===================== FORM DATA STATE =====================
  // Tahap 1: Jalur, Gelombang, Prodi & Biodata Diri
  const [tahap1, setTahap1] = useState({
    program_studi_id: "1",
    jalur_pendaftaran: "Reguler",
    gelombang_id: "",
    namaLengkap: "",
    nik: "",
    jenisKelamin: "Laki-laki" as "Laki-laki" | "Perempuan",
    tempatLahir: "",
    tanggalLahir: "",
    kewarganegaraan: "WNI (Warga Negara Indonesia)",
    negaraAsal: "",
    agama: "Islam",
    agamaLainnya: "",
    statusPernikahan: "Belum Menikah",
    alamatDomisili: "",
    noWhatsapp: "",
    email: "",
  });

  // Tahap 2: Sekolah & Keluarga
  const [tahap2, setTahap2] = useState({
    namaSekolah: "",
    statusSekolah: "Negeri",
    jurusanSekolah: "IPA",
    jurusanSekolahLainnya: "",
    nilaiRataRata: "",
    tahunLulus: "2026",

    // Ayah Kandung
    statusAyah: "hidup" as "hidup" | "meninggal",
    namaAyah: "",
    nikAyah: "",
    kkAyah: "",
    tempatLahirAyah: "",
    tanggalLahirAyah: "",
    alamatAyah: "",
    pendidikanAyah: "SMA / MA / SMK / Sederajat",
    pekerjaanAyah: "Wiraswasta / Pengusaha",
    pekerjaanAyahLainnya: "",
    penghasilanAyah: "Rp 1.000.000 - Rp 2.500.000",
    noHpAyah: "",

    // Ibu Kandung
    statusIbu: "hidup" as "hidup" | "meninggal",
    namaIbu: "",
    nikIbu: "",
    kkIbu: "",
    tempatLahirIbu: "",
    tanggalLahirIbu: "",
    alamatIbu: "",
    pendidikanIbu: "SMA / MA / SMK / Sederajat",
    pekerjaanIbu: "Pengurus Rumah Tangga",
    pekerjaanIbuLainnya: "",
    penghasilanIbu: "Di bawah Rp 1.000.000",
    noHpIbu: "",

    // Wali (Opsional)
    namaWali: "",
    hubunganWali: "",
    noHpOrangTuaWali: "",
  });

  // Tahap 3: Berkas & Finalisasi
  const [berkasFiles, setBerkasFiles] = useState<Record<string, File | null>>({});
  const [uploadedBerkasNames, setUploadedBerkasNames] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Fallback & Jalur Pendaftaran
  const displayedJalurList = useMemo(() => {
    if (masterJalurList.length > 0) return masterJalurList;
    return [
      {
        id: 1,
        kode: "reguler",
        nama: "Jalur Reguler (Mandiri)",
        badge_text: "Mandiri",
        deskripsi: "Terbuka bagi seluruh lulusan SMA/MA/SMK sederajat.",
        bebas_biaya: false,
      },
      {
        id: 2,
        kode: "kip-kuliah",
        nama: "Jalur Beasiswa KIP-Kuliah",
        badge_text: "Beasiswa KIP",
        deskripsi: "Bebas biaya pendaftaran dan perkuliahan penuh bagi siswa berprestasi.",
        bebas_biaya: true,
      },
    ];
  }, [masterJalurList]);

  // Jalur Param URL Handling (?jalur=reguler atau ?jalur=kip-kuliah)
  useEffect(() => {
    if (jalurParam) {
      const q = jalurParam.toLowerCase();
      if (q.includes("kip")) {
        setTahap1((prev) => ({ ...prev, jalur_pendaftaran: "KIP-Kuliah" }));
      } else if (q.includes("reguler")) {
        setTahap1((prev) => ({ ...prev, jalur_pendaftaran: "Reguler" }));
      }
    }
  }, [jalurParam]);

  const isJalurSelected = (jalur: any) => {
    if (!tahap1.jalur_pendaftaran) return false;
    const current = tahap1.jalur_pendaftaran.toLowerCase();
    const kode = (jalur.kode || "").toLowerCase();
    const nama = (jalur.nama || "").toLowerCase();
    if (kode.includes("kip") || nama.includes("kip")) {
      return current.includes("kip");
    }
    if (kode.includes("reguler") || nama.includes("reguler")) {
      return current.includes("reguler") || (!current.includes("kip") && current !== "");
    }
    return current === kode || current === nama;
  };

  const handleSelectJalur = (jalur: any) => {
    const kode = (jalur.kode || "").toLowerCase();
    const nama = (jalur.nama || "").toLowerCase();
    const isKip = kode.includes("kip") || nama.includes("kip");
    setTahap1((prev) => ({
      ...prev,
      jalur_pendaftaran: isKip ? "KIP-Kuliah" : "Reguler",
    }));
  };

  // Fallback & Only OPEN Gelombang Memo
  const openGelombangList = useMemo(() => {
    const list = masterGelombangList.length > 0 ? masterGelombangList : [
      {
        id: 1,
        nama: "Gelombang 1 - TA 2026/2027",
        tahun_akademik: "2026/2027",
        tanggal_buka: "2026-05-01T00:00:00Z",
        tanggal_tutup: "2026-07-31T23:59:59Z",
        biaya_pendaftaran: 250000,
        is_aktif: false,
      },
      {
        id: 2,
        nama: "Gelombang 2 - TA 2026/2027",
        tahun_akademik: "2026/2027",
        tanggal_buka: "2026-08-01T00:00:00Z",
        tanggal_tutup: "2026-11-30T23:59:59Z",
        biaya_pendaftaran: 250000,
        is_aktif: true,
      },
      {
        id: 3,
        nama: "Gelombang 3 - TA 2026/2027",
        tahun_akademik: "2026/2027",
        tanggal_buka: "2026-12-01T00:00:00Z",
        tanggal_tutup: "2027-02-28T23:59:59Z",
        biaya_pendaftaran: 300000,
        is_aktif: false,
      },
    ];

    const now = new Date();
    // Hanya ambil gelombang yang statusnya aktif dan tanggal sekarang berada di antara tanggal buka & tutup
    const openOnly = list.filter((g: any) => {
      if (g.is_aktif === false) return false;
      if (g.tanggal_buka && g.tanggal_tutup) {
        const start = new Date(g.tanggal_buka);
        const end = new Date(g.tanggal_tutup);
        end.setHours(23, 59, 59, 999);
        return g.is_aktif && now >= start && now <= end;
      }
      return Boolean(g.is_aktif);
    });

    if (openOnly.length > 0) return openOnly;

    // Fallback: gelombang dengan flag is_aktif === true
    const activeFlagOnly = list.filter((g: any) => g.is_aktif);
    if (activeFlagOnly.length > 0) return activeFlagOnly;

    return [list[0]];
  }, [masterGelombangList]);

  // Auto-select Gelombang Pertama yang Sedang Buka
  useEffect(() => {
    if (openGelombangList.length > 0) {
      const exists = openGelombangList.some((g) => String(g.id) === String(tahap1.gelombang_id));
      if (!exists) {
        setTahap1((prev) => ({ ...prev, gelombang_id: String(openGelombangList[0].id) }));
      }
    }
  }, [openGelombangList, tahap1.gelombang_id]);

  // Step Validation Statuses
  const isStep1Valid = Boolean(
    tahap1.jalur_pendaftaran &&
    tahap1.gelombang_id &&
    tahap1.program_studi_id &&
    tahap1.namaLengkap.trim() &&
    tahap1.nik.trim().length === 16 &&
    tahap1.tempatLahir.trim() &&
    tahap1.tanggalLahir &&
    tahap1.alamatDomisili.trim() &&
    tahap1.noWhatsapp.trim() &&
    tahap1.email.trim()
  );

  const isStep2Valid = Boolean(
    isStep1Valid &&
    tahap2.namaSekolah.trim() &&
    (tahap2.statusAyah === "meninggal" || tahap2.namaAyah.trim()) &&
    (tahap2.statusIbu === "meninggal" || tahap2.namaIbu.trim())
  );

  const handleCopyRekening = (number: string, id: number | string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(number.replace(/\s/g, ""));
    }
    setCopiedRekeningId(id);
    setTimeout(() => {
      setCopiedRekeningId(null);
    }, 2000);
  };

  const loadUserPendaftarData = async (specifiedUser?: UserSession | null) => {
    const currentUser = specifiedUser || authStorage.getUser();
    const token = authStorage.getToken();

    if (currentUser && token) {
      if (currentUser.role === "admin_pmb" || currentUser.role === "super_admin") {
        router.replace("/admincms");
        return;
      }
      setUser(currentUser);
      setIsCheckingAuth(false);
      setTahap1((prev) => ({
        ...prev,
        namaLengkap: currentUser.nama_lengkap || prev.namaLengkap,
        nik: currentUser.nik || prev.nik,
        email: currentUser.email || prev.email,
        noWhatsapp: currentUser.no_hp || prev.noWhatsapp,
      }));

      try {
        const res = await api.get("/auth/me");
        if (res.data?.pendaftar) {
          const p = res.data.pendaftar;
          if (p.program_studi_id) {
            setTahap1((prev) => ({
              ...prev,
              program_studi_id: String(p.program_studi_id),
              jenisKelamin: (p.jenis_kelamin as any) || prev.jenisKelamin,
              tempatLahir: p.tempat_lahir || prev.tempatLahir,
              tanggalLahir: p.tanggal_lahir ? p.tanggal_lahir.split("T")[0] : prev.tanggalLahir,
              alamatDomisili: p.alamat || prev.alamatDomisili,
              statusPernikahan: (p.status_pernikahan as any) || prev.statusPernikahan,
              kewarganegaraan: p.status_warga_negara === "WNA" ? "WNA (Warga Negara Asing)" : "WNI (Warga Negara Indonesia)",
              negaraAsal: p.negara_wna || prev.negaraAsal,
              agama: p.agama || prev.agama,
            }));
          }
          if (p.jalur_pendaftaran) {
            setTahap1((prev) => ({
              ...prev,
              jalur_pendaftaran: p.jalur_pendaftaran,
            }));
          }
          if (p.gelombang_id) {
            setTahap1((prev) => ({
              ...prev,
              gelombang_id: String(p.gelombang_id),
            }));
          }
          if (p.nama_sekolah) {
            setTahap2((prev) => ({
              ...prev,
              namaSekolah: p.nama_sekolah || prev.namaSekolah,
              statusSekolah: p.status_sekolah || prev.statusSekolah,
              jurusanSekolah: p.jurusan_sekolah || prev.jurusanSekolah,
              nilaiRataRata: p.nilai_rata_rata ? String(p.nilai_rata_rata) : prev.nilaiRataRata,
              tahunLulus: p.tahun_lulus ? String(p.tahun_lulus) : prev.tahunLulus,
            }));
          }
          if (p.data_orang_tua) {
            const ortu = p.data_orang_tua;
            setTahap2((prev) => ({
              ...prev,
              statusAyah: ortu.pekerjaan_ayah === "Almarhum" ? "meninggal" : "hidup",
              namaAyah: ortu.nama_ayah || prev.namaAyah,
              pendidikanAyah: ortu.pendidikan_ayah || prev.pendidikanAyah,
              pekerjaanAyah: ortu.pekerjaan_ayah || prev.pekerjaanAyah,
              penghasilanAyah: ortu.penghasilan_ayah || prev.penghasilanAyah,
              noHpAyah: ortu.no_hp_orang_tua_wali || prev.noHpAyah,

              statusIbu: ortu.pekerjaan_ibu === "Almarhumah" ? "meninggal" : "hidup",
              namaIbu: ortu.nama_ibu || prev.namaIbu,
              pendidikanIbu: ortu.pendidikan_ibu || prev.pendidikanIbu,
              pekerjaanIbu: ortu.pekerjaan_ibu || prev.pekerjaanIbu,
              penghasilanIbu: ortu.penghasilan_ibu || prev.penghasilanIbu,

              namaWali: ortu.nama_wali || prev.namaWali,
              noHpOrangTuaWali: ortu.no_hp_orang_tua_wali || prev.noHpOrangTuaWali,
            }));
          }
          if (p.berkas && Array.isArray(p.berkas)) {
            const uploadedMap: Record<string, string> = {};
            p.berkas.forEach((b: any) => {
              if (b.jenis_dokumen && b.nama_file) {
                uploadedMap[b.jenis_dokumen] = b.nama_file;
              }
            });
            setUploadedBerkasNames(uploadedMap);
          }
        }
      } catch {
        authStorage.clear();
        setUser(null);
        setIsCheckingAuth(false);
        const currentPath = typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/pendaftaran";
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    } else {
      setUser(null);
      setIsCheckingAuth(false);
      const currentPath = typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/pendaftaran";
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  };

  useEffect(() => {
    loadUserPendaftarData();

    Promise.all([
      api.get("/public/settings"),
      api.get("/info-pmb"),
    ])
      .then(([setRes, infoRes]) => {
        const setVal = (setRes as any)?.data || setRes;
        const infoVal = (infoRes as any)?.data || infoRes;

        if (infoVal?.program_studi && Array.isArray(infoVal.program_studi)) {
          setMasterProdis(infoVal.program_studi.filter((p: any) => p.is_aktif ?? true));
        }
        if (infoVal?.rekening && Array.isArray(infoVal.rekening)) {
          setMasterRekeningList(infoVal.rekening.filter((r: any) => r.is_aktif ?? true));
        } else if (setVal?.rekening_pembayaran_info) {
          try {
            const parsed = typeof setVal.rekening_pembayaran_info === "string" ? JSON.parse(setVal.rekening_pembayaran_info) : setVal.rekening_pembayaran_info;
            if (Array.isArray(parsed)) setMasterRekeningList(parsed);
          } catch {}
        }
        if (infoVal?.persyaratan_dokumen && Array.isArray(infoVal.persyaratan_dokumen)) {
          setMasterPersyaratanDocs(infoVal.persyaratan_dokumen.filter((d: any) => d.is_aktif ?? true));
        }
        if (infoVal?.hotline && Array.isArray(infoVal.hotline)) {
          setMasterHotlines(infoVal.hotline.filter((h: any) => h.is_aktif ?? true));
        }
        if (infoVal?.gelombang && Array.isArray(infoVal.gelombang)) {
          setMasterGelombangList(infoVal.gelombang);
        }
        if (infoVal?.jalur_pendaftaran && Array.isArray(infoVal.jalur_pendaftaran)) {
          setMasterJalurList(infoVal.jalur_pendaftaran);
        }
      })
      .catch((err) => console.error("Error loading master info-pmb:", err));

    const handleAuthChange = () => {
      loadUserPendaftarData();
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  const handleSaveDraft = async (showSuccessAlert = false) => {
    setIsSavingDraft(true);
    setNotification(null);

    if (authStorage.getToken()) {
      try {
        if (tahap1.alamatDomisili || tahap1.tempatLahir) {
          await api.put("/pendaftar/identitas", {
            jenis_kelamin: tahap1.jenisKelamin,
            alamat: tahap1.alamatDomisili,
            tempat_lahir: tahap1.tempatLahir,
            tanggal_lahir: tahap1.tanggalLahir || "2000-01-01",
            status_warga_negara: tahap1.kewarganegaraan.includes("WNI") ? "WNI" : "WNA",
            negara_wna: tahap1.kewarganegaraan.includes("WNA") ? tahap1.negaraAsal : "",
            agama: tahap1.agama === "Lainnya" && tahap1.agamaLainnya ? tahap1.agamaLainnya : tahap1.agama,
            status_pernikahan: tahap1.statusPernikahan,
          });
        }
        if (tahap1.program_studi_id) {
          await api.put("/pendaftar/prodi-gelombang", {
            program_studi_id: Number(tahap1.program_studi_id),
            gelombang_id: Number(tahap1.gelombang_id || 1),
            jalur_pendaftaran: tahap1.jalur_pendaftaran || "Reguler",
          });
        }
        if (tahap2.namaSekolah) {
          await api.put("/pendaftar/asal-sekolah", {
            nama_sekolah: tahap2.namaSekolah,
            status_sekolah: tahap2.statusSekolah,
            jurusan_sekolah: tahap2.jurusanSekolah,
            nilai_rata_rata: parseFloat(tahap2.nilaiRataRata) || 80,
            tahun_lulus: parseInt(tahap2.tahunLulus) || 2026,
          });
        }
        if (tahap2.namaAyah || tahap2.namaIbu) {
          await api.put("/pendaftar/orang-tua", {
            nama_ayah: tahap2.statusAyah === "meninggal" ? "Almarhum" : tahap2.namaAyah,
            nik_ayah: tahap2.nikAyah || tahap1.nik,
            kk_ayah: tahap2.kkAyah || "3512000000000000",
            tempat_lahir_ayah: tahap2.tempatLahirAyah || tahap1.tempatLahir,
            tanggal_lahir_ayah: tahap2.tanggalLahirAyah || "1975-01-01",
            alamat_ayah: tahap2.alamatAyah || tahap1.alamatDomisili,
            pendidikan_ayah: tahap2.pendidikanAyah,
            pekerjaan_ayah: tahap2.statusAyah === "meninggal" ? "Almarhum" : tahap2.pekerjaanAyah,
            penghasilan_ayah: tahap2.statusAyah === "meninggal" ? "Tidak Berpenghasilan" : tahap2.penghasilanAyah,

            nama_ibu: tahap2.statusIbu === "meninggal" ? "Almarhumah" : tahap2.namaIbu,
            nik_ibu: tahap2.nikIbu || tahap1.nik,
            kk_ibu: tahap2.kkIbu || "3512000000000000",
            tempat_lahir_ibu: tahap2.tempatLahirIbu || tahap1.tempatLahir,
            tanggal_lahir_ibu: tahap2.tanggalLahirIbu || "1978-01-01",
            alamat_ibu: tahap2.alamatIbu || tahap1.alamatDomisili,
            pendidikan_ibu: tahap2.pendidikanIbu,
            pekerjaan_ibu: tahap2.statusIbu === "meninggal" ? "Almarhumah" : tahap2.pekerjaanIbu,
            penghasilan_ibu: tahap2.statusIbu === "meninggal" ? "Tidak Berpenghasilan" : tahap2.penghasilanIbu,

            nama_wali: tahap2.namaWali,
            no_hp_orang_tua_wali: tahap2.noHpOrangTuaWali || tahap2.noHpAyah || tahap1.noWhatsapp,
          });
        }

        if (showSuccessAlert) {
          setNotification({
            type: "success",
            message: "Draft pendaftaran berhasil disimpan! Anda dapat melanjutkannya kapan saja.",
          });
        }
      } catch (err: any) {
        if (showSuccessAlert) {
          setNotification({
            type: "error",
            message: err.message || "Gagal menyimpan draft.",
          });
        }
      } finally {
        setIsSavingDraft(false);
      }
    } else {
      setIsSavingDraft(false);
      if (showSuccessAlert) {
        setNotification({
          type: "info",
          message: "Silakan masuk akun terlebih dahulu agar draft tersimpan ke server.",
        });
        setLoginModalOpen(true);
      }
    }
  };

  const isStepDisabled = (step: number) => {
    if (step === 1) return false;
    if (step === 2) return !isStep1Valid;
    if (step === 3) return !isStep1Valid || !isStep2Valid;
    return false;
  };

  const handleStepClick = (targetStep: 1 | 2 | 3) => {
    if (targetStep === currentStep) return;

    if (targetStep > currentStep) {
      if (targetStep === 2 && !isStep1Valid) {
        setNotification({
          type: "error",
          message: lang === "eng"
            ? "Please complete all required fields in Stage 1 before proceeding to Stage 2."
            : "Silakan lengkapi seluruh isian wajib pada Tahap 1 terlebih dahulu sebelum beralih ke Tahap 2.",
        });
        return;
      }
      if (targetStep === 3) {
        if (!isStep1Valid) {
          setNotification({
            type: "error",
            message: lang === "eng"
              ? "Please complete Stage 1 first."
              : "Silakan selesaikan Tahap 1 terlebih dahulu.",
          });
          return;
        }
        if (!isStep2Valid) {
          setNotification({
            type: "error",
            message: lang === "eng"
              ? "Please complete Stage 2 before proceeding to document upload."
              : "Silakan selesaikan data sekolah & orang tua pada Tahap 2 terlebih dahulu.",
          });
          return;
        }
      }
    }

    setNotification(null);
    setCurrentStep(targetStep);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  // Step 1 Validation & Proceed
  const handleProceedStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!tahap1.jalur_pendaftaran) {
      setNotification({ type: "error", message: "Silakan pilih salah satu Jalur Pendaftaran." });
      return;
    }
    if (!tahap1.gelombang_id) {
      setNotification({ type: "error", message: "Silakan pilih salah satu Gelombang Pendaftaran." });
      return;
    }
    if (!tahap1.namaLengkap.trim()) {
      setNotification({ type: "error", message: "Nama lengkap wajib diisi." });
      return;
    }
    if (tahap1.nik.trim().length !== 16) {
      setNotification({ type: "error", message: "NIK wajib 16 digit angka sesuai KTP/KK." });
      return;
    }
    if (!tahap1.tempatLahir.trim() || !tahap1.tanggalLahir) {
      setNotification({ type: "error", message: "Tempat dan tanggal lahir wajib diisi." });
      return;
    }
    if (!tahap1.alamatDomisili.trim()) {
      setNotification({ type: "error", message: "Alamat tempat tinggal wajib diisi." });
      return;
    }
    if (!tahap1.noWhatsapp.trim() || !tahap1.email.trim()) {
      setNotification({ type: "error", message: "Nomor WhatsApp dan Email wajib diisi." });
      return;
    }

    handleSaveDraft(false);
    setCurrentStep(2);
    window.scrollTo({ top: 220, behavior: "smooth" });
  };

  // Step 2 Validation & Proceed
  const handleProceedStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!tahap2.namaSekolah.trim()) {
      setNotification({ type: "error", message: "Nama asal sekolah wajib diisi." });
      return;
    }
    if (tahap2.statusAyah === "hidup" && !tahap2.namaAyah.trim()) {
      setNotification({ type: "error", message: "Nama Ayah kandung wajib diisi." });
      return;
    }
    if (tahap2.statusIbu === "hidup" && !tahap2.namaIbu.trim()) {
      setNotification({ type: "error", message: "Nama Ibu kandung wajib diisi." });
      return;
    }

    handleSaveDraft(false);
    setCurrentStep(3);
    window.scrollTo({ top: 220, behavior: "smooth" });
  };

  const handleFileChange = (key: string, file: File | null) => {
    if (file && file.size > 2 * 1024 * 1024) {
      alert(`Ukuran berkas ${file.name} melebihi batas maksimal 2 MB.`);
      return;
    }
    setBerkasFiles((prev) => ({ ...prev, [key]: file }));
  };

  // Final Submit
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!agreeTerms) {
      setNotification({
        type: "error",
        message: "Anda harus menyetujui pernyataan keabsahan data untuk mengirim formulir.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = authStorage.getToken();
      if (!token) {
        setNotification({
          type: "error",
          message: "Silakan masuk akun terlebih dahulu untuk mengirim formulir.",
        });
        setLoginModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      await api.put("/pendaftar/identitas", {
        jenis_kelamin: tahap1.jenisKelamin,
        alamat: tahap1.alamatDomisili,
        tempat_lahir: tahap1.tempatLahir,
        tanggal_lahir: tahap1.tanggalLahir,
        status_warga_negara: tahap1.kewarganegaraan.includes("WNI") ? "WNI" : "WNA",
        negara_wna: tahap1.kewarganegaraan.includes("WNA") ? tahap1.negaraAsal : "",
        agama: tahap1.agama === "Lainnya" && tahap1.agamaLainnya ? tahap1.agamaLainnya : tahap1.agama,
        status_pernikahan: tahap1.statusPernikahan,
      });

      await api.put("/pendaftar/prodi-gelombang", {
        program_studi_id: Number(tahap1.program_studi_id),
        gelombang_id: Number(tahap1.gelombang_id || 1),
        jalur_pendaftaran: tahap1.jalur_pendaftaran || "Reguler",
      });

      await api.put("/pendaftar/asal-sekolah", {
        nama_sekolah: tahap2.namaSekolah,
        status_sekolah: tahap2.statusSekolah,
        jurusan_sekolah: tahap2.jurusanSekolah,
        nilai_rata_rata: parseFloat(tahap2.nilaiRataRata) || 85,
        tahun_lulus: parseInt(tahap2.tahunLulus) || 2026,
      });

      await api.put("/pendaftar/orang-tua", {
        nama_ayah: tahap2.statusAyah === "meninggal" ? "Almarhum" : tahap2.namaAyah,
        nik_ayah: tahap2.statusAyah === "meninggal" ? tahap1.nik : (tahap2.nikAyah || tahap1.nik),
        kk_ayah: tahap2.kkAyah || "3512000000000000",
        tempat_lahir_ayah: tahap2.tempatLahirAyah || tahap1.tempatLahir,
        tanggal_lahir_ayah: tahap2.tanggalLahirAyah || "1975-01-01",
        alamat_ayah: tahap2.alamatAyah || tahap1.alamatDomisili,
        pendidikan_ayah: tahap2.pendidikanAyah,
        pekerjaan_ayah: tahap2.statusAyah === "meninggal" ? "Almarhum" : tahap2.pekerjaanAyah,
        penghasilan_ayah: tahap2.statusAyah === "meninggal" ? "Tidak Berpenghasilan" : tahap2.penghasilanAyah,

        nama_ibu: tahap2.statusIbu === "meninggal" ? "Almarhumah" : tahap2.namaIbu,
        nik_ibu: tahap2.statusIbu === "meninggal" ? tahap1.nik : (tahap2.nikIbu || tahap1.nik),
        kk_ibu: tahap2.kkIbu || "3512000000000000",
        tempat_lahir_ibu: tahap2.tempatLahirIbu || tahap1.tempatLahir,
        tanggal_lahir_ibu: tahap2.tanggalLahirIbu || "1978-01-01",
        alamat_ibu: tahap2.alamatIbu || tahap1.alamatDomisili,
        pendidikan_ibu: tahap2.pendidikanIbu,
        pekerjaan_ibu: tahap2.statusIbu === "meninggal" ? "Almarhumah" : tahap2.pekerjaanIbu,
        penghasilan_ibu: tahap2.statusIbu === "meninggal" ? "Tidak Berpenghasilan" : tahap2.penghasilanIbu,

        nama_wali: tahap2.namaWali,
        no_hp_orang_tua_wali: tahap2.noHpOrangTuaWali || tahap2.noHpAyah || tahap1.noWhatsapp,
      });

      const fileUploadPromises = [];
      for (const [docKey, file] of Object.entries(berkasFiles)) {
        if (file) {
          const fd = new FormData();
          fd.append("jenis_dokumen", docKey);
          fd.append("file", file);
          fileUploadPromises.push(api.upload("/pendaftar/berkas", fd));
        }
      }
      await Promise.all(fileUploadPromises);

      const submitRes = await api.post("/pendaftar/submit");
      const regNumber = submitRes.data?.nomor_pendaftaran || "PMB-2026-0001";
      setSubmittedNomor(regNumber);
      setShowSuccessModal(true);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Gagal mengirim formulir pendaftaran. Silakan periksa kembali isian Anda.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Active Dynamic Data Helpers
  const activeProdiList = masterProdis.length > 0
    ? masterProdis.map((p) => ({
        id: String(p.id),
        kode: p.kode || p.nama.replace(/^(S1\s+|Program Studi\s+)/i, "").substring(0, 4).toUpperCase(),
        jenjang: p.jenjang || "S1",
        title: p.nama,
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      }))
    : [
        { id: "1", kode: "MPI", jenjang: "S1", badgeColor: "bg-amber-100 text-amber-800 border-amber-200", title: "S1 Manajemen Pendidikan Islam" },
        { id: "2", kode: "AS", jenjang: "S1", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200", title: "S1 Ahwal Al-Syakhsiyah (HKI)" },
        { id: "3", kode: "KPI", jenjang: "S1", badgeColor: "bg-teal-100 text-teal-800 border-teal-200", title: "S1 Komunikasi Penyiaran Islam" },
      ];

  const activeDocs = [
    { key: "kk", label: "Kartu Keluarga (KK)", wajib: true },
    { key: "ktp", label: "KTP Calon Mahasiswa", wajib: true },
    { key: "ijazah", label: "Ijazah / SKL SLTA", wajib: true },
    { key: "foto", label: "Pas Foto 3x4 Berwarna", wajib: true },
    { key: "kip", label: "Kartu KIP / DTKS (Khusus KIP)", wajib: tahap1.jalur_pendaftaran?.toLowerCase().includes("kip") },
  ];

  const isKipRegistration = tahap1.jalur_pendaftaran?.toLowerCase().includes("kip");
  const selectedGelombang = openGelombangList.find((g) => String(g.id) === String(tahap1.gelombang_id)) || openGelombangList[0];
  const selectedProdiName = activeProdiList.find((p) => String(p.id) === String(tahap1.program_studi_id))?.title || "Belum dipilih";
  const totalRegistrationFee = isKipRegistration ? 0 : (selectedGelombang?.biaya_pendaftaran ?? 250000);

  const primaryRekening = masterRekeningList.length > 0
    ? masterRekeningList[0]
    : {
        id: 1,
        nama_bank: "Bank Syariah Indonesia (BSI)",
        nomor_rekening: "7123456789",
        atas_nama: "PMB STAI Cendekia Insani",
      };

  // 1. Guard: Sedang Memeriksa Sesi Login
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar activePage="pendaftaran" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-base font-bold text-slate-800">
            {lang === "eng" ? "Checking Authentication..." : "Memeriksa Status Login..."}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "eng"
              ? "Preparing PMB registration form..."
              : "Menyiapkan formulir pendaftaran PMB STAICI..."}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // 2. Guard: Wajib Login Terlebih Dahulu (Tidak Membuka Formulir Langsung)
  if (!user) {
    const currentPath = typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "/pendaftaran";

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Navbar activePage="pendaftaran" />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 sm:p-8 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0d3830] flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Lock className="w-8 h-8 text-emerald-700" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === "eng" ? "Login Required" : "Login Diperlukan"}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              {lang === "eng" ? "Sign In to Access Registration Form" : "Silakan Masuk Terlebih Dahulu"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {lang === "eng"
                ? "To fill out the New Student Admission Form for STAI Cendekia Insani, you must log in with your applicant account so that all identity data and documents are safely stored."
                : "Untuk mengisi formulir pendaftaran mahasiswa baru STAI Cendekia Insani, Anda diharuskan masuk menggunakan akun calon mahasiswa agar seluruh data dan berkas tersimpan dengan aman."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setLoginModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>{lang === "eng" ? "Sign In to Account" : "Masuk ke Akun PMB"}</span>
              </button>

              <Link
                href={`/register?redirect=${encodeURIComponent(currentPath)}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition shadow-2xs flex items-center justify-center gap-2"
              >
                <span>{lang === "eng" ? "Create New Account" : "Daftar Akun Baru"}</span>
              </Link>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sistem PMB STAI Cendekia Insani Situbondo</span>
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={loginModalOpen}
          allowClose={true}
          onClose={() => setLoginModalOpen(false)}
          redirectTo={currentPath}
          onSuccess={(loggedUser) => {
            setUser(loggedUser);
            setLoginModalOpen(false);
            loadUserPendaftarData(loggedUser);
          }}
        />

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
      {/* 1. Header / Navbar */}
      <Navbar activePage="pendaftaran" />

      {/* 2. Compact & Elegant Hero */}
      <section className="relative w-full bg-[#0c2f29] text-white py-8 sm:py-10 border-b border-emerald-900/40">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{p?.badgeTa || (lang === "eng" ? "New Student Admission 2026/2027" : "Penerimaan Mahasiswa Baru 2026/2027")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {p?.title || (lang === "eng" ? "New Student Admission Form" : "Formulir Pendaftaran Mahasiswa Baru")}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-emerald-100/80">
                {p?.subtitle || (lang === "eng" ? "STAI Cendekia Insani Situbondo • Complete the 3 easy steps below" : "STAI Cendekia Insani Situbondo • Lengkapi 3 tahap praktis di bawah ini")}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/#program-studi"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-emerald-100 border border-white/15 transition"
              >
                {p?.btnLihatProdi || (lang === "eng" ? "View Study Programs" : "Lihat Detail Prodi")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1">
        {/* Logged in User Status Header */}
        {user && (
          <div className="mb-6 p-3 sm:p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-[#0d3830] text-emerald-300 flex items-center justify-center flex-shrink-0 text-[11px] font-bold">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="leading-snug">
                <span>{lang === "eng" ? "Signed in as:" : "Masuk sebagai:"}</span>{" "}
                <strong>{user.nama_lengkap}</strong> ({user.email}) •{" "}
                <span className="text-emerald-700 font-medium">
                  {lang === "eng" ? "Draft automatically synced" : "Draft tersinkronisasi otomatis"}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 3-Step Clean Stepper */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-2 sm:p-3 mb-6 shadow-2xs">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { step: 1, title: p?.step1Title || (lang === "eng" ? "1. Track & Identity" : "1. Jalur & Biodata"), valid: isStep1Valid },
              { step: 2, title: p?.step2Title || (lang === "eng" ? "2. School & Parents" : "2. Sekolah & Ortu"), valid: isStep2Valid },
              { step: 3, title: p?.step3Title || (lang === "eng" ? "3. Documents & Submit" : "3. Berkas & Selesai"), valid: false },
            ].map((s) => {
              const isActive = currentStep === s.step;
              const isPast = currentStep > s.step && s.valid;
              const isDisabled = isStepDisabled(s.step);

              return (
                <button
                  key={s.step}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleStepClick(s.step as any)}
                  className={`py-2 px-2.5 sm:px-3 rounded-lg text-left transition flex items-center justify-between gap-2 ${
                    isActive
                      ? "bg-[#0d3830] text-white shadow-xs cursor-default"
                      : isPast
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100/60 cursor-pointer"
                      : isDisabled
                      ? "bg-slate-50/70 text-slate-400 border border-slate-200/50 cursor-not-allowed opacity-60"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 cursor-pointer"
                  }`}
                  title={isDisabled ? (lang === "eng" ? "Complete previous steps first" : "Selesaikan tahap sebelumnya terlebih dahulu") : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isActive
                          ? "bg-white text-[#0d3830]"
                          : isPast
                          ? "bg-emerald-600 text-white"
                          : isDisabled
                          ? "bg-slate-100 text-slate-400 border border-slate-200"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isPast ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : isDisabled && s.step > 1 ? (
                        <Lock className="w-3 h-3 text-slate-400" />
                      ) : (
                        s.step
                      )}
                    </div>
                    <span className="text-xs font-bold truncate">{s.title}</span>
                  </div>
                  {isDisabled && s.step > 1 && (
                    <span className="text-[10px] text-slate-400 font-normal hidden md:inline-block">
                      {lang === "eng" ? "Locked" : "Terkunci"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div
            className={`mb-6 p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-3 animate-fadeIn ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : notification.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-blue-50 border-blue-200 text-blue-900"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* MAIN FORM COLUMN (col-span-8) */}
          <div className="lg:col-span-8">
            {/* ================= TAHAP 1 ================= */}
            {currentStep === 1 && (
              <form onSubmit={handleProceedStep1} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {p?.tahap1Header || (lang === "eng" ? "Stage 1: Admission Track & Applicant Identity" : "Tahap 1: Jalur Masuk & Biodata Calon Mahasiswa")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p?.tahap1Sub || (lang === "eng" ? "Select your entry track, wave, program, and complete your basic identity." : "Pilih jalur, gelombang, prodi, dan lengkapi identitas dasar Anda.")}
                  </p>
                </div>

                {/* 1. Jalur Pendaftaran */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{p?.jalurTitle || (lang === "eng" ? "Admission Track" : "Jalur Pendaftaran")} <span className="text-red-500">*</span></span>
                    <span className="text-[11px] font-normal text-slate-400">{p?.jalurHint || (lang === "eng" ? "Select one" : "Pilih salah satu")}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayedJalurList.map((jalur: any) => {
                      const isSelected = isJalurSelected(jalur);
                      const isKip = (jalur.kode || "").toLowerCase().includes("kip") || (jalur.nama || "").toLowerCase().includes("kip");

                      return (
                        <div
                          key={jalur.id || jalur.kode}
                          onClick={() => handleSelectJalur(jalur)}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-[#0d3830] bg-[#eef6f3] shadow-xs ring-1 ring-[#0d3830]/30"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              isSelected
                                ? "bg-[#0d3830] text-white border-[#0d3830]"
                                : isKip
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}>
                              {isKip ? (lang === "eng" ? "KIP Scholarship" : "Beasiswa KIP") : (lang === "eng" ? "Regular" : "Reguler")}
                            </span>
                            {isSelected ? (
                              <span className="w-4 h-4 rounded-full bg-[#0d3830] text-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                            )}
                          </div>
                          <strong className="text-xs sm:text-sm text-slate-900 leading-snug">{lang === "eng" && jalur.nama_en ? jalur.nama_en : jalur.nama}</strong>
                          <span className={`text-[11px] font-semibold mt-2 pt-1.5 border-t border-slate-100 ${isKip ? "text-amber-800" : "text-emerald-800"}`}>
                            {isKip ? (lang === "eng" ? "Free Tuition" : "Gratis / Bebas Biaya Kuliah") : (lang === "eng" ? "Standard Wave Rate" : "Sesuai Tarif Gelombang")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Gelombang Pendaftaran (Hanya yang sedang buka) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{p?.gelombangTitle || (lang === "eng" ? "Admission Wave (Currently Open)" : "Gelombang Pendaftaran (Sedang Dibuka)")} <span className="text-red-500">*</span></span>
                    <span className="text-[11px] text-emerald-700 font-semibold">&bull; {p?.gelombangAktif || (lang === "eng" ? "Active Period" : "Periode Aktif")}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {openGelombangList.map((gel: any) => {
                      const isSelected = String(tahap1.gelombang_id) === String(gel.id);
                      return (
                        <div
                          key={gel.id}
                          onClick={() => setTahap1({ ...tahap1, gelombang_id: String(gel.id) })}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "border-[#0d3830] bg-[#eef6f3] shadow-xs ring-1 ring-[#0d3830]/30"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <strong className="text-xs font-bold text-slate-900 block">{lang === "eng" && gel.nama_en ? gel.nama_en : gel.nama}</strong>
                            <span className="text-[11px] text-slate-500">
                              {formatDateIndo(gel.tanggal_buka)} &ndash; {formatDateIndo(gel.tanggal_tutup)}
                            </span>
                          </div>
                          <span className="text-xs font-bold font-mono text-[#0d3830]">
                            {isKipRegistration ? "Rp 0" : formatRupiah(gel.biaya_pendaftaran || 250000)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Program Studi */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    {p?.prodiTitle || (lang === "eng" ? "Undergraduate Program Choice" : "Pilihan Program Studi S1")} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {activeProdiList.map((prodi) => {
                      const isSelected = String(tahap1.program_studi_id) === String(prodi.id);
                      return (
                        <div
                          key={prodi.id}
                          onClick={() => setTahap1({ ...tahap1, program_studi_id: prodi.id })}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-[#0d3830] bg-[#eef6f3] shadow-xs ring-1 ring-[#0d3830]/30"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {prodi.kode}
                            </span>
                            {isSelected && (
                              <span className="w-3.5 h-3.5 rounded-full bg-[#0d3830] text-white flex items-center justify-center">
                                <Check className="w-2 h-2 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-900 leading-snug">{prodi.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Biodata Form Inputs */}
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.namaLengkap || (lang === "eng" ? "Full Name (as in ID/Diploma)" : "Nama Lengkap (Sesuai KTP/Ijazah)")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === "eng" ? "e.g. Ahmad Fauzan" : "Contoh: Ahmad Fauzan"}
                        value={tahap1.namaLengkap}
                        onChange={(e) => setTahap1({ ...tahap1, namaLengkap: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.nik || (lang === "eng" ? "National ID (16 Digits)" : "NIK (16 Digit KTP/KK)")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        placeholder={lang === "eng" ? "16 digit ID number" : "16 digit angka"}
                        value={tahap1.nik}
                        onChange={(e) => setTahap1({ ...tahap1, nik: e.target.value.replace(/\D/g, "") })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.jenisKelamin || (lang === "eng" ? "Gender" : "Jenis Kelamin")} <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { val: "Laki-laki", label: p?.lakiLaki || (lang === "eng" ? "Male" : "Laki-laki") },
                          { val: "Perempuan", label: p?.perempuan || (lang === "eng" ? "Female" : "Perempuan") }
                        ].map((jk) => (
                          <button
                            key={jk.val}
                            type="button"
                            onClick={() => setTahap1({ ...tahap1, jenisKelamin: jk.val as any })}
                            className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                              tahap1.jenisKelamin === jk.val
                                ? "bg-[#0d3830] text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {jk.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.tempatLahir || (lang === "eng" ? "Place of Birth" : "Tempat Lahir")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === "eng" ? "e.g. Situbondo" : "Contoh: Situbondo"}
                        value={tahap1.tempatLahir}
                        onChange={(e) => setTahap1({ ...tahap1, tempatLahir: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.tanggalLahir || (lang === "eng" ? "Date of Birth" : "Tanggal Lahir")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={tahap1.tanggalLahir}
                        onChange={(e) => setTahap1({ ...tahap1, tanggalLahir: e.target.value })}
                        className="w-full px-3 py-2 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  {/* Status Pernikahan, Agama, Kewarganegaraan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.statusPernikahan || (lang === "eng" ? "Marital Status" : "Status Pernikahan")} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={tahap1.statusPernikahan}
                        onChange={(e) => setTahap1({ ...tahap1, statusPernikahan: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="Belum Menikah">{p?.belumMenikah || (lang === "eng" ? "Single" : "Belum Menikah")}</option>
                        <option value="Menikah">{p?.menikah || (lang === "eng" ? "Married" : "Menikah")}</option>
                        <option value="Duda / Janda">{p?.dudaJanda || (lang === "eng" ? "Divorced / Widowed" : "Duda / Janda")}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.agama || (lang === "eng" ? "Religion" : "Agama")} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={tahap1.agama}
                        onChange={(e) => setTahap1({ ...tahap1, agama: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen">{lang === "eng" ? "Protestant" : "Kristen"}</option>
                        <option value="Katolik">{lang === "eng" ? "Catholic" : "Katolik"}</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Konghucu">Konghucu</option>
                        <option value="Lainnya">{lang === "eng" ? "Other" : "Lainnya"}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.kewarganegaraan || (lang === "eng" ? "Citizenship" : "Kewarganegaraan")} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={tahap1.kewarganegaraan}
                        onChange={(e) => setTahap1({ ...tahap1, kewarganegaraan: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="WNI (Warga Negara Indonesia)">{lang === "eng" ? "Indonesian (WNI)" : "WNI"}</option>
                        <option value="WNA (Warga Negara Asing)">{lang === "eng" ? "Foreigner (WNA)" : "WNA"}</option>
                      </select>
                    </div>
                  </div>

                  {tahap1.kewarganegaraan.includes("WNA") && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="text-xs font-bold text-slate-800 block">
                        {lang === "eng" ? "Country of Origin (Foreign)" : "Nama Negara Asal (WNA)"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === "eng" ? "e.g. Malaysia, Singapore, Brunei" : "Contoh: Malaysia, Brunei Darussalam, dll."}
                        value={tahap1.negaraAsal}
                        onChange={(e) => setTahap1({ ...tahap1, negaraAsal: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.noWa || (lang === "eng" ? "Active WhatsApp Number" : "No. WhatsApp Aktif")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="08123456789"
                        value={tahap1.noWhatsapp}
                        onChange={(e) => setTahap1({ ...tahap1, noWhatsapp: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.email || (lang === "eng" ? "Active Email" : "Email Aktif")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@email.com"
                        value={tahap1.email}
                        onChange={(e) => setTahap1({ ...tahap1, email: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      {p?.alamat || (lang === "eng" ? "Full Residential Address" : "Alamat Tempat Tinggal Lengkap")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder={lang === "eng" ? "Street address, District, City/Regency, Province" : "Jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan, Kabupaten/Kota"}
                      value={tahap1.alamatDomisili}
                      onChange={(e) => setTahap1({ ...tahap1, alamatDomisili: e.target.value })}
                      className="w-full p-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleSaveDraft(true)}
                    disabled={isSavingDraft}
                    className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isSavingDraft ? (lang === "eng" ? "Saving..." : "Menyimpan...") : (p?.btnDraft || (lang === "eng" ? "Save Draft" : "Simpan Draft"))}</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{lang === "eng" ? "Proceed to Stage 2" : "Lanjut ke Tahap 2"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ================= TAHAP 2 ================= */}
            {currentStep === 2 && (
              <form onSubmit={handleProceedStep2} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {p?.tahap2Header || (lang === "eng" ? "Stage 2: High School & Parents Information" : "Tahap 2: Asal Sekolah & Data Orang Tua")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p?.tahap2Sub || (lang === "eng" ? "Complete your high school history and parents/guardian information." : "Lengkapi riwayat pendidikan sekolah menengah dan data orang tua/wali.")}
                  </p>
                </div>

                {/* Sub 1: Asal Sekolah */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-100 pb-1">
                    {p?.asalSekolahTitle || (lang === "eng" ? "A. High School Information (SMA / MA / SMK)" : "A. Data Asal Sekolah (SMA / MA / SMK)")}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.namaSekolah || (lang === "eng" ? "School Name" : "Nama Asal Sekolah")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === "eng" ? "e.g. MAN 1 Situbondo" : "Contoh: MAN 1 Situbondo"}
                        value={tahap2.namaSekolah}
                        onChange={(e) => setTahap2({ ...tahap2, namaSekolah: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.statusSekolah || (lang === "eng" ? "School Status" : "Status Sekolah")}
                      </label>
                      <select
                        value={tahap2.statusSekolah}
                        onChange={(e) => setTahap2({ ...tahap2, statusSekolah: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="Negeri">{lang === "eng" ? "Public / State" : "Negeri"}</option>
                        <option value="Swasta">{lang === "eng" ? "Private" : "Swasta"}</option>
                        <option value="Pondok Pesantren / Salafiyah">{lang === "eng" ? "Islamic Boarding School / Pesantren" : "Pondok Pesantren / Salafiyah"}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.jurusanSekolah || (lang === "eng" ? "Major / Stream" : "Jurusan")}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === "eng" ? "Science / Social / Religion / Vocational" : "IPA / IPS / Agama / SMK"}
                        value={tahap2.jurusanSekolah}
                        onChange={(e) => setTahap2({ ...tahap2, jurusanSekolah: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.nilaiRataRata || (lang === "eng" ? "Average Score (Diploma/Report)" : "Nilai Rata-rata Ijazah / Rapor")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="85.5"
                        value={tahap2.nilaiRataRata}
                        onChange={(e) => setTahap2({ ...tahap2, nilaiRataRata: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        {p?.tahunLulus || (lang === "eng" ? "Graduation Year" : "Tahun Lulus")}
                      </label>
                      <input
                        type="number"
                        placeholder="2026"
                        value={tahap2.tahunLulus}
                        onChange={(e) => setTahap2({ ...tahap2, tahunLulus: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub 2: Ayah Kandung */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      {p?.ayahTitle || (lang === "eng" ? "B. Father's Information" : "B. Data Ayah Kandung")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-600 font-medium cursor-pointer flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={tahap2.statusAyah === "meninggal"}
                          onChange={(e) =>
                            setTahap2({ ...tahap2, statusAyah: e.target.checked ? "meninggal" : "hidup" })
                          }
                          className="rounded text-[#0d3830]"
                        />
                        <span>{p?.almarhum || (lang === "eng" ? "Deceased" : "Almarhum")}</span>
                      </label>
                    </div>
                  </div>

                  {tahap2.statusAyah === "hidup" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-800 block">
                          {p?.namaAyah || (lang === "eng" ? "Father's Name" : "Nama Ayah")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required={tahap2.statusAyah === "hidup"}
                          placeholder={lang === "eng" ? "Full name of father" : "Nama lengkap Ayah"}
                          value={tahap2.namaAyah}
                          onChange={(e) => setTahap2({ ...tahap2, namaAyah: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 block">
                          {p?.pekerjaanAyah || (lang === "eng" ? "Father's Occupation" : "Pekerjaan Ayah")}
                        </label>
                        <select
                          value={tahap2.pekerjaanAyah}
                          onChange={(e) => setTahap2({ ...tahap2, pekerjaanAyah: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                        >
                          {PEKERJAAN_LIST.map((pVal) => (
                            <option key={pVal} value={pVal}>{pVal}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 block">
                          {p?.penghasilanAyah || (lang === "eng" ? "Father's Income" : "Penghasilan Ayah")}
                        </label>
                        <select
                          value={tahap2.penghasilanAyah}
                          onChange={(e) => setTahap2({ ...tahap2, penghasilanAyah: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                        >
                          {PENGHASILAN_LIST.map((ph) => (
                            <option key={ph} value={ph}>{ph}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">{lang === "eng" ? "Father recorded as deceased." : "Data Ayah tercatat Almarhum."}</p>
                  )}
                </div>

                {/* Sub 3: Ibu Kandung */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      {p?.ibuTitle || (lang === "eng" ? "C. Mother's Information" : "C. Data Ibu Kandung")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-600 font-medium cursor-pointer flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={tahap2.statusIbu === "meninggal"}
                          onChange={(e) =>
                            setTahap2({ ...tahap2, statusIbu: e.target.checked ? "meninggal" : "hidup" })
                          }
                          className="rounded text-[#0d3830]"
                        />
                        <span>{p?.almarhumah || (lang === "eng" ? "Deceased" : "Almarhumah")}</span>
                      </label>
                    </div>
                  </div>

                  {tahap2.statusIbu === "hidup" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-800 block">
                          {p?.namaIbu || (lang === "eng" ? "Mother's Name" : "Nama Ibu")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required={tahap2.statusIbu === "hidup"}
                          placeholder={lang === "eng" ? "Full name of mother" : "Nama lengkap Ibu"}
                          value={tahap2.namaIbu}
                          onChange={(e) => setTahap2({ ...tahap2, namaIbu: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 block">
                          {p?.pekerjaanIbu || (lang === "eng" ? "Mother's Occupation" : "Pekerjaan Ibu")}
                        </label>
                        <select
                          value={tahap2.pekerjaanIbu}
                          onChange={(e) => setTahap2({ ...tahap2, pekerjaanIbu: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                        >
                          {PEKERJAAN_LIST.map((pVal) => (
                            <option key={pVal} value={pVal}>{pVal}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 block">
                          {p?.penghasilanIbu || (lang === "eng" ? "Mother's Income" : "Penghasilan Ibu")}
                        </label>
                        <select
                          value={tahap2.penghasilanIbu}
                          onChange={(e) => setTahap2({ ...tahap2, penghasilanIbu: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white text-slate-900 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0d3830]"
                        >
                          {PENGHASILAN_LIST.map((ph) => (
                            <option key={ph} value={ph}>{ph}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">{lang === "eng" ? "Mother recorded as deceased." : "Data Ibu tercatat Almarhumah."}</p>
                  )}
                </div>

                {/* Step 2 Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      window.scrollTo({ top: 220, behavior: "smooth" });
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{lang === "eng" ? "Back to Stage 1" : "Kembali ke Tahap 1"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveDraft(true)}
                      disabled={isSavingDraft}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isSavingDraft ? (lang === "eng" ? "Saving..." : "Menyimpan...") : (p?.btnDraft || (lang === "eng" ? "Save Draft" : "Simpan Draft"))}</span>
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{lang === "eng" ? "Proceed to Stage 3" : "Lanjut ke Tahap 3"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ================= TAHAP 3 ================= */}
            {currentStep === 3 && (
              <form onSubmit={handleFinalSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {p?.tahap3Header || (lang === "eng" ? "Stage 3: Document Upload & Final Submit" : "Tahap 3: Unggah Berkas & Finalisasi")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p?.tahap3Sub || (lang === "eng" ? "Upload registration documents and confirm form submission." : "Unggah berkas pendaftaran dan konfirmasi pengiriman formulir.")}
                  </p>
                </div>

                {/* Upload Dokumen */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    {p?.berkasTitle || (lang === "eng" ? "Required Documents (JPG/PDF format, max 2MB)" : "Berkas Persyaratan (Format JPG/PDF maks. 2MB)")}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeDocs.map((doc) => {
                      const file = berkasFiles[doc.key];
                      const uploadedName = uploadedBerkasNames[doc.key];
                      const hasFile = Boolean(file || uploadedName);

                      return (
                        <div
                          key={doc.key}
                          className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                            hasFile ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-slate-50/60"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">{doc.label}</span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {file?.name || uploadedName || (doc.wajib ? (lang === "eng" ? "Required" : "Wajib diunggah") : (lang === "eng" ? "Optional" : "Opsional"))}
                            </span>
                          </div>

                          <div className="flex-shrink-0">
                            {hasFile ? (
                              <button
                                type="button"
                                onClick={() => handleFileChange(doc.key, null)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                                title={lang === "eng" ? "Delete document" : "Hapus berkas"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <label className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs">
                                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{lang === "eng" ? "Choose" : "Pilih"}</span>
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) => handleFileChange(doc.key, e.target.files?.[0] || null)}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pembayaran Info */}
                {isKipRegistration ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p>
                      <strong>{lang === "eng" ? "KIP Scholarship Admission Fee Waiver:" : "Jalur Beasiswa KIP-Kuliah Bebas Biaya Pendaftaran:"}</strong>{" "}
                      {lang === "eng" ? "You do not need to make any registration fee transfer." : "Anda tidak perlu melakukan pembayaran transfer pendaftaran."}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {p?.pembayaranTitle || (lang === "eng" ? "Official Campus Bank Account" : "Nomor Rekening Resmi Kampus")} ({lang === "eng" ? "Fee" : "Biaya"}: {formatRupiah(totalRegistrationFee)})
                        </span>
                        <span className="text-xs text-slate-600">{primaryRekening.nama_bank} a.n {primaryRekening.atas_nama}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong className="font-mono text-sm font-bold text-[#0d3830]">{primaryRekening.nomor_rekening}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopyRekening(primaryRekening.nomor_rekening, "bsi")}
                          className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
                        >
                          {copiedRekeningId === "bsi" ? (lang === "eng" ? "Copied!" : "Tersalin!") : (lang === "eng" ? "Copy" : "Salin")}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs text-slate-600">
                        {lang === "eng" ? "Upload Transfer Proof (Optional, can be submitted later):" : "Unggah Bukti Transfer (Opsional sekarang, dapat disusulkan):"}
                      </span>
                      <label className="px-3 py-1.5 bg-[#0d3830] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 self-start sm:self-auto">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{berkasFiles.bukti_transfer?.name || uploadedBerkasNames.bukti_transfer ? (lang === "eng" ? "File Chosen" : "Bukti Terpilih") : (lang === "eng" ? "Upload Receipt" : "Unggah Bukti")}</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileChange("bukti_transfer", e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Pernyataan Persetujuan */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="agreeCheck"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#0d3830] border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="agreeCheck" className="text-xs text-slate-700 leading-snug cursor-pointer select-none">
                    {p?.pernyataan || (lang === "eng" ? "I solemnly declare that all information and documents provided are true and valid." : "Saya menyatakan bahwa seluruh data dan berkas yang saya isikan adalah benar dan sah sesuai data diri saya.")}
                  </label>
                </div>

                {/* Step 3 Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      window.scrollTo({ top: 220, behavior: "smooth" });
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{lang === "eng" ? "Back to Stage 2" : "Kembali ke Tahap 2"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveDraft(true)}
                      disabled={isSavingDraft}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isSavingDraft ? (lang === "eng" ? "Saving..." : "Menyimpan...") : (p?.btnDraft || (lang === "eng" ? "Save Draft" : "Simpan Draft"))}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-75"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? (lang === "eng" ? "Submitting..." : "Mengirim...") : (p?.btnSubmit || (lang === "eng" ? "Submit Registration Now" : "Kirim Formulir Final"))}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT SIDEBAR (Sticky Live Summary - col-span-4) */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            {/* Live Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {p?.ringkasanTitle || (lang === "eng" ? "Application Summary" : "Ringkasan Pendaftaran")}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {user ? (lang === "eng" ? "Account Linked" : "Akun Terhubung") : (lang === "eng" ? "Direct Form" : "Pengisian Langsung")}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{p?.ringkasanJalur || (lang === "eng" ? "Track" : "Jalur")}:</span>
                  <strong className="text-slate-900 font-semibold">{tahap1.jalur_pendaftaran || "Reguler"}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{p?.ringkasanGelombang || (lang === "eng" ? "Wave" : "Gelombang")}:</span>
                  <strong className="text-slate-900 font-semibold">{selectedGelombang?.nama || "Gelombang 1"}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{p?.ringkasanProdi || (lang === "eng" ? "Study Program" : "Pilihan Prodi")}:</span>
                  <strong className="text-[#0d3830] font-semibold text-right max-w-[160px] truncate">
                    {selectedProdiName}
                  </strong>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{p?.ringkasanBiaya || (lang === "eng" ? "Registration Fee" : "Biaya Formulir")}:</span>
                  <strong className="text-sm font-bold font-mono text-[#0d3830]">
                    {isKipRegistration ? "Rp 0 (KIP)" : formatRupiah(totalRegistrationFee)}
                  </strong>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>{p?.ringkasanProgres || (lang === "eng" ? "Data Completion" : "Kelengkapan Data")}</span>
                  <span className="font-bold text-[#0d3830]">
                    {lang === "eng" ? `Stage ${currentStep} of 3` : `Tahap ${currentStep} dari 3`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0d3830] rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Compact Support / Hotline Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Headphones className="w-4 h-4 text-emerald-700" />
                <span>{p?.bantuanTitle || (lang === "eng" ? "Need Help Applying?" : "Butuh Bantuan Pendaftaran?")}</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {p?.bantuanSub || (lang === "eng" ? "The STAICI PMB committee is ready to assist you." : "Tim Panitia PMB STAICI siap mendampingi pengisian formulir Anda.")}
              </p>
              <a
                href="https://wa.me/6285233432221?text=Halo%20Panitia%20PMB%20STAICI,%20saya%20butuh%20bantuan%20pendaftaran"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-[#eef7f2] hover:bg-[#e2f2e9] text-[#0d3830] font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-emerald-200 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{p?.bantuanWa || (lang === "eng" ? "WhatsApp PMB Committee" : "WhatsApp Panitia PMB")}</span>
              </a>
              <span className="text-[10px] text-slate-400 block text-center">
                {p?.bantuanJam || (lang === "eng" ? "Monday - Saturday: 08:00 - 16:00 WIB" : "Senin - Sabtu: 08.00 - 16.00 WIB")}
              </span>
            </div>
          </aside>
        </div>
      </main>

      {/* 4. Footer Section */}
      <Footer />

      {/* MODAL: SUBMIT FINAL SUKSES */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-6 text-center flex flex-col items-center border border-slate-100 shadow-xl animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0d3830] flex items-center justify-center mb-3">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {lang === "eng" ? "Registration Submitted Successfully!" : "Pendaftaran Berhasil Dikirim!"}
            </h3>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl w-full my-3">
              <span className="text-xs text-slate-500 block">
                {lang === "eng" ? "PMB Registration Number:" : "Nomor Registrasi PMB:"}
              </span>
              <strong className="text-base font-extrabold font-mono text-[#0d3830]">{submittedNomor}</strong>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              {lang === "eng"
                ? "Your application has been stored in the PMB STAICI system. Open your Dashboard to check verification status and announcements."
                : "Formulir Anda telah tersimpan di sistem PMB STAICI Situbondo. Buka Dashboard untuk memantau status verifikasi berkas dan pengumuman."}
            </p>

            <div className="w-full space-y-2">
              <Link
                href="/dashboard"
                className="w-full py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl transition block"
              >
                {lang === "eng" ? "Open Student Dashboard" : "Buka Dashboard Mahasiswa"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal Integration */}
      <LoginModal
        isOpen={loginModalOpen}
        allowClose={true}
        onClose={() => setLoginModalOpen(false)}
        redirectTo="/pendaftaran"
        onSuccess={(loggedUser) => {
          loadUserPendaftarData(loggedUser);
          setLoginModalOpen(false);
        }}
      />
    </div>
  );
}
