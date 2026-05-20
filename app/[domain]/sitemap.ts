import { MetadataRoute } from "next";
import { prisma } from "../lib/prisma";

export default async function sitemap({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { domain } = await params;

  const user = await prisma.user.findFirst({
    where: { subdomain: domain },
    include: { galleries: { where: { isPrivate: false } } }, // Uniquement les galeries publiques
  });

  if (!user) return [];

  const baseUrl = `https://${domain}`;

  // 1. Les pages statiques du photographe
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
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
