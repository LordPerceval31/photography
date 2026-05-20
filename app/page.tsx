"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendContactEmail, type ContactFormState } from "@/app/actions/contact";
import MentionsLegalesModal from "./_components/MentionsLegalesModal";

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

const PRICING_PLANS = [
  {
    name: "Essentiel",
    price: 69,
    originalPrice: null,
    features: [
      "Architecture prête à l'emploi, zéro technique",
      "Gérez vos galeries et contenus en totale autonomie",
      "Faites évoluer votre vitrine au rythme de vos shootings",
      "Hébergement et nom de domaine inclus",
    ],
    highlight: false,
    demoLink: "https://demo-nature.photolio.fr",
  },
  {
    name: "Studio",
    price: 89,
    originalPrice: null,
    features: [
      "Toutes les fonctionnalités Essentiel",
      "Mettez vous en avant et proposez vos propres services",
    ],
    highlight: false,
    demoLink: "https://demo-street.photolio.fr",
  },
  {
    name: "Signature",
    price: 109,
    originalPrice: null,
    features: [
      "Toutes les fonctionnalités Studio",
      "Espace dédié : Parlez de vous et de votre sensibilité",
    ],
    highlight: false,
    demoLink: "https://demo-evenement.photolio.fr",
  },
  {
    name: "Premium",
    price: 89,
    originalPrice: 129,
    features: [
      "Toutes les fonctionnalités Signature",
      "Envoyez les photos à vos clients de manière simple et sécurisée",
    ],
    highlight: true,
    demoLink: "https://demo-cuisine.photolio.fr",
  },
];

