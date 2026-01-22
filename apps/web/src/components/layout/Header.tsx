"use client";

import Link from "next/link";
import { Button } from "@repo/ui";
import { ThemeToggle } from "@/app/ThemeToggle";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* Top Offer Bar */}
      <div className="bg-sky-500 text-white py-2 text-center text-xs font-bold tracking-wide px-4">
        FREE SHIPPING ON ORDERS OVER ৳5,000 • WORLDWIDE DELIVERY
      </div>

      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm dark:bg-slate-950/95 dark:border-b dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="text-3xl font-sans font-bold text-sky-500 dark:text-sky-400 tracking-tight hover:text-sky-600 transition-colors">
                Prithibee
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-auto">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-2.5 rounded-2xl border border-sky-100 bg-sky-50/50 text-sky-900 placeholder-sky-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-sky-500 dark:focus:ring-sky-900"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Mobile Search Toggle */}
              <button 
                className="md:hidden p-2.5 rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors dark:bg-slate-800 dark:text-sky-400"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              <nav className="hidden lg:flex items-center gap-6 mr-2">
                <Link href="/products" className="text-sm font-bold text-sky-500 hover:text-sky-700 transition-colors dark:text-sky-400 dark:hover:text-sky-300">
                  Shop
                </Link>
                <Link href="/about" className="text-sm font-bold text-sky-500 hover:text-sky-700 transition-colors dark:text-sky-400 dark:hover:text-sky-300">
                  About
                </Link>
              </nav>

              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button className="text-sm font-bold py-2.5 px-6 h-auto rounded-2xl bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500">
                    Login
                  </Button>
                </Link>
              </div>
              <ThemeToggle className="hover:bg-sky-50 dark:hover:bg-slate-800 p-2.5 rounded-2xl text-sky-500 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay - Just a bar below header */}
      {isSearchOpen && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 p-4 md:hidden animate-in slide-in-from-top-2 duration-200 dark:bg-slate-950/95 dark:border-slate-800 shadow-lg">
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full px-5 py-3 rounded-2xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 text-base focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-sky-500 dark:focus:ring-sky-900"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
