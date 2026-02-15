"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { Table } from "@/components/ui/Table";
import { getImageUrl } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface Batch {
    id: string;
    batch_number: string;
    remaining_quantity: number;
    quantity: number;
    purchase_price: number;
    selling_price: number;
    expiry_date: string;
    purchase_date: string;
}

interface Variant {
    id: string;
    size?: string;
    color?: string;
    stock: number;
    price?: number;
    sku?: string;
    weight?: string;
    material?: string;
}

export default function EditProductPage() {
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [newBatch, setNewBatch] = useState({ batch_number: "", purchase_price: "", selling_price: "", quantity: "", expiry_date: "" });
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  
  // Variant State
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState({ size: "", color: "", material: "", weight: "", price: "", stock: "", sku: "" });
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetchProduct();
    fetchCategories();
    fetchBrands();
    fetchCountries();
    fetchAgeGroups();
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
          setProduct({ ...data, images, age_groups: data.age_groups || [] });
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

  const fetchBrands = () => {
    fetch(`${API_URL}/brands`)
      .then(res => res.json())
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const fetchCountries = () => {
    fetch(`${API_URL}/countries`)
      .then(res => res.json())
      .then(data => setCountries(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const fetchAgeGroups = () => {
    fetch(`${API_URL}/age-groups`)
      .then(res => res.json())
      .then(data => setAgeGroups(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = product.images.split(",").map((s: string) => s.trim());
    
    const payload: any = {
        ...product,
        images: imagesArray,
        variants: variants
    };

    if (!payload.brand_id) payload.brand_id = null;
    if (!payload.country_id) payload.country_id = null;

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
      // @ts-ignore
      setVariants([...variants, { ...newVariant, id: `temp-${Date.now()}` }]); 
      setNewVariant({ size: "", color: "", material: "", weight: "", price: "", stock: "", sku: "" });
      setIsAddingVariant(false);
  };

  const removeVariant = (index: number) => {
      const newVariants = [...variants];
      newVariants.splice(index, 1);
      setVariants(newVariants);
  };

  const toggleAgeGroup = (id: string) => {
      setProduct((prev: any) => {
          const exists = prev.age_groups.includes(id);
          return {
              ...prev,
              age_groups: exists 
                  ? prev.age_groups.filter((g: string) => g !== id)
                  : [...prev.age_groups, id]
          };
      });
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="lg" className="font-sans text-slate-900 dark:text-white">Edit Product</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="edit-product-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Update Product</Button>
        </div>
      </div>
      
      <form id="edit-product-form" onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Basic Information</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={product.is_active} 
                            onChange={e => setProduct({...product, is_active: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                    </label>
                </div>
                
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Product Name (English)" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
                        <Input label="Product Name (Bangla)" value={product.name_bn || ""} onChange={e => setProduct({...product, name_bn: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    </div>
                    
                    {/* Description as big full-width editor */}
                    <div className="space-y-4">
                        <RichTextEditor
                          label="Description (English)"
                          value={product.description}
                          onChange={(val) => setProduct({ ...product, description: val })}
                          className="w-full"
                        />
                        <RichTextEditor
                          label="Description (Bangla)"
                          value={product.description_bn || ""}
                          onChange={(val) => setProduct({ ...product, description_bn: val })}
                          className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Pricing & Inventory</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Price" type="number" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Old Price" type="number" value={product.old_price || ''} onChange={e => setProduct({...product, old_price: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Cost Price" type="number" value={product.cost_price || ''} onChange={e => setProduct({...product, cost_price: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Stock (Total)" type="number" value={product.stock} disabled className="bg-slate-100 dark:bg-slate-800 opacity-70" />
                    <Input label="SKU" value={product.sku || ''} onChange={e => setProduct({...product, sku: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                </div>
            </div>

            {/* Variants Management */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Product Variants</h3>
                    <Button type="button" onClick={() => setIsAddingVariant(!isAddingVariant)} className="rounded-lg py-1.5 px-3 text-xs h-auto">{isAddingVariant ? "Cancel" : "+ Add Variant"}</Button>
                </div>

                {isAddingVariant && (
                    <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <Input label="Size" value={newVariant.size} onChange={e => setNewVariant({...newVariant, size: e.target.value})} className="bg-white dark:bg-slate-900" />
                            <Input label="Color" value={newVariant.color} onChange={e => setNewVariant({...newVariant, color: e.target.value})} className="bg-white dark:bg-slate-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <Input label="Stock" type="number" value={newVariant.stock} onChange={e => setNewVariant({...newVariant, stock: e.target.value})} required className="bg-white dark:bg-slate-900" />
                            <Input label="Price Override" type="number" value={newVariant.price} onChange={e => setNewVariant({...newVariant, price: e.target.value})} placeholder="Optional" className="bg-white dark:bg-slate-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <Input label="SKU" value={newVariant.sku} onChange={e => setNewVariant({...newVariant, sku: e.target.value})} className="bg-white dark:bg-slate-900" />
                            <Input label="Weight" value={newVariant.weight} onChange={e => setNewVariant({...newVariant, weight: e.target.value})} className="bg-white dark:bg-slate-900" />
                        </div>
                        <div className="flex justify-end">
                            <Button type="button" onClick={handleAddVariant} className="rounded-lg py-1.5 px-4 text-xs h-auto">Add to List</Button>
                        </div>
                    </div>
                )}

                <Table<Variant>
                    data={variants}
                    emptyMessage="No variants added. Base product attributes will be used."
                    columns={[
                        { header: "Size", accessorKey: "size", className: "text-slate-700 dark:text-slate-300 text-xs" },
                        { header: "Color", accessorKey: "color", className: "text-slate-700 dark:text-slate-300 text-xs" },
                        { header: "Stock", accessorKey: "stock", className: "font-bold text-slate-900 dark:text-white text-xs" },
                        { header: "Price", cell: (v) => v.price ? `৳${v.price}` : '-', className: "text-slate-600 dark:text-slate-400 text-xs" },
                        { header: "SKU", accessorKey: "sku", className: "text-slate-500 dark:text-slate-500 text-[10px]" },
                        {
                            header: "Actions",
                            className: "text-right",
                            cell: (v) => (
                                <div className="flex justify-end">
                                    <button 
                                        type="button"
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
            </div>

            {/* Batches List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Inventory Batches</h3>
                    <Button type="button" onClick={() => setIsAddingBatch(!isAddingBatch)} className="rounded-lg py-1.5 px-3 text-xs h-auto">{isAddingBatch ? "Cancel" : "+ Add Batch"}</Button>
                </div>

                {isAddingBatch && (
                    <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <Input label="Batch Number" value={newBatch.batch_number} onChange={e => setNewBatch({...newBatch, batch_number: e.target.value})} required className="bg-white dark:bg-slate-900" />
                            <Input label="Quantity" type="number" value={newBatch.quantity} onChange={e => setNewBatch({...newBatch, quantity: e.target.value})} required className="bg-white dark:bg-slate-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <Input label="Purchase Price" type="number" value={newBatch.purchase_price} onChange={e => setNewBatch({...newBatch, purchase_price: e.target.value})} required className="bg-white dark:bg-slate-900" />
                            <Input label="Selling Price" type="number" value={newBatch.selling_price} onChange={e => setNewBatch({...newBatch, selling_price: e.target.value})} required className="bg-white dark:bg-slate-900" />
                        </div>
                        <div className="mb-3">
                            <Input label="Expiry Date" type="date" value={newBatch.expiry_date} onChange={e => setNewBatch({...newBatch, expiry_date: e.target.value})} className="bg-white dark:bg-slate-900" />
                        </div>
                        <div className="flex justify-end">
                            <Button type="button" onClick={handleAddBatch} className="rounded-lg py-1.5 px-4 text-xs h-auto">Save Batch</Button>
                        </div>
                    </div>
                )}

                <Table<Batch>
                    data={product.batches || []}
                    emptyMessage="No batches found."
                    columns={[
                        { header: "Batch #", accessorKey: "batch_number", className: "font-bold text-xs" },
                        { header: "Qty", accessorKey: "remaining_quantity", className: "text-xs" },
                        { header: "Buy", cell: (b) => `৳${b.purchase_price}`, className: "text-xs" },
                        { header: "Sell", cell: (b) => `৳${b.selling_price}`, className: "text-xs" },
                        { header: "Expiry", cell: (b) => b.expiry_date ? new Date(b.expiry_date).toLocaleDateString() : '-', className: "text-xs" },
                    ]}
                />
            </div>
        </div>

        {/* Right Column: Organization & Media */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Organization</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                        <select 
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
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
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Brand</label>
                        <select 
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                            value={product.brand_id || ""}
                            onChange={e => setProduct({...product, brand_id: e.target.value})}
                        >
                            <option value="">Select Brand</option>
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Country of Origin</label>
                        <select 
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                            value={product.country_id || ""}
                            onChange={e => setProduct({...product, country_id: e.target.value})}
                        >
                            <option value="">Select Country</option>
                            {countries.map(country => (
                                <option key={country.id} value={country.id}>{country.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Age Groups Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Shop by Age</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                            {ageGroups.map(group => (
                                <label key={group.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded">
                                    <input 
                                        type="checkbox" 
                                        checked={product.age_groups?.includes(group.id)}
                                        onChange={() => toggleAgeGroup(group.id)}
                                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{group.label} ({group.age_range})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Media</h3>
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product Images</label>
                    <div className="flex gap-2 mb-2">
                        <Input 
                            className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 text-sm" 
                            value={product.images} 
                            onChange={e => setProduct({...product, images: e.target.value})} 
                            placeholder="Image URLs..."
                        />
                        <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
                    </div>
                    {product.images && (
                        <div className="flex flex-wrap gap-2">
                            {product.images.split(',').map((img: string, i: number) => (
                                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                    <img src={getImageUrl(img.trim())} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newImages = product.images.split(',').map((s: string) => s.trim()).filter((_: any, idx: number) => idx !== i).join(', ');
                                            setProduct({...product, images: newImages});
                                        }}
                                        className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 rounded-bl-lg flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Base Attributes - Only show if no variants */}
            {variants.length === 0 && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Base Attributes</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Size" placeholder="e.g. M" value={product.size || ''} onChange={e => setProduct({...product, size: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                        <Input label="Color" placeholder="e.g. Red" value={product.color || ''} onChange={e => setProduct({...product, color: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                        <Input label="Weight" placeholder="e.g. 500g" value={product.weight || ''} onChange={e => setProduct({...product, weight: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                        <Input label="Material" placeholder="e.g. Cotton" value={product.material || ''} onChange={e => setProduct({...product, material: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">Inventory Summary</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Total Stock</span>
                        <span className="font-bold text-slate-900 dark:text-white">{product.stock}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Active Batches</span>
                        <span className="font-bold text-slate-900 dark:text-white">{product.batches?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Variants</span>
                        <span className="font-bold text-slate-900 dark:text-white">{variants.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Valuation</span>
                        <span className="font-bold text-sky-500">{product.inventoryMethod}</span>
                    </div>
                </div>
            </div>
        </div>
      </form>

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
