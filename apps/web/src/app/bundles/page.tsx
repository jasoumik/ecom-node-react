"use client";

import { useEffect, useState } from "react";
import { Heading, Text, Button, ResponsiveImage } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";

export default function BundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      // Assuming bundles are products with a specific category or tag, or a separate endpoint
      // For now, let's fetch products that might be bundles (e.g. name contains "Bundle" or "Set")
      // Or if you have a specific endpoint for bundles
      const res = await fetch(`${API_URL}/products?search=bundle&limit=20`);
      if (res.ok) {
          const data = await res.json();
          setBundles(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bundles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    let imageUrl = "https://picsum.photos/seed/default/800/800";
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = getImageUrl(product.images[0]);
    } else if (typeof product.images === 'string') {
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
        } catch (e) {}
    }

    addItem({
      id: product.id,
      name: getLocalizedField(product, 'name', language),
      price: parseFloat(product.price),
      image: imageUrl,
      quantity: 1,
      stock: parseInt(product.stock) || 0 // Added stock
    });
    addToast(`Added ${getLocalizedField(product, 'name', language)} to cart`);
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-4">{t('bundles_sets')}</Heading>
            <Text className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t('bundles_desc')}
            </Text>
        </div>

        {bundles.length === 0 ? (
            <div className="text-center py-20">
                <p className="text-slate-500 dark:text-slate-400 mb-6">{t('no_bundles')}</p>
                <Link href="/products">
                    <Button variant="outline" className="rounded-xl">{t('browse_all')}</Button>
                </Link>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bundles.map((bundle) => {
                    let imageUrl = "https://picsum.photos/seed/default/800/800";
                    if (Array.isArray(bundle.images) && bundle.images.length > 0) {
                        imageUrl = getImageUrl(bundle.images[0]);
                    } else if (typeof bundle.images === 'string') {
                        try {
                            const parsed = JSON.parse(bundle.images);
                            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
                        } catch (e) {}
                    }

                    const savings = bundle.old_price ? Math.round(((bundle.old_price - bundle.price) / bundle.old_price) * 100) : 0;

                    return (
                        <div key={bundle.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-lg transition-all">
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <ResponsiveImage 
                                    src={imageUrl} 
                                    alt={getLocalizedField(bundle, 'name', language)} 
                                    width={600} 
                                    height={450} 
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                />
                                {savings > 0 && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                        {savings}% {t('off')}
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{getLocalizedField(bundle, 'name', language)}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">{getLocalizedField(bundle, 'description', language)}</p>
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">৳{bundle.price}</div>
                                        {bundle.old_price && (
                                            <div className="text-sm text-slate-400 line-through">৳{bundle.old_price}</div>
                                        )}
                                    </div>
                                    <Button 
                                        onClick={() => handleAddToCart(bundle)}
                                        className="rounded-xl px-6 bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-lg shadow-sky-500/20"
                                    >
                                        {t('add_to_cart')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}
