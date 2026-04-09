import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "photolio.fr";

  // Exclusion des fichiers statiques et du proxy PostHog
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/ingest") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  let domain: string;

  // Nettoyage du port pour le développement local
  const cleanHostname = hostname.split(":")[0];

  if (cleanHostname.endsWith(".localhost")) {
    // Développement : jean.localhost → domain = "jean"
    const subdomain = cleanHostname.replace(".localhost", "");
    if (!subdomain) return NextResponse.next();
    domain = subdomain;
  } else if (cleanHostname.endsWith(`.${BASE_DOMAIN}`)) {
    // Production sous-domaine : jean.photolio.fr → domain = "jean"
    domain = cleanHostname.slice(0, -(`.${BASE_DOMAIN}`.length));
    if (domain === "www") return NextResponse.next();
  } else if (
    cleanHostname === BASE_DOMAIN ||
    cleanHostname === "localhost"
  ) {
    // Racine Photolio ou localhost seul → page d'accueil plateforme
    return NextResponse.next();
  } else {
    // Domaine custom : jean-photo.fr → domain = "jean-photo.fr"
    domain = cleanHostname;
  }

  // Réécriture : jean.photolio.fr/gallery → /jean/gallery
  url.pathname = `/${domain}${pathname}`;
  return NextResponse.rewrite(url);
}
