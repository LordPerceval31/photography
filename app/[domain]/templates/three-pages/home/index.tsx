import Image from "next/image";
import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import type { Theme } from "../../../themes/index";
import { themeFonts } from "../../../themes/fonts";
import { Navbar } from "../../_components/navbar";
import GalleryMasonry from "../../_components/GalleryMasonry";

interface Props {
  userId: string;
}

const threePage = async ({ userId }: Props) => {
  const [config, photos] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { userId } }),
    prisma.photo.findMany({
      where: { userId },
      include: {
        galleries: { select: { galleryId: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const themeSlug = (config?.templateConfig as { themeSlug?: string })
    ?.themeSlug;
  const theme: Theme = themes[themeSlug ?? ""] ?? themes.default;
  const fonts = themeFonts[themeSlug ?? ""] ?? themeFonts.default;

  // --- LOGIQUE SEO ---
  const name = config?.heroName || "Photographe";
  const location = config?.seoLocation ? ` à ${config.seoLocation}` : "";
  const baseAlt = `${name}${location}`;

  const coverPhoto = photos.find((p) => p.isCover) ?? photos[0];
  const coverAlt = coverPhoto?.title
    ? `${coverPhoto.title} | ${baseAlt}`
    : `Accueil | ${baseAlt}`;

  const galleryPhotos = photos
    .filter((p) => !p.isCover)
    .map((p) => ({
      id: p.id,
      url: p.url,
      title: p.title,
      galleryId: p.galleries[0]?.galleryId ?? p.id,
      alt: p.title ? `${p.title} | ${baseAlt}` : `Portfolio | ${baseAlt}`,
    }));

  const hasBio = config?.bioParagraph1 || config?.bioParagraph2;

  return (
    <main
      style={theme as React.CSSProperties}
      className="bg-(--color-bg) text-(--color-text) relative cursor-default"
    >
      <Navbar fonts={fonts} showAbout={true} />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden">
        {coverPhoto ? (
          <Image
            src={coverPhoto.url}
            alt={coverAlt}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-(--color-bg)" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-(--color-bg) via-(--color-bg)/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-12 px-8 tablet:px-16">
          <div className="w-full ultrawide:w-[90%] ultrawide:mx-auto 4k:w-full 4k:mx-0">
            <div className="w-12 h-px bg-(--color-primary) opacity-60 mb-6" />
            <h1
              className={`${fonts.heroSize} font-semibold text-(--color-primary)`}
              style={{ fontFamily: fonts.heading }}
            >
              {config?.heroName || "Photographe"}
            </h1>
            {config?.heroTagline && (
              <p
                className={`mt-4 uppercase text-(--color-muted) ${fonts.taglineSize}`}
                style={{ fontFamily: fonts.body }}
              >
                {config.heroTagline}
              </p>
            )}
          </div>
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

      {/* ── BIO ───────────────────────────────────────────────── */}
      {hasBio && (
        <section className="px-8 tablet:px-16 py-20">
          <div className="w-full laptop:w-[70%] desktop:w-[60%] 2k:w-[50%] ultrawide:w-[50%] ultrawide:ml-120 4k:w-[50%] 4k:ml-0">
            <div className="border-l-2 border-(--color-primary) pl-8 laptop:pl-12">
              {config?.bioParagraph1 && (
                <p
                  className={`leading-relaxed text-(--color-text) opacity-80 italic ${fonts.headingScale}`}
                  style={{ fontFamily: fonts.heading }}
                >
                  {config.bioParagraph1}
                </p>
              )}
              {config?.bioParagraph2 && (
                <p
                  className={`mt-6 leading-relaxed text-(--color-muted) ${fonts.bodyScale}`}
                  style={{ fontFamily: fonts.body }}
                >
                  {config.bioParagraph2}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── GALERIE ───────────────────────────────────────────── */}
      {galleryPhotos.length > 0 && (
        <section className="px-4 tablet:px-8 py-16">
          <div className="w-full ultrawide:w-[70%] ultrawide:mx-auto 4k:w-full 4k:mx-0">
            <GalleryMasonry photos={galleryPhotos} />
          </div>
        </section>
      )}

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="px-8 tablet:px-16 py-8 border-t border-(--color-muted)/10">
        <div className="w-full ultrawide:w-[90%] ultrawide:mx-auto 4k:w-full 4k:mx-0">
          <span className="text-xs tablet:text-sm desktop:text-lg tracking-widest uppercase text-(--color-muted)">
            {config?.heroName || "Portfolio"}
          </span>
        </div>
      </footer>
    </main>
  );
};

export default threePage;
