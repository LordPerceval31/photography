import prisma from "../lib/prisma";
import CarouselSection from "./CarouselSection";

const CarouselWrapper = async () => {
  // 1. On interroge la table de liaison GalleryPhoto
  // On cherche uniquement les lignes où isGalleryCover est true
  // Et on inclut les infos de la photo (pour l'URL) et de la galerie (pour le nom)
  const coverPhotos = await prisma.galleryPhoto.findMany({
    where: {
      isGalleryCover: true,
    },
    include: {
      photo: true,
      gallery: true,
    },
    // Optionnel : on trie pour avoir les plus récentes en premier
    orderBy: {
      gallery: {
        createdAt: "desc",
      },
    },
  });

  // 2. On transforme les données brutes de Prisma pour qu'elles correspondent
  // exactement au type 'CarouselItem' attendu par ton CarouselSection
  const carouselItems = coverPhotos.map((item) => ({
    id: item.photo.id,
    url: item.photo.url,
    galleryName: item.gallery.name,
  }));

  // 3. On envoie les données formatées au composant client
  return <CarouselSection items={carouselItems} />;
};

export default CarouselWrapper;
