"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof translations)["id"];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "id",
  setLang: () => {},
  t: translations.id,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("pmb_language") as Language | null;
    if (saved === "id" || saved === "eng") {
      setLangState(saved);
    }

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

  const currentTranslations = translations[lang] || translations.id;

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
