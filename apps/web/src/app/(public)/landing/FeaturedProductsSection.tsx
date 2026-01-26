"use client";

import { Section, Heading, Text, ResponsiveImage, RatingStars, Button } from "@repo/ui";
import type { FeaturedProduct } from "./types";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

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
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const handleAddToCart = (product: FeaturedProduct) => {
    const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    
    addItem({
      id: product.id,
      name: product.name,
      price: isNaN(priceValue) ? 0 : priceValue,
      image: product.image.src,
      quantity: 1,
    });
    addToast(`Added ${product.name} to cart`);
  };

  const toggleWishlist = (product: FeaturedProduct) => {
    const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, ''));

    if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        addToast("Removed from wishlist");
    } else {
        addToWishlist({
            id: product.id,
            name: product.name,
            price: isNaN(priceValue) ? 0 : priceValue,
            image: product.image.src
        });
        addToast("Added to wishlist");
    }
  };

  return (
    <Section className="py-12 bg-slate-50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
            <div>
                <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold text-2xl">{title}</Heading>
                {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{subtitle}</p>}
            </div>
            {viewAllHref && (
                <Link href={viewAllHref} className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline">
                    View All →
                </Link>
            )}
        </div>
      
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => {
            const isWishlisted = isInWishlist(product.id);
            
            return (
                <div key={product.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 relative flex flex-col">
                    {/* Image Container */}
                    <div className="relative aspect-square bg-slate-50 dark:bg-slate-800 overflow-hidden">
                        <Link href={product.href} className="block w-full h-full">
                            <ResponsiveImage
                                src={product.image.src}
                                alt={product.image.alt}
                                width={300}
                                height={300}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                        </Link>
                        
                        {/* Badges */}
                        {product.tag && (
                            <div className="absolute top-2 left-2">
                                <span className="bg-sky-500 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                                    {product.tag}
                                </span>
                            </div>
                        )}

                        {/* Wishlist Button */}
                        <button 
                            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                                isWishlisted 
                                ? 'bg-rose-50 text-rose-500' 
                                : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-3 flex flex-col flex-grow">
                        <div className="mb-1">
                            <div className="flex items-center gap-1 mb-1">
                                <RatingStars rating={product.rating || 5} size="sm" />
                                <span className="text-[10px] text-slate-400">({product.reviewCount})</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug min-h-[2.5em]">
                                <Link href={product.href} className="hover:text-sky-600 transition-colors">
                                    {product.name}
                                </Link>
                            </h3>
                        </div>
                        
                        <div className="mt-auto pt-2">
                            <div className="text-base font-bold text-sky-600 dark:text-sky-400 mb-2">
                                {product.price}
                            </div>
                            <Button 
                                onClick={() => handleAddToCart(product)}
                                className="w-full py-2 text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 shadow-md rounded-lg"
                            >
                                Add to Cart
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
