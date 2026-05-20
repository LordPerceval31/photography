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
    where: { subdomain: { not: null } },
    select: { subdomain: true },
  });

  const tenantSites: MetadataRoute.Sitemap = users
    .filter((user) => user.subdomain !== null)
    .map((user) => ({
      url: `https://${user.subdomain}.photolio.fr`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // 3. ON ASSEMBLE TOUT ET ON ENVOIE À GOOGLE
  return [...staticPages, ...tenantSites];
}
