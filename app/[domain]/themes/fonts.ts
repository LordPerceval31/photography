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

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "600"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });
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
  heroSize: string; // classes Tailwind responsive pour le titre hero
};

// Mappe chaque slug de thème vers les font-family réelles chargées par next/font.
// heroSize ajuste la taille du titre selon le poids visuel de chaque police.
export const themeFonts: Record<string, ThemeFonts> = {
  default: {
    heading: cormorant.style.fontFamily,
    body: dmSans.style.fontFamily,
    heroSize: "text-6xl tablet:text-8xl laptop:text-9xl desktop:text-[12rem] ultrawide:text-[16rem] 4k:text-[18rem]",
  },
  argentic: {
    heading: cormorant.style.fontFamily,
    body: dmSans.style.fontFamily,
    heroSize: "text-6xl tablet:text-8xl laptop:text-9xl desktop:text-[12rem] ultrawide:text-[16rem] 4k:text-[18rem]",
  },
  sepia: {
    heading: playfair.style.fontFamily,
    body: lora.style.fontFamily,
    heroSize: "text-5xl tablet:text-7xl laptop:text-8xl desktop:text-[10rem] ultrawide:text-[13rem] 4k:text-[15rem]",
  },
  evenement: {
    heading: cormorant.style.fontFamily,
    body: raleway.style.fontFamily,
    heroSize: "text-6xl tablet:text-8xl laptop:text-9xl desktop:text-[12rem] ultrawide:text-[16rem] 4k:text-[18rem]",
  },
  nature: {
    heading: playfair.style.fontFamily,
    body: dmSans.style.fontFamily,
    heroSize: "text-5xl tablet:text-7xl laptop:text-8xl desktop:text-[10rem] ultrawide:text-[13rem] 4k:text-[15rem]",
  },
  voyage: {
    heading: oswald.style.fontFamily,
    body: barlow.style.fontFamily,
    heroSize: "text-5xl tablet:text-7xl laptop:text-8xl desktop:text-[10rem] ultrawide:text-[13rem] 4k:text-[15rem]",
  },
  portrait: {
    heading: cinzel.style.fontFamily,
    body: dmSans.style.fontFamily,
    heroSize: "text-4xl tablet:text-6xl laptop:text-7xl desktop:text-9xl ultrawide:text-[11rem] 4k:text-[13rem]",
  },
  street: {
    heading: bebas.style.fontFamily,
    body: barlow.style.fontFamily,
    heroSize: "text-7xl tablet:text-9xl laptop:text-[11rem] desktop:text-[15rem] ultrawide:text-[19rem] 4k:text-[22rem]",
  },
  cinema: {
    heading: cinzel.style.fontFamily,
    body: lora.style.fontFamily,
    heroSize: "text-4xl tablet:text-6xl laptop:text-7xl desktop:text-9xl ultrawide:text-[11rem] 4k:text-[13rem]",
  },
};
