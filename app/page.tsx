import SmoothScroll from "./_components/SmoothScroll";
import CarouselWrapper from "./home/CarouselWrapper";
import DarkSection from "./home/DarkSection";
import HeroSection from "./home/HeroSection";
import LastGalleryWrapper from "./home/PremiumGalleryWrapper";

export const revalidate = 3600;

const Home = () => {
  return (
    <main className="relative w-full">
      <SmoothScroll>
        <HeroSection />
        <LastGalleryWrapper />
        <DarkSection />
        <CarouselWrapper />
      </SmoothScroll>
    </main>
  );
};

export default Home;
