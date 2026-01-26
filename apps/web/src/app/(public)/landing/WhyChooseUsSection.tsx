import { Section, Heading, Text } from "@repo/ui";
import type { Reason } from "./types";

interface WhyChooseUsSectionProps {
  title: string;
  reasons: Reason[];
}

export function WhyChooseUsSection({
  title,
  reasons,
}: WhyChooseUsSectionProps) {
  return (
    <Section className="bg-white dark:bg-slate-950 transition-colors duration-300 py-12">
      <div className="text-center mb-10 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 shadow-sm border border-sky-100 text-sky-600 text-[10px] font-bold uppercase tracking-wider animate-fade-in-up mb-3 dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
          Our Promise
        </div>
        <Heading size="lg" className="font-sans text-2xl sm:text-3xl text-slate-900 dark:text-white font-bold mb-3">{title}</Heading>
        <Text className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          We believe in products that are safe for your baby, nurturing for mom, and kind to the planet.
        </Text>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {reasons.map((reason, i) => (
          <div key={reason.id} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-center hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-3xl mb-4 mx-auto shadow-sm group-hover:shadow-md transition-shadow">
              {/* Check if iconUrl is an emoji or URL */}
              {reason.iconUrl.startsWith('http') || reason.iconUrl.startsWith('/') ? (
                  <img src={reason.iconUrl} alt={reason.title} className="w-8 h-8 object-contain" />
              ) : (
                  <span>{reason.iconUrl}</span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">{reason.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {reason.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
