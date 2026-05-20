# Système Multi-Templates — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à chaque photographe d'acheter et d'activer un template de vitrine parmi plusieurs, avec des designs et structures différents.

**Architecture:** Un dossier `app/[domain]/templates/[slug]/` par template. Les routes (`page.tsx`) deviennent des aiguilleurs qui lisent `activeTemplateId` du user en DB et chargent le bon template dynamiquement. Les helpers de fetch sont mutualisés dans `app/lib/`.

**Tech Stack:** Next.js 15 App Router, Prisma, PostgreSQL, TypeScript strict, Server Actions

---

## Fichiers concernés

### Créer
- `app/lib/getUserByDomain.ts` — helper partagé (DRY, remplace les queries dupliquées)
- `app/[domain]/templates/premium/home/index.tsx` — page home du template premium
- `app/[domain]/templates/premium/about/index.tsx` — page about du template premium
- `app/[domain]/templates/premium/gallery/index.tsx` — page gallery du template premium
- `app/[domain]/templates/premium/services/index.tsx` — page services du template premium
- `app/(admin)/dashboard/templates/page.tsx` — page dashboard de sélection des templates
- `app/(admin)/dashboard/templates/TemplatesClient.tsx` — composant client
- `app/(admin)/actions/templates.ts` — server actions (activer un template)
- `prisma/seed.ts` — seed du template premium + migration des users existants

### Modifier
- `prisma/schema.prisma` — ajout Template, UserTemplate, champs sur User et SiteConfig
- `app/[domain]/page.tsx` — transformé en aiguilleur
- `app/[domain]/about/page.tsx` — transformé en aiguilleur
- `app/[domain]/gallery/page.tsx` — transformé en aiguilleur
- `app/[domain]/services/page.tsx` — transformé en aiguilleur

### Déplacer (git mv)
- `app/[domain]/home/` → `app/[domain]/templates/premium/home/` (sous-composants)
- `app/[domain]/about/BioSection.tsx` → `app/[domain]/templates/premium/about/`
- `app/[domain]/about/StorySection.tsx` → `app/[domain]/templates/premium/about/`
- `app/[domain]/about/PictureAboutSection.tsx` → `app/[domain]/templates/premium/about/`
- `app/[domain]/about/PictureAboutWrapper.tsx` → `app/[domain]/templates/premium/about/`
- `app/[domain]/gallery/GalleryCarousel.tsx` → `app/[domain]/templates/premium/gallery/`
- `app/[domain]/gallery/MasonryClient.tsx` → `app/[domain]/templates/premium/gallery/`
- `app/[domain]/gallery/background.tsx` → `app/[domain]/templates/premium/gallery/`
- `app/[domain]/gallery/BackgroundWrapper.tsx` → `app/[domain]/templates/premium/gallery/`
- `app/[domain]/services/ServicesSection.tsx` → `app/[domain]/templates/premium/services/`
- `app/[domain]/services/ContactSection.tsx` → `app/[domain]/templates/premium/services/`

---

## Task 1 : Schéma Prisma

**Fichiers :**
- Modifier : `prisma/schema.prisma`

- [ ] **Étape 1 : Ajouter les modèles Template et UserTemplate**

Dans `prisma/schema.prisma`, ajouter après le modèle `InviteCode` :

```prisma
model Template {
  id         String  @id @default(cuid())
  slug       String  @unique   // "premium", "minimal", "cinematic"...
  name       String            // "Premium", "Minimal"...
  price      Float             // prix en euros
  previewUrl String?           // URL d'une capture d'écran

  activeUsers User[]         @relation("UserActiveTemplate")
  purchases   UserTemplate[]
}

model UserTemplate {
  userId      String
  templateId  String
  purchasedAt DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  template Template @relation(fields: [templateId], references: [id])

  @@id([userId, templateId])
}
```

- [ ] **Étape 2 : Modifier le modèle User**

