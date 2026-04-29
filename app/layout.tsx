import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic"],
  variable: "--font-italic",
  display: "swap",
});

const halo = localFont({
  src: "../public/fonts/HaloHandletter.otf",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EdgePad — Edge More.",
  description:
    "EdgePad turns the edges of your trackpad into precision controls — scrub video, dial brightness, set volume.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable} ${halo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
