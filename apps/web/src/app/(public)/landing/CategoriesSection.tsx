"use client";

import { Section, Heading, ResponsiveImage } from "@repo/ui";
import type { Category } from "./types";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getImageUrl, getLocalizedField } from "@/lib/utils";
import { useRef, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoriesSectionProps {
  categories: Category[];
  motherCategories?: any[];
}

export function CategoriesSection({ categories, motherCategories = [] }: CategoriesSectionProps) {
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMotherCategory, setSelectedMotherCategory] = useState<string | null>(null);

  useEffect(() => {
      if (motherCategories.length > 0 && !selectedMotherCategory) {
          setSelectedMotherCategory(motherCategories[0].id);
      }
  }, [motherCategories]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  const filteredCategories = selectedMotherCategory
    ? categories.filter((c: any) => c.mother_category_id === selectedMotherCategory)
    : categories;

  return (
    <Section variant="blue" className="py-6 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-3">
          <div>
            <Heading size="md" className="font-sans text-slate-900 dark:text-white font-bold text-xl sm:text-2xl">
              {t('browse_categories')}
            </Heading>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {t('explore_range')}
            </p>
          </div>

          {/* Mother Category Tabs */}
          {motherCategories.length > 0 && (
              <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                  {motherCategories.map((mc) => (
                      <button
                          key={mc.id}
                          onClick={() => setSelectedMotherCategory(mc.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                              selectedMotherCategory === mc.id
                                  ? 'bg-sky-500 text-white shadow-sm'
                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                      >
                          {getLocalizedField(mc, 'name', language)}
                      </button>
                  ))}
              </div>
          )}

          <Link
            href="/products"
            className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md"
          >
            {t('view_all')}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Categories Carousel */}
        <div className="relative group">
          {/* Desktop Navigation Arrows */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex pointer-events-auto"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 touch-pan-x"
          >
            {filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="snap-start flex-shrink-0"
                >
                    <Link
                    href={`/products?category=${category.id}`}
                    className="group/card flex flex-col items-center text-center gap-2 sm:gap-3"
                    >
                    {/* Category Image */}
                    <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 relative bg-white dark:bg-slate-800 group-hover/card:scale-105 active:scale-95">
                        <ResponsiveImage
                        src={getImageUrl(category.image)}
                        alt={getLocalizedField(category, 'name', language)}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-sky-500/0 group-hover/card:bg-sky-500/10 transition-colors" />
                    </div>

                    {/* Category Name */}
                    <h3 className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm group-hover/card:text-sky-600 dark:group-hover/card:text-sky-400 transition-colors line-clamp-2 w-20 sm:w-28 lg:w-32">
                        {getLocalizedField(category, 'name', language)}
                    </h3>
                    </Link>
                </motion.div>
                ))
            ) : (
                <div className="w-full text-center py-8 text-slate-500">No categories found.</div>
            )}
          </div>

          {/* Desktop Navigation Arrow Right */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex pointer-events-auto"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </Section>
  );
}
