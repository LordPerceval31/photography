"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Caveat } from "next/font/google";
import { AnimatePresence } from "framer-motion";
import { Item } from "../lib/types";
import Lightbox from "../_components/lightbox";

const caveat = Caveat({ subsets: ["latin"], display: "swap" });

interface PremiumGallerySectionProps {
  galleryName: string;
  galleryDescription: string;
  coverPhoto: { url: string; title: string | null };
  items: Item[];
}

const PremiumGallerySection = ({
  galleryName,
  galleryDescription,
  coverPhoto,
  items,
}: PremiumGallerySectionProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const handleOpen = useCallback(() => setSelectedIndex(0), []);
  const handleClose = useCallback(() => setSelectedIndex(null), []);

  const paginate = useCallback(
    (newDirection: number) => {
      if (selectedIndex === null) return;
      if (newDirection === -1 && selectedIndex === 0) return;
      if (newDirection === 1 && selectedIndex === items.length - 1) return;
      setDirection(newDirection);
      setSelectedIndex((prev) => (prev === null ? null : prev + newDirection));
    },
    [selectedIndex, items.length],
  );

  return (
    <>
      <section
        data-theme="light"
        className="w-full min-h-[90vh] bg-cream p-6 tablet:p-12 laptop:p-16 
                   flex flex-col laptop:flex-row items-center justify-center laptop:justify-start gap-8 laptop:gap-12"
      >
        {/* LE CADRE DE L'IMAGE */}
        <div
          className="relative w-full max-w-md tablet:max-w-lg laptop:max-w-[65vw] ultrawide:max-w-[50vw] ultrawide:ml-[15vw] 4k:ml-[10vw]
                     aspect-4/5 laptop:aspect-auto laptop:h-[70vh] 
                     overflow-hidden shrink-0"
        >
          <Image
            src={coverPhoto.url}
            alt={coverPhoto.title || galleryName}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0 pointer-events-none 
                       bg-linear-to-b laptop:bg-linear-to-r 
                       from-transparent from-30% via-cream via-80% to-cream"
          />
        </div>

        {/* LA PARTIE TEXTE */}
        <div className="flex flex-col items-center laptop:items-start text-center laptop:text-left flex-1 max-w-xl z-10 gap-6">
          <h2
            className={`${caveat.className} text-6xl tablet:text-7xl laptop:text-6xl desktop:text-8xl 4k:text-9xl text-dark leading-tight cursor-default`}
          >
            {galleryName}
          </h2>

          <p className="text-zinc-600 text-lg tablet:text-xl 2k:text-2xl 4k:text-4xl font-light cursor-default">
            {galleryDescription}
          </p>

          <button
            onClick={handleOpen}
            className="mt-6 4k:mt-12 px-10 4k:px-20 py-4 4k:py-8 bg-dark text-cream uppercase tracking-[0.2em] text-sm 4k:text-2xl font-medium hover:opacity-80 transition-opacity duration-300"
          >
            Voir la collection
          </button>
        </div>
      </section>

      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            items={items}
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

export default PremiumGallerySection;
