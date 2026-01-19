import type { HeroContent } from "./types";
import { HeroLayout, Heading, Text, Button, ResponsiveImage } from "@repo/ui";

export function HeroSection(props: HeroContent) {
  const { headline, subheadline, primaryCta, secondaryCta, image, stats } = props;

  return (
    <HeroLayout
      left={
        <div className="space-y-6">
          <Heading as="h1" size="xl">
            {headline}
          </Heading>
          <Text className="text-base sm:text-lg">{subheadline}</Text>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button fullWidth>{primaryCta.label}</Button>
            {secondaryCta && (
              <Button variant="secondary" fullWidth>
                {secondaryCta.label}
              </Button>
            )}
          </div>
          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="text-lg font-semibold text-rose-500">
                    {stat.value}
                  </div>
                  <div>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      }
      right={
        image ? (
          <ResponsiveImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority={image.priority}
          />
        ) : undefined
      }
    />
  );
}
