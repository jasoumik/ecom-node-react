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
    <Section className="bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="text-center mb-16 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-sky-50 shadow-sm border border-sky-100 text-sky-600 text-sm font-bold uppercase tracking-wider animate-fade-in-up mb-4 dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
          Our Promise
        </div>
        <Heading size="lg" className="font-sans text-3xl sm:text-4xl text-slate-900 dark:text-white font-bold mb-4">{title}</Heading>
        <Text className="text-slate-600 dark:text-slate-400 text-lg">
          We believe in products that are safe for your baby, nurturing for mom, and kind to the planet.
        </Text>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {reasons.map((reason, i) => (
          <div key={reason.id} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 text-center hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-20 h-20 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto shadow-sm group-hover:shadow-md transition-shadow">
              {/* Check if iconUrl is an emoji or URL */}
              {reason.iconUrl.startsWith('http') || reason.iconUrl.startsWith('/') ? (
                  <img src={reason.iconUrl} alt={reason.title} className="w-10 h-10 object-contain" />
              ) : (
                  <span>{reason.iconUrl}</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-sans">{reason.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {reason.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
