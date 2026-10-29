package main

import (
	"fmt"
	"log"
	"pmb-staici-backend/internal/crypto"
)

func main() {
	key1, err := crypto.GenerateBase64Key()
	if err != nil {
		log.Fatalf("Gagal menghasilkan kunci 1: %v", err)
	}

	key2, err := crypto.GenerateBase64Key()
	if err != nil {
		log.Fatalf("Gagal menghasilkan kunci 2: %v", err)
	}

	blindKey, err := crypto.GenerateBase64Key()
	if err != nil {
		log.Fatalf("Gagal menghasilkan kunci blind index: %v", err)
	}

	fmt.Println("================================================================")
	fmt.Println("       GENERATOR KUNCI KRIPTOGRAFI AES-256-GCM & BLIND INDEX     ")
	fmt.Println("================================================================")
	fmt.Println("# Tambahkan baris berikut ke file .env Anda (JANGAN DIBAGIKAN!):")
	fmt.Println()
	fmt.Printf("APP_ENC_KEYS=1:%s,2:%s\n", key1, key2)
	fmt.Println("APP_ENC_ACTIVE_VERSION=1")
	fmt.Printf("APP_BLIND_INDEX_KEY=%s\n", blindKey)
	fmt.Println()
	fmt.Println("Catatan: Simpan kunci cadangan di tempat aman (password manager / vault).")
	fmt.Println("================================================================")
}

