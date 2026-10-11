import type { Metadata, Viewport } from "next";
import { Inter, Kalam } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ClickSound } from "@/components/click-sound";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const kalam = Kalam({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: "400",
});

// viewport-fit=cover makes env(safe-area-inset-*) real, so fixed controls clear the notch and home bar.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content", themeColor: "#ffffff" }

const siteTitle = "Trung's Portfolio 2026"
const siteDescription =
  "Product designer at IBM — selected work, case studies, and the path that led here."

// Absolute OG/Twitter image URLs need a base. Prefer an explicit site URL, then
// Vercel's production host; local/dev falls back to localhost.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")

// Bump when replacing favicon assets so browsers drop a cached rabbit/blank tab icon.
const iconVersion = "20261011b"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  // Opt out of AI training where tools honour it (noai/noimageai), and state ownership.
  robots: { index: true, follow: true, "max-image-preview": "large" },
  other: { robots: "noai, noimageai", copyright: `© ${new Date().getFullYear()} Trung Vo. All rights reserved.` },
  // Explicit icons with a version query — file-based app/icon.png + app/favicon.ico
  // still ship via the App Router; this forces tab caches past the old rabbit mark.
  icons: {
    icon: [
      { url: `/favicon.ico?v=${iconVersion}`, sizes: "any" },
      { url: `/icon.png?v=${iconVersion}`, type: "image/png", sizes: "64x64" },
    ],
    apple: [{ url: `/apple-icon.png?v=${iconVersion}`, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Trung's Portfolio 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${kalam.variable} h-full font-sans antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <ClickSound />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
