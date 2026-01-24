"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Heading } from "@repo/ui";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    try {
      setUser(JSON.parse(userStr));
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  if (!user) {
    return <FullScreenLoader />;
  }

  const navItems = [
    { label: "My Profile", href: "/profile", icon: "👤" },
    { label: "My Orders", href: "/profile/orders", icon: "📦" },
    { label: "Addresses", href: "/profile/addresses", icon: "📍" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f9ff] dark:bg-slate-950 py-12 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-md shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden sticky top-24">
              <div className="p-8 flex flex-col items-center text-center border-b border-slate-50 dark:border-slate-800 bg-gradient-to-b from-sky-50/50 to-white dark:from-slate-800/50 dark:to-slate-900">
                <div className="w-24 h-24 rounded-full p-1 bg-white dark:bg-slate-800 shadow-lg mb-4 ring-4 ring-sky-50 dark:ring-slate-700">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-4xl">👤</div>
                  )}
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">{user.name}</h3>
                <p className="text-sm text-slate-500 font-medium">{user.phone}</p>
              </div>
              
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 px-5 py-3 rounded-md text-sm font-bold transition-all duration-200 group ${
                        isActive
                          ? "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      }`}
                    >
                      <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? "scale-110" : ""}`}>{item.icon}</span>
                      {item.label}
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500"></div>}
                    </Link>
                  );
                })}
              </nav>
              
              <div className="p-4 mt-2">
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => {
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    router.push("/login");
                  }}
                  className="text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 dark:border-red-900/30 dark:hover:bg-red-900/10 rounded-md py-2.5 font-bold text-sm"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white dark:bg-slate-900 rounded-md shadow-sm border border-slate-100 dark:border-slate-800 p-8 lg:p-10 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
