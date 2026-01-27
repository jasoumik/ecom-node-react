"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { getImageUrl } from "@/lib/utils";

const AVAILABLE_ROUTES = [
    { label: "Home", value: "/" },
    { label: "All Products", value: "/products" },
    { label: "New Arrivals", value: "/products?sort=new" },
    { label: "Best Sellers", value: "/products?sort=best_selling" },
    { label: "About Us", value: "/about" },
    { label: "Contact", value: "/contact" },
];

export default function EditBannerPage() {
  const [banner, setBanner] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetch(`${API_URL}/banners/${id}`)
      .then(res => res.json())
      .then(setBanner)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/banners/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...banner, order: parseInt(banner.order) }),
        });
        
        if (res.ok) {
            addToast("Banner updated successfully", "success");
            router.push("/admin/banners");
        } else {
            addToast("Failed to update banner", "error");
        }
    } catch (e) {
        addToast("Error updating banner", "error");
    }
  };

  if (!banner) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit Banner</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="edit-banner-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Update Banner</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="edit-banner-form" onSubmit={handleUpdate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Banner Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={banner.is_active} 
                        onChange={e => setBanner({...banner, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Title (English)" value={banner.title} onChange={e => setBanner({...banner, title: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
            <Input label="Title (Bangla)" value={banner.title_bn || ""} onChange={e => setBanner({...banner, title_bn: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Image URL</label>
            <div className="flex gap-2 mb-2">
                <Input 
                    className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 text-sm" 
                    value={banner.image} 
                    onChange={e => setBanner({...banner, image: e.target.value})} 
                    required 
                    placeholder="Image URL..."
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
            </div>
            {banner.image && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={getImageUrl(banner.image)} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                        type="button"
                        onClick={() => setBanner({...banner, image: ""})}
                        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        ✕
                    </button>
                </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Link Route</label>
            <div className="flex flex-col gap-2">
                <select 
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                    value={AVAILABLE_ROUTES.some(r => r.value === banner.link) ? banner.link : "custom"}
                    onChange={e => {
                        const val = e.target.value;
                        if (val !== "custom") setBanner({...banner, link: val});
                        else if (AVAILABLE_ROUTES.some(r => r.value === banner.link)) setBanner({...banner, link: ""});
                    }}
                >
                    <option value="">Select a Route</option>
                    {AVAILABLE_ROUTES.map(route => (
                        <option key={route.value} value={route.value}>{route.label} ({route.value})</option>
                    ))}
                    <option value="custom">Custom URL...</option>
                </select>
                
                {(!AVAILABLE_ROUTES.some(r => r.value === banner.link) || banner.link === "") && (
                    <Input 
                        placeholder="Enter custom URL (e.g. /products/123)" 
                        value={banner.link || ""} 
                        onChange={e => setBanner({...banner, link: e.target.value})} 
                        className="bg-slate-50/50 dark:bg-slate-800/50"
                    />
                )}
            </div>
          </div>

          <div className="w-1/3">
            <Input label="Order" type="number" value={banner.order} onChange={e => setBanner({...banner, order: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setBanner({ ...banner, image: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
