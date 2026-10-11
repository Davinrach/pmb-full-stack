"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  User,
  GraduationCap,
  Users,
  BookOpen,
  UploadCloud,
  FileCheck,
  Lock,
  AlertCircle,
  Trash2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { api, authStorage } from "@/lib/api";

const PEKERJAAN_OPTIONS = [
  "Tidak Bekerja",
  "Pensiunan",
  "PNS",
  "TNI/Polisi",
  "Guru/Dosen",
  "Pegawai Swasta",
  "Pengusaha/Wiraswasta",
  "Pengacara/Hakim/Jaksa/Notaris",
  "Seniman/Pelukis/Artis",
  "Dokter/Bidan/Perawat",
  "Pilot/Pramugari",
  "Pedagang",
  "Petani/Peternak",
  "Nelayan",
  "Buruh",
  "Sopir/Masinis/Kondektur",
  "Politikus",
  "Pengurus Rumah Tangga",
  "Lainnya",
];

const PENGHASILAN_OPTIONS = [
  "di bawah Rp1.000.000",
  "Rp1.000.000–2.000.000",
  "Rp2.000.000–4.000.000",
  "Rp4.000.000–6.000.000",
  "di atas Rp6.000.000",
];

const PENDIDIKAN_OPTIONS = [
  "Tidak Sekolah",
  "SD / Sederajat",
  "SMP / MTs / Sederajat",
  "SMA / MA / SMK / Sederajat",
  "D1 / D2 / D3",
  "D4 / S1 (Sarjana)",
  "S2 (Magister)",
  "S3 (Doktor)",
  "Pesantren / Lainnya",
];

const STEPS = [
  { id: 1, title: "Identitas Diri", icon: User },
  { id: 2, title: "Asal Sekolah", icon: GraduationCap },
  { id: 3, title: "Data Orang Tua", icon: Users },
  { id: 4, title: "Pilihan Prodi", icon: BookOpen },
  { id: 5, title: "Upload Berkas", icon: UploadCloud },
  { id: 6, title: "Review & Submit", icon: FileCheck },
];

