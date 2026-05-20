# Dashboard Capabilities par Template — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans pour implémenter ce plan task par task. Les étapes utilisent la syntaxe checkbox (`- [ ]`) pour le suivi.

**Goal:** Adapter le dashboard back-office selon le template actif du photographe — masquer les champs inutiles pour `one-page` et afficher un overlay upsell "Premium" pour les fonctionnalités non disponibles.

**Architecture:** Un fichier central `capabilities.ts` définit ce que chaque template peut faire via un objet `Capabilities`. Les pages server lisent `user.activeTemplate.slug` via Prisma, calculent les capabilities, et les passent en props aux Client Components. Les fonctionnalités structurellement absentes (champs vitrine inutiles, photos about) sont simplement non-rendues. Les fonctionnalités payantes bloquées (services, partage galeries) affichent un overlay upsell pointant vers `/dashboard/templates`.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Prisma, Tailwind CSS v4. Zéro nouvelle dépendance.

---

## Fichiers créés / modifiés

### Créés
- `app/lib/capabilities.ts` — type `Capabilities` + fonction `getCapabilities(slug)`

### Modifiés
- `app/_components/DashboardOverview.tsx` — cache la carte SERVICES si `!capabilities.services`
- `app/(admin)/dashboard/vitrine/page.tsx` — fetch template actif + passe `capabilities` à VitrineClient
- `app/(admin)/dashboard/vitrine/VitrineClient.tsx` — reçoit `capabilities`, cache champs inutiles
- `app/(admin)/dashboard/photo/page.tsx` — cache Portrait + About x3 si `!capabilities.aboutPhotos`
- `app/(admin)/dashboard/gallery/page.tsx` — fetch template actif + passe `canShare` à GalleryClient
- `app/(admin)/dashboard/gallery/GalleryClient.tsx` — overlay upsell sur les options de partage
- `app/(admin)/dashboard/services/page.tsx` — écran upsell complet si `!capabilities.services`

---

## Task 1 : Créer `app/lib/capabilities.ts`

**Fichiers :**
- Créer : `app/lib/capabilities.ts`

- [ ] **Étape 1 : Définir le type `Capabilities` et la fonction `getCapabilities`**

Créer le fichier avec :

```typescript
export type Capabilities = {
  services: boolean;
  shareGalleries: boolean;
  aboutPhotos: boolean;
  vitrineFields: {
    heroSubtitle: boolean;
    bioTitle: boolean;
    story: boolean;       // storyParagraph1 + storyParagraph2
    darkQuote: boolean;   // darkQuote + darkQuoteAuthor
  };
};
```

Deux constantes internes `ONE_PAGE` (tout à `false`) et `FULL` (tout à `true`).

Fonction `getCapabilities(slug: string | undefined | null): Capabilities` :
- `"one-page"` → retourne `ONE_PAGE`
- tout autre slug (dont `"premium"`) → retourne `FULL`

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```
Résultat attendu : 0 erreurs.

- [ ] **Étape 3 : Commit**

```bash
git add app/lib/capabilities.ts
git commit -m "feat: add template capabilities registry"
```

---

## Task 2 : Adapter `DashboardOverview.tsx`

**Fichiers :**
- Modifier : `app/_components/DashboardOverview.tsx`

**Contexte :** Le composant reçoit `userId: string`, fait deux queries Prisma (photos récentes + galeries récentes), rend 4 cartes : PHOTOS, GALLERY, TEXTES, SERVICES.

- [ ] **Étape 1 : Ajouter le fetch `activeTemplate` dans `Promise.all`**

Ajouter à la query existante un troisième fetch :
```typescript
prisma.user.findUnique({
  where: { id: userId },
  select: { activeTemplate: { select: { slug: true } } },
})
```
Déstructurer le résultat, appeler `getCapabilities(user?.activeTemplate?.slug)`.

- [ ] **Étape 2 : Conditionner la carte SERVICES**

Entourer le `<Link href="/dashboard/services" ...>` d'un `{capabilities.services && (...)}`.
Ne toucher à rien d'autre dans le JSX.

- [ ] **Étape 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```
Résultat attendu : 0 erreurs.

