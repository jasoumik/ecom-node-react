import { Section, TrustBar } from "@repo/ui";
import type { TrustBadge } from "./types";

interface TrustBadgesSectionProps {
  title?: string;
  badges: TrustBadge[];
}

export function TrustBadgesSection({ title, badges }: TrustBadgesSectionProps) {
  return (
    <Section variant="muted">
      <TrustBar
        title={title}
        items={badges.map((badge) => ({ id: badge.id, label: badge.label }))}
      />
    </Section>
  );
}
