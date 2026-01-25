"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { Table } from "@/components/ui/Table";

export default function EditProductPage() {
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [newBatch, setNewBatch] = useState({ batch_number: "", purchase_price: "", selling_price: "", quantity: "", expiry_date: "" });
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  
  // Variant State
  const [variants, setVariants] = useState<any[]>([]);
  const [newVariant, setNewVariant] = useState({ size: "", color: "", material: "", weight: "", price: "", stock: "", sku: "" });
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  const fetchProduct = () => {
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
          setVariants(Array.isArray(data.variants) ? data.variants : []);
      })
      .catch(err => console.error(err));
  };

  const fetchCategories = () => {
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
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = product.images.split(",").map((s: string) => s.trim());
    
    // Include variants in update payload
    const payload = {
        ...product,
        images: imagesArray,
        variants: variants
    };

    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        
        if (res.ok) {
            addToast("Product updated successfully", "success");
            fetchProduct();
        } else {
            addToast("Failed to update product", "error");
        }
    } catch (e) {
        addToast("Error updating product", "error");
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await fetch(`${API_URL}/products/${id}/batches`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newBatch),
          });
          if (res.ok) {
              addToast("Batch added successfully", "success");
              setIsAddingBatch(false);
              setNewBatch({ batch_number: "", purchase_price: "", selling_price: "", quantity: "", expiry_date: "" });
              fetchProduct();
          } else {
              addToast("Failed to add batch", "error");
          }
      } catch (e) {
          addToast("Error adding batch", "error");
      }
  };

  const handleAddVariant = () => {
      if (!newVariant.stock) {
          addToast("Stock is required for variant", "error");
          return;
      }
      setVariants([...variants, { ...newVariant, id: `temp-${Date.now()}` }]); 
      setNewVariant({ size: "", color: "", material: "", weight: "", price: "", stock: "", sku: "" });
      setIsAddingVariant(false);
  };

  const removeVariant = (index: number) => {
      const newVariants = [...variants];
      newVariants.splice(index, 1);
      setVariants(newVariants);
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Edit Product</Heading>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Product Form */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Product Details</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={product.is_active} 
                            onChange={e => setProduct({...product, is_active: e.target.checked})}
                            className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                        />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active</span>
                    </label>
                </div>
                <form onSubmit={handleUpdate} className="space-y-6">
                <Input label="Name" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} required className="bg-slate-50/50" />
                <div className="grid grid-cols-2 gap-6">
                    <Input label="Price" type="number" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} required className="bg-slate-50/50" />
                    <Input label="Old Price" type="number" value={product.old_price || ''} onChange={e => setProduct({...product, old_price: e.target.value})} className="bg-slate-50/50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <Input label="Cost Price" type="number" value={product.cost_price || ''} onChange={e => setProduct({...product, cost_price: e.target.value})} className="bg-slate-50/50" />
                    <Input label="Stock (Total)" type="number" value={product.stock} disabled className="bg-slate-100 dark:bg-slate-800 opacity-70" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <Input label="SKU" value={product.sku || ''} onChange={e => setProduct({...product, sku: e.target.value})} className="bg-slate-50/50" />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                        <select 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            value={product.category_id || ""}
                            onChange={e => setProduct({...product, category_id: e.target.value})}
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

                {/* Base Attributes - Only show if no variants */}
                {variants.length === 0 && (
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Input label="Base Size" placeholder="e.g. M" value={product.size || ''} onChange={e => setProduct({...product, size: e.target.value})} className="bg-slate-50/50" />
                        <Input label="Base Color" placeholder="e.g. Red" value={product.color || ''} onChange={e => setProduct({...product, color: e.target.value})} className="bg-slate-50/50" />
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                    <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
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
                            className="flex-1 bg-slate-50/50" 
                            value={product.images} 
                            onChange={e => setProduct({...product, images: e.target.value})} 
                            placeholder="Image URLs (comma separated)"
                        />
                        <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-xl">Select Media</Button>
                    </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">Cancel</Button>
                    <Button type="submit" className="rounded-xl shadow-lg shadow-sky-500/20 px-8">Update Product</Button>
                </div>
                </form>
            </div>

            {/* Variants Management */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Product Variants</h3>
                    <Button size="sm" onClick={() => setIsAddingVariant(!isAddingVariant)} className="rounded-xl">{isAddingVariant ? "Cancel" : "+ Add Variant"}</Button>
                </div>

                {isAddingVariant && (
                    <div className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input label="Size" value={newVariant.size} onChange={e => setNewVariant({...newVariant, size: e.target.value})} className="bg-white" />
                            <Input label="Color" value={newVariant.color} onChange={e => setNewVariant({...newVariant, color: e.target.value})} className="bg-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input label="Stock" type="number" value={newVariant.stock} onChange={e => setNewVariant({...newVariant, stock: e.target.value})} required className="bg-white" />
                            <Input label="Price Override" type="number" value={newVariant.price} onChange={e => setNewVariant({...newVariant, price: e.target.value})} placeholder="Optional" className="bg-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input label="SKU" value={newVariant.sku} onChange={e => setNewVariant({...newVariant, sku: e.target.value})} className="bg-white" />
                            <Input label="Weight" value={newVariant.weight} onChange={e => setNewVariant({...newVariant, weight: e.target.value})} className="bg-white" />
                        </div>
                        <div className="flex justify-end">
                            <Button type="button" size="sm" onClick={handleAddVariant} className="rounded-xl">Add to List</Button>
                        </div>
                    </div>
                )}

                <Table 
                    data={variants}
                    emptyMessage="No variants added. Base product attributes will be used."
                    columns={[
                        { header: "Size", accessorKey: "size", className: "text-slate-700 dark:text-slate-300" },
                        { header: "Color", accessorKey: "color", className: "text-slate-700 dark:text-slate-300" },
                        { header: "Stock", accessorKey: "stock", className: "font-bold text-slate-900 dark:text-white" },
                        { header: "Price", cell: (v) => v.price ? `৳${v.price}` : '-', className: "text-slate-600 dark:text-slate-400" },
                        { header: "SKU", accessorKey: "sku", className: "text-slate-500 dark:text-slate-500 text-xs" },
                        {
                            header: "Actions",
                            className: "text-right",
                            cell: (v) => (
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => removeVariant(variants.indexOf(v))}
                                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )
                        }
                    ]}
                />
                <p className="text-xs text-slate-500 mt-4">Note: Adding variants will override base stock. Save product to apply changes.</p>
            </div>

            {/* Batches List */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Inventory Batches</h3>
                    <Button size="sm" onClick={() => setIsAddingBatch(!isAddingBatch)} className="rounded-xl">{isAddingBatch ? "Cancel" : "+ Add Batch"}</Button>
                </div>

                {isAddingBatch && (
                    <form onSubmit={handleAddBatch} className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input label="Batch Number" value={newBatch.batch_number} onChange={e => setNewBatch({...newBatch, batch_number: e.target.value})} required className="bg-white" />
                            <Input label="Quantity" type="number" value={newBatch.quantity} onChange={e => setNewBatch({...newBatch, quantity: e.target.value})} required className="bg-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input label="Purchase Price" type="number" value={newBatch.purchase_price} onChange={e => setNewBatch({...newBatch, purchase_price: e.target.value})} required className="bg-white" />
                            <Input label="Selling Price" type="number" value={newBatch.selling_price} onChange={e => setNewBatch({...newBatch, selling_price: e.target.value})} required className="bg-white" />
                        </div>
                        <div className="mb-4">
                            <Input label="Expiry Date" type="date" value={newBatch.expiry_date} onChange={e => setNewBatch({...newBatch, expiry_date: e.target.value})} className="bg-white" />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" size="sm" className="rounded-xl">Save Batch</Button>
                        </div>
                    </form>
                )}

                <Table 
                    data={product.batches || []}
                    emptyMessage="No batches found."
                    columns={[
                        { header: "Batch #", accessorKey: "batch_number", className: "font-bold" },
                        { header: "Qty", accessorKey: "remaining_quantity" },
                        { header: "Buy Price", cell: (b) => `৳${b.purchase_price}` },
                        { header: "Sell Price", cell: (b) => `৳${b.selling_price}` },
                        { header: "Expiry", cell: (b) => b.expiry_date ? new Date(b.expiry_date).toLocaleDateString() : '-' },
                        { header: "Date", cell: (b) => new Date(b.purchase_date).toLocaleDateString() },
                    ]}
                />
            </div>
        </div>

        {/* Sidebar / Info */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 sticky top-24">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Inventory Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Total Stock</span>
                        <span className="font-bold text-slate-900 dark:text-white">{product.stock}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Active Batches</span>
                        <span className="font-bold text-slate-900 dark:text-white">{product.batches?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Variants</span>
                        <span className="font-bold text-slate-900 dark:text-white">{variants.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Valuation Method</span>
                        <span className="font-bold text-sky-500">{product.inventoryMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-bold ${product.is_active ? 'text-green-500' : 'text-red-500'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
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
