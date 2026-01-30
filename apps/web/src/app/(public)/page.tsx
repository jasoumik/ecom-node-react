import { HeroSection } from "./landing/HeroSection";
import { CategoriesSection } from "./landing/CategoriesSection";
import { FeaturedProductsSection } from "./landing/FeaturedProductsSection";
import { WhyChooseUsSection } from "./landing/WhyChooseUsSection";
import { TestimonialsSection } from "./landing/TestimonialsSection";
import { CallToActionSection } from "./landing/CallToActionSection";
import { API_URL } from "@/lib/config";
import { BannerSection } from "./landing/BannerSection";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getLandingData() {
  try {
    // Removed cache: 'no-store' to avoid conflict with static generation check
    const res = await fetch(`${API_URL}/public/landing?tenant=default`);
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function LandingPage() {
  const data = await getLandingData();

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-0 relative bg-slate-50 dark:bg-slate-950">
      {data.hero.banners && data.hero.banners.length > 0 && (
        <BannerSection banners={data.hero.banners} />
      )}
      <HeroSection {...data.hero} />
      <CategoriesSection categories={data.categories} />
      <FeaturedProductsSection {...data.featuredProducts} />
      <WhyChooseUsSection {...data.whyChooseUs} />
      <TestimonialsSection {...data.testimonials} />
      <CallToActionSection {...data.callToAction} />
    </div>
  );
}
