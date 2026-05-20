import Image from "next/image";
import { optimizeCloudinaryUrl } from "../../../../lib/types";
import prisma from "../../../../lib/prisma";
import type { ThemeFonts } from "../../../themes/fonts";

const BioSection = async ({
  userId,
  fonts,
}: {
  userId: string;
  fonts: ThemeFonts;
}) => {
  const [portraitPhoto, config] = await Promise.all([
    prisma.photo.findFirst({ where: { isPortrait: true, userId: userId } }),
    prisma.siteConfig.findFirst({ where: { userId: userId } }),
  ]);

  const rawImageUrl = portraitPhoto?.url || "/fallback-portrait.jpg";
  const imageUrl = optimizeCloudinaryUrl(rawImageUrl);

  const photographerName = config?.heroName || "Photographe";
  const location = config?.seoLocation ? ` à ${config.seoLocation}` : "";
  const defaultAlt = `Portrait de ${photographerName} - Photographe${location}`;
  const imageAlt = portraitPhoto?.title
    ? `${portraitPhoto?.title} | ${defaultAlt}`
    : defaultAlt;

  return (
    <section className="flex flex-col laptop:flex-row items-center justify-center min-h-screen px-8 tablet:px-16 laptop:px-24 py-16 text-(--color-text)">
      {/* 1. IMAGE BOX - TES BREAKPOINTS CONSERVÉS */}
      <div className="w-full laptop:w-1/2 flex justify-center laptop:justify-end laptop:pr-12">
        <div className="relative w-full laptop:max-w-md desktop:max-w-2xl 2k:max-w-4xl 4k:max-w-7xl aspect-4/5 overflow-hidden rounded-sm shadow-xl border border-(--color-muted)/10">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </div>

      {/* 2. TEXT BOX - TES BREAKPOINTS CONSERVÉS */}
      <div className="w-full laptop:w-1/2 flex justify-center laptop:justify-start laptop:pl-12 mt-12 laptop:mt-0">
        <div className="w-full max-w-2xl 2k:max-w-4xl ultrawide:max-w-7xl 4k:ml-30">
          <h2
            className="text-5xl tablet:text-6xl desktop:text-7xl 2k:text-8xl ultrawide:text-8xl 4k:text-9xl font-bold mb-6 text-(--color-primary)"
            style={{ fontFamily: fonts.heading }}
          >
            {config?.bioTitle || "l'art de l'observation silencieuse"}
          </h2>
          <div
            className="space-y-4 text-lg tablet:text-lg desktop:text-lg 2k:text-2xl ultrawide:text-3xl 4k:text-3xl leading-relaxed opacity-90"
            style={{ fontFamily: fonts.body }}
          >
            <p>{config?.bioParagraph1}</p>
            <p>{config?.bioParagraph2}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BioSection;
