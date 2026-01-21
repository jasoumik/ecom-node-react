"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage, RatingStars } from "@repo/ui";
import { API_URL } from "@/lib/config";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const url = categoryId 
        ? `${API_URL}/products?category=${categoryId}`
        : `${API_URL}/products`;
        
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Heading size="xl" className="font-serif text-slate-900 dark:text-white mb-4">Shop All Products</Heading>
          <Text className="text-slate-600 dark:text-slate-400">Discover our curated collection of premium baby essentials.</Text>
        </div>

        {products.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-20">No products found.</div>
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

                return (
                <div key={product.id} className="group cursor-pointer">
                    <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white mb-3 sm:mb-6 dark:bg-slate-800 shadow-sm hover:shadow-md transition-all">
                    <a href={`/products/${product.id}`} className="block w-full h-full">
                        <ResponsiveImage
                        src={imageUrl}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full sm:group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                    </a>
                    
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
                        <a href={`/products/${product.id}`}>{product.name}</a>
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-900 dark:text-white">৳{product.price}</span>
                        <div className="flex items-center gap-1">
                        <RatingStars rating={5} />
                        <span className="hidden sm:inline">(12)</span>
                        </div>
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
