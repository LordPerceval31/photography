import Image from "next/image";
import { optimizeCloudinaryUrl } from "../../../../lib/types";
import { caveat } from "../../../../lib/fonts";
import prisma from "../../../../lib/prisma";

export const revalidate = 0;

const BioSection = async ({ userId }: { userId: string }) => {
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

  const bioTitle = config?.bioTitle || "l'art de l'observation silencieuse";
  const bioParagraph1 =
    config?.bioParagraph1 ||
    "Passionné par la lumière naturelle et les compositions épurées, je capture l'essence de mes sujets à travers un regard sincère.";
  const bioParagraph2 =
    config?.bioParagraph2 ||
    "Mon travail se concentre sur la narration visuelle, cherchant à transformer chaque cliché en une histoire intemporelle.";

  return (
    <section
      // Ajout de bg-(--color-bg) pour rendre la section opaque avec la couleur du thème
      className="flex flex-col laptop:flex-row items-center justify-center min-h-screen bg-(--color-bg) px-8 tablet:px-16 laptop:px-24 py-16"
    >
      <div className="w-full laptop:w-1/2 flex justify-center laptop:justify-end laptop:pr-12">
        <div className="relative w-full laptop:max-w-md desktop:max-w-2xl 2k:max-w-4xl 4k:max-w-7xl aspect-4/5 overflow-hidden rounded-sm shadow-xl">
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

      <div className="w-full laptop:w-1/2 flex justify-center laptop:justify-start laptop:pl-12 mt-12 laptop:mt-0">
        <div className="w-full max-w-2xl 2k:max-w-4xl ultrawide:max-w-7xl 4k:ml-30">
          <h2
            className={`${caveat.className} text-5xl tablet:text-6xl desktop:text-7xl 2k:text-8xl ultrawide:text-8xl 4k:text-9xl font-bold mb-6 text-(--color-primary)`}
          >
            {bioTitle}
          </h2>
          <div className="space-y-4 text-lg tablet:text-lg desktop:text-lg 2k:text-2xl ultrawide:text-3xl 4k:text-3xl leading-relaxed opacity-90 text-(--color-text)">
            <p>{bioParagraph1}</p>
            <p>{bioParagraph2}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BioSection;
