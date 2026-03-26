import prisma from "../lib/prisma";
import { Item } from "../lib/types";
import LastGallerySection from "./LastGallerySection";

const LastGalleryWrapper = async () => {
  const latestGallery = await prisma.gallery.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      photos: {
        include: { photo: true },
      },
    },
  });

  const coverPhoto = latestGallery?.photos.find((p) => p.isGalleryCover)?.photo;

  if (!coverPhoto || !latestGallery) {
    return (
      <div
        data-theme="light"
        className="w-full min-h-[90vh] bg-dark flex items-center justify-center text-zinc-500"
      >
        <p>Aucune galerie ou image de couverture disponible.</p>
      </div>
    );
  }

  const items: Item[] = latestGallery.photos.map((p) => ({
    id: p.photo.id,
    img: p.photo.url,
    url: p.photo.url,
    height: 600,
    galleryId: latestGallery.id,
  }));

  return (
    <LastGallerySection
      galleryName={latestGallery.name}
      galleryDescription={latestGallery.description}
      coverPhoto={{ url: coverPhoto.url, title: coverPhoto.title }}
      items={items}
    />
  );
};

export default LastGalleryWrapper;
