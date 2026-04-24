import Image from "next/image";
import prisma from "../../../../lib/prisma";
import type { ThemeFonts } from "../../../themes/fonts";

export const revalidate = 0;

interface Props {
  userId: string;
  fonts: ThemeFonts;
}

const HeroSection = async ({ userId, fonts }: Props) => {
  const [coverPhoto, config] = await Promise.all([
    prisma.photo.findFirst({ where: { isCover: true, userId: userId } }),
    prisma.siteConfig.findFirst({ where: { userId: userId } }),
  ]);

  const subtitle = config?.heroSubtitle || "visual narrative portfolio";
  const name = config?.heroName || "DE LUCA Sylvain";
  const tagline =
    config?.heroTagline || "Capturer l'instant, raconter une histoire.";

  const seoLocation = config?.seoLocation ? ` à ${config.seoLocation}` : "";
  const baseAlt = `${name} - Photographe${seoLocation}`;
  const finalAlt = coverPhoto?.title
    ? `${coverPhoto.title} | ${baseAlt}`
    : baseAlt;

  if (!coverPhoto) {
    return (
      <div className="relative w-full h-screen bg-dark">
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
    <div data-theme="dark" className="relative w-full h-screen">
      <Image
        src={coverPhoto.url}
        alt={finalAlt}
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-black/40 z-10" />

      <div
        className="relative z-20 flex flex-col items-start justify-end h-full
          px-6 pb-20 tablet:px-10 tablet:pb-24 laptop:px-16 laptop:pb-28
          desktop:px-20 desktop:pb-32 2k:px-28 2k:pb-40
          ultrawide:px-36 ultrawide:pb-48 4k:px-44 4k:pb-60
          gap-4 tablet:gap-6 laptop:gap-5 desktop:gap-8 2k:gap-12 ultrawide:gap-14 4k:gap-18"
      >
        <h2
          className="text-sm tracking-widest uppercase text-(--color-hero-subtitle) font-thin cursor-default
            tablet:text-xl laptop:text-sm desktop:text-xl 2k:text-3xl ultrawide:text-4xl 4k:text-4xl"
          style={{ fontFamily: fonts.body }}
        >
          {subtitle}
        </h2>

        <h1
          className="text-(--color-hero-name) font-bold leading-tight cursor-default
            text-5xl tablet:text-6xl laptop:text-5xl desktop:text-7xl 2k:text-8xl ultrawide:text-9xl 4k:text-10xl"
          style={{ fontFamily: fonts.heading }}
        >
          {name}
        </h1>

        <p
          className="text-(--color-hero-tagline) font-light italic cursor-default
            text-lg tablet:text-2xl laptop:text-lg desktop:text-2xl 2k:text-3xl ultrawide:text-4xl 4k:text-5xl"
          style={{ fontFamily: fonts.body }}
        >
          {tagline}
        </p>

        <div className="absolute bottom-4 2k:bottom-4 4k:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <p
            className="text-(--color-hero-subtitle) text-xs uppercase tracking-[0.3em] font-thin 2k:text-lg 4k:text-2xl cursor-default"
            style={{ fontFamily: fonts.body }}
          >
            Défiler
          </p>
          <div className="animate-bounce">
            <svg
              className="w-5 h-5 text-(--color-bg) 2k:w-8 2k:h-8 4k:w-12 4k:h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.5"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
