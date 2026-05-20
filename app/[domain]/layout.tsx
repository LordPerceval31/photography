import type { Metadata } from "next";
import "../globals.css";
import prisma from "../lib/prisma";
import { NavbarProvider } from "../_components/NavbarContext";
import PostHogDomainTracker from "../_components/PostHogDomainTracker";

// --- SEO dynamique par photographe ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;

  const user = await prisma.user.findFirst({
    where: { subdomain: domain },
    include: { siteConfig: true },
  });

  if (!user) return {};

  const config = user.siteConfig;
  const name = config?.heroName || "Photographe";
  const location = config?.seoLocation ? ` à ${config.seoLocation}` : "";

  // On fusionne le nom et le lieu pour le titre SEO
  const defaultTitle = `${name}${location}`;

  // On priorise la description SEO explicite, sinon on replie sur la tagline
  const description =
    config?.seoDescription ||
    config?.heroTagline ||
    config?.bioParagraph1 ||
    "";

  const baseUrl = `https://${domain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`;

  // Photo de couverture pour og:image
  const coverPhoto = await prisma.photo.findFirst({
    where: { userId: user.id, isCover: true },
  });

  return {
    // "%s | Jean Dupont à Lyon" — chaque page injecte son propre titre à la place de %s
    title: { default: defaultTitle, template: `%s | ${defaultTitle}` },
    description,
    metadataBase: new URL(baseUrl),
    alternates: { canonical: baseUrl },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: baseUrl,
      siteName: name,
      title: defaultTitle,
      description,
      images: coverPhoto ? [{ url: coverPhoto.url, alt: name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
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
      <PostHogDomainTracker domain={domain} />
      {children}
    </NavbarProvider>
  );
}
