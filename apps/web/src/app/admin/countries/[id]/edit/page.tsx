"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function EditCountryPage() {
  const [country, setCountry] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetch(`${API_URL}/countries/${id}`)
      .then(res => res.json())
      .then(setCountry)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/countries/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(country),
        });
        
        if (res.ok) {
            addToast("Country updated successfully", "success");
            router.push("/admin/countries");
        } else {
            addToast("Failed to update country", "error");
        }
    } catch (e) {
        addToast("Error updating country", "error");
    }
  };

  if (!country) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Edit Country</Heading>
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-2">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Country Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={country.is_active} 
                        onChange={e => setCountry({...country, is_active: e.target.checked})}
                        className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Country Name" value={country.name} onChange={e => setCountry({...country, name: e.target.value})} required className="bg-slate-50/50" />
            <Input label="ISO Code (e.g. BD)" value={country.code} onChange={e => setCountry({...country, code: e.target.value.toUpperCase()})} required maxLength={3} className="bg-slate-50/50" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Flag Image</label>
            <div className="flex gap-2">
                <Input 
                    className="flex-1 bg-slate-50/50" 
                    value={country.flag || ""} 
                    onChange={e => setCountry({...country, flag: e.target.value})} 
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-xl">Select Media</Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-sky-500/20 px-8">Update Country</Button>
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setCountry({ ...country, flag: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