Dans le modèle `User`, ajouter après `siteConfig SiteConfig?` :

```prisma
activeTemplateId   String?
activeTemplate     Template?      @relation("UserActiveTemplate", fields: [activeTemplateId], references: [id])
purchasedTemplates UserTemplate[]
```

- [ ] **Étape 3 : Modifier le modèle SiteConfig**

Dans le modèle `SiteConfig`, ajouter après `seoDescription` :

```prisma
templateConfig  Json?   // champs spécifiques au template actif
```

- [ ] **Étape 4 : Lancer la migration**

```bash
npx prisma migrate dev --name add_template_system
```

Résultat attendu : `Your database is now in sync with your schema.`

- [ ] **Étape 5 : Vérifier que le client Prisma est régénéré**

```bash
npx prisma generate
```

Résultat attendu : `Generated Prisma Client`

- [ ] **Étape 6 : Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Template and UserTemplate models to schema"
```

---

## Task 2 : Helper partagé getUserByDomain

**Fichiers :**
- Créer : `app/lib/getUserByDomain.ts`

Actuellement chaque route duplique la même query Prisma. On centralise.

- [ ] **Étape 1 : Créer le helper**

```typescript
// app/lib/getUserByDomain.ts
import { cache } from "react";
import prisma from "@/app/lib/prisma";

// cache() déduplique les appels Prisma entre generateMetadata et le rendu
// de la page dans le même cycle de requête Next.js
export const getUserByDomain = cache(async (domain: string) => {
  return prisma.user.findFirst({
    where: {
      subdomain: domain,
    },
    include: {
      siteConfig: true,
      activeTemplate: true,
      photos: { where: { isCover: true }, take: 1 },
    },
  });
});
```

- [ ] **Étape 2 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur

- [ ] **Étape 3 : Commit**

```bash
git add app/lib/getUserByDomain.ts
git commit -m "feat: add shared getUserByDomain helper with React cache"
```

---

## Task 3 : Déplacer les composants vers templates/premium

On déplace les sous-composants existants dans leur dossier template. On utilise `git mv` pour conserver l'historique git.

**Fichiers :**
- Déplacer : tous les sous-composants de `app/[domain]/home/`, `about/`, `gallery/`, `services/`

- [ ] **Étape 1 : Créer la structure de dossiers**

```bash
mkdir -p "app/[domain]/templates/premium/home"
mkdir -p "app/[domain]/templates/premium/about"
mkdir -p "app/[domain]/templates/premium/gallery"
mkdir -p "app/[domain]/templates/premium/services"
```

- [ ] **Étape 2 : Déplacer les composants home**

```bash
git mv "app/[domain]/home/HeroSection.tsx" "app/[domain]/templates/premium/home/HeroSection.tsx"
git mv "app/[domain]/home/PremiumGalleryWrapper.tsx" "app/[domain]/templates/premium/home/PremiumGalleryWrapper.tsx"
git mv "app/[domain]/home/DarkSection.tsx" "app/[domain]/templates/premium/home/DarkSection.tsx"
git mv "app/[domain]/home/CarouselWrapper.tsx" "app/[domain]/templates/premium/home/CarouselWrapper.tsx"
git mv "app/[domain]/home/CarouselSection.tsx" "app/[domain]/templates/premium/home/CarouselSection.tsx"
git mv "app/[domain]/home/PremiumGallerySection.tsx" "app/[domain]/templates/premium/home/PremiumGallerySection.tsx"
```

- [ ] **Étape 3 : Déplacer les composants about**

```bash
git mv "app/[domain]/about/BioSection.tsx" "app/[domain]/templates/premium/about/BioSection.tsx"
git mv "app/[domain]/about/StorySection.tsx" "app/[domain]/templates/premium/about/StorySection.tsx"
git mv "app/[domain]/about/PictureAboutSection.tsx" "app/[domain]/templates/premium/about/PictureAboutSection.tsx"
git mv "app/[domain]/about/PictureAboutWrapper.tsx" "app/[domain]/templates/premium/about/PictureAboutWrapper.tsx"
```

- [ ] **Étape 4 : Déplacer les composants gallery**

```bash
git mv "app/[domain]/gallery/GalleryCarousel.tsx" "app/[domain]/templates/premium/gallery/GalleryCarousel.tsx"
git mv "app/[domain]/gallery/MasonryClient.tsx" "app/[domain]/templates/premium/gallery/MasonryClient.tsx"
git mv "app/[domain]/gallery/background.tsx" "app/[domain]/templates/premium/gallery/background.tsx"
git mv "app/[domain]/gallery/BackgroundWrapper.tsx" "app/[domain]/templates/premium/gallery/BackgroundWrapper.tsx"
```

- [ ] **Étape 5 : Déplacer les composants services**

```bash
git mv "app/[domain]/services/ServicesSection.tsx" "app/[domain]/templates/premium/services/ServicesSection.tsx"
git mv "app/[domain]/services/ContactSection.tsx" "app/[domain]/templates/premium/services/ContactSection.tsx"
```

- [ ] **Étape 6 : Commit les déplacements**

```bash
git add -A
git commit -m "refactor: move template components into templates/premium/"
```

---

## Task 4 : Créer les pages index des templates premium

Ces fichiers sont les "pages" de chaque template (composants React, pas des routes Next.js car ils ne s'appellent pas `page.tsx`).

**Fichiers :**
- Créer : `app/[domain]/templates/premium/home/index.tsx`
- Créer : `app/[domain]/templates/premium/about/index.tsx`
- Créer : `app/[domain]/templates/premium/gallery/index.tsx`
- Créer : `app/[domain]/templates/premium/services/index.tsx`

- [ ] **Étape 1 : Créer la page home du template premium**

```typescript
// app/[domain]/templates/premium/home/index.tsx
import HeroSection from "./HeroSection";
import PremiumGalleryWrapper from "./PremiumGalleryWrapper";
import DarkSection from "./DarkSection";
import CarouselWrapper from "./CarouselWrapper";
import SmoothScroll from "@/app/_components/SmoothScroll";

