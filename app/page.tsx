import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Photolio — L'écrin de votre travail",
  description:
    "Site vitrine et galeries privées pour photographes exigeants. Réservé aux professionnels.",
  robots: { index: true, follow: true },
};

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
  return (
    <main className="bg-background text-foreground min-h-screen overflow-x-hidden selection:bg-blue selection:text-white">
      {/* ── HEADER ── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[calc(100%-32px)] tablet:w-[70%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-600 px-4 py-3 2k:px-6 2k:py-4 4k:px-10 4k:py-8 glass-premium rounded-full transition-all duration-300">
        <span className="font-extrabold text-[15px] 2k:text-[18px] 4k:text-2xl tracking-tight text-cream">
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
            alt="Photolio Hero"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="relative z-10 w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-600 mx-auto flex flex-col items-start text-left">
          <p className="text-[11px] 2k:text-[14px] 4k:text-xl font-medium tracking-[0.25em] uppercase text-cream/50 mb-4 laptop:mb-6 desktop:mb-8 2k:mb-10 4k:mb-16">
            La plateforme sur-mesure
          </p>

          <h1 className="text-4xl tablet:text-5xl laptop:text-[3.5rem] desktop:text-[4.5rem] 2k:text-[6rem] ultrawide:text-[8rem] 4k:text-[12rem] font-bold leading-[1.15] 2k:leading-[1.1] text-cream mb-6 laptop:mb-8 desktop:mb-10 2k:mb-12 4k:mb-20">
            Votre œuvre.
            <br />
            <span className="text-blue font-medium italic pr-2">
              Votre outil.
            </span>
          </h1>

          <p className="text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-5xl text-cream/60 max-w-md laptop:max-w-lg desktop:max-w-2xl 2k:max-w-3xl 4k:max-w-6xl mb-10 laptop:mb-12 desktop:mb-16 2k:mb-20 4k:mb-32 leading-relaxed">
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
          <p className="text-[10px] laptop:text-xs desktop:text-sm 2k:text-base 4k:text-2xl font-semibold tracking-[0.18em] uppercase text-blue mb-3 desktop:mb-4 2k:mb-6 4k:mb-12">
            L&apos;Essentiel
          </p>
          <h2 className="text-3xl tablet:text-5xl laptop:text-6xl desktop:text-7xl 2k:text-8xl 4k:text-[11rem] font-extrabold tracking-tight text-cream mb-4 leading-tight">
            Conçu pour l&apos;image.
          </h2>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 laptop:gap-8 desktop:gap-12 2k:gap-16 4k:gap-24">
          <div className="glass-card rounded-3xl 2k:rounded-[40px] 4k:rounded-[80px] p-6 tablet:p-8 laptop:p-12 desktop:p-16 2k:p-20 4k:p-32 flex flex-col justify-between">
            <div>
              <h3 className="text-xl laptop:text-2xl desktop:text-3xl 2k:text-4xl 4k:text-7xl font-bold tracking-tight text-cream mb-2 desktop:mb-4 2k:mb-6 4k:mb-12">
                Galeries Client
              </h3>
              <p className="text-sm laptop:text-base desktop:text-lg 2k:text-xl 4k:text-4xl text-cream/60 leading-relaxed">
                Un lien sécurisé. Vos clients téléchargent leurs photos en un
                clic, sans créer de compte.
              </p>
            </div>

            <div className="relative w-full flex-1 min-h-55 laptop:min-h-72 desktop:min-h-96 2k:min-h-125 4k:min-h-180 flex items-center justify-center my-6 laptop:my-10 desktop:my-16 2k:my-20 4k:my-40">
              <div className="absolute w-28 laptop:w-36 desktop:w-48 2k:w-64 4k:w-110 aspect-3/4 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] overflow-hidden -rotate-6 -translate-x-12 laptop:-translate-x-16 desktop:-translate-x-24 2k:-translate-x-32 4k:-translate-x-56 shadow-2xl border border-white/5 opacity-50 transition-transform hover:-rotate-12 duration-500">
                <Image
                  src={GALLERY_PHOTOS[4].src}
                  fill
                  sizes="(min-width: 3840px) 600px, 300px"
                  alt="Aperçu"
                  className="object-cover"
                />
              </div>
              <div className="absolute w-28 laptop:w-36 desktop:w-48 2k:w-64 4k:w-110 aspect-3/4 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] overflow-hidden rotate-6 translate-x-12 laptop:translate-x-16 desktop:translate-x-24 2k:translate-x-32 4k:translate-x-56 shadow-2xl border border-white/5 opacity-50 transition-transform hover:rotate-12 duration-500">
                <Image
                  src={GALLERY_PHOTOS[1].src}
                  fill
                  sizes="(min-width: 3840px) 600px, 300px"
                  alt="Aperçu"
                  className="object-cover"
                />
              </div>
              <div className="absolute w-32 laptop:w-44 desktop:w-56 2k:w-72 4k:w-125 aspect-3/4 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] overflow-hidden z-10 shadow-2xl border border-white/10 transition-transform hover:scale-105 duration-500">
                <Image
                  src={GALLERY_PHOTOS[2].src}
                  fill
                  sizes="(min-width: 3840px) 800px, 400px"
                  alt="Aperçu"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 laptop:py-4 desktop:py-5 2k:px-6 2k:py-6 4k:px-12 4k:py-10 bg-blue/10 border border-blue/20 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] text-xs laptop:text-sm desktop:text-base 2k:text-lg 4k:text-4xl text-blue font-mono truncate">
              <span>🔗</span>
              <span className="truncate">photolio.fr/g/mariage...</span>
            </div>
          </div>

          <div className="relative glass-card rounded-3xl 2k:rounded-[40px] 4k:rounded-[80px] p-6 tablet:p-8 laptop:p-12 desktop:p-16 2k:p-20 4k:p-32 flex flex-col border border-blue/20 bg-blue/5 tablet:col-span-1">
            <span className="absolute -top-3.5 4k:-top-6 left-8 4k:left-32 bg-blue text-cream text-[11px] 2k:text-base 4k:text-3xl font-bold px-4 py-1 4k:px-12 4k:py-4 rounded-full tracking-wider">
              Offre de lancement
            </span>
            <p className="text-[11px] laptop:text-xs 2k:text-base 4k:text-3xl tracking-widest text-cream/40 uppercase mt-2 4k:mt-10 mb-1">
              Accès complet
            </p>
            <p className="line-through text-cream/30 text-lg desktop:text-2xl 4k:text-5xl">
              149 €
            </p>
            <div className="flex items-start">
              <p className="text-[64px] laptop:text-[88px] desktop:text-[120px] 2k:text-[160px] 4k:text-[280px] font-extrabold tracking-tight leading-none text-cream">
                89
              </p>
              <span className="text-2xl desktop:text-4xl 2k:text-6xl 4k:text-[10rem] font-bold text-cream mt-2 desktop:mt-6 4k:mt-16 ml-1 2k:ml-2">
                €
              </span>
            </div>
            <p className="text-[12px] 2k:text-xl 4k:text-4xl text-blue tracking-wide mt-2 desktop:mt-6 4k:mt-16 mb-8 desktop:mb-16 4k:mb-32">
              paiement unique · accès à vie
            </p>
            <ul className="space-y-0 w-full mt-auto">
              {PRICING_FEATURES.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 2k:gap-4 4k:gap-12 py-3 laptop:py-4 desktop:py-5 2k:py-6 4k:py-12 border-b border-cream/5 text-sm laptop:text-base 2k:text-xl 4k:text-5xl text-cream/70 last:border-b-0"
                >
                  <span className="text-blue font-bold">✓</span> {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── GALERIE INFINIE ── */}
      <section className="py-20 laptop:py-32 desktop:py-40 2k:py-56 4k:py-96 w-full overflow-hidden pointer-events-none select-none">
        <div className="w-full tablet:w-[80%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 4k:max-w-600 mx-auto px-4 mb-10 2k:mb-24 4k:mb-48 text-center tablet:text-left">
          <h2 className="text-3xl tablet:text-5xl laptop:text-6xl 2k:text-8xl 4k:text-[12rem] font-extrabold tracking-tight text-cream">
            Expérience fluide.
          </h2>
        </div>
        <div className="carousel-wrapper relative w-full flex">
          <div className="carousel-track flex w-max gap-4 laptop:gap-8 4k:gap-20 px-2">
            {[...GALLERY_PHOTOS, ...GALLERY_PHOTOS].map((photo, i) => (
              <div
                key={i}
                className="relative w-45 tablet:w-56 laptop:w-70 desktop:w-90 2k:w-120 4k:w-220 aspect-3/4 rounded-2xl laptop:rounded-4xl 4k:rounded-[100px] overflow-hidden shrink-0 bg-white/5"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 3840px) 1000px, 600px"
                  className="object-cover opacity-70"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section
        id="contact"
        className="w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 4k:max-w-700 mx-auto px-4 py-24 laptop:py-32 desktop:py-40 2k:py-56 4k:py-96"
      >
        <div className="text-center mb-10 laptop:mb-16 desktop:mb-24 4k:mb-48">
          <h2 className="text-3xl tablet:text-4xl laptop:text-5xl 2k:text-7xl 4k:text-[10rem] font-extrabold tracking-tight text-cream mb-4 4k:mb-16">
            Demander un accès
          </h2>
          <p className="text-sm laptop:text-base 2k:text-2xl 4k:text-5xl text-cream/60 max-w-lg laptop:max-w-2xl 4k:max-w-7xl mx-auto">
            Parlez-moi de votre activité, je crée votre espace sous 24h.
          </p>
        </div>
        <form className="glass-card p-6 tablet:p-10 laptop:p-14 desktop:p-20 2k:p-24 4k:p-48 rounded-3xl 2k:rounded-[40px] 4k:rounded-[100px] flex flex-col gap-6 laptop:gap-8 4k:gap-24">
          <div className="flex flex-col tablet:flex-row gap-6 laptop:gap-8 4k:gap-24">
            <input
              type="text"
              placeholder="Votre nom"
              required
              className="glass-input w-full p-4 2k:p-8 4k:p-20 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] text-sm 2k:text-xl 4k:text-5xl text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors"
            />
            <input
              type="tel"
              placeholder="Téléphone"
              className="glass-input w-full p-4 2k:p-8 4k:p-20 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] text-sm 2k:text-xl 4k:text-5xl text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors"
            />
          </div>
          <input
            type="email"
            placeholder="Votre email"
            required
            className="glass-input w-full p-4 2k:p-8 4k:p-20 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] text-sm 2k:text-xl 4k:text-5xl text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors"
          />
          <textarea
            placeholder="Détails..."
            required
            className="glass-input w-full p-4 2k:p-8 4k:p-20 rounded-xl 2k:rounded-2xl 4k:rounded-[40px] text-sm 2k:text-xl 4k:text-5xl text-cream placeholder:text-cream/30 min-h-40 4k:min-h-180 resize-none outline-none focus:border-blue transition-colors"
          />
          <button
            type="submit"
            className="tablet:w-fit tablet:ml-auto tablet:px-12 laptop:px-16 2k:px-24 4k:px-64 mt-2 laptop:mt-4 4k:mt-20 w-full py-4 2k:py-8 4k:py-20 bg-blue text-cream rounded-xl 2k:rounded-2xl 4k:rounded-[50px] text-sm 2k:text-xl 4k:text-6xl font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            Envoyer ma demande
          </button>
        </form>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 4k:max-w-600 mx-auto border-t border-cream/10 px-4 py-8 laptop:py-12 2k:py-20 4k:py-40 flex flex-col tablet:flex-row items-center justify-between gap-4 text-xs 2k:text-lg 4k:text-4xl text-cream/40">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cream/80">Photolio.fr</span>
          <span>© 2026</span>
        </div>
        <span>
          Site réalisé par{" "}
          <a
            href="https://levynixstudio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/70 hover:text-blue transition-colors underline decoration-cream/20 hover:decoration-blue underline-offset-4"
          >
            Levynix Studio
          </a>
        </span>
      </footer>
    </main>
  );
}
