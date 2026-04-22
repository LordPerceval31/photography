import { optimizeCloudinaryUrl } from "../../../../lib/types";
import prisma from "../../../../lib/prisma";
import PictureAboutSection from "./pictureaboutsection";

const PictureAboutWrapper = async ({ userId }: { userId: string }) => {
  // 1. On va chercher chaque photo par son flag spécifique (gauche, milieu, droite)
  const [photo1, photo2, photo3] = await Promise.all([
    prisma.photo.findFirst({
      where: { isAboutPicture1: true, userId: userId },
    }),
    prisma.photo.findFirst({
      where: { isAboutPicture2: true, userId: userId },
    }),
    prisma.photo.findFirst({
      where: { isAboutPicture3: true, userId: userId },
    }),
  ]);

  // 2. Si une des 3 photos est manquante, on n'affiche pas la section
  if (!photo1 || !photo2 || !photo3) return null;

  // 3. On formate les données pour rassurer TypeScript
  // Si le titre est 'null', on met "Image portfolio" par défaut
  const formattedPhotos = [photo1, photo2, photo3].map((photo) => ({
    id: photo.id,
    url: optimizeCloudinaryUrl(photo.url),
    title: photo.title || "Image portfolio",
  }));

  // 3. On envoie les données formatées au composant client
  return <PictureAboutSection photos={formattedPhotos} />;
};

export default PictureAboutWrapper;
