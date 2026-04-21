import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Création du template premium (upsert = idempotent, peut être relancé sans risque)
  const premium = await prisma.template.upsert({
    where: { slug: "premium" },
    update: {},
    create: {
      slug: "premium",
      name: "Premium",
      price: 0,
      previewUrl: null,
    },
  });

  console.log(`✓ Template créé : ${premium.name} (id: ${premium.id})`);

  // Récupération de tous les users sans template actif
  const usersWithoutTemplate = await prisma.user.findMany({
    where: { activeTemplateId: null },
    select: { id: true },
  });

  console.log(`→ ${usersWithoutTemplate.length} users à migrer`);

  for (const user of usersWithoutTemplate) {
    // Créer l'achat du template premium
    await prisma.userTemplate.upsert({
      where: {
        userId_templateId: { userId: user.id, templateId: premium.id },
      },
      update: {},
      create: { userId: user.id, templateId: premium.id },
    });

    // Activer le template premium sur le compte
    await prisma.user.update({
      where: { id: user.id },
      data: { activeTemplateId: premium.id },
    });
  }

  console.log(
    `✓ Migration terminée — ${usersWithoutTemplate.length} users migrés`,
  );

  const onePage = await prisma.template.upsert({
    where: { slug: "one-page" },
    update: { name: "1 page" },
    create: { slug: "one-page", name: "1 page", price: 0, previewUrl: null },
  });
  console.log(`✓ Template créé : ${onePage.name} (id: ${onePage.id})`);

  const twoPages = await prisma.template.upsert({
    where: { slug: "two-pages" },
    update: { name: "2 pages" },
    create: {
      slug: "two-pages",
      name: "2 pages",
      price: 0,
      previewUrl: null,
    },
  });
  console.log(`✓ Template créé : ${twoPages.name} (id: ${twoPages.id})`);

  const threePages = await prisma.template.upsert({
    where: { slug: "three-pages" },
    update: { name: "3 pages" },
    create: {
      slug: "three-pages",
      name: "3 pages",
      price: 0,
      previewUrl: null,
    },
  });
  console.log(`✓ Template créé : ${threePages.name} (id: ${threePages.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
