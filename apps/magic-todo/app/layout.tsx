import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "MagicTodo — Break any overwhelming task into tiny steps",
  description: "Type the thing you've been avoiding. MagicTodo breaks it into steps so small they feel almost easy.",
  metadataBase: new URL("https://brightsparks.ai"),
  openGraph: {
    title: "MagicTodo — Break any overwhelming task into tiny steps",
    description: "Type the thing you've been avoiding. MagicTodo breaks it into steps so small they feel almost easy.",
    url: "https://brightsparks.ai/magic-todo",
    siteName: "Bright Sparks AI",
    type: "website",
  },
};

export default function MagicTodoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sora.variable} ${dmSans.variable}`}>
      <body>
        <Script src="https://plausible.io/js/pa-_JPNEz7wg6TFSYCVA2cxu.js" strategy="afterInteractive" />
        <Script id="plausible-init" strategy="afterInteractive">{`
          window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
          plausible.init()
        `}</Script>

        <header className="mt-header">
          <Link href="https://brightsparks.ai" className="mt-header__brand">
            <svg className="mt-header__bolt" viewBox="0 0 200 320" fill="none" aria-hidden="true">
              <path d="M125 0L10 185H95L70 320L190 135H105L125 0Z" fill="#F5A623"/>
            </svg>
            <span>Bright Sparks AI</span>
          </Link>
        </header>

        <div className="mt-page">{children}</div>

        <footer className="mt-footer">
          <p>
            Made by{' '}
            <a href="https://brightsparks.ai">Bright Sparks AI</a>
            {' — '}I build a new AI tool every week.{' '}
            <a href="https://brightsparks.ai/privacy">Privacy</a>
            {' · '}
            <a href="https://brightsparks.ai/terms">Terms</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
