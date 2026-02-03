"use client";

import { useState, useEffect } from "react";
import { ResponsiveImage, Button } from "@repo/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";

interface Banner {
    id: string;
    src: string;
    alt: string;
    alt_bn?: string;
    link?: string;
}

interface BannerSectionProps {
    banners: Banner[];
}

export function BannerSection({ banners }: BannerSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { t, language } = useLanguage();

    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [banners]);

    if (!banners || banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    return (
        <section className="w-full bg-slate-50 dark:bg-slate-950">
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden group">
                {currentBanner && (
                    <div className="relative w-full h-full">
                        {/* Image */}
                        <div key={currentIndex} className="absolute inset-0 animate-fade-in">
                            <ResponsiveImage
                                src={getImageUrl(currentBanner.src)}
                                alt={getLocalizedField(currentBanner, 'alt', language)}
                                width={1920}
                                height={800}
                                className="object-cover w-full h-full"
                                priority
                            />
                            {/* Dark Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex items-center px-8 sm:px-16 lg:px-24 z-10">
                            <div className="max-w-xl space-y-6">
                                <div className="inline-block px-3 py-1 bg-sky-500 text-white text-xs font-bold uppercase tracking-wider rounded-md mb-2 animate-slide-in-from-bottom-2">
                                    {t('featured')}
                                </div>
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-md animate-slide-in-from-bottom-4">
                                    {getLocalizedField(currentBanner, 'alt', language)}
                                </h1>
                                <div className="pt-4 animate-slide-in-from-bottom-8">
                                    <Link href={currentBanner.link || '/products'}>
                                        <Button className="bg-sky-500 text-white hover:bg-sky-600 border-none font-bold px-8 py-3.5 rounded-full shadow-lg text-base">
                                            {t('shop_now')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Slider Indicators */}
                {banners.length > 1 && (
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm ${
                                    idx === currentIndex
                                        ? 'w-8 bg-white'
                                        : 'w-2 bg-white/50 hover:bg-white/80'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Slider Arrows */}
                {banners.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100 z-20"
                        >
                            ←
                        </button>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100 z-20"
                        >
                            →
                        </button>
                    </>
                )}
            </div>

            {/* Features Bar (Full Width) */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
                        {[
                            {
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
                                title: t('fast_delivery'),
                                desc: t('all_over_bangladesh')
                            },
                            {
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
                                title: t('authentic'),
                                desc: t('guaranteed_products')
                            },
                            {
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
                                title: t('best_price'),
                                desc: t('factory_direct_rates')
                            },
                            {
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
                                title: t('support'),
                                desc: t('always_here_for_you')
                            },
                        ].map((feature, i) => (
                            <div key={i} className="p-6 flex items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="text-sky-500">{feature.icon}</div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white text-sm">{feature.title}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{feature.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
