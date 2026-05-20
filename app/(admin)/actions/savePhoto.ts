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
  | "isAboutPicture3"
  | "isDarkPicture1"
  | "isDarkPicture2";

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
    // 1. Chercher l'ancienne photo du slot pour supprimer son fichier Cloudinary
    //    si son publicId est différent du nouveau (sinon Cloudinary l'a déjà remplacé)
    const oldPhoto = await prisma.photo.findFirst({
      where: { userId: session.user.id, [slot]: true },
      select: { publicId: true },
    });

    if (oldPhoto?.publicId && oldPhoto.publicId !== publicId) {
      try {
        await cloudinary.uploader.destroy(oldPhoto.publicId);
      } catch {
        // nettoyage Cloudinary best-effort : on ne bloque pas la sauvegarde si ça échoue
      }
    }

    // 2. Supprimer tous les enregistrements qui bloqueraient le create :
    //    - l'ancien slot (isCover/isPortrait/…)
    //    - tout enregistrement orphelin avec le même publicId
    await prisma.photo.deleteMany({
      where: {
        userId: session.user.id,
        OR: [{ [slot]: true }, { publicId }],
      },
    });

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
