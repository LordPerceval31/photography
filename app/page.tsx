import DarkSection from "./_components/DarkSection";
import HeroSection from "./_components/HeroSection";
import LastGalleryection from "./_components/LastGalleryection";
import NavBar from "./_components/navBar";

const Home = () => {
  return (
    <main className="min-h-screen w-full">
      <div
        className="fixed z-50 right-6 tablet:right-10
    laptop:right-auto laptop:left-1/2 laptop:-translate-x-1/2
    top-6 tablet:top-10 laptop:top-6 2k:top-12 4k:top-16"
      >
        <NavBar />
      </div>
      <HeroSection />
      <LastGalleryection />
      <DarkSection />
    </main>
  );
};

export default Home;
