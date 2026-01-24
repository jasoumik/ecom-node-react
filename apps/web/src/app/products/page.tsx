"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage, RatingStars } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const searchQuery = searchParams.get("search");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let url = `${API_URL}/products`;
      
      // Handle query params manually since backend might expect different format or we need to combine
      const params = new URLSearchParams();
      if (categoryId) params.append("category", categoryId);
      // If backend supports search, add it here. For now, client side filter or ignore.
      // Assuming backend returns { data: [], meta: {} } now due to pagination change
      
      if (params.toString()) {
          url += `?${params.toString()}`;
      }

      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Handle paginated response structure { data: [], meta: {} }
          if (data.data && Array.isArray(data.data)) {
              let filteredProducts = data.data;
              if (searchQuery) {
                  const lowerQuery = searchQuery.toLowerCase();
                  filteredProducts = filteredProducts.filter((p: any) => 
                      p.name.toLowerCase().includes(lowerQuery)
                  );
              }
              setProducts(filteredProducts);
          } else if (Array.isArray(data)) {
              // Fallback for non-paginated response
              let filteredProducts = data;
              if (searchQuery) {
                  const lowerQuery = searchQuery.toLowerCase();
                  filteredProducts = filteredProducts.filter((p: any) => 
                      p.name.toLowerCase().includes(lowerQuery)
                  );
              }
              setProducts(filteredProducts);
          } else {
              setProducts([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, searchQuery]);

  const handleAddToCart = (product: any) => {
    // Parse image for cart
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
      name: product.name,
      price: parseFloat(product.price),
      image: imageUrl,
      quantity: 1,
    });
    addToast(`Added ${product.name} to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-4 font-bold">Shop All Products</Heading>
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
                <div key={product.id} className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                    <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden rounded-xl bg-[#f8f8f8] mb-3 dark:bg-slate-700">
                    <a href={`/products/${product.id}`} className="block w-full h-full">
                        <ResponsiveImage
                        src={imageUrl}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full sm:group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                    </a>
                    </div>
                    
                    <div className="flex flex-col flex-grow space-y-2">
                      <div className="space-y-1 text-center">
                        <h3 className="text-sm sm:text-lg font-bold text-slate-900 font-sans group-hover:text-sky-500 transition-colors dark:text-white line-clamp-1">
                            <a href={`/products/${product.id}`}>{product.name}</a>
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                            <RatingStars rating={5} />
                            <span className="hidden sm:inline">(12)</span>
                            </div>
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white text-center">
                            ৳{product.price}
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-2">
                        <Button 
                        variant="primary"
                        className="w-full bg-sky-400 text-white hover:bg-sky-500 shadow-md font-bold py-2.5 rounded-2xl text-sm"
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
        )}
      </div>
    </div>
  );
}
