import type { Metadata } from "next";
import {
  HeroSection,
  TrustBadgesSection,
  FeaturedProductsSection,
  WhyChooseUsSection,
  TestimonialsSection,
  CallToActionSection,
} from "./landing";
import type { LandingPageContent } from "./landing/types";

// Revalidate public landing every 5 minutes
export const revalidate = 300;

async function getTenantContext() {
  // TODO: implement real tenant resolution using headers/host in a shared util
  return { tenantSlug: "default" };
}

async function fetchLandingPageData(tenantSlug: string): Promise<LandingPageContent> {
  const baseUrl = process.env.WEB_API_BASE_URL;

  if (!baseUrl) {
    console.error("WEB_API_BASE_URL is not configured; using fallback landing content.");
    return getFallbackLandingPageContent();
  }

  try {
    const res = await fetch(
      `${baseUrl}/api/public/landing?tenant=${encodeURIComponent(tenantSlug)}`,
      {
        // Cache on the edge with ISR
        next: { revalidate },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch landing page data", res.status, res.statusText);
      return getFallbackLandingPageContent();
    }

    return (await res.json()) as LandingPageContent;
  } catch (error) {
    console.error("Error fetching landing page data", error);
    return getFallbackLandingPageContent();
  }
}

function getFallbackLandingPageContent(): LandingPageContent {
  return {
    hero: {
      headline: "Gentle care for moms and little ones",
      subheadline:
        "Baby-safe, dermatologist-tested essentials delivered with extra love.",
      primaryCta: { label: "Shop now", href: "#" },
      secondaryCta: { label: "Learn more", href: "#" },
      image: {
        src: "/next.svg",
        alt: "Placeholder hero image",
        width: 600,
        height: 400,
        priority: true,
      },
      stats: [
        { label: "Happy parents", value: "10k+" },
        { label: "Products tested", value: "150+" },
      ],
    },
    trustBadges: {
      title: "Trusted by parents and experts",
      badges: [
        { id: "pediatrician", label: "Pediatrician approved" },
        { id: "dermatologist", label: "Dermatologist tested" },
      ],
    },
    featuredProducts: {
      title: "Featured products",
      subtitle: "Curated favorites for everyday care.",
      products: [],
    },
    whyChooseUs: {
      title: "Why parents choose us",
      reasons: [],
    },
    testimonials: {
      title: "What parents are saying",
      items: [],
    },
    callToAction: {
      title: "Join our parenting circle",
      subtitle: "Get expert tips and early access to new launches.",
      primaryCta: { label: "Sign up", href: "#" },
      secondaryText: "No spam. Unsubscribe anytime.",
    },
  };
}

async function fetchLandingSeoMetadata(tenantSlug: string) {
  const baseUrl = process.env.WEB_API_BASE_URL;
  if (!baseUrl) return null;

  const res = await fetch(
    `${baseUrl}/api/public/landing/seo?tenant=${encodeURIComponent(
      tenantSlug
    )}`,
    {
      next: { revalidate: 86400 },
    }
  );

  if (!res.ok) return null;

  return (await res.json()) as {
    title: string;
    description: string;
    canonicalUrl?: string;
    openGraphImageUrl?: string;
    twitterImageUrl?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { tenantSlug } = await getTenantContext();
  const seo = await fetchLandingSeoMetadata(tenantSlug);

  if (!seo) {
    return {
      title: "Baby & Mother Care Products",
      description: "Gentle, safe, and trusted products for moms and babies.",
    };
  }

  return {
    title: seo.title,
    description: seo.description,
    alternates: seo.canonicalUrl
      ? {
          canonical: seo.canonicalUrl,
        }
      : undefined,
    openGraph: seo.openGraphImageUrl
      ? {
          title: seo.title,
          description: seo.description,
          images: [{ url: seo.openGraphImageUrl }],
        }
      : undefined,
    twitter: seo.twitterImageUrl
      ? {
          card: "summary_large_image",
          title: seo.title,
          description: seo.description,
          images: [seo.twitterImageUrl],
        }
      : undefined,
  };
}

export default async function LandingPage() {
  const { tenantSlug } = await getTenantContext();
  const data = await fetchLandingPageData(tenantSlug);

  return (
    <>
      <HeroSection {...data.hero} />
      <TrustBadgesSection
        title={data.trustBadges.title}
        badges={data.trustBadges.badges}
      />
      <FeaturedProductsSection {...data.featuredProducts} />
      <WhyChooseUsSection {...data.whyChooseUs} />
      <TestimonialsSection
        title={data.testimonials.title}
        testimonials={data.testimonials.items}
      />
      <CallToActionSection {...data.callToAction} />
    </>
  );
}
