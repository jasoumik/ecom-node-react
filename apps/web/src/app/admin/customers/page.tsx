"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setCustomers(data.filter((u: any) => u.role === 'customer'));
      } else {
        console.error("API returned non-array for users:", data);
        setCustomers([]);
      }
    } catch (e) {
      console.error("Failed to fetch customers", e);
      setCustomers([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Customer deleted", "success");
        fetchCustomers();
      } else {
        addToast("Failed to delete customer", "error");
      }
    } catch (e) {
      addToast("Error deleting customer", "error");
    }
  };

  return (
    <div className="space-y-8">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Customers</Heading>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Name</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Phone</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Email</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Joined</th>
              <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{customer.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{customer.phone}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{customer.email || '-'}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="outline" 
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 px-3 py-1.5 text-xs rounded-lg"
                      onClick={() => handleDelete(customer.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
