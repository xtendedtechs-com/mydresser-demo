import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { common: { languageChanged: 'Language changed', welcome: 'Welcome', settings: 'Settings' } } },
  es: { translation: { common: { languageChanged: 'Idioma cambiado', welcome: 'Bienvenido', settings: 'Configuración' } } },
  fr: { translation: { common: { languageChanged: 'Langue modifiée', welcome: 'Bienvenue', settings: 'Paramètres' } } },
  de: { translation: { common: { languageChanged: 'Sprache geändert', welcome: 'Willkommen', settings: 'Einstellungen' } } },
  it: { translation: { common: { languageChanged: 'Lingua cambiata', welcome: 'Benvenuto', settings: 'Impostazioni' } } },
  pt: { translation: { common: { languageChanged: 'Idioma alterado', welcome: 'Bem-vindo', settings: 'Configurações' } } },
  ja: { translation: { common: { languageChanged: '言語が変更されました', welcome: 'ようこそ', settings: '設定' } } },
  ko: { translation: { common: { languageChanged: '언어가 변경되었습니다', welcome: '환영합니다', settings: '설정' } } },
  zh: { translation: { common: { languageChanged: '语言已更改', welcome: '欢迎', settings: '设置' } } },
  ar: { translation: { common: { languageChanged: 'تم تغيير اللغة', welcome: 'أهلا بك', settings: 'الإعدادات' } } },
  he: { translation: { common: { languageChanged: 'השפה שונתה', welcome: 'ברוכים הבאים', settings: 'הגדרות' } } },
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

// Update HTML dir attribute for RTL languages
i18n.on('languageChanged', (lng) => {
  const rtlLanguages = ['ar', 'he'];
  document.documentElement.dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
});

export default i18n;