interface Props {
  userId: string;
}

// Contenu visuel de la page home — template Premium
// L'aiguilleur (app/[domain]/page.tsx) injecte userId
const PremiumHome = ({ userId }: Props) => {
  return (
    <main className="relative w-full">
      <SmoothScroll>
        <HeroSection userId={userId} />
        <PremiumGalleryWrapper userId={userId} />
        <DarkSection userId={userId} />
        <CarouselWrapper userId={userId} />
      </SmoothScroll>
    </main>
  );
};

export default PremiumHome;
```

- [ ] **Étape 2 : Créer la page about du template premium**

```typescript
// app/[domain]/templates/premium/about/index.tsx
import BioSection from "./BioSection";
import StorySection from "./StorySection";
import PictureAboutWrapper from "./PictureAboutWrapper";

interface Props {
  userId: string;
}

const PremiumAbout = ({ userId }: Props) => {
  return (
    <main className="relative w-full bg-cream">
      <BioSection userId={userId} />
      <StorySection userId={userId} />
      <PictureAboutWrapper userId={userId} />
    </main>
  );
};

export default PremiumAbout;
```

- [ ] **Étape 3 : Créer la page gallery du template premium**

```typescript
// app/[domain]/templates/premium/gallery/index.tsx
import BackgroundWrapper from "./BackgroundWrapper";

interface Props {
  userId: string;
}

const PremiumGallery = ({ userId }: Props) => {
  return (
    <main className="min-h-screen w-full bg-dark relative">
      <BackgroundWrapper userId={userId} />
    </main>
  );
};

