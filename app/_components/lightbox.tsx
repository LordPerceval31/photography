"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Item } from "../lib/types";
import { useNavbar } from "./NavbarContext";
import GalleryCarousel, { GalleryItem } from "../gallery/GalleryCarousel";

interface LightboxProps {
  items: Item[];
  selectedIndex: number;
  direction: number;
  onClose: () => void;
  onPaginate: (direction: number) => void;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity;

const sliderVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
    scale: 0.95,
  }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 500 : -500,
    opacity: 0,
    scale: 0.95,
  }),
};

// Nombre max de dots affichés pour ne pas surcharger sur mobile
const MAX_DOTS = 7;

const Dots = ({ total, current }: { total: number; current: number }) => {
  // Si trop d'images, on affiche une fenêtre glissante de MAX_DOTS points
  const start = Math.max(
    0,
    Math.min(current - Math.floor(MAX_DOTS / 2), total - MAX_DOTS),
  );
  const end = Math.min(total, start + MAX_DOTS);
  const visible = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-center gap-2">
      {visible.map((i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            backgroundColor: i === current ? "white" : "rgba(255,255,255,0.4)",
          }}
        />
      ))}
    </div>
  );
};

const Lightbox = ({
  items,
  selectedIndex,
  direction,
  onClose,
  onPaginate,
}: LightboxProps) => {
  const { hideNavbar, showNavbar } = useNavbar();

  useEffect(() => {
    hideNavbar();
    return () => showNavbar();
  }, [hideNavbar, showNavbar]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && selectedIndex < items.length - 1)
        onPaginate(1);
      if (e.key === "ArrowLeft" && selectedIndex > 0) onPaginate(-1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, items.length, onClose, onPaginate]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* BOUTON FERMER */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 tablet:top-10 tablet:right-10 text-white/70 hover:text-white z-50 p-2 bg-black/20 rounded-full backdrop-blur-md"
      >
        <X size={28} />
      </button>

      {/* IMAGE */}
      <div className="relative flex items-center justify-center w-full h-full px-4 tablet:px-24 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={items[selectedIndex].id}
            src={items[selectedIndex].img}
            className="absolute w-auto h-auto max-w-full max-h-[70vh] tablet:max-h-[75vh] object-contain rounded-lg shadow-2xl cursor-grab active:cursor-grabbing"
            custom={direction}
            variants={sliderVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 150, damping: 25, mass: 0.8 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (
                swipe < -swipeConfidenceThreshold &&
                selectedIndex < items.length - 1
              ) {
                onPaginate(1);
              } else if (
                swipe > swipeConfidenceThreshold &&
                selectedIndex > 0
              ) {
                onPaginate(-1);
              }
            }}
          />
        </AnimatePresence>
      </div>

      {/* FLECHES — côtés sur tablet+, bas sur mobile */}
      {selectedIndex > 0 && (
        <button
          className="absolute z-50 p-3 text-white/50 hover:text-white bg-black/10 rounded-full backdrop-blur-md
      left-6 bottom-8
      laptop:left-10 laptop:bottom-auto laptop:top-1/2 laptop:-translate-y-1/2"
          onClick={() => onPaginate(-1)}
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {selectedIndex < items.length - 1 && (
        <button
          className="absolute z-50 p-3 text-white/50 hover:text-white bg-black/10 rounded-full backdrop-blur-md
      right-6 bottom-8
      laptop:right-10 laptop:bottom-auto laptop:top-1/2 laptop:-translate-y-1/2"
          onClick={() => onPaginate(1)}
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* MOBILE : dots */}
      <div className="absolute bottom-10 left-0 w-full z-40 flex justify-center tablet:hidden">
        <Dots total={items.length} current={selectedIndex} />
      </div>

      {/* TABLET+ : carousel miniature */}
      <div
        className="absolute bottom-4 left-0 w-full z-40 hidden tablet:block"
        style={{ transform: "scale(0.15)", transformOrigin: "bottom center" }}
      >
        <GalleryCarousel
          items={items.map(
            (item): GalleryItem => ({
              id: item.id,
              title: item.img,
              url: item.img,
            }),
          )}
          activeIndex={selectedIndex}
        />
      </div>
    </motion.div>
  );
};

export default Lightbox;
