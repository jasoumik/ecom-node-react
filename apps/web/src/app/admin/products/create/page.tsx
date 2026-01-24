"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function CreateProductPage() {
  const [newProduct, setNewProduct] = useState({ name: "", price: "", old_price: "", cost_price: "", description: "", images: "", category_id: "", stock: "", sku: "" });
  const [categories, setCategories] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
          const flatten = (cats: any[], level = 0): any[] => {
              return cats.reduce((acc, cat) => {
                  acc.push({ ...cat, level });
                  if (cat.children) acc.push(...flatten(cat.children, level + 1));
                  return acc;
              }, []);
          };
          setCategories(flatten(Array.isArray(data) ? data : []));
      })
      .catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = newProduct.images.split(",").map(s => s.trim());
    
    try {
        const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newProduct, images: imagesArray }),
        });
        
        if (res.ok) {
            addToast("Product created successfully", "success");
            router.push("/admin/products");
        } else {
            addToast("Failed to create product", "error");
        }
    } catch (e) {
        addToast("Error creating product", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Add Product</Heading>
      
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <form onSubmit={handleCreate} className="space-y-6">
          <Input label="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-6">
            <Input label="Price" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
            <Input label="Old Price" type="number" value={newProduct.old_price} onChange={e => setNewProduct({...newProduct, old_price: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input label="Cost Price" type="number" value={newProduct.cost_price} onChange={e => setNewProduct({...newProduct, cost_price: e.target.value})} />
            <Input label="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-6">
             <Input label="SKU" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
             <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <select 
                    className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={newProduct.category_id}
                    onChange={e => setNewProduct({...newProduct, category_id: e.target.value})}
                    required
                >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {'\u00A0'.repeat(cat.level * 4)}{cat.name}
                        </option>
                    ))}
                </select>
             </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
              value={newProduct.description} 
              onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
              required 
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Images</label>
            <div className="flex gap-2 mb-2">
                <Input 
                    className="flex-1" 
                    value={newProduct.images} 
                    onChange={e => setNewProduct({...newProduct, images: e.target.value})} 
                    placeholder="Image URLs (comma separated)"
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)}>Select Media</Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                const currentImages = newProduct.images ? newProduct.images.split(',').map(s => s.trim()).filter(Boolean) : [];
                setNewProduct({ ...newProduct, images: [...currentImages, url].join(', ') });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
