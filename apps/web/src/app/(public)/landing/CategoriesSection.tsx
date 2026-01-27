"use client";

import { Section, Heading, ResponsiveImage } from "@repo/ui";
import type { Category } from "./types";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField } from "@/lib/utils";

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const { t, language } = useLanguage();

  return (
    <Section className="py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold text-2xl">{t('browse_categories')}</Heading>
            <Link href="/products" className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50 shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50 dark:border-slate-700">
                {t('view_all')}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
            <Link 
                key={category.id} 
                href={`/products?category=${category.id}`}
                className="group flex flex-col items-center text-center gap-3"
            >
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <ResponsiveImage
                        src={category.image}
                        alt={getLocalizedField(category, 'name', language)}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-sky-600 transition-colors line-clamp-1">
                    {getLocalizedField(category, 'name', language)}
                </h3>
            </Link>
            ))}
        </div>
      </div>
    </Section>
  );
}
