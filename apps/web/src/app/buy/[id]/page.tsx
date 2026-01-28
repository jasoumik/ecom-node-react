"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage, RatingStars } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import { useSettings } from "@/lib/settings-context";

export default function BuyNowPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState<any[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [saveAddress, setSaveAddress] = useState(false);
  
  // Variant State
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  
  // Image State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addToast } = useToast();
  const router = useRouter();
  const { t, language } = useLanguage();
  const settings = useSettings();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            setCustomerName(parsedUser.name || "");
            setCustomerPhone(parsedUser.phone || "");
            fetchAddresses(parsedUser.id);
        } catch (e) {}
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          
          if (data.variants && data.variants.length > 0) {
              const sortedVariants = [...data.variants].sort((a, b) => b.stock - a.stock);
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
    fetchDeliveryCharges();
  }, [id]);

  const fetchAddresses = async (userId: string) => {
      try {
          const res = await fetch(`${API_URL}/users/${userId}/addresses`);
          if (res.ok) {
              const data = await res.json();
              setSavedAddresses(Array.isArray(data) ? data : []);
          }
      } catch (e) {}
  };

  const fetchDeliveryCharges = async () => {
      try {
          const res = await fetch(`${API_URL}/delivery`);
          const data = await res.json();
          setDeliveryCharges(data);
          if (data.length > 0) setSelectedDeliveryId(data[0].id);
      } catch (e) {}
  };

  useEffect(() => {
      if (!product || !product.variants) return;
      const variant = product.variants.find((v: any) => {
          const sizeMatch = !v.size || v.size === selectedSize;
          const colorMatch = !v.color || v.color === selectedColor;
          return sizeMatch && colorMatch;
      });
      setSelectedVariant(variant);
  }, [selectedSize, selectedColor, product]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    if (product.has_variants && product.variants.length > 0 && !selectedVariant) {
        addToast("Please select valid options (Size/Color)", "error");
        return;
    }

    setIsSubmitting(true);
    try {
      // Save address if requested
      if (user && saveAddress && customerAddress) {
          await fetch(`${API_URL}/users/${user.id}/addresses`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address: customerAddress, type: 'Home', is_default: false }),
          });
      }

      const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        deliveryChargeId: selectedDeliveryId,
        paymentMethod,
        items: [{
            productId: product.id,
            variantId: selectedVariant?.id,
            quantity: quantity
        }],
        orderSource: 'Landing Page'
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        addToast("Order placed successfully!", "success");
        router.push(`/thank-you?orderId=${data.id}`);
      } else {
        const errorData = await res.json();
        addToast(errorData.message || "Failed to place order.", "error");
      }
    } catch (error) {
      addToast("Error placing order.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSelect = (address: any) => {
      setCustomerAddress(address.address);
  };

  if (loading) return <FullScreenLoader />;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const currentPrice = selectedVariant ? (selectedVariant.price || product.price) : product.price;
  const selectedDelivery = deliveryCharges.find(d => d.id === selectedDeliveryId);
  const deliveryAmount = selectedDelivery ? parseFloat(selectedDelivery.amount) : 0;
  
  // Free Shipping Logic (Frontend Display Only - Backend handles actual logic)
  const subtotal = parseFloat(currentPrice) * quantity;
  const freeShippingThreshold = parseFloat(settings.free_shipping_threshold || "5000");
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const finalDeliveryAmount = isFreeShipping ? 0 : deliveryAmount;
  const totalAmount = subtotal + finalDeliveryAmount;

  const sizes = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))) : [];
  const colors = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) : [];

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

  const currentImage = mediaList[selectedImageIndex] || mediaList[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Simple Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-4 text-center sticky top-0 z-50">
          <h1 className="text-2xl font-bold text-sky-500">{settings.shop_name}</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
        {/* Product Hero */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
            <div className="aspect-video w-full relative bg-slate-100 dark:bg-slate-700">
                <ResponsiveImage 
                    src={getImageUrl(currentImage)} 
                    alt={getLocalizedField(product, 'name', language)} 
                    width={800} 
                    height={450} 
                    className="object-cover w-full h-full"
                    priority
                />
            </div>
            
            {/* Image Thumbnails */}
            {mediaList.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                    {mediaList.map((img, i) => (
                        <button 
                            key={i} 
                            onClick={() => setSelectedImageIndex(i)}
                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${selectedImageIndex === i ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-700'}`}
                        >
                            <ResponsiveImage 
                                src={getImageUrl(img)} 
                                alt={`Thumbnail ${i}`} 
                                width={64} 
                                height={64} 
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            <div className="p-6 sm:p-8">
                <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-3 leading-tight text-xl sm:text-2xl md:text-3xl">
                    {getLocalizedField(product, 'name', language)}
                </Heading>
                
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="text-3xl font-black text-sky-600 dark:text-sky-400">৳{currentPrice}</div>
                    {product.old_price && <div className="text-xl text-slate-400 line-through">৳{product.old_price}</div>}
                    {product.old_price && (
                        <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                            SAVE ৳{parseFloat(product.old_price) - parseFloat(currentPrice)}
                        </div>
                    )}
                </div>

                {/* Variants */}
                {product.has_variants && (
                    <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                        {sizes.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('size')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((size: any) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                                selectedSize === size 
                                                ? 'border-sky-500 bg-sky-500 text-white shadow-md' 
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
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
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('color')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color: any) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                                selectedColor === color 
                                                ? 'border-sky-500 bg-sky-500 text-white shadow-md' 
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-6">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{t('quantity')}:</span>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg shadow-sm font-bold text-lg">-</button>
                        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg shadow-sm font-bold text-lg">+</button>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                    {getLocalizedField(product, 'description', language)}
                </div>
            </div>
        </div>

        {/* Order Form */}
        <div id="order-form" className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-lg border-2 border-sky-100 dark:border-slate-700">
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-6 text-center">{t('fill_form_to_confirm')}</Heading>
            
            <form onSubmit={handlePlaceOrder} className="space-y-5">
                {/* Saved Addresses - Animated */}
                {savedAddresses.length > 0 && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Saved Addresses</label>
                            <span className="text-[10px] text-sky-500 font-medium bg-sky-50 px-2 py-0.5 rounded-full">Tap to select</span>
                        </div>
                        <div className="space-y-2">
                            {savedAddresses.map(addr => (
                                <button
                                    key={addr.id}
                                    type="button"
                                    onClick={() => handleAddressSelect(addr)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                                        customerAddress === addr.address 
                                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-1 ring-sky-500' 
                                        : 'border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                            <span className="text-lg">{addr.type === 'Home' ? '🏠' : addr.type === 'Office' ? '🏢' : '📍'}</span>
                                            {addr.type}
                                        </div>
                                        {customerAddress === addr.address && (
                                            <span className="text-sky-500 text-xs font-bold animate-in zoom-in">Selected</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate mt-1 pl-7">{addr.address}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <Input 
                    label={t('full_name')} 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    required 
                    placeholder={t('enter_your_name')}
                    className="bg-slate-50/50"
                />
                <Input 
                    label={t('phone_number')} 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)} 
                    required 
                    placeholder={t('enter_mobile_number')}
                    className="bg-slate-50/50"
                />
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('address')}</label>
                    <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 resize-none"
                        value={customerAddress} 
                        onChange={(e) => setCustomerAddress(e.target.value)} 
                        required 
                        rows={3}
                        placeholder={t('enter_full_address')}
                    />
                </div>
                
                {user && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                checked={saveAddress} 
                                onChange={e => setSaveAddress(e.target.checked)}
                                className="peer w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500 transition-all cursor-pointer"
                            />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-sky-600 transition-colors">Save this address for future</span>
                    </label>
                )}

                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('delivery_area')}</label>
                    <div className="grid grid-cols-1 gap-2">
                        {deliveryCharges.map(charge => (
                            <label key={charge.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedDeliveryId === charge.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="delivery" 
                                        value={charge.id}
                                        checked={selectedDeliveryId === charge.id}
                                        onChange={() => setSelectedDeliveryId(charge.id)}
                                        className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{getLocalizedField(charge, 'name', language)}</span>
                                </div>
                                <div className="text-right">
                                    {isFreeShipping ? (
                                        <>
                                            <span className="text-xs text-slate-400 line-through mr-2">৳{charge.amount}</span>
                                            <span className="text-sm font-bold text-emerald-600">FREE</span>
                                        </>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">৳{charge.amount}</span>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between text-sm">
                        <span>{t('product_price')}</span>
                        <span>৳{parseFloat(currentPrice) * quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>{t('delivery_charge')}</span>
                        <span className={isFreeShipping ? 'text-green-600 font-bold' : ''}>
                            {isFreeShipping ? 'FREE' : `৳${deliveryAmount}`}
                        </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                        <span>{t('total')}</span>
                        <span>৳{totalAmount}</span>
                    </div>
                </div>

                <Button 
                    fullWidth 
                    type="submit" 
                    disabled={isSubmitting}
                    className="py-4 text-lg shadow-xl shadow-sky-500/20 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold animate-pulse"
                >
                    {isSubmitting ? t('processing') : t('confirm_order')}
                </Button>
            </form>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:hidden">
          <Button 
            fullWidth 
            className="py-3 text-lg rounded-xl bg-sky-500 text-white font-bold shadow-lg"
            onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('click_to_order')}
          </Button>
      </div>
    </div>
  );
}
