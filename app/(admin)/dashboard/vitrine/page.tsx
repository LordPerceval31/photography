import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import VitrineClient from "./VitrineClient";
import prisma from "@/app/lib/prisma";
import { VitrineData } from "../../actions/updateVitrine";

export const metadata: Metadata = {
  title: "Vitrine",
};

export default async function VitrinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
      seoTitle: true,
      seoDescription: true,
    },
  });

  const formattedConfig: VitrineData | null = config
    ? {
        ...config,
        seoTitle: config.seoTitle ?? "",
        seoDescription: config.seoDescription ?? "",
      }
    : null;

  return <VitrineClient initialData={formattedConfig} />;
}
