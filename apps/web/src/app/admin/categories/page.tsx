"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      
      // Flatten categories for table view
      const flatten = (cats: any[], level = 0): any[] => {
          return cats.reduce((acc, cat) => {
              acc.push({ ...cat, level });
              if (cat.children) acc.push(...flatten(cat.children, level + 1));
              return acc;
          }, []);
      };
      
      const flatList = flatten(Array.isArray(data) ? data : []);
      setCategories(flatList);
      setFilteredCategories(flatList);
    } catch (e) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
      if (!query) {
          setFilteredCategories(categories);
          return;
      }
      const lower = query.toLowerCase();
      setFilteredCategories(categories.filter(c => c.name.toLowerCase().includes(lower)));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure? This will delete all subcategories and products in this category.")) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Category deleted", "success");
        fetchCategories();
      } else {
        addToast("Failed to delete category", "error");
      }
    } catch (e) {
      addToast("Error deleting category", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Categories</Heading>
            <p className="text-xs text-slate-500">Manage product categories</p>
        </div>
        <Button onClick={() => router.push("/admin/categories/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Add Category
        </Button>
      </div>

      <FilterBar onSearch={handleSearch} placeholder="Search categories..." />

      <Table
        data={filteredCategories}
        onRowClick={(cat) => router.push(`/admin/categories/${cat.id}/edit`)}
        columns={[
          {
            header: "Name",
            cell: (cat) => (
              <div className="flex items-center gap-3" style={{ paddingLeft: `${cat.level * 20}px` }}>
                  {cat.image && (
                      <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                  )}
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {cat.level > 0 && <span className="text-slate-400 mr-1">↳</span>}
                      {cat.name}
                  </div>
              </div>
            )
          },
          {
            header: "Description",
            cell: (cat) => <span className="text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate block">{cat.description || "N/A"}</span>
          },
          {
            header: "Status",
            cell: (cat) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    cat.is_active 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (cat) => (
              <div className="flex justify-end gap-1">
                  <button 
                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/categories/${cat.id}/edit`); }}
                  className="p-1.5 rounded text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={(e) => handleDelete(cat.id, e)}
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
