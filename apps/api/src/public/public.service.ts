import { Injectable, Inject } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { MotherCategoriesService } from '../mother-categories/mother-categories.service';
import { Knex } from 'knex';

@Injectable()
export class PublicService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly motherCategoriesService: MotherCategoriesService,
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
  ) {}

  async getLandingPageData(tenant: string) {
    // Fetch Mother Categories
    const motherCategories = await this.motherCategoriesService.findAll();

    const categories = await this.categoriesService.findAll();
    // Return top 15 categories
    const displayCategories = categories.slice(0, 15).map(cat => ({
        id: cat.id,
        name: cat.name,
        name_bn: cat.name_bn, // Added Bangla Name
        slug: cat.slug, // Added Slug
        image: cat.image || "https://api.dicebear.com/7.x/shapes/svg?seed=product",
        mother_category_id: cat.mother_category_id // Added mother category id
    }));

    // Fetch Trending Products (Most Ordered)
    const trendingProducts = await this.knex('order_items')
        .join('products', 'order_items.product_id', 'products.id')
        .select(
            'products.id',
            'products.name',
            'products.name_bn', // Added Bangla Name
            'products.slug', // Added Slug
            'products.price',
            'products.images',
            'products.stock'
        )
        .sum('order_items.quantity as total_sold')
        .groupBy('products.id')
        .orderBy('total_sold', 'desc')
        .limit(8);

    // Fallback to latest products if no orders yet
    let productsToDisplay = trendingProducts;
    if (trendingProducts.length < 4) {
        const latestProducts = await this.productsService.findAll(1, 8);
        // Merge and deduplicate
        const existingIds = new Set(trendingProducts.map(p => p.id));
        const additional = (latestProducts.data || []).filter(p => !existingIds.has(p.id));
        productsToDisplay = [...trendingProducts, ...additional].slice(0, 8);
    }
    
    const featuredProducts = productsToDisplay.map((p: any) => {
        let imageUrl = "https://api.dicebear.com/7.x/shapes/svg?seed=product";
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
            imageUrl = p.images[0];
        } else if (p.images && typeof p.images === 'string') {
             try {
                 const parsed = JSON.parse(p.images);
                 if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
             } catch (e) {}
        }

        return {
            id: p.id,
            name: p.name,
            name_bn: p.name_bn, // Added Bangla Name
            slug: p.slug, // Added Slug
            price: `৳${p.price}`,
            href: `/products/${p.slug || p.id}`,
            image: {
                src: imageUrl,
                alt: p.name,
                width: 400,
                height: 400,
            },
            tag: p.total_sold > 5 ? "Best Seller" : (p.stock < 10 ? "Low Stock" : "New"),
            rating: 5.0,
            reviewCount: 0,
        };
    });

    // Fetch Banners
    const banners = await this.knex('banners')
        .where({ is_active: true })
        .orderBy('order', 'asc');

    // Fetch Promises
    const promises = await this.knex('promises')
        .where({ is_active: true })
        .orderBy('order', 'asc');

    // Fetch Testimonials (Approved Reviews)
    const reviews = await this.knex('reviews')
        .join('users', 'reviews.user_id', 'users.id')
        .select(
            'reviews.id',
            'reviews.comment as quote',
            'reviews.rating',
            'users.name as authorName',
            'users.role as authorRole'
        )
        .where({ 'reviews.status': 'approved', 'reviews.rating': 5 })
        .orderBy('reviews.created_at', 'desc')
        .limit(3);

    // Calculate Average Rating & Total Reviews
    const ratingStats = await this.knex('reviews')
        .where({ status: 'approved' })
        .avg('rating as average')
        .count('* as count')
        .first();

    const averageRating = parseFloat(ratingStats?.average as string || '5.0').toFixed(1);
    const totalReviews = parseInt(ratingStats?.count as string || '0', 10);

    return {
      hero: {
        headline: "Everything for Mom & Baby, Delivered.",
        headline_bn: "মা এবং শিশুর জন্য সবকিছু, পৌঁছে যাবে আপনার দরজায়।",
        subheadline: "Prithibee is your one-stop shop for premium diapers, gentle wipes, organic skincare, and maternity essentials. Trusted by 1,000+ parents.",
        subheadline_bn: "পৃথিবী আপনার প্রিমিয়াম ডায়াপার, জেন্টল ওয়াইপস, অর্গানিক স্কিনকেয়ার এবং মাতৃত্বকালীন প্রয়োজনীয় পণ্যের জন্য ওয়ান-স্টপ শপ। 1,000+ অভিভাবকের আস্থাশীল।",
        primaryCta: { label: "Shop All Products", label_bn: "সব পণ্য দেখুন", href: "/products" },
        secondaryCta: { label: "Bundle & Save", label_bn: "বান্ডেল এবং সেভ", href: "/bundles" },
        banners: banners.length > 0 ? banners.map(b => ({
            id: b.id,
            src: b.image,
            alt: b.title,
            alt_bn: b.title_bn, // Added Bangla Title
            link: b.link
        })) : [],
        image: {
          src: "/prithibee.png",
          alt: "Prithibee Shop Hero",
          width: 800,
          height: 600,
          priority: true,
        },
        stats: [
          { label: "Products Available", label_bn: "পণ্য উপলব্ধ", value: `100+` },
          { label: "Happy Families", label_bn: "সুখী পরিবার", value: "1K+" },
        ],
      },
      motherCategories, // Added mother categories
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
        title_bn: "এখন ট্রেন্ডিং",
        subtitle: "Moms are loving these essentials this week.",
        subtitle_bn: "মায়েরা এই সপ্তাহে এই পণ্যগুলো পছন্দ করছেন।",
        viewAllHref: "/products",
        products: featuredProducts,
      },
      whyChooseUs: {
        title: "The Prithibee Promise",
        reasons: promises.length > 0 ? promises.map(p => ({
            id: p.id,
            title: p.title,
            title_bn: p.title_bn, // Added Bangla Title
            description: p.description,
            description_bn: p.description_bn, // Added Bangla Description
            iconUrl: p.icon
        })) : [],
      },
      testimonials: {
        title: "Parents Love Prithibee",
        averageRating: averageRating,
        totalReviews: totalReviews,
        items: reviews.length > 0 ? reviews.map(r => ({
            id: r.id,
            quote: r.quote,
            authorName: r.authorName,
            authorRole: "Verified Buyer",
            rating: r.rating
        })) : [],
      },
      callToAction: {
        title: "Start Your Journey with Prithibee",
        title_bn: "পৃথিবীর সাথে আপনার যাত্রা শুরু করুন",
        subtitle: "Get 20% off your first order when you join our family.",
        subtitle_bn: "আমাদের পরিবারে যোগ দিলে আপনার প্রথম অর্ডারে ২০% ছাড় পান।",
        primaryCta: { label: "Shop Now", label_bn: "এখনই কিনুন", href: "/products" },
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
