import Image from "next/image";
import Link from "next/link";
import prisma from "../lib/prisma";

const HeroSection = async () => {
  const coverPhoto = await prisma.photo.findFirst({
    where: {
      isCover: true,
    },
  });

  if (!coverPhoto) {
    return (
      <div data-theme="dark" className="relative w-full h-screen bg-dark">
        <Image
          src="/abstraitDark.webp"
          alt="Image de couverture par défaut"
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div data-theme="dark" className="relative w-full h-screen bg-dar">
      {/* 1. L'image de fond */}
      <Image
        src={coverPhoto.url}
        alt={coverPhoto.title || "Portfolio Photographie"}
        fill
        className="object-cover"
        priority
      />

      {/* 2. Le calque d'assombrissement (40% d'opacité) pour lire le texte */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* 3. Le conteneur du texte, placé au-dessus (z-20) et centré */}
      <div
        className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center 
     /* On définit l'espacement unique ici pour tous les éléments */
     gap-4 
     tablet:gap-8 
     laptop:gap-6 
     desktop:gap-10 
     2k:gap-14 
     ultrawide:gap-18 
     4k:gap-20"
      >
        {/* 1. Sur-titre */}
        <h1
          className="text-lg tracking-widest uppercase text-cream font-thin cursor-default
    tablet:text-xl laptop:text-lg desktop:text-xl 2k:text-3xl ultrawide:text-4xl 4k:text-4xl"
        >
          visual narrative portfolio
        </h1>

        {/* 2. Nom */}
        <h2
          className="text-cream font-bold leading-tight cursor-default
    text-6xl tablet:text-7xl laptop:text-6xl desktop:text-7xl 2k:text-8xl ultrawide:text-9xl 4k:text-10xl"
        >
          Aurélien Roy
        </h2>

        {/* 3. Description */}
        <p
          className="text-cream font-light italic cursor-default
    text-xl tablet:text-2xl laptop:text-xl desktop:text-2xl 2k:text-3xl ultrawide:text-4xl 4k:text-5xl"
        >
          Capturer l&apos;instant, raconter une histoire.
        </p>

        <Link
          href="/galleries"
          className="font-semibold tracking-wider uppercase transition-all duration-300 rounded-full text-dark bg-cream hover:bg-blue hover:text-cream 
    px-8 py-4 text-sm 
    tablet:mt-4 tablet:px-10 tablet:py-5 tablet:text-lg 
    laptop:px-10 laptop:py-4 laptop:text-lg
    desktop:px-12 desktop:py-5 desktop:text-xl
    2k:px-16 2k:py-8 2k:text-2xl 
    ultrawide:mt-10 ultrawide:px-20 ultrawide:py-10 ultrawide:text-3xl 
    4k:px-24 4k:py-12 4k:text-4xl"
        >
          Explorer les galeries
        </Link>
        <div className="absolute bottom-4 2k:bottom-4 4k:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <p className="text-cream text-xs uppercase tracking-[0.3em] font-thin 2k:text-lg 4k:text-2xl">
            Défiler
          </p>

          {/* La flèche avec l'animation de rebond (bounce) */}
          <div className="animate-bounce">
            <svg
              className="w-5 h-5 text-cream 2k:w-8 2k:h-8 4k:w-12 4k:h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.5"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
