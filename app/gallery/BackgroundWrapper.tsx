import prisma from "../lib/prisma";
import { optimizeCloudinaryUrl } from "../lib/types";
import Masonry from "./background";

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default async function BackgroundWrapper() {
  const photosFromDb = await prisma.photo.findMany({
    where: {
      isCover: false,
      isPortrait: false,
    },
    // ON VIRE L'INCLUDE GALLERY QUI N'EXISTE PAS DANS TON SCHEMA
  });

  const heightPattern = [500, 1200, 600, 1600, 400, 900, 700, 1400, 450, 1000];

  const formattedItems = photosFromDb.map((photo, index) => ({
    id: photo.id.toString(),
    img: optimizeCloudinaryUrl(photo.url),
    url: "#",
    height: heightPattern[index % heightPattern.length],
    // ON UTILISE TON VRAI CHAMP categoryId
    galleryId: photo.categoryId,
  }));

  const shuffledItems = shuffleArray(formattedItems);

  return (
    <div className="relative w-full z-0 px-4 py-8 md:px-12 md:py-12">
      <Masonry items={shuffledItems} />
    </div>
  );
}
