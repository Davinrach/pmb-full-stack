package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"pmb-staici-backend/internal/config"
	"pmb-staici-backend/internal/crypto"
	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func main() {
	dryRun := flag.Bool("dry-run", false, "Simulasi migrasi tanpa mengubah data di database atau disk")
	rotateKeys := flag.Bool("rotate-keys", false, "Enkripsi ulang data yang menggunakan versi kunci lama ke versi kunci aktif")
	batchSize := flag.Int("batch-size", 100, "Ukuran batch per transaksi database")
	flag.Parse()

	fmt.Println("================================================================================")
	fmt.Println("            TOOL MIGRASI & ROTASI ENKRIPSI DATA PMB STAICI                      ")
	fmt.Println("================================================================================")
	if *dryRun {
		fmt.Println(">> MODE: DRY RUN (SIMULASI - Tidak ada perubahan data yang disimpan ke DB/Disk)")
	} else {
		fmt.Println(">> MODE: LIVE MIGRATION (Data akan dienkripsi dan disimpan permanen)")
	}
	if *rotateKeys {
		fmt.Println(">> FITUR: Rotasi Kunci DIAKTIFKAN (Re-enkripsi ke versi aktif)")
	}
	fmt.Printf(">> Batch Size: %d baris\n", *batchSize)
	fmt.Println("--------------------------------------------------------------------------------")

	startTime := time.Now()

	// 1. Load Config & Kripto
	cfg := config.LoadConfig()

	// 2. Koneksi Database
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Gagal terhubung ke database: %v", err)
	}

	activeVer := crypto.GetActiveVersion()
	fmt.Printf("Versi Kunci Aktif: v%s\n\n", activeVer)

	// 3. Migrasi Tabel Users (NIK)
	fmt.Println("[1/3] Memproses tabel 'users' (NIK & Blind Index)...")
	usersTotal, usersEncrypted, usersIndexed, usersRotated := migrateUsers(db, *batchSize, *dryRun, *rotateKeys)
	fmt.Printf("  -> Total users: %d | Dienkripsi: %d | Blind Index Diisi: %d | Rotasi: %d\n\n",
		usersTotal, usersEncrypted, usersIndexed, usersRotated)

	// 4. Migrasi Tabel OrangTua (NIK & KK Ayah/Ibu)
	fmt.Println("[2/3] Memproses tabel 'orang_tuas' (NIK & KK Ayah/Ibu)...")
	otTotal, otEncrypted, otIndexed, otRotated := migrateOrangTua(db, *batchSize, *dryRun, *rotateKeys)
	fmt.Printf("  -> Total orang_tua: %d | Dienkripsi: %d | Blind Index Diisi: %d | Rotasi: %d\n\n",
		otTotal, otEncrypted, otIndexed, otRotated)

	// 5. Migrasi File Berkas di ./uploads
	fmt.Println("[3/3] Memproses berkas fisik di folder unggahan (KTP, KK, dll)...")
	filesTotal, filesEncrypted, filesSkipped, filesRotated := migrateFiles(db, cfg.UploadDir, *dryRun, *rotateKeys)
	fmt.Printf("  -> Total berkas: %d | Dienkripsi: %d | Dilewati (sudah terenkripsi): %d | Rotasi: %d\n\n",
		filesTotal, filesEncrypted, filesSkipped, filesRotated)

	duration := time.Since(startTime)
	fmt.Println("================================================================================")
	fmt.Printf("MIGRASI SELESAI dalam %v!\n", duration)
	if *dryRun {
		fmt.Println("Catatan: Jalankan kembali tanpa flag --dry-run untuk menerapkan perubahan permanen.")
	} else {
		fmt.Println("Semua data sensitif dan berkas fisik telah terenkripsi AES-256-GCM dengan aman.")
	}
	fmt.Println("================================================================================")
}

