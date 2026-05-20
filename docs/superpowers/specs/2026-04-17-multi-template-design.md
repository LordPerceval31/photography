# Design : Système multi-templates

**Date :** 2026-04-17  
**Statut :** Approuvé  
**Projet :** photolio.fr — SaaS vitrine photographe

---

## Contexte

Le projet est un SaaS multi-tenant où chaque photographe dispose d'un sous-domaine ou domaine personnalisé (ex: `bastiendupond.photolio.fr`). Aujourd'hui, tous les photographes partagent le même template de vitrine. L'objectif est de proposer 4 à 5 templates distincts (look et structure différents), vendus à des prix différents. Un photographe peut en acheter plusieurs et choisir lequel est actif sur son site.

---

## Objectifs

- Proposer 5 templates au total (1 existant restructuré + 4 nouveaux)
- Chaque template a son propre prix (rien n'est gratuit)
- Un photographe peut acheter plusieurs templates et switcher entre eux depuis son dashboard
- Le site du photographe affiche toujours le template actif
- Architecture extensible : ajouter un nouveau template ne touche pas au code existant

---

## Schéma Prisma

### Nouveau modèle `Template`

```prisma
model Template {
  id         String  @id @default(cuid())
  slug       String  @unique   // "classic", "cinematic", "minimal"...
  name       String            // "Classic", "Cinématique", "Minimal"...
  price      Float             // prix en euros, aucun template gratuit
  previewUrl String?           // capture d'écran pour le dashboard

  purchases UserTemplate[]
  users     User[]
}
```

### Nouveau modèle `UserTemplate` (table de jonction)

```prisma
model UserTemplate {
  userId      String
  templateId  String
  purchasedAt DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  template Template @relation(fields: [templateId], references: [id])

  @@id([userId, templateId])
}
```

### Modifications sur `User`

```prisma
model User {
  // ... champs existants inchangés ...
  activeTemplateId   String?
  activeTemplate     Template?      @relation(fields: [activeTemplateId], references: [id])
  purchasedTemplates UserTemplate[]
}
```

### Modifications sur `SiteConfig`

```prisma
model SiteConfig {
  // ... champs existants inchangés ...
  templateConfig Json?  // champs spécifiques au template actif (stockage flexible)
}
```

---

## Architecture des fichiers

```
app/[domain]/
  page.tsx              ← aiguilleur home
  layout.tsx            ← inchangé (navbar, fonts)
  about/page.tsx        ← aiguilleur about
  gallery/page.tsx      ← aiguilleur gallery
  services/page.tsx     ← aiguilleur services

  templates/
    classic/            ← template actuel restructuré
      home/page.tsx
      about/page.tsx
      gallery/page.tsx
      services/page.tsx
    cinematic/
      home/page.tsx
      about/page.tsx
      gallery/page.tsx
      services/page.tsx
    minimal/
      ...
    argentique/
      ...
    editorial/
      ...

  lib/
    getUserData.ts      ← fetch user + siteConfig (partagé)
    getPhotos.ts        ← fetch photos, galleries (partagé)
    types.ts            ← types TypeScript partagés

lib/
  templateMap.ts        ← registre des templates disponibles
```

---

## Contrat TypeScript des templates

Chaque page de template implémente la même interface pour garantir la cohérence :

```ts
// app/[domain]/lib/types.ts
export interface TemplatePageProps {
  userId: string
}
```

Chaque `templates/[slug]/home/page.tsx` exporte un composant `default` respectant ce contrat. Ajouter un template = créer le dossier + implémenter le contrat. Rien d'autre à modifier.

---

## Logique de l'aiguilleur

```ts
// app/[domain]/page.tsx
const user = await prisma.user.findFirst({
  where: { subdomain: domain },
  include: { activeTemplate: true, siteConfig: true },
})

const slug = user.activeTemplate?.slug ?? "classic"

const templateMap: Record<string, () => Promise<{ default: React.ComponentType<TemplatePageProps> }>> = {
  classic:    () => import("./templates/classic/home/page"),
  cinematic:  () => import("./templates/cinematic/home/page"),
  minimal:    () => import("./templates/minimal/home/page"),
  argentique: () => import("./templates/argentique/home/page"),
  editorial:  () => import("./templates/editorial/home/page"),
}

const { default: TemplatePage } = await (templateMap[slug] ?? templateMap["classic"])()
return <TemplatePage userId={user.id} />
```

Même pattern reproduit dans `about/page.tsx`, `gallery/page.tsx`, `services/page.tsx`.

---

## Dashboard — Page `/dashboard/templates`

- Affiche tous les templates disponibles en cards (aperçu visuel + nom + prix)
- Templates déjà achetés : bouton "Utiliser" (Server Action → met à jour `activeTemplateId`)
- Template actif : badge "Actif", pas de bouton
- Templates non achetés : bouton "Acheter — X€" → flow Stripe
- Après achat Stripe confirmé : ligne créée dans `UserTemplate` + `activeTemplateId` mis à jour

---

## Flux d'achat

1. Photographe clique "Acheter — 49€" sur le template Cinematic
2. Redirection vers Stripe Checkout
3. Stripe confirme le paiement → webhook → Server Action
4. Ligne créée dans `UserTemplate` (userId, templateId)
5. `activeTemplateId` mis à jour sur `User`
6. Le site du photographe bascule sur le nouveau template

---

## Principes respectés

- **DRY** : fetches de données partagés dans `app/[domain]/lib/`, aucune duplication
- **SOLID (Open/Closed)** : ajouter un template n'implique pas de modifier le code existant
- **YAGNI** : pas de logique de remboursement, pas de gestion de licences complexe
- **TypeScript strict** : contrat `TemplatePageProps` appliqué à tous les templates

---

## Hors scope (à traiter séparément)

- Design et contenu des 4 nouveaux templates
- Intégration Stripe (paiement)
- Migration des utilisateurs existants vers le template `classic`
- Page de prévisualisation des templates (live preview)
