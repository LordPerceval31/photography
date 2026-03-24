import CarouselWrapper from "./home/CarouselWrapper";
import DarkSection from "./home/DarkSection";
import HeroSection from "./home/HeroSection";
import LastGalleryection from "./home/LastGalleryection";

const Home = () => {
  return (
    <main className="relative w-full">
      <HeroSection />
      <LastGalleryection />
      <DarkSection />
      <CarouselWrapper />
    </main>
  );
};

export default Home;
