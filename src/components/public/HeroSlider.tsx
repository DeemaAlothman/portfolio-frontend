"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

const HeroSlider = () => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full overflow-hidden shadow-xl border-b-4 border-primary/20">
      {/* نسخة طولية للموبايل - الصورة كاملة دايماً بدون أي قص (object-contain)، عشان النص ما ينقطع أبداً مهما تغير حجم الشاشة أو الزوم */}
      <div className="relative w-full h-[450px] sm:h-[550px] md:hidden" style={{ background: '#0d7d72' }}>
        <Image
          src="/marketing-banner-mobile.jpg"
          alt={t('home.marketing.title')}
          fill
          className="object-contain"
          priority
        />
      </div>
      {/* نسخة عرضية للابتوب/ديسكتوب */}
      <div className="relative w-full h-[500px] lg:h-[650px] hidden md:block" style={{ background: '#0d7d72' }}>
        <Image
          src="/marketing-banner-desktop.jpg"
          alt={t('home.marketing.title')}
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
};

export default HeroSlider;
