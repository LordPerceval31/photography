"use server";

import { auth } from "@/auth";
import prisma from "@/app/lib/prisma";
import { getCloudinaryConfig } from "@/app/lib/cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

// 1. CRÉER UN SERVICE
const createService = async (data: {
  title: string;
  description: string;
  price: string;
  photoUrl?: string;
  photoPublicId?: string;
}) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  if (!data.title.trim() || !data.description.trim() || !data.price.trim()) {
    return { error: "Le titre, la description et le prix sont obligatoires." };
  }

  try {
    // Récupère l'ordre max existant pour placer le nouveau service en dernier
    const last = await prisma.service.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const service = await prisma.service.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        price: data.price.trim(),
        photoUrl: data.photoUrl ?? null,
        photoPublicId: data.photoPublicId ?? null,
        order: (last?.order ?? -1) + 1,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/services");
    return { success: true, serviceId: service.id };
  } catch (err: unknown) {
    console.error("[services:createService] Erreur Prisma", { error: err });
    return { error: "Erreur lors de la création du service." };
  }
};
export { createService };

// 2. MODIFIER UN SERVICE
const updateService = async (
  serviceId: string,
  data: {
    title: string;
    description: string;
    price: string;
    photoUrl?: string;
    photoPublicId?: string;
    // publicId de l'ancienne photo à supprimer si on la remplace
    oldPhotoPublicId?: string;
  },
) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  if (!data.title.trim() || !data.description.trim() || !data.price.trim()) {
    return { error: "Le titre, la description et le prix sont obligatoires." };
  }

  try {
    // Vérifie que le service appartient bien à cet utilisateur
    const existing = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { userId: true },
    });
    if (!existing || existing.userId !== session.user.id) {
      return { error: "Service introuvable." };
    }

    // Si la photo est remplacée ET que son ID est différent de la nouvelle photo,
    // on supprime l'ancienne de Cloudinary
    if (data.oldPhotoPublicId && data.oldPhotoPublicId !== data.photoPublicId) {
      try {
        cloudinary.config(await getCloudinaryConfig(session.user.id));
        await cloudinary.uploader.destroy(data.oldPhotoPublicId);
      } catch {
        console.warn(
          "[services:updateService] Impossible de supprimer l'ancienne photo Cloudinary",
        );
      }
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        price: data.price.trim(),
        photoUrl: data.photoUrl ?? null,
        photoPublicId: data.photoPublicId ?? null,
      },
    });

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (err: unknown) {
    console.error("[services:updateService] Erreur", { serviceId, error: err });
    return { error: "Erreur lors de la modification du service." };
  }
};

export { updateService };

// 3. SUPPRIMER UN SERVICE
const deleteService = async (serviceId: string) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  try {
    // Récupère le service en vérifiant qu'il appartient à l'utilisateur
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { userId: true, photoPublicId: true },
    });

    if (!service || service.userId !== session.user.id) {
      return { error: "Service introuvable." };
    }

    // Supprime la photo Cloudinary associée si elle existe
    if (service.photoPublicId) {
      try {
        cloudinary.config(await getCloudinaryConfig(session.user.id));
        await cloudinary.uploader.destroy(service.photoPublicId);
      } catch {
        // Suppression Cloudinary non bloquante
        console.warn(
          "[services:deleteService] Impossible de supprimer la photo Cloudinary",
        );
      }
    }

    await prisma.service.delete({ where: { id: serviceId } });

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (err: unknown) {
    console.error("[services:deleteService] Erreur", { serviceId, error: err });
    return { error: "Erreur lors de la suppression du service." };
  }
};

export { deleteService };
