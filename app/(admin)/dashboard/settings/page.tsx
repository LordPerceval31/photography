import type { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Paramètres",
};
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import prisma from "@/app/lib/prisma";

const SettingsPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      cloudinaryName: true,
      cloudinaryKey: true,
      cloudinarySecret: true,
      emailjsServiceId: true,
      emailjsTemplateId: true,
      emailjsPublicKey: true,
    },
  });

  if (!user) redirect("/login");

  return <SettingsClient user={user} />;
};

export default SettingsPage;
