import Image from "next/image";
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import prisma from "../lib/prisma";
import { optimizeCloudinaryUrl } from "../lib/cloudinary-url";
import { logout } from "../(admin)/actions/auth";

interface DashboardOverviewProps {
  userId: string;
}

export const DashboardOverview = async ({ userId }: DashboardOverviewProps) => {
  const recentPhotos = await prisma.photo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const recentGalleries = await prisma.gallery.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="w-full flex flex-col items-center laptop:items-start gap-10 laptop:gap-4 desktop:gap-8 2k:gap-12 4k:gap-20">
      {/* --- BOUTON PARAMÈTRES --- */}
      <Link
        href="/dashboard/settings"
        className="absolute top-6 right-6 desktop:top-10 desktop:right-10 2k:top-14 2k:right-14 ultrawide:top-16 ultrawide:right-16 4k:top-20 4k:right-20 flex items-center gap-3 desktop:gap-4 4k:gap-10 text-cream/30 hover:text-cream transition-all duration-300 group z-100 cursor-pointer hover:-translate-y-1 active:translate-y-0 active:scale-95"
      >
        <span className="hidden laptop:block uppercase tracking-[0.4em] text-[10px] desktop:text-xs 2k:text-base ultrawide:text-xl 4k:text-2xl font-medium">
          Paramètres
        </span>
        <Settings className="w-5 h-5 desktop:w-7 desktop:h-7 2k:w-10 2k:h-10 ultrawide:w-10 ultrawide:h-10 4k:w-12 4k:h-12 group-hover:rotate-90 transition-transform duration-500" />
      </Link>

      {/* --- BOUTON DÉCONNEXION --- */}
      <form
        action={logout}
        className="absolute bottom-6 right-6 desktop:bottom-10 desktop:right-10 2k:bottom-14 2k:right-14 ultrawide:bottom-16 ultrawide:right-16 4k:bottom-20 4k:right-20 z-100"
      >
        <button
          type="submit"
          className="flex items-center gap-3 desktop:gap-4 4k:gap-10 text-cream/30 hover:text-cream transition-all duration-300 group cursor-pointer hover:-translate-y-1 active:translate-y-0 active:scale-95"
        >
          <span className="hidden laptop:block uppercase tracking-[0.4em] text-[10px] desktop:text-xs 2k:text-base ultrawide:text-xl 4k:text-2xl font-medium">
            Déconnexion
          </span>
          <LogOut className="w-5 h-5 desktop:w-7 desktop:h-7 2k:w-10 2k:h-10 ultrawide:w-10 ultrawide:h-10 4k:w-12 4k:h-12 group-hover:translate-x-2 transition-transform duration-300" />
        </button>
      </form>

      {/* TITRE */}
      <div className="w-[80vw] laptop:w-full">
        <h1 className="text-xl desktop:text-3xl 2k:text-5xl 4k:text-7xl font-bold text-cream cursor-default">
          Mon tableau de bord
        </h1>
      </div>

      {/* SECTION 1 : ACTIONS RAPIDES */}
      <div className="grid grid-cols-2 tablet:flex tablet:flex-row w-[80vw] tablet:w-[80%] gap-4 tablet:gap-6 desktop:gap-10 2k:gap-16 4k:gap-20">
        <Link
          href="/dashboard/photo"
          className="group w-full laptop:w-auto laptop:flex-none laptop:h-[18vh] desktop:h-[18vh] 4k:h-[18vh] aspect-square flex flex-col items-center justify-center glass-card rounded-xl border border-cream/20 hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 active:scale-95 active:shadow-md cursor-pointer"
        >
          <h2 className=" text-sm laptop:text-sm desktop:text-xl 2k:text-3xl 4k:text-5xl font-bold text-cream tracking-[0.2em]">
            PHOTOS
          </h2>
          <span className="mt-2 desktop:mt-4 2k:mt-6 4k:mt-10 px-3 py-1 laptop:px-4 desktop:px-6 2k:px-8 4k:px-12 desktop:py-2 2k:py-3 4k:py-5 border border-cream/30 rounded-full text-cream/70 text-[10px] desktop:text-xs 2k:text-sm 4k:text-xl uppercase tracking-widest group-hover:text-cream transition-all">
            + Ajouter
          </span>
        </Link>

        <Link
          href="/dashboard/gallery"
          className="group w-full laptop:w-auto laptop:flex-none laptop:h-[18vh] desktop:h-[18vh] 4k:h-[18vh] aspect-square flex flex-col items-center justify-center glass-card rounded-xl border border-cream/20 hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 active:scale-95 active:shadow-md cursor-pointer"
        >
          <h2 className=" text-sm laptop:text-sm desktop:text-xl 2k:text-3xl 4k:text-5xl font-bold text-cream tracking-[0.2em]">
            GALLERY
          </h2>
          <span className="mt-2 desktop:mt-4 2k:mt-6 4k:mt-10 px-3 py-1 laptop:px-4 desktop:px-6 2k:px-8 4k:px-12 desktop:py-2 2k:py-3 4k:py-5 border border-cream/30 rounded-full text-cream/70 text-[10px] desktop:text-xs 2k:text-sm 4k:text-xl uppercase tracking-widest group-hover:text-cream transition-all">
            + Ajouter
          </span>
        </Link>

        <Link
          href="/dashboard/vitrine"
          className="group w-full laptop:w-auto laptop:flex-none laptop:h-[18vh] desktop:h-[18vh] 4k:h-[18vh] aspect-square flex flex-col items-center justify-center glass-card rounded-xl border border-cream/20 hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 active:scale-95 active:shadow-md cursor-pointer"
        >
          <h2 className="text-sm laptop:text-sm desktop:text-xl 2k:text-3xl 4k:text-5xl font-bold text-cream tracking-[0.2em]">
            TEXTES
          </h2>
          <span className="mt-2 desktop:mt-4 2k:mt-6 4k:mt-10 px-3 py-1 laptop:px-4 desktop:px-6 2k:px-8 4k:px-12 desktop:py-2 2k:py-3 4k:py-5 border border-cream/30 rounded-full text-cream/70 text-[10px] desktop:text-xs 2k:text-sm 4k:text-xl uppercase tracking-widest group-hover:text-cream transition-all">
            Modifier
          </span>
        </Link>

        <Link
          href="/dashboard/services"
          className="group w-full laptop:w-auto laptop:flex-none laptop:h-[18vh] desktop:h-[18vh] 4k:h-[18vh] aspect-square flex flex-col items-center justify-center glass-card rounded-xl border border-cream/20 hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 active:scale-95 active:shadow-md cursor-pointer"
        >
          <h2 className="text-sm laptop:text-sm desktop:text-xl 2k:text-3xl 4k:text-5xl font-bold text-cream tracking-[0.2em]">
            SERVICES
          </h2>
          <span className="mt-2 desktop:mt-4 2k:mt-6 4k:mt-10 px-3 py-1 laptop:px-4 desktop:px-6 2k:px-8 4k:px-12 desktop:py-2 2k:py-3 4k:py-5 border border-cream/30 rounded-full text-cream/70 text-[10px] desktop:text-xs 2k:text-sm 4k:text-xl uppercase tracking-widest group-hover:text-cream transition-all">
            + Ajouter
          </span>
        </Link>
      </div>

      {/* SECTION 2 : PHOTOS RÉCENTES */}
      <div className="flex flex-col w-[80vw] laptop:w-full gap-4 laptop:gap-2 desktop:gap-4 2k:gap-6 4k:gap-10">
        <h3 className="text-xs desktop:text-sm 2k:text-base 4k:text-2xl font-medium text-cream/70 uppercase tracking-[0.2em] cursor-default">
          Dernières photos ajoutées
        </h3>
        <div className="grid grid-cols-2 laptop:flex laptop:flex-row gap-4 desktop:gap-6 2k:gap-8 4k:gap-12">
          {recentPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative aspect-square laptop:h-[13vh] desktop:h-[12vh] 2k:h-[13vh] 4k:h-[14vh] glass-card rounded-xl overflow-hidden border border-cream/20"
            >
              <Image
                src={optimizeCloudinaryUrl(photo.url)}
                alt="photo"
                fill
                sizes="15vw"
                className="object-cover"
                priority={index < 2}
              />
            </div>
          ))}
          <Link
            href="/dashboard/photos"
            className="col-span-2 laptop:col-auto p-4 laptop:h-[13vh] desktop:h-[12vh] 2k:h-[13vh] 4k:h-[14vh] laptop:aspect-square flex items-center justify-center glass-card rounded-xl border border-cream/20 hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 active:scale-95 active:shadow-sm group cursor-pointer"
          >
            <span className="text-cream/70 text-[10px] desktop:text-xs 2k:text-sm 4k:text-xl uppercase tracking-widest group-hover:text-cream text-center">
              Voir toutes <br className="hidden laptop:block" /> les photos
            </span>
          </Link>
        </div>
      </div>

      {/* SECTION 3 : GALERIES RÉCENTES */}
      <div className="flex flex-col w-[80vw] laptop:w-full gap-3 4k:gap-10 mb-12 laptop:mb-0">
        <h3 className="text-xs desktop:text-sm 2k:text-base 4k:text-2xl font-medium text-cream/70 uppercase tracking-[0.2em] cursor-default">
          Dernières galeries
        </h3>
        <div className="flex flex-col gap-3 4k:gap-8 w-full laptop:max-w-sm desktop:max-w-xl 2k:max-w-2xl 4k:max-w-4xl">
          {recentGalleries.map((gallery) => (
            <div
              key={gallery.id}
              className="flex items-center p-4 laptop:p-2 desktop:p-4 2k:p-4 4k:p-8 glass-card rounded-xl border border-cream/20 cursor-default"
            >
              <span className="text-sm desktop:text-lg 2k:text-xl 4k:text-4xl font-medium text-cream truncate">
                {gallery.name}
              </span>
            </div>
          ))}
          <Link
            href="/dashboard/galleries"
            className="group w-full p-4 desktop:p-5 2k:p-6 4k:p-10 glass-card rounded-xl border border-cream/20 flex justify-center hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:scale-[0.98] active:shadow-sm cursor-pointer"
          >
            <span className="text-cream/70 text-[10px] desktop:text-xs 2k:text-sm 4k:text-xl uppercase tracking-widest group-hover:text-cream">
              Voir toutes les galeries
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
