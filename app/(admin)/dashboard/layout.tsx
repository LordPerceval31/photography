// dashboard/layout.tsx
import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PageTransition from "./PageTransition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* 1. LE FOND : Totalement indépendant et fixe */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/background_dashboard.webp"
          alt="image de fond"
          fill
          sizes="100vw"
          className="object-cover opacity-50"
          priority
        />
      </div>

      {/* 2. LE CONTENEUR */}
      <div className="relative flex flex-col items-center laptop:justify-center w-full min-h-screen laptop:h-screen py-12 laptop:py-0">
        {/* LA BOÎTE GLASSMORPHISM */}
        <div
          className="
            flex flex-col items-center laptop:items-start 
            w-full 
            laptop:w-[80vw] 
            ultrawide:w-[60vw] 
            4k:w-[80vw] 
            laptop:h-[80vh] 

            laptop:p-6 
            desktop:p-10 
            2k:p-14 
            ultrawide:p-16 
            4k:p-20 
            
            laptop:glass-premium 
            laptop:rounded-xl 
            
            gap-10 
            laptop:gap-4 
            desktop:gap-8 
            2k:gap-12 
            4k:gap-20 
            
            laptop:relative 
            laptop:z-10 
            
            overflow-y-auto 
            no-scrollbar
          "
        >
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </div>
  );
}
