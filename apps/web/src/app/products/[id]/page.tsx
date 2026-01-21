"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage } from "@repo/ui";
import { API_URL } from "@/lib/config";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 dark:text-white">Product not found</div>;
  }

  // Handle image parsing
  let images: string[] = [];
  if (Array.isArray(product.images)) {
      images = product.images;
  } else if (typeof product.images === 'string') {
      try {
          images = JSON.parse(product.images);
      } catch (e) {
          images = [product.images]; // Fallback if it's a single string URL
      }
  }
  
  if (images.length === 0) {
      images = ["https://picsum.photos/seed/default/800/800"];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-lg dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <ResponsiveImage 
                src={images[0]} 
                alt={product.name} 
                width={800} 
                height={800} 
                className="w-full h-full object-cover" 
              />
            </div>
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                {images.slice(1).map((img: string, i: number) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white shadow cursor-pointer hover:opacity-80 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <ResponsiveImage 
                        src={img} 
                        alt={`${product.name} ${i+2}`} 
                        width={200} 
                        height={200} 
                        className="w-full h-full object-cover" 
                    />
                    </div>
                ))}
                </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <div className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-2">{product.category}</div>
              <Heading as="h1" size="xl" className="font-serif dark:text-white text-4xl sm:text-5xl">{product.name}</Heading>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mt-4">৳{product.price}</div>
            </div>

            <Text className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </Text>

            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
              <Button className="w-full py-4 text-lg rounded-full shadow-xl shadow-rose-500/20 bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 transition-all duration-300">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
