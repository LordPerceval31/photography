import Image from "next/image";
import prisma from "../../../../lib/prisma";

export const revalidate = 0;

const HeroSection = async ({ userId }: { userId: string }) => {
  const [coverPhoto, config] = await Promise.all([
    prisma.photo.findFirst({ where: { isCover: true, userId: userId } }),
    prisma.siteConfig.findFirst({ where: { userId: userId } }),
  ]);

  // Fallbacks si la BDD n'a pas encore de SiteConfig
  const subtitle = config?.heroSubtitle || "visual narrative portfolio";
  const name = config?.heroName || "DE LUCA Sylvain";
  const tagline =
    config?.heroTagline || "Capturer l'instant, raconter une histoire.";

  // 1. On crée une base SEO solide avec le nom et le lieu (si dispo)
  const seoLocation = config?.seoLocation ? ` à ${config.seoLocation}` : "";
  const baseAlt = `${name} - Photographe${seoLocation}`;

  // 2. On combine le titre du photographe avec la base SEO
  const finalAlt = coverPhoto?.title
    ? `${coverPhoto.title} | ${baseAlt}`
    : baseAlt;

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
        alt={finalAlt}
        fill
        className="object-cover"
        priority
      />

      {/* 2. Le calque d'assombrissement (40% d'opacité) pour lire le texte */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* 3. Le conteneur du texte, placé au-dessus (z-20), textes en bas à gauche */}
      <div
        className="relative z-20 flex flex-col items-start justify-end h-full
     px-6 pb-20
     tablet:px-10 tablet:pb-24
     laptop:px-16 laptop:pb-28
     desktop:px-20 desktop:pb-32
     2k:px-28 2k:pb-40
     ultrawide:px-36 ultrawide:pb-48
     4k:px-44 4k:pb-60
     gap-4
     tablet:gap-6
     laptop:gap-5
     desktop:gap-8
     2k:gap-12
     ultrawide:gap-14
     4k:gap-18"
      >
        {/* 1. Sur-titre */}
        <h2
          className="text-sm tracking-widest uppercase text-cream font-thin cursor-default
    tablet:text-xl laptop:text-sm desktop:text-xl 2k:text-3xl ultrawide:text-4xl 4k:text-4xl"
        >
          {subtitle}
        </h2>

        {/* 2. Nom */}
        <h1
          className="text-cream font-bold leading-tight cursor-default
    text-5xl tablet:text-6xl laptop:text-5xl desktop:text-7xl 2k:text-8xl ultrawide:text-9xl 4k:text-10xl"
        >
          {name}
        </h1>

        {/* 3. Description */}
        <p
          className="text-cream font-light italic cursor-default
    text-lg tablet:text-2xl laptop:text-lg desktop:text-2xl 2k:text-3xl ultrawide:text-4xl 4k:text-5xl"
        >
          {tagline}
        </p>

        <div className="absolute bottom-4 2k:bottom-4 4k:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <p className="text-cream text-xs uppercase tracking-[0.3em] font-thin 2k:text-lg 4k:text-2xl cursor-default">
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
