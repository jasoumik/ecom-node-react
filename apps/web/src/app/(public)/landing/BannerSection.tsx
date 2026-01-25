"use client";

import { useState, useEffect } from "react";
import { ResponsiveImage } from "@repo/ui";

interface Banner {
  id: string;
  src: string;
  alt: string;
  link?: string;
}

interface BannerSectionProps {
  banners: Banner[];
}

export function BannerSection({ banners }: BannerSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 isolate">
        <a href={currentBanner.link || '#'} className="block w-full h-full relative bg-white dark:bg-slate-800">
            {/* Explicit white background layer */}
            <div className="absolute inset-0 bg-white dark:bg-slate-800 -z-10" />
            
            <div className="w-full h-full bg-white dark:bg-slate-800">
                <ResponsiveImage
                    src={currentBanner.src}
                    alt={currentBanner.alt}
                    width={1200}
                    height={400}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 bg-white dark:bg-slate-800"
                />
            </div>
            
            {/* Indicators */}
            {banners.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                            className={`h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm ${
                                idx === currentIndex 
                                ? 'w-8 bg-white' 
                                : 'w-2 bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
            
            {/* Navigation Arrows (Visible on Hover) */}
            {banners.length > 1 && (
                <>
                    <button 
                        onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 z-20"
                    >
                        ←
                    </button>
                    <button 
                        onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % banners.length); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 z-20"
                    >
                        →
                    </button>
                </>
            )}
        </a>
      </div>
    </section>
  );
}
