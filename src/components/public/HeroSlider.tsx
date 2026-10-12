"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

const HeroSlider = () => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-screen overflow-hidden shadow-xl border-b-4 border-primary/20">
      {/* نسخة طولية للموبايل */}
      <Image
        src="/marketing-banner-mobile.jpg"
        alt={t('home.marketing.title')}
        fill
        className="object-cover md:hidden"
        priority
      />
      {/* نسخة عرضية للابتوب/ديسكتوب */}
      <Image
        src="/marketing-banner-desktop.jpg"
        alt={t('home.marketing.title')}
        fill
        className="object-cover hidden md:block"
        priority
      />
    </div>
  );
};

export default HeroSlider;
