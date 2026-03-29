import prisma from "../lib/prisma";
import { optimizeCloudinaryUrl } from "../lib/types";
import PictureAboutSection from "./PictureAboutSection";

const PictureAboutWrapper = async () => {
  // 1. On va chercher les 3 dernières photos qui ont le flag activé
  const photos = await prisma.photo.findMany({
    where: {
      isAboutPicture: true,
    },
    take: 3, // On s'assure de n'en prendre que 3 maximum
    orderBy: {
      createdAt: "desc",
    },
  });

  // 2. On formate les données pour rassurer TypeScript
  // Si le titre est 'null', on met "Image portfolio" par défaut
  const formattedPhotos = photos.map((photo) => ({
    id: photo.id,
    url: optimizeCloudinaryUrl(photo.url),
    title: photo.title || "Image portfolio",
  }));

  // 3. On envoie les données formatées au composant client
  return <PictureAboutSection photos={formattedPhotos} />;
};

export default PictureAboutWrapper;
