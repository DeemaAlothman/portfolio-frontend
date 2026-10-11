"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

const HeroSlider = () => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-screen overflow-hidden shadow-xl border-b-4 border-primary/20">
      <Image
        src="/marketing-banner.png"
        alt={t('home.marketing.title')}
        fill
        className="object-cover"
        priority
      />
    </div>
  );
};

export default HeroSlider;
