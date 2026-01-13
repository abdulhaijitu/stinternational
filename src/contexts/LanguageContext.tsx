import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Language, TranslationKeys, languageNames } from '@/lib/translations';
import { getUXTelemetry } from '@/hooks/useUXTelemetry';

// Language Context for bilingual support - English and Bangla

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isRTL: boolean;
  languageNames: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'st-international-language';

// Helper to get nested translation value
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage on initial load
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'bn') {
        return stored;
      }
    }
    return 'en'; // Default to English
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    
    // Track language switch
    try {
      const telemetry = getUXTelemetry();
      telemetry.trackEvent({
        event_type: 'language_switch',
        event_category: 'utility',
        event_action: 'switch',
        event_value: lang,
      });
    } catch (e) {
      // Telemetry should not break the app
    }
    
    // Update document lang attribute for accessibility
    document.documentElement.lang = lang;
    
    // Update font family based on language
    if (lang === 'bn') {
      document.documentElement.classList.add('font-bangla');
      document.documentElement.classList.remove('font-english');
    } else {
      document.documentElement.classList.add('font-english');
      document.documentElement.classList.remove('font-bangla');
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'bn') {
      document.documentElement.classList.add('font-bangla');
    } else {
      document.documentElement.classList.add('font-english');
    }
  }, []);

  const t = translations[language];
  const isRTL = false; // Bangla is LTR

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Utility hook for getting a specific translation with interpolation
export const useTranslation = () => {
  const { t, language } = useLanguage();
  
  const translate = useCallback((
    key: string,
    params?: Record<string, string | number>
  ): string => {
    // Navigate to the key
    const keys = key.split('.');
    let value: unknown = t;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if not found
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Replace placeholders like {count} or {category}
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      }, value);
    }
    
    return value;
  }, [t]);
  
  return { t, translate, language };
};
