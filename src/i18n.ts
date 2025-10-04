import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { common: { languageChanged: 'Language changed' } } },
  es: { translation: { common: { languageChanged: 'Idioma cambiado' } } },
  fr: { translation: { common: { languageChanged: 'Langue modifiée' } } },
  de: { translation: { common: { languageChanged: 'Sprache geändert' } } },
  it: { translation: { common: { languageChanged: 'Lingua cambiata' } } },
  pt: { translation: { common: { languageChanged: 'Idioma alterado' } } },
  ja: { translation: { common: { languageChanged: '言語が変更されました' } } },
  ko: { translation: { common: { languageChanged: '언어가 변경되었습니다' } } },
  zh: { translation: { common: { languageChanged: '语言已更改' } } },
  ar: { translation: { common: { languageChanged: 'تم تغيير اللغة' } } },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: (typeof localStorage !== 'undefined' && localStorage.getItem('app-language')) || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
    defaultNS: 'translation',
  });

export default i18n;
