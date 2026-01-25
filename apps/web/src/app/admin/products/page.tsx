"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { Table } from "@/components/ui/Table";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user || JSON.parse(user).role !== 'admin') {
        router.push("/login");
        return;
    }
    fetchProducts(1);
  }, []);

  const fetchProducts = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products?page=${page}&limit=10`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
          setProducts(data.data);
          setFilteredProducts(data.data);
          setMeta(data.meta);
      } else if (Array.isArray(data)) {
          setProducts(data);
          setFilteredProducts(data);
          setMeta({ page: 1, totalPages: 1 });
      } else {
          setProducts([]);
          setFilteredProducts([]);
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
      if (!query) {
          setFilteredProducts(products);
          return;
      }
      const lower = query.toLowerCase();
      setFilteredProducts(products.filter(p => 
          p.name.toLowerCase().includes(lower) || 
          p.sku?.toLowerCase().includes(lower)
      ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Product deleted", "success");
        fetchProducts(meta.page);
      } else {
        addToast("Failed to delete product", "error");
      }
    } catch (e) {
      addToast("Error deleting product", "error");
    }
  };

  if (loading && products.length === 0) return <FullScreenLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="lg" className="font-sans text-slate-800 dark:text-white mb-1">Products</Heading>
            <p className="text-sm text-slate-500">Manage your product inventory</p>
        </div>
        <Button onClick={() => router.push("/admin/products/create")} className="rounded-xl shadow-lg shadow-sky-500/20">
            + Add Product
        </Button>
      </div>

      <FilterBar onSearch={handleSearch} placeholder="Search products by name or SKU..." />

      <Table
        data={filteredProducts}
        columns={[
          {
            header: "Product",
            cell: (product) => {
              let imageUrl = "https://picsum.photos/seed/default/800/800";
              try {
                  const parsed = JSON.parse(product.images);
                  if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
              } catch (e) {}
              return (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 dark:border-slate-700 shrink-0">
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</div>
                        {product.sku && <div className="text-xs text-slate-400 font-medium mt-0.5">SKU: {product.sku}</div>}
                    </div>
                </div>
              );
            }
          },
          {
            header: "Price",
            cell: (product) => (
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">৳{product.price}</div>
                {product.old_price && <div className="text-xs text-slate-400 line-through">৳{product.old_price}</div>}
              </div>
            )
          },
          {
            header: "Stock",
            cell: (product) => (
              <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                  product.stock > 10 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                  : product.stock > 0 
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                  {product.stock} in stock
              </div>
            )
          },
          {
            header: "Status",
            cell: (product) => (
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                    product.is_active 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (product) => (
              <div className="flex justify-end gap-2">
                  <button 
                  onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
              </div>
            )
          }
        ]}
        mobileRenderer={(product) => {
            let imageUrl = "https://picsum.photos/seed/default/800/800";
            try {
                const parsed = JSON.parse(product.images);
                if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
            } catch (e) {}
            
            return (
                <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{product.name}</h4>
                                <div className="text-xs text-slate-500 mt-0.5">SKU: {product.sku || '-'}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-900 dark:text-white text-sm">৳{product.price}</div>
                                {product.old_price && <div className="text-xs text-slate-400 line-through">৳{product.old_price}</div>}
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-2">
                                <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                    product.stock > 10 
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                    {product.stock} left
                                </div>
                                <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                    product.is_active 
                                    ? 'bg-green-50 text-green-600' 
                                    : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => router.push(`/admin/products/${product.id}/edit`)} className="text-sky-600 text-xs font-bold">Edit</button>
                                <button onClick={() => handleDelete(product.id)} className="text-red-600 text-xs font-bold">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }}
      />
      
      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
          <Button 
              variant="outline" 
              disabled={meta.page === 1}
              onClick={() => fetchProducts(meta.page - 1)}
              className="rounded-xl"
          >
              Previous
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Page {meta.page} of {meta.totalPages}
          </span>
          <Button 
              variant="outline" 
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchProducts(meta.page + 1)}
              className="rounded-xl"
          >
              Next
          </Button>
      </div>
    </div>
  );
}
