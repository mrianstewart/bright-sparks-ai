import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Wedding Speech',
  robots: { index: false },
};

export default function SpeechPage({ params }: { params: Promise<{ token: string }> }) {
  void params;
  return (
    <main style={{ paddingTop: 'calc(var(--header-h) + 48px)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 680, paddingTop: '3rem', paddingBottom: '4rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your speech</h1>
        <p style={{ color: 'var(--text-muted)' }}>Speech display coming soon.</p>
      </div>
    </main>
  );
}
