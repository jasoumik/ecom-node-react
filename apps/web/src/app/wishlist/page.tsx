"use client";

import { useWishlist } from "@/lib/wishlist";
import { Button, Heading, Text, ResponsiveImage } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const router = useRouter();

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    addToast(`Added ${item.name} to cart`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-slate-950 px-4">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner text-rose-500">
            ♥
        </div>
        <Heading className="mb-2 dark:text-white text-2xl font-bold">Your Wishlist is Empty</Heading>
        <Text className="text-slate-500 mb-8 text-center max-w-md">Save items you love to buy later.</Text>
        <Button onClick={() => router.push("/products")} className="rounded-xl px-8 py-3 shadow-lg shadow-sky-500/20">Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-slate-950 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-8 font-bold">My Wishlist <span className="text-slate-400 font-medium text-lg ml-2">({items.length} items)</span></Heading>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-sky-100 transition-all relative">
              <button 
                onClick={() => removeItem(item.id)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shadow-sm"
                title="Remove from Wishlist"
              >
                ✕
              </button>
              
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 dark:border-slate-800 mb-4 relative">
                  <a href={`/products/${item.id}`} className="block w-full h-full">
                    <ResponsiveImage src={item.image} alt={item.name} width={400} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </a>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">
                    <a href={`/products/${item.id}`}>{item.name}</a>
                </h3>
                <div className="flex items-center justify-between">
                    <p className="text-sky-500 font-bold text-lg">৳{item.price}</p>
                    <Button 
                        size="sm" 
                        className="rounded-xl px-4"
                        onClick={() => handleAddToCart(item)}
                    >
                        Add to Cart
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
