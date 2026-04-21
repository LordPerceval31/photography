"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMeasure, useMedia } from "../../../../hook/hook";
import Image from "next/image";
import { Item } from "../../../../lib/types";
import posthog from "posthog-js";
import Lightbox from "@/app/_components/lightbox";

const preloadImages = (urls: string[]): Promise<void[]> => {
  if (typeof window === "undefined") return Promise.resolve([]);
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        }),
    ),
  );
};

interface MasonryProps {
  items: Item[];
  duration?: number;
  stagger?: number;
  scaleOnHover?: boolean;
  hoverScale?: number;
}

const Masonry = ({
  items,
  duration = 0.6,
  stagger = 0.05,
  scaleOnHover = true,
  hoverScale = 0.95,
}: MasonryProps) => {
  const columns = useMedia(
    ["(min-width:1500px)", "(min-width:1000px)", "(min-width:640px)"],
    [5, 4, 2],
    1,
  );
  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(true);
  const lenis = useLenis();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeGalleryItems, setActiveGalleryItems] = useState<Item[]>([]);
  const [direction, setDirection] = useState(0);

  const handleOpenGallery = useCallback(
    (clickedItem: Item) => {
      const filtered = items.filter(
        (item) => item.galleryId === clickedItem.galleryId,
      );
      setActiveGalleryItems(filtered);
      preloadImages(filtered.map((i) => i.img));
      setSelectedIndex(
        filtered.findIndex((item) => item.id === clickedItem.id),
      );
      posthog.capture("photo_opened_in_lightbox", {
        photo_id: clickedItem.id,
        gallery_id: clickedItem.galleryId,
        gallery_photo_count: filtered.length,
      });
    },
    [items],
  );

  const paginate = useCallback(
    (newDirection: number) => {
      if (selectedIndex === null || activeGalleryItems.length === 0) return;
      if (newDirection === -1 && selectedIndex === 0) return;
      if (newDirection === 1 && selectedIndex === activeGalleryItems.length - 1)
        return;
      setDirection(newDirection);
      setSelectedIndex((prev) => (prev === null ? null : prev + newDirection));
    },
    [selectedIndex, activeGalleryItems.length],
  );

  const handleClose = useCallback(() => setSelectedIndex(null), []);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [selectedIndex, lenis]);

  const { gridItems, containerHeight } = useMemo(() => {
    if (!width || items.length === 0)
      return { gridItems: [], containerHeight: 0 };
    const colHeights = new Array(columns).fill(0);
    const gap = 16;
    const columnWidth = (width - (columns - 1) * gap) / columns;

    const calculatedItems = items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const childHeight = (child.height || 300) / 2;
      const y = colHeights[col];
      colHeights[col] += childHeight + gap;
      return { ...child, x, y, w: columnWidth, h: childHeight };
    });
    return {
      gridItems: calculatedItems,
      containerHeight: Math.max(...colHeights),
    };
  }, [columns, items, width]);

  return (
    <>
      <motion.div
        ref={containerRef}
        data-theme="dark"
        className="relative w-full"
        style={{ height: containerHeight ? `${containerHeight}px` : "100vh" }}
        animate={{
          filter:
            selectedIndex !== null
              ? "grayscale(100%) blur(12px)"
              : "grayscale(0%) blur(0px)",
          opacity: selectedIndex !== null ? 0.3 : 1,
          scale: selectedIndex !== null ? 0.98 : 1,
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {imagesReady &&
          width > 0 &&
          gridItems.map((item) => (
            <motion.div
              key={item.id}
              className="absolute box-content cursor-pointer"
              initial={{
                opacity: 0,
                x: item.x,
                y: item.y,
                width: item.w,
                height: item.h,
              }}
              animate={{
                opacity: 1,
                x: item.x,
                y: item.y,
                width: item.w,
                height: item.h,
              }}
              transition={{ duration, ease: [0.165, 0.84, 0.44, 1] }}
              whileHover={scaleOnHover ? { scale: hoverScale } : {}}
              onClick={() => handleOpenGallery(item)}
            >
              <div className="relative w-full h-full rounded-[10px] shadow-lg overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.alt || "Photographie du portfolio"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          ))}
      </motion.div>

      <AnimatePresence>
        {selectedIndex !== null && activeGalleryItems.length > 0 && (
          <Lightbox
            items={activeGalleryItems}
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

export default Masonry;
