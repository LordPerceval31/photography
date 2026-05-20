import Image from "next/image";
import prisma from "../../../../lib/prisma";
import type { ThemeFonts } from "../../../themes/fonts";
import { optimizeCloudinaryUrl } from "@/app/lib/cloudinary-url";

interface Props {
  userId: string;
  fonts: ThemeFonts;
}

const DarkSection = async ({ userId, fonts }: Props) => {
  const [config, darkPhoto1, darkPhoto2] = await Promise.all([
    prisma.siteConfig.findFirst({ where: { userId } }),
    prisma.photo.findFirst({
      where: { userId, isDarkPicture1: true },
      select: { url: true },
    }),
    prisma.photo.findFirst({
      where: { userId, isDarkPicture2: true },
      select: { url: true },
    }),
  ]);

  const quote =
    config?.darkQuote ||
    "Photographier, c'est mettre sur la même ligne de mire la tête, l'œil et le cœur.";
  const quoteAuthor = config?.darkQuoteAuthor || "Henri Cartier-Bresson";
  const image1 = optimizeCloudinaryUrl(darkPhoto1?.url ?? "/DarkPicture01.webp", 800);
  const image2 = optimizeCloudinaryUrl(darkPhoto2?.url ?? "/DarkPicture02.webp", 800);

  return (
    <section data-theme="dark" className="flex flex-col laptop:flex-row w-full h-screen laptop:h-[80vh] bg-black overflow-hidden">
      <div className="order-2 laptop:order-1 w-full h-1/2 laptop:w-1/2 laptop:h-full flex flex-col justify-center items-center p-8 laptop:p-12 z-10">
        <div className="w-full max-w-lg 4k:max-w-4xl text-xl 2k:text-3xl ultrawide:text-4xl 4k:text-5xl text-(--color-quote)">
          <p
            className="italic font-medium leading-relaxed cursor-default"
            style={{ fontFamily: fonts.heading }}
          >
            &quot; {quote} &quot;
          </p>
          <p
            className="text-right text-[0.8em] text-(--color-muted) mt-4 4k:mt-8 font-semibold cursor-default"
            style={{ fontFamily: fonts.body }}
          >
            — {quoteAuthor}
          </p>
        </div>
      </div>

      <div className="order-1 laptop:order-2 w-full h-1/2 laptop:w-1/2 laptop:h-full relative bg-black">
        <div className="absolute top-10 right-10 tablet:top-20 tablet:right-20 laptop:top-60 laptop:right-20 desktop:top-40 desktop:right-20 w-48 tablet:w-90 laptop:w-60 desktop:w-90 2k:w-125 ultrawide:left-150 ultrawide:bottom-60 ultrawide:w-150 4k:left-200 4k:bottom-60 4k:w-200 aspect-square z-10">
          <Image
            src={image1}
            alt={`Composition photographique — ${config?.seoTitle || "Portfolio"}`}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute bottom-10 left-10 tablet:bottom-1 tablet:left-20 laptop:bottom-60 laptop:left-30 w-48 desktop:bottom-60 desktop:left-40 desktop:w-90 2k:w-125 ultrawide:left-40 ultrawide:bottom-60 ultrawide:w-150 4k:left-40 4k:bottom-60 4k:w-200 tablet:w-90 laptop:w-60 aspect-square z-20">
          <Image
            src={image2}
            alt={`Mise en scène artistique — ${config?.seoTitle || "Portfolio"}`}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default DarkSection;
