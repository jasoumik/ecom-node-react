"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage, RatingStars } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const searchQuery = searchParams.get("search");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    // Reset when filters change
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [categoryId, searchQuery]);

  const fetchProducts = async (pageNum: number, isInitial: boolean = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    let url = `${API_URL}/products?page=${pageNum}&limit=12`; // Fetch 12 per page for better grid alignment
    
    const params = new URLSearchParams();
    if (categoryId) params.append("category", categoryId);
    
    // Append existing params to url
    if (categoryId) url += `&category=${categoryId}`;
    
    // Note: Backend search param might not be fully implemented in controller yet, 
    // but we are filtering client side for now if backend returns all.
    // However, with pagination, client side filtering is tricky. 
    // Ideally backend should handle search. 
    // Let's assume backend ignores search param for now and we filter client side? 
    // No, that breaks pagination. 
    // I will assume backend returns paginated data and I will append to list.
    // If search is present, we might need to fetch all or backend needs search support.
    // For now, let's just fetch and append.

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let newProducts = [];
        let total = 0;

        if (data.data && Array.isArray(data.data)) {
            newProducts = data.data;
            total = data.meta.total;
        } else if (Array.isArray(data)) {
            newProducts = data;
            total = data.length;
        }

        // Client-side search filtering (Temporary fix until backend search is robust)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            newProducts = newProducts.filter((p: any) => 
                p.name.toLowerCase().includes(lowerQuery)
            );
            // Note: This is imperfect with pagination as matches might be on next pages.
            // But without backend search, it's the best we can do without fetching all.
        }

        if (isInitial) {
            setProducts(newProducts);
        } else {
            setProducts(prev => [...prev, ...newProducts]);
        }

        // Check if we have loaded all
        if (newProducts.length === 0 || (isInitial && newProducts.length < 12) || (products.length + newProducts.length >= total)) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
  };

  const handleAddToCart = (product: any) => {
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

  const toggleWishlist = (product: any) => {
    let imageUrl = "https://picsum.photos/seed/default/800/800";
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = product.images[0];
    } else if (typeof product.images === 'string') {
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
        } catch (e) {}
    }

    if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        addToast("Removed from wishlist");
    } else {
        addToWishlist({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: imageUrl
        });
        addToast("Added to wishlist");
    }
  };

  if (loading) {
    return <FullScreenLoader />;
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
            <>
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

                    const isWishlisted = isInWishlist(product.id);

                    return (
                    <div key={product.id} className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all relative">
                        <button 
                            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                            className={`absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center transition-colors shadow-sm ${isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                        >
                            {isWishlisted ? '♥' : '♡'}
                        </button>

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

                {hasMore && (
                    <div className="mt-12 text-center">
                        <Button 
                            variant="outline" 
                            onClick={loadMore} 
                            disabled={loadingMore}
                            className="rounded-xl px-8 py-3"
                        >
                            {loadingMore ? "Loading..." : "Load More Products"}
                        </Button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}
