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
    // Force update for Header
    window.dispatchEvent(new Event("storage"));
    // Use window.location to ensure full state reset
    window.location.href = "/login";
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <Heading size="xl" className="font-sans text-slate-900 dark:text-white font-bold">{t('my_profile')}</Heading>
            <Button variant="outline" onClick={handleLogout} className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 py-3 px-6 text-sm sm:py-2 sm:px-5">
                {t('logout')}
            </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 text-center sticky top-24">
                    <div className="w-24 h-24 rounded-full bg-sky-100 dark:bg-sky-900/30 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-sky-600 dark:text-sky-400 border-4 border-white dark:border-slate-700 shadow-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user?.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{user?.phone}</p>
                    <div className="flex justify-center">
                        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                            {t('verified_buyer')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="md:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('my_orders')}</h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">{orders.length} Orders</span>
                    </div>
                    
                    {orders.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                            <div className="text-4xl mb-3">🛍️</div>
                            <p className="mb-4">No orders found yet.</p>
                            <a href="/products">
                                <Button className="rounded-xl py-2 px-6">{t('start_shopping')}</Button>
                            </a>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {orders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                                                #{order.order_number}
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                                    order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                                    order.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                    'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatDate(order.created_at)} • {order.items?.length || 0} Items
                                            </div>
                                        </div>
                                        <div className="text-base font-bold text-slate-900 dark:text-white">
                                            ৳{order.total_amount}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-50 dark:border-slate-700/50 mt-2">
                                        <Button 
                                            variant="outline" 
                                            className="w-full sm:w-auto rounded-xl text-xs py-2.5 px-4 flex items-center justify-center gap-2"
                                            onClick={() => router.push(`/track/${order.id}`)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                                            {t('track_order')}
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            className="w-full sm:w-auto rounded-xl text-xs py-2.5 px-4 flex items-center justify-center gap-2"
                                            onClick={() => router.push(`/profile/orders/${order.id}`)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                            {t('invoice')}
                                        </Button>
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
