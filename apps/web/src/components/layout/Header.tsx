"use client";

import Link from "next/link";
import { Button } from "@repo/ui";
import { ThemeToggle } from "@/app/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight hover:opacity-80 transition-opacity">
              Prithibee
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors dark:text-slate-300 dark:hover:text-rose-400">
                Shop
              </Link>
              <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors dark:text-slate-300 dark:hover:text-rose-400">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors dark:text-slate-300 dark:hover:text-rose-400">
                Contact
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/login">
                <Button variant="secondary" className="text-sm font-semibold py-2.5 px-6 h-auto rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="text-sm font-semibold py-2.5 px-6 h-auto rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">Sign Up</Button>
              </Link>
            </div>
            <ThemeToggle className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5 rounded-xl" />
          </div>
        </div>
      </div>
    </header>
  );
}
