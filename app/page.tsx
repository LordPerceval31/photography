import CarouselWrapper from "./home/CarouselWrapper";
import DarkSection from "./home/DarkSection";
import HeroSection from "./home/HeroSection";
import LastGalleryWrapper from "./home/PremiumGalleryWrapper";

const Home = () => {
  return (
    <main className="relative w-full">
      <HeroSection />
      <LastGalleryWrapper />
      <DarkSection />
      <CarouselWrapper />
    </main>
  );
};

export default Home;
