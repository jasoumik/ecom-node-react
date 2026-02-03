"use client";

import { Section } from "@repo/ui";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import { Shield, Truck, RefreshCcw, Headphones } from "lucide-react";

interface TrustItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  title_bn: string;
  description: string;
  description_bn: string;
  showOnMobile: boolean;
}

const trustItems: TrustItem[] = [
  {
    id: "authentic",
    icon: <Shield className="w-3.5 h-3.5 sm:w-8 sm:h-8 text-sky-500" />,
    title: "100% Authentic",
    title_bn: "১০০% অথেনটিক",
    description: "Guaranteed genuine products",
    description_bn: "নিশ্চিত আসল পণ্য",
    showOnMobile: true
  },
  {
    id: "delivery",
    icon: <Truck className="w-3.5 h-3.5 sm:w-8 sm:h-8 text-sky-500" />,
    title: "Fast Delivery",
    title_bn: "দ্রুত ডেলিভারি",
    description: "All over Bangladesh",
    description_bn: "সারা বাংলাদেশে",
    showOnMobile: true
  },
  {
    id: "returns",
    icon: <RefreshCcw className="w-3.5 h-3.5 sm:w-8 sm:h-8 text-sky-500" />,
    title: "Easy Returns",
    title_bn: "সহজ রিটার্ন",
    description: "Hassle-free returns",
    description_bn: "ঝামেলা-মুক্ত রিটার্ন",
    showOnMobile: false
  },
  {
    id: "support",
    icon: <Headphones className="w-3.5 h-3.5 sm:w-8 sm:h-8 text-sky-500" />,
    title: "24/7 Support",
    title_bn: "২৪/৭ সাপোর্ট",
    description: "Always here for you",
    description_bn: "সর্বদা আপনার পাশে",
    showOnMobile: false
  }
];

export function TrustSection() {
  const { language } = useLanguage();

  return (
    <Section className="py-6 sm:py-12 bg-brand-secondary dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 sm:py-4">
        {/* Mobile: Only show 2 items - inline compact style */}
        <div className="flex gap-2 lg:hidden">
          {trustItems.filter(item => item.showOnMobile).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className="flex-1 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-sky-50 dark:bg-slate-700 rounded flex items-center justify-center">
                {item.icon}
              </div>

              {/* Text */}
              <div className="text-left min-w-0">
                <h3 className="font-bold text-[13px] text-slate-900 dark:text-white leading-tight truncate">
                  {language === "bn" ? item.title_bn : item.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {language === "bn" ? item.description_bn : item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: Show all 4 items */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-sky-50 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                {language === "bn" ? item.title_bn : item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {language === "bn" ? item.description_bn : item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

