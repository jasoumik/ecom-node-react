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
    <Section className="bg-white py-24 dark:bg-slate-900 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16 max-w-7xl mx-auto px-4">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest dark:bg-rose-900/30 dark:text-rose-300">
            New Arrivals
          </div>
          <Heading size="lg" className="font-serif text-5xl text-slate-900 dark:text-white">{title}</Heading>
          {subtitle && <Text variant="muted" className="text-lg dark:text-slate-400">{subtitle}</Text>}
        </div>
        {viewAllHref && (
          <Button variant="outline" className="rounded-full px-8 py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all font-bold dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-slate-900">
            <a href={viewAllHref}>Shop All Products</a>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
        {products.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-[#f8f8f8] mb-6 dark:bg-slate-800">
              {product.tag && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-slate-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg dark:bg-white dark:text-slate-900">
                    {product.tag}
                  </span>
                </div>
              )}
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors dark:bg-slate-700 dark:text-rose-400">
                  ♥
                </button>
              </div>
              
              <ResponsiveImage
                src={product.image.src}
                alt={product.image.alt}
                width={product.image.width}
                height={product.image.height}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              
              <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                {/* Fixed button visibility by using variant="secondary" and forcing colors */}
                <Button 
                  variant="secondary"
                  className="w-full bg-white/90 backdrop-blur-md text-slate-900 hover:bg-slate-900 hover:text-white shadow-xl font-bold py-4 rounded-xl dark:bg-slate-800/90 dark:text-white dark:hover:bg-white dark:hover:text-slate-900"
                >
                  Add to Cart — {product.price}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-bold text-slate-900 font-serif group-hover:text-rose-500 transition-colors dark:text-white">
                {product.name}
              </h3>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                {product.rating != null && (
                  <div className="flex items-center gap-1">
                    <RatingStars rating={product.rating} />
                    <span>({product.reviewCount})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