- [ ] **Étape 4 : Vérifier manuellement**

- Compte `one-page` → 3 cartes visibles, SERVICES absente.
- Compte `premium` → 4 cartes, SERVICES présente. Rien d'autre ne change.

- [ ] **Étape 5 : Commit**

```bash
git add app/_components/DashboardOverview.tsx
git commit -m "feat: hide SERVICES card for non-premium templates"
```

---

## Task 3 : Adapter la page Textes (Vitrine)

**Fichiers :**
- Modifier : `app/(admin)/dashboard/vitrine/page.tsx`
- Modifier : `app/(admin)/dashboard/vitrine/VitrineClient.tsx`

**Contexte :** `vitrine/page.tsx` est un Server Component qui fetch `siteConfig` et passe `initialData` à `VitrineClient`. `VitrineClient` est un Client Component avec un formulaire en 2 colonnes : gauche (Hero + Bio) / droite (Story + Citation + SEO).

### 3A — `vitrine/page.tsx`

- [ ] **Étape 1 : Fetch `activeTemplate` en parallèle du `siteConfig`**

Remplacer la query unique par un `Promise.all` qui fetch aussi :
```typescript
prisma.user.findUnique({
  where: { id: session.user.id },
  select: { activeTemplate: { select: { slug: true } } },
})
```
Appeler `getCapabilities`, passer `capabilities` en prop à `<VitrineClient>`.

### 3B — `VitrineClient.tsx`

- [ ] **Étape 2 : Ajouter `capabilities: Capabilities` dans le type `Props`**

Importer `Capabilities` depuis `@/app/lib/capabilities`.
Ajouter le prop `capabilities` à la déstructuration du composant.

- [ ] **Étape 3 : Conditionner les champs de la Section Hero**

`heroSubtitle` : entourer le `<FloatingInput name="heroSubtitle" ...>` d'un `{capabilities.vitrineFields.heroSubtitle && (...)}`.
`heroName` et `heroTagline` : toujours affichés, pas de condition.

- [ ] **Étape 4 : Conditionner le champ `bioTitle` dans la Section Bio**

Entourer uniquement le `<FloatingInput name="bioTitle" ...>` d'un `{capabilities.vitrineFields.bioTitle && (...)}`.
`bioParagraph1` et `bioParagraph2` : toujours affichés.
Adapter le texte descriptif de la section selon `capabilities.vitrineFields.bioTitle`.

- [ ] **Étape 5 : Conditionner la Section Story entière**

Entourer tout le bloc Story (`storyParagraph1` + `storyParagraph2` + son titre descriptif) d'un `{capabilities.vitrineFields.story && (...)}`.

- [ ] **Étape 6 : Conditionner la Section Citation entière**

Entourer tout le bloc Citation (`darkQuote` + `darkQuoteAuthor` + son titre descriptif) d'un `{capabilities.vitrineFields.darkQuote && (...)}`.
La Section SEO reste toujours affichée, sans condition.

