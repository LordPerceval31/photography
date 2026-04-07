import BackgroundWrapper from "./BackgroundWrapper";
import { notFound } from "next/navigation";
import prisma from "../lib/prisma";

export const revalidate = 3600;

const GalleryPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  // 1. On "déballe" les params avec await
  const { domain } = await params;

  // 2. On utilise la variable "domain" dans la requête
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ subdomain: domain }, { customDomain: domain }],
    },
  });

  // 3. Si le domaine ne correspond à aucun compte, on affiche une page 404
  if (!user) {
    return notFound();
  }

  return (
    <main className="min-h-screen w-full bg-dark relative">
      <BackgroundWrapper userId={user.id} />
    </main>
  );
};

export default GalleryPage;
