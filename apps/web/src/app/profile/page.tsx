"use client";

import { useState, useEffect } from "react";
import { Button, Heading } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      fetch(`${API_URL}/users/profile/${parsed.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.statusCode && data.statusCode !== 200) {
                console.error("Error fetching profile:", data);
            } else {
                setUser(data);
            }
        })
        .catch(console.error);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
      };

      const res = await fetch(`${API_URL}/users/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        const lsUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...lsUser, ...updatedUser }));
        window.dispatchEvent(new Event("storage"));
        addToast("Profile updated successfully", "success");
      } else {
        addToast("Failed to update profile", "error");
      }
    } catch (e) {
      addToast("Error updating profile", "error");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-2">Personal Information</Heading>
        <p className="text-slate-500 dark:text-slate-400">Manage your personal details and account settings.</p>
      </div>
      
      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="flex items-center gap-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-800">
            <div className="relative group cursor-pointer" onClick={() => setShowMediaPicker(true)}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-sky-100 dark:bg-slate-700 flex items-center justify-center text-4xl">👤</div>
                    )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <span className="text-white text-xs font-bold">Change</span>
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-md flex items-center justify-center text-sky-500">
                    ✎
                </div>
            </div>
            <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Profile Picture</h3>
                <p className="text-slate-500 text-sm mb-3">PNG, JPG up to 5MB</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowMediaPicker(true)} className="rounded-md text-xs py-2 h-auto">Upload New</Button>
            </div>
        </div>

        <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
                <Input label="Full Name" value={user.name} onChange={e => setUser({...user, name: e.target.value})} required className="bg-slate-50/50 rounded-md" />
                <Input label="Phone Number" value={user.phone} onChange={e => setUser({...user, phone: e.target.value})} required disabled className="bg-slate-100 dark:bg-slate-800 opacity-60 cursor-not-allowed rounded-md" />
            </div>
            <Input label="Email Address" value={user.email || ""} onChange={e => setUser({...user, email: e.target.value})} className="bg-slate-50/50 rounded-md" />
        </div>
        
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button type="submit" className="rounded-md shadow-lg shadow-sky-500/20 px-8 py-3 text-base bg-sky-500 hover:bg-sky-600 text-white font-bold">Save Changes</Button>
        </div>
      </form>

      {showMediaPicker && (
        <MediaPicker 
            context="profile"
            onSelect={(url) => {
                setUser({ ...user, avatar: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
