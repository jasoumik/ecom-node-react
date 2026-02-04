"use client";

import { Section, Heading, Text } from "@repo/ui";
import type { Reason } from "./types";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField } from "@/lib/utils";

interface WhyChooseUsSectionProps {
  title: string;
  title_bn?: string;
  reasons: Reason[];
}

export function WhyChooseUsSection({
  title,
  title_bn,
  reasons,
}: WhyChooseUsSectionProps) {
  const { t, language } = useLanguage();

  const getIcon = (iconStr: string) => {
      if (iconStr.startsWith('http') || iconStr.startsWith('/')) {
          return <img src={iconStr} alt="" className="w-8 h-8 object-contain" />;
      }
      
      // Map emojis/keys to SVGs
      switch (iconStr) {
          case '🛡️':
          case 'shield':
              return <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
          case '🌱':
          case 'leaf':
              return <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>;
          case '🤝':
          case 'handshake':
              return <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="m11 17 2 2a6 6 0 0 0 8-8l-2-2"></path><path d="m12 14 2-2"></path><path d="M13.5 8.5 10 5l-3 3-3-3"></path><path d="M5 17a6 6 0 0 1 8-8l-2-2"></path></svg>;
          default:
              return <span className="text-2xl">{iconStr}</span>;
      }
  };

  return (
    <Section variant="blue" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-sky-100 text-sky-600 text-[10px] font-bold uppercase tracking-wider mb-3 dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
          {t('our_promise')}
        </div>
        <Heading size="lg" className="font-sans text-2xl sm:text-3xl text-slate-900 dark:text-white font-bold mb-3">{getLocalizedField({title, title_bn}, 'title', language)}</Heading>
        <Text className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          {t('promise_tagline')}
        </Text>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {reasons.map((reason, i) => (
          <div key={reason.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center hover:shadow-md transition-all duration-300 group">
            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              {getIcon(reason.iconUrl)}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">{getLocalizedField(reason, 'title', language)}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {getLocalizedField(reason, 'description', language)}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