export default function FormulirPendaftaranPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [pendaftar, setPendaftar] = useState<any>(null);
  const [programStudis, setProgramStudis] = useState<any[]>([]);
  const [gelombangs, setGelombangs] = useState<any[]>([]);

  // Step 1: Identitas Diri
  const [identitas, setIdentitas] = useState({
    jenis_kelamin: "Laki-laki",
    alamat: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    status_warga_negara: "WNI",
    negara_wna: "",
    agama: "Islam",
    status_pernikahan: "Tidak Kawin",
  });

  // Step 2: Asal Sekolah
  const [asalSekolah, setAsalSekolah] = useState({
    nama_sekolah: "",
    status_sekolah: "Negeri",
    jurusan_sekolah: "IPA",
    nilai_rata_rata: "85.00",
    tahun_lulus: new Date().getFullYear(),
  });

  // Step 3: Data Orang Tua & Wali
  const [orangTua, setOrangTua] = useState({
    nama_ayah: "",
    nik_ayah: "",
    kk_ayah: "",
    tempat_lahir_ayah: "",
    tanggal_lahir_ayah: "",
    alamat_ayah: "",
    pendidikan_ayah: "SMA / MA / SMK / Sederajat",
    pekerjaan_ayah: "Wiraswasta",
    penghasilan_ayah: "Rp2.000.000–4.000.000",

    nama_ibu: "",
    nik_ibu: "",
    kk_ibu: "",
    tempat_lahir_ibu: "",
    tanggal_lahir_ibu: "",
    alamat_ibu: "",
    pendidikan_ibu: "SMA / MA / SMK / Sederajat",
    pekerjaan_ibu: "Pengurus Rumah Tangga",
    penghasilan_ibu: "di bawah Rp1.000.000",

    nama_wali: "",
    alamat_wali: "",
    no_hp_orang_tua_wali: "",
  });

  // Step 4: Prodi & Gelombang
  const [prodiGelombang, setProdiGelombang] = useState({
    program_studi_id: 0,
    gelombang_id: 0,
  });

  // Step 5: Berkas
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [meRes, pmbRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/info-pmb"),
      ]);

      if (meRes.data && meRes.data.pendaftar) {
        const p = meRes.data.pendaftar;
        setPendaftar(p);

        // Populate form states
        if (p.jenis_kelamin) {
          setIdentitas({
            jenis_kelamin: p.jenis_kelamin || "Laki-laki",
            alamat: p.alamat || "",
            tempat_lahir: p.tempat_lahir || "",
            tanggal_lahir: p.tanggal_lahir ? p.tanggal_lahir.split("T")[0] : "",
            status_warga_negara: p.status_warga_negara || "WNI",
            negara_wna: p.negara_wna || "",
            agama: p.agama || "Islam",
            status_pernikahan: p.status_pernikahan || "Tidak Kawin",
          });
        }

        if (p.nama_sekolah) {
          setAsalSekolah({
            nama_sekolah: p.nama_sekolah || "",
            status_sekolah: p.status_sekolah || "Negeri",
            jurusan_sekolah: p.jurusan_sekolah || "",
            nilai_rata_rata: String(p.nilai_rata_rata || "80.00"),
            tahun_lulus: p.tahun_lulus || new Date().getFullYear(),
          });
        }

        if (p.data_orang_tua) {
          const ot = p.data_orang_tua;
          setOrangTua({
            nama_ayah: ot.nama_ayah || "",
            nik_ayah: ot.nik_ayah || "",
            kk_ayah: ot.kk_ayah || "",
            tempat_lahir_ayah: ot.tempat_lahir_ayah || "",
            tanggal_lahir_ayah: ot.tanggal_lahir_ayah ? ot.tanggal_lahir_ayah.split("T")[0] : "",
            alamat_ayah: ot.alamat_ayah || "",
            pendidikan_ayah: ot.pendidikan_ayah || "SMA / MA / SMK / Sederajat",
            pekerjaan_ayah: ot.pekerjaan_ayah || "Wiraswasta",
            penghasilan_ayah: ot.penghasilan_ayah || "Rp2.000.000–4.000.000",

            nama_ibu: ot.nama_ibu || "",
            nik_ibu: ot.nik_ibu || "",
            kk_ibu: ot.kk_ibu || "",
            tempat_lahir_ibu: ot.tempat_lahir_ibu || "",
            tanggal_lahir_ibu: ot.tanggal_lahir_ibu ? ot.tanggal_lahir_ibu.split("T")[0] : "",
            alamat_ibu: ot.alamat_ibu || "",
            pendidikan_ibu: ot.pendidikan_ibu || "SMA / MA / SMK / Sederajat",
            pekerjaan_ibu: ot.pekerjaan_ibu || "Pengurus Rumah Tangga",
            penghasilan_ibu: ot.penghasilan_ibu || "di bawah Rp1.000.000",

            nama_wali: ot.nama_wali || "",
            alamat_wali: ot.alamat_wali || "",
            no_hp_orang_tua_wali: ot.no_hp_orang_tua_wali || meRes.data.user.no_hp || "",
          });
        }

        if (p.program_studi_id) {
          setProdiGelombang({
            program_studi_id: p.program_studi_id,
            gelombang_id: p.gelombang_id || (pmbRes.data.gelombang[0]?.id || 1),
          });
        } else if (pmbRes.data) {
          setProdiGelombang({
            program_studi_id: pmbRes.data.program_studi[0]?.id || 1,
            gelombang_id: pmbRes.data.gelombang[0]?.id || 1,
          });
        }
      }

      if (pmbRes.data) {
        setProgramStudis(pmbRes.data.program_studi || []);
        setGelombangs(pmbRes.data.gelombang || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memuat formulir");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (currentUser && (currentUser.role === "admin_pmb" || currentUser.role === "super_admin")) {
      router.replace("/admincms");
      return;
    }
    loadData();
  }, []);

  const saveStep1 = async () => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      await api.put("/pendaftar/identitas", identitas);
      setSuccessMessage("Identitas diri berhasil disimpan");
      setCurrentStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan identitas");
    } finally {
      setIsSaving(false);
    }
  };

  const saveStep2 = async () => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      await api.put("/pendaftar/asal-sekolah", {
        ...asalSekolah,
        nilai_rata_rata: parseFloat(asalSekolah.nilai_rata_rata) || 0,
        tahun_lulus: parseInt(String(asalSekolah.tahun_lulus)) || new Date().getFullYear(),
      });
      setSuccessMessage("Data asal sekolah berhasil disimpan");
      setCurrentStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan asal sekolah");
    } finally {
      setIsSaving(false);
    }
  };

  const saveStep3 = async () => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      await api.put("/pendaftar/orang-tua", orangTua);
      setSuccessMessage("Data orang tua & kontak berhasil disimpan");
      setCurrentStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan data orang tua");
    } finally {
      setIsSaving(false);
    }
  };

  const saveStep4 = async () => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      await api.put("/pendaftar/prodi-gelombang", {
        program_studi_id: Number(prodiGelombang.program_studi_id),
        gelombang_id: Number(prodiGelombang.gelombang_id),
      });
      setSuccessMessage("Pilihan program studi berhasil disimpan");
      setCurrentStep(5);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan pilihan prodi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (
    jenisDokumen: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file melebihi batas maksimal 2 MB!");
      return;
    }

    setUploadingDoc(jenisDokumen);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("jenis_dokumen", jenisDokumen);
    formData.append("file", file);

    try {
      await api.upload("/pendaftar/berkas", formData);
      await loadData();
      setSuccessMessage(`Berkas ${jenisDokumen.toUpperCase()} berhasil diunggah!`);
    } catch (err: any) {
      setErrorMessage(err.message || `Gagal mengunggah berkas ${jenisDokumen}`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDeleteBerkas = async (berkasId: number) => {
    if (!confirm("Hapus berkas ini?")) return;
    try {
      await api.delete(`/pendaftar/berkas/${berkasId}`);
      await loadData();
      setSuccessMessage("Berkas berhasil dihapus");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghapus berkas");
    }
  };

  const handleSubmitFinal = async () => {
    if (!confirm("Apakah Anda yakin seluruh data yang dimasukkan sudah benar? Data akan dikunci setelah Anda men-submit.")) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    try {
      const res = await api.post("/pendaftar/submit");
      alert(`Pendaftaran Berhasil Disubmit!\nNomor Registrasi Anda: ${res.data.nomor_pendaftaran}`);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal melakukan submit final pendaftaran");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0d3830]" />
          <span>Memuat data formulir...</span>
        </div>
      </div>
    );
  }

  const isLocked = pendaftar?.is_locked;

  const getUploadedBerkas = (jenis: string) => {
    return pendaftar?.berkas?.find(
      (b: any) => b.jenis_dokumen.toLowerCase() === jenis.toLowerCase()
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">
              Formulir PMB Terpadu:
            </span>
            <span className="text-xs font-extrabold text-[#0d3830] font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {pendaftar?.nomor_pendaftaran || "Draft Baru"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* Lock Alert if Submitted */}
        {isLocked && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-900 text-xs sm:text-sm shadow-2xs">
            <Lock className="w-5 h-5 flex-shrink-0 text-amber-700" />
            <p>
              <strong>Formulir Terkunci:</strong> Anda telah men-submit pendaftaran final dengan Nomor Registrasi{" "}
              <strong className="font-mono">{pendaftar.nomor_pendaftaran}</strong>. Data tidak dapat diedit lagi kecuali panitia PMB meminta perbaikan berkas.
            </p>
          </div>
        )}

        {/* Step Indicator Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between min-w-[640px] gap-2">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = currentStep === s.id;
              const isDone = currentStep > s.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-1 ${
                    isActive
                      ? "bg-[#0d3830] text-white shadow-xs"
                      : isDone
                      ? "bg-emerald-50 text-[#0d3830] hover:bg-emerald-100/70"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                      isActive
                        ? "bg-white text-[#0d3830]"
                        : isDone
                        ? "bg-emerald-200 text-[#0d3830]"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                  </div>
                  <span className="truncate">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-700 flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: IDENTITAS MAHASISWA */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                Bagian 1: Identitas Calon Mahasiswa
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Data pribadi mengacu pada Formulir Lembar Penerimaan Mahasiswa Baru &amp; format EMIS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Jenis Kelamin *</label>
                <select
                  disabled={isLocked}
                  value={identitas.jenis_kelamin}
                  onChange={(e) => setIdentitas({ ...identitas, jenis_kelamin: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Agama *</label>
                <select
                  disabled={isLocked}
                  value={identitas.agama}
                  onChange={(e) => setIdentitas({ ...identitas, agama: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                >
                  <option value="Islam">Islam</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Tempat Lahir *</label>
                <input
                  type="text"
                  disabled={isLocked}
                  required
                  placeholder="Contoh: Situbondo"
                  value={identitas.tempat_lahir}
                  onChange={(e) => setIdentitas({ ...identitas, tempat_lahir: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Tanggal Lahir *</label>
                <input
                  type="date"
                  disabled={isLocked}
                  required
                  value={identitas.tanggal_lahir}
                  onChange={(e) => setIdentitas({ ...identitas, tanggal_lahir: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Kewarganegaraan *</label>
                <select
                  disabled={isLocked}
                  value={identitas.status_warga_negara}
                  onChange={(e) => setIdentitas({ ...identitas, status_warga_negara: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                >
                  <option value="WNI">WNI (Warga Negara Indonesia)</option>
                  <option value="WNA">WNA (Warga Negara Asing)</option>
                </select>
              </div>

              {identitas.status_warga_negara === "WNA" && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900">Nama Negara Asal</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="Nama Negara"
                    value={identitas.negara_wna}
                    onChange={(e) => setIdentitas({ ...identitas, negara_wna: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Status Pernikahan *</label>
                <select
                  disabled={isLocked}
                  value={identitas.status_pernikahan}
                  onChange={(e) => setIdentitas({ ...identitas, status_pernikahan: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                >
                  <option value="Tidak Kawin">Belum Menikah (Tidak Kawin)</option>
                  <option value="Kawin">Menikah (Kawin)</option>
                  <option value="Janda">Janda</option>
                  <option value="Duda">Duda</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-900">Alamat Tempat Tinggal Lengkap *</label>
                <textarea
                  disabled={isLocked}
                  required
                  rows={3}
                  placeholder="Jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan, Kabupaten/Kota"
                  value={identitas.alamat}
                  onChange={(e) => setIdentitas({ ...identitas, alamat: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={isLocked ? () => setCurrentStep(2) : saveStep1}
                disabled={isSaving}
                className="px-6 py-3 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <span>{isLocked ? "Lanjut ke Asal Sekolah" : "Simpan & Lanjut"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ASAL SEKOLAH SLTA */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                Bagian 2: Data Asal Sekolah (SLTA)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Informasi sekolah menengah (SMA / MA / SMK / Pondok Pesantren).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-900">Nama Sekolah Asal *</label>
                <input
                  type="text"
                  disabled={isLocked}
                  required
                  placeholder="Contoh: MAN 1 Situbondo / SMA Negeri 1 Panarukan"
                  value={asalSekolah.nama_sekolah}
                  onChange={(e) => setAsalSekolah({ ...asalSekolah, nama_sekolah: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Status Sekolah *</label>
                <select
                  disabled={isLocked}
                  value={asalSekolah.status_sekolah}
                  onChange={(e) => setAsalSekolah({ ...asalSekolah, status_sekolah: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                >
                  <option value="Negeri">Negeri</option>
                  <option value="Swasta">Swasta</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Program / Jurusan *</label>
                <input
                  type="text"
                  disabled={isLocked}
                  required
                  placeholder="Contoh: IPA / IPS / Keagamaan / TKJ"
                  value={asalSekolah.jurusan_sekolah}
                  onChange={(e) => setAsalSekolah({ ...asalSekolah, jurusan_sekolah: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Nilai Rata-rata / IP UAS *</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={isLocked}
                  required
                  placeholder="Contoh: 85.50"
                  value={asalSekolah.nilai_rata_rata}
                  onChange={(e) => setAsalSekolah({ ...asalSekolah, nilai_rata_rata: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Tahun Lulus *</label>
                <input
                  type="number"
                  disabled={isLocked}
                  required
                  placeholder="2026"
                  value={asalSekolah.tahun_lulus}
                  onChange={(e) => setAsalSekolah({ ...asalSekolah, tahun_lulus: Number(e.target.value) })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0d3830]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                onClick={isLocked ? () => setCurrentStep(3) : saveStep2}
                disabled={isSaving}
                className="px-6 py-3 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <span>{isLocked ? "Lanjut ke Data Orang Tua" : "Simpan & Lanjut"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DATA ORANG TUA (AYAH & IBU) & WALI */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                Bagian 3: Data Orang Tua &amp; Wali
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Data Ayah dan Ibu diisi terpisah untuk keperluan sinkronisasi EMIS &amp; Kopertais IV Surabaya.
              </p>
            </div>

            {/* Data Ayah */}
            <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
              <h3 className="text-sm font-bold text-[#0d3830] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Data Ayah Kandung</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Nama Ayah *</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    required
                    placeholder="Nama lengkap Ayah"
                    value={orangTua.nama_ayah}
                    onChange={(e) => setOrangTua({ ...orangTua, nama_ayah: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">NIK &amp; No. KK Ayah *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled={isLocked}
                      required
                      placeholder="NIK Ayah (16 digit)"
                      value={orangTua.nik_ayah}
                      onChange={(e) => setOrangTua({ ...orangTua, nik_ayah: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      disabled={isLocked}
                      required
                      placeholder="No. Kartu Keluarga"
                      value={orangTua.kk_ayah}
                      onChange={(e) => setOrangTua({ ...orangTua, kk_ayah: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Tempat &amp; Tgl Lahir Ayah</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled={isLocked}
                      placeholder="Tempat Lahir"
                      value={orangTua.tempat_lahir_ayah}
                      onChange={(e) => setOrangTua({ ...orangTua, tempat_lahir_ayah: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                    <input
                      type="date"
                      disabled={isLocked}
                      value={orangTua.tanggal_lahir_ayah}
                      onChange={(e) => setOrangTua({ ...orangTua, tanggal_lahir_ayah: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Pendidikan Terakhir Ayah *</label>
                  <select
                    disabled={isLocked}
                    value={orangTua.pendidikan_ayah}
                    onChange={(e) => setOrangTua({ ...orangTua, pendidikan_ayah: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  >
                    {PENDIDIKAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Pekerjaan Ayah *</label>
                  <select
                    disabled={isLocked}
                    value={orangTua.pekerjaan_ayah}
                    onChange={(e) => setOrangTua({ ...orangTua, pekerjaan_ayah: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  >
                    {PEKERJAAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Penghasilan Bulanan Ayah *</label>
                  <select
                    disabled={isLocked}
                    value={orangTua.penghasilan_ayah}
                    onChange={(e) => setOrangTua({ ...orangTua, penghasilan_ayah: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  >
                    {PENGHASILAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-900">Alamat Tempat Tinggal Ayah *</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="Alamat Ayah"
                    value={orangTua.alamat_ayah}
                    onChange={(e) => setOrangTua({ ...orangTua, alamat_ayah: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Data Ibu */}
            <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
              <h3 className="text-sm font-bold text-[#0d3830] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Data Ibu Kandung</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Nama Ibu *</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    required
                    placeholder="Nama lengkap Ibu"
                    value={orangTua.nama_ibu}
                    onChange={(e) => setOrangTua({ ...orangTua, nama_ibu: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">NIK &amp; No. KK Ibu *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled={isLocked}
                      required
                      placeholder="NIK Ibu (16 digit)"
                      value={orangTua.nik_ibu}
                      onChange={(e) => setOrangTua({ ...orangTua, nik_ibu: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      disabled={isLocked}
                      required
                      placeholder="No. Kartu Keluarga"
                      value={orangTua.kk_ibu}
                      onChange={(e) => setOrangTua({ ...orangTua, kk_ibu: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Tempat &amp; Tgl Lahir Ibu</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled={isLocked}
                      placeholder="Tempat Lahir"
                      value={orangTua.tempat_lahir_ibu}
                      onChange={(e) => setOrangTua({ ...orangTua, tempat_lahir_ibu: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                    <input
                      type="date"
                      disabled={isLocked}
                      value={orangTua.tanggal_lahir_ibu}
                      onChange={(e) => setOrangTua({ ...orangTua, tanggal_lahir_ibu: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Pendidikan Terakhir Ibu *</label>
                  <select
                    disabled={isLocked}
                    value={orangTua.pendidikan_ibu}
                    onChange={(e) => setOrangTua({ ...orangTua, pendidikan_ibu: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  >
                    {PENDIDIKAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Pekerjaan Ibu *</label>
                  <select
                    disabled={isLocked}
                    value={orangTua.pekerjaan_ibu}
                    onChange={(e) => setOrangTua({ ...orangTua, pekerjaan_ibu: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  >
                    {PEKERJAAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Penghasilan Bulanan Ibu *</label>
                  <select
                    disabled={isLocked}
                    value={orangTua.penghasilan_ibu}
                    onChange={(e) => setOrangTua({ ...orangTua, penghasilan_ibu: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  >
                    {PENGHASILAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-900">Alamat Tempat Tinggal Ibu *</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="Alamat Ibu"
                    value={orangTua.alamat_ibu}
                    onChange={(e) => setOrangTua({ ...orangTua, alamat_ibu: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Data Wali & Kontak */}
            <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
              <h3 className="text-sm font-bold text-[#0d3830] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Data Wali (Opsional) &amp; Kontak Kopertais</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Nama Wali (Jika Ada)</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="Nama Wali Calon Mahasiswa"
                    value={orangTua.nama_wali}
                    onChange={(e) => setOrangTua({ ...orangTua, nama_wali: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900">No. HP Orang Tua / Wali *</label>
                  <input
                    type="tel"
                    disabled={isLocked}
                    required
                    placeholder="08xxxxxxxxxx"
                    value={orangTua.no_hp_orang_tua_wali}
                    onChange={(e) => setOrangTua({ ...orangTua, no_hp_orang_tua_wali: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-900">Alamat Wali</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="Alamat Wali"
                    value={orangTua.alamat_wali}
                    onChange={(e) => setOrangTua({ ...orangTua, alamat_wali: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                onClick={isLocked ? () => setCurrentStep(4) : saveStep3}
                disabled={isSaving}
                className="px-6 py-3 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <span>{isLocked ? "Lanjut ke Pilihan Prodi" : "Simpan & Lanjut"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PILIHAN PROGRAM STUDI & GELOMBANG */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                Bagian 4: Pilihan Program Studi &amp; Gelombang PMB
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pilih salah satu dari 3 Program Studi resmi STAI Cendekia Insani Situbondo.
              </p>
            </div>

            <div className="space-y-4">
              <label className="font-bold text-slate-900 text-xs sm:text-sm block">
                Pilih Program Studi *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {programStudis.map((prodi) => {
                  const isSelected = Number(prodiGelombang.program_studi_id) === prodi.id;
                  return (
                    <div
                      key={prodi.id}
                      onClick={() => !isLocked && setProdiGelombang({ ...prodiGelombang, program_studi_id: prodi.id })}
                      className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#0d3830] bg-[#e8f8f2]/40 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded bg-[#0d3830] text-white inline-block">
                          {prodi.kode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{prodi.nama}</h4>
                        <p className="text-xs text-slate-600 line-clamp-3">{prodi.deskripsi}</p>
                      </div>
                      <div className="pt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Jenjang {prodi.jenjang}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0d3830]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="font-bold text-slate-900 text-xs sm:text-sm block">
                Gelombang Pendaftaran Aktif
              </label>
              <select
                disabled={isLocked}
                value={prodiGelombang.gelombang_id}
                onChange={(e) => setProdiGelombang({ ...prodiGelombang, gelombang_id: Number(e.target.value) })}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
              >
                {gelombangs.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama} — Biaya: Rp {Number(g.biaya_pendaftaran).toLocaleString("id-ID")}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                onClick={isLocked ? () => setCurrentStep(5) : saveStep4}
                disabled={isSaving}
                className="px-6 py-3 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <span>{isLocked ? "Lanjut ke Upload Berkas" : "Simpan & Lanjut"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: UPLOAD BERKAS */}
        {currentStep === 5 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                Bagian 5: Upload Berkas Persyaratan
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Format file didukung: JPG, PNG, PDF (Maksimal 2 MB per file).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { key: "kk", label: "Kartu Keluarga (KK)", wajib: true },
                { key: "ktp", label: "KTP Calon Mahasiswa", wajib: true },
                { key: "ijazah", label: "Ijazah / SKL SLTA", wajib: true },
                { key: "foto", label: "Pas Foto 3x4 Berwarna", wajib: true },
                { key: "kip", label: "Kartu KIP (Khusus Beasiswa KIP)", wajib: false },
                { key: "lainnya", label: "Dokumen Pendukung Lainnya", wajib: false },
              ].map((doc) => {
                const uploaded = getUploadedBerkas(doc.key);
                const isUploading = uploadingDoc === doc.key;

                return (
                  <div
                    key={doc.key}
                    className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-2xl flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                          {doc.label} {doc.wajib && <span className="text-red-500">*</span>}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {doc.wajib ? "Berkas Wajib" : "Berkas Opsional"}
                        </span>
                      </div>
                      {uploaded && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Terunggah</span>
                        </span>
                      )}
                    </div>

                    {uploaded ? (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="truncate max-w-[200px]">
                          <span className="font-medium text-slate-800 block truncate">
                            {uploaded.file_name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {(uploaded.file_size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/berkas/${uploaded.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-600 hover:text-[#0d3830] hover:bg-slate-100 rounded-lg"
                            title="Lihat Berkas"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() => handleDeleteBerkas(uploaded.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Hapus / Ganti Berkas"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <label className="w-full py-2.5 bg-white border border-dashed border-slate-300 hover:border-[#0d3830] rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0d3830] cursor-pointer transition shadow-2xs">
                          <UploadCloud className="w-4 h-4" />
                          <span>{isUploading ? "Mengunggah..." : "Pilih File (Maks 2 MB)"}</span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            disabled={isLocked || isUploading}
                            onChange={(e) => handleFileUpload(doc.key, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-6 py-3 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Review &amp; Submit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & FINAL SUBMIT */}
        {currentStep === 6 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                Bagian 6: Review &amp; Submit Pendaftaran
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Periksa kembali data Anda sebelum men-submit formulir final.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-200/60">
                <div>
                  <span className="text-slate-500 block text-xs">Nama Lengkap</span>
                  <strong className="text-slate-900 font-bold">{pendaftar?.user?.nama_lengkap}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">NIK (16 Digit)</span>
                  <strong className="text-slate-900 font-mono font-bold">{pendaftar?.user?.nik}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Program Studi Pilihan</span>
                  <strong className="text-[#0d3830] font-bold">
                    {pendaftar?.program_studi?.nama || "Belum dipilih"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Gelombang Pendaftaran</span>
                  <strong className="text-slate-900 font-bold">
                    {pendaftar?.gelombang?.nama || "Gelombang 1"}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-xs">Asal Sekolah</span>
                  <strong className="text-slate-900 font-bold">
                    {asalSekolah.nama_sekolah} ({asalSekolah.jurusan_sekolah})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Nama Ayah &amp; Ibu</span>
                  <strong className="text-slate-900 font-bold">
                    {orangTua.nama_ayah} / {orangTua.nama_ibu}
                  </strong>
                </div>
              </div>
            </div>

            {isLocked ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Pendaftaran Telah Disubmit</h4>
                <p className="text-xs text-slate-600">
                  Nomor Registrasi PMB Anda: <strong className="font-mono text-[#0d3830]">{pendaftar.nomor_pendaftaran}</strong>
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/dashboard/pembayaran"
                    className="px-5 py-2.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Lanjut ke Pembayaran
                  </Link>
                  <Link
                    href="/dashboard/cetak"
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-xs"
                  >
                    Cetak Kartu Peserta
                  </Link>
                </div>
              </div>
            ) : (
              <div className="pt-4 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dengan menekan tombol <strong>&quot;Submit Pendaftaran Final&quot;</strong>, sistem akan membuat Nomor Registrasi PMB otomatis (format: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">PMB-2026-XXXX</code>) dan mengunci formulir dari perubahan lebih lanjut.
                </p>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitFinal}
                    disabled={isSaving}
                    className="px-8 py-3.5 bg-[#0d3830] hover:bg-[#165349] text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isSaving ? "Men-submit Pendaftaran..." : "Submit Pendaftaran Final"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
