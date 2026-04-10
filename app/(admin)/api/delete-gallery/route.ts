import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Receiver } from "@upstash/qstash";
import prisma from "@/app/lib/prisma";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: Request) {
  try {
    // Vérification de la signature QStash — rejette toute requête non signée
    const signature = req.headers.get("Upstash-Signature") ?? "";
    const rawBody = await req.text();
    const isValid = await receiver.verify({ signature, body: rawBody });
    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { galleryId } = JSON.parse(rawBody) as { galleryId: string };

    if (!galleryId) {
      return NextResponse.json({ error: "Aucun ID fourni" }, { status: 400 });
    }

    // 1. Récupération de la galerie avec l'utilisateur (pour ses clés Cloudinary) et les photos
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: {
        user: true,
        photos: { include: { photo: true } },
      },
    });

    // Si déjà supprimée ou inexistante, on retourne un succès pour que QStash arrête de réessayer
    if (!gallery) {
      return NextResponse.json({
        success: true,
        message: "Galerie déjà supprimée",
      });
    }

    // 2. Configuration dynamique de Cloudinary (avec les clés du User s'il en a, sinon par défaut)
    cloudinary.config({
      cloud_name:
        gallery.user.cloudinaryName ??
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: gallery.user.cloudinaryKey ?? process.env.CLOUDINARY_API_KEY,
      api_secret:
        gallery.user.cloudinarySecret ?? process.env.CLOUDINARY_API_SECRET,
    });

    // 3. Suppression des images sur les serveurs de Cloudinary
    const publicIds = gallery.photos
      .map((gp) => gp.photo.publicId)
      .filter(Boolean) as string[];

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }

    // 4. Suppression des photos dans Prisma
    const photoIds = gallery.photos.map((gp) => gp.photo.id);
    if (photoIds.length > 0) {
      await prisma.photo.deleteMany({
        where: { id: { in: photoIds } },
      });
    }

    // 5. Suppression de la galerie (qui supprimera en Cascade GalleryGuest, SecretPassword, etc.)
    await prisma.gallery.delete({
      where: { id: galleryId },
    });

    console.log(`Galerie ${galleryId} supprimée avec succès par le webhook.`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la galerie:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
