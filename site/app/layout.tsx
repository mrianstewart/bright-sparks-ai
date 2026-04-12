import type { Metadata } from "next";
import { Sora, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brightsparks.ai"),
  title: {
    default: "Bright Sparks AI — New AI tools, every week",
    template: "%s — Bright Sparks AI",
  },
  description: "I build a new AI tool every week. Free tools, breakdowns, and builds from South Devon.",
  openGraph: {
    siteName: "Bright Sparks AI",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sora.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Script
          src="https://plausible.io/js/pa-_JPNEz7wg6TFSYCVA2cxu.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">{`
          window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
          plausible.init()
        `}</Script>

        {children}

        <footer className="footer">
          <div className="container footer__inner">
            <span className="footer__copy">&copy; {new Date().getFullYear()} Bright Sparks AI</span>
            <nav className="footer__links" aria-label="Footer links">
              <Link href="/privacy">Privacy</Link>
              <span>&middot;</span>
              <Link href="/terms">Terms</Link>
              <span>&middot;</span>
              <a href="mailto:hello@brightsparks.ai">Contact</a>
            </nav>
          </div>
          <div className="container">
            <p className="footer__tagline">Built by Ian in South Devon with Claude ⚡</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
