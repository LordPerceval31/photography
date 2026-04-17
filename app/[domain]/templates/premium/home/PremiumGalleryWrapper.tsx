import prisma from "../../../../lib/prisma";
import { Item } from "../../../../lib/types";
import PremiumGallerySection from "./PremiumGallerySection";

const PremiumGalleryWrapper = async ({ userId }: { userId: string }) => {
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
      <div
        data-theme="light"
        className="w-full min-h-[90vh] bg-dark flex items-center justify-center text-zinc-500"
      >
        <p>Aucune galerie ou image de couverture disponible.</p>
      </div>
    );
  }

  const items: Item[] = premiumGallery.photos.map((p) => ({
    id: p.photo.id,
    img: p.photo.url,
    url: p.photo.url,
    height: 600,
    galleryId: premiumGallery.id,
  }));

  return (
    <PremiumGallerySection
      galleryName={premiumGallery.name}
      galleryDescription={premiumGallery.description}
      coverPhoto={{ url: coverPhoto.url, title: coverPhoto.title }}
      items={items}
    />
  );
};

export default PremiumGalleryWrapper;
