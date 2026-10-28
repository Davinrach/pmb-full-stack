"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "./translations";
import { api } from "./api";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof translations)["id"];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "id",
  setLang: () => { },
  t: translations.id,
});

/**
 * Menggabungkan teks terjemahan dinamis dari database ke dalam struktur statis.
 * Format dari API: { [group]: { [key]: { id: "...", en: "..." } } }
 * Output: objek dengan struktur sama seperti translations["id"] atau translations["eng"]
 */
function mergeDbTranslations(
  staticT: (typeof translations)["id"],
  dbData: Record<string, Record<string, { id: string; en: string }>>,
  lang: Language
): (typeof translations)["id"] {
  if (!dbData || Object.keys(dbData).length === 0) return staticT;

  // Deep clone agar tidak memodifikasi objek statis asli
  const merged = JSON.parse(JSON.stringify(staticT));
  const langKey = lang === "eng" ? "en" : "id";

  for (const group of Object.keys(dbData)) {
    if (typeof merged[group as keyof typeof merged] === "object" && merged[group as keyof typeof merged] !== null && !Array.isArray(merged[group as keyof typeof merged])) {
      const groupObj = merged[group as keyof typeof merged] as Record<string, any>;
      for (const key of Object.keys(dbData[group])) {
        const dbVal = dbData[group][key]?.[langKey];
        if (dbVal && typeof groupObj[key] === "string") {
          groupObj[key] = dbVal;
        }
      }
    }
  }

  return merged;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);
  const [dbTranslations, setDbTranslations] = useState<Record<string, Record<string, { id: string; en: string }>> | null>(null);

  // Fetch terjemahan dari database backend saat pertama kali mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("pmb_language") as Language | null;
    if (saved === "id" || saved === "eng") {
      setLangState(saved);
    }

    // Fetch terjemahan dinamis dari API
    api.get("/public/translations")
      .then((res: any) => {
        const data = res?.data || res;
        if (data && typeof data === "object") {
          setDbTranslations(data);
        }
      })
      .catch(() => {
        // Jika API gagal, tetap gunakan teks statis fallback
      });

    const handleLangChange = (e: any) => {
      const newLang = e.detail as Language;
      if (newLang === "id" || newLang === "eng") {
        setLangState(newLang);
      }
    };

    window.addEventListener("language-changed", handleLangChange);
    return () => window.removeEventListener("language-changed", handleLangChange);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("pmb_language", newLang);
      window.dispatchEvent(new CustomEvent("language-changed", { detail: newLang }));
    }
  };

  // Gabungkan teks statis (fallback) dengan teks dinamis dari database
  const staticTranslations = translations[lang] || translations.id;
  const currentTranslations = dbTranslations
    ? mergeDbTranslations(staticTranslations, dbTranslations, lang)
    : staticTranslations;

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: currentTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
