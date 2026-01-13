import { en } from './en';
import { bn } from './bn';

export type Language = 'en' | 'bn';

// Create a flexible type that allows any string values
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringify<T[K]> : string;
};

export type TranslationKeys = DeepStringify<typeof en>;

export const translations: Record<Language, TranslationKeys> = {
  en,
  bn,
};

export const languageNames: Record<Language, { native: string; english: string }> = {
  en: { native: 'EN', english: 'English' },
  bn: { native: 'বাংলা', english: 'Bangla' },
};

export { en, bn };
