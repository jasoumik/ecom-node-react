"use client";

import { useEffect, useState } from "react";
import { Heading, Text } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/dashboard/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullScreenLoader />;
  if (!stats) return <div className="p-8 text-center text-slate-500">Failed to load stats.</div>;

  const totalRevenue = stats.totalRevenue || 0;
  const totalOrders = stats.totalOrders || 0;
  const totalProducts = stats.totalProducts || 0;
  const totalUsers = stats.totalUsers || 0;
  const recentOrders = stats.recentOrders || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Revenue" 
            value={`৳${totalRevenue.toLocaleString()}`} 
            icon="💰" 
            color="from-emerald-400 to-teal-500" 
            trend="+12.5%" 
            trendUp={true}
        />
        <StatCard 
            title="Total Orders" 
            value={totalOrders} 
            icon="📦" 
            color="from-blue-400 to-indigo-500" 
            trend="+5.2%" 
            trendUp={true}
        />
        <StatCard 
            title="Total Products" 
            value={totalProducts} 
            icon="🛍️" 
            color="from-violet-400 to-purple-500" 
            trend="+2.1%" 
            trendUp={true}
        />
        <StatCard 
            title="Total Customers" 
            value={totalUsers} 
            icon="👥" 
            color="from-amber-400 to-orange-500" 
            trend="+8.4%" 
            trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Orders</h3>
                <button className="text-sm font-medium text-sky-500 hover:text-sky-600">View All</button>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                    <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.length === 0 ? (
                    <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">No recent orders found</td>
                    </tr>
                ) : (
                    recentOrders.map((order: any) => (
                    <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">#{order.order_number}</td>
                        <td className="px-6 py-4">
                            <div className="font-medium text-slate-900 dark:text-white">{order.customer_name}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">৳{order.total_amount}</td>
                        <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide ${
                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                            order.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                            {order.status}
                        </span>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Analytics</h3>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">🛒</div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Sales</div>
                            <div className="font-bold text-slate-900 dark:text-white">Total Sales</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white">৳{totalRevenue.toLocaleString()}</div>
                        <div className="text-xs text-green-500">+12%</div>
                    </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">👥</div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Users</div>
                            <div className="font-bold text-slate-900 dark:text-white">New Customers</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white">{totalUsers}</div>
                        <div className="text-xs text-green-500">+5%</div>
                    </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, trendUp }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-[100px] transition-transform group-hover:scale-110 duration-500`}></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20`}>
                {icon}
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                </div>
            )}
        </div>
        <div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1 tracking-tight">{value}</div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
        </div>
      </div>
    </div>
  );
}
