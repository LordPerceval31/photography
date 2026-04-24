"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type AboutPhoto = {
  id: string;
  url: string;
  title: string;
};

const PictureAboutSection = ({ photos }: { photos: AboutPhoto[] }) => {
  const cardSizing =
    "relative w-full aspect-square laptop:w-[30%] laptop:aspect-[3/4] rounded-2xl shadow-xl overflow-hidden";

  const moveUp = "laptop:-translate-y-12 4k:-translate-y-20";
  const moveDown = "laptop:translate-y-12 4k:translate-y-20";

  const transitionConfig = {
    duration: 1.2,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };

  if (!photos || photos.length < 3) return null;

  const [photoLeft, photoMiddle, photoRight] = photos;

  return (
    <section
      className="flex flex-col laptop:flex-row items-center justify-around min-h-screen bg-(--color-bg) px-8 tablet:px-16 laptop:px-24 ultrawide:px-[15vw] py-32 gap-12"
    >
      {/* IMAGE 1 (Gauche) */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ ...transitionConfig, delay: 0.1 }}
        className={`${cardSizing} ${moveUp}`}
      >
        <Image
          src={photoLeft.url}
          alt={photoLeft.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      </motion.div>

      {/* IMAGE 2 (Milieu) */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ ...transitionConfig, delay: 0.3 }}
        className={`${cardSizing} ${moveDown}`}
      >
        <Image
          src={photoMiddle.url}
          alt={photoMiddle.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      </motion.div>

      {/* IMAGE 3 (Droite) */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ ...transitionConfig, delay: 0.5 }}
        className={`${cardSizing} ${moveUp}`}
      >
        <Image
          src={photoRight.url}
          alt={photoRight.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      </motion.div>
    </section>
  );
};

export default PictureAboutSection;
