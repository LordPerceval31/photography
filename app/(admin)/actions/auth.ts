"use server";

import { sendRecoveryEmail } from "@/app/lib/mail";
import prisma from "@/app/lib/prisma";
import {
  forgotPasswordRateLimit,
  loginEmailRateLimit,
  loginRateLimit,
} from "@/app/lib/ratelimit";
import { getClientIp } from "@/app/lib/utils";
import { signIn, signOut } from "@/auth";
import { randomBytes, createHash } from "crypto";
import { AuthError } from "next-auth";

/**
 * Action de Connexion avec Double Rate Limiting (IP + Email)
 */
export const login = async (formData: FormData) => {
  const email = formData.get("email") as string;

  // 1. Sécurité DRY : Rate Limiting par IP
  const ip = await getClientIp();
  const { success: ipSuccess } = await loginRateLimit.limit(`login_ip_${ip}`);

  if (!ipSuccess) {
    return { error: "Trop de tentatives. Réessayez dans 10 minutes." };
  }

  // 2. Sécurité : Rate Limiting par compte (Anti-Botnet)
  const { success: emailSuccess } = await loginEmailRateLimit.limit(
    `login_email_${email}`,
  );

  if (!emailSuccess) {
    return {
      error: "Trop de tentatives pour ce compte. Réessayez dans 15 minutes.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou mot de passe incorrect." };
    }
    throw error;
  }
};

/**
 * Action Mot de Passe Oublié avec Expiration (15min) et Code 8 caractères
 */
export const forgotPassword = async (formData: FormData) => {
  const email = formData.get("email") as string;

  if (!email) return { error: "L'adresse email est requise." };

  // 1. Sécurité DRY : Empêcher le spam de mail par IP
  const ip = await getClientIp();
  const { success: canSendEmail } = await forgotPasswordRateLimit.limit(
    `forgot_${ip}`,
  );

  if (!canSendEmail) {
    return { error: "Veuillez patienter avant de demander un nouveau code." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // 2. Anti-énumération : On ne révèle pas si l'email existe
    if (!user) return { success: true };

    // 3. Génération du code brut + hash SHA-256 pour le stockage
    const rawCode = randomBytes(4).toString("hex").toUpperCase();
    const hashedCode = createHash("sha256").update(rawCode).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Valide 15 minutes

    // 4. Stockage du hash (jamais le code brut en base)
    await prisma.user.update({
      where: { email },
      data: {
        tempCode: hashedCode,
        tempCodeExpiry: expiresAt,
      },
    });

    // 5. Envoi du code brut par mail
    await sendRecoveryEmail(email, rawCode);

    return { success: true };
  } catch (error) {
    console.error("[FORGOT] Erreur:", error);
    // On renvoie true même en cas d'erreur technique pour ne pas donner d'indice
    return { success: true };
  }
};

export const logout = async () => {
  await signOut({ redirectTo: "/login" });
};
