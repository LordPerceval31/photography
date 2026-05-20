import prisma from "../../../../lib/prisma";
import { Item } from "../../../../lib/types";
import type { ThemeFonts } from "../../../themes/fonts";
import PremiumGallerySection from "./PremiumGallerySection";

interface Props {
  userId: string;
  fonts: ThemeFonts;
  navTheme: "dark" | "light";
}

const PremiumGalleryWrapper = async ({ userId, fonts, navTheme }: Props) => {
  const premiumGallery = await prisma.gallery.findFirst({
    where: {
      isPremium: true,
      userId: userId,
    },
    include: {
      photos: {
        include: { photo: true },
      },
    },
  });

  const coverPhoto = premiumGallery?.photos.find(
    (p) => p.isGalleryCover,
  )?.photo;

  if (!coverPhoto || !premiumGallery) {
    return (
      <div className="w-full min-h-[90vh] bg-(--color-bg) flex items-center justify-center text-(--color-muted)">
        <p>Aucune galerie ou image de couverture disponible.</p>
      </div>
    );
  }

  const items: Item[] = premiumGallery.photos.map((p) => ({
    id: p.photo.id,
    img: p.photo.url,
    url: p.photo.url,
    height: 600,
    alt: p.photo.title || "Photographie",
    galleryId: premiumGallery.id,
  }));

  return (
    <PremiumGallerySection
      galleryName={premiumGallery.name}
      galleryDescription={premiumGallery.description}
      coverPhoto={{ url: coverPhoto.url, title: coverPhoto.title }}
      items={items}
      fonts={fonts}
      navTheme={navTheme}
    />
  );
};

export default PremiumGalleryWrapper;
