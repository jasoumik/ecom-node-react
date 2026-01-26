"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage, RatingStars } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";

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
  const { t, language } = useLanguage();

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

    let url = `${API_URL}/products?page=${pageNum}&limit=12`;
    
    if (categoryId) url += `&category=${categoryId}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    
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

        if (isInitial) {
            setProducts(newProducts);
        } else {
            setProducts(prev => [...prev, ...newProducts]);
        }

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
        imageUrl = getImageUrl(product.images[0]);
    } else if (typeof product.images === 'string') {
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
        } catch (e) {}
    }

    addItem({
      id: product.id,
      name: getLocalizedField(product, 'name', language),
      price: parseFloat(product.price),
      image: imageUrl,
      quantity: 1,
    });
    addToast(`Added ${getLocalizedField(product, 'name', language)} to cart`);
  };

  const toggleWishlist = (product: any) => {
    let imageUrl = "https://picsum.photos/seed/default/800/800";
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = getImageUrl(product.images[0]);
    } else if (typeof product.images === 'string') {
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
        } catch (e) {}
    }

    if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        addToast("Removed from wishlist");
    } else {
        addToWishlist({
            id: product.id,
            name: getLocalizedField(product, 'name', language),
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold text-2xl sm:text-3xl">{t('shop_all_products')}</Heading>
                <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('discover_collection')}</Text>
            </div>
        </div>

        {products.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                {t('no_products_found')}
            </div>
        ) : (
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {products.map((product: any) => {
                    let imageUrl = "https://picsum.photos/seed/default/800/800";
                    if (Array.isArray(product.images) && product.images.length > 0) {
                        imageUrl = getImageUrl(product.images[0]);
                    } else if (typeof product.images === 'string') {
                        try {
                            const parsed = JSON.parse(product.images);
                            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
                        } catch (e) {}
                    }

                    const isWishlisted = isInWishlist(product.id);

                    return (
                    <div key={product.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 relative flex flex-col">
                        {/* Image Container */}
                        <div className="relative aspect-square bg-slate-50 dark:bg-slate-800 overflow-hidden">
                            <Link href={`/products/${product.id}`} className="block w-full h-full">
                                <ResponsiveImage
                                    src={imageUrl}
                                    alt={getLocalizedField(product, 'name', language)}
                                    width={300}
                                    height={300}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                />
                            </Link>
                            
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
                                    <RatingStars rating={parseFloat(product.rating) || 0} size="sm" />
                                    <span className="text-[10px] text-slate-400">({product.reviewCount || 0})</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug min-h-[2.5em]">
                                    <Link href={`/products/${product.id}`} className="hover:text-sky-600 transition-colors">
                                        {getLocalizedField(product, 'name', language)}
                                    </Link>
                                </h3>
                            </div>
                            
                            <div className="mt-auto pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div className="text-base font-bold text-sky-600 dark:text-sky-400">
                                    ৳{product.price}
                                </div>
                                <Button 
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full sm:w-auto py-2 sm:py-1.5 px-3 text-xs font-bold bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400 rounded-lg shadow-sm"
                                >
                                    {t('add_to_cart')}
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
                            {loadingMore ? t('loading') : t('load_more')}
                        </Button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}
