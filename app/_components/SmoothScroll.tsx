"use client";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useRef } from "react";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenis = useLenis();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lenis) return;

    const handleSnap = () => {
      const sections = Array.from(
        document.querySelectorAll("[data-theme]"),
      ) as HTMLElement[];
      if (sections.length === 0) return;

      const viewportCenter = window.innerHeight / 2;
      let closestSection = sections[0];
      let minDistance = Infinity;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distanceToCenter = Math.abs(viewportCenter - sectionCenter);

        if (distanceToCenter < minDistance) {
          minDistance = distanceToCenter;
          closestSection = section;
        }
      });

      // Calcul pour centrer parfaitement la section, peu importe sa hauteur (90vh, 80vh, etc.)
      const offset = (window.innerHeight - closestSection.offsetHeight) / 2;

      lenis.scrollTo(closestSection, {
        offset: -offset, // On recule de la moitié du vide pour centrer
        lerp: 0.06,
        duration: 0,
        force: true,
      });
    };

    const onScroll = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleSnap();
      }, 150);
    };

    lenis.on("scroll", onScroll);

    return () => {
      lenis.off("scroll", onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lenis]);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
