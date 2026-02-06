"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@repo/ui";
import { Table } from "@/components/ui/Table";
import { API_URL } from "@/lib/config";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { getImageUrl } from "@/lib/utils";

export default function BundlesPage() {
  const [bundles, setBundles] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const res = await fetch(`${API_URL}/bundles`);
      const data = await res.json();
      setBundles(data);
    } catch (error) {
      console.error("Failed to fetch bundles", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    try {
      const res = await fetch(`${API_URL}/bundles/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Bundle deleted successfully", "success");
        fetchBundles();
      } else {
        addToast("Failed to delete bundle", "error");
      }
    } catch (error) {
      addToast("Error deleting bundle", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Bundles & Combos</Heading>
        <Link href="/admin/bundles/create">
          <Button className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-4 text-sm h-auto">+ Add Bundle</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table
          data={bundles}
          columns={[
            { 
                header: "Image", 
                cell: (bundle: any) => (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {bundle.image ? (
                            <img src={getImageUrl(bundle.image)} alt={bundle.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                        )}
                    </div>
                )
            },
            { header: "Title", accessorKey: "title", className: "font-medium text-slate-900 dark:text-white" },
            { header: "Price", cell: (b: any) => `৳${b.price}`, className: "text-slate-600 dark:text-slate-400" },
            { header: "Items", cell: (b: any) => b.items?.length || 0, className: "text-slate-600 dark:text-slate-400" },
            { 
                header: "Status", 
                cell: (b: any) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${b.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {b.is_active ? 'Active' : 'Inactive'}
                    </span>
                )
            },
            {
              header: "Actions",
              cell: (bundle: any) => (
                <div className="flex gap-2">
                  <Link href={`/admin/bundles/${bundle.id}/edit`}>
                    <Button variant="outline" className="h-8 px-3 text-xs">Edit</Button>
                  </Link>
                  <Button 
                    variant="outline"
                    className="h-8 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    onClick={() => handleDelete(bundle.id)}
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