export default function LandingPage() {
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(sendContactEmail, { success: false });

  const [mentionsOpen, setMentionsOpen] = useState(false);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Photolio",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      offerCount: "4",
      lowPrice: "69.00",
      highPrice: "109.00",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content" className="bg-[#0a0a0a] text-[#ededed] min-h-screen overflow-x-hidden selection:bg-blue selection:text-white cursor-default">
        {/* ── HEADER ── */}
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[calc(100%-32px)] tablet:w-[70%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-600 px-4 py-3 2k:px-6 2k:py-4 4k:px-10 4k:py-8 glass-premium rounded-full transition-all duration-300">
          <span className="font-extrabold text-[15px] tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-4xl tracking-tight text-cream cursor-default">
            Photolio.fr
          </span>
          <Link
            href="/login"
            className="px-4 py-2 tablet:px-5 tablet:py-2.5 laptop:px-6 laptop:py-3 desktop:px-8 desktop:py-4 2k:px-10 2k:py-5 ultrawide:px-12 ultrawide:py-6 4k:px-16 4k:py-8 bg-cream text-dark rounded-full text-xs tablet:text-sm laptop:text-base desktop:text-lg 2k:text-xl ultrawide:text-2xl 4k:text-3xl font-bold tracking-tight hover:opacity-90 transition-opacity"
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

          <div className="relative z-10 w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-600 mx-auto flex flex-col items-start text-left laptop:translate-y-6 laptop:-translate-x-20 desktop:translate-y-12 desktop:-translate-x-50 2k:translate-y-24 2k:-translate-x-70 ultrawide:translate-y-32 ultrawide:-translate-x-80 4k:translate-y-40 4k:-translate-x-96 transition-transform duration-500">
            <h1 className="sr-only cursor-default">
              Création de sites vitrines et galeries privées clé en main pour
              photographes professionnels et amateurs
            </h1>

            <p
              aria-hidden="true"
              className="text-4xl tablet:text-5xl laptop:text-[3.5rem] desktop:text-[4.5rem] 2k:text-[6rem] ultrawide:text-[8rem] 4k:text-[12rem] font-bold leading-[1.15] 2k:leading-[1.1] text-cream mb-6 laptop:mb-8 desktop:mb-10 2k:mb-12 ultrawide:mb-16 4k:mb-20 cursor-default"
            >
              Vos œuvres
              <br />
              <span className="text-blue font-medium italic pr-2 cursor-default">
                Votre espace
              </span>
            </p>

            <p className="text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-5xl text-cream/60 max-w-md laptop:max-w-lg desktop:max-w-2xl 2k:max-w-3xl ultrawide:max-w-5xl 4k:max-w-7xl mb-10 laptop:mb-12 desktop:mb-16 2k:mb-20 ultrawide:mb-24 4k:mb-32 leading-relaxed cursor-default">
              Déployez votre portfolio et vos galeries privées sans aucune
              friction technique. Un espace conçu pour sublimer vos images, que
              vous faites évoluer en totale autonomie.
            </p>

            <a
              href="#tarifs"
              className="px-8 py-4 tablet:px-9 tablet:py-4 laptop:px-10 laptop:py-5 desktop:px-12 desktop:py-6 2k:px-16 2k:py-8 ultrawide:px-20 ultrawide:py-10 4k:px-24 4k:py-12 bg-blue/10 border border-blue/30 text-cream rounded-full text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-4xl font-semibold tracking-wide hover:bg-blue hover:border-blue transition-all duration-300 w-full tablet:w-auto text-center backdrop-blur-sm"
            >
              Voir les offres
            </a>
          </div>
        </section>

        {/* ── SECTION GALERIES (Focus sur l'atout Premium) ── */}
        <section className="w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-700 mx-auto px-4 py-20 tablet:py-24 laptop:py-32 desktop:py-40 2k:py-56 ultrawide:py-64 4k:py-80">
          <div className="mb-10 tablet:mb-12 laptop:mb-16 desktop:mb-20 2k:mb-24 ultrawide:mb-32 4k:mb-40 text-center tablet:text-left">
            <h2 className="text-3xl tablet:text-5xl laptop:text-6xl desktop:text-7xl 2k:text-8xl ultrawide:text-[9rem] 4k:text-[11rem] font-extrabold tracking-tight text-cream mb-4 leading-tight cursor-default">
              Conçu pour l&apos;image.
            </h2>
          </div>

          <div className="glass-card rounded-3xl 2k:rounded-[40px] ultrawide:rounded-[60px] 4k:rounded-[80px] p-6 tablet:p-10 laptop:p-16 desktop:p-20 2k:p-24 ultrawide:p-32 4k:p-40 flex flex-col laptop:flex-row items-center gap-10 laptop:gap-20 2k:gap-28 ultrawide:gap-36 4k:gap-48">
            <div className="w-full laptop:w-1/2">
              <span className="inline-block px-3 py-1 tablet:px-4 tablet:py-1.5 laptop:px-5 laptop:py-2 desktop:px-6 desktop:py-2.5 2k:px-8 2k:py-3 ultrawide:px-10 ultrawide:py-4 4k:px-12 4k:py-5 bg-blue/10 border border-blue/30 text-blue rounded-full text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg ultrawide:text-xl 4k:text-2xl font-bold tracking-widest uppercase mb-4 laptop:mb-6 desktop:mb-8 2k:mb-10 ultrawide:mb-12 4k:mb-16 cursor-default">
                Inclus dans l&apos;offre Premium
              </span>
              <h3 className="text-2xl tablet:text-3xl laptop:text-4xl desktop:text-5xl 2k:text-6xl ultrawide:text-7xl 4k:text-8xl font-bold tracking-tight text-cream mb-4 desktop:mb-6 2k:mb-8 ultrawide:mb-10 4k:mb-12 cursor-default">
                Vos Galeries Clients Privées
              </h3>
              <p className="text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-4xl text-cream/60 leading-relaxed mb-6 desktop:mb-8 2k:mb-10 ultrawide:mb-12 4k:mb-16 cursor-default">
                L&apos;atout maître pour fidéliser. Offrez à vos clients un lien
                sécurisé, élégant et à votre image. Ils visionnent et
                téléchargent leurs photos en un clic, sans même avoir besoin de
                créer un compte.
              </p>
              <div className="inline-flex items-center gap-2 tablet:gap-3 laptop:gap-4 px-4 py-3 tablet:px-5 tablet:py-3.5 laptop:px-6 laptop:py-4 desktop:px-8 desktop:py-5 2k:px-10 2k:py-6 ultrawide:px-12 ultrawide:py-8 4k:px-16 4k:py-10 bg-dark border border-white/5 rounded-xl 2k:rounded-2xl 4k:rounded-3xl text-xs tablet:text-sm laptop:text-base desktop:text-lg 2k:text-xl ultrawide:text-2xl 4k:text-3xl text-blue font-mono">
                <span className="cursor-default">🔗</span>
                <span className="truncate cursor-default">
                  photolio.fr/g/mariage-sophie-marc
                </span>
              </div>
            </div>

            <div className="w-full laptop:w-1/2 relative min-h-75 tablet:min-h-87.5 laptop:min-h-100 desktop:min-h-125 2k:min-h-150 ultrawide:min-h-200 4k:min-h-250 flex items-center justify-center">
              <div className="absolute w-32 tablet:w-40 laptop:w-48 desktop:w-64 2k:w-80 ultrawide:w-96 4k:w-140 aspect-3/4 rounded-xl 2k:rounded-2xl 4k:rounded-3xl overflow-hidden -rotate-6 -translate-x-16 tablet:-translate-x-20 laptop:-translate-x-24 desktop:-translate-x-32 2k:-translate-x-40 ultrawide:-translate-x-48 4k:-translate-x-64 shadow-2xl border border-white/5 opacity-50">
                <Image
                  src={GALLERY_PHOTOS[4].src}
                  fill
                  sizes="500px"
                  alt="Aperçu gauche"
                  className="object-cover"
                />
              </div>
              <div className="absolute w-32 tablet:w-40 laptop:w-48 desktop:w-64 2k:w-80 ultrawide:w-96 4k:w-140 aspect-3/4 rounded-xl 2k:rounded-2xl 4k:rounded-3xl overflow-hidden rotate-6 translate-x-16 tablet:translate-x-20 laptop:translate-x-24 desktop:translate-x-32 2k:translate-x-40 ultrawide:translate-x-48 4k:translate-x-64 shadow-2xl border border-white/5 opacity-50">
                <Image
                  src={GALLERY_PHOTOS[1].src}
                  fill
                  sizes="500px"
                  alt="Aperçu droite"
                  className="object-cover"
                />
              </div>
              <div className="absolute w-40 tablet:w-48 laptop:w-56 desktop:w-72 2k:w-96 ultrawide:w-md 4k:w-180 aspect-3/4 rounded-xl 2k:rounded-2xl 4k:rounded-3xl overflow-hidden z-10 shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-500">
                <Image
                  src={GALLERY_PHOTOS[2].src}
                  fill
                  sizes="800px"
                  alt="Aperçu centre"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION TARIFS (4 Colonnes) ── */}
        <section
          id="tarifs"
          className="w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-700 mx-auto px-4 py-10 tablet:py-16 laptop:py-20 desktop:py-32 2k:py-40 ultrawide:py-56 4k:py-72"
        >
          <div className="mb-10 tablet:mb-12 laptop:mb-16 desktop:mb-20 2k:mb-24 ultrawide:mb-32 4k:mb-40 text-center tablet:text-left">
            <h2 className="text-3xl tablet:text-5xl laptop:text-6xl desktop:text-7xl 2k:text-8xl ultrawide:text-[9rem] 4k:text-[11rem] font-extrabold tracking-tight text-cream mb-4 desktop:mb-6 2k:mb-8 ultrawide:mb-10 4k:mb-16 cursor-default">
              Des offres qui s&apos;adaptent à vous.
            </h2>
            <p className="text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-4xl text-cream/60 max-w-2xl desktop:max-w-3xl 2k:max-w-4xl ultrawide:max-w-5xl 4k:max-w-7xl cursor-default mx-auto tablet:mx-0">
              Paiement unique. Accès à vie. Choisissez l&apos;architecture qui
              correspond au stade de votre activité.
            </p>
          </div>

          <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-2 desktop:gap-3 2k:gap-4 ultrawide:gap-6 4k:gap-6">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col p-6 tablet:p-8 laptop:p-6 desktop:p-10 2k:p-14 ultrawide:p-20 4k:p-24 rounded-3xl 2k:rounded-[40px] 4k:rounded-[60px] transition-all duration-300 ${
                  plan.highlight
                    ? "bg-blue/10 border-2 border-blue shadow-[0_0_30px_rgba(0,102,255,0.15)]"
                    : "glass-card border border-white/5 hover:border-white/10"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 2k:-top-5 ultrawide:-top-6 4k:-top-8 left-1/2 -translate-x-1/2 bg-blue text-white text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg ultrawide:text-xl 4k:text-2xl font-bold px-4 py-1.5 tablet:px-5 tablet:py-2 2k:px-6 2k:py-2.5 ultrawide:px-8 ultrawide:py-3 4k:px-12 4k:py-4 rounded-full uppercase tracking-wider whitespace-nowrap shadow-lg cursor-default">
                    Offre la plus choisie
                  </div>
                )}

                <h3 className="text-xl tablet:text-2xl laptop:text-xl desktop:text-3xl 2k:text-4xl ultrawide:text-5xl 4k:text-6xl font-bold text-cream mb-2 desktop:mb-4 2k:mb-6 4k:mb-8 cursor-default">
                  {plan.name}
                </h3>

                <div className="flex flex-col mb-8 desktop:mb-10 2k:mb-12 ultrawide:mb-16 4k:mb-20">
                  <div className="h-8 2k:h-10 ultrawide:h-12 4k:h-16 mb-1 2k:mb-2 4k:mb-4">
                    {plan.originalPrice && (
                      <span className="text-lg tablet:text-xl laptop:text-lg desktop:text-2xl 2k:text-3xl ultrawide:text-4xl 4k:text-5xl font-bold text-cream/40 line-through decoration-red-500/50 cursor-default">
                        {plan.originalPrice} €
                      </span>
                    )}
                  </div>
                  <div
                    aria-label={`${plan.price} euros`}
                    className="flex items-baseline gap-1 2k:gap-2 4k:gap-4"
                  >
                    <span aria-hidden="true" className="text-5xl tablet:text-6xl laptop:text-5xl desktop:text-7xl 2k:text-8xl ultrawide:text-[7rem] 4k:text-[10rem] font-extrabold tracking-tight text-cream cursor-default">
                      {plan.price}
                    </span>
                    <span aria-hidden="true" className="text-xl tablet:text-2xl laptop:text-xl desktop:text-3xl 2k:text-4xl ultrawide:text-5xl 4k:text-6xl font-medium text-cream/60 cursor-default">
                      €
                    </span>
                  </div>
                </div>

                <ul className="flex-1 space-y-4 desktop:space-y-6 2k:space-y-8 ultrawide:space-y-10 4k:space-y-12 mb-8 desktop:mb-10 2k:mb-14 ultrawide:mb-16 4k:mb-24">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 desktop:gap-4 2k:gap-5 4k:gap-6 text-sm tablet:text-base laptop:text-sm desktop:text-lg 2k:text-xl ultrawide:text-2xl 4k:text-3xl text-cream/80 cursor-default"
                    >
                      <span className="text-blue font-bold shrink-0 mt-0.5 2k:mt-1 4k:mt-2 cursor-default">
                        ✓
                      </span>
                      <span className="cursor-default">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-4 tablet:py-5 desktop:py-6 2k:py-8 ultrawide:py-10 4k:py-12 rounded-xl 2k:rounded-2xl 4k:rounded-3xl text-sm tablet:text-base laptop:text-sm desktop:text-lg 2k:text-xl ultrawide:text-2xl 4k:text-3xl font-bold tracking-wide text-center transition-colors flex items-center justify-center gap-2 2k:gap-3 4k:gap-4 ${
                    plan.highlight
                      ? "bg-blue text-white hover:bg-blue/90 shadow-md"
                      : "bg-white/5 text-cream border border-white/10 hover:bg-white/10"
                  }`}
                >
                  Voir la démo ↗
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section
          id="contact"
          className="w-full tablet:w-[85%] max-w-5xl desktop:max-w-7xl 2k:max-w-400 ultrawide:max-w-500 4k:max-w-700 mx-auto px-4 py-24 tablet:py-32 laptop:py-40 desktop:py-48 2k:py-64 ultrawide:py-80 4k:py-96"
        >
          <div className="text-center laptop:text-left mb-10 tablet:mb-16 laptop:mb-20 desktop:mb-24 2k:mb-32 4k:mb-48">
            <h2 className="text-3xl tablet:text-4xl laptop:text-5xl desktop:text-6xl 2k:text-7xl ultrawide:text-8xl 4k:text-9xl font-extrabold tracking-tight text-cream mb-4 desktop:mb-6 2k:mb-10 4k:mb-16 cursor-default">
              Prenez les clés de votre espace.
            </h2>
            <p className="text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-4xl text-cream/60 max-w-xl desktop:max-w-3xl 2k:max-w-4xl ultrawide:max-w-5xl 4k:max-w-7xl mx-auto laptop:mx-0 cursor-default">
              Parlez-moi de votre activité. Je configure l&apos;architecture de
              votre compte sous 24h. Vous n&apos;avez plus qu&apos;à importer
              vos photos, écrire vos textes, et faire vivre votre site.
            </p>
          </div>

          <form
            action={formAction}
            className="glass-card p-6 tablet:p-10 laptop:p-14 desktop:p-20 2k:p-24 ultrawide:p-32 4k:p-40 rounded-3xl 2k:rounded-[40px] 4k:rounded-[60px] flex flex-col gap-6 desktop:gap-8 2k:gap-12 4k:gap-16"
          >
            <div className="flex flex-col tablet:flex-row gap-6 desktop:gap-8 2k:gap-12 4k:gap-16">
              <label htmlFor="contact-name" className="w-full">
                <span className="sr-only">Votre nom</span>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="Votre nom"
                  required
                  className="glass-input w-full p-4 tablet:p-5 desktop:p-6 2k:p-8 ultrawide:p-10 4k:p-12 rounded-xl 2k:rounded-2xl 4k:rounded-3xl text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-4xl text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors cursor-text"
                />
              </label>
              <label htmlFor="contact-phone" className="w-full">
                <span className="sr-only">Téléphone (optionnel)</span>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  placeholder="Téléphone (optionnel)"
                  className="glass-input w-full p-4 tablet:p-5 desktop:p-6 2k:p-8 ultrawide:p-10 4k:p-12 rounded-xl 2k:rounded-2xl 4k:rounded-3xl text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-4xl text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors cursor-text"
                />
              </label>
            </div>
            <label htmlFor="contact-email">
              <span className="sr-only">Votre email</span>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="Votre email"
                required
                className="glass-input w-full p-4 tablet:p-5 desktop:p-6 2k:p-8 ultrawide:p-10 4k:p-12 rounded-xl 2k:rounded-2xl 4k:rounded-3xl text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-4xl text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors cursor-text"
              />
            </label>
            <label htmlFor="contact-message">
              <span className="sr-only">Détails sur vos besoins</span>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Détails sur vos besoins (précisez l'offre qui vous intéresse)..."
                required
                className="glass-input w-full p-4 tablet:p-5 desktop:p-6 2k:p-8 ultrawide:p-10 4k:p-12 rounded-xl 2k:rounded-2xl 4k:rounded-3xl text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-4xl text-cream placeholder:text-cream/30 min-h-40 tablet:min-h-50 desktop:min-h-62.5 2k:min-h-75 ultrawide:min-h-100 4k:min-h-125 resize-none outline-none focus:border-blue transition-colors cursor-text"
              />
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="tablet:w-fit tablet:ml-auto w-full px-8 py-4 tablet:px-12 tablet:py-5 desktop:px-16 desktop:py-6 2k:px-20 2k:py-8 ultrawide:px-24 ultrawide:py-10 4k:px-32 4k:py-12 bg-blue text-cream rounded-xl 2k:rounded-2xl 4k:rounded-3xl text-sm tablet:text-base laptop:text-lg desktop:text-xl 2k:text-2xl ultrawide:text-3xl 4k:text-4xl font-bold tracking-tight hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Envoi..." : "Envoyer ma demande"}
            </button>

            <div aria-live="polite" aria-atomic="true">
              {state.error && (
                <p className="text-red-400 text-sm tablet:text-base desktop:text-lg 2k:text-xl ultrawide:text-2xl 4k:text-3xl text-center cursor-default">
                  {state.error}
                </p>
              )}
              {state.success && (
                <p className="text-green-400 text-sm tablet:text-base desktop:text-lg 2k:text-xl ultrawide:text-2xl 4k:text-3xl text-center font-bold cursor-default">
                  Demande envoyée ! Je vous recontacte très vite.
                </p>
              )}
            </div>
          </form>
        </section>

        {/* ── FOOTER ── */}
        <footer className="w-full border-t border-cream/10 px-8 tablet:px-12 laptop:px-16 desktop:px-20 2k:px-24 ultrawide:px-32 4k:px-40 py-8 tablet:py-10 desktop:py-12 2k:py-16 4k:py-24 flex flex-col tablet:flex-row items-center justify-around gap-4 2k:gap-8 4k:gap-12 text-xs tablet:text-sm laptop:text-base desktop:text-lg 2k:text-xl ultrawide:text-2xl 4k:text-3xl text-cream/40">
          <div className="flex items-center gap-2 2k:gap-3 4k:gap-4">
            <span className="font-bold text-cream/80 cursor-default">
              Photolio.fr
            </span>
            <span className="cursor-default">© 2026</span>
          </div>
          <button
            onClick={() => setMentionsOpen(true)}
            className="hover:text-cream/70 underline underline-offset-4 transition-colors cursor-pointer"
          >
            Mentions légales
          </button>
          <span className="cursor-default">
            Site réalisé par{" "}
            <a
              href="https://levynixstudio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Levynix Studio (ouvre dans un nouvel onglet)"
              className="text-cream/70 hover:text-blue underline underline-offset-4 cursor-pointer"
            >
              Levynix Studio
            </a>
          </span>
        </footer>
      </main>

      <MentionsLegalesModal
        open={mentionsOpen}
        onClose={() => setMentionsOpen(false)}
      />
    </>
  );
}
