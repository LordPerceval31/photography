// lib/utils.ts
import { headers } from "next/headers";

/**
 * Récupère l'adresse IP du client depuis les en-têtes de la requête.
 * Utile pour le rate limiting et les logs de sécurité.
 */
export const getClientIp = async (): Promise<string> => {
  const headersList = await headers();
  return headersList.get("x-forwarded-for") ?? "127.0.0.1";
};
