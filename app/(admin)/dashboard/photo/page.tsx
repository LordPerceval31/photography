import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { optimizeCloudinaryUrl } from "@/app/lib/cloudinary-url";
import { PhotoSlot } from "@/app/_components/PhotoSlot";
import { AddToGallerySlot } from "@/app/_components/AddToGallerySlot";

const AddPhotoPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userCredentials = await prisma.user.findUnique({
    where: { id: session.user.id },
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
            Configure ton compte Cloudinary avant d&apos;ajouter des photos.
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

  const galleries = await prisma.gallery.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  const photos = await prisma.photo.findMany({
    where: { userId: session.user.id },
    select: {
      url: true,
      isCover: true,
      isPortrait: true,
      isAboutPicture1: true,
      isAboutPicture2: true,
      isAboutPicture3: true,
    },
  });

  const coverUrl = optimizeCloudinaryUrl(
    photos.find((p) => p.isCover)?.url ?? "",
  );
  const portraitUrl = optimizeCloudinaryUrl(
    photos.find((p) => p.isPortrait)?.url ?? "",
  );
  const about1Url = optimizeCloudinaryUrl(
    photos.find((p) => p.isAboutPicture1)?.url ?? "",
  );
  const about2Url = optimizeCloudinaryUrl(
    photos.find((p) => p.isAboutPicture2)?.url ?? "",
  );
  const about3Url = optimizeCloudinaryUrl(
    photos.find((p) => p.isAboutPicture3)?.url ?? "",
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col gap-1 tablet:gap-2 desktop:gap-4 4k:gap-8 mb-4 tablet:mb-6 laptop:mb-2 px-4 tablet:px-6 laptop:px-0">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-cream/50 hover:text-cream transition-colors w-max"
        >
          <ArrowLeft className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-4 desktop:w-4 desktop:h-5 2k:w-6 2k:h-6 ultrawide:w-8 ultrawide:h-8 4k:w-10 4k:h-10 transition-transform group-hover:-translate-x-1" />
          <span className="uppercase tracking-widest text-[8px] tablet:text-[10px] laptop:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl font-medium cursor-pointer">
            Retour au dashboard
          </span>
        </Link>
        <h1
          className="font-bold text-cream tracking-wide text-center cursor-default laptop:self-center
        w-[90%] tablet:w-[80%] laptop:w-[70%]
        text-xl tablet:text-2xl laptop:text-2xl desktop:text-3xl 2k:text-4xl ultrawide:text-4xl 4k:text-7xl
         laptop:mb-6 desktop:mb-8 2k:mb-12 ultrawide:mb-14 4k:mb-20"
        >
          Configuration des photos de la vitrine
        </h1>
      </div>

      {/* CONTENEUR CENTRAL */}
      <div className="flex flex-col items-center justify-start w-full h-full gap-8 tablet:gap-12 laptop:gap-3 desktop:gap-4 2k:gap-8 4k:gap-10 pb-8 overflow-y-auto no-scrollbar cursor-default">
        {/* 1. LIGNE COVER (16:9) */}
        <div className="flex flex-col laptop:flex-row items-center justify-between w-full max-w-[90%] laptop:max-w-[75%] desktop:max-w-[70%]">
          <p className="text-center laptop:text-left italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl ultrawide:text-2xl 4k:text-4xl leading-relaxed">
            Photo principale de présentation du site, visible dès
            l&apos;sarrivée.
            <br className="hidden laptop:block" />
            Choisissez une photo impactante qui représente votre travail.
          </p>
          <div className="flex flex-col items-center gap-1 w-[70vw] tablet:w-[50vw] laptop:w-55 desktop:w-87.5 2k:w-100 ultrawide:w-100 4k:w-175">
            <p className="text-[8px] tablet:text-[10px] desktop:text-[10px] 2k:text-lg 4k:text-3xl uppercase tracking-widest text-cream/30">
              Couverture (16:9)
            </p>
            <PhotoSlot
              slot="isCover"
              aspectRatio="aspect-video"
              currentUrl={coverUrl}
            />
          </div>
        </div>

        {/* 2. LIGNE PORTRAIT (3:4) */}
        <div className="flex flex-col laptop:flex-row items-center justify-between w-full max-w-[90%] laptop:max-w-[75%] desktop:max-w-[70%]">
          <p className="text-center laptop:text-left italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl ultrawide:text-2xl 4k:text-4xl leading-relaxed">
            Portrait affiché dans la page About,
            <br className="hidden laptop:block" /> c&apos;est là que vous mettez
            votre plus belle photo.
          </p>
          <div className="flex flex-col items-center gap-1 w-[35vw] tablet:w-[25vw] laptop:w-25 desktop:w-40 2k:w-45 ultrawide:w-50 4k:w-75">
            <p className="text-[8px] tablet:text-[10px] desktop:text-[10px] 2k:text-lg 4k:text-3xl uppercase tracking-widest text-cream/30">
              Profil
            </p>
            <PhotoSlot
              slot="isPortrait"
              aspectRatio="aspect-3/4"
              currentUrl={portraitUrl}
            />
          </div>
        </div>

        {/* 3. LIGNE ABOUT (x3) */}
        <div className="flex flex-col laptop:flex-row items-center justify-between gap-4 laptop:gap-16 desktop:gap-20 2k:gap-32 w-full max-w-[90%] laptop:max-w-[75%] desktop:max-w-[70%]">
          <p className="text-center laptop:text-left italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl ultrawide:text-2xl 4k:text-4xl leading-relaxed">
            Images illustratives en bas de la page About,
            <br className="hidden laptop:block" /> quelques exemples de votre
            univers.
          </p>
          <div className="flex flex-col items-center gap-1 w-[80vw] tablet:w-[60vw] laptop:w-82.5 desktop:w-100 2k:w-125 ultrawide:w-150 4k:w-225">
            <p className="text-[8px] tablet:text-[10px] desktop:text-[10px] 2k:text-lg 4k:text-3xl uppercase tracking-widest text-cream/30">
              About (x3)
            </p>
            <div className="grid grid-cols-3 gap-2 tablet:gap-4 desktop:gap-4 2k:gap-6 4k:gap-12 w-full">
              <PhotoSlot
                slot="isAboutPicture1"
                aspectRatio="aspect-3/4"
                currentUrl={about1Url}
              />
              <PhotoSlot
                slot="isAboutPicture2"
                aspectRatio="aspect-3/4"
                currentUrl={about2Url}
              />
              <PhotoSlot
                slot="isAboutPicture3"
                aspectRatio="aspect-3/4"
                currentUrl={about3Url}
              />
            </div>
          </div>
        </div>

        {/* 4. AJOUTER UNE PHOTO À UNE GALERIE */}
        <div className="flex flex-col laptop:flex-row items-center justify-between w-full max-w-[90%] laptop:max-w-[75%] desktop:max-w-[70%] border-t border-cream/10 pt-8 gap-6">
          <p className="text-center laptop:text-left italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl ultrawide:text-2xl 4k:text-4xl leading-relaxed">
            Ajouter une photo à une galerie.
          </p>
          <div className="flex flex-col items-center gap-1 w-[70vw] tablet:w-[50vw] laptop:w-55 desktop:w-87.5 2k:w-100 ultrawide:w-100 4k:w-175">
            <p className="text-[8px] tablet:text-[10px] desktop:text-[10px] 2k:text-lg 4k:text-3xl uppercase tracking-widest text-cream/30">
              Galerie
            </p>
            <AddToGallerySlot galleries={galleries} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPhotoPage;
