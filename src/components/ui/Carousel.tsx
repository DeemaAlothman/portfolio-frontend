"use client";

import { useState } from "react";

export interface CarouselItem {
  url: string;
  type: "IMAGE" | "VIDEO";
}

interface CarouselProps {
  items: CarouselItem[];
  alt?: string;
}

// كاروسيل بأسلوب انستغرام: صورة وحدة بس ظاهرة بكل مرة، بحجمها الطبيعي الكامل، مع أسهم ونقاط تنقّل
export default function Carousel({ items, alt = "" }: CarouselProps) {
  const [index, setIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const current = items[Math.min(index, items.length - 1)];

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i === items.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="relative w-full">
      {current.type === "VIDEO" ? (
        <video src={current.url} controls className="w-full h-auto block" />
      ) : (
        <img src={current.url} alt={alt} className="w-full h-auto block" />
      )}

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="السابق"
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground rounded-full p-2 shadow-md transition-colors z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="التالي"
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground rounded-full p-2 shadow-md transition-colors z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {items.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-primary" : "bg-white/80 border border-primary/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
