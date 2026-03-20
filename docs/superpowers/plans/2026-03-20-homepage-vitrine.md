# Homepage Vitrine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire la homepage publique du site vitrine photographe avec 4 sections : hero glassmorphism, image immersive + texte, section sombre citations + images chevauchées, carousel CSS automatique.

**Architecture:** Server Components pour toutes les sections visuelles, un seul Client Component pour la Navbar (sticky). Données Prisma avec ISR (`revalidate = 3600`). Pour la v1, des images hardcodées remplacent les vraies photos en attendant le back-office.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, Prisma 6, Cloudinary (via URL), `next/font` (Geist déjà installé)

---

## Fichiers créés / modifiés

| Fichier | Action | Rôle |
|---------|--------|------|
| `prisma/schema.prisma` | Modifier | Ajouter `isCover` sur `Photo` |
| `app/lib/prisma.ts` | Créer | Singleton Prisma client |
| `app/globals.css` | Modifier | Variables CSS + keyframes carousel |
| `app/layout.tsx` | Modifier | Mettre à jour les métadonnées |
| `app/page.tsx` | Modifier | Assemblage + ISR + fetch données |
| `app/_components/Navbar.tsx` | Créer | Nav glassmorphism sticky (Client) |
| `app/_components/HeroSection.tsx` | Créer | Hero plein écran glassmorphism |
| `app/_components/AboutSection.tsx` | Créer | Image 2/3 + fondu + texte |
| `app/_components/DarkSection.tsx` | Créer | Citations + 2 images chevauchées |
| `app/_components/CarouselSection.tsx` | Créer | Carousel CSS auto-scroll |

---

## Task 0 : Configurer `next.config.ts` pour les images externes

**Fichiers :**
- Modifier : `next.config.ts`

> À faire EN PREMIER. Sans cette configuration, `next/image` refusera toutes les URLs Cloudinary et Unsplash avec une erreur runtime bloquante.

- [ ] **Étape 1 : Modifier `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // images de production
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // placeholders v1 uniquement
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Étape 2 : Vérifier le build**

```bash
npm run build
```

Résultat attendu : build réussi.

- [ ] **Étape 3 : Commit**

```bash
git add next.config.ts
git commit -m "feat(config): allow Cloudinary and Unsplash image domains"
```

---

## Task 1 : Ajouter `isCover` au schema Prisma

**Fichiers :**
- Modifier : `prisma/schema.prisma`

- [ ] **Étape 1 : Modifier le schema**

Dans `prisma/schema.prisma`, ajouter `isCover` au modèle `Photo` :

```prisma
model Photo {
  id          String   @id @default(cuid())
  title       String
  description String?
  url         String
  isCover     Boolean  @default(false)   // ← ajouter cette ligne
  createdAt   DateTime @default(now())

  userId      String
  user        User     @relation(fields: [userId], references: [id])

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  galleries   GalleryPhoto[]
}
```

- [ ] **Étape 2 : Créer la migration**

```bash
npx prisma migrate dev --name add-is-cover
```

Résultat attendu : `Your database is now in sync with your schema.`

- [ ] **Étape 3 : Régénérer le client Prisma**

```bash
npx prisma generate
```

Résultat attendu : `Generated Prisma Client` sans erreur.

- [ ] **Étape 4 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 5 : Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): add isCover field to Photo model"
```

---

## Task 2 : Créer le singleton Prisma client

**Fichiers :**
- Créer : `app/lib/prisma.ts`

> Pourquoi un singleton ? En développement, Next.js recharge les modules à chaque changement. Sans singleton, chaque rechargement crée une nouvelle connexion à la base de données — tu dépasses rapidement la limite de connexions PostgreSQL.

- [ ] **Étape 1 : Créer `app/lib/prisma.ts`**

```ts
import { PrismaClient } from '../generated/prisma'

// Variable globale pour éviter plusieurs instances en développement
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add app/lib/prisma.ts
git commit -m "feat(lib): add Prisma client singleton"
```

---

## Task 3 : Variables CSS et keyframes carousel

**Fichiers :**
- Modifier : `app/globals.css`

- [ ] **Étape 1 : Mettre à jour `app/globals.css`**

Remplacer le contenu existant par :

