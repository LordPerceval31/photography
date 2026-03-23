import Image from "next/image";
import prisma from "../lib/prisma";
import { Caveat } from "next/font/google";
import Link from "next/link";

// 1. On configure la police manuscrite pour le titre
const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
});

const LastGalleryection = async () => {
  const latestGallery = await prisma.gallery.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      photos: {
        where: { isGalleryCover: true },
        include: { photo: true },
      },
    },
  });

  const coverPhoto = latestGallery?.photos[0]?.photo;

  if (!coverPhoto) {
    return (
      <div
        data-theme="light"
        className="w-full min-h-[90vh] bg-dark flex items-center justify-center text-zinc-500"
      >
        <p>Aucune galerie ou image de couverture disponible.</p>
      </div>
    );
  }

  return (
    <section
      className="w-full min-h-[90vh] bg-cream p-6 tablet:p-12 laptop:p-16 
                 flex flex-col laptop:flex-row items-center justify-center laptop:justify-start gap-8 laptop:gap-12"
    >
      {/* LE CADRE DE L'IMAGE */}
      <div
        data-theme="light"
        className="relative w-full max-w-md tablet:max-w-lg laptop:max-w-[65vw] ultrawide:max-w-[50vw] ultrawide:ml-[15vw] 4k:ml-[10vw]
                   aspect-4/5 laptop:aspect-auto laptop:h-[70vh] 
                   overflow-hidden shrink-0"
      >
        <Image
          src={coverPhoto.url}
          alt={coverPhoto.title || latestGallery?.name || "Image de couverture"}
          fill
          className="object-cover"
          priority
        />

        {/* LE FONDU BEAUCOUP PLUS PRONONCÉ - MASQUE LA MOITIÉ */}
        <div
          className="absolute inset-0 pointer-events-none 
                     bg-linear-to-b laptop:bg-linear-to-r 
                     from-transparent from-30% via-cream via-80% to-cream"
        />
      </div>

      {/* LA PARTIE TEXTE */}
      <div className="flex flex-col items-center laptop:items-start text-center laptop:text-left flex-1 max-w-xl z-10 gap-6">
        {/* Titre Manuscrit */}
        <h2
          className={`${caveat.className} text-6xl tablet:text-7xl laptop:text-6xl desktop:text-8xl 4k:text-9xl text-dark leading-tight`}
        >
          {latestGallery?.name || "Nouvelle Collection"}
        </h2>

        {/* Description de la galerie */}
        <p className="text-zinc-600 text-lg tablet:text-xl 2k:text-2xl 4k:text-4xl font-light">
          {latestGallery?.description}
        </p>

        {/* Bouton "Voir la collection" */}
        <Link
          href={`/gallery/${latestGallery?.id}`}
          className="mt-6 4k:mt-12 px-10 4k:px-20 py-4 4k:py-8 bg-dark text-cream uppercase tracking-[0.2em] text-sm 4k:text-2xl font-medium hover:opacity-80 transition-opacity duration-300"
        >
          Voir la collection
        </Link>
      </div>
    </section>
  );
};

export default LastGalleryection;
