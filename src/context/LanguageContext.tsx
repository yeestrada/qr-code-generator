import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  localeLabels,
  locales,
  resolveLocale,
  translate,
  type Locale,
  type TranslationKeys,
} from '../lang';

type TranslateFn = (key: string, params?: Record<string, string | number | boolean>) => string;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
  dictionary: TranslationKeys;
  localeLabels: typeof localeLabels;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    return resolveLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', locales[locale].app.htmlDescription);
    }
    document.title = locales[locale].app.name;
  }, [locale]);

  const dictionary = locales[locale];

  const t = useCallback<TranslateFn>(
    (key, params) => translate(dictionary, key, params),
    [dictionary],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dictionary,
      localeLabels,
    }),
    [locale, setLocale, t, dictionary],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error(locales[DEFAULT_LOCALE].errors.useLanguageOutside);
  }
  return ctx;
}

export function useTranslation() {
  const { t, locale, setLocale, dictionary, localeLabels } = useLanguage();
  return { t, locale, setLocale, dictionary, localeLabels };
}
