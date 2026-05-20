import { v2 as cloudinary } from "cloudinary";
import prisma from "./prisma";
import { decrypt } from "./crypto";

// Dossier de stockage — utilisé partout pour rester cohérent
export const CLOUDINARY_FOLDER = "photographe";

// Convertit un titre en slug valide pour Cloudinary
// Ex: "Mon Portrait été" → "mon-portrait-ete"
export function titleToSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime les accents
    .replace(/[^a-z0-9]+/g, "-")     // remplace tout sauf lettres/chiffres par tiret
    .replace(/^-|-$/g, "");          // supprime les tirets en début/fin
}

// Génère un publicId unique avec auto-incrément si le nom est déjà pris
// Ex: "photographe/portrait" existe → retourne "photographe/portrait-2"
export async function generateUniquePublicId(
  userId: string,
  baseTitle: string,
): Promise<string> {
  const slug = titleToSlug(baseTitle);
  const base = `${CLOUDINARY_FOLDER}/${slug}`;

  const existing = await prisma.photo.findMany({
    where: { userId, publicId: { startsWith: base } },
    select: { publicId: true },
  });

  if (existing.length === 0) return base;

  let i = 2;
  while (existing.some((p) => p.publicId === `${base}-${i}`)) i++;
  return `${base}-${i}`;
}

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
