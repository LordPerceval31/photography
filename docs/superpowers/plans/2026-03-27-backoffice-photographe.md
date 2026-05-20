# Back-office Photographe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un back-office Next.js séparé permettant au photographe de gérer ses photos, galeries et textes du site vitrine.

**Architecture:** Nouveau projet Next.js 15 (repo séparé), connecté à la même base PostgreSQL que le site vitrine. Auth via NextAuth v5 (email/password + Google), inscription sur invitation par code. Navigation latérale fixe avec 4 sections : Dashboard, Photos, Galeries, Paramètres.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, Prisma 6, PostgreSQL, NextAuth v5 beta, Cloudinary, Zod, bcryptjs

---

## Structure des fichiers

```
admin/
├── app/
│   ├── (auth)/                          # Routes publiques (pas de sidebar)
│   │   ├── login/page.tsx               # Formulaire login email/password + Google
│   │   └── register/page.tsx            # Formulaire inscription + validation code invitation
│   ├── (dashboard)/                     # Routes protégées (avec sidebar)
│   │   ├── layout.tsx                   # Layout avec sidebar fixe
│   │   ├── dashboard/page.tsx           # Vue d'ensemble : compteurs + récents
│   │   ├── photos/
│   │   │   ├── page.tsx                 # Grille de toutes les photos + filtres
│   │   │   ├── upload/page.tsx          # Drag & drop + métadonnées + envoi Cloudinary
│   │   │   └── [id]/page.tsx            # Édition d'une photo
│   │   ├── galleries/
│   │   │   ├── page.tsx                 # Liste des galeries
│   │   │   ├── new/page.tsx             # Création d'une galerie
│   │   │   └── [id]/page.tsx            # Gestion des photos d'une galerie + lien partage
│   │   └── settings/page.tsx            # Profil + mot de passe + textes site vitrine
│   ├── share/[token]/page.tsx           # Route publique : galerie partagée (sans auth)
│   ├── api/auth/[...nextauth]/route.ts  # Handler NextAuth
│   └── layout.tsx                       # Root layout (fonts, providers)
├── components/
│   ├── sidebar.tsx                      # Navigation latérale fixe
│   ├── photo-grid.tsx                   # Grille photos réutilisable
│   ├── photo-card.tsx                   # Carte photo avec actions (edit/delete)
│   └── confirm-dialog.tsx               # Modale de confirmation (suppression)
├── lib/
│   ├── auth.ts                          # Config NextAuth (providers, callbacks)
│   ├── prisma.ts                        # Singleton Prisma client
│   └── cloudinary.ts                    # Config + helper upload Cloudinary
├── actions/
│   ├── auth.ts                          # Server Actions : login, register, logout
│   ├── photos.ts                        # Server Actions : upload, update, delete photo
│   ├── galleries.ts                     # Server Actions : create, update, delete galerie
│   └── settings.ts                      # Server Actions : update profil, mot de passe, textes
├── middleware.ts                         # Protection routes (NextAuth)
├── auth.ts                              # Export auth() pour middleware
├── .env.local                           # Variables d'environnement (jamais committé)
├── next.config.ts                       # Config Next.js (remotePatterns Cloudinary)
└── prisma/schema.prisma                 # Schéma partagé (copie du site vitrine + ajouts)
```

---

## Ajouts au schéma Prisma

Ces modèles s'ajoutent au schéma existant du site vitrine.

```prisma
model InviteCode {
  id        String    @id @default(cuid())
  code      String    @unique
  email     String?
  used      Boolean   @default(false)
  usedAt    DateTime?
  expiresAt DateTime
  createdAt DateTime  @default(now())
}

model SiteConfig {
  id        String @id @default(cuid())
  aboutText String @default("")
  quote     String @default("")
}

// Ajout sur le modèle Gallery existant :
// shareToken String? @unique @default(cuid())
```

---

## Phase 1 — Initialisation du projet

### Task 1 : Créer le projet Next.js

**Files:**
- Create: `admin/package.json` (généré par create-next-app)
- Create: `admin/.env.local`
- Create: `admin/next.config.ts`

- [ ] **Step 1 : Initialiser le projet**

```bash
npx create-next-app@latest admin \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --import-alias="@/*"
cd admin
```

- [ ] **Step 2 : Installer les dépendances**

```bash
npm install prisma @prisma/client next-auth@beta \
  @auth/prisma-adapter bcryptjs zod \
  cloudinary @cloudinary/react
npm install -D @types/bcryptjs
```

- [ ] **Step 3 : Créer le fichier .env.local**

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="une-chaine-aleatoire-de-32-caracteres"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

> `AUTH_SECRET` : génère avec `openssl rand -base64 32`

