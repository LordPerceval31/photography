import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./_components/SmoothScroll";
import NavBar from "./_components/navBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Photographe Portfolio",
  description: "Mon univers visuel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col`}
      >
        <SmoothScroll>
          <div
            className="fixed z-50 right-6 tablet:right-10
            laptop:right-auto laptop:left-1/2 laptop:-translate-x-1/2
            top-6 tablet:top-10 laptop:top-6 2k:top-12 4k:top-16"
          >
            <NavBar />
          </div>

          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
