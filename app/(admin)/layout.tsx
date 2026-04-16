import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Photolio",
    default: "Photolio — Back-office",
  },
  description: "Gérez vos photos, galeries et site vitrine.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
