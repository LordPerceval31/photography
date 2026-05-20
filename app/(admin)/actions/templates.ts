"use server";

import prisma from "@/app/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Retourne tous les templates disponibles avec leur statut pour le user connecté
export async function getTemplatesForUser() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" as const };

  const userId = session.user.id;

  const [allTemplates, user, siteConfig] = await Promise.all([
    prisma.template.findMany({ orderBy: { price: "asc" } }),
    prisma.user.findUnique({
      where: { id: userId },
      include: { purchasedTemplates: true },
    }),
    prisma.siteConfig.findUnique({
      where: { userId },
      select: { templateConfig: true },
    }),
  ]);

  if (!user) return { error: "Utilisateur introuvable" as const };

  const templates = allTemplates.map((template) => ({
    ...template,
    isPurchased: user.purchasedTemplates.some((p) => p.templateId === template.id),
    isActive: user.activeTemplateId === template.id,
  }));

  const currentThemeSlug =
    (siteConfig?.templateConfig as { themeSlug?: string } | null)?.themeSlug ?? "default";

  return { success: true as const, templates, currentThemeSlug };
}

// Active un template déjà acheté par le user
export async function activateTemplate(templateId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" as const };

  const userId = session.user.id;

  // Vérification de sécurité : le user doit avoir acheté ce template
  const purchase = await prisma.userTemplate.findUnique({
    where: {
      userId_templateId: { userId, templateId },
    },
  });

  if (!purchase) return { error: "Template non acheté" as const };

  await prisma.user.update({
    where: { id: userId },
    data: { activeTemplateId: templateId },
  });

  revalidatePath("/dashboard/templates");
  return { success: true as const };
}

// Active un template ET sauvegarde le thème choisi
export async function configureTemplate(templateId: string, themeSlug: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" as const };

  const userId = session.user.id;

  const purchase = await prisma.userTemplate.findUnique({
    where: { userId_templateId: { userId, templateId } },
  });

  if (!purchase) return { error: "Template non acheté" as const };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { activeTemplateId: templateId },
    }),
    prisma.siteConfig.upsert({
      where: { userId },
      update: { templateConfig: { themeSlug } },
      create: { userId, templateConfig: { themeSlug } },
    }),
  ]);

  revalidatePath("/dashboard/templates");
  return { success: true as const };
}