export default PremiumGallery;
```

- [ ] **Étape 4 : Créer la page services du template premium**

```typescript
// app/[domain]/templates/premium/services/index.tsx
import Image from "next/image";
import prisma from "@/app/lib/prisma";
import ServicesSection from "./ServicesSection";
import ContactSection from "./ContactSection";

interface Props {
  userId: string;
}

// Ce composant est async car il fetch les services en DB
const PremiumServices = async ({ userId }: Props) => {
  const [services, user] = await Promise.all([
    prisma.service.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailjsServiceId: true,
        emailjsTemplateId: true,
        emailjsPublicKey: true,
      },
    }),
  ]);

  return (
    <main className="relative w-full min-h-screen flex flex-col">
      {/* Background fixé derrière le contenu */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/contactImage.webp"
          alt="Fond de la page Service"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 tablet:w-96 tablet:h-96 4k:w-175 4k:h-175 rounded-full bg-blue/20 blur-[80px] 4k:blur-[160px]" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 tablet:w-96 tablet:h-96 4k:w-175 4k:h-175 rounded-full bg-blue/15 blur-[100px] 4k:blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 4k:w-90 4k:h-90 rounded-full bg-cream/5 blur-[60px] 4k:blur-[130px]" />
      </div>

      {/* Contenu scrollable par-dessus */}
      <div className="relative z-10 w-full flex flex-col">
        <ServicesSection services={services} />
        <ContactSection
          hasNoCards={services.length === 0}
          emailjsServiceId={user?.emailjsServiceId ?? null}
          emailjsTemplateId={user?.emailjsTemplateId ?? null}
          emailjsPublicKey={user?.emailjsPublicKey ?? null}
        />
      </div>
    </main>
  );
};

export default PremiumServices;
```

- [ ] **Étape 5 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur

- [ ] **Étape 6 : Commit**

```bash
git add "app/[domain]/templates/"
git commit -m "feat: create premium template page components"
```

---

## Task 5 : Transformer les routes en aiguilleurs

Les `page.tsx` des routes deviennent des aiguilleurs : ils lisent `activeTemplateId` et chargent le bon composant.

**Fichiers :**
- Modifier : `app/[domain]/page.tsx`
- Modifier : `app/[domain]/about/page.tsx`
- Modifier : `app/[domain]/gallery/page.tsx`
- Modifier : `app/[domain]/services/page.tsx`

- [ ] **Étape 1 : Réécrire app/[domain]/page.tsx**

```typescript
// app/[domain]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getUserByDomain } from "@/app/lib/getUserByDomain";

export const revalidate = 3600;

// Registre des templates disponibles
// Ajouter une entrée ici quand un nouveau template est créé
const templateMap: Record<
  string,
  () => Promise<{ default: ComponentType<{ userId: string }> }>
> = {
  premium: () => import("./templates/premium/home/index"),
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return { title: "Portfolio introuvable" };

  const config = user.siteConfig;
  const seoTitle = config?.seoTitle || `${user.name || "Photographe"} | Portfolio`;
  const seoDescription =
    config?.seoDescription ||
    `Découvrez les galeries et le portfolio de ${user.name || "ce photographe"}.`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: `https://${domain}` },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `https://${domain}`,
      type: "website",
    },
  };
}

const Home = async ({ params }: { params: Promise<{ domain: string }> }) => {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return notFound();

  const config = user.siteConfig;
  const coverPhoto = user.photos[0];

  // Données structurées Schema.org pour le SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `https://${domain}`,
    name: config?.seoTitle || user.name || "Photographe",
    url: `https://${domain}`,
    image: coverPhoto?.url || user.image || "",
    description: config?.seoDescription || config?.bioParagraph1 || config?.heroTagline || "",
    ...(config?.heroTagline && { slogan: config.heroTagline }),
  };

  // Chargement dynamique du template actif (fallback: premium)
  const slug = user.activeTemplate?.slug ?? "premium";
  const loader = templateMap[slug] ?? templateMap["premium"];
  const { default: TemplatePage } = await loader();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TemplatePage userId={user.id} />
    </>
  );
};

