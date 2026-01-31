"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: "Home", address: "", city: "", zip: "", is_default: false });
  const { addToast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
        setUserId(user.id);
        fetchAddresses(user.id);
    }
  }, []);

  const fetchAddresses = async (uid: string) => {
    const res = await fetch(`${API_URL}/users/${uid}/addresses`);
    const data = await res.json();
    setAddresses(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/users/${userId}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        addToast("Address added", "success");
        setIsAdding(false);
        setNewAddress({ type: "Home", address: "", city: "", zip: "", is_default: false });
        fetchAddresses(userId);
      } else {
        addToast("Failed to add address", "error");
      }
    } catch (e) {
      addToast("Error adding address", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId || !confirm("Delete this address?")) return;
    try {
      await fetch(`${API_URL}/users/${userId}/addresses/${id}`, { method: "DELETE" });
      addToast("Address deleted", "success");
      fetchAddresses(userId);
    } catch (e) {
      addToast("Error deleting address", "error");
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-1">My Addresses</Heading>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your shipping addresses for faster checkout.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="w-full sm:w-auto rounded-xl shadow-lg shadow-sky-500/20 px-6 py-2.5">
            {isAdding ? "Cancel" : "+ Add New"}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">New Address Details</h3>
            <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <Input label="Label (e.g. Home, Office)" value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})} required className="bg-white" />
                    <Input label="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} required className="bg-white" />
                </div>
                <Input label="Street Address" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} required className="bg-white" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Input label="Zip Code" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} required className="bg-white" />
                    <div className="flex items-center pt-8">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${newAddress.is_default ? 'bg-sky-500 border-sky-500' : 'border-slate-300 bg-white'}`}>
                                {newAddress.is_default && <span className="text-white text-sm">✓</span>}
                            </div>
                            <input 
                                type="checkbox" 
                                checked={newAddress.is_default} 
                                onChange={e => setNewAddress({...newAddress, is_default: e.target.checked})}
                                className="hidden"
                            />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors">Set as Default Address</span>
                        </label>
                    </div>
                </div>
                <div className="pt-4 flex justify-end">
                    <Button type="submit" className="w-full sm:w-auto rounded-xl px-8 py-3 shadow-md">Save Address</Button>
                </div>
            </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
            <div key={addr.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all relative group">
                {addr.is_default && (
                    <span className="absolute top-6 right-6 bg-sky-100 text-sky-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide dark:bg-sky-900/30 dark:text-sky-400">
                        Default
                    </span>
                )}
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                        addr.type.toLowerCase().includes('home') ? 'bg-rose-50 text-rose-500' : 
                        addr.type.toLowerCase().includes('office') ? 'bg-blue-50 text-blue-500' : 
                        'bg-slate-100 text-slate-500'
                    }`}>
                        {addr.type.toLowerCase().includes('home') ? '🏠' : addr.type.toLowerCase().includes('office') ? '🏢' : '📍'}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{addr.type}</h3>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Shipping Address</p>
                    </div>
                </div>

                <div className="space-y-1 pl-16">
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">{addr.address}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{addr.city}, {addr.zip}</p>
                </div>

                <div className="absolute bottom-6 right-6">
                    <button
                        onClick={() => handleDelete(addr.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                        title="Delete Address"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        ))}

        {addresses.length === 0 && !isAdding && (
            <div className="col-span-2 flex flex-col items-center justify-center py-10 sm:py-16 px-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="text-4xl mb-4 opacity-50">📍</div>
                <p className="font-medium">No addresses saved yet</p>
                <p className="text-xs sm:text-sm mt-1 max-w-xs mx-auto">Add an address to speed up your checkout process.</p>
            </div>
        )}
      </div>
    </div>
  );
}
