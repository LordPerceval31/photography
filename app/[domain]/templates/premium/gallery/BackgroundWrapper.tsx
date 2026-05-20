import prisma from "../../../../lib/prisma";
import { optimizeCloudinaryUrl } from "../../../../lib/types";
import MasonryClient from "./MasonryClient";

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default async function BackgroundWrapper({
  userId,
}: {
  userId: string;
}) {
  // 1. On récupère TOUT en parallèle pour aller vite (Photos + Config SEO)
  const [photosFromDb, config] = await Promise.all([
    prisma.photo.findMany({
      where: {
        userId: userId,
        isCover: false,
        isPortrait: false,
        isAboutPicture1: false,
        isAboutPicture2: false,
        isAboutPicture3: false,
      },
      include: {
        galleries: {
          select: { galleryId: true },
        },
      },
    }),
    prisma.siteConfig.findFirst({ where: { userId: userId } }),
  ]);

  // 2. On prépare la base SEO du photographe
  const name = config?.heroName || "Photographe";
  const location = config?.seoLocation ? ` à ${config.seoLocation}` : "";
  const baseAlt = `${name}${location}`;

  const heightPattern = [500, 1200, 600, 1600, 400, 900, 700, 1400, 450, 1000];

  // 3. On formate les items et on pré-calcule le ALT final
  const formattedItems = photosFromDb.map((photo, index) => {
    // Si la photo a un titre, on l'ajoute. Sinon, c'est juste "Portfolio | Nom à Ville"
    const finalAlt = photo.title
      ? `${photo.title} | ${baseAlt}`
      : `Portfolio | ${baseAlt}`;

    return {
      id: photo.id.toString(),
      img: optimizeCloudinaryUrl(photo.url),
      url: "#",
      height: heightPattern[index % heightPattern.length],
      galleryId: photo.galleries[0]?.galleryId ?? photo.id,
      alt: finalAlt, // <-- LA DONNÉE SEO EST PRÊTE
    };
  });

  const shuffledItems = shuffleArray(formattedItems);

  return (
    <div className="relative w-full z-0 px-4 py-8 md:px-12 md:py-12">
      <MasonryClient items={shuffledItems} />
    </div>
  );
}
