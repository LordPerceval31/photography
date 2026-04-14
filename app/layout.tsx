import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s — Photolio",
    default: "Photolio — Le logiciel SaaS des photographes", // Titre plus accrocheur
  },
  // Description enrichie avec tes mots-clés
  description:
    "Créez votre site vitrine, envoyez des galeries privées à vos clients et développez votre activité de photographe avec Photolio. Développé à Toulouse.",
  keywords: [
    "logiciel photographe",
    "galerie photo en ligne",
    "portfolio personnalisé",
    "site vitrine photographe",
    "SaaS photographie",
    "Toulouse",
  ],
  authors: [
    { name: "Levynix Studio", url: "https://levynixstudio.netlify.app/" },
  ],
  creator: "Levynix Studio",
  // On AUTORISE l'indexation par Google !
  robots: {
    index: true,
    follow: true,
  },
  // Optimisation pour les partages (Twitter, Facebook, LinkedIn...)
  openGraph: {
    title: "Photolio — L'outil des photographes",
    description: "Votre site vitrine et vos galeries privées sur-mesure.",
    url: "https://photolio.fr",
    siteName: "Photolio",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
