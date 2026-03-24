import Image from "next/image";
import prisma from "../lib/prisma";
import { caveat } from "../lib/fonts";

const BioSection = async () => {
  const portraitPhoto = await prisma.photo.findFirst({
    where: {
      isPortrait: true,
    },
  });

  // Sécurité : Si pas de photo trouvée en BDD, on utilise des valeurs de secours
  const imageUrl = portraitPhoto?.url || "/fallback-portrait.jpg";
  const imageAlt = portraitPhoto?.title || "Portrait d'Aurélien, photographe";

  return (
    <section
      data-theme="light"
      className="flex flex-col laptop:flex-row items-center justify-center min-h-screen bg-cream px-8 tablet:px-16 laptop:px-24 py-16"
    >
      {/* 1. LA BOÎTE DE L'IMAGE : Elle prend exactement 50% de la largeur sur laptop */}
      <div className="w-full laptop:w-1/2 flex justify-center laptop:justify-end laptop:pr-12">
        <div className="relative w-full laptop:max-w-md desktop:max-w-2xl 2k:max-w-4xl 4k:max-w-7xl aspect-4/5  overflow-hidden rounded-sm shadow-xl">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* 2. LA BOÎTE DU TEXTE : Elle prend l'autre 50% de la largeur */}
      <div className="w-full laptop:w-1/2 flex justify-center laptop:justify-start laptop:pl-12 mt-12 laptop:mt-0">
        {/* Tu contrôles ici l'espacement intérieur, le texte s'adaptera sans déborder */}
        <div className="w-full max-w-2xl 2k:max-w-4xl ultrawide:max-w-7xl text-dark">
          <h2
            className={`${caveat.className} text-5xl tablet:text-6xl desktop:text-7xl 2k:text-8xl ultrawide:text-8xl 4k:text-9xl font-bold mb-6`}
          >
            l&apos;art de l&apos;observation silencieuse
          </h2>
          <div className="space-y-4 text-lg tablet:text-lg desktop:text-lg 2k:text-2xl ultrawide:text-3xl 4k:text-3xl leading-relaxed opacity-90">
            <p>
              Passionné par la lumière naturelle et les compositions épurées, je
              capture l&apos;essence de mes sujets à travers un regard sincère.
            </p>
            <p>
              Mon travail se concentre sur la narration visuelle, cherchant à
              transformer chaque cliché en une histoire intemporelle.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BioSection;
