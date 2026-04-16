import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/app/lib/prisma";
import { getCloudinaryConfig } from "@/app/lib/cloudinary";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  // Récupère la galerie et ses photos
  const gallery = await prisma.gallery.findUnique({
    where: { token },
    select: {
      name: true,
      userId: true,
      photos: {
        select: { photo: { select: { publicId: true } } },
      },
    },
  });

  if (!gallery) {
    return NextResponse.json({ error: "Galerie introuvable" }, { status: 404 });
  }

  const publicIds = gallery.photos
    .map((p) => p.photo.publicId)
    .filter(Boolean) as string[];

  if (publicIds.length === 0) {
    return NextResponse.json({ error: "Aucune photo dans cette galerie" }, { status: 400 });
  }

  // Configure Cloudinary avec les credentials du photographe
  const config = await getCloudinaryConfig(gallery.userId);
  cloudinary.config(config);

  // Génère l'URL ZIP signée via l'API Cloudinary
  const url = cloudinary.utils.download_zip_url({
    public_ids: publicIds,
    target_public_id: gallery.name.toLowerCase().replace(/\s+/g, "-"),
  });

  return NextResponse.redirect(url);
}
