import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "simplebar-react/dist/simplebar.min.css";
import "react-motion-gallery/styles.css";
import "plyr-react/plyr.css";
import {
  ICON_URL,
  OG_IMAGE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/structured-data";
import { Nav } from "./components/Nav";
import { RouteProgress } from "./components/RouteProgress";

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
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@davidmedero",
    images: [OG_IMAGE_URL],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    icon: ICON_URL,
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
      <head>
        <link rel="preconnect" href="https://use.typekit.net" />
        <link rel="preconnect" href="https://p.typekit.net" />
        <link rel="stylesheet" href="https://use.typekit.net/awj1fnk.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config','rckrr');`,
          }}
        />
      </head>
      <body
        className={`${fontBody.variable} ${tasaOrbiter.variable} ${fontMono.variable}`}
      >
        <RouteProgress>
          <Nav />
          {children}
        </RouteProgress>
      </body>
    </html>
  );
}
