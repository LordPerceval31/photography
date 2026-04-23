import Image from "next/image";
import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import type { Theme } from "../../../themes/index";
import { themeFonts } from "../../../themes/fonts";
import ContactForm from "../../_components/ContactForm";
import GalleryMasonry from "../../_components/GalleryMasonry";

interface Props {
  userId: string;
}

const OnePage = async ({ userId }: Props) => {
  const [config, photos, user] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { userId } }),
    prisma.photo.findMany({
      where: { userId },
      select: {
        id: true,
        url: true,
        title: true,
        isCover: true,
        isPortrait: true,
        isAboutPicture1: true,
        isAboutPicture2: true,
        isAboutPicture3: true,
        createdAt: true,
        galleries: {
          select: { galleryId: true },
          take: 1,
        },
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

  // --- LOGIQUE SEO ---
  const name = config?.heroName || "Photographe";
  const location = config?.seoLocation ? ` à ${config.seoLocation}` : "";
  const baseAlt = `${name}${location}`;

  const coverPhoto = photos.find((p) => p.isCover) ?? photos[0];
  const coverAlt = coverPhoto?.title
    ? `${coverPhoto.title} | ${baseAlt}`
    : `Accueil | ${baseAlt}`;

  const galleryPhotos = photos.map((p) => ({
    id: p.id,
    url: p.url,
    title: p.title,
    galleryId: p.galleries[0]?.galleryId ?? p.id,
    alt: p.title ? `${p.title} | ${baseAlt}` : `Portfolio | ${baseAlt}`,
    isCover: p.isCover,
    isPortrait: p.isPortrait,
    isAboutPicture1: p.isAboutPicture1,
    isAboutPicture2: p.isAboutPicture2,
    isAboutPicture3: p.isAboutPicture3,
  }));

  const hasBio = config?.bioParagraph1 || config?.bioParagraph2;

  return (
    <main
      style={theme as React.CSSProperties}
      className="bg-(--color-bg) text-(--color-text) cursor-default"
    >
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
          {/* LE mx-auto A ÉTÉ SUPPRIMÉ ICI. La bio reste alignée à gauche avec tes valeurs. */}
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
          {/* Centré à 70% UNIQUEMENT en ultrawide, remis à 100% en 4k */}
          <div className="w-full ultrawide:w-[70%] ultrawide:mx-auto 4k:w-full 4k:mx-0">
            <GalleryMasonry photos={galleryPhotos} />
          </div>
        </section>
      )}

      {/* ── CONTACT ───────────────────────────────────────────── */}
      <section className="px-8 tablet:px-16 py-24 border-t border-(--color-muted)/10">
        {/* Tes propres tailles restaurées, avec le 70% isolé sur ultrawide */}
        <div className="w-full laptop:w-[85%] desktop:w-[75%] ultrawide:w-[70%] 4k:w-[65%] mx-auto">
          <h2
            className="text-5xl tablet:text-7xl laptop:text-8xl desktop:text-[8rem] ultrawide:text-[10rem] 4k:text-[12rem] font-light text-(--color-primary) mb-12"
            style={{ fontFamily: fonts.heading }}
          >
            Contact
          </h2>
          {/* ── TEXTE DYNAMIQUE DU PHOTOGRAPHE ── */}
          {config?.contactText && (
            <p
              className="text-base tablet:text-lg 2k:text-2xl 4k:text-4xl text-(--color-text) opacity-80 mb-12 leading-relaxed cursor-default"
              style={{ fontFamily: fonts.body }}
            >
              {config.contactText}
            </p>
          )}
          <div className="w-full tablet:w-[90%] laptop:w-[85%] desktop:w-[80%] 2k:w-[75%] ultrawide:w-[70%] 4k:w-[70%]">
            <ContactForm
              emailjsServiceId={user?.emailjsServiceId ?? null}
              emailjsTemplateId={user?.emailjsTemplateId ?? null}
              emailjsPublicKey={user?.emailjsPublicKey ?? null}
              fonts={fonts}
            />
          </div>
        </div>
      </section>

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

export default OnePage;
