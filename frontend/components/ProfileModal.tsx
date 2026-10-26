"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Lock,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Phone,
  Mail,
  CreditCard,
  Sparkles,
  Save,
  KeyRound,
} from "lucide-react";
import { api, authStorage, UserSession, getFileUrl } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: (user: UserSession) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  onUserUpdated,
}: ProfileModalProps) {
  const { lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Profile Form State
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noHp, setNoHp] = useState("");
  const [fotoProfil, setFotoProfil] = useState<string | undefined>("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Feedback State
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadUserData = () => {
    const user = authStorage.getUser();
    if (user) {
      setCurrentUser(user);
      setNamaLengkap(user.nama_lengkap || "");
      setNoHp(user.no_hp || "");
      setFotoProfil(user.foto_profil || "");
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUserData();
      setErrorMessage("");
      setSuccessMessage("");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getInitials = (name?: string) => {
    if (!name) return "PMB";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!namaLengkap.trim()) {
      setErrorMessage("Nama lengkap tidak boleh kosong.");
      return;
    }
    if (!noHp.trim()) {
      setErrorMessage("Nomor WhatsApp/HP tidak boleh kosong.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await api.put("/auth/profile", {
        nama_lengkap: namaLengkap.trim(),
        no_hp: noHp.trim(),
      });

      if (res.data) {
        const updatedUser: UserSession = {
          ...(currentUser as UserSession),
          nama_lengkap: res.data.nama_lengkap,
          no_hp: res.data.no_hp,
          foto_profil: res.data.foto_profil || fotoProfil,
        };
        authStorage.setUser(updatedUser);
        setCurrentUser(updatedUser);
        if (onUserUpdated) onUserUpdated(updatedUser);
      }

      setSuccessMessage("Profil Anda berhasil diperbarui!");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memperbarui profil pengguna.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran foto maksimal adalah 5MB.");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Format foto harus JPG, PNG, atau WEBP.");
      return;
    }

    setIsUploadingPhoto(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("foto_profil", file);

    try {
      const res = await api.upload("/auth/profile/photo", formData);
      if (res.data) {
        const updatedUser: UserSession = {
          ...(currentUser as UserSession),
          foto_profil: res.data.foto_profil,
        };
        authStorage.setUser(updatedUser);
        setCurrentUser(updatedUser);
        setFotoProfil(res.data.foto_profil);
        if (onUserUpdated) onUserUpdated(updatedUser);
      }
      setSuccessMessage("Foto profil berhasil diperbarui!");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah foto profil.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    if (!fotoProfil) return;
    if (!confirm("Apakah Anda yakin ingin menghapus foto profil ini?")) return;

    setIsUploadingPhoto(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.delete("/auth/profile/photo");
      const updatedUser: UserSession = {
        ...(currentUser as UserSession),
        foto_profil: "",
      };
      authStorage.setUser(updatedUser);
      setCurrentUser(updatedUser);
      setFotoProfil("");
      if (onUserUpdated) onUserUpdated(updatedUser);

      setSuccessMessage("Foto profil berhasil dihapus.");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghapus foto profil.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!oldPassword) {
      setErrorMessage("Kata sandi saat ini harus diisi.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("Kata sandi baru harus memiliki minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.post("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setSuccessMessage("Kata sandi Anda berhasil diperbarui!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengubah kata sandi.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "super_admin":
        return { label: "Super Administrator", color: "bg-[#0d3830] text-emerald-100 border-[#0d3830]" };
      case "admin_pmb":
        return { label: "Admin Panitia PMB", color: "bg-slate-100 text-slate-800 border-slate-200" };
      default:
        return { label: "Calon Mahasiswa", color: "bg-emerald-50 text-emerald-800 border-emerald-200/80" };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto font-sans">
      <div className="bg-white rounded-[28px] max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 relative animate-scaleUp my-8">
        {/* Top Accent Gradient Header */}
        <div className="h-2 w-full bg-gradient-to-r from-[#0d3830] via-[#165349] to-[#0d3830]" />

        {/* Modal Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0d3830] border border-emerald-100 flex items-center justify-center">
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                Pengaturan Akun & Profil
              </h3>
              <p className="text-xs text-slate-500">Kelola informasi pribadi dan keamanan kata sandi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 sm:px-8 bg-slate-50/70">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "profile"
                ? "border-[#0d3830] text-[#0d3830]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Saya</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("security");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "security"
                ? "border-[#0d3830] text-[#0d3830]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Keamanan & Kata Sandi</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: PROFIL SAYA */}
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 pb-4 border-b border-slate-100">
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#0d3830] text-emerald-300 font-extrabold text-2xl flex items-center justify-center overflow-hidden border-2 border-emerald-200 shadow-md">
                    {fotoProfil ? (
                      <Image
                        src={getFileUrl(fotoProfil)}
                        alt="Foto Profil"
                        width={88}
                        height={88}
                        unoptimized
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span>{getInitials(currentUser?.nama_lengkap)}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-[#0d3830] hover:bg-[#165349] text-white shadow-md transition cursor-pointer border-2 border-white"
                    title="Ganti Foto Profil"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900">
                      {currentUser?.nama_lengkap}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                  <div className="flex items-center gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? "Mengunggah..." : "Ubah Foto"}</span>
                    </button>
                    {fotoProfil && (
                      <button
                        type="button"
                        onClick={handleDeletePhoto}
                        disabled={isUploadingPhoto}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs transition cursor-pointer"
                        title="Hapus Foto Profil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nama Lengkap</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-2 focus:ring-emerald-900/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nomor WhatsApp / HP</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-2 focus:ring-emerald-900/10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>NIK / Username (Kunci)</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.nik || "-"}
                      className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-xs font-mono cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Alamat Email (Terverifikasi)</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.email || "-"}
                      className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-xs cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-3 bg-[#0d3830] hover:bg-[#072520] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menyimpan Perubahan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Profil</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: KEAMANAN & KATA SANDI */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                🔒 <strong>Ganti Kata Sandi:</strong> Masukkan kata sandi saat ini, kemudian buat kata sandi baru minimal 8 karakter.
              </div>

              {/* Old Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    required
                    placeholder="Masukkan kata sandi lama"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-2 focus:ring-emerald-900/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900">Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-2 focus:ring-emerald-900/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0d3830] focus:ring-2 focus:ring-emerald-900/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSavingPassword}
                className="w-full py-3 bg-[#0d3830] hover:bg-[#072520] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 pt-3"
              >
                {isSavingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memperbarui Sandi...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Perbarui Kata Sandi Saya</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
