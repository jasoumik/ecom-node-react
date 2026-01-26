import { HeroSection } from "./landing/HeroSection";
import { CategoriesSection } from "./landing/CategoriesSection";
import { FeaturedProductsSection } from "./landing/FeaturedProductsSection";
import { WhyChooseUsSection } from "./landing/WhyChooseUsSection";
import { TestimonialsSection } from "./landing/TestimonialsSection";
import { CallToActionSection } from "./landing/CallToActionSection"; // Import CallToActionSection
import { API_URL } from "@/lib/config";
import { BannerSection } from "./landing/BannerSection";

async function getLandingData() {
  try {
    const res = await fetch(`${API_URL}/public/landing?tenant=default`, { 
      cache: 'no-store' 
    });
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
    <div className="flex flex-col gap-0 relative bg-gradient-to-br from-blue-50 via-sky-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black">
      {data.hero.banners && data.hero.banners.length > 0 && (
        <BannerSection banners={data.hero.banners} />
      )}
      <HeroSection {...data.hero} />
      <CategoriesSection categories={data.categories} />
      <FeaturedProductsSection {...data.featuredProducts} />
      <WhyChooseUsSection {...data.whyChooseUs} />
      <TestimonialsSection {...data.testimonials} />
      <CallToActionSection {...data.callToAction} /> {/* Add CallToActionSection */}
    </div>
  );
}
