import type { Metadata } from "next";
import Image from "next/image";
import { LandingContactForm } from "@/app/_components/LandingContactForm";

export const metadata: Metadata = {
  title: "Photolio — La plateforme des photographes",
  description:
    "Créez votre site vitrine, envoyez des galeries privées à vos clients et gérez votre activité photo en un seul endroit. Paiement unique, accès à vie.",
  robots: { index: true, follow: true },
};

// Photos Unsplash pour la démo galerie (déjà autorisées dans next.config.ts)
const GALLERY_PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
    alt: "Street",
    caption: "Street",
    tall: true,
  },
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    alt: "Portrait",
    caption: "Portrait",
    tall: false,
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80",
    alt: "Paysage",
    caption: "Paysage",
    tall: false,
  },
  {
    src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80",
    alt: "Studio",
    caption: "",
    tall: false,
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    alt: "Montagne",
    caption: "Montagne",
    tall: false,
  },
  {
    src: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=600&q=80",
    alt: "Auto",
    caption: "",
    tall: false,
  },
  {
    src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80",
    alt: "Soirée",
    caption: "Soirée",
    tall: false,
  },
] as const;

const PRICING_FEATURES = [
  "Site vitrine personnalisé",
  "Galeries privées client illimitées",
  "Domaine custom ou sous-domaine",
  "Back-office photos & galeries",
  "Toutes les mises à jour incluses",
];

