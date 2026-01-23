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
        } catch (e) {}
    }
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        userId: user?.id,
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
        addToast("Failed to place order. Please try again.", "error");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Heading className="mb-4 dark:text-white">Your Cart is Empty</Heading>
        <Button onClick={() => router.push("/products")}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-8 font-bold">Shopping Cart</Heading>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-md shadow-sm flex items-center gap-4 border border-slate-100 dark:border-slate-700">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md bg-slate-100" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white font-sans">{item.name}</h3>
                  <p className="text-sky-500 font-bold">৳{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-bold">-</button>
                  <span className="font-bold w-8 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-bold">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-md shadow-lg h-fit border border-slate-100 dark:border-slate-700">
            <Heading size="lg" className="mb-6 dark:text-white font-sans font-bold">Order Summary</Heading>
            <div className="flex justify-between mb-4 text-slate-600 dark:text-slate-300 font-medium">
              <span>Subtotal</span>
              <span>৳{totalPrice()}</span>
            </div>
            <div className="flex justify-between mb-6 text-xl font-bold text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-700 pt-4">
              <span>Total</span>
              <span>৳{totalPrice()}</span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <Input 
                label="Full Name" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                required 
              />
              <Input 
                label="Phone Number (Required)" 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)} 
                placeholder="017..." 
                required 
              />
              <div className="w-full">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Address</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                  value={customerAddress} 
                  onChange={(e) => setCustomerAddress(e.target.value)} 
                  required 
                  rows={3}
                />
              </div>
              
              <Button 
                fullWidth 
                type="submit" 
                disabled={isSubmitting}
                className="py-4 text-lg shadow-xl shadow-sky-500/20 bg-sky-500 hover:bg-sky-600 text-white rounded-md font-bold"
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
