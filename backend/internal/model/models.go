package model

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleCalonMahasiswa Role = "calon_mahasiswa"
	RoleAdminPMB       Role = "admin_pmb"
	RoleSuperAdmin     Role = "super_admin"
)

type StatusPendaftaran string

const (
	StatusDraft               StatusPendaftaran = "draft"
	StatusAkunTerdaftar       StatusPendaftaran = "akun_terdaftar"
	StatusBelumLengkap        StatusPendaftaran = "belum_lengkap"
	StatusMenungguPembayaran  StatusPendaftaran = "menunggu_pembayaran"
	StatusMenungguVerifikasi  StatusPendaftaran = "menunggu_verifikasi"
	StatusBerkasDiverifikasi  StatusPendaftaran = "berkas_diverifikasi"
	StatusDitolak             StatusPendaftaran = "ditolak_perlu_perbaikan"
	StatusMengikutiUjian      StatusPendaftaran = "mengikuti_ujian"
	StatusLolosSeleksi        StatusPendaftaran = "lolos_seleksi"
	StatusTidakLolos          StatusPendaftaran = "tidak_lolos"
	StatusDaftarUlang         StatusPendaftaran = "daftar_ulang"
	StatusKadaluarsa          StatusPendaftaran = "kadaluarsa"
)

type StatusVerifikasiBerkas string

const (
	StatusBerkasPending  StatusVerifikasiBerkas = "pending"
	StatusBerkasValid    StatusVerifikasiBerkas = "valid"
	StatusBerkasInvalid  StatusVerifikasiBerkas = "invalid"
)

type StatusPembayaran string

const (
	StatusBayarMenungguVerifikasi StatusPembayaran = "menunggu_verifikasi"
	StatusBayarDiterima           StatusPembayaran = "diterima"
	StatusBayarDitolak            StatusPembayaran = "ditolak"
)

type User struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	Email              string         `gorm:"type:varchar(191);uniqueIndex;not null" json:"email"`
	PasswordHash       string         `gorm:"type:varchar(255);not null" json:"-"`
	NamaLengkap        string         `gorm:"type:varchar(191);not null" json:"nama_lengkap"`
	NoHP               string         `gorm:"type:varchar(30);not null" json:"no_hp"`
	NIK                string         `gorm:"type:varchar(30);uniqueIndex;not null" json:"nik"`
	Role               Role           `gorm:"type:varchar(30);default:'calon_mahasiswa'" json:"role"`
	FotoProfil         string         `gorm:"type:varchar(255)" json:"foto_profil,omitempty"`
	IsEmailVerified    bool           `gorm:"default:false" json:"is_email_verified"`
	VerificationToken  string         `gorm:"type:varchar(255)" json:"-"`
	VerificationOTP    string         `gorm:"type:varchar(10)" json:"-"`
	OTPExpiresAt       *time.Time     `json:"-"`
	ResetPasswordToken     string         `gorm:"type:varchar(255)" json:"-"`
	ResetPasswordExpiresAt *time.Time     `json:"-"`
	CreatedAt              time.Time      `json:"created_at"`
	UpdatedAt              time.Time      `json:"updated_at"`
	DeletedAt              gorm.DeletedAt `gorm:"index" json:"-"`
}

