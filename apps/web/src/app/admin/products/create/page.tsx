"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { getImageUrl } from "@/lib/utils";

export default function CreateProductPage() {
  const [newProduct, setNewProduct] = useState({ 
      name: "", name_bn: "", price: "", old_price: "", cost_price: "", description: "", description_bn: "", images: "", category_id: "", brand_id: "", stock: "", sku: "",
      size: "", weight: "", color: "", material: "", is_active: true, country_id: "", age_groups: [] as string[]
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [ageGroups, setAgeGroups] = useState<any[]>([]);
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

    fetch(`${API_URL}/brands`)
      .then(res => res.json())
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch(`${API_URL}/countries`)
      .then(res => res.json())
      .then(data => setCountries(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch(`${API_URL}/age-groups`)
      .then(res => res.json())
      .then(data => setAgeGroups(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = newProduct.images.split(",").map(s => s.trim()).filter(Boolean);
    
    const payload: any = { 
        ...newProduct, 
        images: imagesArray,
        price: parseFloat(newProduct.price) || 0,
        stock: parseInt(newProduct.stock) || 0,
        old_price: newProduct.old_price ? parseFloat(newProduct.old_price) : null,
        cost_price: newProduct.cost_price ? parseFloat(newProduct.cost_price) : null,
    };

    if (!payload.brand_id) delete payload.brand_id;
    if (!payload.country_id) delete payload.country_id;
    if (!payload.category_id) delete payload.category_id;
    
    try {
        const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        
        if (res.ok) {
            addToast("Product created successfully", "success");
            router.push("/admin/products");
        } else {
            const errorData = await res.json();
            addToast(errorData.message || "Failed to create product", "error");
        }
    } catch (e) {
        addToast("Error creating product", "error");
    }
  };

  const toggleAgeGroup = (id: string) => {
      setNewProduct(prev => {
          const exists = prev.age_groups.includes(id);
          return {
              ...prev,
              age_groups: exists 
                  ? prev.age_groups.filter(g => g !== id)
                  : [...prev.age_groups, id]
          };
      });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Add Product</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="product-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Save Product</Button>
        </div>
      </div>
      
      <form id="product-form" onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Basic Information</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={newProduct.is_active} 
                            onChange={e => setNewProduct({...newProduct, is_active: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                    </label>
                </div>
                
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Product Name (English)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
                        <Input label="Product Name (Bangla)" value={newProduct.name_bn} onChange={e => setNewProduct({...newProduct, name_bn: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    </div>
                    
                    {/* Description as big full-width editor */}
                    <div className="space-y-4">
                        <RichTextEditor
                          label="Description (English)"
                          value={newProduct.description}
                          onChange={(val) => setNewProduct({ ...newProduct, description: val })}
                          className="w-full"
                        />
                        <RichTextEditor
                          label="Description (Bangla)"
                          value={newProduct.description_bn}
                          onChange={(val) => setNewProduct({ ...newProduct, description_bn: val })}
                          className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Pricing & Inventory</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Price" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Old Price" type="number" value={newProduct.old_price} onChange={e => setNewProduct({...newProduct, old_price: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Cost Price" type="number" value={newProduct.cost_price} onChange={e => setNewProduct({...newProduct, cost_price: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="SKU" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Attributes</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Size" placeholder="e.g. M, L, XL" value={newProduct.size} onChange={e => setNewProduct({...newProduct, size: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Weight" placeholder="e.g. 500g" value={newProduct.weight} onChange={e => setNewProduct({...newProduct, weight: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Color" placeholder="e.g. Red" value={newProduct.color} onChange={e => setNewProduct({...newProduct, color: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Material" placeholder="e.g. Cotton" value={newProduct.material} onChange={e => setNewProduct({...newProduct, material: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                </div>
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
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Brand</label>
                        <select 
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                            value={newProduct.brand_id}
                            onChange={e => setNewProduct({...newProduct, brand_id: e.target.value})}
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
                            value={newProduct.country_id}
                            onChange={e => setNewProduct({...newProduct, country_id: e.target.value})}
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
                                        checked={newProduct.age_groups.includes(group.id)}
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
                            className="flex-1 bg-slate-50/50 text-sm" 
                            value={newProduct.images} 
                            onChange={e => setNewProduct({...newProduct, images: e.target.value})} 
                            placeholder="Image URLs..."
                        />
                        <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
                    </div>
                    {newProduct.images && (
                        <div className="flex flex-wrap gap-2">
                            {newProduct.images.split(',').map((img: string, i: number) => (
                                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                    <img src={getImageUrl(img.trim())} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newImages = newProduct.images.split(',').map(s => s.trim()).filter((_, idx) => idx !== i).join(', ');
                                            setNewProduct({...newProduct, images: newImages});
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
        </div>
      </form>

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
