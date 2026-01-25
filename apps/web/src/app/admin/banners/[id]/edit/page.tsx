"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Edit Banner</Heading>
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleUpdate} className="space-y-6">
          <Input label="Title" value={banner.title} onChange={e => setBanner({...banner, title: e.target.value})} required />
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Image URL</label>
            <div className="flex gap-2">
                <Input 
                    className="flex-1" 
                    value={banner.image} 
                    onChange={e => setBanner({...banner, image: e.target.value})} 
                    required 
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)}>Select Media</Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Link Route</label>
            <div className="flex flex-col gap-2">
                <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={AVAILABLE_ROUTES.some(r => r.value === banner.link) ? banner.link : "custom"}
                    onChange={e => {
                        const val = e.target.value;
                        if (val !== "custom") setBanner({...banner, link: val});
                        // If custom selected, keep current link if it's not in list, or clear it
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
                    />
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input label="Order" type="number" value={banner.order} onChange={e => setBanner({...banner, order: e.target.value})} />
            <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={banner.is_active} 
                        onChange={e => setBanner({...banner, is_active: e.target.checked})}
                        className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-sky-500/20">Update Banner</Button>
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
