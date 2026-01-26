import { Section, Heading, Text, RatingStars } from "@repo/ui";
import type { Testimonial } from "./types";

interface TestimonialsSectionProps {
  title: string;
  testimonials: Testimonial[];
  averageRating?: string;
  totalReviews?: number;
}

export function TestimonialsSection({
  title,
  testimonials,
  averageRating = "5.0",
  totalReviews = 0,
}: TestimonialsSectionProps) {
  // Fallback if no testimonials
  const items = testimonials && testimonials.length > 0 ? testimonials : [
      {
          id: "1",
          quote: "Prithibee is a lifesaver! The diaper subscription saves me so much time.",
          authorName: "Jessica K.",
          authorRole: "Mom of twins",
          rating: 5,
      },
      {
          id: "2",
          quote: "Best selection of organic baby food I've found online.",
          authorName: "Michael T.",
          authorRole: "Dad",
          rating: 5,
      },
      {
          id: "3",
          quote: "Fast delivery and amazing customer service. Highly recommend!",
          authorName: "Linda W.",
          rating: 5,
      },
  ];

  return (
    <Section className="py-12 relative overflow-hidden transition-colors duration-300 bg-[#f0f9ff] dark:bg-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 0.5px, transparent 0.5px)', backgroundSize: '20px 20px', color: '#bae6fd' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-sky-100 text-sky-600 text-[10px] font-bold uppercase tracking-wider animate-fade-in-up dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
              Love Notes
            </div>
            <Heading size="lg" className="font-sans text-2xl sm:text-3xl text-slate-900 leading-tight dark:text-white font-bold">
              {title || "Parents Love Prithibee"}
            </Heading>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-3xl sm:text-4xl font-sans font-bold text-sky-500">{averageRating}/5</div>
            <div className="text-xs text-slate-600 max-w-[100px] leading-tight font-medium dark:text-slate-400">Average rating from {totalReviews}+ reviews</div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div key={t.id} className={`bg-white p-6 rounded-2xl border border-sky-100 shadow-xl shadow-sky-100/50 hover:-translate-y-1 transition-transform duration-300 ${i === 1 ? 'md:-translate-y-4' : ''} dark:bg-slate-800 dark:border-slate-700 dark:shadow-none`}>
              <div className="flex gap-1 mb-4">
                <RatingStars rating={t.rating || 5} />
              </div>
              
              <Text className="text-base font-medium text-slate-700 leading-relaxed mb-4 font-sans dark:text-slate-300">
                "{t.quote}"
              </Text>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center text-sky-600 font-bold text-sm dark:from-sky-900 dark:to-sky-800 dark:text-sky-300">
                  {t.authorName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{t.authorName}</div>
                  {t.authorRole && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.authorRole}</div>
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
