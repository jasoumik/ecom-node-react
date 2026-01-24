"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/banners`);
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (e) {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Banner deleted", "success");
        fetchBanners();
      } else {
        addToast("Failed to delete banner", "error");
      }
    } catch (e) {
      addToast("Error deleting banner", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="lg" className="font-sans text-slate-800 dark:text-white mb-1">Banners</Heading>
            <p className="text-sm text-slate-500">Manage homepage banners</p>
        </div>
        <Button onClick={() => router.push("/admin/banners/create")} className="rounded-xl shadow-lg shadow-sky-500/20">
            + Add Banner
        </Button>
      </div>

      <Table
        data={banners}
        columns={[
          {
            header: "Image",
            cell: (banner) => (
              <div className="w-32 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              </div>
            )
          },
          {
            header: "Title",
            accessorKey: "title",
            className: "font-bold text-slate-900 dark:text-white"
          },
          {
            header: "Link",
            accessorKey: "link",
            className: "text-slate-500 text-sm"
          },
          {
            header: "Status",
            cell: (banner) => (
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                  banner.is_active 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                  {banner.is_active ? 'Active' : 'Inactive'}
              </span>
            )
          },
          {
            header: "Order",
            accessorKey: "order",
            className: "text-slate-600 dark:text-slate-300"
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (banner) => (
              <div className="flex justify-end gap-2">
                  <button 
                  onClick={() => router.push(`/admin/banners/${banner.id}/edit`)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
