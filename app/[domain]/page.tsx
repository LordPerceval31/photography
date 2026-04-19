import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getUserByDomain } from "@/app/lib/getUserByDomain";

export const revalidate = 3600;

// Registre des templates disponibles.
// Ajouter une entrée ici quand un nouveau template est créé.
const templateMap: Record<
  string,
  () => Promise<{ default: ComponentType<{ userId: string }> }>
> = {
  premium: () => import("./templates/premium/home/index"),
  "one-page": () => import("./templates/one-page/home/index"),
  "two-pages": () => import("./templates/two-pages/home/index"),
  "three-pages": () => import("./templates/three-pages/home/index"),
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return { title: "Portfolio introuvable" };

  const config = user.siteConfig;
  const seoTitle = config?.seoTitle || `${user.name || "Photographe"} | Portfolio`;
  const seoDescription =
    config?.seoDescription ||
    `Découvrez les galeries et le portfolio de ${user.name || "ce photographe"}.`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: `https://${domain}` },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `https://${domain}`,
      type: "website",
    },
  };
}

const Home = async ({ params }: { params: Promise<{ domain: string }> }) => {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return notFound();

  // Pas de fallback : si le template est absent ou inconnu → 404
  const slug = user.activeTemplate?.slug;
  if (!slug || !templateMap[slug]) return notFound();

  const config = user.siteConfig;
  const coverPhoto = user.photos[0];

  // Données structurées Schema.org pour le SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `https://${domain}`,
    name: config?.seoTitle || user.name || "Photographe",
    url: `https://${domain}`,
    image: coverPhoto?.url || user.image || "",
    description:
      config?.seoDescription || config?.bioParagraph1 || config?.heroTagline || "",
    ...(config?.heroTagline && { slogan: config.heroTagline }),
  };

  const { default: TemplatePage } = await templateMap[slug]();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TemplatePage userId={user.id} />
    </>
  );
};

export default Home;
