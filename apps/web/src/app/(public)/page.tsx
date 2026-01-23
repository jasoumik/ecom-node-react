import type { Metadata } from "next";
import {
  HeroSection,
  TrustBadgesSection,
  FeaturedProductsSection,
  WhyChooseUsSection,
  TestimonialsSection,
  CallToActionSection,
  CategoriesSection,
} from "./landing";
import type { LandingPageContent } from "./landing/types";

// Revalidate public landing every 5 minutes
export const revalidate = 300;

async function getTenantContext() {
  return { tenantSlug: "default" };
}

async function fetchLandingPageData(tenantSlug: string): Promise<LandingPageContent> {
  const envBaseUrl = process.env.WEB_API_BASE_URL;
  console.log("WEB_API_BASE_URL:", envBaseUrl);
  
  // Use 127.0.0.1 to avoid localhost resolution issues
  const baseUrl = "http://127.0.0.1:3000"; 
  const url = `${baseUrl}/api/public/landing?tenant=${encodeURIComponent(tenantSlug)}`;

  console.log(`Fetching landing page from: ${url}`);

  try {
    const res = await fetch(url, {
      // Cache on the edge with ISR
      next: { revalidate },
    });

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
      headline: "Everything your baby needs, delivered.",
      subheadline:
        "Prithibee is your one-stop shop for premium diapers, gentle wipes, and organic skincare. Trusted by 50,000+ parents.",
      primaryCta: { label: "Shop All Products", href: "/products" },
      secondaryCta: { label: "Bundle & Save", href: "/bundles" },
      image: {
        src: "/prithibee.png",
        alt: "Prithibee Shop Hero",
        width: 800,
        height: 600,
        priority: true,
      },
      stats: [
        { label: "Products Available", value: "500+" },
        { label: "Happy Parents", value: "50k+" },
      ],
    },
    categories: [
      { id: "diapers", name: "Diapers & Wipes", image: "https://picsum.photos/seed/diapers/800/800" },
      { id: "skincare", name: "Skincare", image: "https://picsum.photos/seed/skincare/800/800" },
      { id: "feeding", name: "Feeding", image: "https://picsum.photos/seed/feeding/800/800" },
      { id: "clothing", name: "Clothing", image: "https://picsum.photos/seed/clothing/800/800" },
    ],
    trustBadges: {
      title: "Only the best for Mom & Babies",
      badges: [
        { id: "brands", label: "Top Global Brands" },
        { id: "authentic", label: "100% Authentic" },
        { id: "delivery", label: "Fast Delivery" },
        { id: "return", label: "Easy Returns" },
      ],
    },
    featuredProducts: {
      title: "Trending Now",
      subtitle: "Parents are loving these essentials this week.",
      products: [],
    },
    whyChooseUs: {
      title: "The Prithibee Promise",
      reasons: [],
    },
    testimonials: {
      title: "Parents Love Prithibee",
      items: [],
    },
    callToAction: {
      title: "Start Your Journey with Prithibee",
      subtitle: "Get 20% off your first order when you join our family.",
      primaryCta: { label: "Shop Now", href: "/products" },
      secondaryText: "Free shipping on orders over $50.",
    },
  };
}

async function fetchLandingSeoMetadata(tenantSlug: string) {
  const baseUrl = "http://127.0.0.1:3000";

  try {
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
  } catch (error) {
    console.error("Error fetching SEO metadata", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { tenantSlug } = await getTenantContext();
  const seo = await fetchLandingSeoMetadata(tenantSlug);

  if (!seo) {
    return {
      title: "Prithibee | The Best Baby Shop",
      description: "Shop diapers, wipes, skincare and more. Fast delivery.",
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
      {data.categories && <CategoriesSection categories={data.categories} />}
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
