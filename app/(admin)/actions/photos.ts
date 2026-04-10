"use server";

import {
  deleteCloudinaryPhotos,
  getCloudinaryConfig,
} from "@/app/lib/cloudinary";
import prisma from "@/app/lib/prisma";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

// 1. RENOMMER UNE PHOTO
export async function renamePhoto(photoId: string, newTitle: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  try {
    await prisma.photo.update({
      where: { id: photoId, userId: session.user.id },
      data: { title: newTitle },
    });
    revalidatePath("/dashboard/photos");
    return { success: true };
  } catch (err: unknown) {
    console.error("[photos:renamePhoto] Erreur Prisma", {
      photoId,
      error: err,
    });
    return { error: "Erreur lors du renommage." };
  }
}

// 2. SUPPRIMER DES PHOTOS (DB + CLOUDINARY)
export async function deletePhotos(photoIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  try {
    const photosToDelete = await prisma.photo.findMany({
      where: { id: { in: photoIds }, userId: session.user.id },
      select: { id: true, publicId: true },
    });

    if (photosToDelete.length === 0) return { success: true };

    cloudinary.config(await getCloudinaryConfig(session.user.id));
    await deleteCloudinaryPhotos(photosToDelete);

    await prisma.photo.deleteMany({
      where: {
        id: { in: photosToDelete.map((p) => p.id) },
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/photos");
    return { success: true };
  } catch (err: unknown) {
    console.error("[photos:deletePhotos] Erreur", { photoIds, error: err });
    return { error: "Erreur lors de la suppression." };
  }
}

// 3. DÉPLACER DES PHOTOS (efface l'ancien lien de galerie, crée le nouveau)
export async function movePhotos(photoIds: string[], targetGalleryId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  try {
    const targetGallery = await prisma.gallery.findUnique({
      where: { id: targetGalleryId, userId: session.user.id },
    });
    if (!targetGallery) return { error: "Galerie introuvable" };

    const ownedPhotos = await prisma.photo.findMany({
      where: { id: { in: photoIds }, userId: session.user.id },
      select: { id: true },
    });
    const ownedIds = ownedPhotos.map((p) => p.id);

    await prisma.galleryPhoto.deleteMany({
      where: { photoId: { in: ownedIds } },
    });

    await prisma.galleryPhoto.createMany({
      data: ownedIds.map((photoId) => ({
        galleryId: targetGalleryId,
        photoId,
      })),
    });

    revalidatePath("/dashboard/photos");
    return { success: true };
  } catch (err: unknown) {
    console.error("[photos:movePhotos] Erreur", {
      photoIds,
      targetGalleryId,
      error: err,
    });
    return { error: "Erreur lors du déplacement." };
  }
}

// 4. COPIER DES PHOTOS (ajoute un lien vers la nouvelle galerie sans effacer l'ancien)
export async function copyPhotos(photoIds: string[], targetGalleryId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  try {
    const targetGallery = await prisma.gallery.findUnique({
      where: { id: targetGalleryId, userId: session.user.id },
    });
    if (!targetGallery) return { error: "Galerie introuvable" };

    const ownedPhotos = await prisma.photo.findMany({
      where: { id: { in: photoIds }, userId: session.user.id },
      select: { id: true },
    });

    // skipDuplicates évite de crasher si la photo est déjà dans cette galerie
    await prisma.galleryPhoto.createMany({
      data: ownedPhotos.map(({ id }) => ({
        galleryId: targetGalleryId,
        photoId: id,
      })),
      skipDuplicates: true,
    });

    revalidatePath("/dashboard/photos");
    return { success: true };
  } catch (err: unknown) {
    console.error("[photos:copyPhotos] Erreur", {
      photoIds,
      targetGalleryId,
      error: err,
    });
    return { error: "Erreur lors de la copie." };
  }
}
