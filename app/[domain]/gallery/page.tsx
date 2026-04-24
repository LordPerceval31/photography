import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getUserByDomain } from "@/app/lib/getUserByDomain";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return { title: "Galeries" };

  const name = user.name || "ce photographe";
  const config = user.siteConfig;
  const title = `Galeries | ${config?.seoTitle || `${name} Photographe`}`;
  const description =
    config?.seoDescription ||
    `Parcourez les galeries photos de ${name} : portraits, paysages, reportages et bien plus.`;

  return {
    title,
    description,
    alternates: { canonical: `https://${domain}.photolio.fr/gallery` },
    openGraph: {
      title,
      description,
      url: `https://${domain}.photolio.fr/gallery`,
      type: "website",
    },
  };
}

const templateMap: Record<
  string,
  () => Promise<{ default: ComponentType<{ userId: string }> }>
> = {
  premium: () => import("../templates/premium/gallery/index"),
};

const GalleryPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return notFound();

  const slug = user.activeTemplate?.slug;
  if (!slug || !templateMap[slug]) return redirect("/");

  const { default: TemplatePage } = await templateMap[slug]();

  return <TemplatePage userId={user.id} />;
};

export default GalleryPage;
