"use server";

import {
  deleteCloudinaryPhotos,
  getCloudinaryConfig,
} from "@/app/lib/cloudinary";
import { sendGalleryShareEmail } from "@/app/lib/mail";
import prisma from "@/app/lib/prisma";
import { isValidEmail } from "@/app/lib/validators";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

export async function deleteGallery(galleryId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  try {
    cloudinary.config(await getCloudinaryConfig(session.user.id));

    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId, userId: session.user.id },
      select: { id: true, photos: { select: { photoId: true } } },
    });
    if (!gallery) return { error: "Galerie introuvable" };

    const photoIdsInGallery = gallery.photos.map((p) => p.photoId);

    // Trouve les photos liées UNIQUEMENT à cette galerie (pas partagées avec d'autres)
    // On compte le nombre de galeries pour chaque photo — si c'est 1, elle est exclusive
    const photosWithCount = await prisma.photo.findMany({
      where: { id: { in: photoIdsInGallery }, userId: session.user.id },
      select: { id: true, publicId: true, _count: { select: { galleries: true } } },
    });
    const photosExclusive = photosWithCount.filter((p) => p._count.galleries === 1);

    console.log("[deleteGallery] photos dans la galerie:", photoIdsInGallery.length);
    console.log("[deleteGallery] photos exclusives à supprimer:", photosExclusive.length);
    console.log("[deleteGallery] publicIds:", photosExclusive.map((p) => p.publicId));

    await deleteCloudinaryPhotos(photosExclusive);

    if (photosExclusive.length > 0) {
      await prisma.photo.deleteMany({
        where: { id: { in: photosExclusive.map((p) => p.id) } },
      });
    }

    // Suppression cascade → GalleryPhoto, GalleryGuest supprimés automatiquement
    await prisma.gallery.delete({ where: { id: galleryId } });

    revalidatePath("/dashboard/galleries");
    return { success: true };
  } catch (err: unknown) {
    console.error("[galleries:deleteGallery] Erreur", {
      galleryId,
      error: err,
    });
    return { error: "Erreur lors de la suppression de la galerie." };
  }
}

export async function updateGallery(
  galleryId: string,
  data: { name: string; description: string },
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  if (!data.name.trim()) return { error: "Le nom est requis" };

  try {
    await prisma.gallery.update({
      where: { id: galleryId, userId: session.user.id },
      data: { name: data.name.trim(), description: data.description.trim() },
    });
    revalidatePath("/dashboard/galleries");
    return { success: true };
  } catch (err: unknown) {
    console.error("[galleries:updateGallery] Erreur Prisma", {
      galleryId,
      error: err,
    });
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function shareGallery(galleryId: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  if (!isValidEmail(email)) return { error: "Email invalide" };

  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId, userId: session.user.id },
    select: { token: true, name: true },
  });
  if (!gallery) return { error: "Galerie introuvable" };

  const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/download-gallery/${gallery.token}`;

  try {
    await sendGalleryShareEmail(email, downloadUrl, gallery.name);
    return { success: true };
  } catch (err: unknown) {
    console.error("[galleries:shareGallery] Échec envoi email", {
      galleryId,
      email,
      error: err,
    });
    return { error: "Échec de l'envoi de l'email" };
  }
}
