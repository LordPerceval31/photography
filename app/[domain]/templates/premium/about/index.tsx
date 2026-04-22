import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import type { Theme } from "../../../themes/index";
import { themeFonts } from "../../../themes/fonts";
import { Navbar } from "../../_components/navbar";
import BioSection from "./BioSection";
import StorySection from "./StorySection";
import PictureAboutWrapper from "./PictureAboutWrapper";

interface Props {
  userId: string;
}

const ThreePageAbout = async ({ userId }: Props) => {
  // On récupère la configuration pour connaître le thème choisi
  const config = await prisma.siteConfig.findUnique({
    where: { userId },
  });

  const themeSlug = (config?.templateConfig as { themeSlug?: string })
    ?.themeSlug;
  const theme: Theme = themes[themeSlug ?? ""] ?? themes.default;
  const fonts = themeFonts[themeSlug ?? ""] ?? themeFonts.default;

  return (
    <main
      style={theme as React.CSSProperties}
      className="relative w-full min-h-screen bg-(--color-bg) text-(--color-text) cursor-default"
    >
      {/* On active explicitement le lien À propos dans la Navbar */}
      <Navbar fonts={fonts} showAbout={true} />

      <BioSection userId={userId} />
      <StorySection userId={userId} />
      <PictureAboutWrapper userId={userId} />
    </main>
  );
};

export default ThreePageAbout;
