import { DashboardOverview } from "@/app/_components/DashboardOverview";
import { auth } from "@/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord",
};
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // Le layout protège déjà la route, mais on a besoin de l'id pour filtrer les données
  if (!session?.user?.id) redirect("/login");

  return <DashboardOverview userId={session.user.id} />;
}
