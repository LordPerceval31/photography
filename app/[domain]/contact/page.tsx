import { notFound, redirect } from "next/navigation";
import type { ComponentType } from "react";
import { getUserByDomain } from "@/app/lib/getUserByDomain";

export const revalidate = 3600;

// Templates ayant une page /contact dédiée.
// Les autres (premium, one-page) redirigent vers /.
const templateMap: Record<
  string,
  () => Promise<{ default: ComponentType<{ userId: string }> }>
> = {
  "two-pages": () => import("../templates/two-pages/contact/index"),
  "three-pages": () => import("../templates/three-pages/contact/index"),
};

const Contact = async ({ params }: { params: Promise<{ domain: string }> }) => {
  const { domain } = await params;
  const user = await getUserByDomain(domain);

  if (!user) return notFound();

  const slug = user.activeTemplate?.slug;

  if (!slug || !templateMap[slug]) return redirect("/");

  const { default: TemplatePage } = await templateMap[slug]();

  return <TemplatePage userId={user.id} />;
};

export default Contact;
