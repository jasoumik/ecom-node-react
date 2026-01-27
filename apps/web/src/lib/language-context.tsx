"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations"; // Import translations

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string; // Translation function
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en'); // Default to English

  useEffect(() => {
    // Try to load language from localStorage
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && translations[storedLang]) {
      setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    // Update html lang attribute
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string, replacements?: Record<string, string>) => {
    let translatedText = translations[language]?.[key] || key; // Fallback to key if not found
    if (replacements) {
      for (const rKey in replacements) {
        translatedText = translatedText.replace(`{${rKey}}`, replacements[rKey]);
      }
    }
    return translatedText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
