"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

const HeroSlider = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const slides = [
    {
      id: 1,
      titleKey: 'home.title',
      subtitleKey: 'home.subtitle',
      descriptionKey: 'home.description',
      imageType: 'welcome',
    },
    {
      id: 2,
      titleKey: 'home.marketing.title',
      subtitleKey: 'home.marketing.subtitle',
      descriptionKey: 'home.marketing.description',
      imageType: 'smoke',
    },
  ];

  const showSlide = (n: number) => {
    if (isAnimating) return;

    setIsAnimating(true);

    let newSlide = n;
    if (n >= slides.length) newSlide = 0;
    if (n < 0) newSlide = slides.length - 1;

    setCurrentSlide(newSlide);

    setTimeout(() => setIsAnimating(false), 1000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (n: number) => showSlide(n);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') nextSlide();
      if (e.key === 'ArrowRight') prevSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden shadow-xl border-b-4 border-primary/20">
      {/* Slide 1 - Portfolio */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          currentSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
        style={{
          background: '#00796B'
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-0">
          {/* Content - Slides from LEFT */}
          <div
            key={`slide-1-content-${animationKey}`}
            className={`flex-1 w-full md:pr-8 lg:pr-16 text-center md:text-right mb-6 md:mb-0 ${
              currentSlide === 0 ? 'animate-slideFromLeft' : ''
            }`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              {t('home.title')}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white mb-3 md:mb-4 leading-relaxed">
              {t('home.subtitle')}
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed">
              {t('home.description')}
            </p>
          </div>

          {/* Image - Slides from RIGHT */}
          <div
            key={`slide-1-image-${animationKey}`}
            className={`flex-1 w-full flex justify-center items-center ${
              currentSlide === 0 ? 'animate-slideFromRight' : ''
            }`}
          >
            <div className="relative w-full max-w-[250px] sm:max-w-[350px] md:max-w-lg h-[250px] sm:h-[350px] md:h-[500px]">
              <Image
                src="/image.png"
                alt="Welcome"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slide 2 - Marketing */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          currentSlide === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
        style={{
          background: '#E8D5C4'
        }}
      >
        <div className="flex flex-col-reverse md:flex-row items-center justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-0">
          {/* Image - Slides from LEFT */}
          <div
            key={`slide-2-image-${animationKey}`}
            className={`flex-1 w-full flex justify-center items-center ${
              currentSlide === 1 ? 'animate-slideFromLeft' : ''
            }`}
          >
            <div className="relative w-full max-w-[250px] sm:max-w-[350px] md:max-w-lg h-[250px] sm:h-[350px] md:h-[500px]">
              <Image
                src="/image2.jpg"
                alt="Marketing"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Content - Slides from RIGHT */}
          <div
            key={`slide-2-content-${animationKey}`}
            className={`flex-1 w-full md:pl-8 lg:pl-16 md:pr-4 bg-white md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none mb-6 md:mb-0 text-center md:text-right flex flex-col justify-center ${
              currentSlide === 1 ? 'animate-slideFromRight' : ''
            }`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#00796B] mb-4 md:mb-6">
              {t('home.marketing.title')}
            </h2>
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#00796B] mb-4 md:mb-6 leading-tight">
              {t('home.marketing.subtitle')}
            </h3>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed">
              {t('home.marketing.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        disabled={isAnimating}
        className="absolute top-1/2 right-2 sm:right-4 md:right-8 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#00796B] text-lg sm:text-xl md:text-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20 shadow-lg"
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        disabled={isAnimating}
        className="absolute top-1/2 left-2 sm:left-4 md:left-8 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#00796B] text-lg sm:text-xl md:text-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20 shadow-lg"
        aria-label="Next slide"
      >
        ❯
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 md:gap-4 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isAnimating}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all ${
              currentSlide === index
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            } disabled:cursor-not-allowed`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
