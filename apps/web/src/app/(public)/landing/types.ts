export type HeroContent = {
  headline: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    priority?: boolean;
  };
  stats?: Array<{ label: string; value: string }>;
};

export type TrustBadge = {
  id: string;
  label: string;
  iconUrl?: string;
  description?: string;
};

export type FeaturedProduct = {
  id: string;
  name: string;
  price: string;
  href: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  tag?: string;
  rating?: number;
  reviewCount?: number;
};

export type WhyReason = {
  id: string;
  iconUrl?: string;
  title: string;
  description: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorRole?: string;
  avatar?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  rating?: number;
};

export type CallToActionContent = {
  title: string;
  subtitle?: string;
  primaryCta: { label: string; href: string };
  secondaryText?: string;
};

export type Category = {
  id: string;
  name: string;
  image: string;
};

export type LandingPageContent = {
  hero: HeroContent;
  categories?: Category[]; // Added categories
  trustBadges: {
    title?: string;
    badges: TrustBadge[];
  };
  featuredProducts: {
    title: string;
    subtitle?: string;
    products: FeaturedProduct[];
    viewAllHref?: string;
  };
  whyChooseUs: {
    title: string;
    reasons: WhyReason[];
  };
  testimonials: {
    title: string;
    items: Testimonial[];
  };
  callToAction: CallToActionContent;
};