- [ ] **Étape 7 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```
Résultat attendu : 0 erreurs.

- [ ] **Étape 8 : Vérifier manuellement**

- Compte `one-page` → affiche : heroName, heroTagline, bioParagraph1/2, SEO. Masque : heroSubtitle, bioTitle, Story, Citation.
- Compte `premium` → tous les champs visibles, comportement identique à avant.

- [ ] **Étape 9 : Commit**

```bash
git add "app/(admin)/dashboard/vitrine/page.tsx" "app/(admin)/dashboard/vitrine/VitrineClient.tsx"
git commit -m "feat: hide unused vitrine fields for one-page template"
```

---

## Task 4 : Adapter `dashboard/photo/page.tsx`

**Fichiers :**
- Modifier : `app/(admin)/dashboard/photo/page.tsx`

**Contexte :** Page Server Component. Fetch cloudinary credentials + galleries + photos. Rend 4 sections : Cover (16:9), Portrait (3:4), About x3 (3:4), Galerie upload.

- [ ] **Étape 1 : Fetch `activeTemplate` dans la query user existante**

La query `userCredentials` ne sélectionne que les champs Cloudinary. Ajouter `activeTemplate: { select: { slug: true } }` au `select` existant.

- [ ] **Étape 2 : Calculer les capabilities et conditionner les sections**

Après la vérification Cloudinary, appeler `getCapabilities(user?.activeTemplate?.slug)`.

Entourer la section **Portrait** (lignes 114–129 actuellement) d'un `{capabilities.aboutPhotos && (...)}`.

Entourer la section **About x3** (lignes 132–158 actuellement) d'un `{capabilities.aboutPhotos && (...)}`.

Les variables `portraitUrl`, `about1Url`, `about2Url`, `about3Url` restent calculées inconditionnellement — seul le rendu JSX est conditionné.

- [ ] **Étape 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```
Résultat attendu : 0 erreurs.

- [ ] **Étape 4 : Vérifier manuellement**

- Compte `one-page` → Cover + Galerie upload uniquement. Portrait et About absents.
- Compte `premium` → 4 sections visibles, comportement identique à avant.

- [ ] **Étape 5 : Commit**

```bash
git add "app/(admin)/dashboard/photo/page.tsx"
git commit -m "feat: hide portrait and about photo slots for one-page template"
```

---

## Task 5 : Adapter `dashboard/gallery/` — overlay upsell partage

**Fichiers :**
- Modifier : `app/(admin)/dashboard/gallery/page.tsx`
- Modifier : `app/(admin)/dashboard/gallery/GalleryClient.tsx`

**Contexte :** `gallery/page.tsx` vérifie Cloudinary puis rend `<GalleryClient />` sans props. `GalleryClient` contient les toggles `isPremium` (Mise en avant) et `isPrivate` (Galerie privée), et la section privée conditionnelle (`isPrivate && ...`) avec emails + expiration.

### 5A — `gallery/page.tsx`

- [ ] **Étape 1 : Fetch `activeTemplate` dans la query user existante**

Ajouter `activeTemplate: { select: { slug: true } }` au `select` de la query Prisma.
Calculer `getCapabilities`, passer `canShare={capabilities.shareGalleries}` à `<GalleryClient>`.

### 5B — `GalleryClient.tsx`

- [ ] **Étape 2 : Ajouter le prop `canShare: boolean`**

Modifier la signature : `const GalleryClient = ({ canShare }: { canShare: boolean })`.

- [ ] **Étape 3 : Entourer les toggles d'un wrapper `relative` avec overlay**

Le bloc des deux boutons toggle (Mise en avant + Galerie privée, lignes 228–266) et la section privée conditionnelle (lignes 296–373) doivent être enveloppés dans un seul `<div className="relative w-full">`.

À l'intérieur de ce wrapper, ajouter l'overlay upsell après le contenu :

```tsx
{!canShare && (
  <div className="absolute inset-0 backdrop-blur-sm bg-black/70 rounded-xl flex flex-col items-center justify-center gap-4 z-10 p-6">
    <Lock className="w-6 h-6 text-cream/50" />
    <p className="text-cream/80 text-sm text-center font-medium">
      Disponible avec le template Premium
    </p>
    <Link
      href="/dashboard/templates"
      className="px-5 py-2 border border-cream/30 text-cream/70 text-[10px] uppercase tracking-widest hover:text-cream hover:border-cream/50 transition-all rounded-lg"
    >
      Voir mes templates →
    </Link>
  </div>
)}
```

Ajouter `pointer-events-none select-none` sur le div contenant les toggles quand `!canShare`.

