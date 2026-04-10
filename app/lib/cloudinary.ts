import { v2 as cloudinary } from "cloudinary";
import prisma from "./prisma";
import { decrypt } from "./crypto";

// Dossier de stockage — utilisé partout pour rester cohérent
export const CLOUDINARY_FOLDER = "photographe";

// Supprime une liste de photos de Cloudinary en parallèle
// Ignore les photos sans publicId (ex: photos importées manuellement)
export async function deleteCloudinaryPhotos(
  photos: { publicId: string | null }[],
): Promise<void> {
  const deletes = photos
    .filter((p) => p.publicId)
    .map((p) => cloudinary.uploader.destroy(p.publicId!));
  await Promise.all(deletes);
}

// Récupère et décrypte les credentials du user depuis la base
// Throw si non configurés — à utiliser dans toutes les actions Cloudinary
export async function getCloudinaryConfig(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      cloudinaryName: true,
      cloudinaryKey: true,
      cloudinarySecret: true,
    },
  });

  if (!user?.cloudinaryName || !user?.cloudinaryKey || !user?.cloudinarySecret)
    throw new Error(
      "Configure tes credentials Cloudinary dans les Paramètres.",
    );

  return {
    cloud_name: user.cloudinaryName,
    api_key: decrypt(user.cloudinaryKey),
    api_secret: decrypt(user.cloudinarySecret),
  };
}
