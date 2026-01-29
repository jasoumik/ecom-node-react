"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage, RatingStars } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import { FlagIcon } from "@/components/ui/FlagIcon";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<string>("");
  const [activeTab, setActiveTab] = useState("description");
  
  // Variant Selection State
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedWeight, setSelectedWeight] = useState<string>(""); // Added Weight State
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Notify Me State
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Zoom State
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
            fetch(`${API_URL}/products/${id}`),
            fetch(`${API_URL}/reviews/product/${id}`)
        ]);
        
        if (productRes.ok) {
          const data = await productRes.json();
          setProduct(data);
          
          // Fetch related products
          if (data.category_id) {
              fetch(`${API_URL}/products?category=${data.category_id}&limit=4`)
                .then(res => res.json())
                .then(related => {
                    const list = related.data || related;
                    setRelatedProducts(list.filter((p: any) => p.id !== data.id).slice(0, 4));
                })
                .catch(console.error);
          }
          
          let media: string[] = [];
          if (Array.isArray(data.images)) {
              media = data.images;
          } else if (typeof data.images === 'string') {
              try {
                  media = JSON.parse(data.images);
              } catch (e) {
                  media = [data.images];
              }
          }
          if (media.length > 0) setSelectedMedia(media[0]);

          if (data.variants && data.variants.length > 0) {
              const sortedVariants = [...data.variants].sort((a, b) => b.stock - a.stock);
              const first = sortedVariants[0];
              if (first.size) setSelectedSize(first.size);
              if (first.color) setSelectedColor(first.color);
              if (first.weight) setSelectedWeight(first.weight);
          }
        }

        if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            setNotifyPhone(user.phone || "");
            setNotifyEmail(user.email || "");
        } catch (e) {}
    }
  }, [id]);

  useEffect(() => {
      if (!product || !product.variants) return;
      
      const variant = product.variants.find((v: any) => {
          const sizeMatch = !v.size || v.size === selectedSize;
          const colorMatch = !v.color || v.color === selectedColor;
          const weightMatch = !v.weight || v.weight === selectedWeight;
          return sizeMatch && colorMatch && weightMatch;
      });
      
      if (variant) {
          setSelectedVariant(variant);
      } else {
          // Fallback logic if exact match fails (prioritize weight if selected)
          const fallback = product.variants.find((v: any) => 
              (selectedWeight && v.weight === selectedWeight) ||
              (selectedSize && v.size === selectedSize)
          );
          if (fallback) setSelectedVariant(fallback);
      }
      setQuantity(1);
  }, [selectedSize, selectedColor, selectedWeight, product]);

  const handleSizeChange = (newSize: string) => {
      setSelectedSize(newSize);
      // Reset others if needed or try to find best match
  };

  const handleColorChange = (newColor: string) => {
      setSelectedColor(newColor);
  };

  const handleWeightChange = (newWeight: string) => {
      setSelectedWeight(newWeight);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.has_variants && product.variants.length > 0 && !selectedVariant) {
        addToast("Please select valid options", "error");
        return;
    }

    const finalPrice = selectedVariant ? parseFloat(selectedVariant.price || product.price) : parseFloat(product.price);
    const finalStock = selectedVariant ? parseInt(selectedVariant.stock) : parseInt(product.stock);

    if (finalStock < quantity) {
        addToast(`Only ${finalStock} items available`, "error");
        return;
    }

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
      variantId: selectedVariant?.id,
      name: `${getLocalizedField(product, 'name', language)} ${selectedVariant ? `(${[selectedSize, selectedColor, selectedWeight].filter(Boolean).join(' ')})` : ''}`,
      price: finalPrice,
      image: imageUrl,
      quantity: quantity,
      stock: finalStock
    });
    addToast(`Added ${quantity} x ${getLocalizedField(product, 'name', language)} to cart`);
  };

  const handleOrderNow = () => {
      const finalStock = selectedVariant ? parseInt(selectedVariant.stock) : parseInt(product.stock);
      if (finalStock < quantity) {
          addToast(`Only ${finalStock} items available`, "error");
          return;
      }
      handleAddToCart();
      router.push('/cart');
  };

  const handleNotifyRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmittingRequest(true);
      try {
          const res = await fetch(`${API_URL}/requests/stock`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  productId: product.id,
                  variantId: selectedVariant?.id,
                  phone: notifyPhone,
                  email: notifyEmail
              }),
          });
          if (res.ok) {
              addToast("Request received! We'll notify you.", "success");
              setShowNotifyModal(false);
          } else {
              addToast("Failed to submit request", "error");
          }
      } catch (e) {
          addToast("Error submitting request", "error");
      } finally {
          setIsSubmittingRequest(false);
      }
  };

  const handleShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: getLocalizedField(product, 'name', language),
                  text: getLocalizedField(product, 'description', language),
                  url: window.location.href,
              });
          } catch (e) {}
      } else {
          navigator.clipboard.writeText(window.location.href);
          addToast("Link copied to clipboard", "success");
      }
  };

  const parseReviewImages = (images: any) => {
      if (!images) return [];
      if (Array.isArray(images)) return images;
      try {
          return JSON.parse(images);
      } catch (e) {
          return [];
      }
  };

  if (loading) return <FullScreenLoader />;
  if (!product) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 dark:text-white">{t('no_products_found')}</div>;

  let mediaList: string[] = [];
  if (Array.isArray(product.images)) {
      mediaList = product.images;
  } else if (typeof product.images === 'string') {
      try {
          mediaList = JSON.parse(product.images);
      } catch (e) {
          mediaList = [product.images];
      }
  }
  if (mediaList.length === 0) mediaList = ["https://picsum.photos/seed/default/800/800"];

  const isVideo = (url: string) => {
      return url.match(/\.(mp4|webm|ogg)$/i);
  };

  const sizes = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))) : [];
  const colors = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) : [];
  const weights = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.weight).filter(Boolean))) : [];

  const currentPrice = selectedVariant ? (selectedVariant.price || product.price) : product.price;
  const currentStock = selectedVariant ? parseInt(selectedVariant.stock) : parseInt(product.stock);
  const currentWeight = selectedVariant?.weight || product.weight;

  const isSizeAvailable = (size: string) => {
      return product.variants.some((v: any) => v.size === size && v.stock > 0);
  };
  
  const isColorAvailableForSize = (color: string) => {
      if (!selectedSize) return true;
      const variant = product.variants.find((v: any) => v.size === selectedSize && v.color === color);
      return variant && variant.stock > 0;
  };

  const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-24 transition-colors duration-300">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Link href="/" className="hover:text-sky-500">{t('home')}</Link>
                  <span>/</span>
                  <Link href="/products" className="hover:text-sky-500">{t('products')}</Link>
                  <span>/</span>
                  <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">{getLocalizedField(product, 'name', language)}</span>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Column: Media Gallery */}
          <div className="md:col-span-6 lg:col-span-7 space-y-4">
            <div 
                className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative group cursor-zoom-in"
                ref={imageRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => setIsZoomed(!isZoomed)}
            >
              {isVideo(selectedMedia) ? (
                  <video 
                    src={getImageUrl(selectedMedia)} 
                    controls 
                    className="w-full h-full object-contain"
                    autoPlay 
                    muted 
                    loop
                  />
              ) : (
                  <>
                    <div 
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url(${getImageUrl(selectedMedia)})`,
                            backgroundPosition: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center',
                            backgroundSize: isZoomed ? '200%' : 'contain',
                            backgroundRepeat: 'no-repeat',
                            transition: isZoomed ? 'none' : 'background-size 0.3s ease-out'
                        }}
                    />
                    <img 
                        src={getImageUrl(selectedMedia)} 
                        alt={getLocalizedField(product, 'name', language)} 
                        className={`w-full h-full object-contain p-4 ${isZoomed ? 'opacity-0' : 'opacity-100'}`} 
                    />
                  </>
              )}
            </div>
            
            {mediaList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {mediaList.map((media: string, i: number) => (
                    <button 
                        key={i} 
                        className={`w-20 h-20 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 cursor-pointer hover:opacity-80 border-2 shrink-0 transition-all ${selectedMedia === media ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-100 dark:border-slate-800'}`}
                        onClick={() => setSelectedMedia(media)}
                    >
                        {isVideo(media) ? (
                            <div className="w-full h-full relative flex items-center justify-center bg-black">
                                <span className="text-white text-xl">▶</span>
                                <video src={getImageUrl(media)} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                            </div>
                        ) : (
                            <ResponsiveImage 
                                src={getImageUrl(media)} 
                                alt={`Thumbnail ${i}`} 
                                width={80} 
                                height={80} 
                                className="w-full h-full object-contain p-1" 
                            />
                        )}
                    </button>
                ))}
                </div>
            )}
          </div>

          {/* Right Column: Product Details */}
          <div className="md:col-span-6 lg:col-span-5 space-y-6">
            <div>
              <div className="flex justify-between items-start mb-3">
                  <div className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 dark:bg-sky-900/30 px-2 py-1 rounded-md">{getLocalizedField(product, 'category_name', language)}</div>
                  <div className="flex gap-2">
                      <button onClick={handleShare} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-500 hover:text-sky-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      </button>
                  </div>
              </div>
              
              <Heading as="h1" size="lg" className="font-sans dark:text-white text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-2 text-slate-900">{getLocalizedField(product, 'name', language)}</Heading>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-800">
                      <RatingStars rating={avgRating} size="sm" />
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 ml-1">{avgRating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-700 pl-3">{reviews.length} {t('reviews')}</span>
                  
                  {/* Country Label */}
                  {product.country_id && (
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('product_of')} {getLocalizedField(product, 'country_name', language) || 'Origin'}</span>
                        {product.country_flag && (
                            product.country_flag.startsWith('http') || product.country_flag.startsWith('/') ? (
                                <img src={getImageUrl(product.country_flag)} alt="Flag" className="w-4 h-2.5 object-cover rounded-sm shadow-sm" />
                            ) : (
                                <div className="w-4 h-2.5 overflow-hidden rounded-sm shadow-sm">
                                    <FlagIcon code={product.country_flag} className="w-full h-full" />
                                </div>
                            )
                        )}
                    </div>
                  )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">৳{currentPrice}</div>
                    {product.old_price && <div className="text-base text-slate-400 line-through font-medium">৳{product.old_price}</div>}
                  </div>
                  {product.old_price && (
                      <div className="text-xs font-bold text-red-500">
                          You save ৳{parseFloat(product.old_price) - parseFloat(currentPrice)}
                      </div>
                  )}
              </div>
            </div>

            {/* Variant Selectors */}
            {product.has_variants && (
                <div className="space-y-4">
                    {sizes.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">{t('size')}</label>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size: any) => (
                                    <button
                                        key={size}
                                        onClick={() => handleSizeChange(size)}
                                        className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all min-w-[2.5rem] ${
                                            selectedSize === size 
                                            ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 ring-1 ring-sky-500' 
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {colors.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">{t('color')}</label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((color: any) => {
                                    const isAvailable = isColorAvailableForSize(color);
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => handleColorChange(color)}
                                            className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                                                selectedColor === color 
                                                ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 ring-1 ring-sky-500' 
                                                : isAvailable 
                                                    ? 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                                                    : 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-600 opacity-50'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Weight Selector */}
                    {weights.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">{t('weight')}</label>
                            <div className="flex flex-wrap gap-2">
                                {weights.map((weight: any) => (
                                    <button
                                        key={weight}
                                        onClick={() => setSelectedWeight(weight)}
                                        className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all min-w-[2.5rem] ${
                                            selectedWeight === weight 
                                            ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 ring-1 ring-sky-500' 
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                                        }`}
                                    >
                                        {weight}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quantity & Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-all font-bold"
                        >
                            -
                        </button>
                        <span className="font-bold w-8 text-center text-slate-900 dark:text-white text-base">{quantity}</span>
                        <button 
                            onClick={() => {
                                if (quantity < currentStock) {
                                    setQuantity(quantity + 1);
                                } else {
                                    addToast(`Only ${currentStock} items available`, "error");
                                }
                            }}
                            className={`w-8 h-8 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center transition-all font-bold ${quantity >= currentStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                            disabled={quantity >= currentStock}
                        >
                            +
                        </button>
                    </div>
                    <div className={`text-xs font-medium ${currentStock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {currentStock > 0 ? `${t('in_stock')}: ${currentStock}` : t('out_of_stock')}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {currentStock > 0 ? (
                        <>
                            <Button 
                                className="flex-1 py-3.5 text-sm rounded-lg bg-sky-600 text-white font-bold shadow-sm hover:bg-sky-700 transition-all duration-300"
                                onClick={handleAddToCart}
                            >
                                {t('add_to_cart')}
                            </Button>
                            <Button 
                                className="flex-1 py-3.5 text-sm rounded-lg bg-slate-900 text-white font-bold shadow-sm hover:bg-slate-800 transition-all duration-300 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                onClick={handleOrderNow}
                            >
                                {t('buy_now')}
                            </Button>
                        </>
                    ) : (
                        <Button 
                            className="w-full py-3.5 text-sm rounded-lg bg-amber-500 text-white font-bold shadow-sm hover:bg-amber-600 transition-all duration-300"
                            onClick={() => setShowNotifyModal(true)}
                        >
                            {t('notify_me')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Info Tabs */}
            <div className="mt-8">
                <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                    {['description', 'reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 text-sm font-bold border-b-2 transition-colors ${
                                activeTab === tab 
                                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab === 'description' ? 'Description' : t('reviews')}
                        </button>
                    ))}
                </div>
                
                <div className="min-h-[200px]">
                    {activeTab === 'description' && (
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                            {getLocalizedField(product, 'description', language)}
                            
                            {/* Specifications */}
                            {(currentWeight || product.material || selectedVariant?.sku || product.sku) && (
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-3">Specifications</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {(selectedVariant?.material || product.material) && (
                                            <div>
                                                <span className="text-slate-500 block">Material</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{selectedVariant?.material || product.material}</span>
                                            </div>
                                        )}
                                        {currentWeight && (
                                            <div>
                                                <span className="text-slate-500 block">Weight</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{currentWeight}</span>
                                            </div>
                                        )}
                                        {(selectedVariant?.sku || product.sku) && (
                                            <div>
                                                <span className="text-slate-500 block">SKU</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{selectedVariant?.sku || product.sku}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'reviews' && (
                        <div className="space-y-6">
                            {reviews.length === 0 ? (
                                <p className="text-slate-500 dark:text-slate-400 text-center py-8">{t('no_reviews')}</p>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-slate-900 dark:text-white">{review.user_name}</div>
                                                <RatingStars rating={review.rating} size="sm" />
                                            </div>
                                            <div className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm">{review.comment}</p>
                                        {review.images && (
                                            <div className="flex gap-2 mt-3">
                                                {parseReviewImages(review.images).map((img: string, i: number) => (
                                                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">
                                                        <ResponsiveImage src={getImageUrl(img)} alt="Review" width={100} height={100} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mb-16 border-t border-slate-100 dark:border-slate-800 pt-16">
                <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-8 text-center">{t('you_might_like')}</Heading>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                    {relatedProducts.map((p: any) => {
                        let imageUrl = "https://picsum.photos/seed/default/800/800";
                        try {
                            const parsed = JSON.parse(p.images);
                            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
                        } catch (e) {}
                        
                        return (
                            <div key={p.id} className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700">
                                <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f8f8f8] mb-3 dark:bg-slate-700">
                                    <Link href={`/products/${p.id}`} className="block w-full h-full">
                                        <ResponsiveImage
                                            src={imageUrl}
                                            alt={getLocalizedField(p, 'name', language)}
                                            width={400}
                                            height={400}
                                            className="object-cover w-full h-full sm:group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                    </Link>
                                </div>
                                <div className="space-y-1 text-center">
                                    <h3 className="text-sm font-bold text-slate-900 font-sans group-hover:text-sky-500 transition-colors dark:text-white line-clamp-1">
                                        <Link href={`/products/${p.id}`}>{getLocalizedField(p, 'name', language)}</Link>
                                    </h3>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">৳{p.price}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 sm:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex gap-3">
              {currentStock > 0 ? (
                  <>
                    <Button 
                        className="flex-1 py-3 text-sm rounded-lg bg-sky-600 text-white font-bold shadow-md"
                        onClick={handleAddToCart}
                    >
                        {t('add_to_cart')}
                    </Button>
                    <Button 
                        className="flex-1 py-3 text-sm rounded-lg bg-slate-900 text-white font-bold shadow-md dark:bg-white dark:text-slate-900"
                        onClick={handleOrderNow}
                    >
                        {t('buy_now')}
                    </Button>
                  </>
              ) : (
                  <Button 
                    className="w-full py-3 text-sm rounded-lg bg-amber-500 text-white font-bold shadow-md"
                    onClick={() => setShowNotifyModal(true)}
                  >
                    {t('notify_me')}
                  </Button>
              )}
          </div>
      </div>

      {/* Notify Me Modal */}
      {showNotifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
                  <button onClick={() => setShowNotifyModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                  <Heading size="lg" className="mb-2 text-slate-900 dark:text-white">{t('request_stock')}</Heading>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">{t('notify_when_available')}</p>
                  
                  <form onSubmit={handleNotifyRequest} className="space-y-4">
                      <Input label={t('phone_number')} value={notifyPhone} onChange={e => setNotifyPhone(e.target.value)} required placeholder="017..." disabled={isSubmittingRequest} />
                      <Input label={t('email_optional')} value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} placeholder="you@example.com" disabled={isSubmittingRequest} />
                      <Button fullWidth type="submit" disabled={isSubmittingRequest} className="rounded-xl py-3 mt-2">
                        {isSubmittingRequest ? t('processing') : t('submit_request')}
                      </Button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
