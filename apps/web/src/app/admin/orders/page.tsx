"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heading, Button } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders`);
    const data = await res.json();
    setOrders(data);
    setFilteredOrders(data);
  };

  const handleSearch = (query: string) => {
      if (!query) {
          setFilteredOrders(orders);
          return;
      }
      const lower = query.toLowerCase();
      setFilteredOrders(orders.filter(o => 
          o.order_number?.toString().includes(lower) || 
          o.customer_name?.toLowerCase().includes(lower) ||
          o.customer_phone?.includes(lower)
      ));
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        addToast(`Order marked as ${status}`, "success");
        fetchOrders();
      } else {
        addToast("Failed to update status", "error");
      }
    } catch (e) {
      addToast("Error updating status", "error");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Orders</Heading>
            <p className="text-xs text-slate-500">Manage orders</p>
        </div>
        <Button onClick={() => router.push("/admin/orders/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Create Order
        </Button>
      </div>

      <FilterBar onSearch={handleSearch} placeholder="Search orders..." />

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">No orders found.</td>
                    </tr>
                ) : (
                    filteredOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 text-xs">#{order.order_number}</td>
                        <td className="px-4 py-3">
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {order.order_source || 'Website'}
                            </span>
                        </td>
                        <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{order.customer_name}</div>
                        <div className="text-[10px] text-slate-500">{order.customer_phone}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white text-xs">৳{order.total_amount}</td>
                        <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold capitalize tracking-wide ${
                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                            order.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                            {order.status}
                        </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                        {order.status === 'pending' && (
                            <button 
                            onClick={() => handleStatusUpdate(order.id, 'completed')}
                            className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark as Completed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </button>
                        )}
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
