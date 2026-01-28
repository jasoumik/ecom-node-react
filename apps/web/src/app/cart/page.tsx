"use client";

import { useCart } from "@/lib/cart";
import { Button, Heading, Text } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/language-context";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart, addItem } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState<any[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNumbers, setPaymentNumbers] = useState<any>({});
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const { addToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setCustomerName(parsedUser.name || "");
            setCustomerPhone(parsedUser.phone || "");
            fetchAddresses(parsedUser.id);
        } catch (e) {}
    }
    fetchDeliveryCharges();
    fetchSettings();
    validateStock();
  }, []);

  const validateStock = async () => {
      if (items.length === 0) return;
      
      try {
          const updatedItems = await Promise.all(items.map(async (item) => {
              const res = await fetch(`${API_URL}/products/${item.id}`);
              if (res.ok) {
                  const product = await res.json();
                  let stock = product.stock;
                  
                  if (item.variantId) {
                      const variant = product.variants?.find((v: any) => v.id === item.variantId);
                      if (variant) stock = variant.stock;
                  }
                  
                  return { ...item, stock: parseInt(stock) };
              }
              return item;
          }));

          updatedItems.forEach(newItem => {
              const oldItem = items.find(i => i.id === newItem.id && i.variantId === newItem.variantId);
              if (oldItem && oldItem.stock !== newItem.stock) {
                  addItem(newItem); 
                  if (newItem.quantity > newItem.stock) {
                      updateQuantity(newItem.id, newItem.stock, newItem.variantId);
                      addToast(`Quantity for ${newItem.name} adjusted to available stock`, "error");
                  }
              }
          });
          
      } catch (e) {
          console.error("Failed to validate stock");
      }
  };

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
      } catch (e) {
          console.error("Failed to fetch delivery charges");
      }
  };

  const fetchSettings = async () => {
      try {
          const res = await fetch(`${API_URL}/settings`);
          const data = await res.json();
          const numbers: any = {};
          data.forEach((s: any) => {
              if (s.key === 'bkash_number') numbers.bkash = s.value;
              if (s.key === 'nagad_number') numbers.nagad = s.value;
              if (s.key === 'free_shipping_threshold') setFreeShippingThreshold(parseFloat(s.value));
          });
          setPaymentNumbers(numbers);
      } catch (e) {}
  };

  const handleApplyCoupon = async () => {
      if (!couponCode) return;
      try {
          const res = await fetch(`${API_URL}/coupons/validate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: couponCode, amount: totalPrice() }),
          });
          if (res.ok) {
              const coupon = await res.json();
              setAppliedCoupon(coupon);
              addToast("Coupon applied!", "success");
          } else {
              const err = await res.json();
              addToast(err.message || "Invalid coupon", "error");
              setAppliedCoupon(null);
          }
      } catch (e) {
          addToast("Error validating coupon", "error");
      }
  };

  const calculateTotal = () => {
      let total = totalPrice();
      
      const isFreeShipping = total >= freeShippingThreshold;
      
      const delivery = deliveryCharges.find(d => d.id === selectedDeliveryId);
      if (delivery && !isFreeShipping) total += parseFloat(delivery.amount);
      
      if (appliedCoupon) {
          let discount = 0;
          if (appliedCoupon.type === 'percentage') {
              discount = (totalPrice() * parseFloat(appliedCoupon.value)) / 100;
          } else {
              discount = parseFloat(appliedCoupon.value);
          }
          total -= discount;
      }
      return Math.max(0, total);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!selectedDeliveryId) {
        addToast("Please select a delivery area", "error");
        return;
    }
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId) {
        addToast("Please enter transaction ID", "error");
        return;
    }

    setIsSubmitting(true);
    try {
      // Save address if requested AND not already saved
      const isAddressSaved = savedAddresses.some(addr => addr.address.toLowerCase() === customerAddress.toLowerCase());
      if (user && saveAddress && customerAddress && !isAddressSaved) {
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
        userId: user?.id,
        deliveryChargeId: selectedDeliveryId,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        paymentMethod,
        transactionId: (paymentMethod === 'bkash' || paymentMethod === 'nagad') ? transactionId : undefined,
        items: items.map(item => ({
            productId: item.id,
            variantId: item.variantId,
            quantity: item.quantity
        }))
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        addToast("Order placed successfully!", "success");
        clearCart();
        router.push(`/thank-you?orderId=${data.id}`);
      } else {
        const errorData = await res.json();
        console.error("Order error:", errorData);
        addToast(errorData.message || "Failed to place order.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Error placing order. Check your connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSelect = (address: any) => {
      setCustomerAddress(address.address);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-slate-950 px-4">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner">
            🛒
        </div>
        <Heading className="mb-2 dark:text-white text-2xl font-bold">{t('your_cart_empty')}</Heading>
        <Text className="text-slate-500 mb-8 text-center max-w-md">Looks like you haven't added anything to your cart yet.</Text>
        <Button onClick={() => router.push("/products")} className="rounded-xl px-8 py-3 shadow-lg shadow-sky-500/20">{t('start_shopping')}</Button>
      </div>
    );
  }

  const selectedDelivery = deliveryCharges.find(d => d.id === selectedDeliveryId);
  const currentTotal = totalPrice();
  const isFreeShipping = currentTotal >= freeShippingThreshold;
  const deliveryAmount = isFreeShipping ? 0 : (selectedDelivery ? parseFloat(selectedDelivery.amount) : 0);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const progressPercent = Math.min(100, (currentTotal / freeShippingThreshold) * 100);
  
  let discountAmount = 0;
  if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
          discountAmount = (totalPrice() * parseFloat(appliedCoupon.value)) / 100;
      } else {
          discountAmount = parseFloat(appliedCoupon.value);
      }
  }

  const isAddressAlreadySaved = savedAddresses.some(addr => addr.address.toLowerCase() === customerAddress.toLowerCase());

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-slate-950 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-8 font-bold">{t('shopping_cart')} <span className="text-slate-400 font-medium text-lg ml-2">({items.length} {t('items')})</span></Heading>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {/* Free Shipping Progress */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {isFreeShipping ? t('free_shipping_unlocked') : t('add_more_free_shipping', { amount: amountToFreeShipping.toString() })}
                    </span>
                    <span className="text-xs font-bold text-sky-500">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>

            <div className="space-y-4">
                {items.map((item) => {
                    // Safe quantity check
                    const qty = Number(item.quantity) || 1;
                    const stock = item.stock !== undefined ? Number(item.stock) : 999; // Default to 999 if stock unknown

                    return (
                    <div key={`${item.id}-${item.variantId}`} className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6 group hover:border-sky-100 transition-colors">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 dark:border-slate-800 shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 w-full text-center sm:text-left">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{item.name}</h3>
                        <p className="text-sky-500 font-bold text-xl">৳{item.price}</p>
                        </div>

                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700">
                                <button 
                                    onClick={() => updateQuantity(item.id, Math.max(1, qty - 1), item.variantId)} 
                                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm transition-all font-bold"
                                >
                                    -
                                </button>
                                <span className="font-bold w-6 text-center text-slate-900 dark:text-white">{qty}</span>
                                <button 
                                    onClick={() => {
                                        if (qty < stock) {
                                            updateQuantity(item.id, qty + 1, item.variantId);
                                        } else {
                                            addToast(`Only ${stock} items available`, "error");
                                        }
                                    }} 
                                    className={`w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center shadow-sm transition-all font-bold ${qty >= stock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                    disabled={qty >= stock}
                                >
                                    +
                                </button>
                            </div>
                            <button 
                                onClick={() => removeItem(item.id, item.variantId)} 
                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                                title="Remove Item"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 sticky top-24">
                <Heading size="lg" className="mb-6 dark:text-white font-sans font-bold text-xl">{t('order_summary')}</Heading>
                
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{t('subtotal')}</span>
                        <span className="font-medium">৳{totalPrice()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{t('delivery')}</span>
                        <span className={`font-medium ${isFreeShipping ? 'text-emerald-600 line-through' : ''}`}>
                            ৳{selectedDelivery ? parseFloat(selectedDelivery.amount) : 0}
                        </span>
                        {isFreeShipping && <span className="text-emerald-600 font-bold">FREE</span>}
                    </div>
                    {appliedCoupon && (
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>{t('discount')} ({appliedCoupon.code})</span>
                            <span>-৳{discountAmount}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2">
                        <span>{t('total')}</span>
                        <span>৳{calculateTotal()}</span>
                    </div>
                </div>

                {/* Coupon Input */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t('coupon_code')}</label>
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            placeholder="Enter code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <Button variant="secondary" onClick={handleApplyCoupon} className="rounded-xl">{t('apply')}</Button>
                    </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-5">
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{t('delivery_area')}</h4>
                        <div className="space-y-2">
                            {deliveryCharges.map(charge => (
                                <label key={charge.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedDeliveryId === charge.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="radio" 
                                            name="delivery" 
                                            value={charge.id}
                                            checked={selectedDeliveryId === charge.id}
                                            onChange={() => setSelectedDeliveryId(charge.id)}
                                            className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{charge.name}</span>
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

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mt-6">{t('payment_method')}</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <label className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                                <span className="text-2xl mb-1">💵</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('cod')}</span>
                            </label>
                            <label className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                <input type="radio" name="payment" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="hidden" />
                                <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="Bkash" className="h-8 w-auto mb-1 object-contain" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Bkash</span>
                            </label>
                            <label className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                <input type="radio" name="payment" value="nagad" checked={paymentMethod === 'nagad'} onChange={() => setPaymentMethod('nagad')} className="hidden" />
                                <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 w-auto mb-1 object-contain" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Nagad</span>
                            </label>
                        </div>

                        {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in">
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                    Please send money to <span className="font-bold text-slate-900 dark:text-white">{paymentMethod === 'bkash' ? paymentNumbers.bkash : paymentNumbers.nagad}</span>
                                </p>
                                <Input 
                                    label="Transaction ID" 
                                    value={transactionId} 
                                    onChange={(e) => setTransactionId(e.target.value)} 
                                    placeholder="e.g. 8X92..." 
                                    required 
                                    className="bg-white"
                                />
                            </div>
                        )}

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mt-6">{t('shipping_details')}</h4>
                        
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
                            onChange={(e) => setCustomerName(e.target.value)} 
                            required 
                            className="bg-slate-50/50"
                        />
                        <Input 
                            label={t('phone_number')} 
                            value={customerPhone} 
                            onChange={(e) => setCustomerPhone(e.target.value)} 
                            placeholder="017..." 
                            required 
                            className="bg-slate-50/50"
                        />
                        <div className="w-full">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('address')}</label>
                            <textarea 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 resize-none"
                            value={customerAddress} 
                            onChange={(e) => setCustomerAddress(e.target.value)} 
                            required 
                            rows={3}
                            placeholder="Street address, City, Zip"
                            />
                        </div>
                        
                        {user && !isAddressAlreadySaved && (
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
                    </div>
                    
                    <Button 
                        fullWidth 
                        type="submit" 
                        disabled={isSubmitting}
                        className="py-4 text-lg shadow-xl shadow-sky-500/20 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold mt-4"
                    >
                        {isSubmitting ? t('loading') : t('place_order')}
                    </Button>
                    
                    <p className="text-xs text-center text-slate-400 mt-4">
                        {t('secure_checkout')}
                    </p>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
