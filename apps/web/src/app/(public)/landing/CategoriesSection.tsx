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
    <Section className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
            <div>
                <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold text-2xl">{t('browse_categories')}</Heading>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('explore_range')}</p>
            </div>
            <Link href="/products" className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline">
                {t('view_all')} →
            </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
            <Link 
                key={category.id} 
                href={`/products?category=${category.id}`}
                className="group relative w-full aspect-square rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300"
            >
                {/* Image */}
                <ResponsiveImage
                    src={category.image}
                    alt={getLocalizedField(category, 'name', language)}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay for Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                    <h3 className="font-bold text-sm sm:text-base group-hover:text-sky-300 transition-colors line-clamp-1">{getLocalizedField(category, 'name', language)}</h3>
                    <span className="text-xs opacity-80 group-hover:opacity-100 transition-opacity">{t('shop_now')} →</span>
                </div>
            </Link>
            ))}
        </div>
      </div>
    </Section>
  );
}
