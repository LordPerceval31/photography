// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// La fonction exportée s'appelle désormais 'proxy' et non plus 'middleware'
const proxy = (request: NextRequest) => {
  const url = request.nextUrl;

  // Récupère le nom de domaine (ex: www.jean.fr ou jean.tonsaas.com)
  let hostname = request.headers.get("host") || "";

  // Si tu testes en local, on nettoie le localhost:3000
  hostname = hostname.replace("localhost:3000", "tonsaas.local");

  // On exclut les routes système, les API et les assets statiques
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // On réécrit l'URL silencieusement pour pointer vers notre dossier dynamique [domain]
  return NextResponse.rewrite(
    new URL(`/${hostname}${url.pathname}`, request.url),
  );
};

export default proxy;

// Optionnel : tu peux toujours utiliser un matcher pour limiter l'exécution du proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
