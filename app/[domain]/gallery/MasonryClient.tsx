"use client";

import dynamic from "next/dynamic";
import { Item } from "../../lib/types";

// SSR désactivé : Masonry utilise useMedia + useMeasure qui retournent des valeurs
// par défaut côté serveur, causant une hydration mismatch.
const Masonry = dynamic(() => import("./background"), { ssr: false });

export default function MasonryClient({ items }: { items: Item[] }) {
  return <Masonry items={items} />;
}
