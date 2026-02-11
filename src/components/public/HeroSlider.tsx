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
    <div className="relative w-full h-screen overflow-hidden">
      {/* Slide 1 - Portfolio */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          currentSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
        style={{
          background: '#00796B'
        }}
      >
        <div className="flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Content - Slides from LEFT */}
          <div
            key={`slide-1-content-${animationKey}`}
            className={`flex-1 pr-8 ${
              currentSlide === 0 ? 'animate-slideFromLeft' : ''
            }`}
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {t('home.title')}
            </h2>
            <p className="text-xl md:text-2xl text-white mb-4 leading-relaxed">
              {t('home.subtitle')}
            </p>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              {t('home.description')}
            </p>
          </div>

          {/* Image - Slides from RIGHT */}
          <div
            key={`slide-1-image-${animationKey}`}
            className={`flex-1 flex justify-center items-center ${
              currentSlide === 0 ? 'animate-slideFromRight' : ''
            }`}
          >
            <div className="relative w-full max-w-lg h-[500px]">
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
        <div className="flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Image - Slides from LEFT */}
          <div
            key={`slide-2-image-${animationKey}`}
            className={`flex-1 flex justify-center items-center ${
              currentSlide === 1 ? 'animate-slideFromLeft' : ''
            }`}
          >
            <div className="relative w-full max-w-lg h-[500px]">
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
            className={`flex-1 pl-8 bg-white h-full flex flex-col justify-center ${
              currentSlide === 1 ? 'animate-slideFromRight' : ''
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#00796B] mb-6">
              {t('home.marketing.title')}
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-[#00796B] mb-6 leading-tight">
              {t('home.marketing.subtitle')}
            </h3>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              {t('home.marketing.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        disabled={isAnimating}
        className="absolute top-1/2 right-8 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#00796B] text-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20 shadow-lg"
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        disabled={isAnimating}
        className="absolute top-1/2 left-8 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#00796B] text-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20 shadow-lg"
        aria-label="Next slide"
      >
        ❯
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isAnimating}
            className={`w-4 h-4 rounded-full transition-all ${
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
