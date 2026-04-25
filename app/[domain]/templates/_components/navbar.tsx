// app/[domain]/templates/_components/Navbar.tsx
import Link from "next/link";
import type { ThemeFonts } from "@/app/[domain]/themes/fonts";

interface NavbarProps {
  fonts: ThemeFonts;
  showAbout?: boolean;
  isHome?: boolean; // 1. Ajout de la prop
}

export const Navbar = ({
  fonts,
  showAbout = false,
  isHome = false,
}: NavbarProps) => {
  return (
    <nav aria-label="Navigation principale" className="absolute top-0 w-full z-50">
      {/* 2. Le dégradé ne s'affiche que si isHome est true */}
      {isHome && (
        <div className="absolute top-0 left-0 right-0 h-32 tablet:h-48 laptop:h-64 bg-linear-to-b from-(--color-bg)/80 to-transparent pointer-events-none" />
      )}

      {/* Conteneur des liens */}
      <div className="relative flex justify-end px-8 py-6 tablet:px-10 tablet:py-8 laptop:px-12 laptop:py-10 desktop:px-16 desktop:py-12 2k:px-24 2k:py-16 4k:px-32 4k:py-20">
        <div
          // 3. L'ombre ne s'applique que si isHome est true
          className={`flex gap-6 tablet:gap-8 laptop:gap-10 desktop:gap-12 2k:gap-14 4k:gap-16 text-[10px] tablet:text-xs laptop:text-sm desktop:text-lg 2k:text-xl 4k:text-2xl tracking-[0.3em] uppercase text-(--color-primary) font-bold ${
            isHome ? "[text-shadow:1px_1px_0_rgba(0,0,0,0.5)]" : ""
          }`}
          style={{ fontFamily: fonts.body }}
        >
          <Link href="/" className="hover:opacity-50 transition-opacity">
            Accueil
          </Link>

          {showAbout && (
            <Link href="/about" className="hover:opacity-50 transition-opacity">
              À propos
            </Link>
          )}

          <Link href="/contact" className="hover:opacity-50 transition-opacity">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};
