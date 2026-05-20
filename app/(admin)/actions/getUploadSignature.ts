"use server";

import { CLOUDINARY_FOLDER, getCloudinaryConfig, titleToSlug } from "@/app/lib/cloudinary";
import prisma from "@/app/lib/prisma";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";

export const getUploadSignature = async (title: string, allowReplace = false) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Session expirée." };

  const slug = titleToSlug(title);
  if (!slug) return { error: "Le titre est requis." };

  const publicId = `${CLOUDINARY_FOLDER}/${session.user.id}/${slug}`;

  // Pour les slots (cover, portrait…) on autorise le remplacement
  if (!allowReplace) {
    const existing = await prisma.photo.findFirst({
      where: { userId: session.user.id, publicId },
    });
    if (existing) return { error: "Une photo avec ce nom existe déjà." };
  }

  let config: Awaited<ReturnType<typeof getCloudinaryConfig>>;
  try {
    config = await getCloudinaryConfig(session.user.id);
  } catch {
    return {
      error: "Configure tes credentials Cloudinary dans les Paramètres.",
    };
  }

  const timestamp = Math.round(Date.now() / 1000);

  // On signe avec public_id (pas folder) pour contrôler le nom du fichier
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, public_id: publicId },
    config.api_secret,
  );

  return {
    timestamp,
    signature,
    cloudName: config.cloud_name,
    apiKey: config.api_key,
    publicId, // retourné au client pour l'inclure dans le FormData
  };
};
