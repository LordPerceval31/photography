"use server";

import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// --- 1. SCHÉMA ZOD EXISTANT ---
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Faire au moins 8 caractères" })
    .regex(/[a-zA-Z]/, { message: "Contenir au moins une lettre" })
    .regex(/[0-9]/, { message: "Contenir au moins un chiffre" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contenir au moins un caractère spécial",
    })
    .trim(),
});

// --- 2. FONCTION DE VÉRIFICATION HIBP (k-Anonymity) ---
async function isPasswordPwned(password: string): Promise<boolean> {
  // 1. Hasher le mot de passe en SHA-1
  const sha1Hash = crypto
    .createHash("sha1")
    .update(password)
    .digest("hex")
    .toUpperCase();

  // 2. Séparer le préfixe (5 premiers) et le suffixe (le reste)
  const prefix = sha1Hash.slice(0, 5);
  const suffix = sha1Hash.slice(5);

  try {
    // 3. Appeler l'API avec seulement le préfixe
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        // HIBP demande un User-Agent personnalisé
        headers: { "User-Agent": "MonSaaS-Auth-Security" },
      },
    );

    if (!response.ok) {
      // Fail-open : Si l'API HIBP est en panne, on ne bloque pas l'utilisateur
      console.warn("[HIBP] API indisponible :", response.status);
      return false;
    }

    const data = await response.text();

    // 4. Vérifier si le suffixe exact se trouve dans la réponse
    const pwnedLines = data.split("\n");
    for (const line of pwnedLines) {
      const [hashSuffix, count] = line.split(":");
      if (hashSuffix === suffix) {
        console.warn(
          `[SECURITY] Mot de passe compromis détecté (fuité ${count.trim()} fois).`,
        );
        return true;
      }
    }

    return false; // Suffixe non trouvé, le mot de passe est clean
  } catch (error) {
    console.error("[HIBP] Erreur réseau :", error);
    return false; // Fail-open en cas d'erreur réseau
  }
}

// --- 3. ACTION PRINCIPALE ---
export const setPassword = async (formData: FormData) => {
  const password = formData.get("password");
  const validation = passwordSchema.safeParse({ password });

  // Étape A : Validation syntaxique (Zod)
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  // Étape B : Vérification anti-fuite (HIBP)
  const isCompromised = await isPasswordPwned(validation.data.password);
  if (isCompromised) {
    return {
      errorMessage:
        "Ce mot de passe est apparu dans une fuite de données publique. Pour votre sécurité, veuillez en choisir un autre.",
    };
  }

  // Étape C : Vérification de la session
  const session = await auth();
  if (!session?.user?.email) {
    return { errorMessage: "Session expirée. Veuillez vous reconnecter." };
  }

  // Étape D : Mise à jour en base de données
  try {
    const hashedPassword = await bcrypt.hash(validation.data.password, 10);

    // Bonus Sécurité : On nettoie toutes les sessions actives pour forcer
    // la reconnexion de tous les appareils avec le nouveau mot de passe.
    await prisma.$transaction([
      prisma.user.update({
        where: { email: session.user.email },
        data: {
          password: hashedPassword,
          tempCode: null, // On invalide le mode "Premier Login"
        },
      }),
      prisma.session.deleteMany({
        where: { userId: session.user.id }, // Nécessite que l'ID soit dans la session
      }),
    ]);

    return { success: true };
  } catch (error: unknown) {
    console.error("[SET_PASSWORD] Erreur BDD :", error);
    return {
      errorMessage: "Erreur lors de l'enregistrement en base de données.",
    };
  }
};