func migrateUsers(db *gorm.DB, batchSize int, dryRun, rotateKeys bool) (total, encrypted, indexed, rotated int) {
	var users []model.User
	db.Unscoped().Find(&users)
	total = len(users)

	for i := 0; i < len(users); i += batchSize {
		end := i + batchSize
		if end > len(users) {
			end = len(users)
		}
		batch := users[i:end]

		var tx *gorm.DB
		if !dryRun {
			tx = db.Begin()
		}

		for _, u := range batch {
			modified := false

			// Pastikan UUID unik ada
			if u.UUID == "" {
				u.UUID = uuid.New().String()
				modified = true
			}

			aad := []byte(fmt.Sprintf("users:nik:%s", u.UUID))
			cleanNIK := strings.TrimSpace(u.NIK)

			if cleanNIK != "" {
				if !crypto.IsEncryptedString(cleanNIK) {
					// Data plaintext lama
					u.NIKIdx = crypto.BlindIndex(cleanNIK)
					enc, err := crypto.EncryptString(cleanNIK, aad)
					if err != nil {
						log.Printf("Gagal enkripsi NIK user ID %d: %v", u.ID, err)
						continue
					}
					u.NIK = enc
					encrypted++
					modified = true
				} else {
					// Sudah terenkripsi
					if u.NIKIdx == "" {
						if dec, err := crypto.DecryptString(cleanNIK, aad); err == nil {
							u.NIKIdx = crypto.BlindIndex(dec)
							indexed++
							modified = true
						}
					}

					// Rotasi kunci jika diminta
					if rotateKeys {
						newCipher, isRotated, err := crypto.ReEncryptString(cleanNIK, aad, aad)
						if err == nil && isRotated {
							u.NIK = newCipher
							rotated++
							modified = true
						}
					}
				}
			}

			if modified && !dryRun {
				// Simpan langsung kolom mentah via Updates untuk mencegah trigger ganda hook
				if err := tx.Model(&model.User{}).Where("id = ?", u.ID).Updates(map[string]interface{}{
					"uuid":    u.UUID,
					"nik":     u.NIK,
					"nik_idx": u.NIKIdx,
				}).Error; err != nil {
					tx.Rollback()
					log.Fatalf("Gagal menyimpan update user ID %d: %v", u.ID, err)
				}
			}
		}

		if !dryRun {
			tx.Commit()
		}
	}
	return
}

