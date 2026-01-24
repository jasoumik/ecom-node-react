import { Injectable } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  async getLandingPageData(tenant: string) {
    const categories = await this.categoriesService.findAll();
    // Flatten top-level categories for the landing page display if needed, or just take top 4
    const displayCategories = categories.slice(0, 4).map(cat => ({
        id: cat.id,
        name: cat.name,
        image: cat.image || "https://picsum.photos/seed/default/800/800"
    }));

    // Fetch products (paginated response)
    const productsResult = await this.productsService.findAll(1, 10); // Fetch first page
    const allProducts = productsResult.data || [];
    
    // Take top 4 products
    const featuredProducts = allProducts.slice(0, 4).map(p => {
        let imageUrl = "https://picsum.photos/seed/default/800/800";
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
            imageUrl = p.images[0];
        } else if (p.images && typeof p.images === 'string') {
             // Handle case where it might be a stringified JSON if not parsed by driver
             try {
                 const parsed = JSON.parse(p.images);
                 if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
             } catch (e) {}
        }

        return {
            id: p.id,
            name: p.name,
            price: `৳${p.price}`,
            href: `/products/${p.id}`,
            image: {
                src: imageUrl,
                alt: p.name,
                width: 400,
                height: 400,
            },
            tag: p.stock < 10 ? "Low Stock" : "New", // Simple logic for tag
            rating: 5.0, // Placeholder as we don't have ratings table yet
            reviewCount: 0,
        };
    });

    return {
      hero: {
        headline: "Everything for Mom & Baby, Delivered.",
        subheadline: "Prithibee is your one-stop shop for premium diapers, gentle wipes, organic skincare, and maternity essentials. Trusted by 50,000+ parents.",
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
          { label: "Products Available", value: `${productsResult.meta?.total || allProducts.length}+` },
          { label: "Happy Families", value: "50k+" },
        ],
      },
      categories: displayCategories,
      trustBadges: {
        title: "Only the best for Mom & Baby",
        badges: [
          { id: "brands", label: "Top Global Brands" },
          { id: "authentic", label: "100% Authentic" },
          { id: "delivery", label: "Fast Delivery" },
          { id: "return", label: "Easy Returns" },
        ],
      },
      featuredProducts: {
        title: "Trending Now",
        subtitle: "Moms are loving these essentials this week.",
        viewAllHref: "/products",
        products: featuredProducts,
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
            description: "Questions? Chat with our experts anytime.",
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
      title: "Prithibee | The Best Baby & Mom Shop",
      description: "Shop diapers, wipes, skincare, maternity and more. Fast delivery.",
    };
  }
}
