"use client";

import Link from "next/link";
import { Button } from "@repo/ui";
import { ThemeToggle } from "@/app/ThemeToggle";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <>
      {/* Top Offer Bar */}
      <div className="bg-sky-500 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-bold tracking-wide">
          <div className="hidden sm:block">
            FREE SHIPPING ON ORDERS OVER ৳5,000 • WORLDWIDE DELIVERY
          </div>
          <div className="flex items-center gap-4">
            <a href="https://wa.me/8801700000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.536 0 1.52 1.115 2.988 1.264 3.186.149.198 2.19 3.349 5.302 4.695.74.326 1.317.521 1.767.664.75.238 1.433.204 1.975.124.603-.088 1.758-.718 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>+880 1700-000000</span>
            </a>
            <a href="https://www.facebook.com/prithibeeofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.333-4.669 1.212 0 2.493.216 2.493.216v2.733h-1.406c-1.492 0-1.956.926-1.956 1.874v2.25h3.072l-.487 3.47h-2.585v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>
          </div>
        </div>
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
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

              {/* Cart Icon */}
              <Link href="/cart" className="relative p-2.5 rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors dark:bg-slate-800 dark:text-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {mounted && totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </Link>

              <nav className="hidden lg:flex items-center gap-6 mr-2">
                <Link href="/products" className="text-sm font-bold text-sky-500 hover:text-sky-700 transition-colors dark:text-sky-400 dark:hover:text-sky-300">
                  Shop
                </Link>
                <Link href="/about" className="text-sm font-bold text-sky-500 hover:text-sky-700 transition-colors dark:text-sky-400 dark:hover:text-sky-300">
                  About
                </Link>
              </nav>

              <div className="flex items-center gap-2 sm:gap-3">
                {user ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Link href="/profile" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-sm border border-sky-200 dark:border-sky-800 group-hover:border-sky-400 transition-colors">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 hidden sm:inline group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {user.name.split(' ')[0]}
                        </span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="p-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 shadow-sm dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900 transition-colors"
                      title="Logout"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button className="text-sm font-bold py-2.5 px-6 h-auto rounded-2xl bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500">
                      Login
                    </Button>
                  </Link>
                )}
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
