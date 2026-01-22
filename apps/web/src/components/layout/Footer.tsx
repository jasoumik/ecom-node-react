import Link from "next/link";
import { Text } from "@repo/ui";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-brand-secondary rounded-full flex items-center justify-center text-brand-primary text-2xl font-bold">
                P
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Prithibee
              </span>
            </Link>
            <Text className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Your trusted partner in parenting. We provide premium, safe, and sustainable products for your little ones, delivered with love.
            </Text>
            <div className="flex gap-4">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white transition-all">
                  <span className="sr-only">{social}</span>
                  {/* Simple dot for icon placeholder */}
                  <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                </a>
              ))}
            </div>
          </div>
          
          {/* Links Columns */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">Shop</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              <li><Link href="/products" className="hover:text-brand-primary transition-colors">All Products</Link></li>
              <li><Link href="/products?category=diapers" className="hover:text-brand-primary transition-colors">Diapers & Wipes</Link></li>
              <li><Link href="/products?category=skincare" className="hover:text-brand-primary transition-colors">Skincare</Link></li>
              <li><Link href="/products?category=clothing" className="hover:text-brand-primary transition-colors">Clothing</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              <li><Link href="/about" className="hover:text-brand-primary transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-brand-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/careers" className="hover:text-brand-primary transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-brand-primary transition-colors">Parenting Blog</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-3">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">Newsletter</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary dark:bg-slate-900 dark:border-slate-800"
              />
              <button className="px-6 py-3 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20">
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} Prithibee. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <Link href="/privacy" className="hover:text-brand-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
