"use client";

import { Section, Heading, Text, ResponsiveImage, RatingStars, Button } from "@repo/ui";
import type { FeaturedProduct } from "./types";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";

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
    <Section className="py-12 sm:py-16 transition-colors duration-300 !bg-sky-50 dark:!bg-slate-950">
      <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-8 sm:mb-10 max-w-7xl mx-auto px-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-sky-100 text-sky-600 text-[10px] font-bold uppercase tracking-wider animate-fade-in-up dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            New Arrivals
          </div>
          <Heading size="lg" className="font-sans text-2xl sm:text-3xl text-slate-900 dark:text-white font-bold">{title}</Heading>
          {subtitle && <Text variant="muted" className="text-sm sm:text-base dark:text-slate-400 font-medium">{subtitle}</Text>}
        </div>
        {viewAllHref && (
          <a href={viewAllHref} className="hidden sm:inline-block">
            <Button variant="primary" className="rounded-xl px-6 py-2 bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/30 w-full font-bold dark:bg-sky-600 dark:hover:bg-sky-500 text-xs">
              Shop All
            </Button>
          </a>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto px-4">
        {products.map((product) => {
          const isWishlisted = isInWishlist(product.id);
          
          return (
            <div key={product.id} className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-sky-50 dark:border-slate-700 relative">
              <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden rounded-lg bg-[#e0f2fe] mb-3 dark:bg-slate-700">
                <a href={product.href} className="block w-full h-full">
                  {product.tag && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md shadow-lg dark:bg-white dark:text-slate-900">
                        {product.tag}
                      </span>
                    </div>
                  )}
                  
                  <ResponsiveImage
                    src={product.image.src}
                    alt={product.image.alt}
                    width={product.image.width}
                    height={product.image.height}
                    className="object-cover w-full h-full sm:group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                </a>
                
                <button 
                  onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                  className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isWishlisted 
                      ? 'bg-rose-50 text-rose-500 scale-110' 
                      : 'bg-white/80 text-slate-400 hover:bg-white hover:text-rose-500 hover:scale-110 dark:bg-slate-800/80 dark:text-slate-400'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col flex-grow space-y-1.5">
                <div className="space-y-0.5 text-center">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-sans group-hover:text-sky-500 transition-colors dark:text-white line-clamp-1">
                    <a href={product.href}>{product.name}</a>
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-0.5">
                      <RatingStars rating={product.rating || 5} />
                      <span className="hidden sm:inline">({product.reviewCount})</span>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white text-center">
                    {product.price}
                  </div>
                </div>
                
                <div className="mt-auto pt-1">
                  <Button 
                    variant="primary"
                    className="w-full bg-sky-400 text-white hover:bg-sky-500 shadow-sm font-bold py-2 rounded-lg text-xs"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {viewAllHref && (
        <div className="mt-8 text-center sm:hidden">
          <a href={viewAllHref} className="block w-full">
            <Button variant="primary" className="rounded-xl px-6 py-2.5 bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/30 w-full font-bold dark:bg-sky-600 dark:hover:bg-sky-500 text-xs">
              Shop All
            </Button>
          </a>
        </div>
      )}
    </Section>
  );
}
