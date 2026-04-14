import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/app/lib/prisma";
import { decrypt } from "@/app/lib/crypto";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const gallery = await prisma.gallery.findUnique({
      where: { token },
      select: {
        name: true,
        user: {
          select: {
            cloudinaryName: true,
            cloudinaryKey: true,
            cloudinarySecret: true,
          },
        },
        photos: {
          select: { photo: { select: { publicId: true, url: true } } },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: "Galerie introuvable" },
        { status: 404 },
      );
    }

    const cloudinaryConfig = gallery.user;

    if (
      !cloudinaryConfig?.cloudinaryName ||
      !cloudinaryConfig?.cloudinaryKey ||
      !cloudinaryConfig?.cloudinarySecret
    ) {
      return NextResponse.json(
        { error: "Configuration Cloudinary manquante." },
        { status: 500 },
      );
    }

    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudinaryName,
      api_key: decrypt(cloudinaryConfig.cloudinaryKey),
      api_secret: decrypt(cloudinaryConfig.cloudinarySecret),
    });

    const publicIds = gallery.photos
      .map((p) => {
        if (p.photo.publicId) return p.photo.publicId;
        const match = p.photo.url.match(
          /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/,
        );
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];

    if (publicIds.length === 0) {
      return NextResponse.json(
        { error: "Aucune photo trouvée." },
        { status: 404 },
      );
    }

    const gallerySlug = gallery.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // On génère l'URL signée
    const zipUrl = cloudinary.utils.download_zip_url({
      public_ids: publicIds,
      resource_type: "image",
      target_public_id: gallerySlug,
    });

    // IMPORTANT : On renvoie l'URL au client au lieu de télécharger le fichier ici
    return NextResponse.json({ url: zipUrl });
  } catch (error) {
    console.error("Erreur ZIP:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
