import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getUserByDomain } from "@/app/lib/getUserByDomain";

export const revalidate = 3600;

export const metadata: Metadata = { title: "À propos" };

const templateMap: Record<
  string,
  () => Promise<{ default: ComponentType<{ userId: string }> }>
> = {
  premium: () => import("../templates/premium/about/index"),
};

const AboutPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return notFound();

  const slug = user.activeTemplate?.slug;
  if (!slug || !templateMap[slug]) return notFound();

  const { default: TemplatePage } = await templateMap[slug]();

  return <TemplatePage userId={user.id} />;
};

export default AboutPage;
