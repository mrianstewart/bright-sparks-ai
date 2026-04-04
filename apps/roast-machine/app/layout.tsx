import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Roast Machine — Get your website brutally critiqued by AI judges",
  description: "Paste any website URL. Three AI judges will tear it apart — design, copy, and conversion. Free, instant, and merciless.",
  metadataBase: new URL("https://brightsparks.ai"),
  openGraph: {
    title: "The Roast Machine — Get your website brutally critiqued by AI judges",
    description: "Paste any website URL. Three AI judges will tear it apart — design, copy, and conversion. Free, instant, and merciless.",
    url: "https://brightsparks.ai/roast-machine",
    siteName: "Bright Sparks AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Roast Machine — Get your website brutally critiqued by AI judges",
    description: "Paste any website URL. Three AI judges will tear it apart — design, copy, and conversion. Free, instant, and merciless.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
