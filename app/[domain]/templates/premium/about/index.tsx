import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import type { Theme } from "../../../themes/index";
import BioSection from "./BioSection";
import StorySection from "./StorySection";
import PictureAboutWrapper from "./PictureAboutWrapper";
import NavBar from "../../../../_components/navBar";

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

  return (
    <main
      style={theme as React.CSSProperties}
      className="relative w-full min-h-screen bg-(--color-bg) text-(--color-text) cursor-default"
    >
      <NavBar />
      <BioSection userId={userId} />
      <StorySection userId={userId} />
      <PictureAboutWrapper userId={userId} />
    </main>
  );
};

export default ThreePageAbout;
