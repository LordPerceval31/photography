import BioSection from "./BioSection";
import PictureAboutWrapper from "./PictureAboutWrapper";
import StorySection from "./StorySection";
import prisma from "../lib/prisma";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const AboutPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  // 2. On "déballe" les params avec await
  const { domain } = await params;

  // 3. On utilise la variable "domain" dans la requête
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ subdomain: domain }, { customDomain: domain }],
    },
  });

  // 4. Si le domaine ne correspond à aucun compte, on affiche une page 404
  if (!user) {
    return notFound();
  }

  return (
    <main className="relative w-full bg-cream">
      <BioSection userId={user.id} />
      <StorySection userId={user.id} />
      <PictureAboutWrapper userId={user.id} />
    </main>
  );
};

export default AboutPage;
