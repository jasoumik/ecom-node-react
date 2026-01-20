import { Section, Heading, Text, RatingStars } from "@repo/ui";
import type { Testimonial } from "./types";

interface TestimonialsSectionProps {
  title: string;
  testimonials: Testimonial[];
}

export function TestimonialsSection({
  title,
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <Section className="py-32 bg-white relative overflow-hidden dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-widest shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-rose-400">
              Love Notes
            </div>
            <Heading size="lg" className="font-serif text-5xl sm:text-6xl text-slate-900 leading-tight dark:text-white">
              {title}
            </Heading>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-5xl font-serif text-rose-500">4.9/5</div>
            <div className="text-sm text-slate-600 max-w-[100px] leading-tight font-medium dark:text-slate-400">Average rating from 10k+ reviews</div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={t.id} className={`bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300 ${i === 1 ? 'md:-translate-y-8' : ''} dark:bg-slate-800 dark:border-slate-700 dark:shadow-none`}>
              <div className="flex gap-1 mb-6">
                <RatingStars rating={t.rating || 5} />
              </div>
              
              <Text className="text-xl font-medium text-slate-700 leading-relaxed mb-8 font-serif dark:text-slate-300">
                "{t.quote}"
              </Text>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center text-rose-600 font-bold text-lg dark:from-rose-900 dark:to-rose-800 dark:text-rose-300">
                  {t.authorName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{t.authorName}</div>
                  {t.authorRole && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">{t.authorRole}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
