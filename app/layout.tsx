import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. LES IMPORTS (Ne pas oublier le CSS, sinon le toast sera invisible ou moche)
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    default: "Photolio — Le logiciel SaaS des photographes",
  },
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
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Photolio — L'outil des photographes",
    description: "Votre site vitrine et vos galeries privées sur-mesure.",
    url: "https://photolio.fr",
    siteName: "Photolio",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/www.photolio.fr_(laptop).webp",
        width: 1200,
        height: 630,
        alt: "Aperçu de Photolio",
      },
    ],
  },
  metadataBase: new URL("https://photolio.fr"),
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
      <body className="min-h-full flex flex-col">
        {children}

        {/* 2. LE CONTENEUR (Placé à la fin du body pour être au-dessus de tout) */}
        <ToastContainer
          position="top-center"
          theme="dark"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </body>
    </html>
  );
}
