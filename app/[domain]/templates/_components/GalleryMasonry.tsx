"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import Lightbox from "@/app/_components/lightbox";
import type { Item } from "@/app/lib/types";
import { optimizeCloudinaryUrl } from "@/app/lib/cloudinary-url";

type Photo = {
  id: string;
  url: string;
  title: string | null;
  galleryId: string;
  alt?: string;
  isCover?: boolean;
  isPortrait?: boolean;
  isAboutPicture1?: boolean;
  isAboutPicture2?: boolean;
  isAboutPicture3?: boolean;
};

const GalleryMasonry = ({ photos }: { photos: Photo[] }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeItems, setActiveItems] = useState<Item[]>([]);
  const [direction, setDirection] = useState(0);

  const galleryPhotos = photos.filter(
    (p) =>
      !p.isCover &&
      !p.isPortrait &&
      !p.isAboutPicture1 &&
      !p.isAboutPicture2 &&
      !p.isAboutPicture3,
  );

  const allItems: Item[] = galleryPhotos.map((p) => ({
    id: p.id,
    img: p.url,
    url: p.url,
    height: 400,
    alt: p.alt || p.title || "Photographie",
    galleryId: p.galleryId,
  }));

  const handleOpen = useCallback(
    (clicked: Item) => {
      const filtered = allItems.filter(
        (i) => i.galleryId === clicked.galleryId,
      );
      setActiveItems(filtered);
      setSelectedIndex(filtered.findIndex((i) => i.id === clicked.id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photos],
  );

  const handleClose = useCallback(() => setSelectedIndex(null), []);

  const paginate = useCallback(
    (newDirection: number) => {
      setSelectedIndex((prev) => {
        if (prev === null) return null;
        const next = prev + newDirection;
        if (next < 0 || next >= activeItems.length) return prev;
        return next;
      });
      setDirection(newDirection);
    },
    [activeItems.length],
  );

  return (
    <>
      {/* ── C'est ici qu'on gère le responsive des colonnes ── */}
      <div className="columns-2 tablet:columns-3 desktop:columns-4 gap-2">
        {galleryPhotos.map((photo) => {
          const item = allItems.find((i) => i.id === photo.id)!;
          const label = photo.alt || photo.title || "Photographie";
          return (
            <div
              key={photo.id}
              role="button"
              tabIndex={0}
              aria-label={`Ouvrir : ${label}`}
              className="mb-2 break-inside-avoid overflow-hidden rounded-[10px] cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              onClick={() => handleOpen(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpen(item);
                }
              }}
            >
              <Image
                src={optimizeCloudinaryUrl(photo.url, 800)}
                alt={label}
                width={0}
                height={0}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="w-full h-auto block brightness-90 group-hover:brightness-105 group-hover:scale-[1.03] transition-all duration-500"
              />
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && activeItems.length > 0 && (
          <Lightbox
            items={activeItems}
            selectedIndex={selectedIndex}
            direction={direction}
            onClose={handleClose}
            onPaginate={paginate}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default GalleryMasonry;
