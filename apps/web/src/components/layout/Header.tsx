"use client";

import Link from "next/link";
import { Button } from "@repo/ui";
import { ThemeToggle } from "@/app/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { API_URL } from "@/lib/config";
import { useSettings } from "@/lib/settings-context";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField } from "@/lib/utils";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<string[]>([]);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(true);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mounted, setMounted] = useState(false);
  const settings = useSettings();
  const { t, language } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id) {
              setUser(parsed);
          } else {
              setUser(null);
          }
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    const storedSearches = localStorage.getItem("recentSearches");
    if (storedSearches) {
        try {
            setRecentSearches(JSON.parse(storedSearches));
        } catch (e) {}
    }

    checkUser();
    fetchCategories();
    window.addEventListener("storage", checkUser);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        window.removeEventListener("storage", checkUser);
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
      try {
          const res = await fetch(`${API_URL}/categories`);
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
          console.error("Failed to fetch categories");
      }
  };

  const toggleMobileCategory = (categoryId: string) => {
      setExpandedMobileCategories(prev => 
          prev.includes(categoryId) 
              ? prev.filter(id => id !== categoryId) 
              : [...prev, categoryId]
      );
  };

  // Debounce search suggestions
  useEffect(() => {
      const timer = setTimeout(() => {
          if (searchQuery.trim().length > 1) {
              fetchSuggestions(searchQuery);
          } else {
              setSuggestions([]);
          }
      }, 300);
      return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
      try {
          const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}&limit=5`);
          const data = await res.json();
          if (data.data && Array.isArray(data.data)) {
              const matches = data.data.filter((p: any) => p.name.toLowerCase().includes(query.toLowerCase()));
              setSuggestions(matches.slice(0, 5));
          }
      } catch (e) {
          setSuggestions([]);
      }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const performSearch = (query: string) => {
    if (query.trim()) {
      const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      
      setShowSuggestions(false);
      setIsSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const isLoggedIn = user && user.id;

  // Helper to get shop name
  const shopName = getLocalizedField({ name: settings.shop_name, name_bn: settings.shop_name_bn }, 'name', language);

  return (
    <>
      {/* Top Offer Bar */}
      <div className="bg-sky-500 text-white py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs font-bold tracking-wide">
          <div className="hidden sm:block">
            {t('free_shipping_offer', { threshold: settings.free_shipping_threshold })}
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <a href={`tel:${settings.shop_phone}`} className="flex items-center gap-1 hover:text-sky-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.536 0 1.52 1.115 2.988 1.264 3.186.149.198 2.19 3.349 5.302 4.695.74.326 1.317.521 1.767.664.75.238 1.433.204 1.975.124.603-.088 1.758-.718 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>{settings.shop_phone}</span>
            </a>
              <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-100 transition-colors">
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
          <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
            {/* Left: Mobile Menu & Logo */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button 
                    className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800 shrink-0"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>

                <Link href="/" className="text-xl sm:text-3xl font-sans font-bold text-sky-500 dark:text-sky-400 tracking-tight hover:text-sky-600 transition-colors truncate max-w-[120px] sm:max-w-none">
                    {shopName}
                </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 ml-4">
                {/* Categories Dropdown */}
                <div className="relative group">
                    <button className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-sky-500 transition-colors dark:text-slate-300 dark:hover:text-sky-400 py-4">
                        {t('categories')}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div className="absolute top-full left-0 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                        {categories.map((cat) => (
                            <div key={cat.id} className="relative group/sub">
                                <Link 
                                    href={`/products?category=${cat.id}`}
                                    className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400"
                                >
                                    {getLocalizedField(cat, 'name', language)}
                                    {cat.children && cat.children.length > 0 && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="-rotate-90"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    )}
                                </Link>
                                {cat.children && cat.children.length > 0 && (
                                    <div className="absolute top-0 left-full ml-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                        {cat.children.map((sub: any) => (
                                            <Link 
                                                key={sub.id}
                                                href={`/products?category=${sub.id}`}
                                                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400"
                                            >
                                                {getLocalizedField(sub, 'name', language)}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <Link href="/products" className="text-sm font-bold text-slate-600 hover:text-sky-500 transition-colors dark:text-slate-300 dark:hover:text-sky-400">{t('shop')}</Link>
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-auto relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>
              {/* Suggestions Dropdown */}
              {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      {suggestions.length > 0 ? (
                          <ul>
                                {suggestions.map((product) => (
                                    <li key={product.id}>
                                        <Link 
                                            href={`/products/${product.id}`}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
                                            onClick={() => setShowSuggestions(false)}
                                        >
                                            <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">
                                                <div className="w-full h-full bg-slate-200"></div>
                                            </div>
                                            <div className="flex-1 truncate">
                                                <div className="font-bold truncate">{getLocalizedField(product, 'name', language)}</div>
                                                <div className="text-xs text-slate-500">৳{product.price}</div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                      ) : null}
                  </div>
              )}
            </div>

            {/* Desktop Navigation - Right Side */}
            <nav className="hidden lg:flex items-center gap-6 mr-4">
                <Link href="/about" className="text-sm font-bold text-slate-600 hover:text-sky-500 transition-colors dark:text-slate-300 dark:hover:text-sky-400">{t('about')}</Link>
                <Link href="/contact" className="text-sm font-bold text-slate-600 hover:text-sky-500 transition-colors dark:text-slate-300 dark:hover:text-sky-400">{t('contact')}</Link>
            </nav>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Mobile Search Toggle */}
              <button 
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              {/* Language Toggle - Visible on Mobile now */}
              <LanguageToggle className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 text-xs sm:text-sm" />

              {/* Wishlist Icon */}
              <Link href="/wishlist" className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 hidden sm:block">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {mounted && wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link href="/cart" className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {mounted && totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-1 sm:gap-2">
                {isLoggedIn ? (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link href="/profile" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-sm border border-sky-200 dark:border-sky-800 group-hover:border-sky-400 transition-colors">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                    </Link>
                  </div>
                ) : (
                  <Link href="/login">
                    {/* Mobile: Icon Button */}
                    <span className="lg:hidden inline-flex p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                    </span>
                    {/* Desktop: Text Button */}
                    <span className="hidden lg:inline-flex">
                        <Button className="text-xs font-bold py-2 px-5 h-auto rounded-xl bg-sky-50 text-white hover:bg-sky-600 shadow-md shadow-sky-500/20 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500">
                        {t('login')}
                        </Button>
                    </span>
                  </Link>
                )}
              </div>
              {/* Theme Toggle - Visible on Mobile now */}
              <ThemeToggle className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl text-slate-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="absolute top-0 left-0 bottom-0 w-11/12 max-w-[300px] bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-left duration-300">
                  <div className="flex justify-between items-center mb-8">
                      <Link href="/" className="text-2xl font-sans font-bold text-sky-500 dark:text-sky-400" onClick={() => setIsMobileMenuOpen(false)}>
                        {shopName}
                      </Link>
                      <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                  </div>
                  
                  <nav className="space-y-4">
                      <Link href="/" className="block text-lg font-bold text-slate-800 dark:text-white" onClick={() => setIsMobileMenuOpen(false)}>{t('home')}</Link>
                      
                      {/* Wishlist in Menu */}
                      <Link href="/wishlist" className="flex items-center gap-3 text-lg font-bold text-slate-800 dark:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                          <span>Wishlist</span>
                          {mounted && wishlistItems.length > 0 && (
                              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                  {wishlistItems.length}
                              </span>
                          )}
                      </Link>

                      <div className="space-y-2">
                          <button 
                            onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                            className="flex items-center justify-between w-full text-lg font-bold text-slate-800 dark:text-white"
                          >
                              {t('categories')}
                              <span className={`text-sm transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`}>▼</span>
                          </button>
                          
                          {isMobileCategoriesOpen && (
                              <div className="pl-4 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2">
                                  {categories.map(cat => (
                                      <div key={cat.id}>
                                          <div className="flex items-center justify-between w-full text-left py-1">
                                              <Link 
                                                href={`/products?category=${cat.id}`}
                                                className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-1"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                              >
                                                  {getLocalizedField(cat, 'name', language)}
                                              </Link>
                                              {cat.children && cat.children.length > 0 && (
                                                  <button 
                                                    onClick={() => toggleMobileCategory(cat.id)}
                                                    className="p-1 text-slate-400"
                                                  >
                                                      <span className={`text-xs transition-transform block ${expandedMobileCategories.includes(cat.id) ? 'rotate-180' : ''}`}>▼</span>
                                                  </button>
                                              )}
                                          </div>
                                          
                                          {cat.children && cat.children.length > 0 && expandedMobileCategories.includes(cat.id) && (
                                              <div className="pl-4 space-y-1 mt-1 animate-in slide-in-from-top-1">
                                                  {cat.children.map((sub: any) => (
                                                      <Link 
                                                        key={sub.id}
                                                        href={`/products?category=${sub.id}`}
                                                        className="block text-xs text-slate-500 dark:text-slate-500 py-1"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                      >
                                                          {getLocalizedField(sub, 'name', language)}
                                                      </Link>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      <Link href="/products" className="block text-lg font-bold text-slate-800 dark:text-white" onClick={() => setIsMobileMenuOpen(false)}>{t('shop')}</Link>
                      <Link href="/about" className="block text-lg font-bold text-slate-800 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>{t('about')}</Link>
                      <Link href="/contact" className="block text-lg font-bold text-slate-800 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>{t('contact')}</Link>
                      
                      {/* Facebook Link in Menu */}
                      <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.333-4.669 1.212 0 2.493.216 2.493.216v2.733h-1.406c-1.492 0-1.956.926-1.956 1.874v2.25h3.072l-.487 3.47h-2.585v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                      </a>
                  </nav>
              </div>
          </div>
      )}

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed top-20 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md border-b border-sky-100 p-4 lg:hidden animate-in slide-in-from-top-2 duration-200 dark:bg-slate-950/95 dark:border-slate-800 shadow-lg">
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              placeholder={t('search_placeholder')}
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
