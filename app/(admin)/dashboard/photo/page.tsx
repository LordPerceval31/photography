import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { optimizeCloudinaryUrl } from "@/app/lib/cloudinary-url";
import { PhotoSlot } from "@/app/_components/PhotoSlot";
import { GalleryUpload } from "@/app/_components/GalleryUpload";

export const dynamic = "force-dynamic";

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

  if (!userCredentials?.cloudinaryName || !userCredentials?.cloudinaryKey) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <p className="text-red-400 text-sm font-medium">
            Configure ton compte Cloudinary.
          </p>
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 border border-cream/20 text-cream/70 uppercase tracking-widest text-xs"
          >
            Paramètres →
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
      <div className="flex flex-col gap-4 mb-4 px-4 tablet:px-6 laptop:px-0">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-cream/50 hover:text-cream transition-colors w-max"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="uppercase tracking-widest text-[10px] laptop:text-xs font-medium">
            Retour au dashboard
          </span>
        </Link>
        <h1 className="font-bold text-cream tracking-wide text-center laptop:self-center text-xl tablet:text-2xl desktop:text-3xl laptop:mb-6">
          Configuration des photos de la vitrine
        </h1>
      </div>

      {/* CONTENEUR CENTRAL */}
      <div className="flex flex-col items-center justify-start w-full h-full gap-12 laptop:gap-16 pb-20 overflow-y-auto no-scrollbar">
        {/* 1. LIGNE COVER (RÉFÉRENCE) */}
        <div className="flex flex-col laptop:flex-row items-center justify-between w-full max-w-[90%] laptop:max-w-[75%] desktop:max-w-[70%]">
          <p className="text-center laptop:text-left italic font-light text-cream/60 text-sm laptop:text-base leading-relaxed">
            Photo principale de présentation du site.
          </p>
          <div className="flex flex-col items-center gap-1 w-[70vw] tablet:w-[50vw] laptop:w-55 desktop:w-87.5 2k:w-100 ultrawide:w-100 4k:w-175">
            <p className="text-[10px] uppercase tracking-widest text-cream/30">
              Couverture (16:9)
            </p>
            <PhotoSlot
              slot="isCover"
              aspectRatio="aspect-video"
              currentUrl={coverUrl}
            />
          </div>
        </div>

        {/* 2. PORTRAIT */}
        <div className="flex flex-col laptop:flex-row items-center justify-between w-full max-w-[90%] laptop:max-w-[75%] desktop:max-w-[70%]">
          <p className="text-center laptop:text-left italic font-light text-cream/60 text-sm laptop:text-base leading-relaxed">
            Portrait affiché dans la page About.
          </p>
          <div className="flex flex-col items-center gap-1 w-[35vw] tablet:w-[25vw] laptop:w-25 desktop:w-40 2k:w-45 ultrawide:w-50 4k:w-75">
            <p className="text-[10px] uppercase tracking-widest text-cream/30">
              Profil
            </p>
            <PhotoSlot
              slot="isPortrait"
              aspectRatio="aspect-3/4"
              currentUrl={portraitUrl}
            />
          </div>
        </div>

        {/* 3. ABOUT (x3) */}
        <div className="flex flex-col laptop:flex-row items-center justify-between gap-4 w-full max-w-[90%] laptop:max-w-[75%] desktop:max-w-[70%]">
          <p className="text-center laptop:text-left italic font-light text-cream/60 text-sm laptop:text-base leading-relaxed">
            Images illustratives en bas de la page About.
          </p>
          <div className="flex flex-col items-center gap-1 w-[80vw] tablet:w-[60vw] laptop:w-82.5 desktop:w-100 2k:w-125 ultrawide:w-150 4k:w-225">
            <p className="text-[10px] uppercase tracking-widest text-cream/30">
              About (x3)
            </p>
            <div className="grid grid-cols-3 gap-4 w-full">
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

        {/* 4. SECTION GALERIE - COPIE CONFORME DES DIMENSIONS DE LA COVER */}
        <div className="flex flex-col laptop:flex-row items-center laptop:items-start justify-between w-full max-w-[90%] laptop:max-w-[75%] desktop:max-w-[70%] gap-8">
          <p className="text-center laptop:text-left italic font-light text-cream/60 text-sm laptop:text-base leading-relaxed laptop:pt-12">
            Ajouter une photo à l&apos;une de vos galeries.
          </p>

          {/* L'enveloppe ci-dessous utilise tes classes au pixel près */}
          <div className="flex flex-col items-center gap-1 w-[70vw] tablet:w-[50vw] laptop:w-55 desktop:w-87.5 2k:w-100 ultrawide:w-100 4k:w-175">
            <p className="text-[10px] uppercase tracking-widest text-cream/30">
              Galerie
            </p>
            <GalleryUpload galleries={galleries} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPhotoPage;
