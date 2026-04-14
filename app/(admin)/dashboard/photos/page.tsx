import type { Metadata } from "next";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photos",
};
import { redirect } from "next/navigation";
import Link from "next/link";
import PhotosClient from "./PhotosClient";
import prisma from "@/app/lib/prisma";

export default async function PhotosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const userCredentials = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      cloudinaryName: true,
      cloudinaryKey: true,
      cloudinarySecret: true,
    },
  });

  const cloudinaryReady =
    !!userCredentials?.cloudinaryName &&
    !!userCredentials?.cloudinaryKey &&
    !!userCredentials?.cloudinarySecret;

  if (!cloudinaryReady) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <p className="text-red-400 text-sm tablet:text-base 2k:text-xl font-medium">
            Configure ton compte Cloudinary avant de gérer tes photos.
          </p>
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 rounded-xl border border-cream/20 text-cream/70 hover:text-cream hover:border-cream/40 transition-all text-xs uppercase tracking-widest"
          >
            Aller dans les Paramètres →
          </Link>
        </div>
      </div>
    );
  }

  // 1. Récupération de tes galeries (exactement comme dans ton DashboardOverview)
  const galleries = await prisma.gallery.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  // 2. Récupération des photos avec la BONNE relation de ton schema ("galleries")
  const rawPhotos = await prisma.photo.findMany({
    where: {
      userId: userId,
      galleries: {
        some: {},
      },
    },
    include: {
      galleries: {
        select: { galleryId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Formatage des données pour le client
  const photos = rawPhotos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    title: photo.title,
    createdAt: photo.createdAt,
    // On extrait l'ID via la bonne relation
    galleryId: photo.galleries?.[0]?.galleryId || null,
  }));

  return <PhotosClient photos={photos} galleries={galleries} />;
}
