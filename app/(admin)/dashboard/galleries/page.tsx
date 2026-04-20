import type { Metadata } from "next";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeries",
};
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GalleriesClient from "./GalleriesClient";
import prisma from "@/app/lib/prisma";
import { getCapabilities } from "@/app/lib/capabilities";

export default async function GalleriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeTemplate: { select: { slug: true } } },
  });

  const capabilities = getCapabilities(user?.activeTemplate?.slug);

  const galleries = await prisma.gallery.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      token: true,
      isPremium: true,
      photos: {
        where: { isGalleryCover: true },
        select: { photo: { select: { url: true } } },
        take: 1,
      },
    },
  });

  const data = galleries.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    token: g.token,
    isPremium: g.isPremium,
    coverUrl: g.photos[0]?.photo.url ?? null,
  }));

  return (
    <div className="w-full flex flex-col items-center gap-8 pb-20">
      <div className="w-full flex justify-start pl-4">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-cream/50 hover:text-cream transition-colors w-max"
        >
          <ArrowLeft className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-4 desktop:w-4 desktop:h-5 2k:w-6 2k:h-6 ultrawide:w-8 ultrawide:h-8 4k:w-10 4k:h-10 transition-transform group-hover:-translate-x-1" />
          <span className="uppercase tracking-widest text-[8px] tablet:text-[10px] laptop:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl font-medium cursor-pointer">
            Retour à l&apos;espace
          </span>
        </Link>
      </div>

      <h1 className="font-bold text-cream tracking-wide text-center cursor-default laptop:self-center w-[90%] tablet:w-[80%] laptop:w-[70%] text-xl tablet:text-2xl laptop:text-2xl desktop:text-3xl 2k:text-4xl ultrawide:text-4xl 4k:text-7xl laptop:mb-6 desktop:mb-8 2k:mb-12 ultrawide:mb-14 4k:mb-20">
        Toutes les galeries
      </h1>

      <GalleriesClient
        galleries={data}
        canShare={capabilities.shareGalleries}
      />
    </div>
  );
}
