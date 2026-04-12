import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav, EmailForm, RevealObserver } from '@bsai/ui';

export const metadata: Metadata = {
  title: 'Bright Sparks AI — AI tools, apps and automations built weekly',
  description: 'I build AI-powered tools every week and show you how I make them. Apps, automations, agents, templates, and the occasional experiment. Follow the builds.',
  openGraph: {
    title: 'Bright Sparks AI — AI tools, apps and automations built weekly',
    description: 'I build AI-powered tools every week and show you how I make them. Apps, automations, agents, templates, and the occasional experiment. Follow the builds.',
    url: 'https://brightsparks.ai',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const KIT_FORM_ID = '9278303';

export default function HomePage() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <main>

        {/* HERO */}
        <section className="hero" id="hero">
          <div className="hero__bg-bolt" aria-hidden="true">
            <svg viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M125 0L10 185H95L70 320L190 135H105L125 0Z" fill="#F5A623"/>
            </svg>
          </div>
          <div className="container hero__inner">
            <h1 className="hero__headline reveal">
              I build AI-powered tools every week<br />
              and show you exactly how I make them.
            </h1>
            <p className="hero__sub reveal reveal--delay-1">
              Apps, automations, agents, templates — and the occasional
              thing that probably shouldn&apos;t work but does.
              Follow the journey from build&nbsp;#1.
            </p>
            <div className="reveal reveal--delay-2" id="hero-form-wrap">
              <EmailForm
                id="hero-form"
                successId="hero-success"
                errorId="hero-error"
                kitFormId={KIT_FORM_ID}
                btnLabel="Follow the builds"
                note="One email per week. Unsubscribe anytime. No spam, obviously."
              />
            </div>
            <p className="hero__trust reveal reveal--delay-3">Newsletter #1 drops this week.</p>
          </div>
        </section>

        {/* WHAT TO EXPECT */}
        <section className="section" id="what">
          <div className="container">
            <h2 className="section__heading reveal">What to expect</h2>
            <div className="cards">
              <div className="card reveal">
                <div className="card__icon" aria-hidden="true">🔨</div>
                <h3 className="card__title">A new build every week</h3>
                <p className="card__body">Tools, apps, templates, automations — each one solving a real problem. Some for business, some for fun, all built with AI. The catalogue grows every week.</p>
              </div>
              <div className="card reveal reveal--delay-1">
                <div className="card__icon" aria-hidden="true">🔍</div>
                <h3 className="card__title">The honest breakdown</h3>
                <p className="card__body">What I built, why I built it, how it actually works, and what I&apos;d do differently. No &quot;10x your productivity&quot; nonsense. Just the real process.</p>
              </div>
              <div className="card reveal reveal--delay-2">
                <div className="card__icon" aria-hidden="true">⚡</div>
                <h3 className="card__title">Free tools along the way</h3>
                <p className="card__body">Not everything has a price tag. Some of the most interesting builds are free — and they&apos;re yours to use.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BUILDS */}
        <section className="section section--alt" id="builds">
          <div className="container">
            <h2 className="section__heading reveal">What I&apos;ve been building</h2>
            <p className="section__sub reveal">New tools ship weekly. Here&apos;s what&apos;s live.</p>
            <div className="builds-grid">

              <div className="build-card reveal">
                <div className="build-card__header">
                  <span className="tag tag--app">APP</span>
                  <span className="tag tag--free">FREE</span>
                </div>
                <h3 className="build-card__title">The Roast Machine</h3>
                <p className="build-card__desc">Paste any website URL. Three AI judges will tear it apart — design, copy, and conversion. Free, instant, and merciless.</p>
                <Link href="/roast-machine" className="btn btn--ghost">Try it →</Link>
              </div>

              <div className="build-card build-card--ghost reveal reveal--delay-1" aria-hidden="true">
                <div className="build-card__header">
                  <span className="tag tag--coming-soon">COMING SOON</span>
                </div>
                <h3 className="build-card__title">Build #2</h3>
                <p className="build-card__desc">Something&apos;s taking shape. Check back next week.</p>
              </div>

              <div className="build-card build-card--ghost reveal reveal--delay-2" aria-hidden="true">
                <div className="build-card__header">
                  <span className="tag tag--coming-soon">COMING SOON</span>
                </div>
                <h3 className="build-card__title">Build #3</h3>
                <p className="build-card__desc">The pipeline stays full.</p>
              </div>

            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="section section--about" id="about">
          <div className="container">
            <div className="about">
              <div className="about__content reveal">
                <h2 className="section__heading">Built by Ian</h2>
                <p className="about__body">
                  I am a solopreneur living in Totnes, Devon, UK. I have started Bright Sparks AI to turn my love of tech, side projects and AI tools into real products, with real utility — shipped weekly and built in public.
                </p>
                <p className="about__body">
                  I work a 9-5 and have a busy week as a Dad to two wonderful kids, so I mainly build on evenings and weekends. The plan is to ship something every week for a year and see what happens.
                </p>
              </div>
              <div className="about__visual" aria-hidden="true">
                <svg className="about__bolt" viewBox="0 0 120 190" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M75 0L8 115H57L43 190L112 82H63L75 0Z" fill="#F5A623"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="section section--alt section--newsletter" id="newsletter">
          <div className="container container--narrow">
            <h2 className="section__heading text-center reveal">Keep up with the builds</h2>
            <div className="reveal reveal--delay-1">
              <EmailForm
                id="footer-form"
                successId="footer-success"
                errorId="footer-error"
                kitFormId={KIT_FORM_ID}
                btnLabel="Get the weekly update"
                note="One email per week. Unsubscribe anytime."
              />
            </div>
            <div className="socials reveal reveal--delay-2">
              <a href="https://brightsparksai.substack.com" className="social" target="_blank" rel="noopener noreferrer" aria-label="Substack">
                <svg className="social__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                </svg>
                <span>Substack</span>
              </a>
              <a href="https://x.com/brightsparksai" className="social" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                <svg className="social__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>X / Twitter</span>
              </a>
              <a href="https://www.linkedin.com/in/ianstewartai" className="social" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg className="social__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
