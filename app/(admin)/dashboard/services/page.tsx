import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ServicesClient from "./ServicesClient";
import prisma from "@/app/lib/prisma";

export const metadata: Metadata = {
  title: "Services",
};

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Vérifie que Cloudinary est configuré avant de permettre l'upload
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      cloudinaryName: true,
      cloudinaryKey: true,
      cloudinarySecret: true,
    },
  });

  const cloudinaryReady =
    !!user?.cloudinaryName && !!user?.cloudinaryKey && !!user?.cloudinarySecret;

  if (!cloudinaryReady) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <p className="text-red-400 text-sm tablet:text-base 2k:text-xl font-medium">
            Configure ton compte Cloudinary avant d&apos;ajouter des services.
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

  const services = await prisma.service.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      photoUrl: true,
      photoPublicId: true,
      order: true,
    },
  });

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col shrink-0 gap-1 tablet:gap-2 desktop:gap-4 4k:gap-8 mb-8 tablet:mb-12 laptop:mb-10 px-4 tablet:px-6 laptop:px-0 w-full">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-cream/50 hover:text-cream transition-colors w-max"
        >
          <ArrowLeft className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-4 desktop:w-4 desktop:h-5 2k:w-6 2k:h-6 ultrawide:w-8 ultrawide:h-8 4k:w-10 4k:h-10 transition-transform group-hover:-translate-x-1" />
          <span className="uppercase tracking-widest text-[8px] tablet:text-[10px] laptop:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl font-medium cursor-pointer">
            Retour au dashboard
          </span>
        </Link>
        <h1 className="font-bold text-cream tracking-wide text-center cursor-default laptop:self-center w-[90%] tablet:w-[80%] laptop:w-[70%] text-xl tablet:text-2xl laptop:text-2xl desktop:text-3xl 2k:text-4xl ultrawide:text-4xl 4k:text-7xl laptop:mb-6 desktop:mb-8 2k:mb-12 ultrawide:mb-14 4k:mb-20">
          Mes services
        </h1>
      </div>

      <ServicesClient initialServices={services} />
    </div>
  );
}
