import type { ThemeFonts } from "../../../themes/fonts";
import prisma from "../../../../lib/prisma";

const StorySection = async ({
  userId,
  fonts,
}: {
  userId: string;
  fonts: ThemeFonts;
}) => {
  const config = await prisma.siteConfig.findFirst({
    where: { userId: userId },
  });

  return (
    <section className="relative flex flex-col px-8 tablet:px-16 laptop:px-24 py-24 tablet:py-40 min-h-screen bg-(--color-bg) text-(--color-text) overflow-hidden">
      {/* LE TITRE : Centré en mobile, bascule à gauche en Laptop pour l'ancrage */}
      <div className="absolute inset-0 laptop:inset-auto laptop:left-0 desktop:left-10 2k:left-12 4k:left-2 laptop:top-1/2 laptop:-translate-y-1/2 flex items-center justify-center laptop:justify-start pointer-events-none z-0">
        <h2
          className="[writing-mode:vertical-lr] rotate-180 text-[20vw] laptop:text-[10vw] desktop:text-[9vw] 2k:text-[15rem] 4k:text-[20rem] font-bold opacity-5 text-(--color-primary) whitespace-nowrap leading-none"
          style={{ fontFamily: fonts.heading }}
        >
          HISTOIRE
        </h2>
      </div>

      {/* CONTENEUR HAUT : Prend 50% de l'écran et centre verticalement */}
      <div className="flex-1 flex flex-col justify-center w-full relative z-10">
        {/* PARAGRAPHE 1 : Placement horizontal intact */}
        <div className="w-full laptop:w-[60%] desktop:w-[60%] 2k:w-[60%] ml-auto mr-0 laptop:mr-8 desktop:mr-40 2k:mr-40 ultrawide:mr-80 4k:mr-32">
          <p
            className="text-2xl tablet:text-4xl laptop:text-2xl desktop:text-4xl 2k:text-5xl 4k:text-7xl italic text-(--color-primary) leading-tight laptop:text-right"
            style={{ fontFamily: fonts.heading }}
          >
            {config?.storyParagraph1}
          </p>
        </div>
      </div>

      {/* CONTENEUR BAS : Prend 50% de l'écran et centre verticalement */}
      <div className="flex-1 flex flex-col justify-center w-full relative z-10">
        {/* PARAGRAPHE 2 : Placement horizontal intact */}
        <div className="w-full desktop:w-[45%] 2k:w-[60%] border-l-2 border-(--color-primary) pl-6 tablet:pl-16 laptop:ml-10 desktop:ml-40 2k:ml-60">
          <div className="w-full max-w-sm laptop:max-w-lg desktop:max-w-2xl 2k:max-w-4xl 4k:max-w-7xl">
            <p
              className="text-base tablet:text-lg laptop:text-sm desktop:text-xl 2k:text-3xl 4k:text-4xl opacity-70 leading-relaxed text-justify"
              style={{ fontFamily: fonts.body }}
            >
              {config?.storyParagraph2}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
