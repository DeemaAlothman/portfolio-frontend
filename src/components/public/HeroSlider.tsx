"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

const HeroSlider = () => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full overflow-hidden shadow-xl border-b-4 border-primary/20">
      {/* نسخة طولية للموبايل - ارتفاع ثابت بالبكسل (مش نسبة من عرض الشاشة) عشان يتناسق مع تكبير/تصغير المتصفح متل التصميم القديم */}
      <div className="relative w-full h-[450px] sm:h-[550px] md:hidden">
        <Image
          src="/marketing-banner-mobile.jpg"
          alt={t('home.marketing.title')}
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* نسخة عرضية للابتوب/ديسكتوب */}
      <div className="relative w-full h-[500px] lg:h-[650px] hidden md:block">
        <Image
          src="/marketing-banner-desktop.jpg"
          alt={t('home.marketing.title')}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
};

export default HeroSlider;
