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
  Download,
  Clock,
  Headphones,
  Building2,
  User,
  Star,
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
  Sparkles,
  Calendar,
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

// Master Standar Formulir Pendaftaran Kampus STAI Cendekia Insani Situbondo (Kemenag PD-PONTREN)
const PEKERJAAN_KAMPUS_LIST = [
  "Tidak bekerja",
  "Pensiunan",
  "PNS (Selain poin 5 dan 10)",
  "TNI/Polisi",
  "Guru/Dosen",
  "Pegawai Swasta",
  "Pengusaha/Wiraswasta",
  "Pengacara/Hakim/Jaksa/Notaris",
  "Seniman/Pelukis/Artis/Sejenis",
  "Dokter/Bidan/Perawat",
  "Pilot/Pramugari",
  "Pedagang",
  "Petani/Peternak",
  "Nelayan",
  "Buruh (tani/Pabrik/Bangunan)",
  "Sopir/Masinis/Kondektur",
  "Politikus",
  "Pengurus Rumah Tangga",
  "Lainnya",
];

const PENGHASILAN_KAMPUS_LIST = [
  "Di bawah Rp. 1.000.000",
  "Rp. 1.000.000 > Rp. 2.000.000",
  "Rp. 2.000.000 > Rp. 4.000.000",
  "Rp. 4.000.000 > Rp. 6.000.000",
  "Rp. 6.000.000 > Dst.",
  "Tidak Berpenghasilan",
];

export default function PendaftaranPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-500 font-bold">Memuat Formulir Pendaftaran PMB STAICI...</div>}>
      <PendaftaranFormContent />
    </Suspense>
  );
}

function PendaftaranFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jalurParam = searchParams.get("jalur");
  const { t, lang } = useLanguage();

  // Navigation & User State
  const [user, setUser] = useState<UserSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Stepper State (1: Prodi & Biodata, 2: Sekolah & Keluarga, 3: Berkas & Finalisasi)
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
    program_studi_id: "1", // default
    jalur_pendaftaran: "", // default kosong jika dari navbar, terisi jika ada ?jalur=...
    gelombang_id: "", // default kosong sampai dipilih atau auto-select gelombang aktif
    namaLengkap: "",
    nik: "",
    jenisKelamin: "Laki-laki" as "Laki-laki" | "Perempuan",
    tempatLahir: "",
    tanggalLahir: "",
    kewarganegaraan: "WNI (Warga Negara Indonesia)",
    negaraAsal: "",
    agama: "Islam",
    agamaLainnya: "",
    statusPernikahan: "Tidak Kawin" as "Tidak Kawin" | "Kawin" | "Duda" | "Janda",
    alamatDomisili: "",
    noWhatsapp: "",
    email: "",
  });

  // Tahap 2: Sekolah & Keluarga State & Tabs
  const [parentTab, setParentTab] = useState<"ayah" | "ibu">("ayah");
  const [livingWithParents, setLivingWithParents] = useState(true);

  const [tahap2, setTahap2] = useState({
    namaSekolah: "",
    statusSekolah: "Negeri" as "Negeri" | "Swasta" | "Pondok Pesantren / Salafiyah",
    jurusanSekolah: "IPA (Ilmu Pengetahuan Alam)",
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
    penghasilanAyah: "Rp2.000.000–4.000.000",
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
    penghasilanIbu: "di bawah Rp1.000.000",
    noHpIbu: "",

    // Wali & Kontak
    namaWali: "",
    nikWali: "",
    hubunganWali: "Paman / Bibi",
    pendidikanWali: "SMA / MA / SMK / Sederajat",
    pekerjaanWali: "Wiraswasta / Pengusaha",
    pekerjaanWaliLainnya: "",
    penghasilanWali: "Rp2.000.000–4.000.000",
    alamatWali: "",
    noHpWali: "",
    noHpOrangTuaWali: "",
  });

  // Tahap 3: Berkas & Bukti Pembayaran State
  const [berkasFiles, setBerkasFiles] = useState<Record<string, File | null>>({});
  const [uploadedBerkasNames, setUploadedBerkasNames] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Fallback & Jalur Pendaftaran Memo
  const displayedJalurList = useMemo(() => {
    if (masterJalurList.length > 0) return masterJalurList;
    return [
      {
        id: 1,
        kode: "reguler",
        nama: "Jalur Reguler (Mandiri)",
        badge_text: "Reguler",
        deskripsi:
          "Terbuka untuk seluruh lulusan SMA/MA/SMK sederajat tanpa batas tahun kelulusan. Seleksi administrasi dan wawancara.",
        syarat_khusus: "Ijazah/SKL SLTA Sederajat & Biaya Pendaftaran",
        bebas_biaya: false,
      },
      {
        id: 2,
        kode: "kip-kuliah",
        nama: "Jalur Beasiswa KIP-Kuliah",
        badge_text: "Beasiswa KIP-K",
        deskripsi:
          "Program beasiswa pemerintah bebas biaya perkuliahan bagi calon mahasiswa berprestasi dari keluarga prasejahtera.",
        syarat_khusus: "Memiliki KIP / Terdaftar di DTKS Kemensos RI",
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

  // Fallback & Active Gelombang Memo
  const displayedGelombangList = useMemo(() => {
    if (masterGelombangList.length > 0) return masterGelombangList;
    return [
      {
        id: 1,
        nama: "Gelombang 1 Reguler - TA 2026/2027",
        tahun_akademik: "2026/2027",
        tanggal_buka: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        tanggal_tutup: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
        biaya_pendaftaran: 250000,
        kuota: 150,
        is_aktif: true,
      },
      {
        id: 2,
        nama: "Gelombang 2 Reguler - TA 2026/2027",
        tahun_akademik: "2026/2027",
        tanggal_buka: new Date(Date.now() + 61 * 24 * 3600 * 1000).toISOString(),
        tanggal_tutup: new Date(Date.now() + 120 * 24 * 3600 * 1000).toISOString(),
        biaya_pendaftaran: 300000,
        kuota: 100,
        is_aktif: true,
      },
      {
        id: 3,
        nama: "Gelombang 3 Terakhir - TA 2026/2027",
        tahun_akademik: "2026/2027",
        tanggal_buka: new Date(Date.now() + 121 * 24 * 3600 * 1000).toISOString(),
        tanggal_tutup: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
        biaya_pendaftaran: 350000,
        kuota: 50,
        is_aktif: false,
      },
    ];
  }, [masterGelombangList]);

  // Helper evaluasi status gelombang (Admin Aktif + Validasi Tanggal)
  const getGelombangStatus = (g: any) => {
    const now = new Date();
    const startDate = new Date(g.tanggal_buka);
    const endDate = new Date(g.tanggal_tutup);
    endDate.setHours(23, 59, 59, 999);

    const isUpcoming = now < startDate;
    const isExpired = now > endDate;
    const isPeriodActive = now >= startDate && now <= endDate;
    const isAvailable = Boolean(g.is_aktif) && isPeriodActive;

    let badge = {
      label: "🟢 Pendaftaran Dibuka",
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      note: "Pendaftaran sedang berlangsung",
    };

    if (!g.is_aktif) {
      badge = {
        label: "🔒 Dinonaktifkan Panitia",
        bgClass: "bg-slate-100 text-slate-500 border-slate-200",
        note: "Gelombang ini ditutup sementara oleh panitia PMB",
      };
    } else if (isUpcoming) {
      badge = {
        label: `⏳ Belum Dibuka`,
        bgClass: "bg-amber-50 text-amber-700 border-amber-200",
        note: `Pendaftaran baru dibuka pada ${formatDateIndo(g.tanggal_buka)}`,
      };
    } else if (isExpired) {
      badge = {
        label: "🔒 Ditutup (Selesai)",
        bgClass: "bg-rose-50 text-rose-600 border-rose-200",
        note: `Periode pendaftaran berakhir pada ${formatDateIndo(g.tanggal_tutup)}`,
      };
    }

    return {
      isAvailable,
      isUpcoming,
      isExpired,
      badge,
    };
  };

  // Auto-select Gelombang Pertama yang Aktif & Buka jika belum ada pilihan
  useEffect(() => {
    if (!tahap1.gelombang_id && displayedGelombangList.length > 0) {
      const now = new Date();
      const activeGel = displayedGelombangList.find((g) => {
        const start = new Date(g.tanggal_buka);
        const end = new Date(g.tanggal_tutup);
        end.setHours(23, 59, 59, 999);
        return g.is_aktif && now >= start && now <= end;
      });
      if (activeGel) {
        setTahap1((prev) => ({ ...prev, gelombang_id: String(activeGel.id) }));
      }
    }
  }, [displayedGelombangList, tahap1.gelombang_id]);

  // Exact Step Completion Checkers (Fix Stepper Checkmark Bug)
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
              statusSekolah: (p.status_sekolah as any) || prev.statusSekolah,
              jurusanSekolah: p.jurusan_sekolah || prev.jurusanSekolah,
              nilaiRataRata: String(p.nilai_rata_rata || prev.nilaiRataRata),
              tahunLulus: String(p.tahun_lulus || prev.tahunLulus),
            }));
          }
          if (p.data_orang_tua) {
            const ot = p.data_orang_tua;
            setTahap2((prev) => ({
              ...prev,
              namaAyah: ot.nama_ayah || prev.namaAyah,
              nikAyah: ot.nik_ayah || prev.nikAyah,
              kkAyah: ot.kk_ayah || prev.kkAyah,
              tempatLahirAyah: ot.tempat_lahir_ayah || prev.tempatLahirAyah,
              tanggalLahirAyah: ot.tanggal_lahir_ayah ? ot.tanggal_lahir_ayah.split("T")[0] : prev.tanggalLahirAyah,
              alamatAyah: ot.alamat_ayah || prev.alamatAyah,
              pendidikanAyah: ot.pendidikan_ayah || prev.pendidikanAyah,
              pekerjaanAyah: ot.pekerjaan_ayah || prev.pekerjaanAyah,
              penghasilanAyah: ot.penghasilan_ayah || prev.penghasilanAyah,

              namaIbu: ot.nama_ibu || prev.namaIbu,
              nikIbu: ot.nik_ibu || prev.nikIbu,
              kkIbu: ot.kk_ibu || prev.kkIbu,
              tempatLahirIbu: ot.tempat_lahir_ibu || prev.tempatLahirIbu,
              tanggalLahirIbu: ot.tanggal_lahir_ibu ? ot.tanggal_lahir_ibu.split("T")[0] : prev.tanggalLahirIbu,
              alamatIbu: ot.alamat_ibu || prev.alamatIbu,
              pendidikanIbu: ot.pendidikan_ibu || prev.pendidikanIbu,
              pekerjaanIbu: ot.pekerjaan_ibu || prev.pekerjaanIbu,
              penghasilanIbu: ot.penghasilan_ibu || prev.penghasilanIbu,

              namaWali: ot.nama_wali || prev.namaWali,
              alamatWali: ot.alamat_wali || prev.alamatWali,
              noHpOrangTuaWali: ot.no_hp_orang_tua_wali || prev.noHpOrangTuaWali,
            }));
          }
          if (p.berkas && p.berkas.length > 0) {
            const map: Record<string, string> = {};
            p.berkas.forEach((b: any) => {
              map[b.jenis_dokumen.toLowerCase()] = b.file_name;
            });
            setUploadedBerkasNames(map);
          }
        }
      } catch {
        setUser(null);
        setLoginModalOpen(true);
      }
    } else {
      setUser(null);
      setIsCheckingAuth(false);
      setLoginModalOpen(true);
    }
  };

  // Load User Data & Fetch Dynamic Master PMB (Prodi, Rekening, Dokumen, Hotline)
  useEffect(() => {
    loadUserPendaftarData();

    // Fetch Dynamic Master PMB
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

  // Save Step Data to Database on Proceed or Manual Draft Save
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
          const finalJurusan = (tahap2.jurusanSekolah === "Lainnya" || tahap2.jurusanSekolah === "Kejuruan (SMK)") && tahap2.jurusanSekolahLainnya
            ? `${tahap2.jurusanSekolah} - ${tahap2.jurusanSekolahLainnya}`
            : tahap2.jurusanSekolah;

          await api.put("/pendaftar/asal-sekolah", {
            nama_sekolah: tahap2.namaSekolah,
            status_sekolah: tahap2.statusSekolah,
            jurusan_sekolah: finalJurusan,
            nilai_rata_rata: parseFloat(tahap2.nilaiRataRata) || 80,
            tahun_lulus: parseInt(tahap2.tahunLulus) || 2026,
          });
        }
        if ((tahap2.namaAyah || tahap2.statusAyah === "meninggal") && (tahap2.namaIbu || tahap2.statusIbu === "meninggal")) {
          const finalPekerjaanAyah = tahap2.statusAyah === "meninggal"
            ? "Almarhum"
            : tahap2.pekerjaanAyah === "Lainnya" && tahap2.pekerjaanAyahLainnya
            ? `Lainnya: ${tahap2.pekerjaanAyahLainnya}`
            : tahap2.pekerjaanAyah;

          const finalPekerjaanIbu = tahap2.statusIbu === "meninggal"
            ? "Almarhumah"
            : tahap2.pekerjaanIbu === "Lainnya" && tahap2.pekerjaanIbuLainnya
            ? `Lainnya: ${tahap2.pekerjaanIbuLainnya}`
            : tahap2.pekerjaanIbu;

          await api.put("/pendaftar/orang-tua", {
            nama_ayah: tahap2.statusAyah === "meninggal" ? (tahap2.namaAyah || "Almarhum") : tahap2.namaAyah,
            nik_ayah: tahap2.statusAyah === "meninggal" ? (tahap2.nikAyah || tahap1.nik) : (tahap2.nikAyah || tahap1.nik),
            kk_ayah: tahap2.kkAyah || "3512000000000000",
            tempat_lahir_ayah: tahap2.tempatLahirAyah || tahap1.tempatLahir,
            tanggal_lahir_ayah: tahap2.tanggalLahirAyah || "1975-01-01",
            alamat_ayah: tahap2.alamatAyah || tahap1.alamatDomisili,
            pendidikan_ayah: tahap2.pendidikanAyah,
            pekerjaan_ayah: finalPekerjaanAyah,
            penghasilan_ayah: tahap2.statusAyah === "meninggal" ? "Tidak Berpenghasilan" : tahap2.penghasilanAyah,

            nama_ibu: tahap2.statusIbu === "meninggal" ? (tahap2.namaIbu || "Almarhumah") : tahap2.namaIbu,
            nik_ibu: tahap2.statusIbu === "meninggal" ? (tahap2.nikIbu || tahap1.nik) : (tahap2.nikIbu || tahap1.nik),
            kk_ibu: tahap2.kkIbu || tahap2.kkAyah || "3512000000000000",
            tempat_lahir_ibu: tahap2.tempatLahirIbu || tahap1.tempatLahir,
            tanggal_lahir_ibu: tahap2.tanggalLahirIbu || "1978-01-01",
            alamat_ibu: tahap2.alamatIbu || tahap1.alamatDomisili,
            pendidikan_ibu: tahap2.pendidikanIbu,
            pekerjaan_ibu: finalPekerjaanIbu,
            penghasilan_ibu: tahap2.statusIbu === "meninggal" ? "Tidak Berpenghasilan" : tahap2.penghasilanIbu,

            nama_wali: tahap2.namaWali,
            alamat_wali: tahap2.alamatWali,
            no_hp_orang_tua_wali: tahap2.noHpOrangTuaWali || tahap2.noHpAyah || tahap2.noHpIbu || tahap1.noWhatsapp,
          });
        }

        if (showSuccessAlert) {
          setNotification({
            type: "success",
            message: lang === "eng"
              ? "Registration draft saved successfully! You can resume filling at any time."
              : "Draft formulir pendaftaran berhasil disimpan ke sistem! Anda dapat melanjutkan pengisian kapan saja.",
          });
        }
      } catch (err: any) {
        if (showSuccessAlert) {
          setNotification({
            type: "error",
            message: err.message || (lang === "eng" ? "Failed to save draft." : "Gagal menyimpan draft."),
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
          message: lang === "eng" ? "Please sign in to save draft to your account." : "Silakan masuk akun terlebih dahulu agar draft tersimpan ke sistem.",
        });
      }
    }
  };

  const handleSaveDraftManual = async () => {
    await handleSaveDraft(true);
  };

  // Step 1 Validation & Proceed
  const handleProceedStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!tahap1.jalur_pendaftaran) {
      setNotification({
        type: "error",
        message: lang === "eng" ? "Please select a registration pathway (Jalur Pendaftaran)." : "Silakan pilih salah satu Jalur Pendaftaran terlebih dahulu.",
      });
      window.scrollTo({ top: 380, behavior: "smooth" });
      return;
    }
    if (!tahap1.gelombang_id) {
      setNotification({
        type: "error",
        message: lang === "eng" ? "Please select an active registration wave (Gelombang)." : "Silakan pilih salah satu Gelombang Pendaftaran yang aktif terlebih dahulu.",
      });
      window.scrollTo({ top: 380, behavior: "smooth" });
      return;
    }
    if (!tahap1.namaLengkap.trim()) {
      setNotification({ type: "error", message: lang === "eng" ? "Full name is required." : "Nama lengkap harus diisi." });
      return;
    }
    if (tahap1.nik.trim().length !== 16) {
      setNotification({ type: "error", message: lang === "eng" ? "National ID (NIK) must be 16 numeric digits." : "NIK wajib 16 digit numerik sesuai KTP/KK." });
      return;
    }
    if (!tahap1.tempatLahir.trim() || !tahap1.tanggalLahir) {
      setNotification({ type: "error", message: lang === "eng" ? "Place and date of birth are required." : "Tempat dan tanggal lahir wajib diisi." });
      return;
    }
    if (!tahap1.alamatDomisili.trim()) {
      setNotification({ type: "error", message: lang === "eng" ? "Current residential address is required." : "Alamat domisili tempat tinggal sekarang wajib diisi." });
      return;
    }
    if (!tahap1.noWhatsapp.trim() || !tahap1.email.trim()) {
      setNotification({ type: "error", message: lang === "eng" ? "Active WhatsApp number and Email are required." : "Nomor WhatsApp dan Email aktif wajib diisi." });
      return;
    }

    handleSaveDraft(false);
    setCurrentStep(2);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  // Step 2 Validation & Proceed
  const handleProceedStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!tahap2.namaSekolah.trim()) {
      setNotification({ type: "error", message: lang === "eng" ? "School name is required." : "Nama asal sekolah wajib diisi." });
      return;
    }
    if (tahap2.statusAyah === "hidup" && !tahap2.namaAyah.trim()) {
      setNotification({ type: "error", message: lang === "eng" ? "Father's name is required." : "Nama Ayah kandung wajib diisi." });
      return;
    }
    if (tahap2.statusIbu === "hidup" && !tahap2.namaIbu.trim()) {
      setNotification({ type: "error", message: lang === "eng" ? "Mother's name is required." : "Nama Ibu kandung wajib diisi." });
      return;
    }

    handleSaveDraft(false);
    setCurrentStep(3);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  // Step 3 File Selection
  const handleFileChange = (key: string, file: File | null) => {
    if (file && file.size > 2 * 1024 * 1024) {
      alert(lang === "eng" ? `File ${file.name} exceeds maximum 2 MB limit.` : `File ${file.name} melebihi batas maksimal 2 MB.`);
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
        message: lang === "eng"
          ? "You must accept the data validity agreement to proceed."
          : "Anda harus menyetujui pernyataan keabsahan data untuk submit final.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let token = authStorage.getToken();
      if (!token) {
        setNotification({
          type: "error",
          message: lang === "eng" ? "Please sign in to submit your registration form." : "Silakan login terlebih dahulu untuk men-submit formulir.",
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

      const finalJurusan = (tahap2.jurusanSekolah === "Lainnya" || tahap2.jurusanSekolah === "Kejuruan (SMK)") && tahap2.jurusanSekolahLainnya
        ? `${tahap2.jurusanSekolah} - ${tahap2.jurusanSekolahLainnya}`
        : tahap2.jurusanSekolah;

      await api.put("/pendaftar/asal-sekolah", {
        nama_sekolah: tahap2.namaSekolah,
        status_sekolah: tahap2.statusSekolah,
        jurusan_sekolah: finalJurusan,
        nilai_rata_rata: parseFloat(tahap2.nilaiRataRata) || 85,
        tahun_lulus: parseInt(tahap2.tahunLulus) || 2026,
      });

      const finalPekerjaanAyah = tahap2.statusAyah === "meninggal"
        ? "Almarhum"
        : tahap2.pekerjaanAyah === "Lainnya" && tahap2.pekerjaanAyahLainnya
        ? `Lainnya: ${tahap2.pekerjaanAyahLainnya}`
        : tahap2.pekerjaanAyah;

      const finalPekerjaanIbu = tahap2.statusIbu === "meninggal"
        ? "Almarhumah"
        : tahap2.pekerjaanIbu === "Lainnya" && tahap2.pekerjaanIbuLainnya
        ? `Lainnya: ${tahap2.pekerjaanIbuLainnya}`
        : tahap2.pekerjaanIbu;

      await api.put("/pendaftar/orang-tua", {
        nama_ayah: tahap2.statusAyah === "meninggal" ? (tahap2.namaAyah || "Almarhum") : tahap2.namaAyah,
        nik_ayah: tahap2.statusAyah === "meninggal" ? (tahap2.nikAyah || tahap1.nik) : (tahap2.nikAyah || tahap1.nik),
        kk_ayah: tahap2.kkAyah || "3512000000000000",
        tempat_lahir_ayah: tahap2.tempatLahirAyah || tahap1.tempatLahir,
        tanggal_lahir_ayah: tahap2.tanggalLahirAyah || "1975-01-01",
        alamat_ayah: tahap2.alamatAyah || tahap1.alamatDomisili,
        pendidikan_ayah: tahap2.pendidikanAyah,
        pekerjaan_ayah: finalPekerjaanAyah,
        penghasilan_ayah: tahap2.statusAyah === "meninggal" ? "Tidak Berpenghasilan" : tahap2.penghasilanAyah,

        nama_ibu: tahap2.statusIbu === "meninggal" ? (tahap2.namaIbu || "Almarhumah") : tahap2.namaIbu,
        nik_ibu: tahap2.statusIbu === "meninggal" ? (tahap2.nikIbu || tahap1.nik) : (tahap2.nikIbu || tahap1.nik),
        kk_ibu: tahap2.kkIbu || tahap2.kkAyah || "3512000000000000",
        tempat_lahir_ibu: tahap2.tempatLahirIbu || tahap1.tempatLahir,
        tanggal_lahir_ibu: tahap2.tanggalLahirIbu || "1978-01-01",
        alamat_ibu: tahap2.alamatIbu || tahap1.alamatDomisili,
        pendidikan_ibu: tahap2.pendidikanIbu,
        pekerjaan_ibu: finalPekerjaanIbu,
        penghasilan_ibu: tahap2.statusIbu === "meninggal" ? "Tidak Berpenghasilan" : tahap2.penghasilanIbu,

        nama_wali: tahap2.namaWali,
        alamat_wali: tahap2.alamatWali,
        no_hp_orang_tua_wali: tahap2.noHpOrangTuaWali || tahap2.noHpAyah || tahap2.noHpIbu || tahap1.noWhatsapp,
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
      localStorage.removeItem("pmb_form_draft");
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || (lang === "eng" ? "Failed to submit registration form. Please try again." : "Gagal mengirim formulir pendaftaran. Silakan coba lagi."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Active Dynamic Data Helpers with Fallbacks
  const activeProdiList = masterProdis.length > 0
    ? masterProdis.map((p) => ({
        id: String(p.id),
        kode: p.kode || p.nama.replace(/^(S1\s+|Program Studi\s+)/i, "").substring(0, 4).toUpperCase(),
        jenjang: p.jenjang || "S1",
        title: p.nama,
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      }))
    : [
        { id: "1", kode: "MPI", jenjang: "S1", badgeColor: "bg-amber-100 text-amber-800 border-amber-200", title: lang === "eng" ? "Islamic Education Management (MPI)" : "S1 Manajemen Pendidikan Islam" },
        { id: "2", kode: "AS", jenjang: "S1", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200", title: lang === "eng" ? "Islamic Family Law (HKI)" : "S1 Ahwal Al-Syakhsiyah (HKI)" },
        { id: "3", kode: "KPI", jenjang: "S1", badgeColor: "bg-teal-100 text-teal-800 border-teal-200", title: lang === "eng" ? "Islamic Communication & Broadcasting (KPI)" : "S1 Komunikasi Penyiaran Islam" },
      ];

  const activeDocs = masterPersyaratanDocs.length > 0
    ? masterPersyaratanDocs.map((d) => {
        const key = d.kode ? d.kode.toLowerCase() : d.nama_dokumen.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const isPhoto = d.nama_dokumen.toLowerCase().includes("foto");
        return {
          key,
          label: d.nama_dokumen,
          desc: d.deskripsi || (d.is_wajib ? (lang === "eng" ? "Required for document verification." : "Wajib diunggah untuk verifikasi keabsahan data.") : (lang === "eng" ? "Optional supporting document." : "Dokumen pendukung (opsional).")),
          wajib: d.is_wajib ?? true,
          isPhoto,
          accept: isPhoto ? ".jpg,.jpeg,.png,.webp" : ".jpg,.jpeg,.png,.pdf",
        };
      })
    : [
        {
          key: "ijazah",
          label: lang === "eng" ? "Diploma / Graduation Certificate" : "Ijazah / SKL Asli",
          desc: lang === "eng" ? "Official graduation certificate or scanned original diploma." : "Surat Keterangan Lulus (SKL) berstempel resmi atau scan Ijazah asli.",
          wajib: true,
          isPhoto: false,
          accept: ".jpg,.jpeg,.png,.pdf",
        },
        {
          key: "kk",
          label: lang === "eng" ? "Family Card (KK)" : "Kartu Keluarga (KK)",
          desc: lang === "eng" ? "Recent scanned Family Card with official barcode or signature." : "Pindaian KK terbaru yang memuat barcode / tanda tangan dinas Dukcapil.",
          wajib: true,
          isPhoto: false,
          accept: ".jpg,.jpeg,.png,.pdf",
        },
        {
          key: "ktp",
          label: lang === "eng" ? "National ID Card / Birth Certificate" : "KTP / Akta Kelahiran",
          desc: lang === "eng" ? "Scanned National ID Card (e-KTP) or official Birth Certificate." : "Scan e-KTP calon mahasiswa atau scan Akta Kelahiran resmi.",
          wajib: true,
          isPhoto: false,
          accept: ".jpg,.jpeg,.png,.pdf",
        },
        {
          key: "foto",
          label: lang === "eng" ? "Formal Photo (3x4)" : "Pas Foto 3x4 Latar Merah",
          desc: lang === "eng" ? "Formal color photo with plain red background." : "Formal berkemeja / jas, berpakaian sopan dan berlatar belakang merah.",
          wajib: true,
          isPhoto: true,
          accept: ".jpg,.jpeg,.png,.webp",
        },
        {
          key: "kip",
          label: lang === "eng" ? "KIP / Smart Indonesia Card (Optional)" : "Kartu KIP / KIP-Kuliah (Opsional)",
          desc: lang === "eng" ? "Specifically for KIP-Kuliah scholarship applicants." : "Khusus pendaftar skema bantuan beasiswa KIP Kuliah Kemenag.",
          wajib: false,
          isPhoto: false,
          accept: ".jpg,.jpeg,.png,.pdf",
        },
        {
          key: "rekomendasi",
          label: lang === "eng" ? "Recommendation / Achievement Certificate" : "Sertifikat Prestasi / Rekomendasi (Opsional)",
          desc: lang === "eng" ? "Tahfidz certificate, academic awards, or recommendation letter." : "Piagam Tahfidz Al-Qur'an, Juara Lomba, atau Surat Rekomendasi.",
          wajib: false,
          isPhoto: false,
          accept: ".jpg,.jpeg,.png,.pdf",
        },
      ];

  const activeRekenings = masterRekeningList.length > 0
    ? masterRekeningList
    : [
        {
          id: 1,
          nama_bank: "Bank Syariah Indonesia (BSI)",
          nomor_rekening: "7123 4567 89",
          atas_nama: "PMB STAI Cendekia Insani",
          cabang: "KCP Situbondo",
          instruksi_transfer: "Transfer melalui BSI Mobile / ATM Bersama dengan memasukkan kode bank 451 diikuti nomor rekening.",
          is_utama: true,
        },
        {
          id: 2,
          nama_bank: "Bank Mandiri",
          nomor_rekening: "144 00 2345678 9",
          atas_nama: "KAS PMB STAICI SITUBONDO",
          cabang: "KC Situbondo",
          instruksi_transfer: "Transfer melalui Livin' Mandiri, ATM Mandiri, atau seluruh jaringan ATM Bersama ke rekening kampus.",
          is_utama: false,
        },
      ];

  const isKipRegistration = Boolean(tahap1.jalur_pendaftaran?.toLowerCase().includes("kip"));
  const selectedGelombang = displayedGelombangList.find(
    (g) => String(g.id) === String(tahap1.gelombang_id)
  );
  const totalRegistrationFee = isKipRegistration
    ? 0
    : (selectedGelombang?.biaya_pendaftaran ?? 250000);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
      {/* 1. Header / Navbar */}
      <Navbar activePage="pendaftaran" />

      {/* 2. Hero / Banner Section */}
      <section className="relative w-full min-h-[220px] sm:min-h-[260px] flex items-center overflow-hidden bg-[#0c2f29]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/banner.png"
            alt="Gedung Kampus STAI Cendekia Insani Situbondo"
            fill
            priority
            className="object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a2f28]/95 via-[#0e3b33]/90 to-[#07241e]/85 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200/90 mb-3">
            <Home className="w-3.5 h-3.5" />
            <Link href="/" className="hover:underline">{t.navbar.beranda}</Link>
            <span>/</span>
            <Link href="/#program-studi" className="hover:underline">{t.navbar.programStudi}</Link>
            <span>/</span>
            <span className="text-white">
              {lang === "eng" ? "Online Admission PMB 2026/2027" : "Pendaftaran Online PMB 2026/2027"}
            </span>
          </nav>

          {/* Badge Gelombang */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#144d42]/80 text-emerald-200 border border-emerald-500/40 mb-3 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
            {t.hero.title}
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm md:text-base text-emerald-100/90 font-medium max-w-3xl leading-relaxed">
            {t.hero.subtitle}
          </p>
        </div>
      </section>

      {/* 3. Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex-1">
        {/* If user is not authenticated, show a prominent login prompt requirement banner */}
        {!user && !isCheckingAuth && (
          <div className="mb-8 p-6 sm:p-8 bg-amber-50/90 border-2 border-amber-200/80 rounded-2xl shadow-sm text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  {lang === "eng" ? "PMB Account Required to Apply" : "Wajib Masuk / Daftar Akun Terlebih Dahulu"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">
                  {lang === "eng"
                    ? "To complete your admission application and submit required documents, you must sign in with your PMB account."
                    : "Untuk mengisi formulir pendaftaran mahasiswa baru dan mengunggah berkas, Anda harus masuk dengan akun PMB terlebih dahulu agar data tersimpan aman."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#0e3831] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
            >
              <span>{lang === "eng" ? "Sign In / Register Account" : "Masuk / Buat Akun PMB"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: MAIN FORM WIZARD */}
          <div className="lg:col-span-8 space-y-6">
            {/* 3-STEP STEPPER HEADER CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-sm">
              <div className="grid grid-cols-3 gap-2">
                {/* Step 1 */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 380, behavior: "smooth" });
                  }}
                  className={`p-3 sm:p-4 rounded-xl flex items-center gap-3 text-left transition cursor-pointer ${
                    currentStep === 1
                      ? "bg-[#eef6f3] border border-emerald-200 shadow-2xs"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 transition-colors ${
                      isStep1Valid
                        ? "bg-emerald-600 text-white"
                        : currentStep === 1
                        ? "bg-[#0d3830] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isStep1Valid ? <Check className="w-5 h-5 stroke-[2.5]" /> : "1"}
                  </div>
                  <div className="truncate">
                    <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${
                      currentStep === 1 ? "text-amber-700" : isStep1Valid ? "text-emerald-700" : "text-slate-400"
                    }`}>
                      {currentStep === 1 ? (lang === "eng" ? "CURRENT STAGE" : "TAHAP SEKARANG") : isStep1Valid ? (lang === "eng" ? "COMPLETED" : "SELESAI") : (lang === "eng" ? "STAGE 1" : "TAHAP 1")}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {lang === "eng" ? "Study Program & Identity" : "Prodi & Biodata Diri"}
                    </h4>
                    <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:block truncate">
                      {lang === "eng" ? "Program choice & National ID" : "Pilihan studi & NIK EMIS"}
                    </span>
                  </div>
                </button>

                {/* Step 2 */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 380, behavior: "smooth" });
                  }}
                  className={`p-3 sm:p-4 rounded-xl flex items-center gap-3 text-left transition cursor-pointer ${
                    currentStep === 2
                      ? "bg-[#eef6f3] border border-emerald-200 shadow-2xs"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 transition-colors ${
                      isStep2Valid
                        ? "bg-emerald-600 text-white"
                        : currentStep === 2
                        ? "bg-[#0d3830] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isStep2Valid ? <Check className="w-5 h-5 stroke-[2.5]" /> : "2"}
                  </div>
                  <div className="truncate">
                    <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${
                      currentStep === 2 ? "text-amber-700" : isStep2Valid ? "text-emerald-700" : "text-slate-400"
                    }`}>
                      {currentStep === 2 ? (lang === "eng" ? "CURRENT STAGE" : "TAHAP SEKARANG") : isStep2Valid ? (lang === "eng" ? "COMPLETED" : "SELESAI") : (lang === "eng" ? "STAGE 2" : "TAHAP 2")}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {lang === "eng" ? "School & Family" : "Sekolah & Keluarga"}
                    </h4>
                    <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:block truncate">
                      {lang === "eng" ? "High School & Parents Data" : "Data SMA/MA & Orang Tua"}
                    </span>
                  </div>
                </button>

                {/* Step 3 */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3);
                    window.scrollTo({ top: 380, behavior: "smooth" });
                  }}
                  className={`p-3 sm:p-4 rounded-xl flex items-center gap-3 text-left transition cursor-pointer ${
                    currentStep === 3
                      ? "bg-[#eef6f3] border border-emerald-200 shadow-2xs"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 transition-colors ${
                      currentStep === 3
                        ? "bg-[#0d3830] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    3
                  </div>
                  <div className="truncate">
                    <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${
                      currentStep === 3 ? "text-amber-700" : "text-slate-400"
                    }`}>
                      {currentStep === 3 ? (lang === "eng" ? "CURRENT STAGE" : "TAHAP SEKARANG") : (lang === "eng" ? "STAGE 3" : "TAHAP 3")}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {lang === "eng" ? "Documents & Bank Transfer" : "Berkas & NoRek Resmi"}
                    </h4>
                    <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:block truncate">
                      {lang === "eng" ? "Diploma, Transfer & Submit" : "Ijazah, NoRek & Submit Final"}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Notification Alert Banner */}
            {notification && (
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center gap-3 animate-fadeIn ${
                  notification.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : notification.type === "error"
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-blue-50 border-blue-200 text-blue-900"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                )}
                <span>{notification.message}</span>
              </div>
            )}

            {/* ================= STAGE 1: IDENTITAS LENGKAP ================= */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {lang === "eng" ? "Applicant Identity & Biodata" : "Identitas Lengkap Calon Mahasiswa"}
                  </h2>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#0d3830] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                {/* EMIS Info Banner */}
                <div className="bg-[#eef4ff] border border-blue-200/90 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm text-slate-700 shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-bold text-xs">i</span>
                  </div>
                  <p className="leading-relaxed">
                    {lang === "eng"
                      ? "Ensure that all entered data is valid and corresponds to your Family Card (KK) / National ID Card and last Diploma for seamless synchronization with PDDIKTI and Ministry of Religious Affairs (EMIS)."
                      : "Pastikan data yang Anda isikan valid dan sesuai dengan Kartu Keluarga (KK) / e-KTP serta Ijazah Terakhir untuk kelancaran sinkronisasi pelaporan PDDIKTI dan EMIS Kemenag RI."}
                  </p>
                </div>

                {/* Form Inputs */}
                <form onSubmit={handleProceedStep1} className="space-y-6 text-xs sm:text-sm">
                  {/* ================= 1. PILIHAN JALUR PENDAFTARAN (CARD) ================= */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                        <BookOpen className="w-4 h-4 text-[#0d3830]" />
                        <span>{lang === "eng" ? "Registration Pathway" : "Jalur Pendaftaran"}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {lang === "eng" ? "Choose your entry pathway" : "Pilih salah satu jalur masuk"}
                      </span>
                    </div>

                    {!tahap1.jalur_pendaftaran && (
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                        <span>Silakan pilih salah satu jalur pendaftaran di bawah ini untuk mengaktifkan formulir pendaftaran.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {displayedJalurList.map((jalur: any) => {
                        const isSelected = isJalurSelected(jalur);
                        const isKip =
                          (jalur.kode || "").toLowerCase().includes("kip") ||
                          (jalur.nama || "").toLowerCase().includes("kip");

                        return (
                          <div
                            key={jalur.id || jalur.kode}
                            onClick={() => handleSelectJalur(jalur)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative text-left ${
                              isSelected
                                ? "border-[#0d3830] bg-[#eef6f3] shadow-xs ring-2 ring-[#0d3830]/20"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      isSelected
                                        ? "bg-[#0d3830] text-white"
                                        : isKip
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-emerald-100 text-[#0d3830]"
                                    }`}
                                  >
                                    {isKip ? <GraduationCap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                      isSelected
                                        ? "bg-[#0d3830] text-white border-[#0d3830]"
                                        : isKip
                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    }`}
                                  >
                                    {jalur.badge_text || (isKip ? "Beasiswa KIP-K" : "Mandiri")}
                                  </span>
                                </div>
                                {isSelected ? (
                                  <span className="w-5 h-5 rounded-full bg-[#0d3830] text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                                )}
                              </div>

                              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                {jalur.nama}
                              </h3>
                              <p className="text-[12px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                {jalur.deskripsi}
                              </p>
                            </div>

                            <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">Skema Biaya:</span>
                              <span className={`font-bold ${isKip ? "text-amber-700 font-semibold" : "text-emerald-700"}`}>
                                {isKip ? "Gratis (Bebas Biaya Kuliah)" : "Sesuai Tarif Gelombang"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ================= 2. PILIHAN GELOMBANG PENDAFTARAN (CARD) ================= */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                        <Calendar className="w-4 h-4 text-[#0d3830]" />
                        <span>{lang === "eng" ? "Admission Wave (Gelombang)" : "Gelombang Pendaftaran"}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {lang === "eng" ? "Active period only" : "Gelombang aktif dapat langsung dipilih"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {displayedGelombangList.map((gel: any) => {
                        const status = getGelombangStatus(gel);
                        const isSelected = String(tahap1.gelombang_id) === String(gel.id);
                        const isKip = tahap1.jalur_pendaftaran?.toLowerCase().includes("kip");

                        return (
                          <div
                            key={gel.id}
                            onClick={() => {
                              if (status.isAvailable) {
                                setTahap1({ ...tahap1, gelombang_id: String(gel.id) });
                              }
                            }}
                            className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between relative ${
                              isSelected
                                ? "border-[#0d3830] bg-[#eef6f3] shadow-xs ring-2 ring-[#0d3830]/20"
                                : status.isAvailable
                                ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs cursor-pointer"
                                : "border-slate-200 bg-slate-50/80 opacity-60 cursor-not-allowed"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1.5 mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${status.badge.bgClass}`}>
                                  {status.badge.label}
                                </span>
                                {isSelected ? (
                                  <span className="w-4 h-4 rounded-full bg-[#0d3830] text-white flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </span>
                                ) : status.isAvailable ? (
                                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                                ) : null}
                              </div>

                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight line-clamp-2">
                                {gel.nama}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{formatDateIndo(gel.tanggal_buka)} &ndash; {formatDateIndo(gel.tanggal_tutup)}</span>
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">Biaya Formulir:</span>
                              <span className="font-bold text-slate-900">
                                {isKip ? (
                                  <span className="text-amber-700">Rp 0 (KIP)</span>
                                ) : (
                                  formatRupiah(gel.biaya_pendaftaran || 250000)
                                )}
                              </span>
                            </div>

                            {!status.isAvailable && (
                              <p className="text-[10px] text-slate-400 italic mt-1.5 leading-tight">
                                * {status.badge.note}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ================= 3. PILIHAN PROGRAM STUDI (DINAMIS) ================= */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-800 block">
                        {lang === "eng" ? "Choice of Study Program" : "Pilihan Program Studi"} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {lang === "eng" ? "Choose 1 accredited program" : "Pilih 1 program studi terakreditasi"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {activeProdiList.map((prodi) => {
                        const isSelected = String(tahap1.program_studi_id) === String(prodi.id);
                        return (
                          <div
                            key={prodi.id}
                            onClick={() => setTahap1({ ...tahap1, program_studi_id: prodi.id })}
                            className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-[#0d3830] bg-[#eef6f3] shadow-xs"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5 mb-1.5">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                                isSelected ? "bg-[#0d3830] text-white border-[#0d3830]" : prodi.badgeColor
                              }`}>
                                {prodi.jenjang} - {prodi.kode}
                              </span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-[#0d3830] text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">{prodi.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-900 block">
                      {lang === "eng" ? "Full Name (As in Diploma / National ID)" : "Nama Lengkap (Sesuai Ijazah / KTP)"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "eng" ? "e.g., Muhammad Ilham Fathoni" : "Contoh: Muhammad Ilham Fathoni"}
                      value={tahap1.namaLengkap}
                      onChange={(e) => setTahap1({ ...tahap1, namaLengkap: e.target.value })}
                      className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830]"
                    />
                  </div>

                  {/* NIK & Jenis Kelamin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 block">
                        {lang === "eng" ? "National Identity Number (NIK)" : "Nomor Induk Kependudukan (NIK)"} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={16}
                          placeholder={lang === "eng" ? "16 digits from ID Card / KK" : "16 digit sesuai e-KTP / KK"}
                          value={tahap1.nik}
                          onChange={(e) => setTahap1({ ...tahap1, nik: e.target.value.replace(/\D/g, "") })}
                          className="w-full p-3.5 pr-10 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830] font-mono"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {lang === "eng" ? "NIK must be exactly 16 numeric digits." : "NIK wajib 16 angka numerik tanpa tanda baca."}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 block">
                        {lang === "eng" ? "Gender" : "Jenis Kelamin"} <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setTahap1({ ...tahap1, jenisKelamin: "Laki-laki" })}
                          className={`py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center transition cursor-pointer ${
                            tahap1.jenisKelamin === "Laki-laki"
                              ? "bg-[#173a33] text-white shadow-xs"
                              : "bg-[#f0f3f8] text-slate-700 hover:bg-slate-200/70"
                          }`}
                        >
                          <span>{lang === "eng" ? "Male" : "Laki-laki"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTahap1({ ...tahap1, jenisKelamin: "Perempuan" })}
                          className={`py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center transition cursor-pointer ${
                            tahap1.jenisKelamin === "Perempuan"
                              ? "bg-[#173a33] text-white shadow-xs"
                              : "bg-[#f0f3f8] text-slate-700 hover:bg-slate-200/70"
                          }`}
                        >
                          <span>{lang === "eng" ? "Female" : "Perempuan"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tempat & Tanggal Lahir */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 block">
                        {lang === "eng" ? "Place of Birth (Regency/City)" : "Tempat Lahir (Kabupaten/Kota)"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === "eng" ? "e.g., Situbondo" : "Contoh: Situbondo"}
                        value={tahap1.tempatLahir}
                        onChange={(e) => setTahap1({ ...tahap1, tempatLahir: e.target.value })}
                        className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 block">
                        {lang === "eng" ? "Date of Birth" : "Tanggal Lahir"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={tahap1.tanggalLahir}
                        onChange={(e) => setTahap1({ ...tahap1, tanggalLahir: e.target.value })}
                        className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  </div>

                  {/* Kewarganegaraan & Agama */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 block">
                        {lang === "eng" ? "Citizenship" : "Status Warga Negara"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={tahap1.kewarganegaraan}
                        onChange={(e) => setTahap1({ ...tahap1, kewarganegaraan: e.target.value })}
                        className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="WNI (Warga Negara Indonesia)">
                          {lang === "eng" ? "1. WNI (Indonesian Citizen)" : "1. WNI (Warga Negara Indonesia)"}
                        </option>
                        <option value="WNA (Warga Negara Asing)">
                          {lang === "eng" ? "2. WNA (Foreign Citizen)" : "2. WNA (Warga Negara Asing)"}
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 block">
                        {lang === "eng" ? "Religion" : "Agama"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={tahap1.agama}
                        onChange={(e) => setTahap1({ ...tahap1, agama: e.target.value })}
                        className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="Islam">1. Islam</option>
                        <option value="Lainnya">2. {lang === "eng" ? "Others" : "Lainnya"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Input Negara Asal jika WNA */}
                  {tahap1.kewarganegaraan.includes("WNA") && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="font-semibold text-slate-800 block text-xs">
                        {lang === "eng" ? "Country of Origin (WNA)" : "Nama Negara Asal (WNA)"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === "eng" ? "e.g., Malaysia / Brunei / Singapore" : "Contoh: Malaysia, Brunei Darussalam, Singapura, dll."}
                        value={tahap1.negaraAsal}
                        onChange={(e) => setTahap1({ ...tahap1, negaraAsal: e.target.value })}
                        className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  )}

                  {/* Input Agama jika memilih Lainnya */}
                  {tahap1.agama === "Lainnya" && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="font-semibold text-slate-800 block text-xs">
                        {lang === "eng" ? "Specify Religion" : "Sebutkan Agama"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kristen, Katolik, Hindu, Buddha, Khonghucu"
                        value={tahap1.agamaLainnya}
                        onChange={(e) => setTahap1({ ...tahap1, agamaLainnya: e.target.value })}
                        className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                      />
                    </div>
                  )}

                  {/* Status Pernikahan Pill Selector (Sesuai Formulir Kampus: 1. Kawin, 2. Tidak kawin, 3. Janda, 4. Duda) */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-800 block">
                      {lang === "eng" ? "Marital Status" : "Status Pernikahan"} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "Kawin", label: lang === "eng" ? "1. Married" : "1. Kawin" },
                        { id: "Tidak Kawin", label: lang === "eng" ? "2. Single" : "2. Tidak Kawin" },
                        { id: "Janda", label: lang === "eng" ? "3. Widow" : "3. Janda" },
                        { id: "Duda", label: lang === "eng" ? "4. Widower" : "4. Duda" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTahap1({ ...tahap1, statusPernikahan: item.id as any })}
                          className={`py-3 px-3 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer ${
                            tahap1.statusPernikahan === item.id
                              ? "bg-[#173a33] text-white shadow-xs"
                              : "bg-[#f0f3f8] text-slate-700 hover:bg-slate-200/70"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alamat Domisili */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-800 block">
                      {lang === "eng" ? "Current Residential Address" : "Alamat Domisili Tempat Tinggal Sekarang"} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder={lang === "eng" ? "Enter street, neighborhood, village/sub-district, district, and regency/city..." : "Tuliskan nama jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan, dan Kabupaten tempat tinggal Anda saat ini..."}
                      value={tahap1.alamatDomisili}
                      onChange={(e) => setTahap1({ ...tahap1, alamatDomisili: e.target.value })}
                      className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                    />
                  </div>

                  {/* Nomor WhatsApp & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 block">
                        {lang === "eng" ? "Active WhatsApp Number" : "Nomor WhatsApp Aktif"} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="081234567890"
                          value={tahap1.noWhatsapp}
                          onChange={(e) => setTahap1({ ...tahap1, noWhatsapp: e.target.value })}
                          className="w-full p-3.5 pr-10 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                        />
                        <Phone className="w-4 h-4 text-emerald-600 absolute right-3.5 top-4 pointer-events-none" />
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {lang === "eng" ? "Admission results and notification will be sent via WhatsApp." : "Pemberitahuan kelulusan dan kode VA akan dikirimkan melalui WA."}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 block">
                        {lang === "eng" ? "Active Email Address" : "Alamat Email Aktif"} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="nama@gmail.com"
                          value={tahap1.email}
                          onChange={(e) => setTahap1({ ...tahap1, email: e.target.value })}
                          className="w-full p-3.5 pr-10 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {lang === "eng" ? "Used for student portal login and verification." : "Digunakan untuk akun portal mahasiswa & verifikasi berkas."}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleSaveDraftManual}
                      disabled={isSavingDraft}
                      className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Save className="w-4 h-4 text-slate-500" />
                      <span>{isSavingDraft ? (lang === "eng" ? "Saving..." : "Menyimpan Draft...") : (lang === "eng" ? "Save Draft" : "Simpan Draft Formulir")}</span>
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#0e3831] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>{lang === "eng" ? "Proceed to Stage 2: School & Family" : "Lanjut ke Tahap 2: Data Sekolah & Keluarga"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= STAGE 2: DATA SEKOLAH & KELUARGA ================= */}
            {currentStep === 2 && (
              <form onSubmit={handleProceedStep2} className="space-y-6 text-xs sm:text-sm">
                {/* CARD 1: ASAL SEKOLAH */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {lang === "eng" ? "Previous School / Islamic Boarding School" : "Asal Sekolah / Madrasah / Pesantren"}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lang === "eng" ? "Secondary education history for EMIS reporting" : "Data riwayat pendidikan menengah atas untuk pelaporan buku induk EMIS"}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#edf2f7] text-[#4a5568] border border-slate-200 self-start sm:self-center font-mono">
                      EMIS SLTA-01
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Nama Lengkap Sekolah */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 block">
                        {lang === "eng" ? "School / Madrasah / Boarding School Name" : "Nama Lengkap Sekolah / Madrasah / Ponpes Asal"} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder={lang === "eng" ? "e.g., MA Nurul Jadid / MAN 1 Situbondo / SMAN 1" : "Contoh: MA Nurul Jadid / MAN 1 Situbondo / SMA Negeri 1 Panji"}
                          value={tahap2.namaSekolah}
                          onChange={(e) => setTahap2({ ...tahap2, namaSekolah: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] focus:ring-1 focus:ring-[#0d3830]"
                        />
                      </div>
                    </div>

                    {/* Status Lembaga & Jurusan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-800 block">
                          {lang === "eng" ? "School Status" : "Status Lembaga"} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={tahap2.statusSekolah}
                          onChange={(e) => setTahap2({ ...tahap2, statusSekolah: e.target.value as any })}
                          className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                        >
                          <option value="Negeri">{lang === "eng" ? "Public (Negeri)" : "Negeri"}</option>
                          <option value="Swasta">{lang === "eng" ? "Private (Swasta)" : "Swasta"}</option>
                          <option value="Pondok Pesantren / Salafiyah">{lang === "eng" ? "Islamic Boarding School / Salafiyah" : "Pondok Pesantren / Salafiyah"}</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-800 block">
                          {lang === "eng" ? "Major / Field of Study" : "Peminatan / Jurusan"} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={tahap2.jurusanSekolah}
                          onChange={(e) => setTahap2({ ...tahap2, jurusanSekolah: e.target.value })}
                          className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                        >
                          <option value="IPA (Ilmu Pengetahuan Alam)">{lang === "eng" ? "Natural Sciences (IPA)" : "IPA"}</option>
                          <option value="IPS (Ilmu Pengetahuan Sosial)">{lang === "eng" ? "Social Sciences (IPS)" : "IPS"}</option>
                          <option value="Keagamaan / MAK">{lang === "eng" ? "Religious Studies / MAK" : "Keagamaan / MAK"}</option>
                          <option value="Bahasa & Budaya">{lang === "eng" ? "Language & Culture" : "Bahasa"}</option>
                          <option value="Kejuruan (SMK)">{lang === "eng" ? "Vocational (SMK)" : "Kejuruan (SMK)"}</option>
                          <option value="Salafiyah / Diniyah">{lang === "eng" ? "Salafiyah / Diniyah" : "Salafiyah / Diniyah"}</option>
                          <option value="Lainnya">{lang === "eng" ? "Others" : "Lainnya"}</option>
                        </select>
                      </div>
                    </div>

                    {(tahap2.jurusanSekolah === "Lainnya" || tahap2.jurusanSekolah === "Kejuruan (SMK)") && (
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="font-semibold text-slate-800 block">
                          {lang === "eng" ? "Specify Vocational Competence / Major" : "Sebutkan Konsentrasi Keahlian / Jurusan Sekolah"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={lang === "eng" ? "e.g., Computer & Network Engineering (TKJ) / Accounting" : "Contoh: Teknik Komputer & Jaringan (TKJ) / Akuntansi / Keperawatan"}
                          value={tahap2.jurusanSekolahLainnya}
                          onChange={(e) => setTahap2({ ...tahap2, jurusanSekolahLainnya: e.target.value })}
                          className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>
                    )}

                    {/* Nilai Rata-rata & Tahun Kelulusan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-800 block">
                          {lang === "eng" ? "Average Grade (Scale 100)" : "Nilai Rata-rata Ujian / Ijazah (Skala 100)"} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Star className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="85.00"
                            value={tahap2.nilaiRataRata}
                            onChange={(e) => setTahap2({ ...tahap2, nilaiRataRata: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-800 block">
                          {lang === "eng" ? "Graduation Year" : "Tahun Kelulusan"} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={tahap2.tahunLulus}
                          onChange={(e) => setTahap2({ ...tahap2, tahunLulus: e.target.value })}
                          className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                        >
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                          <option value="Sebelum 2022">{lang === "eng" ? "Before 2022" : "Sebelum 2022"}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: DATA ORANG TUA */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {lang === "eng" ? "Biological Parents Information" : "Data Orang Tua Kandung"}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lang === "eng" ? "Matches Family Card (KK) data" : "Kompilasi Formulir Kemenag RI EMIS-PD-ORTU"}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#edf2f7] text-[#4a5568] border border-slate-200 self-start sm:self-center">
                      {lang === "eng" ? "As in Family Card (KK)" : "Sesuai Kartu Keluarga (KK)"}
                    </span>
                  </div>

                  {/* Tab Selector: Ayah / Ibu */}
                  <div className="bg-[#f0f4f8] p-1 rounded-2xl grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setParentTab("ayah")}
                      className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                        parentTab === "ayah"
                          ? "bg-white text-[#0d3830] shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      <User className="w-4 h-4 text-emerald-700" />
                      <span>{lang === "eng" ? "Father's Data" : "Data Ayah Kandung"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentTab("ibu")}
                      className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                        parentTab === "ibu"
                          ? "bg-white text-[#0d3830] shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      <User className="w-4 h-4 text-emerald-700" />
                      <span>{lang === "eng" ? "Mother's Data" : "Data Ibu Kandung"}</span>
                    </button>
                  </div>

                  {/* DATA AYAH */}
                  {parentTab === "ayah" && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Status Keberadaan Ayah */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {lang === "eng" ? "Father's Status:" : "Status Keberadaan Ayah Kandung:"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTahap2({ ...tahap2, statusAyah: "hidup" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              tahap2.statusAyah === "hidup"
                                ? "bg-[#0d3830] text-white shadow-2xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {lang === "eng" ? "Living" : "Masih Hidup"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setTahap2({ ...tahap2, statusAyah: "meninggal" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              tahap2.statusAyah === "meninggal"
                                ? "bg-amber-800 text-white shadow-2xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {lang === "eng" ? "Deceased" : "Almarhum"}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's Full Name" : "Nama Lengkap Ayah Kandung"}{" "}
                            {tahap2.statusAyah === "hidup" && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            required={tahap2.statusAyah === "hidup"}
                            placeholder={tahap2.statusAyah === "meninggal" ? (lang === "eng" ? "Almarhum / Father's Name" : "Almarhum / Nama Ayah") : (lang === "eng" ? "As in Family Card" : "Sesuai Kartu Keluarga")}
                            value={tahap2.namaAyah}
                            onChange={(e) => setTahap2({ ...tahap2, namaAyah: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's National ID (NIK)" : "NIK Ayah Kandung (16 Digit)"}{" "}
                            {tahap2.statusAyah === "hidup" && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            required={tahap2.statusAyah === "hidup"}
                            maxLength={16}
                            placeholder={tahap2.statusAyah === "meninggal" ? "Opsional jika almarhum" : "3512xxxxxxxxxxxx"}
                            value={tahap2.nikAyah}
                            onChange={(e) => setTahap2({ ...tahap2, nikAyah: e.target.value.replace(/\D/g, "") })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Family Card Number (KK)" : "Nomor Kartu Keluarga (KK)"}{" "}
                            {tahap2.statusAyah === "hidup" && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            required={tahap2.statusAyah === "hidup"}
                            maxLength={16}
                            placeholder="3512xxxxxxxxxxxx"
                            value={tahap2.kkAyah}
                            onChange={(e) => setTahap2({ ...tahap2, kkAyah: e.target.value.replace(/\D/g, "") })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's Place & Date of Birth" : "Tempat & Tanggal Lahir Ayah"}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder={lang === "eng" ? "City" : "Kota Lahir"}
                              value={tahap2.tempatLahirAyah}
                              onChange={(e) => setTahap2({ ...tahap2, tempatLahirAyah: e.target.value })}
                              className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                            />
                            <input
                              type="date"
                              value={tahap2.tanggalLahirAyah}
                              onChange={(e) => setTahap2({ ...tahap2, tanggalLahirAyah: e.target.value })}
                              className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-800 block">
                          {lang === "eng" ? "Father's Residential Address" : "Alamat Domisili Ayah Kandung"}
                        </label>
                        <input
                          type="text"
                          placeholder={tahap2.statusAyah === "meninggal" ? "Almarhum" : (lang === "eng" ? "Full address as in ID Card" : "Alamat lengkap sesuai KTP / Domisili saat ini")}
                          value={tahap2.alamatAyah}
                          onChange={(e) => setTahap2({ ...tahap2, alamatAyah: e.target.value })}
                          className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's Last Education" : "Pendidikan Terakhir Ayah"}
                          </label>
                          <select
                            disabled={tahap2.statusAyah === "meninggal"}
                            value={tahap2.pendidikanAyah}
                            onChange={(e) => setTahap2({ ...tahap2, pendidikanAyah: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] disabled:bg-slate-100"
                          >
                            <option value="SD / MI / Sederajat">{lang === "eng" ? "Elementary School / Equivalent" : "SD / MI / Sederajat"}</option>
                            <option value="SMP / MTs / Sederajat">{lang === "eng" ? "Junior High / Equivalent" : "SMP / MTs / Sederajat"}</option>
                            <option value="SMA / MA / SMK / Sederajat">{lang === "eng" ? "Senior High / Equivalent" : "SMA / MA / SMK / Sederajat"}</option>
                            <option value="Diploma (D1 - D4)">{lang === "eng" ? "Diploma (D1 - D4)" : "Diploma (D1 - D4)"}</option>
                            <option value="Sarjana (S1)">{lang === "eng" ? "Bachelor (S1)" : "Sarjana (S1)"}</option>
                            <option value="Magister (S2)">{lang === "eng" ? "Master (S2)" : "Magister (S2)"}</option>
                            <option value="Doktor (S3)">{lang === "eng" ? "Doctorate (S3)" : "Doktor (S3)"}</option>
                            <option value="Pondok Pesantren / Salafiyah">{lang === "eng" ? "Islamic Boarding School" : "Pondok Pesantren / Salafiyah"}</option>
                            <option value="Tidak Sekolah / Lainnya">{lang === "eng" ? "Other / No Formal School" : "Tidak Sekolah / Lainnya"}</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's Occupation" : "Pekerjaan Ayah"}
                          </label>
                          <select
                            disabled={tahap2.statusAyah === "meninggal"}
                            value={tahap2.statusAyah === "meninggal" ? "Tidak bekerja" : tahap2.pekerjaanAyah}
                            onChange={(e) => setTahap2({ ...tahap2, pekerjaanAyah: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] disabled:bg-slate-100"
                          >
                            {PEKERJAAN_KAMPUS_LIST.map((pk, idx) => (
                              <option key={pk} value={pk}>
                                {idx + 1}. {pk}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {tahap2.statusAyah === "hidup" && tahap2.pekerjaanAyah === "Lainnya" && (
                        <div className="space-y-1.5 animate-fadeIn">
                          <label className="font-semibold text-slate-800 block text-xs">
                            {lang === "eng" ? "Specify Father's Occupation" : "Sebutkan Pekerjaan Ayah Kandung"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={lang === "eng" ? "Specify occupation..." : "Contoh: Pengrajin Kayu / Supir / Buruh Tani"}
                            value={tahap2.pekerjaanAyahLainnya}
                            onChange={(e) => setTahap2({ ...tahap2, pekerjaanAyahLainnya: e.target.value })}
                            className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Monthly Income Range" : "Penghasilan Rata-rata per Bulan"}
                          </label>
                          <select
                            disabled={tahap2.statusAyah === "meninggal"}
                            value={tahap2.statusAyah === "meninggal" ? "Tidak Berpenghasilan" : tahap2.penghasilanAyah}
                            onChange={(e) => setTahap2({ ...tahap2, penghasilanAyah: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] disabled:bg-slate-100"
                          >
                            {PENGHASILAN_KAMPUS_LIST.map((pen, idx) => (
                              <option key={pen} value={pen}>
                                {pen === "Tidak Berpenghasilan" ? pen : `${idx + 1}. ${pen}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's Phone / WhatsApp" : "Nomor WhatsApp Ayah / Kontak"}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Phone className="w-4 h-4" />
                            </div>
                            <input
                              type="tel"
                              disabled={tahap2.statusAyah === "meninggal"}
                              placeholder={tahap2.statusAyah === "meninggal" ? "-" : "08xxxxxxxxxx"}
                              value={tahap2.noHpAyah}
                              onChange={(e) => setTahap2({ ...tahap2, noHpAyah: e.target.value })}
                              className="w-full pl-10 pr-3.5 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] disabled:bg-slate-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DATA IBU */}
                  {parentTab === "ibu" && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Status Keberadaan Ibu */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {lang === "eng" ? "Mother's Status:" : "Status Keberadaan Ibu Kandung:"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTahap2({ ...tahap2, statusIbu: "hidup" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              tahap2.statusIbu === "hidup"
                                ? "bg-[#0d3830] text-white shadow-2xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {lang === "eng" ? "Living" : "Masih Hidup"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setTahap2({ ...tahap2, statusIbu: "meninggal" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              tahap2.statusIbu === "meninggal"
                                ? "bg-amber-800 text-white shadow-2xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {lang === "eng" ? "Deceased" : "Almarhumah"}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's Full Name" : "Nama Lengkap Ibu Kandung"}{" "}
                            {tahap2.statusIbu === "hidup" && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            required={tahap2.statusIbu === "hidup"}
                            placeholder={tahap2.statusIbu === "meninggal" ? (lang === "eng" ? "Almarhumah / Mother's Name" : "Almarhumah / Nama Ibu") : (lang === "eng" ? "As in Family Card" : "Sesuai Kartu Keluarga")}
                            value={tahap2.namaIbu}
                            onChange={(e) => setTahap2({ ...tahap2, namaIbu: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's National ID (NIK)" : "NIK Ibu Kandung (16 Digit)"}{" "}
                            {tahap2.statusIbu === "hidup" && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            required={tahap2.statusIbu === "hidup"}
                            maxLength={16}
                            placeholder={tahap2.statusIbu === "meninggal" ? "Opsional jika almarhumah" : "3512xxxxxxxxxxxx"}
                            value={tahap2.nikIbu}
                            onChange={(e) => setTahap2({ ...tahap2, nikIbu: e.target.value.replace(/\D/g, "") })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Family Card Number (KK)" : "Nomor Kartu Keluarga (KK)"}{" "}
                            {tahap2.statusIbu === "hidup" && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            required={tahap2.statusIbu === "hidup"}
                            maxLength={16}
                            placeholder="3512xxxxxxxxxxxx"
                            value={tahap2.kkIbu || tahap2.kkAyah}
                            onChange={(e) => setTahap2({ ...tahap2, kkIbu: e.target.value.replace(/\D/g, "") })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's Place & Date of Birth" : "Tempat & Tanggal Lahir Ibu"}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder={lang === "eng" ? "City" : "Kota Lahir"}
                              value={tahap2.tempatLahirIbu}
                              onChange={(e) => setTahap2({ ...tahap2, tempatLahirIbu: e.target.value })}
                              className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                            />
                            <input
                              type="date"
                              value={tahap2.tanggalLahirIbu}
                              onChange={(e) => setTahap2({ ...tahap2, tanggalLahirIbu: e.target.value })}
                              className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-800 block">
                          {lang === "eng" ? "Mother's Residential Address" : "Alamat Domisili Ibu Kandung"}
                        </label>
                        <input
                          type="text"
                          placeholder={tahap2.statusIbu === "meninggal" ? "Almarhumah" : (lang === "eng" ? "Full address as in ID Card" : "Alamat lengkap sesuai KTP / Domisili saat ini")}
                          value={tahap2.alamatIbu || tahap2.alamatAyah}
                          onChange={(e) => setTahap2({ ...tahap2, alamatIbu: e.target.value })}
                          className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's Last Education" : "Pendidikan Terakhir Ibu"}
                          </label>
                          <select
                            disabled={tahap2.statusIbu === "meninggal"}
                            value={tahap2.pendidikanIbu}
                            onChange={(e) => setTahap2({ ...tahap2, pendidikanIbu: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] disabled:bg-slate-100"
                          >
                            <option value="SD / MI / Sederajat">{lang === "eng" ? "Elementary School / Equivalent" : "SD / MI / Sederajat"}</option>
                            <option value="SMP / MTs / Sederajat">{lang === "eng" ? "Junior High / Equivalent" : "SMP / MTs / Sederajat"}</option>
                            <option value="SMA / MA / SMK / Sederajat">{lang === "eng" ? "Senior High / Equivalent" : "SMA / MA / SMK / Sederajat"}</option>
                            <option value="Diploma (D1 - D4)">{lang === "eng" ? "Diploma (D1 - D4)" : "Diploma (D1 - D4)"}</option>
                            <option value="Sarjana (S1)">{lang === "eng" ? "Bachelor (S1)" : "Sarjana (S1)"}</option>
                            <option value="Magister (S2)">{lang === "eng" ? "Master (S2)" : "Magister (S2)"}</option>
                            <option value="Doktor (S3)">{lang === "eng" ? "Doctorate (S3)" : "Doktor (S3)"}</option>
                            <option value="Pondok Pesantren / Salafiyah">{lang === "eng" ? "Islamic Boarding School" : "Pondok Pesantren / Salafiyah"}</option>
                            <option value="Tidak Sekolah / Lainnya">{lang === "eng" ? "Other / No Formal School" : "Tidak Sekolah / Lainnya"}</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's Occupation" : "Pekerjaan Ibu"}
                          </label>
                          <select
                            disabled={tahap2.statusIbu === "meninggal"}
                            value={tahap2.statusIbu === "meninggal" ? "Tidak bekerja" : tahap2.pekerjaanIbu}
                            onChange={(e) => setTahap2({ ...tahap2, pekerjaanIbu: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] disabled:bg-slate-100"
                          >
                            {PEKERJAAN_KAMPUS_LIST.map((pk, idx) => (
                              <option key={pk} value={pk}>
                                {idx + 1}. {pk}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {tahap2.statusIbu === "hidup" && tahap2.pekerjaanIbu === "Lainnya" && (
                        <div className="space-y-1.5 animate-fadeIn">
                          <label className="font-semibold text-slate-800 block text-xs">
                            {lang === "eng" ? "Specify Mother's Occupation" : "Sebutkan Pekerjaan Ibu Kandung"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={lang === "eng" ? "Specify occupation..." : "Contoh: Penjahit / Pedagang Pasar / Bidan"}
                            value={tahap2.pekerjaanIbuLainnya}
                            onChange={(e) => setTahap2({ ...tahap2, pekerjaanIbuLainnya: e.target.value })}
                            className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Monthly Income Range" : "Penghasilan Rata-rata per Bulan"}
                          </label>
                          <select
                            disabled={tahap2.statusIbu === "meninggal"}
                            value={tahap2.statusIbu === "meninggal" ? "Tidak Berpenghasilan" : tahap2.penghasilanIbu}
                            onChange={(e) => setTahap2({ ...tahap2, penghasilanIbu: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] disabled:bg-slate-100"
                          >
                            {PENGHASILAN_KAMPUS_LIST.map((pen, idx) => (
                              <option key={pen} value={pen}>
                                {pen === "Tidak Berpenghasilan" ? pen : `${idx + 1}. ${pen}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's Phone / WhatsApp" : "Nomor WhatsApp Ibu / Kontak"}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Phone className="w-4 h-4" />
                            </div>
                            <input
                              type="tel"
                              disabled={tahap2.statusIbu === "meninggal"}
                              placeholder={tahap2.statusIbu === "meninggal" ? "-" : "08xxxxxxxxxx"}
                              value={tahap2.noHpIbu}
                              onChange={(e) => setTahap2({ ...tahap2, noHpIbu: e.target.value })}
                              className="w-full pl-10 pr-3.5 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] disabled:bg-slate-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CARD 3: IDENTITAS WALI */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {lang === "eng" ? "Guardian Information" : "Identitas Wali Santri / Mahasiswa"}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lang === "eng" ? "Filled only if cared for by a legal guardian" : "Diisi hanya jika calon mahasiswa diasuh oleh wali non-orang tua kandung."}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#edf2f7] text-[#4a5568] border border-slate-200 self-start sm:self-center">
                      {lang === "eng" ? "Optional" : "Opsional"}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 bg-[#f0f3f8] border border-slate-200/90 rounded-2xl flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="livingWithParentsCheck"
                      checked={livingWithParents}
                      onChange={(e) => setLivingWithParents(e.target.checked)}
                      className="w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer"
                    />
                    <label htmlFor="livingWithParentsCheck" className="text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer select-none">
                      {lang === "eng" ? "Living with biological parents (Skip guardian details)" : "Tinggal bersama orang tua kandung (Lewati pengisian data wali)"}
                    </label>
                  </div>

                  {!livingWithParents && (
                    <div className="space-y-4 pt-2 animate-fadeIn border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Guardian's Full Name" : "Nama Lengkap Wali"}
                          </label>
                          <input
                            type="text"
                            placeholder={lang === "eng" ? "Guardian's Full Name" : "Nama Lengkap Wali"}
                            value={tahap2.namaWali}
                            onChange={(e) => setTahap2({ ...tahap2, namaWali: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Guardian's National ID (NIK)" : "NIK Wali (16 Digit)"}
                          </label>
                          <input
                            type="text"
                            maxLength={16}
                            placeholder="3512xxxxxxxxxxxx"
                            value={tahap2.nikWali}
                            onChange={(e) => setTahap2({ ...tahap2, nikWali: e.target.value.replace(/\D/g, "") })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Relationship with Applicant" : "Hubungan dengan Calon Mahasiswa"}
                          </label>
                          <input
                            type="text"
                            placeholder={lang === "eng" ? "e.g., Uncle / Grandfather" : "Contoh: Paman / Kakek"}
                            value={tahap2.hubunganWali}
                            onChange={(e) => setTahap2({ ...tahap2, hubunganWali: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Guardian's Phone / WhatsApp" : "Nomor WhatsApp Wali"}
                          </label>
                          <input
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            value={tahap2.noHpWali}
                            onChange={(e) => setTahap2({ ...tahap2, noHpWali: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Alamat Domisili Wali (Sesuai Form Kampus: D. Identitas Wali) */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-800 block">
                          {lang === "eng" ? "Guardian's Residential Address" : "Alamat Domisili Wali"}
                        </label>
                        <input
                          type="text"
                          placeholder={lang === "eng" ? "Full address of guardian" : "Alamat tempat tinggal / domisili wali saat ini"}
                          value={tahap2.alamatWali}
                          onChange={(e) => setTahap2({ ...tahap2, alamatWali: e.target.value })}
                          className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl"
                        />
                      </div>

                      {/* Pekerjaan & Penghasilan Wali */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Guardian's Occupation" : "Pekerjaan Wali"}
                          </label>
                          <select
                            value={tahap2.pekerjaanWali}
                            onChange={(e) => setTahap2({ ...tahap2, pekerjaanWali: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl"
                          >
                            {PEKERJAAN_KAMPUS_LIST.map((pk, idx) => (
                              <option key={pk} value={pk}>
                                {idx + 1}. {pk}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Guardian's Monthly Income" : "Penghasilan Rata-rata Wali"}
                          </label>
                          <select
                            value={tahap2.penghasilanWali}
                            onChange={(e) => setTahap2({ ...tahap2, penghasilanWali: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl"
                          >
                            {PENGHASILAN_KAMPUS_LIST.map((pen, idx) => (
                              <option key={pen} value={pen}>
                                {pen === "Tidak Berpenghasilan" ? pen : `${idx + 1}. ${pen}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{lang === "eng" ? "Back to Stage 1" : "Kembali ke Tahap 1"}</span>
                  </button>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleSaveDraftManual}
                      disabled={isSavingDraft}
                      className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Save className="w-4 h-4 text-slate-500" />
                      <span>{isSavingDraft ? (lang === "eng" ? "Saving..." : "Menyimpan Draft...") : (lang === "eng" ? "Save Draft" : "Simpan Draft Formulir")}</span>
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#0e3831] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>{lang === "eng" ? "Proceed to Stage 3: Documents & Bank Transfer" : "Lanjut ke Tahap 3: Berkas & NoRek"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ================= STAGE 3: UPLOAD BERKAS & FINALISASI ================= */}
            {currentStep === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6 text-xs sm:text-sm">
                {/* CARD 1: UNGGAH BERKAS */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {lang === "eng" ? "Upload Digital Documents" : "Unggah Berkas Persyaratan Digital"}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#edf2f7] text-[#4a5568] border border-slate-200 self-start sm:self-center font-mono">
                      JPG, PNG, PDF • Max. 2 MB
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeDocs.map((doc) => {
                      const file = (berkasFiles as any)[doc.key];
                      const uploadedName = uploadedBerkasNames[doc.key];
                      const hasFile = Boolean(file || uploadedName);
                      const displayFileName = file?.name || uploadedName;

                      return (
                        <div
                          key={doc.key}
                          className="p-4 bg-[#f8fafc] border border-slate-200/90 rounded-xl space-y-2.5 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                                {doc.label}
                              </h4>
                              {doc.wajib ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#13322b] text-white">
                                  {lang === "eng" ? "Required" : "Wajib"}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                                  {lang === "eng" ? "Optional" : "Opsional"}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {doc.desc}
                            </p>
                          </div>

                          <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-200/60 mt-1">
                            <label className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition">
                              {doc.isPhoto ? (
                                <Camera className="w-3.5 h-3.5 text-slate-600" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-slate-600" />
                              )}
                              <span>{doc.isPhoto ? (lang === "eng" ? "Select Photo" : "Pilih Foto") : (lang === "eng" ? "Select Document" : "Pilih Dokumen")}</span>
                              <input
                                type="file"
                                accept={doc.accept}
                                onChange={(e) =>
                                  handleFileChange(doc.key, e.target.files?.[0] || null)
                                }
                                className="hidden"
                              />
                            </label>

                            {hasFile ? (
                              <div className="flex items-center gap-1.5 max-w-[140px] sm:max-w-[160px] truncate">
                                <span className="text-[11px] font-semibold text-emerald-800 truncate flex items-center gap-1">
                                  <Paperclip className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                  <span className="truncate">{displayFileName}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleFileChange(doc.key, null)}
                                  className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                                  title="Remove file"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                {doc.wajib ? (
                                  <>
                                    <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
                                    <span>{lang === "eng" ? "Not uploaded" : "Belum diunggah"}</span>
                                  </>
                                ) : (
                                  <span>{lang === "eng" ? "Not attached" : "Tidak dilampirkan"}</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CARD 2: REKENING RESMI & BIAYA REGISTRASI PMB */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {lang === "eng" ? "Official Campus Bank Account Transfer" : "Rekening Bank Resmi PMB STAI Cendekia Insani"}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lang === "eng" ? "Transfer registration fee directly to official institutional bank accounts" : "Transfer biaya registrasi langsung ke rekening kas resmi kampus tanpa pihak ketiga"}
                      </p>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white flex items-center gap-2 self-start sm:self-center shadow-xs">
                      <span className="text-[11px] text-slate-300">{lang === "eng" ? "Total Bill:" : "Total Tagihan:"}</span>
                      <strong className="text-sm font-bold font-mono">
                        {isKipRegistration ? "Rp 0 (Bebas Biaya KIP)" : formatRupiah(totalRegistrationFee)}
                      </strong>
                    </div>
                  </div>

                  {isKipRegistration ? (
                    <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
                      <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                        i
                      </div>
                      <p className="leading-relaxed">
                        {lang === "eng"
                          ? "As an applicant of KIP-Kuliah Scholarship Pathway, you are fully exempt from the admission application fee (Rp 0). Please ensure that you have uploaded your KIP / DTKS Card in the document upload section above."
                          : "Sebagai pendaftar Jalur Beasiswa KIP-Kuliah, Anda dibebaskan sepenuhnya dari biaya pendaftaran (Rp 0). Pastikan Anda telah mengunggah Kartu KIP / Bukti Terdaftar DTKS Kemensos pada bagian formulir unggah berkas di atas."}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                        i
                      </div>
                      <p className="leading-relaxed">
                        {lang === "eng"
                          ? `The admission fee for ${selectedGelombang?.nama || "the selected wave"} is ${formatRupiah(totalRegistrationFee)} without additional third-party surcharges. Transfer can be executed via ATM, Mobile Banking (BSI Mobile, Livin' Mandiri, BRImo), or bank teller across Indonesia.`
                          : `Biaya registrasi PMB untuk ${selectedGelombang?.nama || "Gelombang Terpilih"} murni sebesar ${formatRupiah(totalRegistrationFee)} tanpa tambahan biaya transaksi pihak ketiga. Pembayaran dapat dilakukan via ATM, Mobile Banking (BSI Mobile, Livin' Mandiri, BRImo), atau teller bank di seluruh Indonesia.`}
                      </p>
                    </div>
                  )}

                  {/* Dynamic Bank Account Cards (NoRek) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeRekenings.map((rek: any, idx: number) => {
                      const rekId = rek.id || idx;
                      const isCopied = copiedRekeningId === rekId;
                      return (
                        <div
                          key={rekId}
                          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0d3830] flex-shrink-0">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                                  {rek.nama_bank}
                                </h4>
                                <span className="text-[11px] text-slate-500 block">
                                  {rek.cabang ? (lang === "eng" ? `Branch: ${rek.cabang}` : `Cabang: ${rek.cabang}`) : "Rekening Resmi Kampus"}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md flex-shrink-0 ${
                              rek.is_utama
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}>
                              {rek.is_utama ? (lang === "eng" ? "Primary" : "Utama") : (lang === "eng" ? "Partner" : "Mitra")}
                            </span>
                          </div>

                          {/* No Rekening */}
                          <div>
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
                              {lang === "eng" ? "Bank Account Number:" : "Nomor Rekening Resmi:"}
                            </span>
                            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between gap-3">
                              <span className="text-lg sm:text-xl font-bold font-mono tracking-wider text-slate-900 select-all">
                                {rek.nomor_rekening}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyRekening(rek.nomor_rekening, rekId)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  isCopied
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                                }`}
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>{lang === "eng" ? "Copied!" : "Tersalin!"}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{lang === "eng" ? "Copy" : "Salin"}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="pt-2.5 text-xs space-y-2 border-t border-slate-100">
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="text-slate-500">{lang === "eng" ? "Account Name:" : "Atas Nama:"}</span>
                              <strong className="font-semibold text-slate-800">{rek.atas_nama || "PMB STAI Cendekia Insani"}</strong>
                            </div>
                            <div className="pt-1.5 border-t border-slate-100/80">
                              <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1 text-[11px]">
                                <Smartphone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span>{lang === "eng" ? "Transfer Method / Channel:" : "Metode Transfer:"}</span>
                              </div>
                              <p className="text-slate-700 font-medium text-xs leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                {rek.instruksi_transfer || "Transfer melalui BSI Mobile / ATM Bersama dengan memasukkan kode bank 451 diikuti nomor rekening."}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Upload Bukti Transfer */}
                  <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {lang === "eng" ? "Upload Bank Transfer Receipt" : "Unggah Bukti Transfer Bank Resmi"}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {lang === "eng" ? "Attach official ATM receipt or mobile banking screenshot (JPG/PDF max 2MB)." : "Wajib lampirkan struk ATM, bukti transfer m-banking, atau slip teller bank (JPG/PDF maks 2MB)."}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex-shrink-0">
                      {berkasFiles.bukti_transfer || uploadedBerkasNames.bukti_transfer ? (
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate max-w-[150px]">
                            {berkasFiles.bukti_transfer?.name || uploadedBerkasNames.bukti_transfer}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFileChange("bukti_transfer", null)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full sm:w-auto px-5 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition">
                          <Camera className="w-4 h-4 text-emerald-300" />
                          <span>{lang === "eng" ? "Upload Receipt" : "Unggah Bukti"}</span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) =>
                              handleFileChange("bukti_transfer", e.target.files?.[0] || null)
                            }
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD 3: PERNYATAAN KEABSAHAN DATA */}
                <div className="p-4 sm:p-5 bg-[#f0f3f8] border border-slate-200/90 rounded-xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeTermsSubmit"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#0d3830] border-slate-300 rounded focus:ring-[#0d3830] cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="agreeTermsSubmit" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                    {lang === "eng"
                      ? "I solemnly declare that all data, uploaded documents, and payment receipts submitted in the STAICI Online Admission System are authentic, valid, and legally accountable. If any fraudulent information is found later, I accept full cancellation of my admission status."
                      : "Saya menyatakan dengan sesungguhnya bahwa seluruh data, lampiran pindaian berkas, dan bukti pembayaran yang saya serahkan dalam sistem PMB Online STAI Cendekia Insani Situbondo adalah sah, valid, dan dapat dipertanggungjawabkan. Apabila di kemudian hari ditemukan kecurangan/pemalsuan dokumen, saya bersedia menerima sanksi pembatalan status penerimaan."}
                  </label>
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{lang === "eng" ? "Back to Stage 2" : "Kembali ke Tahap 2"}</span>
                  </button>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleSaveDraftManual}
                      disabled={isSavingDraft || isSubmitting}
                      className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Save className="w-4 h-4 text-slate-500" />
                      <span>{isSavingDraft ? (lang === "eng" ? "Saving..." : "Menyimpan Draft...") : (lang === "eng" ? "Save Draft" : "Simpan Draft Formulir")}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#0e3831] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75"
                    >
                      <span>{isSubmitting ? (lang === "eng" ? "Processing..." : "Memproses Finalisasi...") : (lang === "eng" ? "Submit Registration Now" : "Kirim Formulir & Finalisasi PMB")}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: SIDEBAR CARDS */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Card 1: Rincian Biaya Kuliah */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-lg">
                    {lang === "eng" ? "Tuition & Fee Structure" : "Rincian Biaya Kuliah"}
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {lang === "eng" ? "Transparent" : "Transparan"}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {lang === "eng"
                  ? "Affordable tuition with Islamic mutual support (ta'awun) without hidden building fees."
                  : "Biaya kuliah terjangkau berprinsip ta'awun dan keberkahan tanpa uang gedung tersembunyi."}
              </p>

              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {lang === "eng" ? "Admission Fee" : "Biaya Pendaftaran"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {lang === "eng" ? "One-time registration & selection fee" : "Satu kali saat tes seleksi"}
                    </span>
                  </div>
                  <span className="text-base font-bold font-mono text-slate-900">
                    Rp 250.000
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {lang === "eng" ? "Semester Tuition (SPP)" : "SPP Per Semester"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {lang === "eng" ? "Payable in 3 installments" : "Dapat diangsur 3x per semester"}
                    </span>
                  </div>
                  <span className="text-base font-bold font-mono text-slate-900">
                    Rp 2.400.000
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-[#eef8f3] border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>{lang === "eng" ? "Santri / Alumni Discount:" : "Diskon Khusus Alumni Santri:"}</strong>{" "}
                  {lang === "eng" ? "50% tuition deduction for partner boarding school graduates." : "Potongan biaya kuliah 50% untuk lulusan dari jaringan pondok pesantren mitra."}
                </p>
              </div>
            </div>

            {/* Card 2: Berkas Persyaratan */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0d3830]" />
                <h3 className="font-bold text-slate-900 text-lg">
                  {lang === "eng" ? "Document Checklist" : "Berkas Persyaratan"}
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {lang === "eng" ? "Prepare in digital format (JPG/PDF max 2MB):" : "Disiapkan dalam format digital (jpg/pdf max 2MB):"}
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                {activeDocs.map((doc) => (
                  <li key={doc.key} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{doc.label} {doc.wajib ? "" : `(${lang === "eng" ? "optional" : "opsional"})`}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3: Hotline Panitia PMB (Dinamis) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Headphones className="w-5 h-5 text-amber-600" />
                <h3>{t.sidebar.hotlineTitle}</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {t.sidebar.hotlineDesc}
              </p>

              <div className="space-y-2.5">
                {(() => {
                  const seen = new Set<string>();
                  const activeList = (masterHotlines.length > 0
                    ? masterHotlines.filter((h: any) => h.is_aktif ?? true)
                    : [
                        {
                          id: "fb-wa",
                          nama_layanan: "WhatsApp Panitia PMB Center",
                          tipe_kontak: "whatsapp",
                          nomor_atau_email: "0852-3343-2221",
                        },
                        {
                          id: "fb-email",
                          nama_layanan: "Email Resmi PMB STAICI",
                          tipe_kontak: "email",
                          nomor_atau_email: "pmb@staicisitubondo.ac.id",
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
                              {h.nama_layanan || h.nama_kontak || (lang === "eng" ? "Official PMB Email" : "Email Resmi PMB Center")}
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
                      ? `https://wa.me/${waNum}?text=Halo%20Panitia%20PMB%20STAICI,%20saya%20ingin%20berkonsultasi%20pendaftaran`
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
                            {h.nama_layanan || h.nama_kontak || (lang === "eng" ? "WhatsApp PMB Center" : "WhatsApp PMB Center")}
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
                <span>{t.sidebar.operatingHours}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* 4. Footer Section */}
      <Footer />

      {/* MODAL: SUBMIT FINAL SUKSES */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-sm sm:max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center flex flex-col items-center border border-slate-100 animate-scaleUp">
            <div className="relative w-12 h-12 mb-3">
              <Image
                src="/logo-staici.png"
                alt="Logo STAICI"
                fill
                className="object-contain"
              />
            </div>

            <div className="w-14 h-14 rounded-full bg-[#e8f8f2] text-[#0d3830] flex items-center justify-center mb-4 shadow-xs">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              {lang === "eng" ? "Registration Successfully Submitted!" : "Pendaftaran Berhasil Disubmit!"}
            </h3>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl w-full mb-4">
              <span className="text-xs text-slate-500 block">
                {lang === "eng" ? "Your PMB Registration Number:" : "Nomor Registrasi PMB Anda:"}
              </span>
              <strong className="text-lg font-black font-mono text-[#0d3830]">{submittedNomor}</strong>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {lang === "eng"
                ? "Your admission form has been registered. Please open your Dashboard to complete payment and monitor document verification."
                : "Formulir pendaftaran Anda telah berhasil disimpan dan diterbitkan. Silakan masuk ke Dashboard untuk melakukan pembayaran dan memantau status verifikasi berkas."}
            </p>

            <div className="w-full space-y-2.5">
              <Link
                href="/dashboard/pembayaran"
                className="w-full py-3.5 bg-[#0e3831] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition block"
              >
                {lang === "eng" ? "Proceed to Payment →" : "Lanjut ke Pembayaran VA →"}
              </Link>
              <Link
                href="/dashboard"
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition block"
              >
                {lang === "eng" ? "Open Student Dashboard" : "Buka Dashboard Calon Mahasiswa"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal Integration (Enforced if not logged in) */}
      <LoginModal
        isOpen={loginModalOpen || (!user && !isCheckingAuth)}
        allowClose={Boolean(user)}
        onClose={() => {
          if (user) {
            setLoginModalOpen(false);
          }
        }}
        redirectTo={null}
        onSuccess={(loggedUser) => {
          loadUserPendaftarData(loggedUser);
          setLoginModalOpen(false);
        }}
      />
    </div>
  );
}
