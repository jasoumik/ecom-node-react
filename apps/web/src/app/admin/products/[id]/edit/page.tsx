"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function EditProductPage() {
  const [product, setProduct] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then(res => res.json())
      .then(data => {
          let images = data.images;
          if (typeof images === 'string') {
              try { images = JSON.parse(images).join(', '); } catch(e) { images = ''; }
          } else if (Array.isArray(images)) {
              images = images.join(', ');
          }
          setProduct({ ...data, images });
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = product.images.split(",").map((s: string) => s.trim());
    
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...product, images: imagesArray }),
        });
        
        if (res.ok) {
            addToast("Product updated successfully", "success");
            router.push("/admin/products");
        } else {
            addToast("Failed to update product", "error");
        }
    } catch (e) {
        addToast("Error updating product", "error");
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Edit Product</Heading>
      
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <form onSubmit={handleUpdate} className="space-y-6">
          <Input label="Name" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-6">
            <Input label="Price" type="number" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} required />
            <Input label="Old Price" type="number" value={product.old_price || ''} onChange={e => setProduct({...product, old_price: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input label="Stock" type="number" value={product.stock} onChange={e => setProduct({...product, stock: e.target.value})} required />
            <Input label="SKU" value={product.sku || ''} onChange={e => setProduct({...product, sku: e.target.value})} />
          </div>
          
          <Input label="Category ID (UUID)" value={product.category_id || ''} onChange={e => setProduct({...product, category_id: e.target.value})} required />
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
              value={product.description} 
              onChange={e => setProduct({...product, description: e.target.value})} 
              required 
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Images</label>
            <div className="flex gap-2 mb-2">
                <Input 
                    className="flex-1" 
                    value={product.images} 
                    onChange={e => setProduct({...product, images: e.target.value})} 
                    placeholder="Image URLs (comma separated)"
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)}>Select Media</Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Update Product</Button>
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                const currentImages = product.images ? product.images.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                setProduct({ ...product, images: [...currentImages, url].join(', ') });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
