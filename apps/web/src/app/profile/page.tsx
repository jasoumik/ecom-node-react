"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    
    try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchOrders(parsedUser.id);
    } catch (e) {
        router.push("/login");
    }
  }, []);

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/my-orders?userId=${userId}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <Heading size="xl" className="font-sans text-slate-900 dark:text-white font-bold">{t('my_profile')}</Heading>
            <Button variant="outline" onClick={handleLogout} className="rounded-xl">{t('logout')}</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                    <div className="w-24 h-24 rounded-full bg-sky-100 dark:bg-sky-900/30 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-sky-600 dark:text-sky-400">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user?.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{user?.phone}</p>
                    <div className="flex justify-center">
                        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider dark:bg-emerald-900/20 dark:text-emerald-400">
                            {t('verified_buyer')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="md:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('my_orders')}</h3>
                    </div>
                    
                    {orders.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                            No orders found. <a href="/products" className="text-sky-500 hover:underline">Start shopping</a>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {orders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                                                {t('order_id')} #{order.order_number}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatDate(order.created_at)}
                                            </div>
                                        </div>
                                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                            order.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                                            ৳{order.total_amount}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                className="rounded-xl text-xs py-1.5 px-3 h-auto"
                                                onClick={() => router.push(`/track/${order.id}`)}
                                            >
                                                {t('track_order')}
                                            </Button>
                                            <Button 
                                                variant="secondary" 
                                                className="rounded-xl text-xs py-1.5 px-3 h-auto"
                                                onClick={() => router.push(`/profile/orders/${order.id}`)}
                                            >
                                                {t('view')} {t('invoice')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
