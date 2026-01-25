"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function CreateManualOrderPage() {
  const [order, setOrder] = useState({
    orderSource: "Website",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    items: [] as any[],
    discount: 0,
    deliveryCharge: 0,
    paymentMethod: "cod",
    paymentStatus: "Pending",
    status: "pending"
  });
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetch(`${API_URL}/products?limit=100`)
      .then(res => res.json())
      .then(data => setProducts(data.data || []));
  }, []);

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    let variant = null;
    if (selectedVariant) {
        // Need to fetch full product details to get variants if not in list
        // Or assume products list has variants (it doesn't usually).
        // For simplicity, let's fetch product details when selected.
    }

    // For now, simple add without variant check in UI for speed, 
    // but ideally we should fetch variants.
    // Let's just add basic item.
    
    setOrder({
      ...order,
      items: [...order.items, { productId: selectedProduct, quantity, name: product.name, price: product.price }]
    });
    setSelectedProduct("");
    setQuantity(1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/orders/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      
      if (res.ok) {
        addToast("Manual order created", "success");
        router.push("/admin/orders");
      } else {
        addToast("Failed to create order", "error");
      }
    } catch (e) {
      addToast("Error creating order", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Create Manual Order</Heading>
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Order Source</label>
                <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={order.orderSource}
                    onChange={e => setOrder({...order, orderSource: e.target.value})}
                >
                    <option value="Website">Website</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Phone">Phone</option>
                    <option value="WhatsApp">WhatsApp</option>
                </select>
            </div>
            <Input label="Customer Name" value={order.customerName} onChange={e => setOrder({...order, customerName: e.target.value})} required className="bg-slate-50/50" />
            <Input label="Mobile Number" value={order.customerPhone} onChange={e => setOrder({...order, customerPhone: e.target.value})} required className="bg-slate-50/50" />
            <Input label="Address" value={order.customerAddress} onChange={e => setOrder({...order, customerAddress: e.target.value})} required className="bg-slate-50/50" />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Products</h3>
            <div className="flex gap-4 mb-4">
                <select 
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={selectedProduct}
                    onChange={e => setSelectedProduct(e.target.value)}
                >
                    <option value="">Select Product</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                    ))}
                </select>
                <Input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className="w-24 bg-slate-50/50" min="1" />
                <Button type="button" onClick={handleAddItem} className="rounded-xl">Add</Button>
            </div>
            
            {order.items.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                            <span>{item.name} x {item.quantity}</span>
                            <span className="font-bold">৳{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
            <Input label="Delivery Charge" type="number" value={order.deliveryCharge} onChange={e => setOrder({...order, deliveryCharge: parseFloat(e.target.value)})} className="bg-slate-50/50" />
            <Input label="Discount" type="number" value={order.discount} onChange={e => setOrder({...order, discount: parseFloat(e.target.value)})} className="bg-slate-50/50" />
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Payment Method</label>
                <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={order.paymentMethod}
                    onChange={e => setOrder({...order, paymentMethod: e.target.value})}
                >
                    <option value="cod">Cash on Delivery</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-sky-500/20 px-8">Create Order</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
