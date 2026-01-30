
import React from 'react';
import type { Language } from '../types';
import { useTranslate } from '../hooks/useTranslate';

interface FooterProps {
  language: Language;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = useTranslate(language);

  return (
    <footer className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>{t('footer')}</p>
      </div>
    </footer>
  );
};

export default Footer;