```css
@import "tailwindcss";

/* ── Variables de design ── */
:root {
  --color-cream: #f5f5f0;
  --color-cream-alt: #f8f7f4;
  --color-dark: #0d0d0d;
  --color-dark-deep: #1a1a2e;
  --color-text: #1a1410;
  --color-text-muted: #6b5c50;
  --color-accent: #8b7355;
  --color-accent-light: #a0856a;
}

/* ── Carousel : défilement automatique ── */
@keyframes carousel-scroll {
  from {
    transform: translateX(0);
  }
  to {
    /* La piste est dupliquée, on défile de 50% */
    transform: translateX(-50%);
  }
}

.carousel-track {
  animation: carousel-scroll 30s linear infinite;
}

/* Pause au hover via CSS pur — aucun JS requis */
.carousel-wrapper:hover .carousel-track {
  animation-play-state: paused;
}
```

- [ ] **Étape 2 : Vérifier que le build passe**

```bash
npm run build
```

Résultat attendu : build réussi sans erreur.

- [ ] **Étape 3 : Commit**

```bash
git add app/globals.css
git commit -m "feat(styles): add CSS variables and carousel keyframes"
```

---

## Task 4 : Navbar glassmorphism

**Fichiers :**
- Créer : `app/_components/Navbar.tsx`

> C'est le seul composant avec `"use client"` car il doit détecter le scroll pour changer d'apparence (transparente sur le hero, opaque sur le reste).

- [ ] **Étape 1 : Créer `app/_components/Navbar.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Devient opaque après 80px de scroll
      setScrolled(window.scrollY > 80)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-between
        px-8 py-5
        border-b transition-all duration-300
        ${scrolled
          ? 'bg-white/90 backdrop-blur-md border-black/10 shadow-sm'
          : 'bg-white/5 backdrop-blur-xl border-white/10'
        }
      `}
    >
      {/* Logo */}
      <Link
        href="/"
        className={`
          text-sm font-bold tracking-[0.2em] uppercase
          ${scrolled ? 'text-[var(--color-text)]' : 'text-white'}
        `}
      >
        Jean Dupont
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-8">
        {[
          { label: 'Galeries', href: '/galeries' },
          { label: 'À propos', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ].map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`
              text-xs tracking-[0.12em] uppercase transition-opacity hover:opacity-100
              ${scrolled
                ? 'text-[var(--color-text)] opacity-70'
                : 'text-white/70'
              }
            `}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add app/_components/Navbar.tsx
git commit -m "feat(ui): add glassmorphism sticky navbar"
```

---

## Task 5 : HeroSection

**Fichiers :**
- Créer : `app/_components/HeroSection.tsx`

> Server Component pur. L'image de fond et le contenu sont passés en props depuis `page.tsx`.

- [ ] **Étape 1 : Créer `app/_components/HeroSection.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'

type HeroSectionProps = {
  imageUrl: string
  // Textes configurables
  eyebrow?: string
  title: string
  titleAccent: string
  subtitle?: string
}

export default function HeroSection({
  imageUrl,
  eyebrow = 'Photographe — Paris',
  title,
  titleAccent,
  subtitle,
}: HeroSectionProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Image de fond */}
      <Image
        src={imageUrl}
        alt="Photo de couverture"
        fill
        className="object-cover"
        priority // Chargée en priorité (LCP)
        sizes="100vw"
      />

      {/* Overlay sombre pour lisibilité */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Carte glassmorphism centrée */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div
          className="
            max-w-xl w-full text-center
            rounded-2xl px-14 py-14
            border border-white/15
          "
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)', /* Safari */
          }}
        >
          {/* Eyebrow */}
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/50 mb-4">
            {eyebrow}
          </p>

          {/* Titre */}
          <h1 className="text-5xl font-light leading-tight tracking-tight text-white mb-3">
            {title}
            <br />
            <strong className="font-bold">{titleAccent}</strong>
          </h1>

          {/* Sous-titre */}
          {subtitle && (
            <p className="text-[15px] text-white/60 leading-relaxed mb-8">
              {subtitle}
            </p>
          )}

          {/* CTA */}
          <Link
            href="/galeries"
            className="
              inline-block bg-white text-[var(--color-text)]
              px-8 py-3 rounded-full
              text-xs font-semibold tracking-[0.1em] uppercase
              transition-all hover:bg-white/90 hover:scale-105
            "
          >
            Voir les galeries
          </Link>
        </div>
      </div>

      {/* Indicateur de scroll — animé en CSS pur */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.15em] uppercase text-white/35">
          Défiler
        </span>
        <span className="text-white/35 animate-bounce text-lg">↓</span>
      </div>
    </section>
  )
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Étape 3 : Commit**

