import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { isIndexable, site, siteUrl } from "@/content/site";
import "./globals.css";

// next/font downloads these at build time and serves them from this site; browsers never contact Google.
const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const indexable = isIndexable();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Samuel Suchard — Software developer and founder of Hearth", template: "%s · Samuel Suchard" },
  description: site.hero,
  applicationName: "Samuel Suchard",
  referrer: "strict-origin-when-cross-origin",
  robots: { index: indexable, follow: indexable },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { type: "website", siteName: "Samuel Suchard", locale: "en_US" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
