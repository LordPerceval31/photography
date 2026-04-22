import prisma from "@/app/lib/prisma";
import { themes } from "../../../themes/index";
import { themeFonts } from "../../../themes/fonts";
import { Navbar } from "../../_components/navbar";
import ContactForm from "../../_components/ContactForm";
import ServicesSection from "../../premium/services/ServicesSection";

export default async function ContactPage({ userId }: { userId: string }) {
  // On récupère les services en même temps que le reste
  const [config, user, services] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailjsServiceId: true,
        emailjsTemplateId: true,
        emailjsPublicKey: true,
      },
    }),
    prisma.service.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    }),
  ]);

  const themeSlug = (config?.templateConfig as { themeSlug?: string })
    ?.themeSlug;
  const theme = themes[themeSlug ?? ""] ?? themes.default;
  const fonts = themeFonts[themeSlug ?? ""] ?? themeFonts.default;

  return (
    <main
      style={theme as React.CSSProperties}
      className="bg-(--color-bg) min-h-screen flex flex-col cursor-default"
    >
      <Navbar fonts={fonts} showAbout={true} />

      <section className="flex-1 flex flex-col pt-32 pb-24 desktop:py-24 desktop:justify-center px-8 tablet:px-24">
        {services.length > 0 && (
          <div className="mb-16 -mx-8 tablet:mx-0">
            {/* Le -mx-8 sur mobile évite d'écraser les cartes si ton ServicesSection a déjà des paddings internes */}
            <ServicesSection services={services} />
          </div>
        )}

        <div className="w-full laptop:w-[70%] desktop:w-[70%] 2k:w-[60%] 4k:w-[50%] desktop:mx-auto">
          <h1
            className="text-5xl tablet:text-7xl laptop:text-8xl desktop:text-[10rem] ultrawide:text-[13rem] 4k:text-[15rem] font-light text-(--color-primary) mb-8"
            style={{ fontFamily: fonts.heading }}
          >
            Contact
          </h1>

          {/* ── TEXTE DYNAMIQUE DU PHOTOGRAPHE ── */}
          {config?.contactText && (
            <p
              className="text-base tablet:text-lg 2k:text-2xl 4k:text-4xl text-(--color-text) opacity-80 mb-12 leading-relaxed"
              style={{ fontFamily: fonts.body }}
            >
              {config.contactText}
            </p>
          )}

          {/* ── FORMULAIRE DE CONTACT ── */}
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
}
