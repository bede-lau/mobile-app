import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

// Only load English at startup — lazy-load others when needed
import en from '@/locales/en.json';

const SUPPORTED_LANGUAGES = ['en', 'ms', 'zh', 'th', 'vi', 'id'] as const;

const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
const supportedLocale = SUPPORTED_LANGUAGES.includes(deviceLocale as any)
  ? deviceLocale
  : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: supportedLocale,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

// Lazy-load non-English language pack if needed
if (supportedLocale !== 'en') {
  const loaders: Record<string, () => Promise<any>> = {
    ms: () => import('@/locales/ms.json'),
    zh: () => import('@/locales/zh.json'),
    th: () => import('@/locales/th.json'),
    vi: () => import('@/locales/vi.json'),
    id: () => import('@/locales/id.json'),
  };

  const loader = loaders[supportedLocale];
  if (loader) {
    loader().then((mod) => {
      i18n.addResourceBundle(supportedLocale, 'translation', mod.default || mod, true, true);
    });
  }
}

export default i18n;
