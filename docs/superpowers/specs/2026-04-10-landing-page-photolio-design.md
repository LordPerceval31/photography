# Design Spec — Landing Page Photolio

**Date :** 2026-04-10
**URL cible :** `photolio.fr` et `www.photolio.fr`
**Statut :** Validé par Sylvain

---

## Contexte

Landing page unique (single-page scroll) pour présenter le SaaS Photolio aux photographes.
Pas d'inscription en ligne — Sylvain crée les comptes manuellement après contact.
Objectif : convaincre → faire contacter → créer l'accès.

---

## Stack technique

- `app/page.tsx` — Server Component Next.js 15
- Route `/` accessible sur `photolio.fr` et `www.photolio.fr` (déjà géré par proxy.ts)
- Middleware à mettre à jour : rendre `/` public (pas de redirection vers /login)
- Formulaire contact : Server Action + Resend (déjà installé dans le projet)
- Animations : Framer Motion (déjà installé)
- Style : globals.css existant + glassmorphism `.glass-premium`
- Fond hero : `public/landing-hero-bg.jpg` (photo Unsplash sauvegardée, 1920px)

---

## Palette couleurs

| Variable | Valeur | Usage |
|---|---|---|
| `--color-dark` | `#2c2c2c` / bg `#080808` | Fond global |
| `--color-blue` | `#558b8b` | Accent, CTA, highlights |
| `--color-cream` | `#f5f5f0` | Texte principal, bouton light |
| Glassmorphism | `rgba(255,255,255,0.03)` + blur | Cards, header |

---

## Structure de la page

### 0. Header flottant (pill sticky)
- Position : `fixed`, top 20px, centré, `border-radius: 100px`
- Fond : `rgba(8,8,8,0.6)` + `backdrop-filter: blur(16px)` + border subtil
- Contenu : Logo "Photolio" (gauche) + bouton "Get Started →" (droite)
- **"Get Started" → `/login`** (utilisateurs déjà créés par Sylvain)
- Pas de liens de navigation — page unique, l'utilisateur scrolle naturellement

### 1. Hero — plein écran (100vh)
- Background : `public/landing-hero-bg.jpg` centré/cover
- Dégradé overlay : `transparent → transparent → rgba(8,8,8,0.7) → rgba(8,8,8,1)` (fondu bas)
- Contenu centré aligné en bas de la section
- Eyebrow : "La plateforme des photographes" (uppercase, lettre-spacing, opacity 50%)
- Titre : `"Votre œuvre. Votre outil."` — très grand (clamp 48px → 88px), `#558b8b` sur "Votre outil."
- Sous-titre : description 16px, opacity 55%, max-width 480px
- CTA unique : **"Get Started — 89 €"** → `/login`, bouton pill `#558b8b`
- Pas de bouton secondaire

### 2. Features — Bento Grid (3 colonnes)
- Titre section : `"Conçu pour ceux qui shootent."`
- Sous-titre : `"Pas pour ceux qui codent, pas pour ceux qui comptent."`
- 3 cards glassmorphism `border-radius: 20px` :

  **Card A (2 colonnes — large)** — Galeries privées client
  - Mini galerie 3 photos en haut (vraies photos)
  - Lien de partage stylisé : `photolio.fr/g/mariage-dupont-2026` (pill teal)
  - Titre + description : "Un lien unique, sécurisé. Vos clients téléchargent en ZIP."

  **Card B (1 colonne)** — Prix
  - Affichage centré : `149 €` barré + `€89` gros + "PAIEMENT UNIQUE · À VIE"
  - Titre : "Zéro abonnement"

  **Card C (1 colonne)** — Site vitrine
  - Browser mockup (barre macOS dots + URL) avec screenshot vitrine
  - Titre : "Site vitrine évolutif"
  - Description : "Sous-domaine ou domaine custom."

### 3. Galerie immersive — pleine largeur
- Titre : `"Un lien. Ils téléchargent."`
- Sous-titre : "Vos clients reçoivent un lien privé. Ils voient, ils choisissent, ils téléchargent en ZIP."
- Grid masonry 4 colonnes × 2 rangées, `gap: 6px`, sans padding latéral (edge-to-edge)
- Une photo `span 2 rows` pour dynamisme
- Vraies photos Unsplash (street, portrait, paysage, studio, montagne)
- Caption overlay en bas de chaque photo (catégorie)

### 4. Tarif — centré
- Titre : `"Un prix. Pour toujours."`
- Sous-titre : "Pas de piège. Pas d'abonnement. Payez une fois, utilisez à vie."
- Card unique centrée, max-width 440px
- Badge "Offre de lancement" (pill teal absolu, top de la card)
- Prix : `149 €` barré → `89 €` gros
- Mention : "paiement unique · accès à vie" (teal)
- Liste des inclus (5 items, `✓` teal)
- CTA : **"Contacter pour accéder ↓"** → smooth scroll vers `#contact`

### 5. Formulaire contact — centré, épuré
- `id="contact"` pour l'ancre
- Titre : `"Intéressé ?"`
- Sous-titre : "Envoyez un message. Je reviens sous 24h et crée votre accès."
- Champs : Prénom/Nom (côte à côte) · Email · Sujet · Message (textarea)
- Inputs glassmorphism : `rgba(255,255,255,0.03)` + border subtil + `border-radius: 12px`
- CTA : **"Envoyer →"** — bouton cream (`#f0f0ee`) texte dark
- Implémentation : Server Action + Resend + rate-limit (déjà dans `app/lib/ratelimit.ts`)
- Validation : Zod côté serveur
- Feedback : état success/erreur inline

### 6. Footer — minimaliste
- `border-top: 1px solid rgba(255,255,255,0.06)`
- Logo "Photolio" (gauche) + "© 2026 · CGU · Confidentialité" (droite, opacity 25%)

---

## Modifications middleware (`proxy.ts`)

La route `/` doit être publique. Actuellement, si un utilisateur non connecté visite `photolio.fr`, le middleware le redirige vers `/login`.

```ts
// Ajouter dans isPublicRoute :
const isPublicRoute = pathname === "/" || pathname.startsWith("/gallery/");
```

---

## Routing — comment `/` arrive sur la landing page

Le `proxy.ts` détecte déjà `cleanHostname === BASE_DOMAIN` et fait `NextResponse.next()`.
Donc `photolio.fr` → `app/page.tsx` sans réécriture.
`www.photolio.fr` → `domain = "www"` → `NextResponse.next()` → aussi `app/page.tsx`. ✓

Il faut créer `app/page.tsx` (inexistant actuellement).

---

## Fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `app/page.tsx` | Créer — landing page complète |
| `app/_components/LandingContactForm.tsx` | Créer — formulaire Client Component |
| `app/actions/contact.ts` | Créer — Server Action Resend |
| `proxy.ts` | Modifier — rendre `/` public |

---

## Assets

| Fichier | Description |
|---|---|
| `public/landing-hero-bg.jpg` | Photo hero (Unsplash, 1920px, 330 Ko) — ✅ déjà sauvegardée |

---

## Animations Framer Motion

- Header : fade-in + slide-down au chargement
- Hero title : fade-in + slide-up (stagger entre eyebrow, titre, sous-titre, CTA)
- Bento cards : fade-in au scroll (`whileInView`)
- Galerie : fade-in avec léger zoom (`scale: 0.98 → 1`)
- Pricing card : fade-in au scroll
