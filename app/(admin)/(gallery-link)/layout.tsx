import type { ReactNode } from "react";
import Image from "next/image";

// Layout identique à (auth)/layout.tsx mais SANS PageTransition
// La page galerie est accédée directement par les clients via un lien —
// FrozenRouter gèle un contexte invalide sur un chargement direct, rien ne s'affiche.
export default function GalleryLinkLayout({ children }: { children: ReactNode }) {
  return (
    <section
      data-theme="dark"
      className="relative flex items-center justify-center h-screen bg-cream px-6 tablet:px-16 overflow-hidden"
    >
      <Image
        src="/contactImage.webp"
        alt="image de fond"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute top-1/4 -left-20 w-72 h-72 tablet:w-96 tablet:h-96 4k:w-175 4k:h-175 rounded-full bg-blue/20 blur-[80px] 4k:blur-[160px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 tablet:w-96 tablet:h-96 4k:w-175 4k:h-175 rounded-full bg-blue/15 blur-[100px] 4k:blur-[180px] pointer-events-none z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 4k:w-90 4k:h-90 rounded-full bg-cream/5 blur-[60px] 4k:blur-[130px] pointer-events-none z-10" />

      <div className="glass-card relative z-20 w-full max-w-lg tablet:max-w-xl laptop:max-w-2xl 2k:max-w-3xl 4k:max-w-6xl rounded-2xl p-8 tablet:p-12 2k:p-16 4k:p-24">
        {children}
      </div>
    </section>
  );
}
