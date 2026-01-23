"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Heading } from "@repo/ui";

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Products", href: "/admin/products" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Customers", href: "/admin/customers" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full overflow-y-auto">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <Heading size="lg" className="font-sans text-sky-500 dark:text-sky-400">Admin Panel</Heading>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-700">
          <Button 
            variant="outline" 
            fullWidth 
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-900 dark:hover:bg-red-900/20"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