export default function LandingPage() {
  return (
    <main className="bg-[#080808] text-[#f0f0ee] min-h-screen overflow-x-hidden">

      {/* ── HEADER FLOTTANT ── */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[calc(100%-48px)] max-w-5xl px-5 py-3 bg-[#080808]/60 backdrop-blur-2xl border border-white/8 rounded-full">
        <span className="font-extrabold text-[15px] tracking-tight text-[#f0f0ee]">
          Photolio
        </span>
        <a
          href="/login"
          className="px-5 py-2 bg-[#f0f0ee] text-[#080808] rounded-full text-[13px] font-bold tracking-tight hover:bg-white transition-colors"
        >
          Get Started →
        </a>
      </header>

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[600px] flex flex-col items-center justify-end pb-20 text-center overflow-hidden">
        {/* Fond + dégradé */}
        <div className="absolute inset-0">
          <Image
            src="/landing-hero-bg.jpg"
            alt="Photographie — hero"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/20 via-transparent via-40% to-[#080808]" />
        </div>

        {/* Contenu hero */}
        <div className="relative z-10 px-6">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#f0f0ee]/50 mb-5">
            La plateforme des photographes
          </p>
          <h1 className="text-[clamp(48px,7vw,88px)] font-extrabold leading-none tracking-[-3px] text-[#f0f0ee] mb-5">
            Votre œuvre.<br />
            <span className="text-[#558b8b]">Votre outil.</span>
          </h1>
          <p className="text-base text-[#f0f0ee]/55 max-w-[480px] mx-auto mb-9 leading-relaxed">
            Un site vitrine, des galeries privées pour vos clients, un back-office complet.
            Tout ça, pour une fois.
          </p>
          <a
            href="/login"
            className="inline-block px-9 py-4 bg-[#558b8b] text-[#f0f0ee] rounded-full text-[15px] font-bold tracking-tight hover:bg-[#4a7a7a] transition-colors"
          >
            Get Started — 89 €
          </a>
        </div>
      </section>

      {/* ── FEATURES : BENTO GRID ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#558b8b] mb-4">
          Ce que vous obtenez
        </p>
        <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-2px] leading-[1.05] text-[#f0f0ee] mb-4">
          Conçu pour<br />ceux qui shootent.
        </h2>
        <p className="text-base text-[#f0f0ee]/45 mb-14 max-w-lg leading-relaxed">
          Pas pour ceux qui codent, pas pour ceux qui comptent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Card A — Galeries privées (large) */}
          <div className="md:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-[20px] p-8">
            {/* Mini galerie démo */}
            <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden mb-7">
              {[
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=70",
                "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&q=70",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=70",
              ].map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover opacity-80" />
                </div>
              ))}
            </div>
            {/* Lien partage */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#558b8b]/10 border border-[#558b8b]/25 rounded-xl text-[12px] text-[#558b8b] font-mono mb-7">
              <span>🔗</span>
              <span>photolio.fr/g/mariage-dupont-2026</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-[#f0f0ee] mb-2">
              Galeries privées client
            </h3>
            <p className="text-sm text-[#f0f0ee]/45 leading-relaxed">
              Un lien unique et sécurisé. Vos clients voient leurs photos et téléchargent en ZIP — sans créer de compte.
            </p>
          </div>

          {/* Card B — Prix */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-[20px] p-8 flex flex-col justify-between">
            <div className="text-center py-4">
              <p className="line-through text-[#f0f0ee]/25 text-base mb-1">149 €</p>
              <p className="text-[64px] font-extrabold tracking-[-3px] leading-none text-[#f0f0ee]">
                <sup className="text-2xl align-top mt-4">€</sup>89
              </p>
              <p className="text-[11px] tracking-[0.05em] text-[#558b8b] mt-2 uppercase">
                Paiement unique · à vie
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-[#f0f0ee] mb-1.5">
                Zéro abonnement
              </h3>
              <p className="text-sm text-[#f0f0ee]/45 leading-relaxed">
                Payez une fois. Toutes les mises à jour incluses.
              </p>
            </div>
          </div>

          {/* Card C — Site vitrine */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-[20px] p-8">
            {/* Browser mockup */}
            <div className="rounded-xl overflow-hidden border border-white/[0.08] mb-6">
              <div className="bg-[#1a1a1a] px-3 py-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c840]" />
                <span className="ml-2 text-[10px] text-[#444] font-mono">jean.photolio.fr</span>
              </div>
              <div
                className="h-28 bg-cover bg-center opacity-70"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=70')" }}
              />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-[#f0f0ee] mb-1.5">
              Site vitrine évolutif
            </h3>
            <p className="text-sm text-[#f0f0ee]/45 leading-relaxed">
              Sous-domaine Photolio ou domaine custom. Design qui évolue avec vous.
            </p>
          </div>

          {/* Card D — Back-office */}
          <div className="md:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-[20px] p-8 flex items-center">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#558b8b] mb-3">
                Back-office inclus
              </p>
              <h3 className="text-2xl font-extrabold tracking-tight text-[#f0f0ee] mb-3 leading-tight">
                Gérez tout depuis un seul endroit.
              </h3>
              <p className="text-sm text-[#f0f0ee]/45 leading-relaxed max-w-lg">
                Upload de photos, création de galeries, gestion des textes de votre site vitrine, liens de partage sécurisés — tout est dans votre back-office.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── SÉPARATEUR ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── GALERIE IMMERSIVE ── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 mb-12">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#558b8b] mb-4">
            Exemple de galerie client
          </p>
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-2px] leading-[1.05] text-[#f0f0ee] mb-4">
            Un lien.<br />Ils téléchargent.
          </h2>
          <p className="text-base text-[#f0f0ee]/45 max-w-lg leading-relaxed">
            Vos clients reçoivent un lien privé. Ils voient, ils choisissent, ils téléchargent en ZIP. Vous gardez le contrôle.
          </p>
        </div>

        {/* Grille masonry */}
        <div
          className="grid gap-1.5 px-1.5"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "200px 200px",
          }}
        >
          {GALLERY_PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-sm bg-white/[0.04]"
              style={photo.tall ? { gridRow: "span 2" } : {}}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                className="absolute inset-0 w-full h-full object-cover opacity-75"
              />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
                  <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-white/50">
                    {photo.caption}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── SÉPARATEUR ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── TARIF ── */}
      <section className="py-24 text-center px-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#558b8b] mb-4">
          Tarif
        </p>
        <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-2px] leading-[1.05] text-[#f0f0ee] mb-4">
          Un prix.<br />Pour toujours.
        </h2>
        <p className="text-base text-[#f0f0ee]/45 mb-14 max-w-sm mx-auto leading-relaxed">
          Pas de piège. Pas d&apos;abonnement. Payez une fois, utilisez à vie.
        </p>

        <div className="flex justify-center">
          <div className="relative w-full max-w-sm p-10 bg-[#558b8b]/[0.06] border border-[#558b8b]/20 rounded-3xl text-left">
            {/* Badge */}
            <span className="absolute -top-3.5 left-10 bg-[#558b8b] text-[#f0f0ee] text-[11px] font-bold px-4 py-1 rounded-full tracking-[0.05em]">
              Offre de lancement
            </span>

            <p className="text-[11px] tracking-[0.1em] text-[#f0f0ee]/40 uppercase mt-2 mb-1">
              Accès complet
            </p>
            <p className="line-through text-[#f0f0ee]/25 text-lg">149 €</p>
            <p className="text-[64px] font-extrabold tracking-[-3px] leading-none text-[#f0f0ee]">
              89<sup className="text-2xl align-top mt-4">€</sup>
            </p>
            <p className="text-[12px] text-[#558b8b] tracking-[0.05em] mt-1 mb-8">
              paiement unique · accès à vie
            </p>

            <ul className="space-y-0 mb-9">
              {PRICING_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2.5 py-2.5 border-b border-white/[0.05] text-sm text-[#f0f0ee]/70"
                >
                  <span className="text-[#558b8b] font-bold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="block w-full py-4 bg-[#558b8b] text-[#f0f0ee] rounded-xl font-bold text-sm text-center hover:bg-[#4a7a7a] transition-colors"
            >
              Contacter pour accéder ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── SÉPARATEUR ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 px-6 max-w-lg mx-auto text-center">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#558b8b] mb-4">
          Contact
        </p>
        <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-2px] leading-[1.05] text-[#f0f0ee] mb-4">
          Intéressé ?
        </h2>
        <p className="text-base text-[#f0f0ee]/45 mb-12 leading-relaxed">
          Envoyez un message. Je reviens sous 24h et crée votre accès.
        </p>
        <LandingContactForm />
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] px-6 py-8 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-extrabold text-sm text-[#f0f0ee]">Photolio</span>
        <span className="text-xs text-[#f0f0ee]/25">© 2026 · CGU · Confidentialité</span>
      </footer>

    </main>
  );
}
