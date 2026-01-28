"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";

export function Footer() {
  const { t } = useLanguage();
  const settings = useSettings();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image 
                  src="/logo.png" 
                  alt={settings.shop_name} 
                  width={140} 
                  height={48} 
                  className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {t('footer_desc')}
            </p>
            <div className="flex gap-4 pt-2">
              {/* Social Icons */}
              <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-sky-500 hover:text-white transition-all">
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
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">{t('shop')}</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/products" className="hover:text-sky-500 transition-colors">{t('shop_all_products')}</Link></li>
              <li><Link href="/products?sort=new" className="hover:text-sky-500 transition-colors">{t('new_arrivals')}</Link></li>
              <li><Link href="/products?sort=best_selling" className="hover:text-sky-500 transition-colors">{t('best_sellers')}</Link></li>
              <li><Link href="/bundles" className="hover:text-sky-500 transition-colors">{t('bundles_sets')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">{t('support')}</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/about" className="hover:text-sky-500 transition-colors">{t('about')}</Link></li>
              <li><Link href="/contact" className="hover:text-sky-500 transition-colors">{t('contact')}</Link></li>
              <li><Link href="/faq" className="hover:text-sky-500 transition-colors">{t('faqs')}</Link></li>
              <li><Link href="/shipping" className="hover:text-sky-500 transition-colors">{t('shipping_policy')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">{t('contact')}</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex gap-3">
                <span>📍</span>
                <span>{settings.shop_address}</span>
              </li>
              <li className="flex gap-3">
                <span>📞</span>
                <span>{settings.shop_phone}</span>
              </li>
              <li className="flex gap-3">
                <span>✉️</span>
                <span>support@prithibee.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} {settings.shop_name}. {t('rights_reserved')}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300">{t('privacy_policy')}</Link>
            <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-300">{t('terms_of_service')}</Link>
          </div>
          <p>
            {t('developed_by')} <a href="https://intovah.com" target="_blank" rel="noopener noreferrer" className="font-bold text-sky-500 hover:underline">Intovah</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
