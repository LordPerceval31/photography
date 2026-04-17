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
      // Récupère la photo de couverture pour le JSON-LD
      photos: { where: { isCover: true }, take: 1 },
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
  const coverPhoto = user.photos[0];

  // Schema.org — ProfessionalService est plus précis que LocalBusiness pour un prestataire
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `https://${domain}`,
    name: config?.seoTitle || user.name || "Photographe",
    url: `https://${domain}`,
    // Image : la photo de couverture en priorité, sinon l'avatar du compte
    image: coverPhoto?.url || user.image || "",
    // Description : champ SEO dédié en priorité, sinon la bio, sinon le tagline
    description:
      config?.seoDescription ||
      config?.bioParagraph1 ||
      config?.heroTagline ||
      "",
    // Slogan court affiché dans certains résultats Google
    ...(config?.heroTagline && { slogan: config.heroTagline }),
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
