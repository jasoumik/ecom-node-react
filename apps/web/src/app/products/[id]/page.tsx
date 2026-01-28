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
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Variant Selection State
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1); // Quantity State

  // Notify Me State
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

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
          return sizeMatch && colorMatch;
      });
      
      setSelectedVariant(variant);
      // Only reset quantity if the variant actually changes to a different ID
      // But here we just reset to 1 to be safe, which is fine unless it triggers on every render.
      // It triggers when selectedSize/Color changes.
      setQuantity(1);
  }, [selectedSize, selectedColor, product]);

  const handleSizeChange = (newSize: string) => {
      setSelectedSize(newSize);
      const isValidCombination = product.variants.some((v: any) => 
          v.size === newSize && v.color === selectedColor
      );
      if (!isValidCombination) {
          const validVariant = product.variants.find((v: any) => v.size === newSize);
          if (validVariant && validVariant.color) {
              setSelectedColor(validVariant.color);
          }
      }
  };

  const handleColorChange = (newColor: string) => {
      setSelectedColor(newColor);
      const isValidCombination = product.variants.some((v: any) => 
          v.color === newColor && v.size === selectedSize
      );
      if (!isValidCombination) {
          const validVariant = product.variants.find((v: any) => v.color === newColor);
          if (validVariant && validVariant.size) {
              setSelectedSize(validVariant.size);
          }
      }
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
      name: `${getLocalizedField(product, 'name', language)} ${selectedVariant ? `(${[selectedSize, selectedColor].filter(Boolean).join(' ')})` : ''}`,
      price: finalPrice,
      image: imageUrl,
      quantity: quantity,
      stock: finalStock // Pass stock
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

  const currentPrice = selectedVariant ? (selectedVariant.price || product.price) : product.price;
  const currentStock = selectedVariant ? parseInt(selectedVariant.stock) : parseInt(product.stock);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 transition-colors duration-300">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Media Gallery */}
          <div className="space-y-4">
            <div 
                className="aspect-square rounded-3xl overflow-hidden bg-white shadow-lg dark:bg-slate-800 border border-slate-100 dark:border-slate-700 relative group cursor-zoom-in"
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
                    className="w-full h-full object-cover"
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
                            backgroundSize: isZoomed ? '200%' : 'cover',
                            backgroundRepeat: 'no-repeat',
                            transition: isZoomed ? 'none' : 'background-size 0.3s ease-out'
                        }}
                    />
                    <img 
                        src={getImageUrl(selectedMedia)} 
                        alt={getLocalizedField(product, 'name', language)} 
                        className={`w-full h-full object-cover absolute inset-0 pointer-events-none ${isZoomed ? 'opacity-0' : 'opacity-100'}`} 
                    />
                    <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {isZoomed ? 'Click to Reset' : 'Hover to Zoom'}
                    </div>
                  </>
              )}
            </div>
            
            {mediaList.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                {mediaList.map((media: string, i: number) => (
                    <div 
                        key={i} 
                        className={`aspect-square rounded-xl overflow-hidden bg-white shadow-sm cursor-pointer hover:opacity-80 dark:bg-slate-800 border transition-all ${selectedMedia === media ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-100 dark:border-slate-700'}`}
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
                                alt={`${getLocalizedField(product, 'name', language)} ${i+1}`} 
                                width={200} 
                                height={200} 
                                className="w-full h-full object-cover" 
                            />
                        )}
                    </div>
                ))}
                </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-start">
                  <div className="text-sm font-bold text-sky-500 uppercase tracking-wider mb-2">{getLocalizedField(product, 'category_name', language)}</div>
                  <div className="flex gap-2">
                      <button onClick={handleShare} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-500 hover:text-sky-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      </button>
                      {product.country_id && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('product_of')} {getLocalizedField(product, 'country_name', language) || 'Origin'}</span>
                            {product.country_flag && (
                                product.country_flag.startsWith('http') || product.country_flag.startsWith('/') ? (
                                    <img src={getImageUrl(product.country_flag)} alt="Flag" className="w-5 h-3 object-cover rounded-sm" />
                                ) : (
                                    <div className="w-5 h-3 overflow-hidden rounded-sm">
                                        <FlagIcon code={product.country_flag} className="w-full h-full" />
                                    </div>
                                )
                            )}
                        </div>
                      )}
                  </div>
              </div>
              <Heading as="h1" size="xl" className="font-sans dark:text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">{getLocalizedField(product, 'name', language)}</Heading>
              
              <div className="flex items-center gap-2 mt-3">
                  <RatingStars rating={avgRating} />
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">({reviews.length} {t('reviews')})</span>
              </div>

              <div className="flex items-baseline gap-4 mt-6">
                <div className="text-4xl font-bold text-slate-900 dark:text-white">৳{currentPrice}</div>
                {product.old_price && <div className="text-xl text-slate-400 line-through">৳{product.old_price}</div>}
              </div>
              <div className={`text-sm font-bold mt-2 ${currentStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {currentStock > 0 ? `${t('in_stock')} (${currentStock})` : t('out_of_stock')}
              </div>
            </div>

            {/* Variant Selectors */}
            {product.has_variants && (
                <div className="space-y-6 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    {sizes.length > 0 && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t('size')}</label>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size: any) => (
                                    <button
                                        key={size}
                                        onClick={() => handleSizeChange(size)}
                                        className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                            selectedSize === size 
                                            ? 'border-sky-500 bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 shadow-sm ring-2 ring-sky-100 dark:ring-sky-900/30' 
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:text-slate-400'
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
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t('color')}</label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((color: any) => {
                                    const isAvailable = isColorAvailableForSize(color);
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => handleColorChange(color)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                                selectedColor === color 
                                                ? 'border-sky-500 bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 shadow-sm ring-2 ring-sky-100 dark:ring-sky-900/30' 
                                                : isAvailable 
                                                    ? 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:text-slate-400'
                                                    : 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-600 opacity-50'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quantity Selector */}
            {currentStock > 0 && (
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('quantity')}:</span>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm transition-all font-bold"
                        >
                            -
                        </button>
                        <span className="font-bold w-8 text-center text-slate-900 dark:text-white">{quantity}</span>
                        <button 
                            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm transition-all font-bold"
                        >
                            +
                        </button>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {currentStock} available
                    </span>
                </div>
            )}

            {/* Delivery Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-2xl">🚚</div>
                    <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{t('standard_delivery')}</div>
                        <div className="text-[10px] text-slate-500">2-3 {t('days')}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-2xl">🛡️</div>
                    <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{t('authentic_100')}</div>
                        <div className="text-[10px] text-slate-500">{t('original_products')}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
                {product.sku && (
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-bold">{t('sku')}</span>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedVariant?.sku || product.sku}</p>
                    </div>
                )}
                {product.material && (
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-bold">{t('material')}</span>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedVariant?.material || product.material}</p>
                    </div>
                )}
            </div>

            <Text className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {getLocalizedField(product, 'description', language)}
            </Text>

            {/* Desktop Actions */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-4 pt-4">
              {currentStock > 0 ? (
                  <>
                    <Button 
                        className="flex-1 py-4 text-lg rounded-2xl shadow-xl shadow-sky-500/20 bg-sky-500 text-white hover:bg-sky-600 hover:scale-105 transition-all duration-300 font-bold"
                        onClick={handleAddToCart}
                    >
                        {t('add_to_cart')}
                    </Button>
                    <Button 
                        className="flex-1 py-4 text-lg rounded-2xl shadow-xl shadow-emerald-500/20 bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 transition-all duration-300 font-bold"
                        onClick={handleOrderNow}
                    >
                        {t('buy_now')}
                    </Button>
                  </>
              ) : (
                  <Button 
                    className="w-full py-4 text-lg rounded-2xl shadow-xl shadow-amber-500/20 bg-amber-500 text-white hover:bg-amber-600 hover:scale-105 transition-all duration-300 font-bold"
                    onClick={() => setShowNotifyModal(true)}
                  >
                    {t('notify_me')}
                  </Button>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mb-16">
                <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-8">{t('you_might_like')}</Heading>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                    {relatedProducts.map((p: any) => {
                        let imageUrl = "https://picsum.photos/seed/default/800/800";
                        try {
                            const parsed = JSON.parse(p.images);
                            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
                        } catch (e) {}
                        
                        return (
                            <div key={p.id} className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f8f8f8] mb-3 dark:bg-slate-700">
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

        {/* Reviews Section */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-12">
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-8">{t('customer_reviews')}</Heading>
            
            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                    <p className="text-slate-500 dark:text-slate-400">{t('no_reviews')}</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                        {review.user_avatar ? (
                                            <img src={getImageUrl(review.user_avatar)} alt={review.user_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                                {review.user_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{review.user_name}</div>
                                        <div className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <RatingStars rating={review.rating} />
                            </div>
                            
                            {review.comment && (
                                <p className="text-slate-600 dark:text-slate-300 mb-4">{review.comment}</p>
                            )}
                            
                            {review.images && (
                                <div className="flex gap-2">
                                    {parseReviewImages(review.images).map((img: string, i: number) => (
                                        <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">
                                            <ResponsiveImage src={getImageUrl(img)} alt="Review" width={100} height={100} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 sm:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex gap-3">
              {currentStock > 0 ? (
                  <>
                    <Button 
                        className="flex-1 py-3 text-base rounded-xl bg-sky-500 text-white font-bold shadow-lg shadow-sky-500/20"
                        onClick={handleAddToCart}
                    >
                        {t('add_to_cart')}
                    </Button>
                    <Button 
                        className="flex-1 py-3 text-base rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20"
                        onClick={handleOrderNow}
                    >
                        {t('buy_now')}
                    </Button>
                  </>
              ) : (
                  <Button 
                    className="w-full py-3 text-base rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20"
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