export default Home;
```

- [ ] **Étape 2 : Réécrire app/[domain]/about/page.tsx**

```typescript
// app/[domain]/about/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getUserByDomain } from "@/app/lib/getUserByDomain";

export const revalidate = 3600;
export const metadata: Metadata = { title: "À propos" };

const templateMap: Record<
  string,
  () => Promise<{ default: ComponentType<{ userId: string }> }>
> = {
  premium: () => import("./templates/premium/about/index"),
};

const AboutPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return notFound();

  const slug = user.activeTemplate?.slug ?? "premium";
  const loader = templateMap[slug] ?? templateMap["premium"];
  const { default: TemplatePage } = await loader();

  return <TemplatePage userId={user.id} />;
};

export default AboutPage;
```

- [ ] **Étape 3 : Réécrire app/[domain]/gallery/page.tsx**

```typescript
// app/[domain]/gallery/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getUserByDomain } from "@/app/lib/getUserByDomain";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Galeries" };

const templateMap: Record<
  string,
  () => Promise<{ default: ComponentType<{ userId: string }> }>
> = {
  premium: () => import("./templates/premium/gallery/index"),
};

const GalleryPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return notFound();

  const slug = user.activeTemplate?.slug ?? "premium";
  const loader = templateMap[slug] ?? templateMap["premium"];
  const { default: TemplatePage } = await loader();

  return <TemplatePage userId={user.id} />;
};

export default GalleryPage;
```

- [ ] **Étape 4 : Réécrire app/[domain]/services/page.tsx**

```typescript
// app/[domain]/services/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getUserByDomain } from "@/app/lib/getUserByDomain";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Services" };

const templateMap: Record<
  string,
  () => Promise<{ default: ComponentType<{ userId: string }> }>
> = {
  premium: () => import("./templates/premium/services/index"),
};

const ServicePage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return notFound();

  const slug = user.activeTemplate?.slug ?? "premium";
  const loader = templateMap[slug] ?? templateMap["premium"];
  const { default: TemplatePage } = await loader();

  return <TemplatePage userId={user.id} />;
};

export default ServicePage;
```

- [ ] **Étape 5 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur

- [ ] **Étape 6 : Lancer le build pour vérifier**

```bash
npm run build
```

Résultat attendu : build réussi, aucune erreur. Les routes `/[domain]`, `/[domain]/about`, `/[domain]/gallery`, `/[domain]/services` sont toujours présentes.

- [ ] **Étape 7 : Commit**

```bash
git add "app/[domain]/page.tsx" "app/[domain]/about/page.tsx" "app/[domain]/gallery/page.tsx" "app/[domain]/services/page.tsx"
git commit -m "refactor: transform domain routes into template dispatchers"
```

---

## Task 6 : Seed — Template premium + migration des users existants

On crée le template "premium" en DB et on rattache tous les users existants à ce template.

**Fichiers :**
- Créer : `prisma/seed.ts`

- [ ] **Étape 1 : Créer le fichier seed**

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Création du template premium (upsert = idempotent, peut être relancé sans risque)
  const premium = await prisma.template.upsert({
    where: { slug: "premium" },
    update: {},
    create: {
      slug: "premium",
      name: "Premium",
      price: 0, // à mettre à jour quand les prix sont définis
      previewUrl: null,
    },
  });

  console.log(`✓ Template créé : ${premium.name} (id: ${premium.id})`);

  // Récupération de tous les users sans template actif
  const usersWithoutTemplate = await prisma.user.findMany({
    where: { activeTemplateId: null },
    select: { id: true },
  });

  console.log(`→ ${usersWithoutTemplate.length} users à migrer`);

  for (const user of usersWithoutTemplate) {
    // Créer l'achat du template premium
    await prisma.userTemplate.upsert({
      where: {
        userId_templateId: { userId: user.id, templateId: premium.id },
      },
      update: {},
      create: { userId: user.id, templateId: premium.id },
    });

    // Activer le template premium sur le compte
    await prisma.user.update({
      where: { id: user.id },
      data: { activeTemplateId: premium.id },
    });
  }

  console.log(`✓ Migration terminée — ${usersWithoutTemplate.length} users migrés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Étape 2 : Ajouter le script seed dans package.json**

