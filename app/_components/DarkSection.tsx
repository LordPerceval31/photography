import Image from "next/image";

const DarkSection = () => {
  return (
    // On fixe la taille de la boîte principale une bonne fois pour toutes.
    <section className="flex flex-col laptop:flex-row w-full h-screen laptop:h-[80vh] bg-black overflow-hidden">
      {/* 1. CONTAINER TEXTE */}
      <div className="order-2 laptop:order-1 w-full h-1/2 laptop:w-1/2 laptop:h-full flex flex-col justify-center items-center p-8 laptop:p-12 z-10">
        <div className="w-full max-w-lg 4k:max-w-4xl text-xl 2k:text-3xl ultrawide:text-4xl 4k:text-5xl text-cream">
          {/* 1. LA CITATION */}
          <p className="italic font-medium leading-relaxed">
            &quot; Photographier, c&apos;est mettre sur la même ligne de mire la
            tête, l&apos;œil et le cœur. &quot;
          </p>

          {/* 2. L'AUTEUR */}
          <p className="text-right text-[0.8em] text-gray-600 mt-4 4k:mt-8 font-semibold">
            — Henri Cartier-Bresson
          </p>
        </div>
      </div>

      {/* 2. CONTAINER IMAGES */}
      <div className="order-1 laptop:order-2 w-full h-1/2 laptop:w-1/2 laptop:h-full relative bg-black">
        {/* IMAGE 1 (Celle du haut/droite) */}
        <div className="absolute top-10 right-10 tablet:top-20 tablet:right-20 laptop:top-60 laptop:right-20 desktop:top-40 desktop:right-20 w-48 tablet:w-90 laptop:w-60 desktop:w-90 2k:w-125 ultrawide:left-150 ultrawide:bottom-60 ultrawide:w-150 4k:left-200 4k:bottom-60 4k:w-200 aspect-square z-10">
          <Image
            src="/DarkPicture01.webp"
            alt="Description de la première image"
            fill
            className="object-cover"
          />
        </div>

        {/* IMAGE 2 (Celle du bas/gauche) */}
        <div className="absolute bottom-10 left-10 tablet:bottom-1 tablet:left-20 laptop:bottom-60 laptop:left-30 w-48 desktop:bottom-60 desktop:left-40 desktop:w-90 2k:w-125 ultrawide:left-40 ultrawide:bottom-60 ultrawide:w-150 4k:left-40 4k:bottom-60 4k:w-200  tablet:w-90 laptop:w-60 aspect-square z-20">
          <Image
            src="/DarkPicture02.webp"
            alt="Description de la deuxième image"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default DarkSection;
