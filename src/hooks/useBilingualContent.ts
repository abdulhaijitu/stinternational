import { useLanguage } from '@/contexts/LanguageContext';
import { useCallback, useMemo } from 'react';

interface BilingualProduct {
  name: string;
  name_bn?: string | null;
  description?: string | null;
  description_bn?: string | null;
  short_description?: string | null;
  short_description_bn?: string | null;
}

interface BilingualCategory {
  name: string;
  name_bn?: string | null;
  description?: string | null;
  description_bn?: string | null;
}

interface BilingualFields {
  name: string;
  description: string | null;
  shortDescription: string | null;
}

interface BilingualCategoryFields {
  name: string;
  description: string | null;
}

/**
 * Hook to get bilingual content with automatic fallback
 * Returns Bangla content when language is 'bn' and content exists,
 * otherwise falls back to English
 */
export const useBilingualContent = () => {
  const { language } = useLanguage();

  /**
   * Get the appropriate text based on current language with fallback
   */
  const getText = useCallback((
    englishText: string | null | undefined,
    banglaText: string | null | undefined
  ): string | null => {
    if (language === 'bn' && banglaText) {
      return banglaText;
    }
    return englishText ?? null;
  }, [language]);

  /**
   * Get product fields with bilingual support
   */
  const getProductFields = useCallback((product: BilingualProduct): BilingualFields => {
    return {
      name: getText(product.name, product.name_bn) || product.name,
      description: getText(product.description, product.description_bn),
      shortDescription: getText(product.short_description, product.short_description_bn),
    };
  }, [getText]);

  /**
   * Get category fields with bilingual support
   */
  const getCategoryFields = useCallback((category: BilingualCategory): BilingualCategoryFields => {
    return {
      name: getText(category.name, category.name_bn) || category.name,
      description: getText(category.description, category.description_bn),
    };
  }, [getText]);

  return {
    language,
    getText,
    getProductFields,
    getCategoryFields,
  };
};

/**
 * Utility function for use outside of React components
 * Requires language to be passed explicitly
 */
export const getBilingualText = (
  language: 'en' | 'bn',
  englishText: string | null | undefined,
  banglaText: string | null | undefined
): string | null => {
  if (language === 'bn' && banglaText) {
    return banglaText;
  }
  return englishText ?? null;
};
