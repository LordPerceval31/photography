import { z } from "zod";
import crypto from "crypto";

// Champ Zod partagé pour la validation des mots de passe
export const passwordField = z
  .string()
  .min(8, "8 caractères minimum")
  .regex(/[a-zA-Z]/, "Doit contenir une lettre")
  .regex(/[0-9]/, "Doit contenir un chiffre")
  .regex(/[^a-zA-Z0-9]/, "Doit contenir un caractère spécial")
  .trim();

// Vérification HIBP via k-Anonymity — fail-open (retourne false si l'API est indisponible)
export async function isPasswordPwned(password: string): Promise<boolean> {
  const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "User-Agent": "MonSaaS-Auth-Security" },
    });
    if (!response.ok) {
      console.warn("[HIBP] API indisponible :", response.status);
      return false;
    }
    const data = await response.text();
    return data.split("\n").some((line) => line.split(":")[0] === suffix);
  } catch (error) {
    console.error("[HIBP] Erreur réseau :", error);
    return false;
  }
}
