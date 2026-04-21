import type { Metadata } from 'next';
import Link from 'next/link';
import { EmailCaptureForm } from './EmailCaptureForm';
import { LostLinkForm } from './LostLinkForm';

export const metadata: Metadata = {
  title: { absolute: 'AI Wedding Speech Writer UK | Bright Sparks AI' },
  description:
    'Write a personalised UK wedding speech with AI. Best man, maid of honour, parents — personalised, UK-style, ready in minutes. From £14.99.',
  openGraph: {
    title: 'AI Wedding Speech Writer UK | Bright Sparks AI',
    description:
      'Tell us your stories. We write the speech. Best man, maid of honour, parents — personalised, UK-style, ready in minutes.',
    url: 'https://brightsparks.ai/speech-writer',
  },
};

const KIT_FORM_ID = '9278303';

const steps = [
  {
    num: '1',
    title: 'Tell us your stories',
    body: 'We ask about the couple, your relationship with them, and the moments that define it. No inspiration needed — just answers to our questions.',
  },
  {
    num: '2',
    title: 'Choose your favourite draft',
    body: 'We write multiple complete speeches in different styles. Classic and heartfelt. Dry and witty. You pick the one that sounds most like you.',
  },
  {
    num: '3',
    title: 'Deliver with confidence',
    body: 'Your speech arrives formatted for reading aloud, with timing notes and — on the premium plan — a full rehearsal mode.',
  },
];

const plans = [
  {
    name: 'Single Draft',
    price: '£14.99',
    period: 'one payment',
    badge: null,
    featured: false,
    features: [
      '1 complete speech draft',
      'PDF export',
      'UK spelling & style',
      'Instant delivery',
    ],
    cta: 'Get started →',
    tier: 'single',
  },
  {
    name: 'Full Package',
    price: '£24.99',
    period: 'one payment',
    badge: 'Most popular',
    featured: true,
    features: [
      '3 drafts in different styles',
      'Section-by-section editing',
      'Rehearsal tips included',
      'PDF export',
      'UK spelling & style',
    ],
    cta: 'Write my speech →',
    tier: 'full',
  },
  {
    name: 'Premium',
    price: '£39.99',
    period: 'one payment',
    badge: null,
    featured: false,
    features: [
      'Everything in Full Package',
      'Rehearsal mode with timing',
      'Delivery coaching notes',
      '48-hour revision window',
    ],
    cta: 'Get Premium →',
    tier: 'premium',
  },
];

const faqs = [
  {
    q: 'Is it really personalised?',
    a: "Yes. You tell us your stories — the funny moment at the stag do, how they met, what makes them brilliant together. We turn that raw material into a speech that sounds like you, not a template. If your answers are specific, the speech will be too.",
  },
  {
    q: 'Will people know I used AI?',
    a: "Only if you tell them. The speech is built from your stories and delivered in your voice. Our job is to write something that sounds human — because it is. You lived the stories. We just helped you shape them.",
  },
  {
    q: 'How long does it take?',
    a: "Most speeches are ready within a few minutes of completing the questionnaire. No waiting around, no back-and-forth. You answer the questions, we do the rest.",
  },
  {
    q: 'Can I edit the speech?',
    a: "Absolutely. On the Full Package and Premium tiers, you can edit section by section before exporting. Most people find they only need to tweak a word here and there — but it's your speech, and you're in control.",
  },
  {
    q: "What if I hate it?",
    a: "We offer a 14-day refund, no questions asked. If the speech doesn't work for you, neither does the charge. Just email hello@brightsparks.ai.",
  },
];

export default function SpeechWriterPage() {
  return (
    <main>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="sw-hero">
        <div className="container">
          <p className="sw-hero__ornament" aria-hidden="true">✦ ✦ ✦</p>
          <h1 className="sw-hero__headline">
            Write a wedding speech that&apos;ll have the room laughing and crying — in the right order.
          </h1>
          <p className="sw-hero__sub">
            AI-powered speech writing for best men, maids of honour, parents,
            and anyone who&apos;d rather face a firing squad than a microphone.
          </p>
          <div className="sw-hero__actions">
            <Link href="/create" className="sw-hero__cta">
              Write my speech →
            </Link>
            <a href="#lost-link" className="sw-hero__recover">
              Already purchased? Recover my speech
            </a>
          </div>
          <p className="sw-hero__trust">
            Starts from £14.99 &middot; PDF export included &middot; Ready in minutes
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section className="sw-section sw-section--alt">
        <div className="container">
          <h2 className="sw-section__heading">How it works</h2>
          <p className="sw-section__sub">Three steps. No blank page. No panic.</p>
          <div className="sw-steps">
            {steps.map((step) => (
              <div key={step.num} className="sw-step">
                <div className="sw-step__num" aria-hidden="true">{step.num}</div>
                <h3 className="sw-step__title">{step.title}</h3>
                <p className="sw-step__body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section className="sw-section">
        <div className="container">
          <h2 className="sw-section__heading">Simple, honest pricing</h2>
          <p className="sw-section__sub">
            One payment. No subscription. The speech is yours forever.
          </p>
          <div className="sw-plans">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className={`sw-plan${plan.featured ? ' sw-plan--featured' : ''}`}
              >
                {plan.badge && <span className="sw-plan__badge">{plan.badge}</span>}
                <p className="sw-plan__name">{plan.name}</p>
                <p className="sw-plan__price">{plan.price}</p>
                <p className="sw-plan__period">{plan.period}</p>
                <hr className="sw-plan__divider" />
                <ul className="sw-plan__features">
                  {plan.features.map((f) => (
                    <li key={f} className="sw-plan__feature">{f}</li>
                  ))}
                </ul>
                <Link
                  href={`/create?tier=${plan.tier}`}
                  className="sw-plan__cta"
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="sw-section sw-section--alt">
        <div className="container">
          <h2 className="sw-section__heading">Questions? Answered.</h2>
          <p className="sw-section__sub">The things people wonder before they hit the button.</p>
          <div className="sw-faqs">
            {faqs.map((faq) => (
              <details key={faq.q} className="sw-faq-item">
                <summary>{faq.q}</summary>
                <p className="sw-faq-item__answer">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────── */}
      <section className="sw-email">
        <div className="container">
          <h2>Not ready yet? Get free wedding speech tips.</h2>
          <p>Structure, humour, delivery — our best advice, free, with no obligation.</p>
          <EmailCaptureForm kitFormId={KIT_FORM_ID} />
          <LostLinkForm />
        </div>
      </section>

    </main>
  );
}
