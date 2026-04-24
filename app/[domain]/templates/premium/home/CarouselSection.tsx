"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { Item } from "../../../../lib/types";
import type { ThemeFonts } from "../../../themes/fonts";
import { CarouselGallery } from "./CarouselWrapper";
import Lightbox from "@/app/_components/lightbox";

interface Props {
  galleries: CarouselGallery[];
  fonts: ThemeFonts;
}

const CarouselSection = ({ galleries, fonts }: Props) => {
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({ speed: 1, stopOnInteraction: false }),
  ]);

  const [activeItems, setActiveItems] = useState<Item[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const displayGalleries =
    galleries.length > 0 && galleries.length < 6
      ? [...galleries, ...galleries, ...galleries, ...galleries].slice(0, 8)
      : galleries;

  const handleOpen = useCallback((items: Item[]) => {
    setActiveItems(items);
    setSelectedIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    setActiveItems(null);
    setSelectedIndex(null);
  }, []);

  const paginate = useCallback(
    (newDirection: number) => {
      if (selectedIndex === null || !activeItems) return;
      if (newDirection === -1 && selectedIndex === 0) return;
      if (newDirection === 1 && selectedIndex === activeItems.length - 1)
        return;
      setDirection(newDirection);
      setSelectedIndex((prev) => (prev === null ? null : prev + newDirection));
    },
    [selectedIndex, activeItems],
  );

  if (!galleries || galleries.length === 0) return null;

  return (
    <>
      <section className="w-full h-screen bg-(--color-bg) overflow-hidden cursor-grab active:cursor-grabbing">
        <div ref={emblaRef} className="h-full px-6 tablet:px-12">
          <div className="flex -ml-6 tablet:-ml-12 h-full items-center">
            {displayGalleries.map((gallery, index) => (
              <div
                key={`${gallery.id}-${index}`}
                className="flex-[0_0_100%] tablet:flex-[0_0_75%] laptop:flex-[0_0_28%] ultrawide:flex-[0_0_25%] 4k:flex-[0_0_25%] pl-6 tablet:pl-12
                           odd:-translate-y-8 tablet:odd:-translate-y-12 laptop:odd:-translate-y-16 ultrawide:odd:-translate-y-24 4k:odd:-translate-y-32
                           even:translate-y-8 tablet:even:translate-y-12 laptop:even:translate-y-16 ultrawide:even:translate-y-24 4k:even:translate-y-32"
              >
                <button
                  onClick={() => handleOpen(gallery.items)}
                  className="group block relative w-full h-[65vh] laptop:h-[60vh] ultrawide:h-auto ultrawide:aspect-3/2 4k:h-[70vh] 4k:aspect-auto text-left"
                >
                  <div className="relative h-full w-full overflow-hidden bg-(--color-muted)/20 rounded-2xl transition-transform duration-500 ease-out group-hover:scale-105">
                    <Image
                      src={gallery.coverUrl}
                      alt={gallery.galleryName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  <div className="mt-4 flex justify-between items-center px-1">
                    <span
                      className="text-xs uppercase tracking-widest text-(--color-muted) font-medium
                     tablet:text-sm laptop:text-xs desktop:text-sm 2k:text-base 4k:text-2xl"
                      style={{ fontFamily: fonts.body }}
                    >
                      {gallery.galleryName}
                    </span>
                    <span className="text-(--color-muted) text-lg 4k:text-2xl transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
                      ↗
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedIndex !== null && activeItems && (
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

export default CarouselSection;
