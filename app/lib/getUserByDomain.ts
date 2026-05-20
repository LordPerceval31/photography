import { cache } from "react";
import prisma from "@/app/lib/prisma";

// cache() déduplique les appels Prisma dans un même cycle de requête Next.js.
// Si generateMetadata et la Page appellent getUserByDomain avec le même domaine,
// Prisma n'est contacté qu'une seule fois — le second appel reçoit le résultat en mémoire.
export const getUserByDomain = cache(async (domain: string) => {
  return prisma.user.findFirst({
    where: {
      subdomain: domain,
    },
    include: {
      siteConfig: true,
      activeTemplate: true,
      photos: { where: { isCover: true }, take: 1 },
    },
  });
});
