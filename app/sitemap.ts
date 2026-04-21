import { MetadataRoute } from "next";
import prisma from "./lib/prisma";

export const revalidate = 86400; // Mise à jour 1 fois par jour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. TES PAGES FIXES (L'ancien code est intégré ici)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: "https://photolio.fr",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  // 2. TES SOUS-DOMAINES DYNAMIQUES (La requête vers ta BDD)
  const users = await prisma.user.findMany({
    where: {
      OR: [{ subdomain: { not: null } }, { customDomain: { not: null } }],
    },
    select: {
      subdomain: true,
      customDomain: true,
    },
  });

  const tenantSites: MetadataRoute.Sitemap = users
    .map((user) => {
      // Un customDomain valide doit contenir un point (ex: "mon-site.fr")
      // Sinon on replie sur le sous-domaine photolio.fr
      const domainUrl =
        user.customDomain && user.customDomain.includes(".")
          ? `https://${user.customDomain}`
          : user.subdomain
            ? `https://${user.subdomain}.photolio.fr`
            : null;

      if (!domainUrl) return null;

      return {
        url: domainUrl,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    })
    .filter((entry) => entry !== null);

  // 3. ON ASSEMBLE TOUT ET ON ENVOIE À GOOGLE
  return [...staticPages, ...tenantSites];
}
