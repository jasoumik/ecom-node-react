"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
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
      // Flatten tree for table view or show as is? 
      // For simplicity, let's just show top level or flatten.
      // Assuming API returns tree, let's flatten it for the table or just show root.
      // Actually, let's just show them. If it's a tree, we might need recursion.
      // For now, let's assume flat list or just show root categories.
      // If the API returns a tree, we should flatten it for the table.
      
      const flatten = (cats: any[], level = 0): any[] => {
          return cats.reduce((acc, cat) => {
              acc.push({ ...cat, level });
              if (cat.children) {
                  acc.push(...flatten(cat.children, level + 1));
              }
              return acc;
          }, []);
      };
      
      setCategories(flatten(Array.isArray(data) ? data : []));
    } catch (e) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="lg" className="font-sans text-slate-800 dark:text-white mb-1">Categories</Heading>
            <p className="text-sm text-slate-500">Manage product categories</p>
        </div>
        <Button onClick={() => router.push("/admin/categories/create")} className="rounded-xl shadow-lg shadow-sky-500/20">
            + Add Category
        </Button>
      </div>

      <Table
        data={categories}
        columns={[
          {
            header: "Name",
            cell: (cat) => (
              <div className="flex items-center gap-3" style={{ paddingLeft: `${cat.level * 20}px` }}>
                  {cat.image && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700 shrink-0">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {cat.level > 0 && <span className="text-slate-400 mr-2">↳</span>}
                    {cat.name}
                  </div>
              </div>
            )
          },
          {
            header: "Description",
            accessorKey: "description",
            className: "text-slate-600 dark:text-slate-300 text-sm max-w-xs truncate"
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (cat) => (
              <div className="flex justify-end gap-2">
                  <button 
                  onClick={() => router.push(`/admin/categories/${cat.id}/edit`)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={() => handleDelete(cat.id)}
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
