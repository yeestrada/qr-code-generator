import { en, type TranslationKeys } from './en';
import { es } from './es';

export type Locale = 'en' | 'es';

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'qr-designer-locale';

export const locales: Record<Locale, TranslationKeys> = {
  en,
  es,
};

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

type Primitive = string | number | boolean;

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function translate(
  dictionary: TranslationKeys,
  key: string,
  params?: Record<string, Primitive>,
): string {
  const value = getByPath(dictionary, key);
  if (typeof value !== 'string') return key;

  if (!params) return value;

  return Object.entries(params).reduce(
    (text, [param, paramValue]) => text.replaceAll(`{${param}}`, String(paramValue)),
    value,
  );
}

export function resolveLocale(value: string | null | undefined): Locale {
  if (value === 'es' || value === 'en') return value;
  return DEFAULT_LOCALE;
}

export type { TranslationKeys };
