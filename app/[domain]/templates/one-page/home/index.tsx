import Image from "next/image";
import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import type { Theme } from "../../../themes/index";
import { themeFonts } from "../../../themes/fonts";
import ContactForm from "./ContactForm";
import GalleryMasonry from "./GalleryMasonry";

interface Props {
  userId: string;
}

const OnePage = async ({ userId }: Props) => {
  const [config, photos, user] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { userId } }),
    prisma.photo.findMany({
      where: { userId },
      include: {
        galleries: { select: { galleryId: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailjsServiceId: true,
        emailjsTemplateId: true,
        emailjsPublicKey: true,
      },
    }),
  ]);

  const themeSlug = (config?.templateConfig as { themeSlug?: string })
    ?.themeSlug;
  const theme: Theme = themes[themeSlug ?? ""] ?? themes.default;
  const fonts = themeFonts[themeSlug ?? ""] ?? themeFonts.default;

  const coverPhoto = photos.find((p) => p.isCover) ?? photos[0];
  const galleryPhotos = photos
    .filter((p) => !p.isCover)
    .map((p) => ({
      id: p.id,
      url: p.url,
      title: p.title,
      galleryId: p.galleries[0]?.galleryId ?? p.id,
    }));
  const hasBio = config?.bioParagraph1 || config?.bioParagraph2;

  return (
    <main
      style={theme as React.CSSProperties}
      className="bg-(--color-bg) text-(--color-text)"
    >
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden">
        {coverPhoto ? (
          <Image
            src={coverPhoto.url}
            alt={config?.heroName ?? "Portfolio"}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-(--color-bg)" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-(--color-bg) via-(--color-bg)/30 to-transparent" />

        <div className="absolute bottom-12 left-8 right-8 tablet:left-16 tablet:right-16">
          <div className="w-12 h-px bg-(--color-primary) opacity-60 mb-6" />
          <h1
            className={`${fonts.heroSize} font-semibold text-(--color-primary)`}
            style={{ fontFamily: fonts.heading }}
          >
            {config?.heroName || "Photographe"}
          </h1>
          {config?.heroTagline && (
            <p
              className="mt-4 text-xl tracking-[0.25em] uppercase text-(--color-muted)"
              style={{ fontFamily: fonts.body }}
            >
              {config.heroTagline}
            </p>
          )}
        </div>

        <div className="absolute bottom-8 right-8 tablet:right-16 flex flex-col items-center gap-2 opacity-40">
          <span
            className="text-xs tracking-widest uppercase text-(--color-muted) [writing-mode:vertical-lr]"
            style={{ fontFamily: fonts.body }}
          >
            scroll
          </span>
          <div className="w-px h-12 bg-(--color-muted)" />
        </div>
      </section>

      {/* ── GALERIE ───────────────────────────────────────────── */}
      {galleryPhotos.length > 0 && (
        <section className="px-4 tablet:px-8 py-16">
          <GalleryMasonry photos={galleryPhotos} />
        </section>
      )}

      {/* ── BIO ───────────────────────────────────────────────── */}
      {hasBio && (
        <section className="px-8 tablet:px-24 py-20 max-w-3xl">
          <div className="border-l-2 border-(--color-primary) pl-8">
            {config?.bioParagraph1 && (
              <p
                className="text-lg tablet:text-xl leading-relaxed text-(--color-text) opacity-80 italic"
                style={{ fontFamily: fonts.heading }}
              >
                {config.bioParagraph1}
              </p>
            )}
            {config?.bioParagraph2 && (
              <p
                className="mt-4 text-base leading-relaxed text-(--color-muted)"
                style={{ fontFamily: fonts.body }}
              >
                {config.bioParagraph2}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── CONTACT ───────────────────────────────────────────── */}
      <section className="px-8 tablet:px-24 py-24 border-t border-(--color-muted)/10">
        <div className="max-w-2xl">
          <h2
            className="text-4xl tablet:text-6xl font-light text-(--color-primary) mb-12"
            style={{ fontFamily: fonts.heading }}
          >
            Contact
          </h2>
          <ContactForm
            emailjsServiceId={user?.emailjsServiceId ?? null}
            emailjsTemplateId={user?.emailjsTemplateId ?? null}
            emailjsPublicKey={user?.emailjsPublicKey ?? null}
            fonts={fonts}
          />
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer
        className="px-8 tablet:px-24 py-8 border-t border-(--color-muted)/10"
        style={{ fontFamily: fonts.body }}
      >
        <span className="text-xs tracking-widest uppercase text-(--color-muted)">
          {config?.heroName || "Portfolio"}
        </span>
      </footer>
    </main>
  );
};

export default OnePage;
