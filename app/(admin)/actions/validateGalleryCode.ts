"use server";

import prisma from "@/app/lib/prisma";
import { createHash } from "crypto";

export async function validateGalleryCode(token: string, code: string) {
  const gallery = await prisma.gallery.findUnique({
    where: { token },
    select: {
      id: true,
      name: true,
      guests: {
        select: {
          secretPasswords: {
            where: {
              used: false,
              expiresAt: { gt: new Date() },
            },
            select: { id: true, code: true },
          },
        },
      },
    },
  });

  if (!gallery) return { error: "Galerie introuvable" };

  const hashedInput = createHash("sha256")
    .update(code.trim().toUpperCase())
    .digest("hex");

  // Cherche parmi tous les codes actifs de tous les invités de cette galerie
  let matchedPasswordId: string | null = null;
  for (const guest of gallery.guests) {
    for (const sp of guest.secretPasswords) {
      if (sp.code === hashedInput) {
        matchedPasswordId = sp.id;
        break;
      }
    }
    if (matchedPasswordId) break;
  }

  if (!matchedPasswordId) return { error: "Code incorrect ou expiré" };

  // Marque le code comme utilisé (chaque code ne fonctionne qu'une seule fois)
  await prisma.secretPassword.update({
    where: { id: matchedPasswordId },
    data: { used: true },
  });

  return { success: true, token };
}
