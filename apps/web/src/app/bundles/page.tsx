"use client";

import { useEffect, useState } from "react";
import { Heading, Text, Button, ResponsiveImage, RatingStars } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField } from "@/lib/utils";

export default function BundlesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products?limit=100`);
        if (res.ok) {
          const data = await res.json();
          const allProducts = data.data || data;
          
          const bundles = allProducts.filter((p: any) => 
              p.name.toLowerCase().includes('set') || 
              p.name.toLowerCase().includes('bundle') || 
              p.name.toLowerCase().includes('pack') ||
              p.name.toLowerCase().includes('combo') ||
              (p.old_price && parseFloat(p.old_price) > parseFloat(p.price))
          );
          
          setProducts(bundles);
        }
      } catch (error) {
        console.error("Failed to fetch bundles", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  const handleAddToCart = (product: any) => {
    let imageUrl = "https://picsum.photos/seed/default/800/800";
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = product.images[0];
    } else if (typeof product.images === 'string') {
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
        } catch (e) {}
    }

    addItem({
      id: product.id,
      name: getLocalizedField(product, 'name', language),
      price: parseFloat(product.price),
      image: imageUrl,
      quantity: 1,
    });
    addToast(`Added ${getLocalizedField(product, 'name', language)} to cart`);
  };

  const toggleWishlist = (product: any) => {
    let imageUrl = "https://picsum.photos/seed/default/800/800";
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = product.images[0];
    } else if (typeof product.images === 'string') {
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
        } catch (e) {}
    }

    if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        addToast("Removed from wishlist");
    } else {
        addToWishlist({
            id: product.id,
            name: getLocalizedField(product, 'name', language),
            price: parseFloat(product.price),
            image: imageUrl
        });
        addToast("Added to wishlist");
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4 dark:bg-sky-900/30 dark:text-sky-400">
            {t('save_more')}
          </div>
          <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-4 font-bold">{t('bundles_sets')}</Heading>
          <Text className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('bundles_desc')}
          </Text>
        </div>

        {products.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm">
                <p className="text-lg mb-4">{t('no_bundles')}</p>
                <Link href="/products">
                    <Button variant="outline" className="rounded-xl">{t('browse_all')}</Button>
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {products.map((product: any) => {
                let imageUrl = "https://picsum.photos/seed/default/800/800";
                if (Array.isArray(product.images) && product.images.length > 0) {
                    imageUrl = product.images[0];
                } else if (typeof product.images === 'string') {
                    try {
                        const parsed = JSON.parse(product.images);
                        if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
                    } catch (e) {}
                }

                const isWishlisted = isInWishlist(product.id);
                const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

                return (
                <div key={product.id} className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all relative border border-slate-100 dark:border-slate-700">
                    <button 
                        onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                        className={`absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center transition-colors shadow-sm ${isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                    >
                        {isWishlisted ? '♥' : '♡'}
                    </button>

                    {discount > 0 && (
                        <div className="absolute top-5 left-5 z-10 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md">
                            -{discount}% {t('off')}
                        </div>
                    )}

                    <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden rounded-xl bg-[#f8f8f8] mb-3 dark:bg-slate-700">
                    <Link href={`/products/${product.id}`} className="block w-full h-full">
                        <ResponsiveImage
                        src={imageUrl}
                        alt={getLocalizedField(product, 'name', language)}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full sm:group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                    </Link>
                    </div>
                    
                    <div className="flex flex-col flex-grow space-y-2">
                      <div className="space-y-1 text-center">
                        <h3 className="text-sm sm:text-lg font-bold text-slate-900 font-sans group-hover:text-sky-500 transition-colors dark:text-white line-clamp-1">
                            <Link href={`/products/${product.id}`}>{getLocalizedField(product, 'name', language)}</Link>
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                            <RatingStars rating={5} />
                            <span className="hidden sm:inline">(12)</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                                ৳{product.price}
                            </div>
                            {product.old_price && (
                                <div className="text-sm text-slate-400 line-through">
                                    ৳{product.old_price}
                                </div>
                            )}
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-2">
                        <Button 
                        variant="primary"
                        className="w-full bg-sky-400 text-white hover:bg-sky-500 shadow-md font-bold py-2.5 rounded-2xl text-sm"
                        onClick={() => handleAddToCart(product)}
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
