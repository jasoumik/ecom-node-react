"use client";

import { useEffect, useState, useRef } from "react";
import { Section, Heading, ResponsiveImage } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";

export function BrandsSection() {
  const [brands, setBrands] = useState<any[]>([]);
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/brands?public=true`)
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) {
              setBrands(data);
          }
      })
      .catch(console.error);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
          const { current } = scrollRef;
          const scrollAmount = 200;
          if (direction === 'left') {
              current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          } else {
              current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
      }
  };

  if (brands.length === 0) return null;

  return (
    <Section className="py-8 sm:py-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
            <Heading size="md" className="font-sans text-slate-900 dark:text-white font-bold text-xl sm:text-2xl">
                {t('our_brands')}
            </Heading>
            <Link href="/brands" className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50 shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50 dark:border-slate-700">
                {t('view_all')}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
        </div>
        
        {/* Brands Scrollable List */}
        <div className="relative group">
            <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 hidden sm:flex"
            >
                ←
            </button>
            <div 
                ref={scrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 px-1"
            >
                {brands.map((brand) => (
                    <Link 
                        key={brand.id} 
                        href={`/products?brand=${brand.id}`}
                        className="group flex flex-col items-center gap-2 min-w-[80px] sm:min-w-[100px]"
                    >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center p-0 overflow-hidden relative group-hover:shadow-md group-hover:border-sky-200 transition-all">
                            {brand.logo ? (
                                <ResponsiveImage 
                                    src={getImageUrl(brand.logo)} 
                                    alt={getLocalizedField(brand, 'name', language)} 
                                    width={100} 
                                    height={100} 
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-slate-300">{brand.name.charAt(0)}</span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-sky-600 transition-colors text-center line-clamp-1">
                            {getLocalizedField(brand, 'name', language)}
                        </span>
                    </Link>
                ))}
            </div>
            <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex"
            >
                →
            </button>
        </div>
      </div>
    </Section>
  );
}
