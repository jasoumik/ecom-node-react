import { Injectable } from '@nestjs/common';

@Injectable()
export class PublicService {
  getLandingPageData(tenant: string) {
    return {
      hero: {
        headline: "Everything your baby needs, delivered.",
        subheadline: "Prithibee is your one-stop shop for premium diapers, gentle wipes, and organic skincare. Trusted by 50,000+ parents.",
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
        title: "Only the best for your baby",
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
        viewAllHref: "/products",
        products: [
          {
            id: "1",
            name: "Premium Soft Diapers (Pack of 80)",
            price: "৳3,200",
            href: "#",
            image: {
              src: "https://picsum.photos/seed/diaperpack/800/800",
              alt: "Diapers",
              width: 400,
              height: 400,
            },
            tag: "Best Seller",
            rating: 4.9,
            reviewCount: 1240,
          },
          {
            id: "2",
            name: "Water-Based Baby Wipes",
            price: "৳1,450",
            href: "#",
            image: {
              src: "https://picsum.photos/seed/wipes/800/800",
              alt: "Wipes",
              width: 400,
              height: 400,
            },
            tag: "Bundle Deal",
            rating: 4.8,
            reviewCount: 850,
          },
          {
            id: "3",
            name: "Organic Baby Lotion",
            price: "৳1,800",
            href: "#",
            image: {
              src: "https://picsum.photos/seed/lotion/800/800",
              alt: "Lotion",
              width: 400,
              height: 400,
            },
            rating: 4.7,
            reviewCount: 320,
          },
          {
            id: "4",
            name: "Silicone Feeding Set",
            price: "৳2,800",
            href: "#",
            image: {
              src: "https://picsum.photos/seed/feedingset/800/800",
              alt: "Feeding Set",
              width: 400,
              height: 400,
            },
            tag: "New",
            rating: 5.0,
            reviewCount: 120,
          },
        ],
      },
      whyChooseUs: {
        title: "The Prithibee Promise",
        reasons: [
          {
            id: "curated",
            title: "Expertly Curated",
            description: "Every product is vetted by pediatricians and moms.",
            iconUrl: "/icons/check.svg",
          },
          {
            id: "fast",
            title: "Same-Day Delivery",
            description: "Order by 2PM and get it today. Because babies can't wait.",
            iconUrl: "/icons/truck.svg",
          },
          {
            id: "support",
            title: "24/7 Parent Support",
            description: "Questions? Chat with our baby care experts anytime.",
            iconUrl: "/icons/chat.svg",
          },
        ],
      },
      testimonials: {
        title: "Parents Love Prithibee",
        items: [
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
        ],
      },
      callToAction: {
        title: "Start Your Journey with Prithibee",
        subtitle: "Get 20% off your first order when you join our family.",
        primaryCta: { label: "Shop Now", href: "/products" },
        secondaryText: "Free shipping on orders over ৳5,000.",
      },
    };
  }

  getLandingSeoData(tenant: string) {
    return {
      title: "Prithibee | The Best Baby Shop",
      description: "Shop diapers, wipes, skincare and more. Fast delivery.",
    };
  }
}
