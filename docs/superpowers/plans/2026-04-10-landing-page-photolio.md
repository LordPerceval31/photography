# Landing Page Photolio — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la landing page publique de `photolio.fr` — page unique défilante, glassmorphism, avec formulaire de contact Resend.

**Architecture:** Server Component principal (`app/page.tsx`) qui inclut un Client Component pour le formulaire de contact. La Server Action valide avec Zod, rate-limite avec Upstash, et envoie via Resend. Le middleware est mis à jour pour rendre `/` public.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, Framer Motion, Resend, Zod, Upstash Redis.

**Spec de référence :** `docs/superpowers/specs/2026-04-10-landing-page-photolio-design.md`

---

## Fichiers concernés

| Action | Fichier | Rôle |
|---|---|---|
| Modifier | `proxy.ts` | Rendre `/` public (pas de redirection login) |
| Modifier | `app/lib/ratelimit.ts` | Ajouter `contactRateLimit` |
| Créer | `app/actions/contact.ts` | Server Action : validation Zod + Resend |
| Créer | `app/_components/LandingContactForm.tsx` | Formulaire Client Component |
| Créer | `app/page.tsx` | Landing page complète (Server Component) |

---

## Task 1 — Middleware : rendre `/` public

**Files:**
- Modify: `proxy.ts`

Le middleware actuel redirige tout utilisateur non connecté vers `/login`, y compris les visiteurs de `photolio.fr`. Il faut ajouter `/` à la liste des routes publiques.

- [ ] **Étape 1 : Ouvrir `proxy.ts` et localiser `isPublicRoute`**

Chercher la ligne :
```ts
const isPublicRoute = pathname.startsWith("/gallery/");
```

- [ ] **Étape 2 : Ajouter `pathname === "/"` à la condition**

Remplacer par :
```ts
const isPublicRoute = pathname === "/" || pathname.startsWith("/gallery/");
```

- [ ] **Étape 3 : Vérifier manuellement**

Lancer `npm run dev`, ouvrir `http://localhost:3000` sans être connecté.
Attendu : la landing page s'affiche (ou une page vide, pas de redirection vers `/login`).

- [ ] **Étape 4 : Commit**

```bash
git add proxy.ts
git commit -m "fix: rendre la route / publique dans le middleware"
```

---

## Task 2 — Rate limiter pour le formulaire de contact

**Files:**
- Modify: `app/lib/ratelimit.ts`

Ajouter un rate limit dédié au formulaire de contact : 3 envois par 30 minutes par IP.

- [ ] **Étape 1 : Ajouter `contactRateLimit` dans `app/lib/ratelimit.ts`**

Après la dernière constante existante, ajouter :
```ts
// Formulaire de contact landing : 3 envois par 30 minutes (anti-spam)
export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "30 m"),
  analytics: true,
  prefix: "@upstash/ratelimit:contact",
});
```

- [ ] **Étape 2 : Vérifier que le fichier compile**

```bash
npx tsc --noEmit
```
Attendu : pas d'erreur sur `app/lib/ratelimit.ts`.

- [ ] **Étape 3 : Commit**

```bash
git add app/lib/ratelimit.ts
git commit -m "feat: ajouter contactRateLimit pour le formulaire landing"
```

---

## Task 3 — Server Action : envoi du formulaire de contact

**Files:**
- Create: `app/actions/contact.ts`

Server Action qui valide les données avec Zod, vérifie le rate limit par IP, puis envoie un email via Resend à l'adresse configurée dans `CONTACT_EMAIL`.

- [ ] **Étape 1 : Vérifier que `CONTACT_EMAIL` est défini dans `.env.local`**

Ouvrir `.env.local` (ou `.env`) et s'assurer que la variable existe :
```
CONTACT_EMAIL=sylvain@tondomaine.fr
```
Si elle n'existe pas, l'ajouter avec l'adresse email où tu veux recevoir les messages.

- [ ] **Étape 2 : Créer `app/actions/contact.ts`**

```ts
"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { resend } from "@/app/lib/resend";
import { contactRateLimit } from "@/app/lib/ratelimit";

// Schéma de validation du formulaire
const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères.").max(100),
  email: z.string().email("Email invalide."),
  subject: z.string().min(2, "Le sujet est requis.").max(200),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères.").max(2000),
});

export type ContactFormState = {
  success: boolean;
  error?: string;
};

export async function sendContactEmail(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // 1. Récupérer l'IP pour le rate limit
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "anonymous";

  // 2. Vérifier le rate limit
  const { success: allowed } = await contactRateLimit.limit(ip);
  if (!allowed) {
    return {
      success: false,
      error: "Trop de messages envoyés. Réessayez dans 30 minutes.",
    };
  }

  // 3. Valider les données
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Données invalides.";
    return { success: false, error: firstError };
  }

  const { name, email, subject, message } = parsed.data;

  // 4. Envoyer l'email via Resend
  const { error } = await resend.emails.send({
    from: "Photolio Contact <onboarding@resend.dev>",
    to: process.env.CONTACT_EMAIL!,
    replyTo: email,
    subject: `[Photolio] ${subject}`,
    html: `
      <div style="font-family: sans-serif; color: #2c2c2c; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #558b8b;">Nouveau message depuis photolio.fr</h2>
        <p><strong>De :</strong> ${name} (${email})</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error: "Erreur lors de l'envoi. Réessayez." };
  }

  return { success: true };
}
```

- [ ] **Étape 3 : Vérifier que le fichier compile**

```bash
npx tsc --noEmit
```
Attendu : pas d'erreur sur `app/actions/contact.ts`.

- [ ] **Étape 4 : Commit**

```bash
git add app/actions/contact.ts
git commit -m "feat: server action sendContactEmail avec Zod + Resend + rate limit"
```

---

## Task 4 — Client Component : formulaire de contact

**Files:**
- Create: `app/_components/LandingContactForm.tsx`

Formulaire React avec `useActionState` pour gérer l'état du Server Action (loading / succès / erreur).

- [ ] **Étape 1 : Créer `app/_components/LandingContactForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { sendContactEmail, type ContactFormState } from "@/app/actions/contact";

