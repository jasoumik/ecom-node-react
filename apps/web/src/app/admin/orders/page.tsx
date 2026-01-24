"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Heading size="lg" className="font-sans text-slate-800 dark:text-white mb-1">Orders</Heading>
        <p className="text-sm text-slate-500">Track and manage customer orders</p>
      </div>

      <Table
        data={orders}
        columns={[
          {
            header: "Order #",
            cell: (order) => <span className="font-medium text-slate-700 dark:text-slate-300">#{order.order_number}</span>
          },
          {
            header: "Customer",
            cell: (order) => (
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{order.customer_name}</div>
                <div className="text-xs text-slate-500">{order.customer_phone}</div>
              </div>
            )
          },
          {
            header: "Items",
            cell: (order) => <span className="text-slate-600 dark:text-slate-300 text-sm">{order.items?.length || 0} items</span>
          },
          {
            header: "Total",
            cell: (order) => <span className="font-bold text-slate-900 dark:text-white text-sm">৳{order.total_amount}</span>
          },
          {
            header: "Status",
            cell: (order) => (
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold capitalize tracking-wide ${
                  order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                  order.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                  {order.status}
              </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (order) => (
              <div className="flex justify-end">
                {order.status === 'pending' && (
                    <button 
                    onClick={() => handleStatusUpdate(order.id, 'completed')}
                    className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Mark as Completed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </button>
                )}
              </div>
            )
          }
        ]}
        mobileRenderer={(order) => (
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">#{order.order_number}</div>
                        <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                        {order.status}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-sm font-medium text-slate-800 dark:text-white">{order.customer_name}</div>
                        <div className="text-xs text-slate-500">{order.items?.length || 0} items</div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white">৳{order.total_amount}</div>
                        {order.status === 'pending' && (
                            <button 
                                onClick={() => handleStatusUpdate(order.id, 'completed')}
                                className="text-emerald-600 text-xs font-bold mt-1"
                            >
                                Mark Complete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}
      />
    </div>
  );
}
