"use server";

import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { passwordField, isPasswordPwned } from "@/app/lib/password";

// --- 1. SCHÉMA ZOD ---
const passwordSchema = z.object({ password: passwordField });

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
