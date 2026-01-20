"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading, Text } from "@repo/ui";
import { Input } from "@/components/ui/Input";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "", images: "", category: "", stock: "" });
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user || JSON.parse(user).role !== 'admin') {
        router.push("/login");
        return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:3000/api/products");
    const data = await res.json();
    setProducts(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = newProduct.images.split(",").map(s => s.trim());
    await fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newProduct, images: imagesArray }),
    });
    setIsCreating(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:3000/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Heading className="dark:text-white">Product Management</Heading>
          <Button onClick={() => setIsCreating(!isCreating)}>{isCreating ? "Cancel" : "Add Product"}</Button>
        </div>

        {isCreating && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md mb-8 border border-slate-100 dark:border-slate-700">
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
              <Input label="Price" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
              <Input label="Category" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required />
              <Input label="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                  value={newProduct.description} 
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                  required 
                />
              </div>
              <Input label="Image URLs (comma separated)" className="md:col-span-2" value={newProduct.images} onChange={e => setNewProduct({...newProduct, images: e.target.value})} />
              <Button type="submit" className="md:col-span-2 py-3 font-bold">Save Product</Button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow hover:shadow-lg transition border border-slate-100 dark:border-slate-700">
              {product.images && product.images[0] && (
                <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
              )}
              <h3 className="font-bold text-lg dark:text-white mb-1">{product.name}</h3>
              <p className="text-rose-500 font-bold text-xl mb-1">৳{product.price}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider font-medium">{product.category}</p>
              <Button variant="secondary" onClick={() => handleDelete(product.id)} className="w-full text-red-500 border-red-200 hover:bg-red-50 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-slate-600">Delete</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
