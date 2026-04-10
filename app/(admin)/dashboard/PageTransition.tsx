"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useContext, useState } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});

  // On utilise useState pour stocker la valeur initiale du contexte
  // Cela garantit que la valeur reste "gelée" sans déclencher l'erreur de Render
  const [frozen] = useState(context);

  if (!LayoutRouterContext) return <>{children}</>;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "linear" }}
        className="w-full min-h-full"
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
