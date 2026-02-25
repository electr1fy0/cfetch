import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistPixelTriangle, GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = GeistSans;
const geistMono = GeistMono;
const geistPixelTriangle = GeistPixelTriangle;
const geistPixelSquare = GeistPixelSquare;
export const metadata: Metadata = {
  title: "cfetch",
  description: "Codeforces analytics. Visualized.",
  icons: {
    icon: "/cfetch_logo.png",
    apple: "/cfetch_logo.png",
    shortcut: "/cfetch_logo.png",
  },
  openGraph: {
    title: "cfetch",
    description: "Codeforces analytics. Visualized.",
    images: [
      {
        url: "/cfetch_thumb.jpeg",
        width: 1200,
        height: 630,
        alt: "cfetch preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "cfetch",
    description: "Codeforces analytics. Visualized.",
    images: ["/cfetch_thumb.jpeg"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${geistPixelTriangle.variable} ${geistPixelSquare.variable}`}
    >
      <body>
        {children} <Analytics />
      </body>
    </html>
  );
}
