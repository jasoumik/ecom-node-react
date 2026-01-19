import { Section, Heading, Text, Button } from "@repo/ui";
import type { CallToActionContent } from "./types";

export function CallToActionSection(props: CallToActionContent) {
  const { title, subtitle, primaryCta, secondaryText } = props;

  return (
    <Section variant="highlight">
      <div className="flex flex-col items-center gap-4 text-center sm:text-left sm:flex-row sm:justify-between">
        <div className="space-y-2 max-w-xl">
          <Heading size="lg">{title}</Heading>
          {subtitle && <Text variant="muted">{subtitle}</Text>}
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-end">
          <Button fullWidth className="sm:w-auto">
            <a href={primaryCta.href}>{primaryCta.label}</a>
          </Button>
          {secondaryText && (
            <p className="text-xs text-slate-500">{secondaryText}</p>
          )}
        </div>
      </div>
    </Section>
  );
}

