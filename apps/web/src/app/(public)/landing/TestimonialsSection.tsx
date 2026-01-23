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
    <Section className="py-16 !bg-sky-50  relative overflow-hidden transition-colors duration-300 bg-[#f0f9ff] dark:bg-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(currentColor 0.5px, transparent 0.5px)', backgroundSize: '20px 20px', color: '#bae6fd' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white shadow-sm border border-sky-100 text-sky-600 text-sm font-bold uppercase tracking-wider animate-fade-in-up dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              Love Notes
            </div>
            <Heading size="lg" className="font-sans text-3xl sm:text-5xl text-slate-900 leading-tight dark:text-white font-bold">
              {title}
            </Heading>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-5xl font-sans font-bold text-sky-500">4.9/5</div>
            <div className="text-sm text-slate-600 max-w-[100px] leading-tight font-medium dark:text-slate-400">Average rating from 10k+ reviews</div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.id} className={`bg-white p-8 rounded-md border border-sky-100 shadow-xl shadow-sky-100/50 hover:-translate-y-2 transition-transform duration-300 ${i === 1 ? 'md:-translate-y-8' : ''} dark:bg-slate-800 dark:border-slate-700 dark:shadow-none`}>
              <div className="flex gap-1 mb-6">
                <RatingStars rating={t.rating || 5} />
              </div>
              
              <Text className="text-lg font-medium text-slate-700 leading-relaxed mb-6 font-sans dark:text-slate-300">
                "{t.quote}"
              </Text>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center text-sky-600 font-bold text-lg dark:from-sky-900 dark:to-sky-800 dark:text-sky-300">
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
