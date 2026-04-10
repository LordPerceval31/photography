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
    domain = cleanHostname.slice(0, -`.${BASE_DOMAIN}`.length);
    if (domain === "www") return NextResponse.next();
  } else if (
    cleanHostname === BASE_DOMAIN ||
    cleanHostname === "localhost" ||
    cleanHostname.includes("ngrok") // <-- C'EST LA SEULE LIGNE À AJOUTER
  ) {
    // Racine Photolio, localhost ou ngrok → laisse passer normalement
    return NextResponse.next();
  } else {
    // Domaine custom : jean-photo.fr → domain = "jean-photo.fr"
    domain = cleanHostname;
  }

  // Réécriture : jean.photolio.fr/gallery → /jean/gallery
  url.pathname = `/${domain}${pathname}`;
  return NextResponse.rewrite(url);
}

// proxy.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. DÉTECTION DES ACTIONS ET DE L'API (VITAL)
  const isServerAction = req.headers.has("next-action");
  const isApiRoute = pathname.startsWith("/api");

  // Si c'est une Action ou une route API, on ne fait RIEN, on laisse passer.
  if (isServerAction || isApiRoute) {
    return;
  }

  const isLoggedIn = !!req.auth;
  const isFirstLogin = req.auth?.user?.isFirstLogin === true;

  const isAuthRoute = pathname === "/login" || pathname === "/forgot-password";
  const isSetupRoute = pathname === "/set-password";
  // Route publique : accès galerie privée client (pas besoin d'être connecté au back-office)
  const isPublicRoute = pathname === "/" || pathname.startsWith("/gallery/");

  // 2. LOGIQUE DE REDIRECTION
  if (isLoggedIn) {
    if (isFirstLogin) {
      // Force le setup si c'est la première fois
      if (!isSetupRoute) {
        return Response.redirect(new URL("/set-password", req.nextUrl));
      }
      return; // Laisse passer si on est déjà sur /set-password
    }

    // Si déjà configuré, interdit le login et le setup
    if (isAuthRoute || isSetupRoute) {
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  // Si pas connecté et pas sur une route publique/auth, redirection login
  if (!isLoggedIn && !isAuthRoute && !isPublicRoute) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*|favicon.ico).*)"],
};
