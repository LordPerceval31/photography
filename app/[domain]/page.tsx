import { notFound } from "next/navigation";
import HeroSection from "./home/HeroSection";
import PremiumGalleryWrapper from "./home/PremiumGalleryWrapper";
import DarkSection from "./home/DarkSection";
import CarouselWrapper from "./home/CarouselWrapper";
import { prisma } from "../lib/prisma";
import SmoothScroll from "../_components/SmoothScroll";

export const revalidate = 3600;

// 1. On indique que params est une Promesse
const Home = async ({ params }: { params: Promise<{ domain: string }> }) => {
  // 2. On "déballe" les params avec await
  const { domain } = await params;

  // 3. On utilise la variable "domain" dans la requête
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ subdomain: domain }, { customDomain: domain }],
    },
  });

  // 4. Si le domaine ne correspond à aucun compte, on affiche une page 404
  if (!user) {
    return notFound();
  }

  // 5. On passe l'ID de l'utilisateur
  return (
    <main className="relative w-full">
      <SmoothScroll>
        <HeroSection userId={user.id} />
        <PremiumGalleryWrapper userId={user.id} />
        <DarkSection userId={user.id} />
        <CarouselWrapper userId={user.id} />
      </SmoothScroll>
    </main>
  );
};

export default Home;
