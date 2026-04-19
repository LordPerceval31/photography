import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import type { Theme } from "../../../themes/index";

interface Props {
  userId: string;
}

const ThreePagesAbout = async ({ userId }: Props) => {
  const config = await prisma.siteConfig.findUnique({ where: { userId } });

  const themeSlug = (config?.templateConfig as { themeSlug?: string })?.themeSlug;
  const theme: Theme = themes[themeSlug ?? ""] ?? themes.default;

  return (
    <main
      style={theme as React.CSSProperties}
      className="min-h-screen bg-[var(--color-bg)] py-20 px-4"
    >
      <div className="max-w-2xl mx-auto">
        {config?.bioTitle && (
          <h1
            className="text-4xl font-bold text-[var(--color-primary)] mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {config.bioTitle}
          </h1>
        )}
        {config?.bioParagraph1 && (
          <p
            className="text-[var(--color-text)] leading-relaxed mb-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {config.bioParagraph1}
          </p>
        )}
        {config?.bioParagraph2 && (
          <p
            className="text-[var(--color-text)] leading-relaxed mb-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {config.bioParagraph2}
          </p>
        )}
        {config?.storyParagraph1 && (
          <p
            className="text-[var(--color-muted)] leading-relaxed mt-8 italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {config.storyParagraph1}
          </p>
        )}
        {config?.storyParagraph2 && (
          <p
            className="text-[var(--color-muted)] leading-relaxed mt-4 italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {config.storyParagraph2}
          </p>
        )}
      </div>
    </main>
  );
};

export default ThreePagesAbout;
