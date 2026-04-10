"use server";

import { randomBytes, createHash } from "crypto";
import { Client } from "@upstash/qstash";
import { revalidatePath } from "next/cache";
import { ExpiresIn } from "../types/gallery";
import prisma from "@/app/lib/prisma";
import { sendGalleryInviteEmail } from "@/app/lib/mail";
import { auth } from "@/auth";
import { galleryInviteRateLimit } from "@/app/lib/ratelimit";
import { isValidEmail } from "@/app/lib/validators";

const qstashClient = new Client({ token: process.env.QSTASH_TOKEN! });

const MAX_EMAILS = 50;

type PhotoInput = {
  url: string;
  publicId: string;
  title: string;
  isGalleryCover: boolean;
};

export type CreateGalleryInput = {
  name: string;
  description: string;
  isPremium: boolean;
  isPrivate: boolean;
  expiresIn: ExpiresIn;
  emails: string[];
  photos: PhotoInput[];
};

// ── Helpers privés ────────────────────────────────────────────────────────────

function computeExpiresAt(
  isPrivate: boolean,
  expiresIn: ExpiresIn,
): Date | null {
  if (!isPrivate) return null;
  const days = parseInt(expiresIn.replace("d", ""), 10);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function createPhotos(
  galleryId: string,
  userId: string,
  photos: PhotoInput[],
): Promise<void> {
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    const photoRecord = await prisma.photo.create({
      data: {
        url: p.url,
        publicId: p.publicId,
        title: p.title || null,
        userId,
      },
    });
    await prisma.galleryPhoto.create({
      data: {
        galleryId,
        photoId: photoRecord.id,
        isGalleryCover: p.isGalleryCover,
        order: i,
      },
    });
  }
}

async function inviteGuests(
  galleryId: string,
  galleryToken: string,
  emails: string[],
  expiresAt: Date | null,
): Promise<void> {
  for (const email of emails) {
    const guest = await prisma.galleryGuest.create({
      data: { email, galleryId },
    });

    const rawCode = randomBytes(4).toString("hex").toUpperCase();
    const hashedCode = createHash("sha256").update(rawCode).digest("hex");
    const guestExpiresAt =
      expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.secretPassword.create({
      data: { code: hashedCode, expiresAt: guestExpiresAt, guestId: guest.id },
    });

    await sendGalleryInviteEmail(email, galleryToken, rawCode, expiresAt);
  }
}

async function scheduleDeletion(
  galleryId: string,
  expiresIn: ExpiresIn,
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_APP_URL) return;
  const days = parseInt(expiresIn.replace("d", ""), 10);
  await qstashClient.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/delete-gallery`,
    body: { galleryId },
    delay: days * 24 * 60 * 60,
  });
}

// ── Orchestrateur principal ───────────────────────────────────────────────────

export async function createGallery(data: CreateGalleryInput) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Session expirée." };

  const { name, description, isPremium, isPrivate, expiresIn, emails, photos } =
    data;

  if (!name.trim()) return { error: "Le titre est requis." };

  if (isPrivate) {
    const { success } = await galleryInviteRateLimit.limit(session.user.id);
    if (!success)
      return { error: "Trop de galeries créées. Réessaie dans une heure." };
  }

  if (emails.length > MAX_EMAILS)
    return { error: `Maximum ${MAX_EMAILS} destinataires par galerie.` };

  const invalidEmail = emails.find((e) => !isValidEmail(e));
  if (invalidEmail) return { error: `Email invalide : ${invalidEmail}` };

  const expiresAt = computeExpiresAt(isPrivate, expiresIn);

  try {
    const gallery = await prisma.gallery.create({
      data: {
        name,
        description,
        isPremium,
        isPrivate,
        userId: session.user.id,
        expiresAt,
      },
    });

    await createPhotos(gallery.id, session.user.id, photos);

    if (isPrivate && emails.length > 0) {
      await inviteGuests(gallery.id, gallery.token, emails, expiresAt);
    }

    if (isPrivate) {
      await scheduleDeletion(gallery.id, expiresIn);
    }

    revalidatePath("/dashboard");
    return { success: true, galleryId: gallery.id };
  } catch (err: unknown) {
    console.error("[createGallery] Erreur lors de la création", {
      userId: session.user.id,
      galleryName: name,
      error: err,
    });
    return { error: "Erreur BDD critique." };
  }
}
