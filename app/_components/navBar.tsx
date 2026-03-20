"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const iconClasses =
    "w-7 h-7 tablet:w-10 tablet:h-10 laptop:w-7 laptop:h-7 desktop:w-8 desktop:h-8 2k:w-10 2k:h-10 4k:w-16 4k:h-16 ultrawide:w-16 ultrawide:h-16";

  const textClasses =
    "font-semibold tracking-wide text-xs tablet:text-lg laptop:text-lg desktop:text-lg 2k:text-lg 4k:text-4xl ultrawide:text-4xl";

  // 1. LES HAUTEURS
  const heightClasses =
    "h-12 tablet:h-16 laptop:h-12 desktop:h-14 2k:h-16 4k:h-24 ultrawide:h-24";

  // 2. LES LARGEURS FERMÉES
  const widthClosed =
    "w-12 tablet:w-16 laptop:w-12 desktop:w-14 2k:w-16 4k:w-24 ultrawide:w-24";

  // 3. LES LARGEURS OUVERTES
  const widthOpen =
    "w-[260px] tablet:w-[420px] laptop:w-[380px] desktop:w-[460px] 2k:w-[460px] 4k:w-[760px] ultrawide:w-[760px]";

  // 4. LE GAP SUR MESURE
  const gapClasses =
    "gap-5 tablet:gap-8 laptop:gap-8 desktop:gap-12 2k:gap-12 4k:gap-14 ultrawide:gap-14";

  return (
    <nav>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center

    /* TAILLE DU GLASSMORPHING */
    ${heightClasses}
    ${isOpen ? widthOpen : widthClosed}

    /* EFFET VERRE ET BORDURES */
    rounded-full
    bg-cream/5 backdrop-blur-[3px]
    border border-cream/30
    shadow-[inset_0_0_0_2px_rgba(0,0,0,0.4),0_8px_32px_0_rgba(0,0,0,0.2)]
    
    text-cream transition-all duration-300 ease-in-out active:scale-95 overflow-hidden`}
      >
        {/* L'icône MENU (visible quand fermé) */}
        <div
          className={`cursor-pointer absolute flex items-center justify-center transition-all duration-300 ease-in-out ${
            isOpen
              ? "opacity-0 scale-50 pointer-events-none"
              : "opacity-100 scale-100 rotate-0"
          }`}
        >
          <Menu className={iconClasses} strokeWidth={1} />
        </div>

        {/* LES MOTS + LA CROIX (visibles quand ouvert) */}
        <div
          className={`absolute flex items-center justify-center transition-all duration-300 ease-in-out w-full px-4 tablet:px-8
          ${gapClasses} 
          ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-150 pointer-events-none"}`}
        >
          <Link
            href="/about"
            className={`${textClasses} hover:text-cream transition-colors`}
          >
            About
          </Link>
          <Link
            href="/gallery"
            className={`${textClasses} hover:text-cream transition-colors`}
          >
            Gallery
          </Link>
          <Link
            href="/contact"
            className={`${textClasses} hover:text-cream transition-colors`}
          >
            Contact
          </Link>

          {/* LA CROIX (strictement redimensionnée selon les écrans) */}
          <span onClick={() => setIsOpen(false)}>
            <X
              className="text-cream/60 hover:text-cream transition-colors cursor-pointer w-4 h-4 tablet:w-5 tablet:h-5 laptop:w-4 laptop:h-4 desktop:w-5 desktop:h-5 2k:w-6 2k:h-6 4k:w-8 4k:h-8 ultrawide:w-8 ultrawide:h-8"
              strokeWidth={2}
            />
          </span>
        </div>
      </button>
    </nav>
  );
};

export default NavBar;
