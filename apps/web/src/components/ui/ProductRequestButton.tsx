"use client";

import { useState, useEffect } from "react";
import { Button, Heading } from "@repo/ui";
import { Input } from "./Input";
import { API_URL } from "@/lib/config";
import { useToast } from "./Toast";

export function ProductRequestButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ productName: "", description: "", userName: "", phone: "", email: "" });
  const { addToast } = useToast();

  useEffect(() => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
          try {
              const user = JSON.parse(userStr);
              setFormData(prev => ({ ...prev, userName: user.name || "", phone: user.phone || "", email: user.email || "" }));
          } catch (e) {}
      }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/requests/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        addToast("Request submitted successfully!", "success");
        setIsOpen(false);
        setFormData(prev => ({ ...prev, productName: "", description: "" }));
      } else {
        addToast("Failed to submit request", "error");
      }
    } catch (e) {
      addToast("Error submitting request", "error");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-sky-500 text-white p-4 rounded-full shadow-xl hover:bg-sky-600 hover:scale-110 transition-all duration-300 group flex items-center gap-2 pr-6"
      >
        <span className="text-2xl">💡</span>
        <span className="font-bold text-sm hidden group-hover:inline-block animate-in fade-in slide-in-from-right-2">Request Product</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-3xl shadow-2xl relative">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                <Heading size="lg" className="mb-2 text-slate-900 dark:text-white">Request a Product</Heading>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Can't find what you're looking for? Let us know!</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Product Name" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} required placeholder="e.g. Specific Brand Diapers" />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description (Optional)</label>
                        <textarea 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            rows={3}
                            placeholder="Any specific details..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Your Name" value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})} required />
                        <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                    </div>
                    <Input label="Email (Optional)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    
                    <Button fullWidth type="submit" className="rounded-xl py-3 mt-2">Submit Request</Button>
                </form>
            </div>
        </div>
      )}
    </>
  );
}
