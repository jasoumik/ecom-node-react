"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function CreateBannerPage() {
  const [newBanner, setNewBanner] = useState({ title: "", image: "", link: "", order: "0", is_active: true });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/banners`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newBanner, order: parseInt(newBanner.order) }),
        });
        
        if (res.ok) {
            addToast("Banner created successfully", "success");
            router.push("/admin/banners");
        } else {
            addToast("Failed to create banner", "error");
        }
    } catch (e) {
        addToast("Error creating banner", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Add Banner</Heading>
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleCreate} className="space-y-6">
          <Input label="Title" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} required />
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Image URL</label>
            <div className="flex gap-2">
                <Input 
                    className="flex-1" 
                    value={newBanner.image} 
                    onChange={e => setNewBanner({...newBanner, image: e.target.value})} 
                    required 
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)}>Select Media</Button>
            </div>
          </div>

          <Input label="Link (Optional)" value={newBanner.link} onChange={e => setNewBanner({...newBanner, link: e.target.value})} />
          <div className="grid grid-cols-2 gap-6">
            <Input label="Order" type="number" value={newBanner.order} onChange={e => setNewBanner({...newBanner, order: e.target.value})} />
            <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={newBanner.is_active} 
                        onChange={e => setNewBanner({...newBanner, is_active: e.target.checked})}
                        className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-sky-500/20">Save Banner</Button>
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setNewBanner({ ...newBanner, image: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
