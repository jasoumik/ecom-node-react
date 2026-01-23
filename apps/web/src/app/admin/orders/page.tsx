"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders`);
    const data = await res.json();
    setOrders(data);
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
    <div className="space-y-8">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Orders</Heading>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Order #</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Customer</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Items</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Total</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {orders.map((order) => (
              <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">#{order.order_number}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 dark:text-white">{order.customer_name}</div>
                  <div className="text-xs text-slate-500">{order.customer_phone}</div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  {order.items?.length || 0} items
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">৳{order.total_amount}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {order.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 px-3 py-1.5 text-xs rounded-lg"
                      onClick={() => handleStatusUpdate(order.id, 'completed')}
                    >
                      Complete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
