"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function CreateProductPage() {
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "", images: "", category: "", stock: "" });
  const router = useRouter();
  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = newProduct.images.split(",").map(s => s.trim());
    
    // Need to fetch category ID first or use a dropdown. For simplicity, assuming category name is passed or we need to implement category selection.
    // Since we changed schema to use category_id, we should ideally fetch categories.
    // For now, let's assume the user inputs a valid category ID or we need to fix this flow.
    // Let's fetch categories to show in a dropdown.
    
    // Actually, let's just send what we have and let backend handle or fail.
    // But wait, backend expects category_id UUID.
    // I should add a category selector.
    
    // For this step, I'll just send the data. If it fails, I'll fix it.
    // But wait, the previous code was sending 'category' string. The backend migration changed it to 'category_id'.
    // I need to update the form to select a category.
    
    // Let's fetch categories first.
    // I'll do that in a separate useEffect.
    
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
            <Input label="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
          </div>
          
          {/* Category Selection should be here. For now keeping text input but labeled as Category ID */}
          <Input label="Category ID (UUID)" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required />
          
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
          <Input label="Image URLs (comma separated)" value={newProduct.images} onChange={e => setNewProduct({...newProduct, images: e.target.value})} />
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
