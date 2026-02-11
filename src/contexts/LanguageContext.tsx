'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ar } from '@/locales/ar';
import { en } from '@/locales/en';

type Locale = 'ar' | 'en';

type Translations = typeof ar;

interface LanguageContextType {
  locale: Locale;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  toggleLanguage: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Locale, Translations> = {
  ar,
  en,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ar');
  const [mounted, setMounted] = useState(false);

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && (savedLocale === 'ar' || savedLocale === 'en')) {
      setLocale(savedLocale);
    }
    setMounted(true);
  }, []);

  // Update HTML attributes when locale changes
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === 'ar' ? 'rtl' : 'ltr';

    // Save to localStorage
    localStorage.setItem('locale', locale);
  }, [locale, mounted]);

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    let translation = translations[locale][key] || translations['ar'][key] || key;

    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{{${paramKey}}}`, String(paramValue));
      });
    }

    return translation;
  };

  const toggleLanguage = () => {
    setLocale((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const isRTL = locale === 'ar';

  return (
    <LanguageContext.Provider value={{ locale, t, toggleLanguage, isRTL }}>
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
