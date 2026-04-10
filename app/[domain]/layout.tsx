import type { Metadata } from "next";
import "../globals.css";
import prisma from "../lib/prisma";
import { NavbarProvider } from "../_components/NavbarContext";
import PostHogDomainTracker from "../_components/PostHogDomainTracker";
import NavBar from "../_components/navBar";

// --- SEO dynamique par photographe ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;

  const user = await prisma.user.findFirst({
    where: { OR: [{ subdomain: domain }, { customDomain: domain }] },
    include: { siteConfig: true },
  });

  if (!user) return {};

  const config = user.siteConfig;
  const name = config?.heroName || "Photographe";
  const description = config?.heroTagline || config?.bioParagraph1 || "";

  // URL canonique : domaine custom en priorité, sinon sous-domaine Photolio
  const baseUrl = user.customDomain
    ? `https://${user.customDomain}`
    : `https://${user.subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`;

  // Photo de couverture pour og:image
  const coverPhoto = await prisma.photo.findFirst({
    where: { userId: user.id, isCover: true },
  });

  return {
    // "%s | Jean Dupont" — chaque page injecte son propre titre à la place de %s
    title: { default: name, template: `%s | ${name}` },
    description,
    metadataBase: new URL(baseUrl),
    alternates: { canonical: baseUrl },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: baseUrl,
      siteName: name,
      title: name,
      description,
      images: coverPhoto ? [{ url: coverPhoto.url, alt: name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: coverPhoto ? [coverPhoto.url] : [],
    },
  };
}

export default async function DomainLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}>) {
  const { domain } = await params;

  return (
    <NavbarProvider>
      {/* Enregistre le domaine du photographe dans toutes les analytics */}
      <PostHogDomainTracker domain={domain} />
      <NavBar />
      {children}
    </NavbarProvider>
  );
}