Dans `package.json`, ajouter dans `"scripts"` :

```json
"db:seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
```

Et ajouter la config seed dans `package.json` :

```json
"prisma": {
  "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

- [ ] **Étape 3 : Lancer le seed**

```bash
npx prisma db seed
```

Résultat attendu :
```
✓ Template créé : Premium (id: xxxx)
→ N users à migrer
✓ Migration terminée — N users migrés
```

- [ ] **Étape 4 : Vérifier en DB**

```bash
npx prisma studio
```

Vérifier dans Prisma Studio :
- Table `Template` contient une ligne `premium`
- Table `UserTemplate` contient une ligne par user existant
- Table `User` : tous les users ont `activeTemplateId` renseigné

- [ ] **Étape 5 : Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed script for premium template and user migration"
```

---

## Task 7 : Server action — activer un template

**Fichiers :**
- Créer : `app/(admin)/actions/templates.ts`

- [ ] **Étape 1 : Créer la server action**

```typescript
// app/(admin)/actions/templates.ts
"use server";

import prisma from "@/app/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Retourne tous les templates disponibles avec leur statut pour le user connecté
export async function getTemplatesForUser() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" as const };

  const userId = session.user.id;

  const [allTemplates, user] = await Promise.all([
    prisma.template.findMany({ orderBy: { price: "asc" } }),
    prisma.user.findUnique({
      where: { id: userId },
      include: { purchasedTemplates: true },
    }),
  ]);

  if (!user) return { error: "Utilisateur introuvable" as const };

  // Enrichit chaque template avec isPurchased et isActive
  const templates = allTemplates.map((template) => ({
    ...template,
    isPurchased: user.purchasedTemplates.some((p) => p.templateId === template.id),
    isActive: user.activeTemplateId === template.id,
  }));

  return { success: true as const, templates };
}

// Active un template déjà acheté par le user
export async function activateTemplate(templateId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" as const };

  const userId = session.user.id;

  // Vérification de sécurité : le user doit avoir acheté ce template
  const purchase = await prisma.userTemplate.findUnique({
    where: {
      userId_templateId: { userId, templateId },
    },
  });

  if (!purchase) return { error: "Template non acheté" as const };

  await prisma.user.update({
    where: { id: userId },
    data: { activeTemplateId: templateId },
  });

  revalidatePath("/dashboard/templates");
  return { success: true as const };
}
```

- [ ] **Étape 2 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur

- [ ] **Étape 3 : Commit**

```bash
git add "app/(admin)/actions/templates.ts"
git commit -m "feat: add template server actions (getTemplatesForUser, activateTemplate)"
```

---

## Task 8 : Page dashboard /dashboard/templates

**Fichiers :**
- Créer : `app/(admin)/dashboard/templates/page.tsx`
- Créer : `app/(admin)/dashboard/templates/TemplatesClient.tsx`

- [ ] **Étape 1 : Créer la page serveur**

```typescript
// app/(admin)/dashboard/templates/page.tsx
import { getTemplatesForUser } from "@/app/(admin)/actions/templates";
import { redirect } from "next/navigation";
import TemplatesClient from "./TemplatesClient";

const TemplatesPage = async () => {
  const result = await getTemplatesForUser();

  if ("error" in result) redirect("/login");

  return <TemplatesClient templates={result.templates} />;
};

export default TemplatesPage;
```

- [ ] **Étape 2 : Créer le composant client**

