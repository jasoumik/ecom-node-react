import { HeroSection } from "./landing/HeroSection";
import { CategoriesSection } from "./landing/CategoriesSection";
import { FeaturedProductsSection } from "./landing/FeaturedProductsSection";
import { WhyChooseUsSection } from "./landing/WhyChooseUsSection";
import { TestimonialsSection } from "./landing/TestimonialsSection";
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
    <div className="flex flex-col gap-0">
      <HeroSection {...data.hero} />
      {data.hero.banners && data.hero.banners.length > 0 && (
        <BannerSection banners={data.hero.banners} />
      )}
      <CategoriesSection categories={data.categories} />
      <FeaturedProductsSection {...data.featuredProducts} />
      <WhyChooseUsSection {...data.whyChooseUs} />
      <TestimonialsSection {...data.testimonials} />
    </div>
  );
}
