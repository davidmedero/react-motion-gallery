import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "overlayscrollbars/overlayscrollbars.css";
import "react-motion-gallery/styles.css";
import { Nav } from "./components/Nav";

/* -----------------------------------------------------
   Fonts
----------------------------------------------------- */
const fontBody = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const tasaOrbiter = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "../public/fonts/tasa-orbiter/TASAOrbiter-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/tasa-orbiter/TASAOrbiter-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/tasa-orbiter/TASAOrbiter-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/tasa-orbiter/TASAOrbiter-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/tasa-orbiter/TASAOrbiter-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

/* -----------------------------------------------------
   Metadata
----------------------------------------------------- */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://react-motion-gallery.com";

const OG_URL =
  "https://firebasestorage.googleapis.com/v0/b/reac-motion-gallery-blog.firebasestorage.app/o/social-card-rmg.jpg?alt=media&token=41bab79d-d6c6-41e6-92f5-f80e5fbdbf71";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "React Motion Gallery",
    template: "%s | React Motion Gallery",
  },
  description:
    "React image/video slider gallery with zoom, pan, and pinch for modern apps.",
  openGraph: {
    type: "website",
    siteName: "React Motion Gallery",
    url: SITE_URL,
    images: [
      {
        url: OG_URL,
        width: 1200,
        height: 630,
        alt: "React Motion Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@davidmedero",
    images: [OG_URL],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    icon: "https://firebasestorage.googleapis.com/v0/b/reac-motion-gallery-blog.firebasestorage.app/o/rmg-logo-square.png?alt=media&token=f25eda1d-e5ec-493c-9f47-6d44cda55462",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontBody.variable} ${tasaOrbiter.variable} ${fontMono.variable}`}
      >
        <Nav />
        {children}
      </body>
    </html>
  );
}
