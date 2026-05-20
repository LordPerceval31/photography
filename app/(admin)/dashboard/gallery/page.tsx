import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import GalleryClient from "./GalleryClient";
import prisma from "@/app/lib/prisma";
import { getCapabilities } from "@/app/lib/capabilities";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      cloudinaryName: true,
      cloudinaryKey: true,
      cloudinarySecret: true,
      activeTemplate: { select: { slug: true } },
    },
  });

  const cloudinaryReady =
    !!user?.cloudinaryName && !!user?.cloudinaryKey && !!user?.cloudinarySecret;

  if (!cloudinaryReady) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <p className="text-red-400 text-sm tablet:text-base 2k:text-xl font-medium">
            Configure ton compte Cloudinary avant de créer une galerie.
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

  const capabilities = getCapabilities(user?.activeTemplate?.slug);

  return <GalleryClient canShare={capabilities.shareGalleries} />;
}
