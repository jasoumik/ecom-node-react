import { Section, Heading, Text, CardGrid, Card, ResponsiveImage, RatingStars, Button } from "@repo/ui";
import type { FeaturedProduct } from "./types";

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
  return (
    <Section className="bg-white py-12 sm:py-24 dark:bg-slate-900 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10 sm:mb-16 max-w-7xl mx-auto px-4">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest dark:bg-rose-900/30 dark:text-rose-300">
            New Arrivals
          </div>
          <Heading size="lg" className="font-serif text-3xl sm:text-5xl text-slate-900 dark:text-white">{title}</Heading>
          {subtitle && <Text variant="muted" className="text-base sm:text-lg dark:text-slate-400">{subtitle}</Text>}
        </div>
        {viewAllHref && (
          <Button variant="outline" className="hidden sm:inline-flex rounded-full px-8 py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all font-bold dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-slate-900">
            <a href={viewAllHref}>Shop All Products</a>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 max-w-7xl mx-auto px-4">
        {products.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-[#f8f8f8] mb-3 sm:mb-6 dark:bg-slate-800">
              {product.tag && (
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
                  <span className="bg-slate-900 text-white px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg dark:bg-white dark:text-slate-900">
                    {product.tag}
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 sm:bg-white shadow-lg flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors dark:bg-slate-700/80 dark:text-rose-400 backdrop-blur-sm">
                  ♥
                </button>
              </div>
              
              <ResponsiveImage
                src={product.image.src}
                alt={product.image.alt}
                width={product.image.width}
                height={product.image.height}
                className="object-cover w-full h-full sm:group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              
              {/* Add to Cart Button - Always visible on mobile, hover on desktop */}
              <div className="absolute inset-x-2 bottom-2 sm:inset-x-4 sm:bottom-4 translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-300 ease-out">
                <Button 
                  variant="secondary"
                  className="w-full bg-white/90 backdrop-blur-md text-slate-900 hover:bg-slate-900 hover:text-white shadow-xl font-bold py-2 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-sm dark:bg-slate-800/90 dark:text-white dark:hover:bg-white dark:hover:text-slate-900"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-2 text-center">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 font-serif group-hover:text-rose-500 transition-colors dark:text-white line-clamp-1">
                {product.name}
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">{product.price}</span>
                {product.rating != null && (
                  <div className="flex items-center gap-1">
                    <RatingStars rating={product.rating} />
                    <span className="hidden sm:inline">({product.reviewCount})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewAllHref && (
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" className="rounded-full px-8 py-3 border-2 border-slate-900 text-slate-900 w-full font-bold dark:border-white dark:text-white">
            <a href={viewAllHref}>Shop All Products</a>
          </Button>
        </div>
      )}
    </Section>
  );
}
