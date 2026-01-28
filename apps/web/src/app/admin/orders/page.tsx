"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heading, Button } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FilterBar } from "@/components/ui/FilterBar";
import { Input } from "@/components/ui/Input";

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState<{ id: string, status: string } | null>(null);
  const [statusComment, setStatusComment] = useState("");
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
        const res = await fetch(`${API_URL}/orders`);
        const data = await res.json();
        setOrders(data);
        setFilteredOrders(data);
    } catch (e) {
        setOrders([]);
    } finally {
        setLoading(false);
    }
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

  const confirmStatusUpdate = async () => {
    if (!statusModal) return;
    
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch(`${API_URL}/orders/${statusModal.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            status: statusModal.status,
            comment: statusComment,
            userId: user?.id
        }),
      });
      
      if (res.ok) {
        addToast(`Order marked as ${statusModal.status}`, "success");
        fetchOrders();
        setStatusModal(null);
        setStatusComment("");
      } else {
        const err = await res.json();
        addToast(err.message || "Failed to update status", "error");
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

      <Table
        data={filteredOrders}
        columns={[
          {
            header: "ID",
            cell: (order) => <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">#{order.order_number}</span>
          },
          {
            header: "Source",
            cell: (order) => (
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {order.order_source || 'Website'}
                </span>
            )
          },
          {
            header: "Customer",
            cell: (order) => (
                <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{order.customer_name}</div>
                    <div className="text-[10px] text-slate-500">{order.customer_phone}</div>
                </div>
            )
          },
          {
            header: "Total",
            cell: (order) => <span className="font-bold text-slate-900 dark:text-white text-xs">৳{order.total_amount}</span>
          },
          {
            header: "Status",
            cell: (order) => (
                <select
                    value={order.status}
                    onChange={(e) => setStatusModal({ id: order.id, status: e.target.value })}
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded border-none focus:ring-0 cursor-pointer ${
                        order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                    {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (order) => (
              <div className="flex justify-end gap-1">
                  <button 
                    onClick={() => router.push(`/profile/orders/${order.id}`)} 
                    className="p-1.5 rounded text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                    title="View Invoice"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
              </div>
            )
          }
        ]}
      />

      {/* Status Update Modal */}
      {statusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Update Status</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Change status to <span className="font-bold uppercase">{statusModal.status}</span>?
                  </p>
                  
                  <div className="mb-6">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Comment (Optional)</label>
                      <textarea 
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
                          value={statusComment}
                          onChange={(e) => setStatusComment(e.target.value)}
                          rows={3}
                          placeholder="Add a note about this status change..."
                      />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => { setStatusModal(null); setStatusComment(""); }} className="rounded-lg py-2 px-4 text-xs h-auto">Cancel</Button>
                      <Button onClick={confirmStatusUpdate} className="rounded-lg py-2 px-4 text-xs h-auto bg-sky-500 text-white hover:bg-sky-600">Confirm Update</Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
