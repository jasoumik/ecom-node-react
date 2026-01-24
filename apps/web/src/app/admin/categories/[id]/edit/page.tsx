"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function EditCategoryPage() {
  const [category, setCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    // Fetch category details
    fetch(`${API_URL}/categories/${id}`)
      .then(res => res.json())
      .then(setCategory)
      .catch(console.error);

    // Fetch all categories for parent dropdown
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
          const flatten = (cats: any[]): any[] => {
              return cats.reduce((acc, cat) => {
                  acc.push(cat);
                  if (cat.children) acc.push(...flatten(cat.children));
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
        if (!payload.parent_id) payload.parent_id = null; // Handle clearing parent
        // Remove children to avoid circular issues or large payload
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

  if (!category) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Edit Category</Heading>
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleUpdate} className="space-y-6">
          <Input label="Name" value={category.name} onChange={e => setCategory({...category, name: e.target.value})} required />
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Parent Category (Optional)</label>
            <select 
                className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={category.parent_id || ""}
                onChange={e => setCategory({...category, parent_id: e.target.value})}
            >
                <option value="">None (Root Category)</option>
                {categories.filter(c => c.id !== id).map(cat => ( // Prevent selecting self as parent
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Image URL</label>
            <div className="flex gap-2">
                <Input 
                    className="flex-1" 
                    value={category.image || ""} 
                    onChange={e => setCategory({...category, image: e.target.value})} 
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)}>Select Media</Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
              value={category.description || ""} 
              onChange={e => setCategory({...category, description: e.target.value})} 
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-sky-500/20">Update Category</Button>
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setCategory({ ...category, image: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
