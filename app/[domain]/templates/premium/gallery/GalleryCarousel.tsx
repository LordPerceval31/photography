"use client";

import { useEffect, useMemo, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  MotionValue,
  MotionStyle,
} from "framer-motion";

export interface GalleryItem {
  id: string;
  title: string;
  url: string;
}

const ASPECT_RATIO = 4 / 5;
const GAP_VW = 50;
const SNAP_TRANSITION = {
  type: "spring",
  stiffness: 200,
  damping: 25,
} as const;

const CarouselCard = ({
  item,
  index,
  x,
  width,
  offset,
}: {
  item: GalleryItem;
  index: number;
  x: MotionValue<number>;
  width: number;
  offset: number;
}) => {
  const activeIndex = useTransform(x, (val) => -val / offset);

  const range = [
    index - 3,
    index - 2,
    index - 1,
    index,
    index + 1,
    index + 2,
    index + 3,
  ];

  const rotateY = useTransform(
    activeIndex,
    range,
    [-65, -65, -65, 0, 65, 65, 65],
  );
  const scale = useTransform(
    activeIndex,
    range,
    [1.8, 1.8, 1.8, 1, 1.8, 1.8, 1.8],
  );
  const z = useTransform(
    activeIndex,
    range,
    [-1000, -1000, -1000, 0, -1000, -1000, -1000],
  );
  const zIndex = useTransform(activeIndex, range, [1, 2, 3, 10, 3, 2, 1]);
  const translateX = useTransform(activeIndex, range, [
    -width * 7.6,
    -width * 4.7,
    -width * 1.8,
    0,
    width * 1.8,
    width * 4.7,
    width * 7.6,
  ]);

  const cardStyle: MotionStyle = {
    width,
    height: width / ASPECT_RATIO,
    rotateY,
    scale,
    z,
    x: translateX,
    zIndex,
    transformStyle: "preserve-3d",
  };

  return (
    <motion.div
      className="relative shrink-0 rounded-xl overflow-hidden bg-zinc-950 shadow-[0_0_60px_rgba(0,0,0,0.9)]"
      style={cardStyle}
    >
      <img
        src={item.url}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
    </motion.div>
  );
};

const GalleryCarousel = ({
  items = [],
  activeIndex,
}: {
  items: GalleryItem[];
  activeIndex: number;
}) => {
  const [winWidth, setWinWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    const handleResize = () => setWinWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dim = useMemo(() => {
    const cardWidth = winWidth < 768 ? winWidth * 0.6 : winWidth * 0.22;
    const gap = winWidth * (GAP_VW / 100);
    return {
      width: cardWidth,
      offset: cardWidth + gap,
      centerPadding: winWidth / 2 - cardWidth / 2,
    };
  }, [winWidth]);

  useEffect(() => {
    animate(x, -(activeIndex * dim.offset), SNAP_TRANSITION);
  }, [activeIndex, dim.offset, x]);

  if (winWidth === 0 || !items.length) return null;

  return (
    <div
      className="pointer-events-none w-full overflow-hidden"
      style={{ perspective: "3000px" }}
    >
      <motion.div
        style={{
          x,
          display: "flex",
          gap: winWidth * (GAP_VW / 100),
          transformStyle: "preserve-3d",
          paddingLeft: dim.centerPadding,
        }}
      >
        {items.map((item, index) => (
          <CarouselCard
            key={item.id}
            item={item}
            index={index}
            x={x}
            width={dim.width}
            offset={dim.offset}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default GalleryCarousel;