`Lock` est déjà importé dans le fichier. Vérifier que `Link` de `next/link` est aussi importé (il l'est déjà ligne 4).

- [ ] **Étape 4 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```
Résultat attendu : 0 erreurs.

- [ ] **Étape 5 : Vérifier manuellement**

- Compte `one-page` → formulaire ouvert, titre/description/photos fonctionnent. Toggles et section privée bloqués par l'overlay. Bouton "Voir mes templates" redirige bien.
- Compte `premium` → comportement identique à avant, pas d'overlay.

- [ ] **Étape 6 : Commit**

```bash
git add "app/(admin)/dashboard/gallery/page.tsx" "app/(admin)/dashboard/gallery/GalleryClient.tsx"
git commit -m "feat: add upsell overlay on gallery sharing options for one-page template"
```

---

## Task 6 : Adapter `dashboard/services/page.tsx`

**Fichiers :**
- Modifier : `app/(admin)/dashboard/services/page.tsx`

**Contexte :** Page Server Component. Vérifie Cloudinary, fetch les services, rend le header fixe + `<ServicesClient>`. `ServicesClient` n'est pas modifié.

- [ ] **Étape 1 : Fetch `activeTemplate` dans la query user existante**

Ajouter `activeTemplate: { select: { slug: true } }` au `select` de la query Prisma.

- [ ] **Étape 2 : Insérer l'écran upsell après la vérification Cloudinary**

Après le bloc `if (!cloudinaryReady)`, avant le fetch des services :

```typescript
const capabilities = getCapabilities(user?.activeTemplate?.slug);

if (!capabilities.services) {
  return (
    // Header identique (ArrowLeft + titre "Mes services")
    // + div centré avec icône Lock, texte, bouton Link vers /dashboard/templates
  );
}
```

Le header (retour dashboard + titre "Mes services") est identique à la version normale — le copier tel quel dans le return upsell.
L'écran upsell : icône `Lock` (importer depuis `lucide-react`), texte "La gestion des services est disponible avec le template Premium.", bouton `<Link href="/dashboard/templates">Voir mes templates →</Link>`.

- [ ] **Étape 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```
Résultat attendu : 0 erreurs.

- [ ] **Étape 4 : Vérifier manuellement**

- Compte `one-page` → page `/dashboard/services` affiche le header + écran upsell. Aucun crash.
- Compte `premium` → `ServicesClient` chargé normalement, zéro changement.

- [ ] **Étape 5 : Commit**

```bash
git add "app/(admin)/dashboard/services/page.tsx"
git commit -m "feat: add upsell screen on services page for non-premium templates"
```

---

## Task 7 : Vérification end-to-end

- [ ] **Étape 1 : Build de production**

```bash
npm run build
```
Résultat attendu : build sans erreur, aucun type error.

- [ ] **Étape 2 : Checklist compte `one-page`**

| Page | Attendu |
|---|---|
| `/dashboard` | 3 cartes (PHOTOS, GALLERY, TEXTES) — SERVICES absente |
| `/dashboard/photo` | Cover + Galerie upload uniquement |
| `/dashboard/vitrine` | heroName, heroTagline, bioParagraph1/2, SEO uniquement |
| `/dashboard/gallery` | Overlay upsell sur toggles et section privée |
| `/dashboard/services` | Écran upsell avec bouton "Voir mes templates" |

- [ ] **Étape 3 : Checklist compte `premium`**

| Page | Attendu |
|---|---|
| `/dashboard` | 4 cartes dont SERVICES |
| `/dashboard/photo` | 4 sections visibles |
| `/dashboard/vitrine` | Tous les champs visibles |
| `/dashboard/gallery` | Toutes les options accessibles, pas d'overlay |
| `/dashboard/services` | ServicesClient normal |

- [ ] **Étape 4 : Commit final**

```bash
git add -A
git commit -m "chore: end-to-end verification complete — dashboard capabilities ready"
```
