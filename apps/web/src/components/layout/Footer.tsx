import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-sans font-bold text-sky-500 dark:text-sky-400 tracking-tight">
              Prithibee
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Your trusted partner in parenting. We provide premium, safe, and sustainable products for mothers and babies across Bangladesh.
            </p>
            <div className="flex gap-4 pt-2">
              {/* Social Icons */}
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-sky-500 hover:text-white transition-all">
                f
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-sky-500 hover:text-white transition-all">
                i
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-sky-500 hover:text-white transition-all">
                y
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Shop</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/products" className="hover:text-sky-500 transition-colors">All Products</Link></li>
              <li><Link href="/products?sort=new" className="hover:text-sky-500 transition-colors">New Arrivals</Link></li>
              <li><Link href="/products?sort=best_selling" className="hover:text-sky-500 transition-colors">Best Sellers</Link></li>
              <li><Link href="/bundles" className="hover:text-sky-500 transition-colors">Bundles & Sets</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Support</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/about" className="hover:text-sky-500 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-sky-500 transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-sky-500 transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-sky-500 transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex gap-3">
                <span>📍</span>
                <span>House 12, Road 5, Dhanmondi, Dhaka-1209</span>
              </li>
              <li className="flex gap-3">
                <span>📞</span>
                <span>+880 1616-684803</span>
              </li>
              <li className="flex gap-3">
                <span>✉️</span>
                <span>support@prithibee.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Prithibee. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</Link>
          </div>
          <p>
            Developed by <a href="https://intovah.com" target="_blank" rel="noopener noreferrer" className="font-bold text-sky-500 hover:underline">Intovah</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
