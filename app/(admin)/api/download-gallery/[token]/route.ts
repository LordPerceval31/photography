import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/app/lib/prisma";
import { decrypt } from "@/app/lib/crypto";

const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) => {
  try {
    const { token } = await params;

    // 1. Récupérer la galerie, les photos ET l'utilisateur (pour ses clés Cloudinary)
    const gallery = await prisma.gallery.findUnique({
      where: { token },
      select: {
        name: true,
        // On récupère les identifiants de l'utilisateur propriétaire de la galerie
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

    // 2. Vérifier que l'utilisateur a bien configuré ses identifiants
    if (
      !cloudinaryConfig?.cloudinaryName ||
      !cloudinaryConfig?.cloudinaryKey ||
      !cloudinaryConfig?.cloudinarySecret
    ) {
      return NextResponse.json(
        {
          error:
            "La configuration Cloudinary est manquante pour cette galerie.",
        },
        { status: 500 },
      );
    }

    // 3. Configurer Cloudinary dynamiquement avec les clés de la base de données
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudinaryName,
      api_key: decrypt(cloudinaryConfig.cloudinaryKey),
      api_secret: decrypt(cloudinaryConfig.cloudinarySecret),
    });

    // 4. Récupérer les publicIds
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
        { error: "Aucune photo dans cette galerie" },
        { status: 404 },
      );
    }

    // 5. Cloudinary génère un ZIP signé côté serveur et retourne l'URL
    const zipUrl = cloudinary.utils.download_zip_url({
      public_ids: publicIds,
      resource_type: "image",
    });

    // 6. Rediriger l'utilisateur vers le fichier ZIP
    return NextResponse.redirect(zipUrl);
  } catch (error) {
    console.error("Erreur téléchargement ZIP:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la création du téléchargement.",
      },
      { status: 500 },
    );
  }
};

export { GET };
