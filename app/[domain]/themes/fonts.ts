// app/[domain]/themes/fonts.ts

import {
  Cormorant_Garamond,
  Playfair_Display,
  Bebas_Neue,
  Oswald,
  Cinzel,
  DM_Sans,
  Lora,
  Barlow,
  Raleway,
} from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const bebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });
const oswald = Oswald({ subsets: ["latin"], weight: ["300", "400", "500"] });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400"] });
const lora = Lora({ subsets: ["latin"], weight: ["400", "500"] });
const barlow = Barlow({ subsets: ["latin"], weight: ["300", "400", "500"] });
const raleway = Raleway({ subsets: ["latin"], weight: ["300", "400"] });

export type ThemeFonts = {
  heading: string;
  body: string;
  heroSize: string;
  taglineSize: string;
  headingScale: string;
  bodyScale: string;
};

export const themeFonts: Record<string, ThemeFonts> = {
  default: {
    heading: cormorant.style.fontFamily,
    body: dmSans.style.fontFamily,
    heroSize:
      "text-6xl tablet:text-8xl laptop:text-9xl desktop:text-[12rem] ultrawide:text-[16rem] 4k:text-[18rem]",
    taglineSize:
      "text-sm tablet:text-base laptop:text-lg desktop:text-lg ultrawide:text-xl 4k:text-2xl tracking-[0.25em]",
    headingScale:
      "text-sm tablet:text-base laptop:text-lg desktop:text-lg ultrawide:text-3xl 4k:text-3xl",
    bodyScale:
      "text-xs tablet:text-sm laptop:text-base desktop:text-base ultrawide:text-2xl 4k:text-2xl",
  },
  argentic: {
    heading: cormorant.style.fontFamily,
    body: dmSans.style.fontFamily,
    heroSize:
      "text-6xl tablet:text-8xl laptop:text-9xl desktop:text-[12rem] ultrawide:text-[16rem] 4k:text-[18rem]",
    taglineSize:
      "text-sm tablet:text-base laptop:text-lg desktop:text-lg ultrawide:text-xl 4k:text-2xl tracking-[0.25em]",
    headingScale:
      "text-sm tablet:text-base laptop:text-lg desktop:text-lg ultrawide:text-3xl 4k:text-3xl",
    bodyScale:
      "text-xs tablet:text-sm laptop:text-base desktop:text-base ultrawide:text-2xl 4k:text-2xl",
  },
  sepia: {
    heading: playfair.style.fontFamily,
    body: lora.style.fontFamily,
    heroSize:
      "text-5xl tablet:text-7xl laptop:text-8xl desktop:text-[10rem] ultrawide:text-[13rem] 4k:text-[15rem]",
    taglineSize:
      "text-base tablet:text-lg laptop:text-xl desktop:text-xl ultrawide:text-2xl 4k:text-3xl tracking-[0.2em]",
    headingScale:
      "text-base tablet:text-lg laptop:text-xl desktop:text-xl ultrawide:text-4xl 4k:text-4xl",
    bodyScale:
      "text-xs tablet:text-sm laptop:text-base desktop:text-base ultrawide:text-2xl 4k:text-2xl",
  },
  evenement: {
    heading: cormorant.style.fontFamily,
    body: raleway.style.fontFamily,
    heroSize:
      "text-6xl tablet:text-8xl laptop:text-9xl desktop:text-[12rem] ultrawide:text-[16rem] 4k:text-[18rem]",
    taglineSize:
      "text-base tablet:text-lg laptop:text-xl desktop:text-xl ultrawide:text-2xl 4k:text-3xl tracking-[0.3em]",
    headingScale:
      "text-base tablet:text-lg laptop:text-xl desktop:text-xl ultrawide:text-4xl 4k:text-4xl",
    bodyScale:
      "text-xs tablet:text-sm laptop:text-base desktop:text-base ultrawide:text-2xl 4k:text-2xl",
  },
  nature: {
    heading: playfair.style.fontFamily,
    body: dmSans.style.fontFamily,
    heroSize:
      "text-5xl tablet:text-7xl laptop:text-8xl desktop:text-[10rem] ultrawide:text-[13rem] 4k:text-[15rem]",
    taglineSize:
      "text-base tablet:text-lg laptop:text-xl desktop:text-xl ultrawide:text-2xl 4k:text-3xl tracking-[0.2em]",
    headingScale:
      "text-base tablet:text-lg laptop:text-xl desktop:text-xl ultrawide:text-4xl 4k:text-4xl",
    bodyScale:
      "text-xs tablet:text-sm laptop:text-base desktop:text-base ultrawide:text-2xl 4k:text-2xl",
  },
  voyage: {
    heading: oswald.style.fontFamily,
    body: barlow.style.fontFamily,
    heroSize:
      "text-5xl tablet:text-7xl laptop:text-8xl desktop:text-[10rem] ultrawide:text-[13rem] 4k:text-[15rem]",
    taglineSize:
      "text-base tablet:text-lg laptop:text-xl desktop:text-xl ultrawide:text-2xl 4k:text-3xl tracking-[0.3em]",
    headingScale:
      "text-base tablet:text-lg laptop:text-xl desktop:text-xl ultrawide:text-4xl 4k:text-4xl uppercase tracking-wider",
    bodyScale:
      "text-xs tablet:text-sm laptop:text-base desktop:text-base ultrawide:text-2xl 4k:text-2xl",
  },
  portrait: {
    heading: cinzel.style.fontFamily,
    body: dmSans.style.fontFamily,
    heroSize:
      "text-4xl tablet:text-6xl laptop:text-7xl desktop:text-9xl ultrawide:text-[11rem] 4k:text-[13rem]",
    taglineSize:
      "text-sm tablet:text-base laptop:text-lg desktop:text-lg ultrawide:text-xl 4k:text-2xl tracking-[0.25em]",
    headingScale:
      "text-sm tablet:text-base laptop:text-lg desktop:text-lg ultrawide:text-3xl 4k:text-3xl",
    bodyScale:
      "text-xs tablet:text-sm laptop:text-sm desktop:text-sm ultrawide:text-xl 4k:text-xl",
  },
  street: {
    heading: bebas.style.fontFamily,
    body: barlow.style.fontFamily,
    heroSize:
      "text-7xl tablet:text-9xl laptop:text-[11rem] desktop:text-[15rem] ultrawide:text-[19rem] 4k:text-[22rem]",
    taglineSize:
      "text-lg tablet:text-xl laptop:text-2xl desktop:text-2xl ultrawide:text-3xl 4k:text-4xl tracking-[0.4em]",
    headingScale:
      "text-lg tablet:text-xl laptop:text-2xl desktop:text-2xl ultrawide:text-5xl 4k:text-5xl tracking-wide",
    bodyScale:
      "text-sm tablet:text-base laptop:text-lg desktop:text-lg ultrawide:text-3xl 4k:text-3xl",
  },
  cinema: {
    heading: cinzel.style.fontFamily,
    body: lora.style.fontFamily,
    heroSize:
      "text-4xl tablet:text-6xl laptop:text-7xl desktop:text-9xl ultrawide:text-[11rem] 4k:text-[13rem]",
    taglineSize:
      "text-sm tablet:text-base laptop:text-lg desktop:text-lg ultrawide:text-xl 4k:text-2xl tracking-[0.2em]",
    headingScale:
      "text-sm tablet:text-base laptop:text-lg desktop:text-lg ultrawide:text-3xl 4k:text-3xl",
    bodyScale:
      "text-xs tablet:text-sm laptop:text-sm desktop:text-sm ultrawide:text-xl 4k:text-xl",
  },
};
