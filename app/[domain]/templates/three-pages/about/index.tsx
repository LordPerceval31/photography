import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import { themeFonts } from "../../../themes/fonts";
import { Navbar } from "../../_components/navbar";
import BioSection from "./biosection";
import StorySection from "./storysection";
import PictureAboutWrapper from "./PictureAboutWrapper";

export default async function AboutPage({ userId }: { userId: string }) {
  // 1. On récupère la config pour le thème et les polices
  const config = await prisma.siteConfig.findUnique({
    where: { userId },
  });

  const themeSlug = (config?.templateConfig as { themeSlug?: string })
    ?.themeSlug;
  const theme = themes[themeSlug ?? ""] ?? themes.default;
  const fonts = themeFonts[themeSlug ?? ""] ?? themeFonts.default;

  return (
    <main
      id="main-content"
      style={theme as React.CSSProperties}
      className="bg-(--color-bg) min-h-screen flex flex-col cursor-default"
    >
      {/* On masque le lien "À propos" puisqu'on y est déjà */}
      <Navbar fonts={fonts} showAbout={true} />

      {/* On enchaîne tes sections avec le nouveau système de tokens CSS */}
      <div className="flex flex-col">
        <BioSection userId={userId} fonts={fonts} />

        <StorySection userId={userId} fonts={fonts} />

        <PictureAboutWrapper userId={userId} />
      </div>

      {/* Footer cohérent avec le reste du template */}
      <footer className="px-8 tablet:px-16 py-8 border-t border-(--color-muted)/10">
        <div className="w-full ultrawide:w-[90%] ultrawide:mx-auto">
          <span className="text-xs tablet:text-sm tracking-widest uppercase text-(--color-muted)">
            {config?.heroName || "Portfolio"} — About
          </span>
        </div>
      </footer>
    </main>
  );
}
