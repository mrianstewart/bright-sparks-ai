import type { Metadata, Viewport } from "next";
import { Sora, DM_Sans } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

const sora = Sora({
  variable: "--font-head",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://brightsparks.ai"),
  title: {
    default: "AI Wedding Speech Writer UK | Bright Sparks AI",
    template: "%s | Bright Sparks AI",
  },
  description:
    "Write a personalised UK wedding speech with AI. Best man, maid of honour, parents — personalised, ready in minutes. From £14.99.",
  openGraph: {
    siteName: "Bright Sparks AI",
    type: "website",
  },
};

export default function SpeechWriterLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sora.variable} ${dmSans.variable}`}>
      <body>
        <Script
          src="https://plausible.io/js/pa-_JPNEz7wg6TFSYCVA2cxu.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">{`
          window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
          plausible.init()
        `}</Script>

        <header className="sw-header">
          <div className="container sw-header__inner">
            <Link href="https://brightsparks.ai" className="sw-header__brand">
              <svg className="sw-header__bolt" viewBox="0 0 200 320" fill="none" aria-hidden="true">
                <path d="M125 0L10 185H95L70 320L190 135H105L125 0Z" fill="#F5A623"/>
              </svg>
              Bright Sparks AI
            </Link>
            <Link href="/speech-writer/create" className="sw-header__cta">
              Write my speech →
            </Link>
          </div>
        </header>

        {children}

        <footer className="sw-footer">
          <div className="container">
            <p>
              &copy; {new Date().getFullYear()} Bright Sparks AI &middot;{" "}
              <a href="https://brightsparks.ai/privacy">Privacy</a>
              {" · "}
              <a href="https://brightsparks.ai/terms">Terms</a>
              {" · "}
              <a href="mailto:hello@brightsparks.ai">Contact</a>
            </p>
            <p>Built by Ian in South Devon with Claude ⚡</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
