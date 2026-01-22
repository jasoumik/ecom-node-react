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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white shadow-sm border border-sky-100 text-sky-600 text-sm font-bold uppercase tracking-wider animate-fade-in-up dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            New Arrivals
          </div>
          <Heading size="lg" className="font-sans text-3xl sm:text-5xl text-slate-900 dark:text-white font-bold">{title}</Heading>
          {subtitle && <Text variant="muted" className="text-base sm:text-lg dark:text-slate-400 font-medium">{subtitle}</Text>}
        </div>
        {viewAllHref && (
          <a href={viewAllHref} className="hidden sm:inline-block">
            <Button variant="primary" className="rounded-2xl px-8 py-3 bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/30 w-full font-bold dark:bg-sky-600 dark:hover:bg-sky-500">
              Shop All Products
            </Button>
          </a>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto px-4">
        {products.map((product) => (
          <div key={product.id} className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
            <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden rounded-xl bg-[#f8f8f8] mb-3 dark:bg-slate-700">
              <a href={product.href} className="block w-full h-full">
                {product.tag && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-lg dark:bg-white dark:text-slate-900">
                      {product.tag}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-8 h-8 rounded-2xl bg-white/80 sm:bg-white shadow-lg flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white transition-colors dark:bg-slate-700/80 dark:text-sky-400 backdrop-blur-sm">
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
              </a>
            </div>
            
            <div className="flex flex-col flex-grow space-y-2">
              <div className="space-y-1 text-center">
                <h3 className="text-sm sm:text-lg font-bold text-slate-900 font-sans group-hover:text-sky-500 transition-colors dark:text-white line-clamp-1">
                  <a href={product.href}>{product.name}</a>
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-0.5">
                    <RatingStars rating={product.rating || 5} />
                    <span className="hidden sm:inline">({product.reviewCount})</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white text-center">
                  {product.price}
                </div>
              </div>
              
              <div className="mt-auto pt-2">
                <Button 
                  variant="primary"
                  className="w-full bg-sky-400 text-white hover:bg-sky-500 shadow-md font-bold py-2.5 rounded-2xl text-sm"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewAllHref && (
        <div className="mt-8 text-center sm:hidden">
          <a href={viewAllHref} className="block w-full">
            <Button variant="primary" className="rounded-2xl px-6 py-2.5 bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/30 w-full font-bold dark:bg-sky-600 dark:hover:bg-sky-500 text-sm">
              Shop All Products
            </Button>
          </a>
        </div>
      )}
    </Section>
  );
}
