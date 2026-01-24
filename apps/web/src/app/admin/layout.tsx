"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Heading } from "@repo/ui";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "admin") {
        router.push("/");
        return;
      }
      setIsAuthorized(true);
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  if (!isAuthorized) {
    return <FullScreenLoader />;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Products", href: "/admin/products", icon: "🛍️" },
    { label: "Categories", href: "/admin/categories", icon: "📂" },
    { label: "Orders", href: "/admin/orders", icon: "📦" },
    { label: "Customers", href: "/admin/customers", icon: "👥" },
    { label: "Banners", href: "/admin/banners", icon: "🖼️" },
    { label: "Media", href: "/admin/media", icon: "📁" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fa] dark:bg-slate-950 flex font-sans">
      {/* Sidebar - Able Pro Inspired */}
      <aside className="w-[280px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 fixed h-full overflow-y-auto z-30 transition-all duration-300 hidden lg:block">
        <div className="h-[80px] flex items-center px-8 border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-sky-500/20">
              P
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Prithibee</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">Navigation</div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-r-full"></div>
                  )}
                  <span className={`text-lg transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6 mt-auto absolute bottom-0 w-full">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-center mb-4">
             <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-lg shadow-sm">👋</div>
             <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Need Help?</h4>
             <p className="text-xs text-slate-500 mb-3">Check our docs</p>
             <button className="text-xs font-bold text-sky-600 hover:underline">Documentation</button>
          </div>
          <Button 
            variant="outline" 
            fullWidth 
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl py-3 text-sm"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[280px] transition-all duration-300">
        {/* Top Header */}
        <header className="h-[80px] bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                    {pathname.split('/').pop() || 'Dashboard'}
                </h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    🔔
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 p-0.5">
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center font-bold text-sky-600 text-sm">
                        A
                    </div>
                </div>
            </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}
