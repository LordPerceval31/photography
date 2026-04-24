import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import type { Theme } from "../../../themes/index";
import { themeFonts } from "../../../themes/fonts";
import type { ThemeFonts } from "../../../themes/fonts";
import BioSection from "./BioSection";
import StorySection from "./StorySection";
import PictureAboutWrapper from "./PictureAboutWrapper";
import NavBar from "../../../../_components/navBar";

interface Props {
  userId: string;
}

const PremiumAbout = async ({ userId }: Props) => {
  const config = await prisma.siteConfig.findUnique({ where: { userId } });
  const themeSlug = (config?.templateConfig as { themeSlug?: string })?.themeSlug;
  const theme: Theme = themes[themeSlug ?? ""] ?? themes.premium;
  const fonts: ThemeFonts = themeFonts[themeSlug ?? ""] ?? themeFonts.premium;

  return (
    <main
      style={theme as React.CSSProperties}
      className="relative w-full min-h-screen bg-(--color-bg) text-(--color-text) cursor-default"
    >
      <NavBar />
      <BioSection userId={userId} fonts={fonts} />
      <StorySection userId={userId} fonts={fonts} />
      <PictureAboutWrapper userId={userId} />
    </main>
  );
};

export default PremiumAbout;
