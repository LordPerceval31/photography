import { caveat } from "../../../../lib/fonts";
import prisma from "../../../../lib/prisma";

const StorySection = async ({ userId }: { userId: string }) => {
  const config = await prisma.siteConfig.findFirst({
    where: { userId: userId },
  });

  const storyParagraph1 =
    config?.storyParagraph1 ||
    "Tout a commencé avec un vieil appareil argentique trouvé dans le grenier familial...";
  const storyParagraph2 =
    config?.storyParagraph2 ||
    "Aujourd'hui, mon approche est intimement liée à cette quête d'authenticité...";

  return (
    <section
      // Ajout de bg-(--color-muted)/5 pour un léger contraste opaque
      className="flex flex-col laptop:flex-row items-start laptop:items-center justify-between min-h-screen bg-(--color-muted)/5 px-8 tablet:px-16 laptop:px-24 py-24 gap-12 laptop:gap-16"
    >
      <div className="w-full laptop:w-1/3 flex flex-col justify-start laptop:self-start">
        <h2
          className={`${caveat.className} text-5xl tablet:text-6xl ultrawide:text-8xl 4k:text-9xl 4k:mt-40 4k:ml-40 font-bold mt-0 ultrawide:mt-30 ultrawide:ml-30 text-(--color-primary)`}
        >
          Story
        </h2>
        <div className="w-40 ultrawide:w-72 4k:w-100 tablet:w-50 h-0.5 bg-(--color-primary) mt-2 ultrawide:ml-30 4k:ml-40 opacity-60"></div>
      </div>

      <div className="w-full laptop:w-1/3 flex justify-start tablet:justify-center">
        <div className="w-full max-w-sm desktop:max-w-md 2k:max-w-lg ultrawide:max-w-2xl 4k:max-w-4xl text-justify text-(--color-text) opacity-80">
          <p className="desktop:text-lg 2k:text-2xl ultrawide:text-3xl 4k:text-4xl leading-relaxed">
            {storyParagraph1}
          </p>
        </div>
      </div>

      <div className="w-full laptop:w-1/3 flex justify-start tablet:justify-center 4k:mr-40">
        <div className="w-full max-w-sm desktop:max-w-md 2k:max-w-lg ultrawide:max-w-2xl 4k:max-w-4xl text-justify text-(--color-text) opacity-80">
          <p className="desktop:text-lg 2k:text-2xl ultrawide:text-3xl 4k:text-4xl leading-relaxed">
            {storyParagraph2}
          </p>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
