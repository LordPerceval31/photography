import Image from "next/image";
import prisma from "@/app/lib/prisma";
import ServicesSection from "./ServicesSection";
import ContactSection from "./ContactSection";
import NavBar from "@/app/_components/navBar";

interface Props {
  userId: string;
}

// Contenu visuel de la page services — template Premium
// Ce composant est async car il fetch les services en DB
// L'aiguilleur (app/[domain]/services/page.tsx) injecte userId
const PremiumServices = async ({ userId }: Props) => {
  const [services, user] = await Promise.all([
    prisma.service.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailjsServiceId: true,
        emailjsTemplateId: true,
        emailjsPublicKey: true,
      },
    }),
  ]);

  return (
    <main className="relative w-full min-h-screen flex flex-col">
      {/* Background fixé derrière le contenu */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/contactImage.webp"
          alt="Fond de la page Service"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 tablet:w-96 tablet:h-96 4k:w-175 4k:h-175 rounded-full bg-blue/20 blur-[80px] 4k:blur-[160px]" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 tablet:w-96 tablet:h-96 4k:w-175 4k:h-175 rounded-full bg-blue/15 blur-[100px] 4k:blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 4k:w-90 4k:h-90 rounded-full bg-cream/5 blur-[60px] 4k:blur-[130px]" />
      </div>

      {/* Contenu scrollable par-dessus */}
      <div className="relative z-10 w-full flex flex-col">
        <NavBar />
        <ServicesSection services={services} />
        <ContactSection
          hasNoCards={services.length === 0}
          emailjsServiceId={user?.emailjsServiceId ?? null}
          emailjsTemplateId={user?.emailjsTemplateId ?? null}
          emailjsPublicKey={user?.emailjsPublicKey ?? null}
        />
      </div>
    </main>
  );
};

export default PremiumServices;
