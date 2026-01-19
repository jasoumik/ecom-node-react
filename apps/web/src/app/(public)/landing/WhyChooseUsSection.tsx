import type { WhyReason } from "./types";
import { Section, Heading, Text, CardGrid, Card, ResponsiveImage } from "@repo/ui";

interface WhyChooseUsSectionProps {
  title: string;
  reasons: WhyReason[];
}

export function WhyChooseUsSection({ title, reasons }: WhyChooseUsSectionProps) {
  return (
    <Section variant="muted">
      <div className="space-y-6">
        <Heading size="lg">{title}</Heading>
        <CardGrid>
          {reasons.map((reason) => (
            <Card key={reason.id} className="flex items-start gap-4">
              {reason.iconUrl && (
                <div className="shrink-0">
                  <ResponsiveImage
                    src={reason.iconUrl}
                    alt={reason.title}
                    width={40}
                    height={40}
                  />
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  {reason.title}
                </p>
                <Text variant="muted">{reason.description}</Text>
              </div>
            </Card>
          ))}
        </CardGrid>
      </div>
    </Section>
  );
}