- [ ] **Step 4 : Configurer next.config.ts**

```ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 5 : Commit**

```bash
git add .
git commit -m "feat: init projet back-office Next.js 15"
```

---

### Task 2 : Configurer Prisma

**Files:**
- Create: `admin/prisma/schema.prisma`
- Create: `admin/lib/prisma.ts`

- [ ] **Step 1 : Initialiser Prisma**

```bash
npx prisma init
```

- [ ] **Step 2 : Écrire le schéma complet**

Remplacer `prisma/schema.prisma` :

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Category {
  id     String  @id @default(cuid())
  name   String  @unique
  slug   String  @unique
  photos Photo[]
}

model Photo {
  id             String        @id @default(cuid())
  title          String?
  url            String
  publicId       String        @unique
  isCover        Boolean       @default(false)
  isPortrait     Boolean       @default(false)
  isAboutPicture Boolean       @default(false)
  categoryId     String?
  category       Category?     @relation(fields: [categoryId], references: [id])
  galleryPhotos  GalleryPhoto[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model Gallery {
  id          String         @id @default(cuid())
  name        String
  description String         @default("")
  isPremium   Boolean        @default(false)
  isPrivate   Boolean        @default(false)
  shareToken  String?        @unique @default(cuid())
  photos      GalleryPhoto[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model GalleryPhoto {
  id             String  @id @default(cuid())
  galleryId      String
  photoId        String
  order          Int     @default(0)
  isGalleryCover Boolean @default(false)
  gallery        Gallery @relation(fields: [galleryId], references: [id], onDelete: Cascade)
  photo          Photo   @relation(fields: [photoId], references: [id], onDelete: Cascade)

  @@unique([galleryId, photoId])
}

model InviteCode {
  id        String    @id @default(cuid())
  code      String    @unique
  email     String?
  used      Boolean   @default(false)
  usedAt    DateTime?
  expiresAt DateTime
  createdAt DateTime  @default(now())
}

model SiteConfig {
  id        String @id @default(cuid())
  aboutText String @default("")
  quote     String @default("")
}
```

- [ ] **Step 3 : Générer le client et migrer**

```bash
npx prisma migrate dev --name init
```

Résultat attendu : `✔ Generated Prisma Client` + tables créées en base.

- [ ] **Step 4 : Créer lib/prisma.ts**

```ts
import { PrismaClient } from "../app/generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma

export default prisma
```

- [ ] **Step 5 : Commit**

```bash
git add prisma/ lib/prisma.ts
git commit -m "feat: configure Prisma avec schéma complet"
```

---

## Phase 2 — Authentification

### Task 3 : Configurer NextAuth v5

**Files:**
- Create: `admin/auth.ts`
- Create: `admin/app/api/auth/[...nextauth]/route.ts`
- Create: `admin/lib/auth.ts`
- Create: `admin/middleware.ts`

- [ ] **Step 1 : Créer auth.ts à la racine**

```ts
// auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        return valid ? user : null
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
})
```

- [ ] **Step 2 : Créer le handler API**

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

- [ ] **Step 3 : Créer le middleware**

```ts
// middleware.ts
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register")
  const isSharePage = req.nextUrl.pathname.startsWith("/share")

  if (isSharePage) return // public

  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }

  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 4 : Vérifier que la page /login redirige bien**

Lancer `npm run dev`, aller sur `http://localhost:3000` → doit rediriger vers `/login`.

- [ ] **Step 5 : Commit**

```bash
git add auth.ts middleware.ts app/api/
git commit -m "feat: configure NextAuth v5 avec protection des routes"
```

---

### Task 4 : Page de login

**Files:**
- Create: `admin/app/(auth)/login/page.tsx`
- Create: `admin/actions/auth.ts`

- [ ] **Step 1 : Créer la Server Action login**

```ts
// actions/auth.ts
"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou mot de passe incorrect" }
    }
    throw error
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" })
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}
```

- [ ] **Step 2 : Créer la page login**