const initialState: ContactFormState = { success: false };

// Styles partagés pour les inputs glassmorphism de la landing
const inputClass =
  "w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-[#558b8b]/60 transition-colors";

export function LandingContactForm() {
  const [state, formAction, isPending] = useActionState(
    sendContactEmail,
    initialState
  );

  if (state.success) {
    return (
      <div className="text-center py-12">
        <div className="text-[#558b8b] text-4xl mb-4">✓</div>
        <p className="text-white/80 text-lg font-medium">Message envoyé !</p>
        <p className="text-white/40 text-sm mt-2">
          Je reviens vers vous sous 24h.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {/* Ligne Nom + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="name"
          placeholder="Prénom / Nom"
          required
          className={inputClass}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className={inputClass}
        />
      </div>

      {/* Sujet */}
      <input
        type="text"
        name="subject"
        placeholder="Sujet"
        required
        className={inputClass}
      />

      {/* Message */}
      <textarea
        name="message"
        placeholder="Message..."
        required
        rows={5}
        className={`${inputClass} resize-none`}
      />

      {/* Erreur */}
      {state.error && (
        <p className="text-red-400 text-sm">{state.error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 bg-white/90 text-[#080808] rounded-xl font-bold text-sm tracking-tight hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Envoi en cours..." : "Envoyer →"}
      </button>
    </form>
  );
}
```

- [ ] **Étape 2 : Vérifier que le fichier compile**

```bash
npx tsc --noEmit
```
Attendu : pas d'erreur.

- [ ] **Étape 3 : Commit**

```bash
git add app/_components/LandingContactForm.tsx
git commit -m "feat: LandingContactForm client component avec useActionState"
```

---

## Task 5 — Landing page principale

**Files:**
- Create: `app/page.tsx`

Server Component principal. Contient le header flottant, le hero plein écran, le bento grid, la galerie masonry, la section tarif, le formulaire de contact (via `LandingContactForm`), et le footer.

- [ ] **Étape 1 : Créer `app/page.tsx`**

```tsx
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

          {/* Card D — Texte complémentaire */}
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
```

- [ ] **Étape 2 : Vérifier que la page compile**

```bash
npx tsc --noEmit
```
Attendu : pas d'erreur TypeScript.

- [ ] **Étape 3 : Tester visuellement en dev**

```bash
npm run dev
```
Ouvrir `http://localhost:3000` :
- ✅ Header flottant pill avec "Get Started →" → `/login`
- ✅ Hero plein écran avec photo de fond + dégradé bas
- ✅ Bento grid 3 colonnes avec galerie mini, prix et browser mockup
- ✅ Galerie masonry 4 colonnes × 2 rangées
- ✅ Pricing card avec badge + liste + CTA → `#contact`
- ✅ Formulaire de contact fonctionnel
- ✅ Pas de redirection vers `/login` si non connecté

- [ ] **Étape 4 : Tester le formulaire de contact**

Remplir le formulaire et soumettre.
Attendu :
- Pendant l'envoi : "Envoi en cours..."
- Après succès : message "✓ Message envoyé !"
- Email reçu sur `CONTACT_EMAIL`

- [ ] **Étape 5 : Commit final**

```bash
git add app/page.tsx
git commit -m "feat: landing page photolio.fr — hero, bento, galerie, tarif, contact"
```

---

## Checklist de recette finale

Avant de considérer la tâche terminée, vérifier :

- [ ] `photolio.fr/` et `www.photolio.fr/` → affichent la landing (pas `/login`)
- [ ] `photolio.fr/login` → page de connexion back-office
- [ ] `photolio.fr/dashboard` → redirige vers `/login` si non connecté (middleware toujours actif)
- [ ] `jean.photolio.fr/` → affiche le site vitrine du photographe (proxy toujours actif)
- [ ] Formulaire contact → email reçu sur `CONTACT_EMAIL`
- [ ] Rate limit : 3 soumissions max par 30 min par IP
- [ ] Responsive : hero, bento, galerie lisibles sur mobile
