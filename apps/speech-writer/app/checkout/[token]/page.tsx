import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Complete Your Order | Bright Sparks AI',
  robots: { index: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main style={{ paddingTop: 'calc(var(--header-h) + 80px)', minHeight: '100vh' }}>
      <div
        className="container"
        style={{
          maxWidth: 560,
          paddingBottom: '4rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✦</div>
        <h1
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            color: 'var(--text)',
          }}
        >
          Your answers have been saved.
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Payment is coming soon. Your speech reference is{' '}
          <code
            style={{
              fontFamily: 'monospace',
              background: 'var(--bg-alt)',
              padding: '0.15em 0.4em',
              borderRadius: 4,
              fontSize: '0.875rem',
              color: 'var(--text)',
            }}
          >
            {token.slice(0, 8)}…
          </code>
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '2.5rem' }}>
          We&apos;ll email you a link to access your speech once payment is live.
        </p>
        <Link
          href="/speech-writer"
          style={{
            display: 'inline-block',
            background: 'var(--green)',
            color: '#FEFCF7',
            fontWeight: 600,
            padding: '0.875rem 1.75rem',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            fontSize: '0.9375rem',
            transition: 'background 0.2s',
          }}
        >
          ← Back to Speech Writer
        </Link>
      </div>
    </main>
  );
}
