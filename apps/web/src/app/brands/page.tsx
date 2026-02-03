"use client";

import { useEffect, useState } from "react";
import { Heading, ResponsiveImage } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch(`${API_URL}/brands?public=true`)
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) {
              setBrands(data);
          }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-8 font-bold text-center">All Brands</Heading>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {brands.map((brand) => (
                <Link 
                    key={brand.id} 
                    href={`/products?brand=${brand.id}`}
                    className="group flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700"
                >
                    <div className="w-24 h-24 rounded-xl bg-white border border-slate-100 dark:border-slate-700 flex items-center justify-center p-0 overflow-hidden relative">
                        {brand.logo ? (
                            <ResponsiveImage 
                                src={getImageUrl(brand.logo)} 
                                alt={getLocalizedField(brand, 'name', language)} 
                                width={100} 
                                height={100} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                        ) : (
                            <span className="text-3xl font-bold text-slate-300">{brand.name.charAt(0)}</span>
                        )}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors text-center line-clamp-1">
                        {getLocalizedField(brand, 'name', language)}
                    </span>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