```bash
git add app/_components/HeroSection.tsx
git commit -m "feat(ui): add hero section with glassmorphism card"
```

---

## Task 6 : AboutSection (image 2/3 + texte)

**Fichiers :**
- Créer : `app/_components/AboutSection.tsx`

- [ ] **Étape 1 : Créer `app/_components/AboutSection.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'

type AboutSectionProps = {
  imageUrl: string
  tag?: string
  title: string
  titleItalic: string
  body: string
}

export default function AboutSection({
  imageUrl,
  tag = 'À propos',
  title,
  titleItalic,
  body,
}: AboutSectionProps) {
  return (
    <section
      className="relative grid grid-cols-[2fr_1fr] min-h-[85vh] overflow-hidden"
      style={{ background: 'var(--color-cream)' }}
    >
      {/* Colonne gauche : image 2/3 de la largeur */}
      <div className="relative">
        <Image
          src={imageUrl}
          alt="Photo d'ambiance"
          fill
          className="object-cover"
          sizes="66vw"
        />
        {/* Fondu vers la droite pour enchaîner avec le fond crème */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, transparent 0%, transparent 50%, var(--color-cream) 85%, var(--color-cream) 100%)',
          }}
        />
      </div>

      {/* Colonne droite : texte 1/3 */}
      <div
        className="flex flex-col justify-center px-12 py-16"
        style={{ background: 'var(--color-cream)' }}
      >
        {/* Tag */}
        <p
          className="text-[10px] tracking-[0.2em] uppercase mb-5"
          style={{ color: 'var(--color-accent)' }}
        >
          {tag}
        </p>

        {/* Titre */}
        <h2
          className="text-4xl font-light leading-snug tracking-tight mb-5"
          style={{ color: 'var(--color-text)' }}
        >
          {title}
          <br />
          <em
            className="not-italic font-normal"
            style={{ color: 'var(--color-accent-light)' }}
          >
            {titleItalic}
          </em>
        </h2>

        {/* Corps */}
        <p
          className="text-[15px] leading-[1.8] mb-8"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {body}
        </p>

        {/* Bouton outline */}
        <Link
          href="/galeries"
          className="
            self-start border border-current
            px-7 py-3 rounded-full
            text-xs font-semibold tracking-[0.1em] uppercase
            transition-opacity hover:opacity-60
          "
          style={{ color: 'var(--color-text)' }}
        >
          Découvrir les galeries
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Étape 3 : Commit**

```bash
git add app/_components/AboutSection.tsx
git commit -m "feat(ui): add about section with 2/3 immersive image"
```

---

## Task 7 : DarkSection (citations + 2 images chevauchées)

**Fichiers :**
- Créer : `app/_components/DarkSection.tsx`

- [ ] **Étape 1 : Créer `app/_components/DarkSection.tsx`**

```tsx
import Image from 'next/image'

type Quote = {
  text: string
  author: string
}

type DarkSectionProps = {
  quotes: [Quote, Quote] // exactement 2 citations
  images: [string, string] // exactement 2 URLs d'images
}

