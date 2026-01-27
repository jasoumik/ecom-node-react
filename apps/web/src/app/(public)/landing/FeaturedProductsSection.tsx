"use client";

import { Section, Heading, Text, ResponsiveImage, RatingStars, Button } from "@repo/ui";
import type { FeaturedProduct } from "./types";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField } from "@/lib/utils";
import { useEffect, useState } from "react";

interface FeaturedProductsSectionProps {
  title: string;
  subtitle?: string;
  products: FeaturedProduct[];
  viewAllHref?: string;
}

export function FeaturedProductsSection({
  title,
  subtitle,
  products,
  viewAllHref,
}: FeaturedProductsSectionProps) {
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (product: FeaturedProduct) => {
    const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    
    addItem({
      id: product.id,
      name: getLocalizedField(product, 'name', language),
      price: isNaN(priceValue) ? 0 : priceValue,
      image: product.image.src,
      quantity: 1,
    });
    addToast(`Added ${getLocalizedField(product, 'name', language)} to cart`);
  };

  const toggleWishlist = (product: FeaturedProduct) => {
    const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    const isWishlisted = wishlistItems.some(i => i.id === product.id);

    if (isWishlisted) {
        removeFromWishlist(product.id);
        addToast("Removed from wishlist");
    } else {
        addToWishlist({
            id: product.id,
            name: getLocalizedField(product, 'name', language),
            price: isNaN(priceValue) ? 0 : priceValue,
            image: product.image.src
        });
        addToast("Added to wishlist");
    }
  };

  return (
    <Section className="py-12 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-2">
            <div>
                <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-black text-3xl tracking-tight">{title}</Heading>
                {subtitle && <p className="text-slate-500 dark:text-slate-400 text-base mt-1 font-medium">{subtitle}</p>}
            </div>
            {viewAllHref && (
                <Link href={viewAllHref} className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50 shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50 dark:border-slate-700">
                    {t('view_all')} 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Link>
            )}
        </div>
      
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => {
            const isWishlisted = mounted && wishlistItems.some(i => i.id === product.id);
            
            return (
                <div key={product.id} className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] border border-white/50 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col">
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] overflow-hidden rounded-t-[2rem] m-2 mb-0">
                        <Link href={product.href} className="block w-full h-full rounded-[1.5rem] overflow-hidden">
                            <ResponsiveImage
                                src={product.image.src}
                                alt={getLocalizedField(product, 'name', language)}
                                width={300}
                                height={400}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                        </Link>
                        
                        {/* Badges */}
                        {product.tag && (
                            <div className="absolute top-3 left-3 z-10">
                                <span className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm border border-white/50 dark:bg-slate-800/90 dark:text-white dark:border-slate-700">
                                    {product.tag}
                                </span>
                            </div>
                        )}

                        {/* Wishlist Button */}
                        <button 
                            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                            className={`absolute top-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm backdrop-blur-md ${
                                isWishlisted 
                                ? 'bg-rose-500 text-white scale-110 shadow-rose-500/30' 
                                : 'bg-white/80 text-slate-400 hover:bg-white hover:text-rose-500 hover:scale-110 dark:bg-slate-800/80 dark:text-slate-400'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-2 sm:p-3 flex-col flex-grow">
                        <div className="mb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug min-h-[2.5em] mb-1">
                                <Link href={product.href} className="hover:text-sky-600 transition-colors">
                                    {getLocalizedField(product, 'name', language)}
                                </Link>
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <RatingStars rating={product.rating || 5} size="sm" />
                                <span className="text-xs text-slate-400 font-bold">({product.reviewCount})</span>
                            </div>
                        </div>
                        
                        <div className="mt-auto pt-2">
                            <div className="text-base font-bold text-sky-600 dark:text-sky-400 mb-2">
                                {product.price}
                            </div>
                            <Button 
                                onClick={() => handleAddToCart(product)}
                                className="w-full py-2 text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 shadow-sm rounded-lg"
                            >
                                {t('add_to_cart')}
                            </Button>
                        </div>
                    </div>
                </div>
            );
            })}
        </div>
      </div>
    </Section>
  );
}
