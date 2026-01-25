"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const custs = data.filter((u: any) => u.role === 'customer');
        setCustomers(custs);
        setFilteredCustomers(custs);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (e) {
      setCustomers([]);
    }
  };

  const handleSearch = (query: string) => {
      if (!query) {
          setFilteredCustomers(customers);
          return;
      }
      const lower = query.toLowerCase();
      setFilteredCustomers(customers.filter(c => 
          c.name.toLowerCase().includes(lower) || 
          c.phone?.includes(lower) ||
          c.email?.toLowerCase().includes(lower)
      ));
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Heading size="lg" className="font-sans text-slate-800 dark:text-white mb-1">Customers</Heading>
        <p className="text-sm text-slate-500">View and manage your customer base</p>
      </div>

      <FilterBar onSearch={handleSearch} placeholder="Search customers by name, phone or email..." />

      <Table
        data={filteredCustomers}
        columns={[
          {
            header: "Name",
            cell: (customer) => (
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs">
                      {customer.name.charAt(0)}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{customer.name}</div>
              </div>
            )
          },
          {
            header: "Phone",
            accessorKey: "phone",
            className: "text-slate-600 dark:text-slate-300 text-sm"
          },
          {
            header: "Email",
            cell: (customer) => <span className="text-slate-600 dark:text-slate-300 text-sm">{customer.email || '-'}</span>
          },
          {
            header: "Joined",
            cell: (customer) => <span className="text-slate-500 dark:text-slate-400 text-sm">{new Date(customer.created_at).toLocaleDateString()}</span>
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (customer) => (
              <div className="flex justify-end">
                  <button 
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
              </div>
            )
          }
        ]}
        mobileRenderer={(customer) => (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                        {customer.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{customer.name}</div>
                        <div className="text-xs text-slate-500">{customer.phone}</div>
                    </div>
                </div>
                <button onClick={() => handleDelete(customer.id)} className="text-red-500 text-xs font-bold">Delete</button>
            </div>
        )}
      />
    </div>
  );
}