type ProgramStudi struct {
	ID                  uint           `gorm:"primaryKey" json:"id"`
	Kode                string         `gorm:"type:varchar(20);uniqueIndex;not null" json:"kode"` // MPI, AS, KPI
	Nama                string         `gorm:"type:varchar(191);not null" json:"nama"`
	Jenjang             string         `gorm:"type:varchar(10);default:'S1'" json:"jenjang"`
	GelarAkademik       string         `gorm:"type:varchar(255)" json:"gelar_akademik"`
	Deskripsi           string         `gorm:"type:text" json:"deskripsi"`
	ProfilLulusanIntro  string         `gorm:"type:text" json:"profil_lulusan_intro"`
	ProfilLulusan       string         `gorm:"type:longtext" json:"profil_lulusan"`        // JSON string of [{title, desc}]
	CapaianPembelajaran string         `gorm:"type:longtext" json:"capaian_pembelajaran"` // JSON string of [{title, desc}]
	AlurPendaftaran     string         `gorm:"type:text" json:"alur_pendaftaran"`
	IsAktif             bool           `gorm:"default:true" json:"is_aktif"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}

type Gelombang struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	Nama             string         `gorm:"type:varchar(100);not null" json:"nama"` // contoh: "Gelombang 1 - 2026/2027"
	TahunAkademik    string         `gorm:"type:varchar(20);not null" json:"tahun_akademik"` // contoh: "2026/2027"
	TanggalBuka      time.Time      `json:"tanggal_buka"`
	TanggalTutup     time.Time      `json:"tanggal_tutup"`
	BiayaPendaftaran float64        `gorm:"type:decimal(12,2);default:0" json:"biaya_pendaftaran"`
	Kuota            int            `gorm:"default:0" json:"kuota"`
	IsAktif          bool           `gorm:"default:true" json:"is_aktif"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

type Pendaftar struct {
	ID                 uint              `gorm:"primaryKey" json:"id"`
	UserID             uint              `gorm:"uniqueIndex;not null" json:"user_id"`
	User               User              `gorm:"foreignKey:UserID" json:"user,omitempty"`
	GelombangID        *uint             `gorm:"index" json:"gelombang_id"`
	Gelombang          *Gelombang        `gorm:"foreignKey:GelombangID" json:"gelombang,omitempty"`
	ProgramStudiID     *uint             `gorm:"index" json:"program_studi_id"`
	ProgramStudi       *ProgramStudi     `gorm:"foreignKey:ProgramStudiID" json:"program_studi,omitempty"`
	NomorPendaftaran   *string           `gorm:"type:varchar(50);uniqueIndex" json:"nomor_pendaftaran"` // format: PMB-2026-0001
	JalurPendaftaran   string            `gorm:"type:varchar(50);default:'Reguler'" json:"jalur_pendaftaran"` // Reguler / KIP-Kuliah
	StatusPendaftaran  StatusPendaftaran `gorm:"type:varchar(40);default:'akun_terdaftar'" json:"status_pendaftaran"`
	CatatanRevisi      string            `gorm:"type:text" json:"catatan_revisi,omitempty"`
	IsLocked           bool              `gorm:"default:false" json:"is_locked"` // kunci data setelah submit

	// Identitas Mahasiswa (FR-2.1)
	JenisKelamin       string            `gorm:"type:varchar(20)" json:"jenis_kelamin"`
	Alamat             string            `gorm:"type:text" json:"alamat"`
	TempatLahir        string            `gorm:"type:varchar(100)" json:"tempat_lahir"`
	TanggalLahir       *time.Time        `json:"tanggal_lahir"`
	StatusWargaNegara  string            `gorm:"type:varchar(10);default:'WNI'" json:"status_warga_negara"`
	NegaraWNA          string            `gorm:"type:varchar(100)" json:"negara_wna,omitempty"`
	Agama              string            `gorm:"type:varchar(30);default:'Islam'" json:"agama"`
	StatusPernikahan   string            `gorm:"type:varchar(30)" json:"status_pernikahan"`

	// Asal Sekolah SLTA (FR-2.2)
	NamaSekolah        string            `gorm:"type:varchar(191)" json:"nama_sekolah"`
	StatusSekolah      string            `gorm:"type:varchar(20)" json:"status_sekolah"` // Negeri / Swasta
	JurusanSekolah     string            `gorm:"type:varchar(100)" json:"jurusan_sekolah"`
	NilaiRataRata      float64           `gorm:"type:decimal(5,2)" json:"nilai_rata_rata"`
	TahunLulus         int               `json:"tahun_lulus"`

	// Penilaian Seleksi & Kelulusan (FR-6.2, FR-8.5)
	NilaiUjian         *float64          `gorm:"type:decimal(5,2)" json:"nilai_ujian,omitempty"`
	NilaiWawancara     *float64          `gorm:"type:decimal(5,2)" json:"nilai_wawancara,omitempty"`
	CatatanSeleksi     string            `gorm:"type:text" json:"catatan_seleksi,omitempty"`

	// Relasi
	DataOrangTua       *OrangTua         `gorm:"foreignKey:PendaftarID" json:"data_orang_tua,omitempty"`
	Berkas             []Berkas          `gorm:"foreignKey:PendaftarID" json:"berkas,omitempty"`
	Pembayaran         []Pembayaran      `gorm:"foreignKey:PendaftarID" json:"pembayaran,omitempty"`

	CreatedAt          time.Time         `json:"created_at"`
	UpdatedAt          time.Time         `json:"updated_at"`
	DeletedAt          gorm.DeletedAt    `gorm:"index" json:"-"`
}

func (p *Pendaftar) DisplayNomorPendaftaran() string {
	if p != nil && p.NomorPendaftaran != nil && *p.NomorPendaftaran != "" {
		return *p.NomorPendaftaran
	}
	return "-"
}

type OrangTua struct {
	ID                   uint      `gorm:"primaryKey" json:"id"`
	PendaftarID          uint      `gorm:"uniqueIndex;not null" json:"pendaftar_id"`

	// Data Ayah (FR-2.3)
	NamaAyah             string    `gorm:"type:varchar(191)" json:"nama_ayah"`
	NIKAyah              string    `gorm:"type:varchar(30)" json:"nik_ayah"`
	KKAyah               string    `gorm:"type:varchar(30)" json:"kk_ayah"`
	TempatLahirAyah      string    `gorm:"type:varchar(100)" json:"tempat_lahir_ayah"`
	TanggalLahirAyah     *time.Time `json:"tanggal_lahir_ayah"`
	AlamatAyah           string    `gorm:"type:text" json:"alamat_ayah"`
	PendidikanAyah       string    `gorm:"type:varchar(50)" json:"pendidikan_ayah"`
	PekerjaanAyah        string    `gorm:"type:varchar(100)" json:"pekerjaan_ayah"`
	PenghasilanAyah      string    `gorm:"type:varchar(100)" json:"penghasilan_ayah"`

	// Data Ibu (FR-2.3)
	NamaIbu              string    `gorm:"type:varchar(191)" json:"nama_ibu"`
	NIKIbu               string    `gorm:"type:varchar(30)" json:"nik_ibu"`
	KKIbu                string    `gorm:"type:varchar(30)" json:"kk_ibu"`
	TempatLahirIbu       string    `gorm:"type:varchar(100)" json:"tempat_lahir_ibu"`
	TanggalLahirIbu      *time.Time `json:"tanggal_lahir_ibu"`
	AlamatIbu            string    `gorm:"type:text" json:"alamat_ibu"`
	PendidikanIbu        string    `gorm:"type:varchar(50)" json:"pendidikan_ibu"`
	PekerjaanIbu         string    `gorm:"type:varchar(100)" json:"pekerjaan_ibu"`
	PenghasilanIbu       string    `gorm:"type:varchar(100)" json:"penghasilan_ibu"`

	// Data Wali (Kondisional FR-2.4)
	NamaWali             string    `gorm:"type:varchar(191)" json:"nama_wali,omitempty"`
	AlamatWali           string    `gorm:"type:text" json:"alamat_wali,omitempty"`
	NoHPOrangTuaWali     string    `gorm:"type:varchar(30)" json:"no_hp_orang_tua_wali"`

	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type Berkas struct {
	ID               uint                   `gorm:"primaryKey" json:"id"`
	PendaftarID      uint                   `gorm:"index;not null" json:"pendaftar_id"`
	JenisDokumen     string                 `gorm:"type:varchar(50);not null" json:"jenis_dokumen"` // KK, KTP, Ijazah, Foto, BuktiBayar, KIP, Lainnya
	FileName         string                 `gorm:"type:varchar(255);not null" json:"file_name"`
	FilePath         string                 `gorm:"type:varchar(255);not null" json:"file_path"`
	FileSize         int64                  `json:"file_size"` // maks 2MB
	MimeType         string                 `gorm:"type:varchar(100)" json:"mime_type"`
	StatusVerifikasi StatusVerifikasiBerkas `gorm:"type:varchar(30);default:'pending'" json:"status_verifikasi"`
	CatatanAdmin     string                 `gorm:"type:text" json:"catatan_admin,omitempty"`
	CreatedAt        time.Time              `json:"created_at"`
	UpdatedAt        time.Time              `json:"updated_at"`
}

type Pembayaran struct {
	ID                 uint             `gorm:"primaryKey" json:"id"`
	PendaftarID        uint             `gorm:"index;not null" json:"pendaftar_id"`
	Jumlah             float64          `gorm:"type:decimal(12,2);not null" json:"jumlah"`
	BankTujuan         string           `gorm:"type:varchar(100);not null" json:"bank_tujuan"`
	NomorRekeningTujuan string          `gorm:"type:varchar(50);not null" json:"nomor_rekening_tujuan"`
	NamaPengirim       string           `gorm:"type:varchar(191)" json:"nama_pengirim"`
	BuktiTransferPath  string           `gorm:"type:varchar(255);not null" json:"bukti_transfer_path"`
	Status             StatusPembayaran `gorm:"type:varchar(30);default:'menunggu_verifikasi'" json:"status"`
	AlasanPenolakan    string           `gorm:"type:text" json:"alasan_penolakan,omitempty"`
	VerifiedBy         *uint            `json:"verified_by,omitempty"`
	VerifiedAt         *time.Time       `json:"verified_at,omitempty"`
	CreatedAt          time.Time        `json:"created_at"`
	UpdatedAt          time.Time        `json:"updated_at"`
}

type LogAktivitasAdmin struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	AdminID   uint      `gorm:"index;not null" json:"admin_id"`
	AdminNama string    `gorm:"type:varchar(191);not null" json:"admin_nama"`
	Aksi      string    `gorm:"type:varchar(255);not null" json:"aksi"`
	Detail    string    `gorm:"type:text" json:"detail"`
	IPAddress string    `gorm:"type:varchar(45)" json:"ip_address"`
	CreatedAt time.Time `json:"created_at"`
}

type PengaturanSistem struct {
	ID                     uint      `gorm:"primaryKey" json:"id"`
	BannerTitle            string    `gorm:"type:varchar(255)" json:"banner_title"`
	BannerSubtitle         string    `gorm:"type:text" json:"banner_subtitle"`
	AnnouncementText       string    `gorm:"type:varchar(255)" json:"announcement_text"`
	BankName               string    `gorm:"type:varchar(100)" json:"bank_name"`
	NomorRekening          string    `gorm:"type:varchar(100)" json:"nomor_rekening"`
	AtasNama               string    `gorm:"type:varchar(100)" json:"atas_nama"`
	PetunjukPembayaran     string    `gorm:"type:text" json:"petunjuk_pembayaran"`
	RegulasiBuktiBayar     string    `gorm:"type:text" json:"regulasi_bukti_bayar"`
	BatasWaktuKonfirmasi   string    `gorm:"type:varchar(100)" json:"batas_waktu_konfirmasi"`
	PersyaratanPendaftaran string    `gorm:"type:text" json:"persyaratan_pendaftaran"`
	JalurPendaftaranInfo   string    `gorm:"type:text" json:"jalur_pendaftaran_info"`
	NoWhatsappCS           string    `gorm:"type:varchar(50)" json:"no_whatsapp_cs"`
	EmailCS                string    `gorm:"type:varchar(100)" json:"email_cs"`
	AlamatKampus           string    `gorm:"type:text" json:"alamat_kampus"`
	JamOperasional         string    `gorm:"type:varchar(150)" json:"jam_operasional"`
	HomepageProdiList      string    `gorm:"type:longtext" json:"homepage_prodi_list"`
	UpdatedAt              time.Time `json:"updated_at"`
}

type FAQ struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Kategori  string    `gorm:"type:varchar(100);default:'Umum'" json:"kategori"`
	Pertanyaan string    `gorm:"type:text;not null" json:"pertanyaan"`
	Jawaban   string    `gorm:"type:text;not null" json:"jawaban"`
	Urutan    int       `gorm:"default:0" json:"urutan"`
	IsAktif   bool      `gorm:"default:true" json:"is_aktif"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// RekeningPembayaran mendukung multi-rekening bank PMB (BSI, BRI, Bank Jatim, dll.)
type RekeningPembayaran struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	NamaBank          string    `gorm:"type:varchar(100);not null" json:"nama_bank"`
	NomorRekening     string    `gorm:"type:varchar(50);not null" json:"nomor_rekening"`
	AtasNama          string    `gorm:"type:varchar(100);not null" json:"atas_nama"`
	Cabang            string    `gorm:"type:varchar(100)" json:"cabang"`
	InstruksiTransfer string    `gorm:"type:text" json:"instruksi_transfer"`
	IsUtama           bool      `gorm:"default:false" json:"is_utama"`
	IsAktif           bool      `gorm:"default:true" json:"is_aktif"`
	Urutan            int       `gorm:"default:0" json:"urutan"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// JalurPendaftaran model untuk manajemen jalur seleksi yang dinamis (Reguler, KIP-Kuliah, dll.)
type JalurPendaftaran struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	Kode             string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"kode"`
	Nama             string    `gorm:"type:varchar(100);not null" json:"nama"`
	BadgeText        string    `gorm:"type:varchar(50)" json:"badge_text"`
	Deskripsi        string    `gorm:"type:text" json:"deskripsi"`
	SyaratKhusus     string    `gorm:"type:text" json:"syarat_khusus"`
	BebasBiaya       bool      `gorm:"default:false" json:"bebas_biaya"`
	TampilDiHomepage bool      `gorm:"default:true" json:"tampil_di_homepage"`
	IsAktif          bool      `gorm:"default:true" json:"is_aktif"`
	Urutan           int       `gorm:"default:0" json:"urutan"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// TataCaraPendaftaran model untuk alur langkah pendaftaran PMB terpusat tingkat kampus
type TataCaraPendaftaran struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	NomorLangkah int       `gorm:"default:1" json:"nomor_langkah"`
	Judul        string    `gorm:"type:varchar(191);not null" json:"judul"`
	Deskripsi    string    `gorm:"type:text" json:"deskripsi"`
	Icon         string    `gorm:"type:varchar(50);default:'CheckCircle2'" json:"icon"`
	IsAktif      bool      `gorm:"default:true" json:"is_aktif"`
	Urutan       int       `gorm:"default:0" json:"urutan"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// KontakHotline model untuk multi-narahubung dan CS PMB
type KontakHotline struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	NamaLayanan    string    `gorm:"type:varchar(100);not null" json:"nama_layanan"`
	TipeKontak     string    `gorm:"type:varchar(30);default:'whatsapp'" json:"tipe_kontak"` // whatsapp, telepon, email
	NomorAtauEmail string    `gorm:"type:varchar(100);not null" json:"nomor_atau_email"`
	NamaPetugas    string    `gorm:"type:varchar(100)" json:"nama_petugas"`
	JamLayanan     string    `gorm:"type:varchar(100)" json:"jam_layanan"`
	IsAktif        bool      `gorm:"default:true" json:"is_aktif"`
	Urutan         int       `gorm:"default:0" json:"urutan"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// PersyaratanDokumen model untuk master dokumen persyaratan pendaftaran
type PersyaratanDokumen struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Kode        string    `gorm:"type:varchar(50);not null" json:"kode"`
	NamaDokumen string    `gorm:"type:varchar(191);not null" json:"nama_dokumen"`
	Deskripsi   string    `gorm:"type:text" json:"deskripsi"`
	IsWajib     bool      `gorm:"default:true" json:"is_wajib"`
	JalurKhusus string    `gorm:"type:varchar(50);default:'semua'" json:"jalur_khusus"` // semua / kip-kuliah / reguler
	TipeFile    string    `gorm:"type:varchar(100);default:'jpg,jpeg,png,pdf'" json:"tipe_file"`
	MaxSizeMB   int       `gorm:"default:2" json:"max_size_mb"`
	IsAktif     bool      `gorm:"default:true" json:"is_aktif"`
	Urutan      int       `gorm:"default:0" json:"urutan"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}


// RBAC System Structs
type RoleModel struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Kode      string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"kode"`
	Nama      string         `gorm:"type:varchar(100);not null" json:"nama"`
	Deskripsi string         `gorm:"type:text" json:"deskripsi"`
	IsSystem  bool           `gorm:"default:false" json:"is_system"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type MenuGroup struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Nama      string         `gorm:"type:varchar(100);not null" json:"nama"`
	Urutan    int            `gorm:"default:0" json:"urutan"`
	IsAktif   bool           `gorm:"default:true" json:"is_aktif"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Menus     []Menu         `gorm:"foreignKey:MenuGroupID" json:"menus,omitempty"`
}

type Menu struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	MenuGroupID uint           `gorm:"index;not null" json:"menu_group_id"`
	MenuGroup   *MenuGroup     `gorm:"foreignKey:MenuGroupID" json:"menu_group,omitempty"`
	Nama        string         `gorm:"type:varchar(100);not null" json:"nama"`
	Key         string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"key"`
	Icon        string         `gorm:"type:varchar(50);default:'Users'" json:"icon"`
	URL         string         `gorm:"type:varchar(191)" json:"url"`
	BadgeText   string         `gorm:"type:varchar(50)" json:"badge_text"`
	Urutan      int            `gorm:"default:0" json:"urutan"`
	IsAktif     bool           `gorm:"default:true" json:"is_aktif"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type RoleMenu struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	RoleKode  string    `gorm:"type:varchar(50);index;not null" json:"role_kode"`
	MenuID    uint      `gorm:"index;not null" json:"menu_id"`
	Menu      *Menu     `gorm:"foreignKey:MenuID" json:"menu,omitempty"`
	AllowView bool      `gorm:"default:true" json:"allow_view"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

