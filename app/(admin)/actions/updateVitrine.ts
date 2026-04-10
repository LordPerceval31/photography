"use server";

import prisma from "@/app/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type VitrineData = {
  heroSubtitle: string;
  heroName: string;
  heroTagline: string;
  bioTitle: string;
  bioParagraph1: string;
  bioParagraph2: string;
  storyParagraph1: string;
  storyParagraph2: string;
  darkQuote: string;
  darkQuoteAuthor: string;
};

export async function updateVitrineTexts(data: VitrineData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  const userId = session.user.id;

  try {
    await prisma.siteConfig.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId },
    });

    revalidatePath("/dashboard/vitrine");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erreur BDD" };
  }
}
