"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavbar } from "./NavbarContext";
import posthog from "posthog-js";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const { isNavbarVisible } = useNavbar();

  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentTheme = entry.target.getAttribute("data-theme");
            if (currentTheme) setTheme(currentTheme);
          }
        });
      },
      { rootMargin: "-10% 0px -90% 0px" },
    );

    const timer = setTimeout(() => {
      const sections = document.querySelectorAll("[data-theme]");
      sections.forEach((section) => observer.observe(section));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  const iconClasses =
    "w-7 h-7 tablet:w-10 tablet:h-10 laptop:w-7 laptop:h-7 desktop:w-8 desktop:h-8 2k:w-10 2k:h-10 4k:w-16 4k:h-16 ultrawide:w-16 ultrawide:h-16";
  const textClasses =
    "font-semibold tracking-wide text-xs tablet:text-lg laptop:text-lg desktop:text-lg 2k:text-lg 4k:text-4xl ultrawide:text-4xl";
  const heightClasses =
    "h-12 tablet:h-16 laptop:h-12 desktop:h-14 2k:h-16 4k:h-24 ultrawide:h-24";
  const widthClosed =
    "w-12 tablet:w-16 laptop:w-12 desktop:w-14 2k:w-16 4k:w-24 ultrawide:w-24";
  const widthOpen =
    "w-[320px] tablet:w-[480px] laptop:w-[470px] desktop:w-[550px] 2k:w-[560px] 4k:w-[900px] ultrawide:w-[860px]";
  const gapClasses =
    "gap-5 tablet:gap-8 laptop:gap-8 desktop:gap-12 2k:gap-12 4k:gap-14 ultrawide:gap-14";

  const textColor = theme === "dark" ? "text-cream" : "text-dark";
  const borderColor = theme === "dark" ? "border-cream/30" : "border-dark/20";
  const bgColor = theme === "dark" ? "bg-cream/5" : "bg-dark/5";
  const iconHover =
    theme === "dark" ? "hover:text-cream/70" : "hover:text-zinc-600";
  const closeIconColor =
    theme === "dark"
      ? "text-cream/60 hover:text-cream"
      : "text-zinc-500 hover:text-dark";
  const shadowClasses =
    theme === "dark"
      ? "shadow-[inset_0_0_0_2px_rgba(0,0,0,0.4),0_8px_32px_0_rgba(0,0,0,0.2)]"
      : "shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]";

  if (!isNavbarVisible) return null;

  return (
    <div
      className="fixed z-50 right-6 tablet:right-10
        laptop:right-auto laptop:left-1/2 laptop:-translate-x-1/2
        top-6 tablet:top-10 laptop:top-6 2k:top-12 4k:top-16"
    >
      <nav>
        <div
          className={`relative flex items-center justify-center transition-all duration-300 ease-in-out overflow-hidden rounded-full
            backdrop-blur-[3px] border 
            ${textColor} ${borderColor} ${bgColor} ${shadowClasses}
            ${heightClasses}
            ${isOpen ? widthOpen : widthClosed}`}
        >
          <button
            onClick={() => setIsOpen(true)}
            className={`absolute flex items-center justify-center transition-all duration-300 ease-in-out active:scale-95 ${
              isOpen
                ? "opacity-0 scale-50 pointer-events-none"
                : "opacity-100 scale-100"
            }`}
          >
            <Menu className={iconClasses} strokeWidth={1} />
          </button>

          <div
            className={`flex items-center justify-center w-full px-4 tablet:px-8 transition-all duration-300 ease-in-out
            ${gapClasses} 
            ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-150 pointer-events-none"}`}
          >
            <Link
              href="/"
              onClick={() => { setIsOpen(false); posthog.capture("nav_link_clicked", { destination: "home" }); }}
              className={`${textClasses} ${iconHover} transition-colors`}
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => { setIsOpen(false); posthog.capture("nav_link_clicked", { destination: "about" }); }}
              className={`${textClasses} ${iconHover} transition-colors`}
            >
              About
            </Link>
            <Link
              href="/gallery"
              onClick={() => { setIsOpen(false); posthog.capture("nav_link_clicked", { destination: "gallery" }); }}
              className={`${textClasses} ${iconHover} transition-colors`}
            >
              Gallery
            </Link>
            <Link
              href="/services"
              onClick={() => { setIsOpen(false); posthog.capture("nav_link_clicked", { destination: "services" }); }}
              className={`${textClasses} ${iconHover} transition-colors`}
            >
              Services
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center active:scale-90"
            >
              <X
                className={`${closeIconColor} transition-colors cursor-pointer w-4 h-4 tablet:w-5 tablet:h-5 laptop:w-4 laptop:h-4 desktop:w-5 desktop:h-5 2k:w-6 2k:h-6 4k:w-8 4k:h-8 ultrawide:w-8 ultrawide:h-8`}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