```tsx
// app/(auth)/login/page.tsx
"use client"

import { useActionState } from "react"
import { login, loginWithGoogle } from "@/actions/auth"

export default function LoginPage() {
  const [error, action, pending] = useActionState(
    async (_: string | undefined, formData: FormData) => {
      const result = await login(formData)
      return result?.error
    },
    undefined
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Connexion
        </h1>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        <form action={loginWithGoogle}>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-sm">Continuer avec Google</span>
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <a href="/register" className="font-medium text-gray-900 hover:underline">
            S&apos;inscrire
          </a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3 : Tester manuellement**

`npm run dev` → aller sur `/login` → vérifier le rendu. Soumettre avec des mauvais identifiants → "Email ou mot de passe incorrect" doit s'afficher.

- [ ] **Step 4 : Commit**

```bash
git add app/(auth)/login/ actions/auth.ts
git commit -m "feat: page login avec email/password et Google"
```

---

### Task 5 : Inscription avec code d'invitation

**Files:**
- Create: `admin/app/(auth)/register/page.tsx`
- Modify: `admin/actions/auth.ts`

- [ ] **Step 1 : Ajouter la Server Action register dans actions/auth.ts**

Ajouter à la fin du fichier :

```ts
const registerSchema = z.object({
  code: z.string().min(1, "Code requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm"],
})

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    code: formData.get("code"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { code, email, password } = parsed.data

  // Vérifier le code d'invitation
  const invite = await prisma.inviteCode.findUnique({ where: { code } })

  if (!invite) return { error: "Code d'invitation invalide" }
  if (invite.used) return { error: "Ce code a déjà été utilisé" }
  if (invite.expiresAt < new Date()) return { error: "Ce code a expiré" }
  if (invite.email && invite.email !== email) {
    return { error: "Ce code n'est pas associé à cet email" }
  }

  // Vérifier que l'email n'existe pas déjà
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Un compte existe déjà avec cet email" }

  // Créer le compte
  const hashed = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.create({
      data: { email, password: hashed },
    }),
    prisma.inviteCode.update({
      where: { code },
      data: { used: true, usedAt: new Date() },
    }),
  ])

  redirect("/login")
}
```

- [ ] **Step 2 : Créer la page register**

```tsx
// app/(auth)/register/page.tsx
"use client"

import { useActionState } from "react"
import { register } from "@/actions/auth"

