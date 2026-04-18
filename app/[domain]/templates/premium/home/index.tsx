import HeroSection from "./HeroSection";
import PremiumGalleryWrapper from "./PremiumGalleryWrapper";
import DarkSection from "./DarkSection";
import CarouselWrapper from "./CarouselWrapper";
import SmoothScroll from "@/app/_components/SmoothScroll";

interface Props {
  userId: string;
}

// Contenu visuel de la page home — template Premium
// L'aiguilleur (app/[domain]/page.tsx) injecte userId
const PremiumHome = ({ userId }: Props) => {
  return (
    <main className="relative w-full">
      <SmoothScroll>
        <HeroSection userId={userId} />
        <PremiumGalleryWrapper userId={userId} />
        <DarkSection userId={userId} />
        <CarouselWrapper userId={userId} />
      </SmoothScroll>
    </main>
  );
};

export default PremiumHome;
