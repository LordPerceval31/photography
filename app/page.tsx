"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendContactEmail, type ContactFormState } from "@/app/actions/contact";

const GALLERY_PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80",
    alt: "Street",
  },
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    alt: "Portrait",
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80",
    alt: "Paysage",
  },
  {
    src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80",
    alt: "Studio",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    alt: "Montagne",
  },
  {
    src: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=600&q=80",
    alt: "Auto",
  },
  {
    src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80",
    alt: "Soirée",
  },
  {
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    alt: "Édito",
  },
] as const;

const PRICING_FEATURES = [
  "Site vitrine complet pour présenter votre travail",
  "Envoyez des galeries privées à vos clients",
  "votre nom de domaine personnalisé",
  "Améliorez votre vitrine au fil de vos envies",
  "Proposez vos propres services",
];

export default function LandingPage() {
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(sendContactEmail, { success: false });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Photolio",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "89.00",
      priceCurrency: "EUR",
    },
    creator: {
      "@type": "Organization",
      name: "Levynix Studio",
      location: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Toulouse",
          addressCountry: "FR",
        },
      },
    },
  };

  return (
    <>
      {/* 👇 AJOUT SEO : Injection du script JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-background text-foreground min-h-screen overflow-x-hidden selection:bg-blue selection:text-white">
        {/* ── HEADER ── */}
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[calc(100%-32px)] tablet:w-[70%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-600 px-4 py-3 2k:px-6 2k:py-4 4k:px-10 4k:py-8 glass-premium rounded-full transition-all duration-300">
          <span className="font-extrabold text-[15px] 2k:text-[18px] 4k:text-2xl tracking-tight text-cream cursor-default">
            Photolio.fr
          </span>
          <Link
            href="/login"
            className="px-4 py-2 2k:px-6 2k:py-3 4k:px-10 4k:py-5 bg-cream text-dark rounded-full text-xs 2k:text-sm 4k:text-xl font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            Espace Pro
          </Link>
        </header>

        {/* ── HERO ── */}
        <section className="relative min-h-svh flex flex-col justify-end pb-16 laptop:pb-24 desktop:pb-32 2k:pb-40 ultrawide:pb-52 4k:pb-72 px-4">
          <div className="absolute inset-0">
            <Image
              src="/landing-hero-bg.webp"
              alt="Arrière-plan sombre et élégant Photolio"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-80"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
          </div>

          <div className="relative z-10 w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-600 mx-auto flex flex-col items-start text-left 4k:translate-y-24 4k:-translate-x-70 transition-transform duration-500">
            {/* AJOUT SEO : Le VRAI H1 pour Google et les liseuses d'écran */}
            <h1 className="sr-only">
              Photolio : Le logiciel SaaS et créateur de sites vitrines pour
              photographes professionnels ou amateurs
            </h1>

            {/* Le texte visuel passe en <p> et est caché aux liseuses avec aria-hidden */}
            <p
              aria-hidden="true"
              className="text-4xl tablet:text-5xl laptop:text-[3.5rem] desktop:text-[4.5rem] 2k:text-[6rem] ultrawide:text-[8rem] 4k:text-[12rem] font-bold leading-[1.15] 2k:leading-[1.1] text-cream mb-6 laptop:mb-8 desktop:mb-10 2k:mb-12 4k:mb-20 cursor-default"
            >
              Votre œuvre.
              <br />
              <span className="text-blue font-medium italic pr-2 cursor-default">
                Votre outil.
              </span>
            </p>

            <p className="text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-5xl text-cream/60 max-w-md laptop:max-w-lg desktop:max-w-2xl 2k:max-w-3xl 4k:max-w-6xl mb-10 laptop:mb-12 desktop:mb-16 2k:mb-20 4k:mb-32 leading-relaxed  cursor-default">
              Votre site vitrine. Vos galeries privées. Un espace pensé pour
              sublimer vos images, sans aucune friction technique.
            </p>

            <a
              href="#contact"
              className="px-8 py-4 laptop:px-10 laptop:py-4 desktop:px-12 desktop:py-5 2k:px-16 2k:py-6 4k:px-24 4k:py-10 bg-blue/10 border border-blue/30 text-cream rounded-full text-sm desktop:text-base 2k:text-xl 4k:text-4xl font-semibold tracking-wide hover:bg-blue hover:border-blue transition-all duration-300 w-full tablet:w-auto text-center backdrop-blur-sm"
            >
              Réserver mon accès
            </a>
          </div>
        </section>

        {/* ── BENTO GRID ── */}
        <section className="w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-700 mx-auto px-4 py-20 laptop:py-32 desktop:py-40 2k:py-56 4k:py-80">
          <div className="mb-10 laptop:mb-16 desktop:mb-20 2k:mb-24 4k:mb-40 text-center tablet:text-left">
            {/* AJOUT SEO : Le H2 invisible */}
            <h2 className="sr-only">
              Galeries privées et portfolios sans commission
            </h2>

            {/* LE DESIGN : Le titre visuel */}
            <p
              aria-hidden="true"
              className="text-3xl tablet:text-5xl laptop:text-6xl desktop:text-7xl 2k:text-8xl 4k:text-[11rem] font-extrabold tracking-tight text-cream mb-4 leading-tight cursor-default"
            >
              Conçu pour l&apos;image.
            </p>
          </div>

          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 laptop:gap-8 desktop:gap-12 2k:gap-16 4k:gap-24">
            <div className="glass-card rounded-3xl 2k:rounded-[40px] 4k:rounded-[80px] p-6 tablet:p-8 laptop:p-12 desktop:p-16 2k:p-20 4k:p-32 flex flex-col justify-between">
              <div>
                <h3 className="text-xl laptop:text-2xl desktop:text-3xl 2k:text-4xl 4k:text-7xl font-bold tracking-tight text-cream mb-2 desktop:mb-4 2k:mb-6 4k:mb-12 cursor-default">
                  Galeries Client
                </h3>
                <p className="text-sm laptop:text-base desktop:text-lg 2k:text-xl 4k:text-4xl text-cream/60 leading-relaxed cursor-default">
                  Un lien sécurisé. Vos clients téléchargent leurs photos en un
                  clic, sans créer de compte.
                </p>
              </div>

              <div className="relative w-full flex-1 min-h-55 laptop:min-h-72 desktop:min-h-96 2k:min-h-125 4k:min-h-180 flex items-center justify-center my-6 laptop:my-10 desktop:my-16 2k:my-20 4k:my-40">
                {/* Image de gauche en arrière-plan */}
                <div className="absolute w-28 laptop:w-36 desktop:w-48 2k:w-64 4k:w-110 aspect-3/4 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] overflow-hidden -rotate-6 -translate-x-12 laptop:-translate-x-16 desktop:-translate-x-24 2k:-translate-x-32 4k:-translate-x-56 shadow-2xl border border-white/5 opacity-50 transition-transform hover:-rotate-12 duration-500">
                  <Image
                    src={GALLERY_PHOTOS[4].src}
                    fill
                    sizes="300px"
                    alt="Aperçu gauche"
                    className="object-cover"
                  />
                </div>

                {/* NOUVELLE : Image de droite en arrière-plan */}
                <div className="absolute w-28 laptop:w-36 desktop:w-48 2k:w-64 4k:w-110 aspect-3/4 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] overflow-hidden rotate-6 translate-x-12 laptop:translate-x-16 desktop:translate-x-24 2k:translate-x-32 4k:translate-x-56 shadow-2xl border border-white/5 opacity-50 transition-transform hover:rotate-12 duration-500">
                  <Image
                    src={
                      GALLERY_PHOTOS[1].src
                    } /* Tu peux changer l'index ici pour une autre photo */
                    fill
                    sizes="300px"
                    alt="Aperçu droite"
                    className="object-cover"
                  />
                </div>

                {/* Image centrale au premier plan (z-10) */}
                <div className="absolute w-32 laptop:w-44 desktop:w-56 2k:w-72 4k:w-125 aspect-3/4 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] overflow-hidden z-10 shadow-2xl border border-white/10 transition-transform hover:scale-105 duration-500">
                  <Image
                    src={GALLERY_PHOTOS[2].src}
                    fill
                    sizes="400px"
                    alt="Aperçu centre"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 laptop:py-4 desktop:py-5 bg-blue/10 border border-blue/20 rounded-xl text-xs laptop:text-sm text-blue font-mono truncate">
                <span>🔗</span>
                <span className="truncate cursor-default">
                  photolio.fr/g/mariage...
                </span>
              </div>
            </div>

            <div className="relative glass-card rounded-3xl 2k:rounded-[40px] 4k:rounded-[80px] p-6 tablet:p-8 laptop:p-12 desktop:p-16 2k:p-20 4k:p-32 flex flex-col border border-blue/20 bg-blue/5">
              <span className="absolute -top-3.5 4k:-top-6 left-8 4k:left-32 bg-blue text-cream text-[11px] 2k:text-base 4k:text-3xl font-bold px-4 py-1 4k:px-12 4k:py-4 rounded-full tracking-wider cursor-default">
                Offre de lancement
              </span>

              <div className="flex flex-col mt-4">
                {/* PRIX BARRÉ AJOUTÉ ICI */}
                <span className="text-xl laptop:text-2xl desktop:text-3xl 2k:text-5xl 4k:text-[6rem] font-bold text-cream/40 line-through -mb-2 laptop:mb-3 2k:mb-6 4k:mb-12 ml-1 cursor-default">
                  149 €
                </span>
                <div className="flex items-start">
                  <p className="text-[64px] laptop:text-[88px] desktop:text-[120px] 2k:text-[160px] 4k:text-[280px] font-extrabold tracking-tight leading-none text-cream cursor-default">
                    89
                  </p>
                  <span className="text-2xl desktop:text-4xl 2k:text-6xl 4k:text-[10rem] font-bold text-cream mt-2 ml-1 cursor-default">
                    €
                  </span>
                </div>
              </div>

              <p className="text-[12px] 2k:text-xl 4k:text-4xl text-blue tracking-wide mt-2 mb-8 cursor-default">
                paiement unique · accès à vie
              </p>
              <ul className="space-y-0 w-full mt-auto">
                {PRICING_FEATURES.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 py-3 laptop:py-4 border-b border-cream/5 text-sm laptop:text-base 2k:text-xl 4k:text-5xl text-cream/70 last:border-b-0 cursor-default"
                  >
                    <span className="text-blue font-bold">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── DÉMO EN DIRECT ── */}
        <section className="w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-700 mx-auto px-4 py-20 laptop:py-32 desktop:py-40 2k:py-56 4k:py-80">
          <div className="mb-10 laptop:mb-16 desktop:mb-20 2k:mb-24 4k:mb-40 text-center tablet:text-left">
            <h2 className="text-3xl tablet:text-5xl laptop:text-6xl desktop:text-7xl 2k:text-8xl 4k:text-[11rem] font-extrabold tracking-tight text-cream mb-4 leading-tight cursor-default">
              Le résultat final.
            </h2>
          </div>

          <div className="glass-card rounded-3xl 2k:rounded-[40px] 4k:rounded-[80px] p-6 tablet:p-10 laptop:p-14 desktop:p-20 flex flex-col laptop:flex-row items-center gap-10 laptop:gap-16">
            <div className="w-full laptop:w-1/2 flex flex-col items-start text-left">
              <h3 className="text-2xl laptop:text-3xl desktop:text-4xl 2k:text-5xl 4k:text-7xl font-bold tracking-tight text-cream mb-4 cursor-default">
                Portfolio &quot;Cuisine &amp; Art de vivre&quot;
              </h3>
              <p className="text-sm laptop:text-base desktop:text-lg 2k:text-xl 4k:text-4xl text-cream/60 leading-relaxed mb-8 laptop:mb-12 cursor-default">
                Ne vous contentez pas de promesses. Visitez un exemple concret
                de site vitrine généré avec Photolio. Explorez les galeries,
                testez la fluidité de navigation et imaginez vos propres photos
                à la place.
              </p>

              <a
                href="https://demo-cuisine.photolio.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 laptop:px-10 desktop:px-12 bg-blue text-cream rounded-full text-sm desktop:text-base 2k:text-xl 4k:text-4xl font-bold tracking-tight hover:opacity-90 transition-all flex items-center gap-3 w-full tablet:w-auto justify-center"
              >
                Explorer la démo
                <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </a>
            </div>

            <a
              href="https://demo-cuisine.photolio.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full laptop:w-1/2 relative aspect-video rounded-2xl 2k:rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
            >
              <Image
                src="/kitchen.webp"
                alt="Aperçu du site de démonstration"
                fill
                className="object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-blue/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-dark/80 backdrop-blur-md text-cream px-6 py-3 rounded-full text-sm font-semibold border border-white/10 shadow-lg">
                  Ouvrir le site complet
                </span>
              </div>
            </a>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section
          id="contact"
          className="w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 4k:max-w-700 mx-auto px-4 py-24 laptop:py-32 desktop:py-40 2k:py-56 4k:py-96"
        >
          <div className="text-center laptop:text-left mb-10 laptop:mb-16 desktop:mb-24 4k:mb-48">
            <h2 className="text-3xl tablet:text-4xl laptop:text-5xl 2k:text-7xl 4k:text-[10rem] font-extrabold tracking-tight text-cream mb-4 4k:mb-16 cursor-default">
              Demander un accès
            </h2>
            <p className="text-sm laptop:text-base 2k:text-2xl 4k:text-5xl text-cream/60 max-w-lg laptop:max-w-2xl 4k:max-w-7xl mx-auto laptop:mx-0 cursor-default">
              Parlez-moi de votre activité, je crée votre espace sous 24h.
            </p>
          </div>

          <form
            action={formAction}
            className="glass-card p-6 tablet:p-10 laptop:p-14 desktop:p-20 rounded-3xl flex flex-col gap-6 laptop:gap-8"
          >
            <div className="flex flex-col tablet:flex-row gap-6 laptop:gap-8">
              <input
                name="name"
                type="text"
                placeholder="Votre nom"
                required
                className="glass-input w-full p-4 2k:p-8 rounded-xl text-sm 2k:text-xl text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors"
              />
              {/* CHAMP TÉLÉPHONE OPTIONNEL */}
              <input
                name="phone"
                type="tel"
                placeholder="Téléphone (optionnel)"
                className="glass-input w-full p-4 2k:p-8 rounded-xl text-sm 2k:text-xl text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors"
              />
            </div>
            <input
              name="email"
              type="email"
              placeholder="Votre email"
              required
              className="glass-input w-full p-4 2k:p-8 rounded-xl text-sm 2k:text-xl text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors"
            />
            <textarea
              name="message"
              placeholder="Détails sur vos besoins..."
              required
              className="glass-input w-full p-4 2k:p-8 rounded-xl text-sm 2k:text-xl text-cream placeholder:text-cream/30 min-h-40 resize-none outline-none focus:border-blue transition-colors"
            />

            <button
              type="submit"
              disabled={isPending}
              className="tablet:w-fit tablet:ml-auto tablet:px-12 w-full py-4 bg-blue text-cream rounded-xl text-sm font-bold tracking-tight hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Envoi..." : "Envoyer ma demande"}
            </button>

            {state.error && (
              <p className="text-red-400 text-sm text-center">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-400 text-sm text-center font-bold">
                Demande envoyée ! Je vous recontacte très vite.
              </p>
            )}
          </form>
        </section>

        {/* ── FOOTER ── */}
        <footer className="w-full tablet:w-[85%] max-w-5xl mx-auto border-t border-cream/10 px-4 py-8 flex flex-col tablet:flex-row items-center justify-between gap-4 text-xs text-cream/40">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cream/80 cursor-default">
              Photolio.fr
            </span>
            <span className="cursor-default">© 2026</span>
          </div>
          <span className="cursor-default">
            Site réalisé par{" "}
            <a
              href="https://levynixstudio.netlify.app/"
              target="_blank"
              className="text-cream/70 hover:text-blue underline underline-offset-4"
            >
              Levynix Studio
            </a>
          </span>
        </footer>
      </main>
    </>
  );
}
