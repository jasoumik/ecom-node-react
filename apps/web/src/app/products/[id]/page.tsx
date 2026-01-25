"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<string>("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Variant Selection State
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const imageRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          
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

          // Pre-select first variant options if available
          if (data.variants && data.variants.length > 0) {
              // Sort variants to ensure consistent default selection
              const sortedVariants = [...data.variants].sort((a, b) => b.stock - a.stock); // Prefer in-stock
              const first = sortedVariants[0];
              if (first.size) setSelectedSize(first.size);
              if (first.color) setSelectedColor(first.color);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Smart Variant Selection Logic
  useEffect(() => {
      if (!product || !product.variants) return;
      
      // 1. Try to find exact match
      let variant = product.variants.find((v: any) => {
          const sizeMatch = !v.size || v.size === selectedSize;
          const colorMatch = !v.color || v.color === selectedColor;
          return sizeMatch && colorMatch;
      });

      // 2. If no exact match (invalid combination), try to find a valid variant for the *just changed* attribute
      // This part is tricky because we don't know which one changed in this effect.
      // Instead, let's handle this in the selection handlers (handleSizeChange, handleColorChange).
      
      setSelectedVariant(variant || null);
  }, [selectedSize, selectedColor, product]);

  const handleSizeChange = (newSize: string) => {
      setSelectedSize(newSize);
      
      // Check if current color is valid for new size
      const isValidCombination = product.variants.some((v: any) => 
          v.size === newSize && v.color === selectedColor
      );

      if (!isValidCombination) {
          // Find first valid color for this size
          const validVariant = product.variants.find((v: any) => v.size === newSize);
          if (validVariant && validVariant.color) {
              setSelectedColor(validVariant.color);
          }
      }
  };

  const handleColorChange = (newColor: string) => {
      setSelectedColor(newColor);
      
      // Check if current size is valid for new color
      const isValidCombination = product.variants.some((v: any) => 
          v.color === newColor && v.size === selectedSize
      );

      if (!isValidCombination) {
          // Find first valid size for this color
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
    const finalStock = selectedVariant ? selectedVariant.stock : product.stock;

    if (finalStock <= 0) {
        addToast("Out of stock", "error");
        return;
    }

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
      variantId: selectedVariant?.id,
      name: `${product.name} ${selectedVariant ? `(${[selectedSize, selectedColor].filter(Boolean).join(' ')})` : ''}`,
      price: finalPrice,
      image: imageUrl,
      quantity: 1,
    });
    addToast(`Added to cart`);
  };

  const handleOrderNow = () => {
      handleAddToCart();
      router.push('/cart');
  };

  if (loading) return <FullScreenLoader />;
  if (!product) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 dark:text-white">Product not found</div>;

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

  // Extract unique options
  const sizes = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))) : [];
  const colors = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) : [];

  const currentPrice = selectedVariant ? (selectedVariant.price || product.price) : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  // Helper to check availability
  const isSizeAvailable = (size: string) => {
      // Check if this size exists with ANY color
      return product.variants.some((v: any) => v.size === size && v.stock > 0);
  };
  
  const isColorAvailableForSize = (color: string) => {
      // Check if this color is valid for currently selected size
      if (!selectedSize) return true;
      const variant = product.variants.find((v: any) => v.size === selectedSize && v.color === color);
      return variant && variant.stock > 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
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
                    src={selectedMedia} 
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
                            backgroundImage: `url(${selectedMedia})`,
                            backgroundPosition: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center',
                            backgroundSize: isZoomed ? '200%' : 'cover',
                            backgroundRepeat: 'no-repeat',
                            transition: isZoomed ? 'none' : 'background-size 0.3s ease-out'
                        }}
                    />
                    <img 
                        src={selectedMedia} 
                        alt={product.name} 
                        className={`w-full h-full object-cover absolute inset-0 pointer-events-none ${isZoomed ? 'opacity-0' : 'opacity-100'}`} 
                    />
                    <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {isZoomed ? 'Click to Reset' : 'Hover to Zoom'}
                    </div>
                  </>
              )}
            </div>
            
            {mediaList.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                {mediaList.map((media: string, i: number) => (
                    <div 
                        key={i} 
                        className={`aspect-square rounded-xl overflow-hidden bg-white shadow cursor-pointer hover:opacity-80 dark:bg-slate-800 border transition-all ${selectedMedia === media ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-100 dark:border-slate-700'}`}
                        onClick={() => setSelectedMedia(media)}
                    >
                        {isVideo(media) ? (
                            <div className="w-full h-full relative flex items-center justify-center bg-black">
                                <span className="text-white text-2xl">▶</span>
                                <video src={media} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                            </div>
                        ) : (
                            <ResponsiveImage 
                                src={media} 
                                alt={`${product.name} ${i+1}`} 
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
              <div className="text-sm font-bold text-sky-500 uppercase tracking-wider mb-2">{product.category}</div>
              <Heading as="h1" size="xl" className="font-sans dark:text-white text-4xl sm:text-5xl font-bold">{product.name}</Heading>
              <div className="flex items-baseline gap-4 mt-4">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">৳{currentPrice}</div>
                {product.old_price && <div className="text-xl text-slate-400 line-through">৳{product.old_price}</div>}
              </div>
              <div className={`text-sm font-bold mt-2 ${currentStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {currentStock > 0 ? `In Stock (${currentStock})` : 'Out of Stock'}
              </div>
            </div>

            {/* Variant Selectors */}
            {product.has_variants && (
                <div className="space-y-4">
                    {sizes.length > 0 && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Size</label>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size: any) => (
                                    <button
                                        key={size}
                                        onClick={() => handleSizeChange(size)}
                                        className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                            selectedSize === size 
                                            ? 'border-sky-500 bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' 
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
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
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Color</label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((color: any) => {
                                    const isAvailable = isColorAvailableForSize(color);
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => handleColorChange(color)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                                selectedColor === color 
                                                ? 'border-sky-500 bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' 
                                                : isAvailable 
                                                    ? 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                                                    : 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-600'
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

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
                {product.sku && (
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-bold">SKU</span>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedVariant?.sku || product.sku}</p>
                    </div>
                )}
                {product.material && (
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-bold">Material</span>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedVariant?.material || product.material}</p>
                    </div>
                )}
            </div>

            <Text className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </Text>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1 py-4 text-lg rounded-2xl shadow-xl shadow-sky-500/20 bg-sky-500 text-white hover:bg-sky-600 hover:scale-105 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
              >
                {currentStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button 
                className="flex-1 py-4 text-lg rounded-2xl shadow-xl shadow-emerald-500/20 bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleOrderNow}
                disabled={currentStock <= 0}
              >
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
