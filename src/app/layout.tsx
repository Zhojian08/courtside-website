import type { Metadata } from "next";
import { Anton, Inter, Exo_2 } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["700", "800"],
  style: ["italic", "normal"],
  variable: "--font-exo2",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WeXmE — Basketball Stats",
    template: "%s · WeXmE",
  },
  description:
    "WeXmE. Live box scores, standings, leaderboards and game recaps for basketball leagues of all ages.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} ${exo2.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-fg">
        <ScrollProgress />
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
