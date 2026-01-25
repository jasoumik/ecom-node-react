"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_URL}/brands`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setBrands(list);
      setFilteredBrands(list);
    } catch (e) {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
      if (!query) {
          setFilteredBrands(brands);
          return;
      }
      const lower = query.toLowerCase();
      setFilteredBrands(brands.filter(b => 
          b.name.toLowerCase().includes(lower)
      ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/brands/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Brand deleted", "success");
        fetchBrands();
      } else {
        addToast("Failed to delete brand", "error");
      }
    } catch (e) {
      addToast("Error deleting brand", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Brands</Heading>
            <p className="text-xs text-slate-500">Manage product brands</p>
        </div>
        <Button onClick={() => router.push("/admin/brands/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Add Brand
        </Button>
      </div>

      <FilterBar onSearch={handleSearch} placeholder="Search brands..." />

      <Table
        data={filteredBrands}
        columns={[
          {
            header: "Logo",
            cell: (brand) => (
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">
                {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold">
                        {brand.name.charAt(0)}
                    </div>
                )}
              </div>
            )
          },
          {
            header: "Name",
            accessorKey: "name",
            className: "font-bold text-slate-900 dark:text-white text-xs"
          },
          {
            header: "Description",
            accessorKey: "description",
            className: "text-slate-600 dark:text-slate-300 text-xs max-w-xs truncate"
          },
          {
            header: "Status",
            cell: (brand) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    brand.is_active 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                    {brand.is_active ? 'Active' : 'Inactive'}
                </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (brand) => (
              <div className="flex justify-end gap-1">
                  <button 
                  onClick={() => router.push(`/admin/brands/${brand.id}/edit`)}
                  className="p-1.5 rounded text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={() => handleDelete(brand.id)}
                  className="p-1.5 rounded text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
