import Link from "next/link";
import { Text } from "@repo/ui";

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
              Prithibee
            </Link>
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              The purest care for mother and child. Organic, sustainable, and crafted with love.
            </Text>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/products" className="hover:text-rose-500">All Products</Link></li>
              <li><Link href="/products?category=diapers" className="hover:text-rose-500">Diapers</Link></li>
              <li><Link href="/products?category=skincare" className="hover:text-rose-500">Skincare</Link></li>
              <li><Link href="/products?category=clothing" className="hover:text-rose-500">Clothing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/about" className="hover:text-rose-500">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-rose-500">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-rose-500">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-rose-500">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-rose-500">Instagram</a></li>
              <li><a href="#" className="hover:text-rose-500">Facebook</a></li>
              <li><a href="#" className="hover:text-rose-500">Twitter</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-sm text-slate-500 dark:text-slate-500">
          © {new Date().getFullYear()} Prithibee. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