export default function DarkSection({ quotes, images }: DarkSectionProps) {
  return (
    <section
      className="grid grid-cols-2 items-center gap-20 px-20 py-24 min-h-[70vh]"
      style={{ background: 'var(--color-dark)' }}
    >
      {/* Colonne gauche : citations */}
      <div>
        {quotes.map((quote, index) => (
          <div
            key={index}
            className={index === 1 ? 'mt-12 pt-10 border-t border-white/10' : ''}
          >
            {/* Grand guillemet décoratif */}
            <div
              className="text-[72px] leading-none font-serif mb-2"
              style={{ color: 'rgba(255,255,255,0.08)' }}
              aria-hidden="true"
            >
              "
            </div>

            {/* Citation */}
            <blockquote
              className="text-2xl font-light italic leading-relaxed mb-4"
              style={{ color: 'rgba(255,255,255,0.88)' }}
            >
              {quote.text}
            </blockquote>

            {/* Auteur */}
            <cite
              className="not-italic text-[11px] tracking-[0.18em] uppercase"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              — {quote.author}
            </cite>
          </div>
        ))}
      </div>

      {/* Colonne droite : 2 images qui se chevauchent */}
      <div className="relative h-[480px]">
        {/* Image 1 : grande, positionnée à droite */}
        <div className="absolute top-0 right-0 w-[65%] h-[72%] rounded-lg overflow-hidden shadow-2xl z-10">
          <Image
            src={images[0]}
            alt="Photo 1"
            fill
            className="object-cover"
            sizes="30vw"
          />
        </div>

        {/* Image 2 : plus petite, chevauchement en bas à gauche */}
        <div className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-lg overflow-hidden shadow-2xl z-20">
          <Image
            src={images[1]}
            alt="Photo 2"
            fill
            className="object-cover"
            sizes="25vw"
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Étape 3 : Commit**

```bash
git add app/_components/DarkSection.tsx
git commit -m "feat(ui): add dark section with quotes and overlapping images"
```

---

## Task 8 : CarouselSection (CSS auto-scroll)

**Fichiers :**
- Créer : `app/_components/CarouselSection.tsx`

> Le carousel duplique la liste d'images pour créer une boucle infinie sans JS. Le keyframe anime `-50%` (donc la moitié de la piste dupliquée). Les largeurs varient selon le ratio de chaque image (portrait vs paysage).

- [ ] **Étape 1 : Créer `app/_components/CarouselSection.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'

type CarouselPhoto = {
  id: string
  url: string
  title: string
  // Ratio de l'image pour calculer la largeur dans le carousel
  aspectRatio?: 'portrait' | 'landscape' | 'square'
}

type CarouselSectionProps = {
  photos: CarouselPhoto[]
}

// Largeurs en pixels selon le ratio
const WIDTHS: Record<string, number> = {
  portrait: 220,
  landscape: 360,
  square: 280,
}

export default function CarouselSection({ photos }: CarouselSectionProps) {
  // On duplique les photos pour la boucle infinie
  const doubled = [...photos, ...photos]

  return (
    <section
      className="py-20 overflow-hidden"
      style={{ background: 'var(--color-cream-alt)' }}
    >
      {/* Header */}
      <div className="flex items-end justify-between px-20 mb-10">
        <h2
          className="text-3xl font-light tracking-tight"
          style={{ color: 'var(--color-text)' }}
        >
          Dernières images
        </h2>
        <Link
          href="/galeries"
          className="text-xs tracking-[0.12em] uppercase pb-0.5 border-b transition-opacity hover:opacity-60"
          style={{ color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}
        >
          Toutes les galeries →
        </Link>
      </div>

      {/* Piste du carousel */}
      {/* carousel-wrapper déclenche la pause au hover via globals.css */}
      <div className="carousel-wrapper overflow-hidden">
        <div className="carousel-track flex gap-4">
          {doubled.map((photo, index) => {
            const ratio = photo.aspectRatio ?? 'landscape'
            const width = WIDTHS[ratio]

            return (
              <div
                key={`${photo.id}-${index}`}
                className="flex-shrink-0 rounded-xl overflow-hidden"
                style={{ width: `${width}px`, height: '360px' }}
              >
                <Image
                  src={photo.url}
                  alt={photo.title}
                  width={width}
                  height={360}
                  className="w-full h-full object-cover"
                  // Les images dupliquées ne sont pas prioritaires
                  loading={index < photos.length ? 'eager' : 'lazy'}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Étape 3 : Commit**

```bash
git add app/_components/CarouselSection.tsx
git commit -m "feat(ui): add auto-scroll carousel with variable widths"
```

---

## Task 9 : Assembler `page.tsx` avec ISR

**Fichiers :**
- Modifier : `app/page.tsx`

> Pour la v1, on utilise des images hardcodées (URLs Cloudinary ou placeholders). Les requêtes Prisma sont commentées mais présentes, prêtes à être activées quand le back-office existe.

- [ ] **Étape 1 : Remplacer `app/page.tsx`**

```tsx
import Navbar from './_components/Navbar'
import HeroSection from './_components/HeroSection'
import AboutSection from './_components/AboutSection'
import DarkSection from './_components/DarkSection'
import CarouselSection from './_components/CarouselSection'

// ISR : regénère la page toutes les heures
export const revalidate = 3600

// ── Données v1 : hardcodées en attendant le back-office ──────────────────────
// Remplacer les URLs par de vraies photos Cloudinary quand disponibles.
// Format Cloudinary : https://res.cloudinary.com/<cloud_name>/image/upload/<public_id>

const HERO_IMAGE = 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&q=80'

const ABOUT_IMAGE = 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1200&q=80'

const DARK_IMAGES: [string, string] = [
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
  'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=800&q=80',
]

const CAROUSEL_PHOTOS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80', title: 'Street', aspectRatio: 'landscape' as const },
  { id: '2', url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80', title: 'Paysage', aspectRatio: 'portrait' as const },
  { id: '3', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&q=80', title: 'Portrait', aspectRatio: 'square' as const },
  { id: '4', url: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=900&q=80', title: 'Auto', aspectRatio: 'landscape' as const },
  { id: '5', url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=600&q=80', title: 'Studio', aspectRatio: 'portrait' as const },
  { id: '6', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', title: 'Soirée', aspectRatio: 'landscape' as const },
  { id: '7', url: 'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=700&q=80', title: 'Street 2', aspectRatio: 'square' as const },
]

// ── Requêtes Prisma (à activer quand le back-office existe) ───────────────────
// import { prisma } from './lib/prisma'
//
// async function getData() {
//   const [heroPhoto, aboutPhoto, darkPhotos, carouselPhotos] = await Promise.all([
//     prisma.photo.findFirst({ where: { isCover: true } }),
//     prisma.photo.findFirst({ orderBy: { createdAt: 'desc' } }),
//     prisma.photo.findMany({ take: 2, orderBy: { createdAt: 'desc' } }),
//     prisma.photo.findMany({ take: 14, orderBy: { createdAt: 'desc' } }),
//   ])
//   return { heroPhoto, aboutPhoto, darkPhotos, carouselPhotos }
// }
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <Navbar />

      <HeroSection
        imageUrl={HERO_IMAGE}
        eyebrow="Photographe — Paris"
        title="La lumière"
        titleAccent="comme langage"
        subtitle="Street, paysages, portrait — des instants capturés entre ombre et lumière."
      />

      <AboutSection
        imageUrl={ABOUT_IMAGE}
        tag="À propos"
        title="Capturer"
        titleItalic="l'essentiel"
        body="Des rues animées de Paris aux paysages silencieux, chaque cliché est une tentative de figer ce qui disparaît."
      />

      <DarkSection
        quotes={[
          {
            text: 'La photographie, c\'est une façon de crier, de se libérer.',
            author: 'Henri Cartier-Bresson',
          },
          {
            text: 'Vos premiers 10 000 photos sont les pires.',
            author: 'Henri Cartier-Bresson',
          },
        ]}
        images={DARK_IMAGES}
      />

      <CarouselSection photos={CAROUSEL_PHOTOS} />
    </main>
  )
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Étape 3 : Lancer le serveur de développement et vérifier visuellement**

```bash
npm run dev
```

Ouvrir http://localhost:3000 et vérifier :
- [ ] La nav est visible et glassmorphism sur le hero
- [ ] Le hero occupe 100vh avec la carte centrée
- [ ] La section About a l'image à gauche (2/3) avec fondu
- [ ] La section sombre affiche les citations et les 2 images chevauchées
- [ ] Le carousel défile automatiquement et se pause au hover

- [ ] **Étape 4 : Vérifier le build de production**

```bash
npm run build
```

Résultat attendu : build réussi, pas d'erreur TypeScript ni d'avertissement bloquant.

- [ ] **Étape 5 : Commit**

```bash
git add app/page.tsx
git commit -m "feat(page): assemble homepage with ISR and placeholder images"
```

---

## Task 10 : Mettre à jour les métadonnées dans `layout.tsx`

**Fichiers :**
- Modifier : `app/layout.tsx`

- [ ] **Étape 1 : Modifier les métadonnées**

Dans `app/layout.tsx`, remplacer le bloc `metadata` :

```tsx
export const metadata: Metadata = {
  title: 'Jean Dupont — Photographe',
  description:
    'Site vitrine de Jean Dupont, photographe amateur passionné de street, paysages, portrait et salons auto.',
}
```

- [ ] **Étape 2 : Vérifier le build final**

```bash
npm run build
```

- [ ] **Étape 3 : Commit final**

```bash
git add app/layout.tsx
git commit -m "feat(meta): update page title and description"
```

---

## Checklist de validation finale

Avant de considérer ce plan terminé :

- [ ] `npm run build` passe sans erreur
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] La page s'affiche correctement à http://localhost:3000
- [ ] La Navbar devient opaque en scrollant (comportement sticky)
- [ ] Le glassmorphism est visible sur Chrome ET Safari
- [ ] Le carousel défile automatiquement et se pause au hover
- [ ] Les 2 images de la section sombre se chevauchent visuellement
- [ ] L'image de la section About occupe bien 2/3 de la largeur avec le fondu

