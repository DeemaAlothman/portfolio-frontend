"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

const HeroSlider = () => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full overflow-hidden shadow-xl border-b-4 border-primary/20">
      {/* نسخة طولية للموبايل - خلفية ضبابية من نفس الصورة (بدل لون مسطح) + الصورة كاملة بدون قص فوقها */}
      <div className="relative w-full h-[450px] sm:h-[550px] md:hidden">
        <Image
          src="/marketing-banner-mobile.jpg"
          alt=""
          aria-hidden="true"
          fill
          className="object-cover blur-2xl scale-110"
        />
        <Image
          src="/marketing-banner-mobile.jpg"
          alt={t('home.marketing.title')}
          fill
          className="relative object-contain"
          priority
        />
      </div>
      {/* نسخة عرضية للابتوب/ديسكتوب - نسخة عالية الدقة 1920x1080 */}
      <div className="relative w-full h-[500px] lg:h-[650px] hidden md:block">
        <Image
          src="/marketing-banner-desktop-hd.png"
          alt=""
          aria-hidden="true"
          fill
          className="object-cover blur-2xl scale-110"
        />
        <Image
          src="/marketing-banner-desktop-hd.png"
          alt={t('home.marketing.title')}
          fill
          className="relative object-contain"
          priority
        />
      </div>
    </div>
  );
};

export default HeroSlider;
