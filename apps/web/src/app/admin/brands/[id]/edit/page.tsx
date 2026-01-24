"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function EditBrandPage() {
  const [brand, setBrand] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetch(`${API_URL}/brands/${id}`)
      .then(res => res.json())
      .then(setBrand)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/brands/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(brand),
        });
        
        if (res.ok) {
            addToast("Brand updated successfully", "success");
            router.push("/admin/brands");
        } else {
            addToast("Failed to update brand", "error");
        }
    } catch (e) {
        addToast("Error updating brand", "error");
    }
  };

  if (!brand) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Edit Brand</Heading>
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleUpdate} className="space-y-6">
          <Input label="Name" value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})} required />
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Logo URL</label>
            <div className="flex gap-2">
                <Input 
                    className="flex-1" 
                    value={brand.logo || ""} 
                    onChange={e => setBrand({...brand, logo: e.target.value})} 
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)}>Select Media</Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
              value={brand.description || ""} 
              onChange={e => setBrand({...brand, description: e.target.value})} 
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-sky-500/20">Update Brand</Button>
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setBrand({ ...brand, logo: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
