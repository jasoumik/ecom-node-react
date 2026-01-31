"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { getImageUrl } from "@/lib/utils";

export default function EditCategoryPage() {
  const [category, setCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'image' | 'banner_image'>('image');
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetch(`${API_URL}/categories/${id}`)
      .then(res => res.json())
      .then(setCategory)
      .catch(console.error);

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
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const payload = { ...category };
        if (!payload.parent_id) payload.parent_id = null;
        delete payload.children;

        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        
        if (res.ok) {
            addToast("Category updated successfully", "success");
            router.push("/admin/categories");
        } else {
            addToast("Failed to update category", "error");
        }
    } catch (e) {
        addToast("Error updating category", "error");
    }
  };

  const openMediaPicker = (target: 'image' | 'banner_image') => {
      setMediaPickerTarget(target);
      setShowMediaPicker(true);
  };

  if (!category) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit Category</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="edit-category-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Update Category</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="edit-category-form" onSubmit={handleUpdate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Category Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={category.is_active} 
                        onChange={e => setCategory({...category, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Name (English)" value={category.name} onChange={e => setCategory({...category, name: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
            <Input label="Name (Bangla)" value={category.name_bn || ""} onChange={e => setCategory({...category, name_bn: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
          </div>
          
          <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Parent Category</label>
              <select 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                  value={category.parent_id || ""}
                  onChange={e => setCategory({...category, parent_id: e.target.value})}
              >
                  <option value="">None (Root Category)</option>
                  {categories.filter(c => c.id !== id).map(cat => (
                      <option key={cat.id} value={cat.id}>
                          {'\u00A0'.repeat(cat.level * 4)}{cat.name}
                      </option>
                  ))}
              </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Icon/Thumbnail (Small)</label>
                <div className="flex gap-2 mb-2">
                    <Input 
                        className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 text-sm" 
                        value={category.image || ""} 
                        onChange={e => setCategory({...category, image: e.target.value})} 
                        placeholder="Image URL..."
                    />
                    <Button type="button" variant="secondary" onClick={() => openMediaPicker('image')} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
                </div>
                {category.image && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                        <img src={getImageUrl(category.image)} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => setCategory({...category, image: ""})}
                            className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Banner Image (Large)</label>
                <div className="flex gap-2 mb-2">
                    <Input 
                        className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 text-sm" 
                        value={category.banner_image || ""} 
                        onChange={e => setCategory({...category, banner_image: e.target.value})} 
                        placeholder="Banner URL..."
                    />
                    <Button type="button" variant="secondary" onClick={() => openMediaPicker('banner_image')} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
                </div>
                {category.banner_image && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                        <img src={getImageUrl(category.banner_image)} alt="Banner Preview" className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => setCategory({...category, banner_image: ""})}
                            className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description (English)</label>
                <textarea 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
                value={category.description || ""} 
                onChange={e => setCategory({...category, description: e.target.value})} 
                rows={3}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description (Bangla)</label>
                <textarea 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
                value={category.description_bn || ""} 
                onChange={e => setCategory({...category, description_bn: e.target.value})} 
                rows={3}
                />
            </div>
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setCategory({ ...category, [mediaPickerTarget]: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
