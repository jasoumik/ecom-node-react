"use client";

import { Section, Heading, ResponsiveImage } from "@repo/ui";
import type { Category } from "./types";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import {getImageUrl, getLocalizedField} from "@/lib/utils";
import { useRef } from "react";

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
          const { current } = scrollRef;
          const scrollAmount = 300;
          if (direction === 'left') {
              current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          } else {
              current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
      }
  };

  return (
    <Section className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-6 sm:mb-8 gap-2">
            <Heading size="md" className="font-sans text-slate-900 dark:text-white font-bold text-xl sm:text-2xl">{t('browse_categories')}</Heading>
            <Link href="/products" className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50 shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50 dark:border-slate-700">
                {t('view_all')}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
        </div>
        
        <div className="relative group">
            <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 hidden sm:flex"
            >
                ←
            </button>
            <div 
                ref={scrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 px-1"
            >
                {categories.map((category) => (
                <Link 
                    key={category.id} 
                    href={`/products?category=${category.id}`}
                    className="group flex flex-col items-center text-center gap-2 sm:gap-3 min-w-[100px] sm:min-w-[160px]"
                >
                    <div className="w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <ResponsiveImage
                            src={getImageUrl(category.image)}
                            alt={getLocalizedField(category, 'name', language)}
                            width={200}
                            height={200}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm group-hover:text-sky-600 transition-colors line-clamp-1">
                        {getLocalizedField(category, 'name', language)}
                    </h3>
                </Link>
                ))}
            </div>
            <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex"
            >
                →
            </button>
        </div>
      </div>
    </Section>
  );
}
