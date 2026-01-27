"use client";

import { Section, Heading, Text, RatingStars } from "@repo/ui";
import type { Testimonial } from "./types";
import { useLanguage } from "@/lib/language-context";

interface TestimonialsSectionProps {
  title: string;
  title_bn?: string;
  testimonials: Testimonial[];
  averageRating?: string;
  totalReviews?: number;
}

export function TestimonialsSection({
  title,
  title_bn,
  testimonials,
  averageRating = "5.0",
  totalReviews = 0,
}: TestimonialsSectionProps) {
  const { t } = useLanguage();

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
    <Section className="py-16 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-bold uppercase tracking-wider dark:bg-slate-800 dark:text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
              {t('love_notes')}
            </div>
            <Heading size="lg" className="font-sans text-2xl sm:text-3xl text-slate-900 dark:text-white font-bold">
              {title || t('customer_reviews')}
            </Heading>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{averageRating}</div>
            <div className="space-y-0.5">
                <RatingStars rating={parseFloat(averageRating)} size="sm" />
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{totalReviews}+ {t('reviews')}</div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div key={t.id} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex gap-1 mb-4">
                <RatingStars rating={t.rating || 5} size="sm" />
              </div>
              
              <Text className="text-base text-slate-700 dark:text-slate-300 mb-4 italic">
                "{t.quote}"
              </Text>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm dark:bg-slate-800 dark:text-sky-400">
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
