import { Section, Heading, Text, CardGrid, Card, ResponsiveImage, RatingStars, Button } from "@repo/ui";
import type { FeaturedProduct } from "./types";

interface FeaturedProductsSectionProps {
  title: string;
  subtitle?: string;
  products: FeaturedProduct[];
  viewAllHref?: string;
}

export function FeaturedProductsSection({
  title,
  subtitle,
  products,
  viewAllHref,
}: FeaturedProductsSectionProps) {
  return (
    <Section>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <Heading size="lg">{title}</Heading>
          {subtitle && <Text variant="muted">{subtitle}</Text>}
        </div>
        {viewAllHref && (
          <Button variant="outline" asChild>
            <a href={viewAllHref}>View all</a>
          </Button>
        )}
      </div>
      <CardGrid>
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col gap-3">
            <a href={product.href} className="block overflow-hidden rounded-2xl">
              <ResponsiveImage
                src={product.image.src}
                alt={product.image.alt}
                width={product.image.width}
                height={product.image.height}
              />
            </a>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {product.name}
                </p>
                {product.tag && (
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-rose-500">
                    {product.tag}
                  </span>
                )}
              </div>
              <p className="text-base font-semibold text-rose-600">
                {product.price}
              </p>
              {product.rating != null && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <RatingStars rating={product.rating} />
                  {product.reviewCount != null && (
                    <span>({product.reviewCount} reviews)</span>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </CardGrid>
    </Section>
  );
}
