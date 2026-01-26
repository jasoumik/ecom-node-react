"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

const AVAILABLE_ROUTES = [
    { label: "Home", value: "/" },
    { label: "All Products", value: "/products" },
    { label: "New Arrivals", value: "/products?sort=new" },
    { label: "Best Sellers", value: "/products?sort=best_selling" },
    { label: "About Us", value: "/about" },
    { label: "Contact", value: "/contact" },
];

export default function CreateBannerPage() {
  const [newBanner, setNewBanner] = useState({ title: "", title_bn: "", image: "", link: "", order: "0", is_active: true });
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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Add Banner</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="banner-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Save Banner</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="banner-form" onSubmit={handleCreate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Banner Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={newBanner.is_active} 
                        onChange={e => setNewBanner({...newBanner, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Title (English)" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} required className="bg-slate-50/50" />
            <Input label="Title (Bangla)" value={newBanner.title_bn} onChange={e => setNewBanner({...newBanner, title_bn: e.target.value})} className="bg-slate-50/50" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Image URL</label>
            <div className="flex gap-2">
                <Input 
                    className="flex-1 bg-slate-50/50 text-sm" 
                    value={newBanner.image} 
                    onChange={e => setNewBanner({...newBanner, image: e.target.value})} 
                    required 
                    placeholder="Image URL..."
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Link Route</label>
            <div className="flex flex-col gap-2">
                <select 
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                    value={AVAILABLE_ROUTES.some(r => r.value === newBanner.link) ? newBanner.link : "custom"}
                    onChange={e => {
                        const val = e.target.value;
                        if (val !== "custom") setNewBanner({...newBanner, link: val});
                        else setNewBanner({...newBanner, link: ""});
                    }}
                >
                    <option value="">Select a Route</option>
                    {AVAILABLE_ROUTES.map(route => (
                        <option key={route.value} value={route.value}>{route.label} ({route.value})</option>
                    ))}
                    <option value="custom">Custom URL...</option>
                </select>
                
                {(!AVAILABLE_ROUTES.some(r => r.value === newBanner.link) || newBanner.link === "") && (
                    <Input 
                        placeholder="Enter custom URL (e.g. /products/123)" 
                        value={newBanner.link} 
                        onChange={e => setNewBanner({...newBanner, link: e.target.value})} 
                        className="bg-slate-50/50"
                    />
                )}
            </div>
          </div>

          <div className="w-1/3">
            <Input label="Order" type="number" value={newBanner.order} onChange={e => setNewBanner({...newBanner, order: e.target.value})} className="bg-slate-50/50" />
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
