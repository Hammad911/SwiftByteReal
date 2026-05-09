import HeroSection from "@/components/home/HeroSection";
import ScrollMarquee from "@/components/home/ScrollMarquee";
import CategoriesRow from "@/components/home/CategoriesRow";
import RestaurantGrid from "@/components/home/RestaurantGrid";
import FeaturedBanners from "@/components/home/FeaturedBanners";
import HowItWorks from "@/components/home/HowItWorks";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AppDownloadSection from "@/components/home/AppDownloadSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ScrollMarquee />
      <CategoriesRow />
      <RestaurantGrid />
      <FeaturedBanners />
      <HowItWorks />
      <TestimonialsSection />
      <AppDownloadSection />
    </>
  );
}
