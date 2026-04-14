import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import HeroSection from "./home/HeroSection";
import PremiumGalleryWrapper from "./home/PremiumGalleryWrapper";
import DarkSection from "./home/DarkSection";
import CarouselWrapper from "./home/CarouselWrapper";
import { prisma } from "../lib/prisma";
import SmoothScroll from "../_components/SmoothScroll";

export const revalidate = 3600;

/**
 * Récupère les données de l'utilisateur par domaine ou sous-domaine.
 * Encapsulé dans React `cache` pour dédupliquer les appels Prisma
 * entre `generateMetadata` et le rendu du composant.
 * * @param {string} domain - Le domaine personnalisé ou sous-domaine.
 */
const getUserByDomain = cache(async (domain: string) => {
  return await prisma.user.findFirst({
    where: {
      OR: [{ subdomain: domain }, { customDomain: domain }],
    },
    include: {
      siteConfig: true,
    },
  });
});

/**
 * Génère les balises meta SEO de la page utilisateur.
 * Utilise les champs SEO spécifiques de `SiteConfig` s'ils existent,
 * avec un fallback sur les informations basiques de l'utilisateur.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) {
    return { title: "Portfolio introuvable" };
  }

  const config = user.siteConfig;

  const seoTitle =
    config?.seoTitle || `${user.name || "Photographe"} | Portfolio`;
  const seoDescription =
    config?.seoDescription ||
    `Découvrez les galeries et le portfolio de ${user.name || "ce photographe"}.`;

  return {
    title: seoTitle,
    description: seoDescription,
    // INDISPENSABLE POUR ÉVITER LA PÉNALITÉ DE DUPLICATE CONTENT
    alternates: {
      canonical: `https://${domain}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `https://${domain}`,
      type: "website",
    },
  };
}

/**
 * Rendu côté serveur de la vitrine utilisateur.
 * Injecte les données structurées (JSON-LD) pour le SEO local.
 */
const Home = async ({ params }: { params: Promise<{ domain: string }> }) => {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) {
    return notFound();
  }

  const config = user.siteConfig;

  // Schema.org format pour remonter dans les recherches locales
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: config?.seoTitle || user.name || "Photographe",
    image: user.image || "",
    "@id": `https://${domain}`,
    url: `https://${domain}`,
  };

  return (
    <main className="relative w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmoothScroll>
        <HeroSection userId={user.id} />
        <PremiumGalleryWrapper userId={user.id} />
        <DarkSection userId={user.id} />
        <CarouselWrapper userId={user.id} />
      </SmoothScroll>
    </main>
  );
};

export default Home;
