
import { useCallback } from 'react';
import { translations } from '../i18n/translations';
import type { Language } from '../types';

export const useTranslate = (language: Language) => {
  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key];
  }, [language]);

  return t;
};