func migrateOrangTua(db *gorm.DB, batchSize int, dryRun, rotateKeys bool) (total, encrypted, indexed, rotated int) {
	var list []model.OrangTua
	db.Find(&list)
	total = len(list)

	for i := 0; i < len(list); i += batchSize {
		end := i + batchSize
		if end > len(list) {
			end = len(list)
		}
		batch := list[i:end]

		var tx *gorm.DB
		if !dryRun {
			tx = db.Begin()
		}

		for _, ot := range batch {
			modified := false

			// Helper untuk memproses tiap field
			processField := func(val, col string, idxVal *string) (newVal string, isEnc, isIdx, isRot bool) {
				clean := strings.TrimSpace(val)
				if clean == "" {
					return "", false, false, false
				}

				aad := []byte(fmt.Sprintf("orang_tuas:%s:%d", col, ot.PendaftarID))

				if !crypto.IsEncryptedString(clean) {
					*idxVal = crypto.BlindIndex(clean)
					enc, err := crypto.EncryptString(clean, aad)
					if err != nil {
						log.Printf("Gagal enkripsi %s OrangTua ID %d: %v", col, ot.ID, err)
						return clean, false, false, false
					}
					return enc, true, false, false
				}

				// Sudah terenkripsi
				if *idxVal == "" {
					if dec, err := crypto.DecryptString(clean, aad); err == nil {
						*idxVal = crypto.BlindIndex(dec)
						isIdx = true
					}
				}

				if rotateKeys {
					newCipher, rot, err := crypto.ReEncryptString(clean, aad, aad)
					if err == nil && rot {
						return newCipher, false, isIdx, true
					}
				}

				return clean, false, isIdx, false
			}

			// NIK Ayah
			if nVal, isEnc, isIdx, isRot := processField(ot.NIKAyah, "nik_ayah", &ot.NIKAyahIdx); isEnc || isIdx || isRot {
				ot.NIKAyah = nVal
				if isEnc { encrypted++ }
				if isIdx { indexed++ }
				if isRot { rotated++ }
				modified = true
			}

			// KK Ayah
			if nVal, isEnc, isIdx, isRot := processField(ot.KKAyah, "kk_ayah", &ot.KKAyahIdx); isEnc || isIdx || isRot {
				ot.KKAyah = nVal
				if isEnc { encrypted++ }
				if isIdx { indexed++ }
				if isRot { rotated++ }
				modified = true
			}

			// NIK Ibu
			if nVal, isEnc, isIdx, isRot := processField(ot.NIKIbu, "nik_ibu", &ot.NIKIbuIdx); isEnc || isIdx || isRot {
				ot.NIKIbu = nVal
				if isEnc { encrypted++ }
				if isIdx { indexed++ }
				if isRot { rotated++ }
				modified = true
			}

			// KK Ibu
			if nVal, isEnc, isIdx, isRot := processField(ot.KKIbu, "kk_ibu", &ot.KKIbuIdx); isEnc || isIdx || isRot {
				ot.KKIbu = nVal
				if isEnc { encrypted++ }
				if isIdx { indexed++ }
				if isRot { rotated++ }
				modified = true
			}

			if modified && !dryRun {
				if err := tx.Model(&model.OrangTua{}).Where("id = ?", ot.ID).Updates(map[string]interface{}{
					"nik_ayah":     ot.NIKAyah,
					"nik_ayah_idx": ot.NIKAyahIdx,
					"kk_ayah":      ot.KKAyah,
					"kk_ayah_idx":  ot.KKAyahIdx,
					"nik_ibu":      ot.NIKIbu,
					"nik_ibu_idx":  ot.NIKIbuIdx,
					"kk_ibu":       ot.KKIbu,
					"kk_ibu_idx":   ot.KKIbuIdx,
				}).Error; err != nil {
					tx.Rollback()
					log.Fatalf("Gagal menyimpan update OrangTua ID %d: %v", ot.ID, err)
				}
			}
		}

		if !dryRun {
			tx.Commit()
		}
	}
	return
}

func migrateFiles(db *gorm.DB, uploadDir string, dryRun, rotateKeys bool) (total, encrypted, skipped, rotated int) {
	var berkasList []model.Berkas
	db.Find(&berkasList)
	total = len(berkasList)

	for _, b := range berkasList {
		filePath := b.FilePath
		if !filepath.IsAbs(filePath) && !strings.HasPrefix(filePath, uploadDir) {
			filePath = filepath.Join(uploadDir, filepath.Base(filePath))
		}

		fileBytes, err := os.ReadFile(filePath)
		if err != nil {
			// Lewati file yang belum diupload secara fisik
			continue
		}

		aad := []byte(fmt.Sprintf("pendaftar:%d:dokumen:%s", b.PendaftarID, strings.ToLower(b.JenisDokumen)))

		if !crypto.IsEncryptedFile(fileBytes) {
			// File belum terenkripsi
			encBytes, err := crypto.EncryptFile(fileBytes, aad)
			if err != nil {
				log.Printf("Gagal mengenkripsi berkas ID %d (%s): %v", b.ID, b.FileName, err)
				continue
			}

			if !dryRun {
				if err := os.WriteFile(filePath, encBytes, 0600); err != nil {
					log.Printf("Gagal menyimpan berkas terenkripsi ID %d ke disk: %v", b.ID, err)
					continue
				}
			}
			encrypted++
		} else {
			// Sudah terenkripsi
			if rotateKeys {
				// Dekripsi dan re-enkripsi dengan kunci aktif
				decBytes, err := crypto.DecryptFile(fileBytes, aad)
				if err == nil {
					newEnc, err := crypto.EncryptFile(decBytes, aad)
					if err == nil && !dryRun {
						_ = os.WriteFile(filePath, newEnc, 0600)
						rotated++
					}
				}
			} else {
				skipped++
			}
		}
	}
	return
}

