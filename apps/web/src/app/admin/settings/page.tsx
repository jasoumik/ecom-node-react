"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      const data = await res.json();
      setSettings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    try {
      const res = await fetch(`${API_URL}/settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.ok) {
        addToast("Setting updated", "success");
        fetchSettings();
      } else {
        addToast("Failed to update setting", "error");
      }
    } catch (e) {
      addToast("Error updating setting", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Settings</Heading>
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Inventory Configuration</h3>
        
        <div className="space-y-6">
            {settings.map(setting => (
                <div key={setting.id} className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">
                        {setting.key.replace(/_/g, ' ')}
                    </label>
                    <p className="text-xs text-slate-500 mb-2">{setting.description}</p>
                    
                    {setting.key === 'inventory_method' ? (
                        <div className="flex gap-4">
                            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${setting.value === 'FIFO' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                <input 
                                    type="radio" 
                                    name="inventory_method" 
                                    checked={setting.value === 'FIFO'} 
                                    onChange={() => handleUpdate('inventory_method', 'FIFO')}
                                    className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                                />
                                <span className="font-bold text-slate-900 dark:text-white">FIFO (First-In, First-Out)</span>
                            </label>
                            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${setting.value === 'LIFO' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                <input 
                                    type="radio" 
                                    name="inventory_method" 
                                    checked={setting.value === 'LIFO'} 
                                    onChange={() => handleUpdate('inventory_method', 'LIFO')}
                                    className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                                />
                                <span className="font-bold text-slate-900 dark:text-white">LIFO (Last-In, First-Out)</span>
                            </label>
                        </div>
                    ) : (
                        <input 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            value={setting.value}
                            onChange={(e) => handleUpdate(setting.key, e.target.value)} // Note: This triggers update on every keystroke, ideally use debounce or save button. For radio it's fine.
                        />
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
