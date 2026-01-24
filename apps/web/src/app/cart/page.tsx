"use client";

import { useCart } from "@/lib/cart";
import { Button, Heading, Text } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState<any[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setCustomerName(parsedUser.name || "");
            setCustomerPhone(parsedUser.phone || "");
        } catch (e) {}
    }
    fetchDeliveryCharges();
  }, []);

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
      const delivery = deliveryCharges.find(d => d.id === selectedDeliveryId);
      if (delivery) total += parseFloat(delivery.amount);
      
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

    setIsSubmitting(true);
    try {
      const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        userId: user?.id,
        deliveryChargeId: selectedDeliveryId,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }))
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        addToast("Order placed successfully!", "success");
        clearCart();
        router.push("/");
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

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-slate-950 px-4">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner">
            🛒
        </div>
        <Heading className="mb-2 dark:text-white text-2xl font-bold">Your Cart is Empty</Heading>
        <Text className="text-slate-500 mb-8 text-center max-w-md">Looks like you haven't added anything to your cart yet.</Text>
        <Button onClick={() => router.push("/products")} className="rounded-xl px-8 py-3 shadow-lg shadow-sky-500/20">Start Shopping</Button>
      </div>
    );
  }

  const selectedDelivery = deliveryCharges.find(d => d.id === selectedDeliveryId);
  const deliveryAmount = selectedDelivery ? parseFloat(selectedDelivery.amount) : 0;
  
  let discountAmount = 0;
  if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
          discountAmount = (totalPrice() * parseFloat(appliedCoupon.value)) / 100;
      } else {
          discountAmount = parseFloat(appliedCoupon.value);
      }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-slate-950 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-8 font-bold">Shopping Cart <span className="text-slate-400 font-medium text-lg ml-2">({items.length} items)</span></Heading>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6 group hover:border-sky-100 transition-colors">
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
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm transition-all font-bold"
                        >
                            -
                        </button>
                        <span className="font-bold w-6 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                        <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm transition-all font-bold"
                        >
                            +
                        </button>
                    </div>
                    <button 
                        onClick={() => removeItem(item.id)} 
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="Remove Item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 sticky top-24">
                <Heading size="lg" className="mb-6 dark:text-white font-sans font-bold text-xl">Order Summary</Heading>
                
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span className="font-medium">৳{totalPrice()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Delivery</span>
                        <span className="font-medium">৳{deliveryAmount}</span>
                    </div>
                    {appliedCoupon && (
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>Discount ({appliedCoupon.code})</span>
                            <span>-৳{discountAmount}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2">
                        <span>Total</span>
                        <span>৳{calculateTotal()}</span>
                    </div>
                </div>

                {/* Coupon Input */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Coupon Code</label>
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            placeholder="Enter code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <Button variant="secondary" onClick={handleApplyCoupon} className="rounded-xl">Apply</Button>
                    </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-5">
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Delivery Area</h4>
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
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">৳{charge.amount}</span>
                                </label>
                            ))}
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mt-6">Shipping Details</h4>
                        <Input 
                            label="Full Name" 
                            value={customerName} 
                            onChange={(e) => setCustomerName(e.target.value)} 
                            required 
                            className="bg-slate-50/50"
                        />
                        <Input 
                            label="Phone Number" 
                            value={customerPhone} 
                            onChange={(e) => setCustomerPhone(e.target.value)} 
                            placeholder="017..." 
                            required 
                            className="bg-slate-50/50"
                        />
                        <div className="w-full">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Address</label>
                            <textarea 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 resize-none"
                            value={customerAddress} 
                            onChange={(e) => setCustomerAddress(e.target.value)} 
                            required 
                            rows={3}
                            placeholder="Street address, City, Zip"
                            />
                        </div>
                    </div>
                    
                    <Button 
                        fullWidth 
                        type="submit" 
                        disabled={isSubmitting}
                        className="py-4 text-lg shadow-xl shadow-sky-500/20 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold mt-4"
                    >
                        {isSubmitting ? "Processing..." : "Place Order"}
                    </Button>
                    
                    <p className="text-xs text-center text-slate-400 mt-4">
                        Secure checkout powered by Prithibee
                    </p>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
