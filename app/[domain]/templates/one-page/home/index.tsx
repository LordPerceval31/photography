import Image from "next/image";
import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import type { Theme } from "../../../themes/index";

interface Props {
  userId: string;
}

const OnePage = async ({ userId }: Props) => {
  const [config, photos, user] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { userId } }),
    prisma.photo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    }),
  ]);

  const themeSlug = (config?.templateConfig as { themeSlug?: string })?.themeSlug;
  const theme: Theme = themes[themeSlug ?? ""] ?? themes.default;

  const coverPhoto = photos.find((p) => p.isCover) ?? photos[0];
  const galleryPhotos = photos.filter((p) => !p.isCover);

  return (
    <main style={theme as React.CSSProperties} className="min-h-screen">
      {/* Hero */}
      <section
        id="hero"
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {coverPhoto && (
          <Image
            src={coverPhoto.url}
            alt={config?.heroName ?? "Photographe"}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-[var(--color-bg)]/50" />
        <div className="relative z-10 text-center px-4">
          <h1
            className="text-4xl tablet:text-6xl font-bold text-[var(--color-primary)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {config?.heroName || "Photographe"}
          </h1>
          {config?.heroTagline && (
            <p
              className="mt-4 text-lg tablet:text-2xl text-[var(--color-secondary)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {config.heroTagline}
            </p>
          )}
          {config?.heroSubtitle && (
            <p
              className="mt-2 text-sm tablet:text-base text-[var(--color-muted)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {config.heroSubtitle}
            </p>
          )}
          <a
            href="#contact"
            className="mt-8 inline-block px-6 py-3 border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg)] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Me contacter
          </a>
        </div>
      </section>

      {/* Galerie */}
      {galleryPhotos.length > 0 && (
        <section id="gallery" className="py-16 px-4 bg-[var(--color-bg)]">
          <div className="grid grid-cols-2 tablet:grid-cols-3 gap-2 max-w-5xl mx-auto">
            {galleryPhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden">
                <Image
                  src={photo.url}
                  alt={photo.title ?? ""}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section
        id="contact"
        className="py-20 px-4 text-center bg-[var(--color-bg)] border-t border-[var(--color-muted)]/20"
      >
        <h2
          className="text-3xl font-bold text-[var(--color-primary)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Contact
        </h2>
        <p
          className="mt-4 text-[var(--color-muted)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Une question, un projet ? Écrivez-moi.
        </p>
        {user?.email && (
          <a
            href={`mailto:${user.email}`}
            className="mt-6 inline-block text-[var(--color-secondary)] hover:text-[var(--color-primary)] underline text-lg transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {user.email}
          </a>
        )}
      </section>
    </main>
  );
};

export default OnePage;
