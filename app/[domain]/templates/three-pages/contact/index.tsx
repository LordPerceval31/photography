import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import type { Theme } from "../../../themes/index";

interface Props {
  userId: string;
}

const ThreePagesContact = async ({ userId }: Props) => {
  const [config, user] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    }),
  ]);

  const themeSlug = (config?.templateConfig as { themeSlug?: string })?.themeSlug;
  const theme: Theme = themes[themeSlug ?? ""] ?? themes.default;

  return (
    <main
      style={theme as React.CSSProperties}
      className="min-h-screen flex items-center justify-center bg-(--color-bg) px-4"
    >
      <div className="text-center max-w-md w-full">
        <h1
          className="text-4xl font-bold text-(--color-primary)"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Contact
        </h1>
        <p
          className="mt-6 text-(--color-muted)"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Une question, un projet ? Écrivez-moi directement.
        </p>
        {user?.email && (
          <a
            href={`mailto:${user.email}`}
            className="mt-8 inline-block text-xl text-(--color-secondary) hover:text-(--color-primary) underline transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {user.email}
          </a>
        )}
      </div>
    </main>
  );
};

export default ThreePagesContact;
