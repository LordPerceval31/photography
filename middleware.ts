import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "photolio.fr";

  let domain: string;

  if (hostname.includes("localhost")) {
    // --- Développement local ---
    // jean.localhost:3000 → domain = "jean"
    // localhost:3000 seul → pas de sous-domaine, on laisse passer
    const [subdomain] = hostname.split(".localhost");
    if (!subdomain || subdomain === "localhost") {
      return NextResponse.next();
    }
    domain = subdomain;
  } else if (hostname.endsWith(`.${BASE_DOMAIN}`)) {
    // --- Sous-domaine Photolio ---
    // jean.photolio.fr → domain = "jean"
    domain = hostname.slice(0, -(`.${BASE_DOMAIN}`.length));
  } else if (hostname === BASE_DOMAIN || hostname === `www.${BASE_DOMAIN}`) {
    // --- Domaine racine Photolio (page marketing, pas un photographe) ---
    return NextResponse.next();
  } else {
    // --- Domaine custom du photographe ---
    // jean-photo.fr → domain = "jean-photo.fr"
    // On enlève le port si présent (utile en dev avec un domaine custom simulé)
    domain = hostname.split(":")[0];
  }

  // Réécriture : jean.photolio.fr/about → /jean/about
  // Next.js résout ensuite app/[domain]/about/page.tsx avec domain = "jean"
  url.pathname = `/${domain}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * On exclut :
     * - _next/static  : fichiers JS/CSS buildés
     * - _next/image   : optimisation d'images
     * - ingest        : proxy PostHog (géré par next.config.ts)
     * - fichiers statiques (images, fonts, favicon...)
     */
    "/((?!_next/static|_next/image|ingest|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)).*)",
  ],
};
