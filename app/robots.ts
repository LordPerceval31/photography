import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const domain = headersList.get("host"); // Récupère le domaine (ex: tartampion.photolio.fr)

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/"],
    },
    // On génère dynamiquement l'URL du sitemap correspondant au domaine consulté
    sitemap: `https://${domain}/sitemap.xml`,
  };
}