export default function RegisterPage() {
  const [error, action, pending] = useActionState(
    async (_: string | undefined, formData: FormData) => {
      const result = await register(formData)
      return result?.error
    },
    undefined
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Créer un compte
        </h1>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Code d&apos;invitation
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              placeholder="Ex: INV-XXXX-XXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{" "}
          <a href="/login" className="font-medium text-gray-900 hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3 : Créer un code d'invitation de test en base**

```bash
# Dans psql ou via prisma studio
npx prisma studio
```

Créer un `InviteCode` : `code = "TEST-0000"`, `expiresAt = demain`, `used = false`.

- [ ] **Step 4 : Tester le flux complet**

Aller sur `/register` → saisir le code + email + mot de passe → vérifier la redirection vers `/login` → se connecter → vérifier la redirection vers `/dashboard`.

- [ ] **Step 5 : Commit**

```bash
git add app/(auth)/register/ actions/auth.ts
git commit -m "feat: inscription sur invitation avec validation code"
```

---

## Phase 3 — Layout & Dashboard

### Task 6 : Layout avec sidebar

**Files:**
- Create: `admin/app/(dashboard)/layout.tsx`
- Create: `admin/components/sidebar.tsx`

- [ ] **Step 1 : Créer le composant Sidebar**

```tsx
// components/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/actions/auth"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "◉" },
  { href: "/photos", label: "Photos", icon: "◻" },
  { href: "/galleries", label: "Galeries", icon: "⊞" },
  { href: "/settings", label: "Paramètres", icon: "◈" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <p className="text-sm font-medium text-gray-400">Back-office</p>
        <p className="text-lg font-semibold">Aurélien Roy</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white text-gray-900 font-medium"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <form action={logout}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2 : Créer le layout dashboard**

```tsx
// app/(dashboard)/layout.tsx
import Sidebar from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 3 : Vérifier le rendu**

Se connecter → vérifier que la sidebar s'affiche à gauche, le contenu à droite.

- [ ] **Step 4 : Commit**

```bash
git add components/sidebar.tsx app/(dashboard)/layout.tsx
git commit -m "feat: layout dashboard avec sidebar"
```

---

### Task 7 : Page Dashboard

**Files:**
- Create: `admin/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1 : Créer la page**

```tsx
// app/(dashboard)/dashboard/page.tsx
import Link from "next/link"
import Image from "next/image"
import prisma from "@/lib/prisma"

export default async function DashboardPage() {
  const [photoCount, galleryCount, recentPhotos, recentGalleries] =
    await Promise.all([
      prisma.photo.count(),
      prisma.gallery.count(),
      prisma.photo.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.gallery.findMany({
        take: 3,
        include: { _count: { select: { photos: true } } },
        orderBy: { updatedAt: "desc" },
      }),
    ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Compteurs */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Photos</p>
          <p className="text-4xl font-bold text-gray-900">{photoCount}</p>
          <Link
            href="/photos/upload"
            className="mt-3 inline-block text-sm text-gray-600 hover:text-gray-900 underline"
          >
            + Ajouter
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Galeries</p>
          <p className="text-4xl font-bold text-gray-900">{galleryCount}</p>
          <Link
            href="/galleries/new"
            className="mt-3 inline-block text-sm text-gray-600 hover:text-gray-900 underline"
          >
            + Créer
          </Link>
        </div>
      </div>

      {/* Dernières photos */}
      {recentPhotos.length > 0 && (
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-3">
            Dernières photos ajoutées
          </h2>
          <div className="flex gap-3">
            {recentPhotos.map((photo) => (
              <Link key={photo.id} href={`/photos/${photo.id}`}>
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={photo.url}
                    alt={photo.title ?? ""}
                    fill
                    className="object-cover hover:opacity-80 transition-opacity"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Galeries récentes */}
      {recentGalleries.length > 0 && (
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-3">
            Galeries récentes
          </h2>
          <div className="space-y-2 max-w-md">
            {recentGalleries.map((gallery) => (
              <Link
                key={gallery.id}
                href={`/galleries/${gallery.id}`}
                className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-sm font-medium text-gray-900">
                  {gallery.name}
                </span>
                <span className="text-sm text-gray-500">
                  {gallery._count.photos} photos
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/(dashboard)/dashboard/
git commit -m "feat: page dashboard avec compteurs et récents"
```

---

## Phase 4 — Gestion des photos

### Task 8 : Server Actions photos

**Files:**
- Create: `admin/lib/cloudinary.ts`
- Create: `admin/actions/photos.ts`

- [ ] **Step 1 : Créer lib/cloudinary.ts**

```ts
// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(
  file: File,
  folder = "photographe"
): Promise<{ url: string; publicId: string }> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

export async function deleteFromCloudinary(publicId: string) {
  await cloudinary.uploader.destroy(publicId)
}
```

- [ ] **Step 2 : Créer actions/photos.ts**

```ts
// actions/photos.ts
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

const updateSchema = z.object({
  title: z.string().optional(),
  categoryId: z.string().optional(),
  isCover: z.boolean().optional(),
  isPortrait: z.boolean().optional(),
  isAboutPicture: z.boolean().optional(),
})

export async function uploadPhotos(formData: FormData) {
  const files = formData.getAll("files") as File[]

  if (!files || files.length === 0) {
    return { error: "Aucun fichier sélectionné" }
  }

  for (const file of files) {
    const { url, publicId } = await uploadToCloudinary(file)
    const categoryId = formData.get(`category_${file.name}`) as string | null

    await prisma.photo.create({
      data: {
        url,
        publicId,
        title: (formData.get(`title_${file.name}`) as string) || null,
        categoryId: categoryId || null,
        isCover: formData.get(`isCover_${file.name}`) === "on",
        isPortrait: formData.get(`isPortrait_${file.name}`) === "on",
      },
    })
  }

  revalidatePath("/photos")
  revalidatePath("/") // site vitrine
  redirect("/photos")
}

export async function updatePhoto(id: string, formData: FormData) {
  const parsed = updateSchema.safeParse({
    title: formData.get("title") as string,
    categoryId: formData.get("categoryId") as string,
    isCover: formData.get("isCover") === "on",
    isPortrait: formData.get("isPortrait") === "on",
    isAboutPicture: formData.get("isAboutPicture") === "on",
  })

  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await prisma.photo.update({
    where: { id },
    data: parsed.data,
  })

  revalidatePath("/photos")
  revalidatePath("/")
  redirect("/photos")
}

export async function deletePhoto(id: string) {
  const photo = await prisma.photo.findUnique({ where: { id } })
  if (!photo) return { error: "Photo introuvable" }

  await deleteFromCloudinary(photo.publicId)
  await prisma.photo.delete({ where: { id } })

  revalidatePath("/photos")
  revalidatePath("/")
  redirect("/photos")
}
```

- [ ] **Step 3 : Commit**

```bash
git add lib/cloudinary.ts actions/photos.ts
git commit -m "feat: Server Actions photos (upload, update, delete)"
```

---

### Task 9 : Liste des photos

**Files:**
- Create: `admin/app/(dashboard)/photos/page.tsx`
- Create: `admin/components/photo-card.tsx`

- [ ] **Step 1 : Créer photo-card.tsx**

```tsx
// components/photo-card.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { deletePhoto } from "@/actions/photos"

type PhotoCardProps = {
  id: string
  url: string
  title: string | null
  categoryName: string | null
}

export default function PhotoCard({ id, url, title, categoryName }: PhotoCardProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square">
        <Image src={url} alt={title ?? ""} fill className="object-cover" />
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">
          {title ?? "Sans titre"}
        </p>
        {categoryName && (
          <p className="text-xs text-gray-500">{categoryName}</p>
        )}
      </div>

      <div className="flex gap-2 px-3 pb-3">
        <Link
          href={`/photos/${id}`}
          className="flex-1 text-center text-xs py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Modifier
        </Link>

        {confirming ? (
          <div className="flex gap-1">
            <form action={() => deletePhoto(id)}>
              <button
                type="submit"
                className="text-xs py-1.5 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmer
              </button>
            </form>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs py-1.5 px-3 border border-gray-300 rounded-lg"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs py-1.5 px-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Créer la page liste des photos**

```tsx
// app/(dashboard)/photos/page.tsx
import Link from "next/link"
import prisma from "@/lib/prisma"
import PhotoCard from "@/components/photo-card"

export default async function PhotosPage() {
  const [photos, categories] = await Promise.all([
    prisma.photo.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Photos ({photos.length})
        </h1>
        <Link
          href="/photos/upload"
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Upload
        </Link>
      </div>

      {photos.length === 0 ? (
        <p className="text-gray-500">Aucune photo pour l&apos;instant.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              id={photo.id}
              url={photo.url}
              title={photo.title}
              categoryName={photo.category?.name ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add app/(dashboard)/photos/page.tsx components/photo-card.tsx
git commit -m "feat: liste des photos avec suppression inline"
```

---

### Task 10 : Upload de photos

**Files:**
- Create: `admin/app/(dashboard)/photos/upload/page.tsx`

- [ ] **Step 1 : Créer la page upload**

```tsx
// app/(dashboard)/photos/upload/page.tsx
"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { uploadPhotos } from "@/actions/photos"

type FilePreview = {
  file: File
  previewUrl: string
  title: string
  isCover: boolean
  isPortrait: boolean
}

export default function UploadPage() {
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const [pending, setPending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newPreviews = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      title: "",
      isCover: false,
      isPortrait: false,
    }))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index].previewUrl)
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (previews.length === 0) return

    setPending(true)
    const formData = new FormData()

    previews.forEach(({ file, title, isCover, isPortrait }) => {
      formData.append("files", file)
      formData.append(`title_${file.name}`, title)
      if (isCover) formData.append(`isCover_${file.name}`, "on")
      if (isPortrait) formData.append(`isPortrait_${file.name}`, "on")
    })

    await uploadPhotos(formData)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Upload de photos</h1>

      {/* Zone drag & drop */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        <p className="text-gray-600">Glisse tes photos ici</p>
        <p className="text-sm text-gray-400 mt-1">ou clique pour sélectionner</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Aperçus */}
      {previews.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {previews.map((preview, index) => (
            <div key={index} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={preview.previewUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Titre (optionnel)"
                  value={preview.title}
                  onChange={(e) => setPreviews((prev) =>
                    prev.map((p, i) => i === index ? { ...p, title: e.target.value } : p)
                  )}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />

                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={preview.isCover}
                      onChange={(e) => setPreviews((prev) =>
                        prev.map((p, i) => i === index ? { ...p, isCover: e.target.checked } : p)
                      )}
                    />
                    Photo de couverture
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={preview.isPortrait}
                      onChange={(e) => setPreviews((prev) =>
                        prev.map((p, i) => i === index ? { ...p, isPortrait: e.target.checked } : p)
                      )}
                    />
                    Portrait
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Upload en cours..." : `Envoyer ${previews.length} photo(s)`}
          </button>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 2 : Tester le flux upload**

Aller sur `/photos/upload` → sélectionner 2-3 images → vérifier les aperçus → soumettre → vérifier que les photos apparaissent sur `/photos`.

- [ ] **Step 3 : Commit**

```bash
git add app/(dashboard)/photos/upload/
git commit -m "feat: page upload avec drag & drop et aperçu"
```

---

### Task 11 : Édition d'une photo

**Files:**
- Create: `admin/app/(dashboard)/photos/[id]/page.tsx`

- [ ] **Step 1 : Créer la page édition**

```tsx
// app/(dashboard)/photos/[id]/page.tsx
import Image from "next/image"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { updatePhoto, deletePhoto } from "@/actions/photos"

export default async function EditPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [photo, categories] = await Promise.all([
    prisma.photo.findUnique({ where: { id }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!photo) notFound()

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Modifier la photo</h1>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
        <Image src={photo.url} alt={photo.title ?? ""} fill className="object-contain" />
      </div>

      <form action={updatePhoto.bind(null, id)} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input
            name="title"
            defaultValue={photo.title ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            name="categoryId"
            defaultValue={photo.categoryId ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Aucune</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          {[
            { name: "isCover", label: "Photo de couverture (homepage)", checked: photo.isCover },
            { name: "isPortrait", label: "Photo portrait (page About)", checked: photo.isPortrait },
            { name: "isAboutPicture", label: "Photo About", checked: photo.isAboutPicture },
          ].map(({ name, label, checked }) => (
            <label key={name} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name={name} defaultChecked={checked} />
              {label}
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sauvegarder
          </button>
          <a href="/photos" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Annuler
          </a>
        </div>
      </form>

      <form action={deletePhoto.bind(null, id)}>
        <button
          type="submit"
          className="w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
          onClick={(e) => {
            if (!confirm("Supprimer cette photo définitivement ?")) e.preventDefault()
          }}
        >
          Supprimer la photo
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/(dashboard)/photos/[id]/
git commit -m "feat: page édition photo avec catégorie et booléens"
```

---

## Phase 5 — Gestion des galeries

### Task 12 : Server Actions galeries

**Files:**
- Create: `admin/actions/galleries.ts`

- [ ] **Step 1 : Créer actions/galleries.ts**

```ts
// actions/galleries.ts
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { randomBytes } from "crypto"
import prisma from "@/lib/prisma"

const gallerySchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  isPremium: z.boolean().optional(),
})

export async function createGallery(formData: FormData) {
  const parsed = gallerySchema.safeParse({
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    isPrivate: formData.get("isPrivate") === "on",
    isPremium: formData.get("isPremium") === "on",
  })

  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const gallery = await prisma.gallery.create({
    data: {
      ...parsed.data,
      shareToken: randomBytes(16).toString("hex"),
    },
  })

  revalidatePath("/galleries")
  redirect(`/galleries/${gallery.id}`)
}

export async function updateGallery(id: string, formData: FormData) {
  const parsed = gallerySchema.safeParse({
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    isPrivate: formData.get("isPrivate") === "on",
    isPremium: formData.get("isPremium") === "on",
  })

  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await prisma.gallery.update({ where: { id }, data: parsed.data })

  revalidatePath("/galleries")
  revalidatePath(`/galleries/${id}`)
}

export async function deleteGallery(id: string) {
  await prisma.gallery.delete({ where: { id } })
  revalidatePath("/galleries")
  redirect("/galleries")
}

export async function addPhotoToGallery(galleryId: string, photoId: string) {
  await prisma.galleryPhoto.create({
    data: { galleryId, photoId },
  })
  revalidatePath(`/galleries/${galleryId}`)
}

export async function removePhotoFromGallery(galleryId: string, photoId: string) {
  await prisma.galleryPhoto.delete({
    where: { galleryId_photoId: { galleryId, photoId } },
  })
  revalidatePath(`/galleries/${galleryId}`)
}

export async function setCoverPhoto(galleryId: string, photoId: string) {
  await prisma.$transaction([
    prisma.galleryPhoto.updateMany({
      where: { galleryId },
      data: { isGalleryCover: false },
    }),
    prisma.galleryPhoto.update({
      where: { galleryId_photoId: { galleryId, photoId } },
      data: { isGalleryCover: true },
    }),
  ])
  revalidatePath(`/galleries/${galleryId}`)
}

export async function regenerateShareToken(id: string) {
  await prisma.gallery.update({
    where: { id },
    data: { shareToken: randomBytes(16).toString("hex") },
  })
  revalidatePath(`/galleries/${id}`)
}
```

- [ ] **Step 2 : Commit**

```bash
git add actions/galleries.ts
git commit -m "feat: Server Actions galeries"
```

---

### Task 13 : Liste et création de galeries

**Files:**
- Create: `admin/app/(dashboard)/galleries/page.tsx`
- Create: `admin/app/(dashboard)/galleries/new/page.tsx`

- [ ] **Step 1 : Page liste**

```tsx
// app/(dashboard)/galleries/page.tsx
import Link from "next/link"
import prisma from "@/lib/prisma"
import { deleteGallery } from "@/actions/galleries"

export default async function GalleriesPage() {
  const galleries = await prisma.gallery.findMany({
    include: { _count: { select: { photos: true } } },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Galeries ({galleries.length})
        </h1>
        <Link
          href="/galleries/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Nouvelle
        </Link>
      </div>

      <div className="space-y-3 max-w-2xl">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="flex items-center justify-between bg-white px-4 py-4 rounded-xl shadow-sm"
          >
            <div>
              <p className="font-medium text-gray-900">{gallery.name}</p>
              <p className="text-sm text-gray-500">
                {gallery._count.photos} photos ·{" "}
                {gallery.isPrivate ? "Privée" : "Publique"}
                {gallery.isPremium && " · Premium"}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/galleries/${gallery.id}`}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Gérer
              </Link>
              <form action={deleteGallery.bind(null, gallery.id)}>
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  onClick={(e) => {
                    if (!confirm("Supprimer cette galerie ?")) e.preventDefault()
                  }}
                >
                  Supprimer
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Page création**

```tsx
// app/(dashboard)/galleries/new/page.tsx
import { createGallery } from "@/actions/galleries"

export default function NewGalleryPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Nouvelle galerie</h1>

      <form action={createGallery} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isPrivate" />
            Galerie privée (accessible via lien unique)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isPremium" />
            Mise en avant sur le site (Premium)
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Créer la galerie
          </button>
          <a href="/galleries" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Annuler
          </a>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add app/(dashboard)/galleries/page.tsx app/(dashboard)/galleries/new/
git commit -m "feat: liste et création de galeries"
```

---

### Task 14 : Gestion d'une galerie

**Files:**
- Create: `admin/app/(dashboard)/galleries/[id]/page.tsx`

- [ ] **Step 1 : Créer la page**

```tsx
// app/(dashboard)/galleries/[id]/page.tsx
import Image from "next/image"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import {
  updateGallery,
  addPhotoToGallery,
  removePhotoFromGallery,
  setCoverPhoto,
  regenerateShareToken,
} from "@/actions/galleries"

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [gallery, allPhotos] = await Promise.all([
    prisma.gallery.findUnique({
      where: { id },
      include: {
        photos: {
          include: { photo: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),
  ])

  if (!gallery) notFound()

  const galleryPhotoIds = new Set(gallery.photos.map((gp) => gp.photoId))
  const availablePhotos = allPhotos.filter((p) => !galleryPhotoIds.has(p.id))

  const shareUrl = gallery.shareToken
    ? `${process.env.NEXT_PUBLIC_APP_URL}/share/${gallery.shareToken}`
    : null

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900">{gallery.name}</h1>

      {/* Lien de partage */}
      {gallery.isPrivate && shareUrl && (
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
          <p className="text-sm font-medium text-gray-700">Lien de partage privé</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
            />
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Copier
            </button>
          </div>
          <form action={regenerateShareToken.bind(null, id)}>
            <button type="submit" className="text-xs text-gray-500 hover:text-gray-700 underline">
              Regénérer le lien
            </button>
          </form>
        </div>
      )}

      {/* Photos dans la galerie */}
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-3">
          Photos ({gallery.photos.length})
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {gallery.photos.map((gp) => (
            <div key={gp.photoId} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image src={gp.photo.url} alt="" fill className="object-cover" />
                {gp.isGalleryCover && (
                  <div className="absolute top-1 left-1 bg-yellow-400 text-xs px-1.5 py-0.5 rounded font-medium">
                    ★ Couv.
                  </div>
                )}
              </div>
              <div className="mt-1 flex gap-1">
                <form action={setCoverPhoto.bind(null, id, gp.photoId)} className="flex-1">
                  <button type="submit" className="w-full text-xs py-1 border border-gray-300 rounded hover:bg-gray-50">
                    ★
                  </button>
                </form>
                <form action={removePhotoFromGallery.bind(null, id, gp.photoId)} className="flex-1">
                  <button type="submit" className="w-full text-xs py-1 border border-red-200 text-red-600 rounded hover:bg-red-50">
                    ✕
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ajouter des photos */}
      {availablePhotos.length > 0 && (
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-3">
            Ajouter depuis mes photos
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {availablePhotos.map((photo) => (
              <form key={photo.id} action={addPhotoToGallery.bind(null, id, photo.id)}>
                <button type="submit" className="w-full group">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image src={photo.url} alt="" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white text-gray-900 text-xs px-2 py-1 rounded-full font-medium">+ Ajouter</span>
                    </div>
                  </div>
                </button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2 : Ajouter NEXT_PUBLIC_APP_URL dans .env.local**

```env
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

- [ ] **Step 3 : Commit**

```bash
git add app/(dashboard)/galleries/[id]/
git commit -m "feat: gestion galerie avec lien partage et ajout/retrait photos"
```

---

### Task 15 : Page galerie publique partagée

**Files:**
- Create: `admin/app/share/[token]/page.tsx`

- [ ] **Step 1 : Créer la page**

```tsx
// app/share/[token]/page.tsx
import Image from "next/image"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const gallery = await prisma.gallery.findUnique({
    where: { shareToken: token },
    include: {
      photos: {
        include: { photo: true },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!gallery) notFound()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-900">{gallery.name}</h1>
          {gallery.description && (
            <p className="mt-2 text-gray-600">{gallery.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-400">
            {gallery.photos.length} photos
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {gallery.photos.map((gp) => (
            <div key={gp.photoId} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={gp.photo.url}
                alt={gp.photo.title ?? ""}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href={`/api/share/${token}/download`}
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Télécharger toutes les photos (ZIP)
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/share/
git commit -m "feat: page galerie partagée publique"
```

---

## Phase 6 — Paramètres

### Task 16 : Paramètres profil et textes site

**Files:**
- Create: `admin/actions/settings.ts`
- Create: `admin/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1 : Créer actions/settings.ts**

```ts
// actions/settings.ts
"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

const profileSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
})

const passwordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(8, "8 caractères minimum"),
  confirm: z.string(),
}).refine((d) => d.next === d.confirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm"],
})

const siteConfigSchema = z.object({
  aboutText: z.string(),
  quote: z.string(),
})

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) return { error: "Non authentifié" }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  })

  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await prisma.user.update({
    where: { email: session.user.email },
    data: parsed.data,
  })

  revalidatePath("/settings")
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) return { error: "Non authentifié" }

  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  })

  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user?.password) return { error: "Compte sans mot de passe (Google)" }

  const valid = await bcrypt.compare(parsed.data.current, user.password)
  if (!valid) return { error: "Mot de passe actuel incorrect" }

  const hashed = await bcrypt.hash(parsed.data.next, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  })

  return { success: true }
}

export async function updateSiteConfig(formData: FormData) {
  const parsed = siteConfigSchema.safeParse({
    aboutText: formData.get("aboutText"),
    quote: formData.get("quote"),
  })

  if (!parsed.success) return { error: parsed.error.errors[0].message }

  // Upsert : crée si n'existe pas, met à jour sinon
  const existing = await prisma.siteConfig.findFirst()

  if (existing) {
    await prisma.siteConfig.update({
      where: { id: existing.id },
      data: parsed.data,
    })
  } else {
    await prisma.siteConfig.create({ data: parsed.data })
  }

  revalidatePath("/settings")
  revalidatePath("/about") // site vitrine
  return { success: true }
}
```

- [ ] **Step 2 : Créer la page settings**

```tsx
// app/(dashboard)/settings/page.tsx
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { updateProfile, updatePassword, updateSiteConfig } from "@/actions/settings"

export default async function SettingsPage() {
  const session = await auth()
  const siteConfig = await prisma.siteConfig.findFirst()

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>

      {/* Profil */}
      <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Profil</h2>
        <form action={updateProfile} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              name="name"
              defaultValue={session?.user?.name ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={session?.user?.email ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
            Sauvegarder
          </button>
        </form>
      </section>

      {/* Mot de passe */}
      <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Mot de passe</h2>
        <form action={updatePassword} className="space-y-3">
          {[
            { name: "current", label: "Mot de passe actuel" },
            { name: "next", label: "Nouveau mot de passe" },
            { name: "confirm", label: "Confirmer" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                name={name}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          ))}
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
            Changer le mot de passe
          </button>
        </form>
      </section>

      {/* Textes site vitrine */}
      <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Textes du site vitrine</h2>
        <form action={updateSiteConfig} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texte À propos</label>
            <textarea
              name="aboutText"
              rows={5}
              defaultValue={siteConfig?.aboutText ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Citation homepage</label>
            <input
              name="quote"
              defaultValue={siteConfig?.quote ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
            Sauvegarder
          </button>
        </form>
      </section>
    </div>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add actions/settings.ts app/(dashboard)/settings/
git commit -m "feat: page paramètres (profil, mot de passe, textes site)"
```

---

## Phase 7 — Finalisation

### Task 17 : Root layout et redirection homepage

**Files:**
- Create: `admin/app/layout.tsx`
- Create: `admin/app/page.tsx`

- [ ] **Step 1 : Root layout**

```tsx
// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Back-office — Aurélien Roy",
  robots: { index: false }, // ne pas indexer le back-office
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2 : Redirection homepage**

```ts
// app/page.tsx
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/dashboard")
}
```

- [ ] **Step 3 : Commit final**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: root layout et redirection vers dashboard"
```

---

## Récapitulatif des routes

| Route | Accès | Description |
|---|---|---|
| `/` | Tous | Redirect → `/dashboard` |
| `/login` | Public | Connexion email/password + Google |
| `/register` | Public | Inscription avec code invitation |
| `/dashboard` | Auth | Vue d'ensemble |
| `/photos` | Auth | Liste de toutes les photos |
| `/photos/upload` | Auth | Upload drag & drop |
| `/photos/[id]` | Auth | Édition d'une photo |
| `/galleries` | Auth | Liste des galeries |
| `/galleries/new` | Auth | Création d'une galerie |
| `/galleries/[id]` | Auth | Gestion photos + lien partage |
| `/settings` | Auth | Profil + mot de passe + textes site |
| `/share/[token]` | Public | Galerie partagée (sans auth) |
