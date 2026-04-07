// proxy.ts
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Récupère le hostname (ex: sylvain.localhost:3001)
  let hostname = request.headers.get("host") || "";

  // 2. Nettoyage pour le local : on enlève le port :3001
  // Cela donne "sylvain.localhost"
  hostname = hostname.replace(":3001", "");

  // 3. Exclusion des fichiers statiques et API
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 4. La réécriture magique
  // On envoie la requête vers app/[domain]/...
  // Dans notre exemple, params.domain sera "sylvain.localhost"
  return NextResponse.rewrite(
    new URL(`/${hostname}${url.pathname}`, request.url),
  );
}
