"use client";

import { Section, Heading, ResponsiveImage, Button } from "@repo/ui";
import type { FeaturedProduct } from "./types";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getImageUrl, getLocalizedField } from "@/lib/utils";
import { useEffect, useState, useRef, useCallback } from "react";
import { API_URL } from "@/lib/config";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, Star } from "lucide-react";

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
  const [user, setUser] = useState<any>(null);
  const [animatingProductId, setAnimatingProductId] = useState<string | null>(null);
  const [heartAnimatingId, setHeartAnimatingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {}
    }
  }, []);

  const handleAddToCart = useCallback((product: FeaturedProduct, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    
    addItem({
      id: product.id,
      name: getLocalizedField(product, 'name', language),
      price: isNaN(priceValue) ? 0 : priceValue,
      image: product.image.src,
      quantity: 1,
      stock: 999,
    });

    // Animate the cart button
    setAnimatingProductId(product.id);
    setTimeout(() => setAnimatingProductId(null), 500);

    addToast(`Added ${getLocalizedField(product, 'name', language)} to cart`);
  }, [addItem, addToast, language]);

  const toggleWishlist = useCallback(async (product: FeaturedProduct, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    const isWishlisted = wishlistItems.some(i => i.id === product.id);

    // Trigger heart animation
    setHeartAnimatingId(product.id);
    setTimeout(() => setHeartAnimatingId(null), 500);

    if (isWishlisted) {
      removeFromWishlist(product.id);
      addToast("Removed from wishlist");
      if (user) {
        try {
          await fetch(`${API_URL}/wishlist/${user.id}/${product.id}`, { method: 'DELETE' });
        } catch {}
      }
    } else {
      addToWishlist({
        id: product.id,
        name: getLocalizedField(product, 'name', language),
        price: isNaN(priceValue) ? 0 : priceValue,
        image: product.image.src
      });
      addToast("Added to wishlist");
      if (user) {
        try {
          await fetch(`${API_URL}/wishlist/${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id })
          });
        } catch {}
      }
    }
  }, [addToast, addToWishlist, removeFromWishlist, user, wishlistItems, language]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  return (
    <Section variant="blue" className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-3">
          <div>
            <Heading size="md" className="font-sans text-slate-900 dark:text-white font-bold text-xl sm:text-2xl tracking-tight">
              {title}
            </Heading>
            {subtitle && (
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md"
            >
              {t('view_all')}
              <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* Products Grid/Carousel */}
        <div className="relative group">
          {/* Desktop Navigation Arrows */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Products Container */}
          <div
            ref={scrollRef}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
          >
            {products.map((product, index) => {
              const isWishlisted = mounted && wishlistItems.some(i => i.id === product.id);
              const isAnimating = animatingProductId === product.id;
              const isHeartAnimating = heartAnimatingId === product.id;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="group/card bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden">
                    <Link href={product.href} className="block w-full h-full">
                      <ResponsiveImage
                        src={getImageUrl(product.image.src)}
                        alt={getLocalizedField(product, 'name', language)}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full group-hover/card:scale-105 transition-transform duration-500 ease-out"
                      />
                    </Link>

                    {/* Badges */}
                    {product.tag && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-orange-400 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm">
                          {product.tag}
                        </span>
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <motion.button
                      onClick={(e) => toggleWishlist(product, e)}
                      animate={isHeartAnimating && !isWishlisted ? { scale: [1, 1.3, 1] } : {}}
                      className={`absolute top-2 right-2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md touch-target ${
                        isWishlisted
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/90 dark:bg-slate-700/90 text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={isWishlisted ? "currentColor" : "none"}
                        className={isHeartAnimating ? "animate-heart-beat" : ""}
                      />
                    </motion.button>

                    {/* Quick Add Button - Shows on Hover (Desktop) */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity hidden lg:block">
                      <Button
                        onClick={(e: React.MouseEvent) => handleAddToCart(product, e)}
                        className="w-full py-2 text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 rounded-lg flex items-center justify-center gap-1.5 shadow-lg"
                      >
                        <ShoppingCart size={14} />
                        {t('add_to_cart')}
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 flex flex-col flex-grow">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < (product.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">({product.reviewCount || 0})</span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug min-h-[2.5em] mb-2">
                      <Link href={product.href} className="hover:text-sky-600 transition-colors">
                        {getLocalizedField(product, 'name', language)}
                      </Link>
                    </h3>

                    {/* Price & Add to Cart */}
                    <div className="mt-auto pt-2 space-y-2">
                      <div className="text-lg font-bold text-orange-500">
                        {product.price}
                      </div>

                      {/* Mobile Add to Cart Button */}
                      <motion.div
                        animate={isAnimating ? { scale: [1, 0.95, 1] } : {}}
                        className="lg:hidden"
                      >
                        <Button
                          onClick={(e: React.MouseEvent) => handleAddToCart(product, e)}
                          className={`w-full py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 min-h-[44px] transition-colors ${
                            isAnimating
                              ? 'bg-green-500 text-white'
                              : 'bg-sky-500 text-white hover:bg-sky-600'
                          }`}
                        >
                          <ShoppingCart size={14} />
                          {isAnimating ? '✓ Added!' : t('add_to_cart')}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop Navigation Arrow Right */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </Section>
  );
}
