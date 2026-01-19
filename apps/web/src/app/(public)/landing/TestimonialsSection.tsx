import { Section, Heading, Text, CardGrid, Card, Avatar, RatingStars } from "@repo/ui";
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
    <Section>
      <div className="space-y-6">
        <Heading size="lg">{title}</Heading>
        <CardGrid>
          {testimonials.map((t) => (
            <Card key={t.id} className="flex flex-col gap-4">
              {t.rating != null && <RatingStars rating={t.rating} />}
              <Text className="text-sm leading-relaxed">“{t.quote}”</Text>
              <div className="mt-auto flex items-center gap-3">
                <Avatar
                  src={t.avatar?.src}
                  alt={t.avatar?.alt ?? t.authorName}
                  size={40}
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-slate-900">
                    {t.authorName}
                  </p>
                  {t.authorRole && (
                    <p className="text-xs text-slate-500">{t.authorRole}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </CardGrid>
      </div>
    </Section>
  );
}

