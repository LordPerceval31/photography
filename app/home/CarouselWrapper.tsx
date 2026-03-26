import prisma from "../lib/prisma";
import CarouselSection from "./CarouselSection";
import { Item } from "../lib/types";

export type CarouselGallery = {
  id: string;
  coverUrl: string;
  galleryName: string;
  items: Item[];
};

const CarouselWrapper = async () => {
  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      photos: {
        include: { photo: true },
      },
    },
  });

  const carouselGalleries: CarouselGallery[] = galleries
    .map((gallery) => {
      const cover = gallery.photos.find((p) => p.isGalleryCover)?.photo;
      if (!cover) return null;

      const items: Item[] = gallery.photos.map((p) => ({
        id: p.photo.id,
        img: p.photo.url,
        url: p.photo.url,
        height: 600,
        galleryId: gallery.id,
      }));

      return {
        id: gallery.id,
        coverUrl: cover.url,
        galleryName: gallery.name,
        items,
      };
    })
    .filter((g): g is CarouselGallery => g !== null);

  return <CarouselSection galleries={carouselGalleries} />;
};

export default CarouselWrapper;
