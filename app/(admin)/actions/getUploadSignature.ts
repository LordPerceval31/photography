"use server";

import { CLOUDINARY_FOLDER, getCloudinaryConfig } from "@/app/lib/cloudinary";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";

export const getUploadSignature = async () => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Session expirée." };

  let config: Awaited<ReturnType<typeof getCloudinaryConfig>>;
  try {
    config = await getCloudinaryConfig(session.user.id);
  } catch {
    return {
      error: "Configure tes credentials Cloudinary dans les Paramètres.",
    };
  }

  const timestamp = Math.round(Date.now() / 1000);

  // La signature est calculée côté serveur avec l'API secret
  // Le client reçoit la signature mais jamais le secret
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: CLOUDINARY_FOLDER },
    config.api_secret,
  );

  return {
    timestamp,
    signature,
    cloudName: config.cloud_name,
    apiKey: config.api_key,
  };
};
