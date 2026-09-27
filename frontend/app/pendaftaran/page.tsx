"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { api, authStorage, UserSession } from "@/lib/api";
import LoginModal from "@/components/LoginModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

export default function PendaftaranPage() {
  const router = useRouter();
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

  // ===================== FORM DATA STATE =====================
  // Tahap 1: Prodi & Biodata Diri
  const [tahap1, setTahap1] = useState({
    program_studi_id: "1", // MPI default
    namaLengkap: "",
    nik: "",
    jenisKelamin: "Laki-laki" as "Laki-laki" | "Perempuan",
    tempatLahir: "",
    tanggalLahir: "",
    kewarganegaraan: "WNI (Warga Negara Indonesia)",
    agama: "Islam",
    statusPernikahan: "Belum Kawin" as "Belum Kawin" | "Kawin" | "Duda" | "Janda",
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
    nilaiRataRata: "",
    tahunLulus: "2026",

    // Ayah Kandung
    namaAyah: "",
    nikAyah: "",
    kkAyah: "",
    tempatLahirAyah: "",
    tanggalLahirAyah: "",
    alamatAyah: "",
    pendidikanAyah: "SMA / MA / SMK / Sederajat",
    pekerjaanAyah: "Wiraswasta / Pengusaha",
    penghasilanAyah: "Rp2.000.000–4.000.000",
    noHpAyah: "",

    // Ibu Kandung
    namaIbu: "",
    nikIbu: "",
    kkIbu: "",
    tempatLahirIbu: "",
    tanggalLahirIbu: "",
    alamatIbu: "",
    pendidikanIbu: "SMA / MA / SMK / Sederajat",
    pekerjaanIbu: "Pengurus Rumah Tangga",
    penghasilanIbu: "di bawah Rp1.000.000",
    noHpIbu: "",

    // Wali & Kontak
    namaWali: "",
    nikWali: "",
    hubunganWali: "Paman / Bibi",
    pendidikanWali: "SMA / MA / SMK / Sederajat",
    pekerjaanWali: "Wiraswasta / Pengusaha",
    penghasilanWali: "Rp2.000.000–4.000.000",
    alamatWali: "",
    noHpWali: "",
    noHpOrangTuaWali: "",
  });

  // Tahap 3: Berkas & Virtual Account State
  const [copiedVA, setCopiedVA] = useState<"bsi" | "mandiri" | null>(null);
  const [berkasFiles, setBerkasFiles] = useState<{
    ijazah?: File | null;
    kk?: File | null;
    ktp?: File | null;
    foto?: File | null;
    kip?: File | null;
    rekomendasi?: File | null;
    bukti_transfer?: File | null;
  }>({});

  const [uploadedBerkasNames, setUploadedBerkasNames] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleCopyVA = (number: string, type: "bsi" | "mandiri") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(number.replace(/\s/g, ""));
    }
    setCopiedVA(type);
    setTimeout(() => {
      setCopiedVA(null);
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
              kewarganegaraan: p.status_warga_negara ? `${p.status_warga_negara} (Warga Negara Indonesia)` : prev.kewarganegaraan,
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

  // Load User & Saved Draft + Auth Guard
  useEffect(() => {
    loadUserPendaftarData();

    // Load from localStorage draft if exists
    const draft = localStorage.getItem("pmb_form_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.tahap1) setTahap1((prev) => ({ ...prev, ...parsed.tahap1 }));
        if (parsed.tahap2) setTahap2((prev) => ({ ...prev, ...parsed.tahap2 }));
      } catch {}
    }

    const handleAuthChange = () => {
      loadUserPendaftarData();
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  // Save Draft Handler
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setNotification(null);

    const draftData = { tahap1, tahap2 };
    localStorage.setItem("pmb_form_draft", JSON.stringify(draftData));

    if (authStorage.getToken()) {
      try {
        if (tahap1.alamatDomisili && tahap1.tempatLahir) {
          await api.put("/pendaftar/identitas", {
            jenis_kelamin: tahap1.jenisKelamin,
            alamat: tahap1.alamatDomisili,
            tempat_lahir: tahap1.tempatLahir,
            tanggal_lahir: tahap1.tanggalLahir || "2000-01-01",
            status_warga_negara: tahap1.kewarganegaraan.includes("WNI") ? "WNI" : "WNA",
            agama: tahap1.agama,
            status_pernikahan: tahap1.statusPernikahan,
          });
        }
        if (tahap1.program_studi_id) {
          await api.put("/pendaftar/prodi-gelombang", {
            program_studi_id: Number(tahap1.program_studi_id),
            gelombang_id: 1,
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
        if (tahap2.namaAyah && tahap2.namaIbu) {
          await api.put("/pendaftar/orang-tua", {
            nama_ayah: tahap2.namaAyah,
            nik_ayah: tahap2.nikAyah || tahap1.nik,
            kk_ayah: tahap2.kkAyah || "3512000000000000",
            tempat_lahir_ayah: tahap2.tempatLahirAyah || tahap1.tempatLahir,
            tanggal_lahir_ayah: tahap2.tanggalLahirAyah,
            alamat_ayah: tahap2.alamatAyah || tahap1.alamatDomisili,
            pendidikan_ayah: tahap2.pendidikanAyah,
            pekerjaan_ayah: tahap2.pekerjaanAyah,
            penghasilan_ayah: tahap2.penghasilanAyah,

            nama_ibu: tahap2.namaIbu,
            nik_ibu: tahap2.nikIbu || tahap1.nik,
            kk_ibu: tahap2.kkIbu || tahap2.kkAyah || "3512000000000000",
            tempat_lahir_ibu: tahap2.tempatLahirIbu || tahap1.tempatLahir,
            tanggal_lahir_ibu: tahap2.tanggalLahirIbu,
            alamat_ibu: tahap2.alamatIbu || tahap1.alamatDomisili,
            pendidikan_ibu: tahap2.pendidikanIbu,
            pekerjaan_ibu: tahap2.pekerjaanIbu,
            penghasilan_ibu: tahap2.penghasilanIbu,

            nama_wali: tahap2.namaWali,
            alamat_wali: tahap2.alamatWali,
            no_hp_orang_tua_wali: tahap2.noHpOrangTuaWali || tahap2.noHpAyah || tahap2.noHpIbu || tahap1.noWhatsapp,
          });
        }
        setNotification({
          type: "success",
          message: lang === "eng" ? "Registration draft successfully saved to server." : "Draft formulir pendaftaran berhasil disimpan ke server.",
        });
      } catch (err: any) {
        setNotification({
          type: "info",
          message: lang === "eng" ? "Draft saved locally in your browser." : "Draft tersimpan di browser Anda.",
        });
      }
    } else {
      setNotification({
        type: "success",
        message: lang === "eng" ? "Draft successfully saved on your device." : "Draft formulir pendaftaran berhasil disimpan di perangkat Anda.",
      });
    }

    setTimeout(() => {
      setIsSavingDraft(false);
    }, 600);
  };

  // Step 1 Validation & Proceed
  const handleProceedStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!tahap1.namaLengkap.trim()) {
      setNotification({ type: "error", message: lang === "eng" ? "Full name is required." : "Nama lengkap harus diisi." });
      return;
    }
    if (tahap1.nik.length !== 16) {
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

    handleSaveDraft();
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
    if (!tahap2.namaAyah.trim() || !tahap2.namaIbu.trim()) {
      setNotification({ type: "error", message: lang === "eng" ? "Father's and Mother's names are required." : "Nama Ayah dan Ibu kandung wajib diisi." });
      return;
    }

    handleSaveDraft();
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
        agama: tahap1.agama,
        status_pernikahan: tahap1.statusPernikahan,
      });

      await api.put("/pendaftar/prodi-gelombang", {
        program_studi_id: Number(tahap1.program_studi_id),
        gelombang_id: 1,
      });

      await api.put("/pendaftar/asal-sekolah", {
        nama_sekolah: tahap2.namaSekolah,
        status_sekolah: tahap2.statusSekolah,
        jurusan_sekolah: tahap2.jurusanSekolah,
        nilai_rata_rata: parseFloat(tahap2.nilaiRataRata) || 85,
        tahun_lulus: parseInt(tahap2.tahunLulus) || 2026,
      });

      await api.put("/pendaftar/orang-tua", {
        nama_ayah: tahap2.namaAyah,
        nik_ayah: tahap2.nikAyah || tahap1.nik,
        kk_ayah: tahap2.kkAyah || "3512000000000000",
        tempat_lahir_ayah: tahap2.tempatLahirAyah || tahap1.tempatLahir,
        tanggal_lahir_ayah: tahap2.tanggalLahirAyah || "1975-01-01",
        alamat_ayah: tahap2.alamatAyah || tahap1.alamatDomisili,
        pendidikan_ayah: tahap2.pendidikanAyah,
        pekerjaan_ayah: tahap2.pekerjaanAyah,
        penghasilan_ayah: tahap2.penghasilanAyah,

        nama_ibu: tahap2.namaIbu,
        nik_ibu: tahap2.nikIbu || tahap1.nik,
        kk_ibu: tahap2.kkIbu || tahap2.kkAyah || "3512000000000000",
        tempat_lahir_ibu: tahap2.tempatLahirIbu || tahap1.tempatLahir,
        tanggal_lahir_ibu: tahap2.tanggalLahirIbu || "1978-01-01",
        alamat_ibu: tahap2.alamatIbu || tahap1.alamatDomisili,
        pendidikan_ibu: tahap2.pendidikanIbu,
        pekerjaan_ibu: tahap2.pekerjaanIbu,
        penghasilan_ibu: tahap2.penghasilanIbu,

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
                  onClick={() => setCurrentStep(1)}
                  className={`p-3 sm:p-4 rounded-xl flex items-center gap-3 text-left transition cursor-pointer ${
                    currentStep === 1
                      ? "bg-[#eef6f3] border border-emerald-200 shadow-2xs"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 ${
                      currentStep === 1
                        ? "bg-[#0d3830] text-white"
                        : currentStep > 1
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {currentStep > 1 ? <Check className="w-5 h-5 stroke-[2.5]" /> : "1"}
                  </div>
                  <div className="truncate">
                    <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${
                      currentStep === 1 ? "text-amber-700" : "text-slate-400"
                    }`}>
                      {currentStep === 1 ? (lang === "eng" ? "CURRENT STAGE" : "TAHAP SEKARANG") : (lang === "eng" ? "STAGE 1" : "TAHAP 1")}
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
                  onClick={() => setCurrentStep(2)}
                  className={`p-3 sm:p-4 rounded-xl flex items-center gap-3 text-left transition cursor-pointer ${
                    currentStep === 2
                      ? "bg-[#eef6f3] border border-emerald-200 shadow-2xs"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 ${
                      currentStep >= 2
                        ? "bg-[#0d3830] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {currentStep > 2 ? <Check className="w-5 h-5 stroke-[2.5]" /> : "2"}
                  </div>
                  <div className="truncate">
                    <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${
                      currentStep === 2 ? "text-amber-700" : "text-slate-400"
                    }`}>
                      {currentStep === 2 ? (lang === "eng" ? "CURRENT STAGE" : "TAHAP SEKARANG") : (lang === "eng" ? "STAGE 2" : "TAHAP 2")}
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
                  onClick={() => setCurrentStep(3)}
                  className={`p-3 sm:p-4 rounded-xl flex items-center gap-3 text-left transition cursor-pointer ${
                    currentStep === 3
                      ? "bg-[#eef6f3] border border-emerald-200 shadow-2xs"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 ${
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
                      {lang === "eng" ? "Documents & Payment" : "Berkas & Finalisasi"}
                    </h4>
                    <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:block truncate">
                      {lang === "eng" ? "Diploma, KIP & Fee Payment" : "Ijazah, KIP & Bayar VA"}
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
                <form onSubmit={handleProceedStep1} className="space-y-5 text-xs sm:text-sm">
                  {/* Pilihan Program Studi */}
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-800 block">
                      {lang === "eng" ? "Choice of Study Program" : "Pilihan Program Studi"} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "1", kode: "MPI", badgeColor: "bg-amber-100 text-amber-800 border-amber-200", title: lang === "eng" ? "Islamic Education Management (MPI)" : "S1 Manajemen Pendidikan Islam" },
                        { id: "2", kode: "AS", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200", title: lang === "eng" ? "Islamic Family Law (HKI)" : "S1 Ahwal Al-Syakhsiyah (HKI)" },
                        { id: "3", kode: "KPI", badgeColor: "bg-teal-100 text-teal-800 border-teal-200", title: lang === "eng" ? "Islamic Communication & Broadcasting (KPI)" : "S1 Komunikasi Penyiaran Islam" },
                      ].map((prodi) => {
                        const isSelected = tahap1.program_studi_id === prodi.id;
                        return (
                          <div
                            key={prodi.id}
                            onClick={() => setTahap1({ ...tahap1, program_studi_id: prodi.id })}
                            className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-[#0d3830] bg-[#eef6f3]"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border w-max mb-1.5 ${
                              isSelected ? "bg-[#0d3830] text-white border-[#0d3830]" : prodi.badgeColor
                            }`}>
                              {prodi.kode}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{prodi.title}</span>
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
                        {lang === "eng" ? "Citizenship" : "Kewarganegaraan"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={tahap1.kewarganegaraan}
                        onChange={(e) => setTahap1({ ...tahap1, kewarganegaraan: e.target.value })}
                        className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                      >
                        <option value="WNI (Warga Negara Indonesia)">
                          {lang === "eng" ? "Indonesian Citizen (WNI)" : "WNI (Warga Negara Indonesia)"}
                        </option>
                        <option value="WNA (Warga Negara Asing)">
                          {lang === "eng" ? "Foreign Citizen (WNA)" : "WNA (Warga Negara Asing)"}
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
                        <option value="Islam">Islam</option>
                        <option value="Lainnya">{lang === "eng" ? "Others" : "Lainnya"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Pernikahan Pill Selector */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-800 block">
                      {lang === "eng" ? "Marital Status" : "Status Pernikahan"} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "Belum Kawin", label: lang === "eng" ? "Single" : "Belum Kawin" },
                        { id: "Kawin", label: lang === "eng" ? "Married" : "Kawin" },
                        { id: "Duda", label: lang === "eng" ? "Widower" : "Duda" },
                        { id: "Janda", label: lang === "eng" ? "Widow" : "Janda" },
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
                      onClick={handleSaveDraft}
                      disabled={isSavingDraft}
                      className="w-full sm:w-auto px-5 py-3 bg-[#e8eeff] hover:bg-[#dbe5ff] text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Save className="w-4 h-4 text-blue-700" />
                      <span>{isSavingDraft ? (lang === "eng" ? "Saving..." : "Menyimpan...") : (lang === "eng" ? "Save Draft" : "Simpan Draft")}</span>
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#0e3831] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>{lang === "eng" ? "Proceed to Stage 2: School & Family →" : "Lanjut ke Tahap 2: Data Sekolah & Keluarga →"}</span>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's Full Name" : "Nama Lengkap Ayah Kandung"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={lang === "eng" ? "As in Family Card" : "Sesuai Kartu Keluarga"}
                            value={tahap2.namaAyah}
                            onChange={(e) => setTahap2({ ...tahap2, namaAyah: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's National ID (NIK)" : "NIK Ayah Kandung (16 Digit)"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={16}
                            placeholder="3512xxxxxxxxxxxx"
                            value={tahap2.nikAyah}
                            onChange={(e) => setTahap2({ ...tahap2, nikAyah: e.target.value.replace(/\D/g, "") })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Family Card Number (KK)" : "Nomor Kartu Keluarga (KK)"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={16}
                            placeholder="3512xxxxxxxxxxxx"
                            value={tahap2.kkAyah}
                            onChange={(e) => setTahap2({ ...tahap2, kkAyah: e.target.value.replace(/\D/g, "") })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's Place & Date of Birth" : "Tempat & Tanggal Lahir Ayah"} <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              placeholder={lang === "eng" ? "City" : "Kota Lahir"}
                              value={tahap2.tempatLahirAyah}
                              onChange={(e) => setTahap2({ ...tahap2, tempatLahirAyah: e.target.value })}
                              className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                            />
                            <input
                              type="date"
                              required
                              value={tahap2.tanggalLahirAyah}
                              onChange={(e) => setTahap2({ ...tahap2, tanggalLahirAyah: e.target.value })}
                              className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-800 block">
                          {lang === "eng" ? "Father's Residential Address" : "Alamat Domisili Ayah Kandung"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={lang === "eng" ? "Full address as in ID Card" : "Alamat lengkap sesuai KTP / Domisili saat ini"}
                          value={tahap2.alamatAyah}
                          onChange={(e) => setTahap2({ ...tahap2, alamatAyah: e.target.value })}
                          className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's Last Education" : "Pendidikan Terakhir Ayah"} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={tahap2.pendidikanAyah}
                            onChange={(e) => setTahap2({ ...tahap2, pendidikanAyah: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
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
                            {lang === "eng" ? "Father's Occupation" : "Pekerjaan Ayah"} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={tahap2.pekerjaanAyah}
                            onChange={(e) => setTahap2({ ...tahap2, pekerjaanAyah: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          >
                            <option value="Wiraswasta / Pengusaha">{lang === "eng" ? "Entrepreneur / Self-Employed" : "Wiraswasta / Pengusaha"}</option>
                            <option value="PNS / ASN">{lang === "eng" ? "Civil Servant (PNS/ASN)" : "PNS / ASN"}</option>
                            <option value="TNI / POLRI">{lang === "eng" ? "Military / Police" : "TNI / POLRI"}</option>
                            <option value="Guru / Dosen">{lang === "eng" ? "Teacher / Lecturer" : "Guru / Dosen"}</option>
                            <option value="Karyawan Swasta">{lang === "eng" ? "Private Sector Employee" : "Karyawan Swasta"}</option>
                            <option value="Petani / Peternak">{lang === "eng" ? "Farmer / Breeder" : "Petani / Peternak"}</option>
                            <option value="Nelayan">{lang === "eng" ? "Fisherman" : "Nelayan"}</option>
                            <option value="Pedagang">{lang === "eng" ? "Merchant / Trader" : "Pedagang"}</option>
                            <option value="Buruh / Pekerja Lepas">{lang === "eng" ? "Laborer / Freelancer" : "Buruh / Pekerja Lepas"}</option>
                            <option value="Pensiunan">{lang === "eng" ? "Retired" : "Pensiunan"}</option>
                            <option value="Tidak Bekerja">{lang === "eng" ? "Unemployed" : "Tidak Bekerja"}</option>
                            <option value="Lainnya">{lang === "eng" ? "Others" : "Lainnya"}</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Monthly Income Range" : "Penghasilan Rata-rata per Bulan"} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={tahap2.penghasilanAyah}
                            onChange={(e) => setTahap2({ ...tahap2, penghasilanAyah: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          >
                            <option value="di bawah Rp1.000.000">&lt; Rp1.000.000</option>
                            <option value="Rp1.000.000–2.000.000">Rp1.000.000 – 2.000.000</option>
                            <option value="Rp2.000.000–4.000.000">Rp2.000.000 – 4.000.000</option>
                            <option value="Rp4.000.000–6.000.000">Rp4.000.000 – 6.000.000</option>
                            <option value="di atas Rp6.000.000">&gt; Rp6.000.000</option>
                            <option value="Tidak Berpenghasilan">{lang === "eng" ? "No Income" : "Tidak Berpenghasilan"}</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Father's Phone / WhatsApp" : "Nomor WhatsApp Ayah / Kontak"} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Phone className="w-4 h-4" />
                            </div>
                            <input
                              type="tel"
                              placeholder="08xxxxxxxxxx"
                              value={tahap2.noHpAyah}
                              onChange={(e) => setTahap2({ ...tahap2, noHpAyah: e.target.value })}
                              className="w-full pl-10 pr-3.5 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DATA IBU */}
                  {parentTab === "ibu" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's Full Name" : "Nama Lengkap Ibu Kandung"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={lang === "eng" ? "As in Family Card" : "Sesuai Kartu Keluarga"}
                            value={tahap2.namaIbu}
                            onChange={(e) => setTahap2({ ...tahap2, namaIbu: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's National ID (NIK)" : "NIK Ibu Kandung (16 Digit)"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={16}
                            placeholder="3512xxxxxxxxxxxx"
                            value={tahap2.nikIbu}
                            onChange={(e) => setTahap2({ ...tahap2, nikIbu: e.target.value.replace(/\D/g, "") })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Family Card Number (KK)" : "Nomor Kartu Keluarga (KK)"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={16}
                            placeholder="3512xxxxxxxxxxxx"
                            value={tahap2.kkIbu || tahap2.kkAyah}
                            onChange={(e) => setTahap2({ ...tahap2, kkIbu: e.target.value.replace(/\D/g, "") })}
                            className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830] font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's Place & Date of Birth" : "Tempat & Tanggal Lahir Ibu"} <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              placeholder={lang === "eng" ? "City" : "Kota Lahir"}
                              value={tahap2.tempatLahirIbu}
                              onChange={(e) => setTahap2({ ...tahap2, tempatLahirIbu: e.target.value })}
                              className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                            />
                            <input
                              type="date"
                              required
                              value={tahap2.tanggalLahirIbu}
                              onChange={(e) => setTahap2({ ...tahap2, tanggalLahirIbu: e.target.value })}
                              className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-800 block">
                          {lang === "eng" ? "Mother's Residential Address" : "Alamat Domisili Ibu Kandung"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={lang === "eng" ? "Full address as in ID Card" : "Alamat lengkap sesuai KTP / Domisili saat ini"}
                          value={tahap2.alamatIbu || tahap2.alamatAyah}
                          onChange={(e) => setTahap2({ ...tahap2, alamatIbu: e.target.value })}
                          className="w-full p-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's Last Education" : "Pendidikan Terakhir Ibu"} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={tahap2.pendidikanIbu}
                            onChange={(e) => setTahap2({ ...tahap2, pendidikanIbu: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
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
                            {lang === "eng" ? "Mother's Occupation" : "Pekerjaan Ibu"} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={tahap2.pekerjaanIbu}
                            onChange={(e) => setTahap2({ ...tahap2, pekerjaanIbu: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          >
                            <option value="Pengurus Rumah Tangga">{lang === "eng" ? "Homemaker / Housewife" : "Pengurus Rumah Tangga"}</option>
                            <option value="PNS / ASN">{lang === "eng" ? "Civil Servant (PNS/ASN)" : "PNS / ASN"}</option>
                            <option value="Guru / Dosen">{lang === "eng" ? "Teacher / Lecturer" : "Guru / Dosen"}</option>
                            <option value="Wiraswasta / Pengusaha">{lang === "eng" ? "Entrepreneur / Self-Employed" : "Wiraswasta / Pengusaha"}</option>
                            <option value="Pedagang">{lang === "eng" ? "Merchant / Trader" : "Pedagang"}</option>
                            <option value="Karyawan Swasta">{lang === "eng" ? "Private Sector Employee" : "Karyawan Swasta"}</option>
                            <option value="Petani / Peternak">{lang === "eng" ? "Farmer / Breeder" : "Petani / Peternak"}</option>
                            <option value="Buruh / Pekerja Lepas">{lang === "eng" ? "Laborer / Freelancer" : "Buruh / Pekerja Lepas"}</option>
                            <option value="Pensiunan">{lang === "eng" ? "Retired" : "Pensiunan"}</option>
                            <option value="Tidak Bekerja">{lang === "eng" ? "Unemployed" : "Tidak Bekerja"}</option>
                            <option value="Lainnya">{lang === "eng" ? "Others" : "Lainnya"}</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Monthly Income Range" : "Penghasilan Rata-rata per Bulan"} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={tahap2.penghasilanIbu}
                            onChange={(e) => setTahap2({ ...tahap2, penghasilanIbu: e.target.value })}
                            className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
                          >
                            <option value="di bawah Rp1.000.000">&lt; Rp1.000.000</option>
                            <option value="Rp1.000.000–2.000.000">Rp1.000.000 – 2.000.000</option>
                            <option value="Rp2.000.000–4.000.000">Rp2.000.000 – 4.000.000</option>
                            <option value="Rp4.000.000–6.000.000">Rp4.000.000 – 6.000.000</option>
                            <option value="di atas Rp6.000.000">&gt; Rp6.000.000</option>
                            <option value="Tidak Berpenghasilan">{lang === "eng" ? "No Income" : "Tidak Berpenghasilan"}</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-800 block">
                            {lang === "eng" ? "Mother's Phone / WhatsApp" : "Nomor WhatsApp Ibu / Kontak"} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Phone className="w-4 h-4" />
                            </div>
                            <input
                              type="tel"
                              placeholder="08xxxxxxxxxx"
                              value={tahap2.noHpIbu}
                              onChange={(e) => setTahap2({ ...tahap2, noHpIbu: e.target.value })}
                              className="w-full pl-10 pr-3.5 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0d3830]"
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
                    <span>{lang === "eng" ? "← Back to Stage 1" : "← Kembali ke Tahap 1"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft}
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#e8eeff] hover:bg-[#dbe5ff] text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Save className="w-4 h-4 text-blue-700" />
                    <span>{isSavingDraft ? (lang === "eng" ? "Saving..." : "Menyimpan...") : (lang === "eng" ? "Save Draft" : "Simpan Draft")}</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#0e3831] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>{lang === "eng" ? "Proceed to Stage 3: Documents & Payment →" : "Lanjut ke Tahap 3: Berkas & VA →"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
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
                    {[
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
                    ].map((doc) => {
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

                {/* CARD 2: BIAYA PENDAFTARAN */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {lang === "eng" ? "Admission Fee Payment via Virtual Account (VA)" : "Biaya Pendaftaran Melalui Virtual Account (VA)"}
                    </h2>
                    <div className="px-3.5 py-1.5 rounded-xl bg-[#133b34] text-white flex items-center gap-2 self-start sm:self-center">
                      <span className="text-[11px] text-emerald-200">{lang === "eng" ? "Total Bill:" : "Total Tagihan:"}</span>
                      <strong className="text-sm font-bold font-mono">Rp 250.000</strong>
                    </div>
                  </div>

                  <div className="bg-[#eef4ff] border border-blue-200/90 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-bold text-xs">i</span>
                    </div>
                    <p className="leading-relaxed">
                      {lang === "eng"
                        ? "The admission fee is Rp 250,000 without third-party surcharges. Payment can be completed via ATM, Mobile Banking (BSI Mobile, Livin' Mandiri), or bank teller across Indonesia."
                        : "Biaya registrasi PMB STAICI murni sebesar Rp 250.000 tanpa tambahan biaya transaksi pihak ketiga. Pembayaran dapat dilakukan via ATM, Mobile Banking (BSI Mobile, Livin' Mandiri), atau teller bank di seluruh Indonesia."}
                    </p>
                  </div>

                  {/* 2 VA Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* BSI Card */}
                    <div className="bg-[#0e302b] text-white p-5 rounded-2xl border border-emerald-800/50 relative overflow-hidden shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-emerald-100">
                          Bank Syariah Indonesia (BSI)
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200">
                          VA Syariah
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-emerald-300/80 block">
                          {lang === "eng" ? "BSI Virtual Account Number:" : "Nomor Virtual Account BSI:"}
                        </span>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white">
                            8901 0260 8821 0001
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyVA("8901 0260 8821 0001", "bsi")}
                            className="p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white transition flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedVA === "bsi" ? (lang === "eng" ? "Copied!" : "Tersalin!") : (lang === "eng" ? "Copy" : "Salin")}</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] text-emerald-200/70 pt-2 border-t border-emerald-900/60">
                        {lang === "eng" ? "Account Name:" : "Atas Nama:"} <strong className="text-emerald-100">PMB STAI Cendekia Insani</strong>
                      </div>
                    </div>

                    {/* Mandiri Card */}
                    <div className="bg-[#142338] text-white p-5 rounded-2xl border border-blue-900/50 relative overflow-hidden shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-blue-100">
                          Bank Mandiri
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-800/80 text-blue-200">
                          VA Partner
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-blue-300/80 block">
                          {lang === "eng" ? "Mandiri Virtual Account Number:" : "Nomor Virtual Account Mandiri:"}
                        </span>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white">
                            8872 1026 0034 5678
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyVA("8872 1026 0034 5678", "mandiri")}
                            className="p-1.5 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-200 hover:text-white transition flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedVA === "mandiri" ? (lang === "eng" ? "Copied!" : "Tersalin!") : (lang === "eng" ? "Copy" : "Salin")}</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] text-blue-200/70 pt-2 border-t border-blue-900/60">
                        {lang === "eng" ? "Account Name:" : "Atas Nama:"} <strong className="text-blue-100">KAS PMB STAICI SITUBONDO</strong>
                      </div>
                    </div>
                  </div>

                  {/* Upload Bukti Transfer */}
                  <div className="p-4 sm:p-5 bg-[#f0f3f8] border border-slate-200/90 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#0d3830] text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {lang === "eng" ? "Upload Virtual Account Payment Receipt" : "Unggah Bukti Transfer Virtual Account"}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {lang === "eng" ? "Attach ATM receipt or mobile banking screenshot (JPG/PDF max 2MB)." : "Wajib lampirkan resi struk ATM atau tangkapan layar m-banking (JPG/PDF maks 2MB)."}
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
                    <span>{lang === "eng" ? "← Back to Stage 2" : "← Kembali ke Tahap 2"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft}
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#e8eeff] hover:bg-[#dbe5ff] text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Save className="w-4 h-4 text-blue-700" />
                    <span>{isSavingDraft ? (lang === "eng" ? "Saving..." : "Menyimpan...") : (lang === "eng" ? "Save Draft" : "Simpan Draft")}</span>
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
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{lang === "eng" ? "High School Diploma / Graduation Certificate" : "Fotokopi Ijazah / SKL SMA/MA/SMK"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{lang === "eng" ? "Family Card (KK) & ID Card / Birth Certificate" : "Kartu Keluarga (KK) & KTP / Akta Kelahiran"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{lang === "eng" ? "Formal Color Photo (3x4)" : "Pas Foto Resmi 3x4 latar merah"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{lang === "eng" ? "KIP Card / Recommendation Certificate (if any)" : "Kartu KIP / Piagam Prestasi (jika ada)"}</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Hotline Panitia PMB */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Headphones className="w-5 h-5 text-amber-600" />
                <h3>{t.sidebar.hotlineTitle}</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {t.sidebar.hotlineDesc}
              </p>

              <a
                href="https://wa.me/6285233432221?text=Halo%20Panitia%20PMB%20STAICI,%20saya%20ingin%20berkonsultasi%20pendaftaran"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 bg-[#eef7f2] hover:bg-[#e2f2e9] rounded-2xl border border-emerald-200 transition group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#0d3830] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-600">{t.sidebar.whatsappLabel}</span>
                  <span className="text-base font-bold text-slate-900 font-mono">0852-3343-2221</span>
                </div>
              </a>

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
