# Design : Système de templates multi-niveaux avec thèmes

## Contexte

Le site SaaS photographe dispose déjà d'un template `premium` (4 pages complètes). L'objectif est d'ajouter 3 nouveaux templates plus simples, chacun ciblant un niveau de complexité différent. Chaque template pourra ensuite recevoir une surcouche visuelle (thème) selon l'univers photographique du client.

---

## Gamme de templates

| Slug | Pages | Sections |
|------|-------|----------|
| `one-page` | 1 | Hero + Galerie + Contact (scroll unique) |
| `two-pages` | 2 | `/` (Hero + Galerie) · `/contact` |
| `three-pages` | 3 | `/` (Hero + Galerie) · `/about` · `/contact` |
| `premium` | 4 | `/` · `/about` · `/gallery` · `/services` (existant) |

Les routes inexistantes pour un template (ex: `/about` sur `one-page`) redirigent vers `/` via `redirect("/")`.

---

## Architecture des fichiers

```
app/[domain]/templates/
  premium/                   ← existant
  three-pages/
    home/index.tsx
    about/index.tsx
    contact/index.tsx
    + sous-composants
  two-pages/
    home/index.tsx
    contact/index.tsx
    + sous-composants
  one-page/
    home/index.tsx            ← tout sur une seule page
    + sous-composants

app/[domain]/themes/
  index.ts                   ← registre + type Theme
  default.ts                 ← fallback silencieux (bug only, jamais proposé)
  argentic.ts
  sepia.ts
  evenement.ts
  nature.ts
  voyage.ts
  portrait.ts
  street.ts
  cinema.ts
```

---

## Système de thèmes

### Approche : CSS variables injectées au runtime

Chaque thème est un objet TypeScript exportant des CSS variables. Au rendu, ces variables sont injectées en `style` sur le `<main>` du template. Les composants n'utilisent que des classes Tailwind arbitraires (`text-[var(--color-primary)]`, etc.).

### Type Theme

```ts
type Theme = {
  "--color-bg": string;
  "--color-primary": string;
  "--color-secondary": string;
  "--color-text": string;
  "--color-muted": string;
  "--font-heading": string;
  "--font-body": string;
};
```

### Les 8 thèmes

| Slug | Ambiance | Palette |
|------|----------|---------|
| `argentic` | Film N&B, grain, contraste fort | Noir, blanc cassé, gris |
| `sepia` | Vintage chaud, pellicule ancienne | Brun, ocre, crème |
| `evenement` | Fête, mariage, élégance | Or/champagne, blanc, rose poudré |
| `nature` | Organique, terre, lumière douce | Vert mousse, beige, terracotta |
| `voyage` | Aventure, horizons lointains | Orange brûlé, bleu nuit, sable |
| `portrait` | Épuré, studio, lumière nette | Blanc, gris clair, noir doux |
| `street` | Urbain, brut, contrasté | Anthracite, rouge brique, béton |
| `cinema` | Dramatique, scope large | Noir profond, or, bordeaux |

### Résolution du thème dans un template

```tsx
const themeSlug = (config?.templateConfig as { themeSlug?: string })?.themeSlug;
const theme = themes[themeSlug ?? ""] ?? themes.default;

return (
  <main style={theme as React.CSSProperties}>
    {/* sections */}
  </main>
);
```

---

## Stockage en base de données

Le champ `templateConfig Json?` existant dans `SiteConfig` porte le thème actif :

```json
{ "themeSlug": "argentic" }
```

Aucune migration de schéma nécessaire. La table `Template` reçoit 3 nouvelles entrées (seed) :
- `{ slug: "one-page", name: "One Page", price: 0 }`
- `{ slug: "two-pages", name: "Two Pages", price: 0 }`
- `{ slug: "three-pages", name: "Three Pages", price: 0 }`

---

## Aiguilleurs (templateMap)

```ts
const templateMap = {
  premium:       () => import("./templates/premium/home/index"),
  "three-pages": () => import("./templates/three-pages/home/index"),
  "two-pages":   () => import("./templates/two-pages/home/index"),
  "one-page":    () => import("./templates/one-page/home/index"),
};
```

---

## Ordre d'implémentation recommandé

1. Créer `app/[domain]/themes/` avec les 8 thèmes + registre
2. Créer le template `one-page`
3. Créer le template `two-pages`
4. Créer le template `three-pages`
5. Mettre à jour les aiguilleurs (`templateMap` dans les 4 `page.tsx`)
6. Mettre à jour le seed Prisma (3 nouvelles entrées Template)
7. Tester les redirects pour les routes absentes

---

## Hors scope pour cette itération

- Sélection du thème depuis le dashboard
- Prévisualisation en temps réel des thèmes
- Stripe / achat de templates
