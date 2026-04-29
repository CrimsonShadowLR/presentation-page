import type { Metadata, Viewport } from "next";
import { Sora, IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://leandrolazo.vercel.app"),
  title: {
    default: "Leandro Lazo — Web & Software Developer",
    template: "%s | Leandro Lazo",
  },
  description: "Web & Software Developer based in Peru. Building clean, performant applications with modern technologies like Next.js, TypeScript, and Tailwind CSS.",
  keywords: ["Leandro Lazo", "Web Developer", "Software Developer", "Next.js", "TypeScript", "Peru", "Lima", "Full Stack Developer"],
  authors: [{ name: "Leandro Lazo" }],
  creator: "Leandro Lazo",
  publisher: "Leandro Lazo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://leandrolazo.vercel.app",
    siteName: "Leandro Lazo",
    title: "Leandro Lazo — Web & Software Developer",
    description: "Web & Software Developer based in Peru. Building clean, performant applications with modern technologies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Leandro Lazo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leandro Lazo — Web & Software Developer",
    description: "Web & Software Developer based in Peru. Building clean, performant applications.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://leandrolazo.vercel.app",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3D5A80",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${ibmPlexMono.variable} ${jetBrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
