import type { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Vitrine",
};
import { redirect } from "next/navigation";
import VitrineClient from "./VitrineClient";
import prisma from "@/app/lib/prisma";

export default async function VitrinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Charge la config existante (null si l'utilisateur n'a jamais sauvegardé)
  const config = await prisma.siteConfig.findUnique({
    where: { userId: session.user.id },
    select: {
      heroSubtitle: true,
      heroName: true,
      heroTagline: true,
      bioTitle: true,
      bioParagraph1: true,
      bioParagraph2: true,
      storyParagraph1: true,
      storyParagraph2: true,
      darkQuote: true,
      darkQuoteAuthor: true,
    },
  });

  return <VitrineClient initialData={config} />;
}
