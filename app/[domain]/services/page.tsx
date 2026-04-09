import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import prisma from "../lib/prisma";
import ContactSection from "./ContactSection";
import ServicesSection from "./ServicesSection";

export const metadata: Metadata = { title: "Services" };
export const revalidate = 3600;

const ServicePage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  const { domain } = await params;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ subdomain: domain }, { customDomain: domain }],
    },
  });

  if (!user) return notFound();

  const services = await prisma.service.findMany({
    where: { userId: user.id },
    orderBy: { order: "asc" },
  });

  return (
    <main className="relative w-full min-h-screen flex flex-col">
      {/* === 1. LE BACKGROUND GLOBAL (Fixé derrière) === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/contactImage.webp"
          alt="Fond de la page Service"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Blobs décoratifs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 tablet:w-96 tablet:h-96 4k:w-175 4k:h-175 rounded-full bg-blue/20 blur-[80px] 4k:blur-[160px]" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 tablet:w-96 tablet:h-96 4k:w-175 4k:h-175 rounded-full bg-blue/15 blur-[100px] 4k:blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 4k:w-90 4k:h-90 rounded-full bg-cream/5 blur-[60px] 4k:blur-[130px]" />
      </div>

      {/* === 2. LE CONTENU DE LA PAGE (Qui scrolle par-dessus) === */}
      <div className="relative z-10 w-full flex flex-col">
        <ServicesSection services={services} />
        {/* 👇 On prévient la section contact si elle est toute seule 👇 */}
        <ContactSection hasNoCards={services.length === 0} />
      </div>
    </main>
  );
};

export default ServicePage;
