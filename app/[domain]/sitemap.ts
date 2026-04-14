import { MetadataRoute } from "next";
import { prisma } from "../lib/prisma";

export default async function sitemap({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { domain } = await params;

  const user = await prisma.user.findFirst({
    where: { OR: [{ subdomain: domain }, { customDomain: domain }] },
    include: { galleries: { where: { isPrivate: false } } }, // Uniquement les galeries publiques
  });

  if (!user) return [];

  const baseUrl = `https://${domain}`;

  // 1. La page d'accueil du photographe
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // 2. Les galeries publiques du photographe
  const galleryRoutes = user.galleries.map((gallery) => ({
    url: `${baseUrl}/g/${gallery.token}`,
    lastModified: gallery.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...routes, ...galleryRoutes];
}
