"use server";

import {
  CLOUDINARY_FOLDER,
  deleteCloudinaryPhotos,
  generateUniquePublicId,
  getCloudinaryConfig,
  titleToSlug,
} from "@/app/lib/cloudinary";
import prisma from "@/app/lib/prisma";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

// 0. AJOUTER UNE PHOTO À UNE GALERIE EXISTANTE
export async function addPhotoToGallery(
  galleryId: string,
  url: string,
  publicId: string,
  title: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  try {
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId, userId: session.user.id },
    });
    if (!gallery) return { error: "Galerie introuvable" };

    const photo = await prisma.photo.create({
      data: {
        url,
        publicId,
        title: title.trim() || null,
        userId: session.user.id,
      },
    });

    await prisma.galleryPhoto.create({
      data: { galleryId, photoId: photo.id },
    });

    revalidatePath("/dashboard/photos");
    return { success: true };
  } catch (err: unknown) {
    console.error("[photos:addPhotoToGallery]", { galleryId, error: err });
    return { error: "Erreur lors de l'ajout de la photo." };
  }
}

// 1. RENOMMER UNE PHOTO (renomme aussi le fichier sur Cloudinary)
export async function renamePhoto(photoId: string, newTitle: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  const slug = titleToSlug(newTitle);
  if (!slug) return { error: "Titre invalide." };

  const newPublicId = `${CLOUDINARY_FOLDER}/${slug}`;

  try {
    // Récupère la photo pour avoir son publicId actuel
    const photo = await prisma.photo.findUnique({
      where: { id: photoId, userId: session.user.id },
      select: { publicId: true },
    });
    if (!photo) return { error: "Photo introuvable." };

    // Vérifie qu'aucune autre photo n'a déjà ce nom
    const duplicate = await prisma.photo.findFirst({
      where: {
        userId: session.user.id,
        publicId: newPublicId,
        id: { not: photoId }, // on exclut la photo courante
      },
    });
    if (duplicate) return { error: "Une photo avec ce nom existe déjà." };

    // Renomme le fichier sur Cloudinary si la photo a un publicId
    let newUrl: string | undefined;
    if (photo.publicId && photo.publicId !== newPublicId) {
      cloudinary.config(await getCloudinaryConfig(session.user.id));
      const result = await cloudinary.uploader.rename(photo.publicId, newPublicId);
      newUrl = result.secure_url;
    }

    // Met à jour le titre, le publicId et l'URL en base
    await prisma.photo.update({
      where: { id: photoId, userId: session.user.id },
      data: {
        title: newTitle.trim(),
        publicId: newPublicId,
        ...(newUrl ? { url: newUrl } : {}),
      },
    });

    revalidatePath("/dashboard/photos");
    return { success: true };
  } catch (err: unknown) {
    console.error("[photos:renamePhoto] Erreur", { photoId, error: err });
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

// 4. COPIER DES PHOTOS (crée de vraies copies sur Cloudinary + nouveaux enregistrements en base)
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
      select: { id: true, url: true, publicId: true, title: true },
    });

    cloudinary.config(await getCloudinaryConfig(session.user.id));

    const createdPhotos: {
      id: string;
      url: string;
      title: string | null;
      galleryId: string;
      createdAt: Date;
    }[] = [];

    for (const photo of ownedPhotos) {
      // Détermine la base du nom : titre ou dernière partie du publicId
      const baseName =
        photo.title?.trim() ||
        (photo.publicId
          ? photo.publicId.replace(`${CLOUDINARY_FOLDER}/`, "")
          : "photo");

      // Génère un publicId unique avec auto-incrément si déjà pris
      const newPublicId = await generateUniquePublicId(session.user.id, baseName);

      // Copie le fichier sur Cloudinary en uploadant depuis l'URL existante
      const result = await cloudinary.uploader.upload(photo.url, {
        public_id: newPublicId,
        overwrite: false,
      });

      // Le titre = la partie du publicId après le dossier (ex: "voiture-2")
      const newTitle = newPublicId.replace(`${CLOUDINARY_FOLDER}/`, "");

      // Crée un nouveau Photo en base et le lie à la galerie cible
      const newPhoto = await prisma.photo.create({
        data: {
          url: result.secure_url,
          publicId: newPublicId,
          title: newTitle,
          userId: session.user.id,
        },
      });

      await prisma.galleryPhoto.create({
        data: { galleryId: targetGalleryId, photoId: newPhoto.id },
      });

      createdPhotos.push({
        id: newPhoto.id,
        url: newPhoto.url,
        title: newPhoto.title,
        galleryId: targetGalleryId,
        createdAt: newPhoto.createdAt,
      });
    }

    revalidatePath("/dashboard/photos");
    return { success: true, photos: createdPhotos };
  } catch (err: unknown) {
    console.error("[photos:copyPhotos] Erreur", {
      photoIds,
      targetGalleryId,
      error: err,
    });
    return { error: "Erreur lors de la copie." };
  }
}
