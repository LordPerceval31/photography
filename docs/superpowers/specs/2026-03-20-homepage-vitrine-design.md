# Design Spec — Homepage Vitrine Photographe

**Date :** 2026-03-20
**Projet :** Site vitrine photographe amateur
**Scope :** Homepage publique uniquement (page `/`)

---

## Objectif

Créer une homepage vitrine moderne, épurée et immersive pour un photographe amateur (street, paysages, studio, portrait, salons auto, soirées). Pas de vente, pas de réservation. L'objectif est de transmettre une émotion visuelle forte via un mix de photos N&B et couleurs chaudes.

---

## Stack

- Next.js 15 App Router — Server Components par défaut
- TypeScript strict
- Tailwind CSS v4
- Images servies depuis Cloudinary

---

## Structure de la page

La homepage est une **single page à défilement vertical** composée de 4 sections enchaînées.

---

### Section 1 — Hero plein écran

**Layout :** Image plein écran (100vh), contenu centré dans une carte glassmorphism.

**Éléments :**
- Navigation fixe en haut avec glassmorphism (logo à gauche, liens à droite)
- Image de fond full-screen (photo choisie par le photographe via back-office)
- Carte glassmorphism centrée : `background: rgba(255,255,255,0.07)`, `backdrop-filter: blur(20px)`, bordure subtile
- Contenu carte : eyebrow texte, titre H1 en font-weight 300/700, sous-titre, bouton CTA vers `/galeries`
- Indicateur de défilement animé en bas

**Comportement :** Statique. Pas d'animation d'entrée complexe.

---

### Section 2 — Image immersive + texte

**Layout :** Grid 2 colonnes — image à gauche sur **2/3 de la largeur**, texte à droite sur 1/3. L'image se fond vers la droite via un gradient en overlay.

**Éléments :**
- Colonne gauche (2/3) : `<Image>` Next.js avec `object-fit: cover`, overlay gradient de droite `transparent → #f5f5f0` pour le fondu
- Colonne droite (1/3) : fond `#f5f5f0`, tag catégorie, titre H2, paragraphe descriptif, bouton outline vers `/galeries`
- Fond de section : crème/blanc cassé (`#f5f5f0`)

**Comportement :** Statique.

---

### Section 3 — Sombre : citations + images

**Layout :** Grid 2 colonnes sur fond quasi-noir. Texte/citations à gauche, 3 images décalées à droite.

**Éléments gauche :**
- 2 citations philosophiques sur la photographie (texte configurable)
- Grand guillemet décoratif, citation en italique, auteur en lettres capitales espacées
- Séparateur entre les deux citations

**Éléments droite :**
- 2 images qui se **chevauchent** via `position: absolute/relative` et marges négatives
- Image 1 : plus grande, décalée vers le haut
- Image 2 : plus petite, décalée vers le bas et légèrement sur l'image 1 (`z-index`, `-translate-x-8`)
- Toutes les images viennent de Cloudinary

**Fond :** `#0d0d0d`

---

### Section 4 — Carousel automatique

**Layout :** Fond crème, titre section + lien "Voir toutes les galeries", puis piste de photos à défilement horizontal automatique.

**Éléments :**
- Header : titre H2 léger + lien vers `/galeries` aligné à droite
- Piste de photos : `display: flex`, `overflow: hidden`, images avec **largeurs variables** (pas de grille uniforme)
- Défilement automatique via animation CSS (`@keyframes scroll`) — pas de JS requis
- Les largeurs d'images varient selon le ratio de chaque photo (portrait vs paysage)
- Fond : `#f8f7f4`

**Comportement :** Animation infinie CSS (`@keyframes`), pause au hover via CSS (`:hover { animation-play-state: paused }`). Pas de JavaScript nécessaire → **Server Component**.

---

## Données

Les images proviennent de la base de données Prisma + Cloudinary :
- Section Hero : 1 photo marquée `isCover: true` (voir schema ci-dessous)
- Section 2 : 1 photo récente (première du résultat Prisma)
- Section 3 : 2 photos récentes toutes catégories confondues
- Section 4 : 10–15 photos récentes toutes catégories

**Stratégie de rendu : ISR (Incremental Static Regeneration)**

```ts
export const revalidate = 3600 // revalide toutes les heures
```

Pourquoi ISR plutôt que `force-dynamic` :
- La page est générée **statiquement** au build (0 requête DB à chaque visite)
- Next.js la regénère en arrière-plan toutes les heures si les données changent
- Les images Cloudinary sont déjà servies depuis leur CDN — pas besoin de les stocker en local

> Pour la v1, les photos peuvent être hardcodées en attendant le back-office.

### Champ `isCover` à ajouter au schema Prisma

```prisma
model Photo {
  // ... champs existants
  isCover Boolean @default(false)
}
```

Suivi d'une migration : `npx prisma migrate dev --name add-is-cover`

---

## Composants Next.js

```
app/
  page.tsx                  ← Server Component, charge les données
  _components/
    HeroSection.tsx          ← Server Component (scroll hint animé en CSS pur)
    AboutSection.tsx         ← Server Component
    DarkSection.tsx          ← Server Component
    CarouselSection.tsx      ← Server Component (animation CSS pure, pas de JS)
    Navbar.tsx               ← Client Component (sticky + glassmorphism, "use client")
```

---

## Typographie

- Font principale : system-ui ou Inter (à charger via `next/font`)
- Titres : font-weight 300 (light) avec accents en 700 (bold)
- Eyebrows / tags : uppercase, letter-spacing large, font-size small
- Corps : font-weight 400, line-height 1.7–1.8

---

## Palette de couleurs

| Rôle | Valeur |
|------|--------|
| Fond clair | `#f5f5f0` / `#f8f7f4` |
| Fond sombre | `#0d0d0d` / `#1a1a2e` |
| Texte principal clair | `#1a1410` |
| Texte secondaire clair | `#6b5c50` |
| Accent chaud | `#8b7355` / `#a0856a` |
| Glassmorphism | `rgba(255,255,255,0.07)` + blur 20px |

---

## Ce qui est hors scope (v1)

- Page `/galeries` et pages catégorie
- Back-office
- Galeries privées
- Animations d'entrée au scroll (IntersectionObserver)
- Responsive mobile (à traiter dans une prochaine itération)

---

## Critères de succès

- La page se charge en Server Component (pas de "use client" inutile)
- Les images Cloudinary sont servies avec `next/image` et les bons formats (WebP)
- Le carousel défile sans JavaScript (CSS only)
- Le glassmorphism fonctionne sur Chrome et Safari (utiliser `backdrop-filter` + `-webkit-backdrop-filter` ou confirmer que Tailwind v4 génère les deux)
- TypeScript strict : zéro `any`
- Sur mobile, la nav s'affiche (pas de responsive complet en v1, mais rien ne doit être cassé)
