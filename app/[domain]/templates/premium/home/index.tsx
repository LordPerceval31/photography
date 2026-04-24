import prisma from "@/app/lib/prisma";
import { themes, getNavTheme } from "../../../themes/index";
import type { Theme } from "../../../themes/index";
import { themeFonts } from "../../../themes/fonts";
import type { ThemeFonts } from "../../../themes/fonts";
import HeroSection from "./HeroSection";
import PremiumGalleryWrapper from "./PremiumGalleryWrapper";
import DarkSection from "./DarkSection";
import CarouselWrapper from "./CarouselWrapper";
import SmoothScroll from "@/app/_components/SmoothScroll";
import NavBar from "@/app/_components/navBar";

interface Props {
  userId: string;
}

const PremiumHome = async ({ userId }: Props) => {
  const config = await prisma.siteConfig.findUnique({ where: { userId } });
  const themeSlug = (config?.templateConfig as { themeSlug?: string })?.themeSlug;
  const theme: Theme = themes[themeSlug ?? ""] ?? themes.premium;
  const fonts: ThemeFonts = themeFonts[themeSlug ?? ""] ?? themeFonts.premium;
  const navTheme = getNavTheme(themeSlug);

  return (
    <main className="relative w-full" style={theme as React.CSSProperties}>
      <NavBar />
      <SmoothScroll>
        <HeroSection userId={userId} fonts={fonts} />
        <PremiumGalleryWrapper userId={userId} fonts={fonts} navTheme={navTheme} />
        <DarkSection userId={userId} fonts={fonts} />
        <CarouselWrapper userId={userId} fonts={fonts} navTheme={navTheme} />
      </SmoothScroll>
    </main>
  );
};

export default PremiumHome;
