"use server";

import { auth } from "@/auth";
import prisma from "@/app/lib/prisma";
import { getCloudinaryConfig } from "@/app/lib/cloudinary";
import { v2 as cloudinary } from "cloudinary";

type PhotoSlotType =
  | "isCover"
  | "isPortrait"
  | "isAboutPicture1"
  | "isAboutPicture2"
  | "isAboutPicture3";

export const savePhoto = async (
  url: string,
  publicId: string,
  slot: PhotoSlotType,
) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Session expirée." };

  try {
    cloudinary.config(await getCloudinaryConfig(session.user.id));
  } catch {
    return {
      error: "Configure tes credentials Cloudinary dans les Paramètres.",
    };
  }

  try {
    // 1. Récupérer l'ancienne photo
    const oldPhoto = await prisma.photo.findFirst({
      where: { userId: session.user.id, [slot]: true },
    });

    // 2. Supprimer l'ancienne de Cloudinary et de la base
    if (oldPhoto) {
      if (oldPhoto.publicId) {
        await cloudinary.uploader.destroy(oldPhoto.publicId);
      }
      await prisma.photo.delete({ where: { id: oldPhoto.id } });
    }

    // 3. Sauvegarder la nouvelle
    await prisma.photo.create({
      data: {
        url,
        publicId,
        userId: session.user.id,
        [slot]: true,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("[savePhoto] Erreur lors de la sauvegarde", {
      userId: session.user.id,
      slot,
      publicId,
      error: err,
    });
    return { error: "Erreur lors de la sauvegarde de la photo." };
  }
};
