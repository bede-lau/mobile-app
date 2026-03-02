import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from '@/locales/en.json';
import ms from '@/locales/ms.json';
import zh from '@/locales/zh.json';
import th from '@/locales/th.json';
import vi from '@/locales/vi.json';
import id from '@/locales/id.json';

const resources = {
  en: { translation: en },
  ms: { translation: ms },
  zh: { translation: zh },
  th: { translation: th },
  vi: { translation: vi },
  id: { translation: id },
};

const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
const supportedLocale = Object.keys(resources).includes(deviceLocale)
  ? deviceLocale
  : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: supportedLocale,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
