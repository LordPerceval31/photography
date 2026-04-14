import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Optionnel : tu peux bloquer l'indexation du back-office
      disallow: ["/dashboard/", "/admin/"],
    },
    sitemap: "https://photolio.fr/sitemap.xml",
  };
}
