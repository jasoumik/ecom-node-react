"use client";

import { useEffect, useState, useRef } from "react";
import { Section, Heading, ResponsiveImage } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

interface Brand {
  id: string;
  name: string;
  name_bn?: string;
  logo?: string;
  website?: string;
}

export function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const { t, language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

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

  if (brands.length === 0) return null;

  // Duplicate brands for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <Section className="py-8 sm:py-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <Heading size="md" className="font-sans text-slate-900 dark:text-white font-bold text-xl sm:text-2xl">
              {t('our_brands')}
            </Heading>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === "bn" ? "বিশ্বস্ত ব্র্যান্ড থেকে পণ্য" : "Products from trusted brands"}
            </p>
          </div>
          <Link
            href="/brands"
            className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50"
          >
            {t('view_all')}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        {/* Infinite Logo Carousel */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
        >
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

          {/* Scrolling container */}
          <motion.div
            className="flex gap-8 py-4"
            animate={{
              x: [0, -100 * brands.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: brands.length * 3,
                ease: "linear",
              },
            }}
          >
            {duplicatedBrands.map((brand, index) => (
              <Link
                key={`${brand.id}-${index}`}
                href={`/products?brand=${brand.id}`}
                className="group flex-shrink-0 flex flex-col items-center gap-3 min-w-[100px] sm:min-w-[120px]"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center p-2 overflow-hidden relative group-hover:shadow-lg group-hover:border-sky-200 dark:group-hover:border-sky-700 transition-all duration-300 group-hover:scale-105">
                  {brand.logo ? (
                    <ResponsiveImage
                      src={getImageUrl(brand.logo)}
                      alt={getLocalizedField(brand, 'name', language)}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-slate-300 group-hover:text-sky-500 transition-colors">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors text-center line-clamp-1">
                  {getLocalizedField(brand, 'name', language)}
                </span>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