```typescript
// app/(admin)/dashboard/templates/TemplatesClient.tsx
"use client";

import { useTransition, useState } from "react";
import { CheckCircle } from "lucide-react";
import { activateTemplate } from "@/app/(admin)/actions/templates";

type Template = {
  id: string;
  slug: string;
  name: string;
  price: number;
  previewUrl: string | null;
  isPurchased: boolean;
  isActive: boolean;
};

type Props = {
  templates: Template[];
};

const TemplatesClient = ({ templates }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const handleActivate = (templateId: string) => {
    setActivatingId(templateId);
    startTransition(async () => {
      await activateTemplate(templateId);
      setActivatingId(null);
    });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col shrink-0 gap-1 tablet:gap-2 mb-8 tablet:mb-12 px-4 tablet:px-6 laptop:px-0">
        <h1 className="font-bold text-cream tracking-wide text-xl tablet:text-2xl laptop:text-2xl desktop:text-3xl">
          Mes templates
        </h1>
        <p className="text-cream/50 text-sm">
          Choisissez le design de votre vitrine parmi vos templates achetés.
        </p>
      </div>

      {/* Grille de templates */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-6 px-4 tablet:px-6 laptop:px-0">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative flex flex-col rounded-xl overflow-hidden border transition-all ${
              template.isActive
                ? "border-blue shadow-[0_0_24px_0_rgba(59,130,246,0.2)]"
                : "border-cream/10"
            }`}
          >
            {/* Aperçu du template */}
            <div className="aspect-video bg-cream/5 flex items-center justify-center">
              {template.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={template.previewUrl}
                  alt={`Aperçu ${template.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-cream/20 text-sm">Aperçu bientôt disponible</span>
              )}
            </div>

            {/* Infos + action */}
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cream">{template.name}</span>
                {template.isActive && (
                  <span className="flex items-center gap-1 text-blue text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Actif
                  </span>
                )}
              </div>

              {template.isPurchased ? (
                // Template acheté : bouton pour l'activer
                <button
                  onClick={() => handleActivate(template.id)}
                  disabled={template.isActive || (isPending && activatingId === template.id)}
                  className="w-full py-2 text-xs uppercase tracking-widest font-semibold rounded-lg transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    bg-cream/10 text-cream hover:bg-cream/20"
                >
                  {isPending && activatingId === template.id
                    ? "Activation..."
                    : template.isActive
                    ? "Template actif"
                    : "Utiliser ce template"}
                </button>
              ) : (
                // Template non acheté : bouton d'achat (Stripe — à implémenter)
                <button
                  disabled
                  className="w-full py-2 text-xs uppercase tracking-widest font-semibold rounded-lg
                    bg-blue/20 text-blue cursor-not-allowed opacity-70"
                >
                  Acheter — {template.price.toFixed(0)} €
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesClient;
```

- [ ] **Étape 3 : Vérifier que TypeScript compile**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur

- [ ] **Étape 4 : Commit**

```bash
git add "app/(admin)/dashboard/templates/"
git commit -m "feat: add dashboard templates page with activate action"
```

---

## Task 9 : Vérification finale

- [ ] **Étape 1 : Build de production**

```bash
npm run build
```

Résultat attendu : build réussi sans erreur ni warning TypeScript

- [ ] **Étape 2 : Test en local**

```bash
npm run dev
```

Vérifier manuellement :
- La vitrine d'un user existant s'affiche correctement (template premium)
- Le dashboard `/dashboard/templates` affiche le template premium comme "Actif"
- Le bouton "Utiliser ce template" sur le template déjà actif est bien désactivé

- [ ] **Étape 3 : Commit final**

```bash
git add -A
git commit -m "feat: multi-template system complete — premium template, dispatcher routing, dashboard"
```

---

## Hors scope (étapes suivantes)

- Intégration Stripe pour l'achat des templates
- Design et implémentation des templates suivants (minimal, cinematic, argentique, editorial)
- Page de prévisualisation live d'un template avant achat
- Prix définitifs des templates
