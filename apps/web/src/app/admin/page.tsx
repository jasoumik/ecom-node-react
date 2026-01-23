"use client";

import { useEffect, useState } from "react";
import { Heading, Text } from "@repo/ui";
import { API_URL } from "@/lib/config";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/dashboard/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  const totalRevenue = stats.totalRevenue || 0;
  const totalOrders = stats.totalOrders || 0;
  const totalProducts = stats.totalProducts || 0;
  const totalUsers = stats.totalUsers || 0;
  const recentOrders = stats.recentOrders || [];

  return (
    <div className="space-y-8">
      <Heading size="xl" className="font-sans text-slate-900 dark:text-white">Dashboard</Heading>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`৳${totalRevenue.toLocaleString()}`} icon="💰" color="bg-green-50 text-green-600" />
        <StatCard title="Total Orders" value={totalOrders} icon="📦" color="bg-blue-50 text-blue-600" />
        <StatCard title="Total Products" value={totalProducts} icon="🛍️" color="bg-purple-50 text-purple-600" />
        <StatCard title="Total Customers" value={totalUsers} icon="👥" color="bg-orange-50 text-orange-600" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <Heading size="lg" className="mb-6 font-sans text-slate-900 dark:text-white p-6 pb-0">Recent Orders</Heading>
        <div className="overflow-x-auto p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="pb-4 font-bold text-slate-500 dark:text-slate-400">Order #</th>
                <th className="pb-4 font-bold text-slate-500 dark:text-slate-400">Customer</th>
                <th className="pb-4 font-bold text-slate-500 dark:text-slate-400">Amount</th>
                <th className="pb-4 font-bold text-slate-500 dark:text-slate-400">Status</th>
                <th className="pb-4 font-bold text-slate-500 dark:text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">No recent orders</td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">#{order.order_number}</td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-300">{order.customer_name}</td>
                    <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">৳{order.total_amount}</td>
                    <td className="py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
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

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}
