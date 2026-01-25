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
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.role !== "admin") {
        router.push("/");
        return;
      }
      setUser(parsedUser);
      setIsAuthorized(true);
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  // Close mobile menu on route change
  useEffect(() => {
      setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!isAuthorized) {
    return <FullScreenLoader />;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Products", href: "/admin/products", icon: "🛍️" },
    { label: "Batches", href: "/admin/batches", icon: "📦" },
    { label: "Stock Ledger", href: "/admin/stock-ledger", icon: "📜" },
    { label: "Categories", href: "/admin/categories", icon: "📂" },
    { label: "Brands", href: "/admin/brands", icon: "🏷️" },
    { label: "Countries", href: "/admin/countries", icon: "🏳️" },
    { label: "Orders", href: "/admin/orders", icon: "📦" },
    { label: "Customers", href: "/admin/customers", icon: "👥" },
    { label: "Banners", href: "/admin/banners", icon: "🖼️" },
    { label: "Media", href: "/admin/media", icon: "📁" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fa] dark:bg-slate-950 flex font-sans overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-[240px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-50 transition-transform duration-300 fixed lg:static h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-[60px] flex items-center justify-between px-5 border-b border-slate-50 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center text-white text-base font-bold shadow-md shadow-sky-500/20">
              P
            </div>
            <span className="text-base font-bold text-slate-800 dark:text-white tracking-tight">Prithibee Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-500">
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Menu</div>
          <nav className="space-y-0.5">
            <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all duration-200 group"
            >
                <span className="text-base transition-transform duration-300 group-hover:scale-110">🏠</span>
                Visit Store
            </Link>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-r-full"></div>
                  )}
                  <span className={`text-base transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <Button 
            variant="outline" 
            fullWidth 
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg py-2 text-xs h-auto"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
        {/* Top Header - Compact */}
        <header className="h-[60px] bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <button 
                    className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize truncate">
                    {pathname.split('/').pop() || 'Dashboard'}
                </h2>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-sm cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    🔔
                </div>
                <Link href="/admin/profile">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 p-0.5 cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center font-bold text-sky-600 text-xs overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase() || 'A'
                            )}
                        </div>
                    </div>
                </Link>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <div className="max-w-[1600px] mx-auto">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
}
