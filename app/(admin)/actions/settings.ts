"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { auth } from "@/auth";
import prisma from "@/app/lib/prisma";
import { encrypt } from "@/app/lib/crypto";

// ── 1. SOUS-DOMAINE ──────────────────────────────────────────────────────────

const subdomainSchema = z.object({
  subdomain: z
    .string()
    .min(3, "3 caractères minimum")
    .max(30, "30 caractères maximum")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Minuscules, chiffres et tirets uniquement (pas en début ni fin)",
    ),
});

const updateSubdomain = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Session expirée" };

  const parsed = subdomainSchema.safeParse({
    subdomain: (formData.get("subdomain") as string)?.toLowerCase(),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues?.[0]?.message || "Erreur de validation.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { subdomain: parsed.data.subdomain },
  });
  if (existing && existing.id !== session.user.id) {
    return { error: "Ce nom de domaine est déjà pris" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { subdomain: parsed.data.subdomain },
    });
  } catch (err: unknown) {
    console.error("[settings:updateSubdomain] Erreur Prisma", {
      userId: session.user.id,
      error: err,
    });
    return { error: "Erreur lors de la sauvegarde." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
};
export { updateSubdomain };

// ── 2. CREDENTIALS CLOUDINARY ────────────────────────────────────────────────

const cloudinarySchema = z.object({
  cloudinaryName: z.string().min(1, "Cloud name requis"),
  cloudinaryKey: z.string().min(1, "API Key requise"),
  cloudinarySecret: z.string().min(1, "API Secret requis"),
});

const updateCloudinaryCredentials = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Session expirée" };

  const parsed = cloudinarySchema.safeParse({
    cloudinaryName: formData.get("cloudinaryName"),
    cloudinaryKey: formData.get("cloudinaryKey"),
    cloudinarySecret: formData.get("cloudinarySecret"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues?.[0]?.message || "Erreur de validation.",
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        cloudinaryName: parsed.data.cloudinaryName,
        cloudinaryKey: encrypt(parsed.data.cloudinaryKey),
        cloudinarySecret: encrypt(parsed.data.cloudinarySecret),
      },
    });
  } catch (err: unknown) {
    console.error("[settings:updateCloudinaryCredentials] Erreur Prisma", {
      userId: session.user.id,
      error: err,
    });
    return { error: "Erreur lors de la sauvegarde des credentials." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
};
export { updateCloudinaryCredentials };

// ── 2. CREDENTIALS EMAILJS ───────────────────────────────────────────────────

const emailjsSchema = z.object({
  emailjsServiceId: z.string().min(1, "Service ID requis"),
  emailjsTemplateId: z.string().min(1, "Template ID requis"),
  emailjsPublicKey: z.string().min(1, "Public Key requise"),
});

const updateEmailJsCredentials = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Session expirée" };

  const parsed = emailjsSchema.safeParse({
    emailjsServiceId: formData.get("emailjsServiceId"),
    emailjsTemplateId: formData.get("emailjsTemplateId"),
    emailjsPublicKey: formData.get("emailjsPublicKey"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues?.[0]?.message || "Erreur de validation.",
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailjsServiceId: parsed.data.emailjsServiceId,
        emailjsTemplateId: parsed.data.emailjsTemplateId,
        emailjsPublicKey: parsed.data.emailjsPublicKey,
      },
    });
  } catch (err: unknown) {
    console.error("[settings:updateEmailJsCredentials] Erreur Prisma", {
      userId: session.user.id,
      error: err,
    });
    return { error: "Erreur lors de la sauvegarde des credentials." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
};
export { updateEmailJsCredentials };

// ── 3. ADRESSE EMAIL ─────────────────────────────────────────────────────────

const emailSchema = z.object({
  newEmail: z.string().email("Email invalide"),
  currentPassword: z.string().min(1, "Mot de passe requis"),
});

const updateEmail = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Session expirée" };

  const parsed = emailSchema.safeParse({
    newEmail: formData.get("newEmail"),
    currentPassword: formData.get("currentPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues?.[0]?.message || "Erreur de validation.",
    };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password)
    return { error: "Impossible de vérifier le mot de passe" };

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.password,
  );
  if (!valid) return { error: "Mot de passe incorrect" };

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.newEmail },
  });
  if (existing) return { error: "Cet email est déjà utilisé" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: parsed.data.newEmail },
    });
  } catch (err: unknown) {
    console.error("[settings:updateEmail] Erreur Prisma", {
      userId: session.user.id,
      newEmail: parsed.data.newEmail,
      error: err,
    });
    return { error: "Erreur lors de la mise à jour de l'email." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
};

export { updateEmail };

// ── 4. MOT DE PASSE ───────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[a-zA-Z]/, "Doit contenir une lettre")
      .regex(/[0-9]/, "Doit contenir un chiffre")
      .regex(/[^a-zA-Z0-9]/, "Doit contenir un caractère spécial"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const updatePassword = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Session expirée" };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues?.[0]?.message || "Erreur de validation.",
    };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password)
    return { error: "Impossible de vérifier le mot de passe" };

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.password,
  );
  if (!valid) return { error: "Mot de passe actuel incorrect" };

  // Vérification HIBP (k-Anonymity)
  const sha1 = createHash("sha1")
    .update(parsed.data.newPassword)
    .digest("hex")
    .toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await res.text();
    const compromised = text
      .split("\n")
      .some((line) => line.startsWith(suffix));
    if (compromised)
      return {
        error:
          "Ce mot de passe a été compromis dans une fuite de données. Choisis-en un autre.",
      };
  } catch {
    console.warn("[settings:updatePassword] HIBP indisponible");
    return {
      error:
        "Impossible de vérifier la sécurité du mot de passe. Réessaie dans quelques secondes.",
    };
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 12);

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hash },
    });
  } catch (err: unknown) {
    console.error("[settings:updatePassword] Erreur Prisma", {
      userId: session.user.id,
      error: err,
    });
    return { error: "Erreur lors de la mise à jour du mot de passe." };
  }

  return { success: true };
};

export { updatePassword };
