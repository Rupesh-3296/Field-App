
import React from 'react';
import type { Language } from '../types';
import { useTranslate } from '../hooks/useTranslate';

interface HeroProps {
  language: Language;
}

const Hero: React.FC<HeroProps> = ({ language }) => {
  const t = useTranslate(language);

  return (
    <section className="text-center mb-12 md:mb-16">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-gray-900 dark:text-white leading-tight">
        {t('title')}
      </h1>
      <p className="text-lg md:text-xl text-primary font-semibold mb-6">
        {t('tagline')}
      </p>
      <p className="max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
        {t('description')}
      </p>
    </section>
  );
};

export default Hero;