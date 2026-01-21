"use client";

import Link from "next/link";
import { Button } from "@repo/ui";
import { ThemeToggle } from "@/app/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm dark:bg-slate-950/95 dark:border-b dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight hover:text-rose-500 transition-colors">
              Prithibee
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors dark:text-slate-300 dark:hover:text-rose-400">
                Shop
              </Link>
              <Link href="/about" className="text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors dark:text-slate-300 dark:hover:text-rose-400">
                About
              </Link>
              <Link href="/contact" className="text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors dark:text-slate-300 dark:hover:text-rose-400">
                Contact
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/login">
                <Button variant="secondary" className="text-sm font-bold py-2.5 px-6 h-auto rounded-xl border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="text-sm font-bold py-2.5 px-6 h-auto rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">Sign Up</Button>
              </Link>
            </div>
            <ThemeToggle className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5 rounded-xl text-slate-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
