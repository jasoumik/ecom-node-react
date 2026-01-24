"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading, Text } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
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
    try {
      const res = await fetch(`${API_URL}/products?page=${page}&limit=10`);
      const data = await res.json();
      // Handle both paginated and non-paginated responses for safety
      if (data.data && Array.isArray(data.data)) {
          setProducts(data.data);
          setMeta(data.meta);
      } else if (Array.isArray(data)) {
          setProducts(data);
          setMeta({ page: 1, totalPages: 1 });
      } else {
          setProducts([]);
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
      setProducts([]);
    }
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Products</Heading>
        <Button onClick={() => router.push("/admin/products/create")}>Add Product</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Image</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Name</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Price</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Stock</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {products.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No products found.</td>
                </tr>
            ) : (
                products.map((product) => {
                let imageUrl = "https://picsum.photos/seed/default/800/800";
                try {
                    const parsed = JSON.parse(product.images);
                    if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
                } catch (e) {}

                return (
                    <tr key={product.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                        <img src={imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {product.name}
                        {product.sku && <div className="text-xs text-slate-500 font-normal">SKU: {product.sku}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <div>৳{product.price}</div>
                        {product.old_price && <div className="text-xs text-slate-400 line-through">৳{product.old_price}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{product.stock}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                        variant="outline" 
                        className="px-3 py-1.5 text-xs rounded-lg"
                        onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                        >
                        Edit
                        </Button>
                        <Button 
                        variant="outline" 
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 px-3 py-1.5 text-xs rounded-lg"
                        onClick={() => handleDelete(product.id)}
                        >
                        Delete
                        </Button>
                    </td>
                    </tr>
                );
                })
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <Button 
                variant="outline" 
                disabled={meta.page === 1}
                onClick={() => fetchProducts(meta.page - 1)}
            >
                Previous
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {meta.page} of {meta.totalPages}
            </span>
            <Button 
                variant="outline" 
                disabled={meta.page === meta.totalPages}
                onClick={() => fetchProducts(meta.page + 1)}
            >
                Next
            </Button>
        </div>
      </div>
    </div>
  );
}
