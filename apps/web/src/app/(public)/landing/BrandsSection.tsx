"use client";

import { useEffect, useState } from "react";
import { Section, Heading, ResponsiveImage } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";

export function BrandsSection() {
  const [brands, setBrands] = useState<any[]>([]);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch(`${API_URL}/brands`)
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) {
              setBrands(data.filter((b: any) => b.is_active));
          }
      })
      .catch(console.error);
  }, []);

  if (brands.length === 0) return null;

  return (
    <Section className="py-8 sm:py-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white font-bold text-xl sm:text-2xl mb-6 sm:mb-8 text-center">
            {t('our_brands')}
        </Heading>
        
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {brands.map((brand) => (
                <Link 
                    key={brand.id} 
                    href={`/products?brand=${brand.id}`}
                    className="group flex flex-col items-center gap-3 w-32 sm:w-40"
                >
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center p-0 group-hover:shadow-md group-hover:border-sky-200 transition-all overflow-hidden relative">
                        {brand.logo ? (
                            <ResponsiveImage 
                                src={getImageUrl(brand.logo)} 
                                alt={getLocalizedField(brand, 'name', language)} 
                                width={160} 
                                height={160} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                        ) : (
                            <span className="text-4xl font-bold text-slate-300">{brand.name.charAt(0)}</span>
                        )}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors text-center line-clamp-1">
                        {getLocalizedField(brand, 'name', language)}
                    </span>
                </Link>
            ))}
        </div>
      </div>
    </Section>
  );
}
