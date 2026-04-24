import prisma from "../../../../lib/prisma";
import CarouselSection from "./CarouselSection";
import { Item } from "../../../../lib/types";
import type { ThemeFonts } from "../../../themes/fonts";

export type CarouselGallery = {
  id: string;
  coverUrl: string;
  galleryName: string;
  items: Item[];
};

interface Props {
  userId: string;
  fonts: ThemeFonts;
  navTheme: "dark" | "light";
}

const CarouselWrapper = async ({ userId, fonts, navTheme }: Props) => {
  const galleries = await prisma.gallery.findMany({
    where: { userId },
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
        alt: p.photo.title || "Photographie",
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

  return <CarouselSection galleries={carouselGalleries} fonts={fonts} navTheme={navTheme} />;
};

export default CarouselWrapper;
