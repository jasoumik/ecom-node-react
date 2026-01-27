"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function CreateBrandPage() {
  const [newBrand, setNewBrand] = useState({ name: "", name_bn: "", logo: "", description: "", is_active: true });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/brands`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBrand),
        });
        
        if (res.ok) {
            addToast("Brand created successfully", "success");
            router.push("/admin/brands");
        } else {
            addToast("Failed to create brand", "error");
        }
    } catch (e) {
        addToast("Error creating brand", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Add Brand</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="brand-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Save Brand</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="brand-form" onSubmit={handleCreate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Brand Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={newBrand.is_active} 
                        onChange={e => setNewBrand({...newBrand, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Name (English)" value={newBrand.name} onChange={e => setNewBrand({...newBrand, name: e.target.value})} required className="bg-slate-50/50" />
            <Input label="Name (Bangla)" value={newBrand.name_bn} onChange={e => setNewBrand({...newBrand, name_bn: e.target.value})} className="bg-slate-50/50" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Logo URL</label>
            <div className="flex gap-2">
                <Input 
                    className="flex-1 bg-slate-50/50 text-sm" 
                    value={newBrand.logo} 
                    onChange={e => setNewBrand({...newBrand, logo: e.target.value})} 
                    placeholder="Image URL..."
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea 
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
              value={newBrand.description} 
              onChange={e => setNewBrand({...newBrand, description: e.target.value})} 
              rows={3}
            />
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setNewBrand({ ...newBrand, logo: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
