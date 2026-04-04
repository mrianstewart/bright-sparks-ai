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
      <body className="min-h-full flex flex-col bg-slate-950">
        <header className="w-full px-6 pt-3 pb-0 flex items-center">
          <a
            href="https://brightsparks.ai"
            className="flex items-center gap-2.5 opacity-70 hover:opacity-100 transition-opacity"
          >
            <img src="/roast-machine/logo.svg" alt="Bright Sparks AI" width={14} height={22} />
            <span className="text-sm font-semibold text-slate-300 tracking-tight">Bright Sparks AI</span>
          </a>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="w-full px-6 py-4 text-center">
          <p className="text-sm text-slate-400">
            Made by{' '}
            <a href="https://brightsparks.ai" className="text-slate-300 hover:text-white transition-colors">
              Bright Sparks AI
            </a>
            {' '}— I build a new AI tool every week.{' '}
            <a
              href="https://bright-sparks-ai.kit.com/f7a89bc8ec"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors underline underline-offset-2"
            >
              Follow the builds →
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
