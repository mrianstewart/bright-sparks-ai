'use client';

import { useState } from 'react';

interface Props {
  variant?: 'hero' | 'results';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const track = (event: string, props?: Record<string, string | boolean | number>) =>
  typeof window !== 'undefined' && (window as any).plausible?.(event, { props });

export function EmailCapture({ variant = 'results' }: Props) {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || status === 'submitting') return;
    setStatus('submitting');

    try {
      const res = await fetch('/magic-todo/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (res.ok) {
        setStatus('success');
        track('Email Signup', { source: 'magic-todo' });
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  }

  if (status === 'success') {
    return (
      <div className={`mt-email-capture mt-email-capture--${variant}`}>
        <p className="mt-email-capture__success">✓ You&apos;re in! Check your inbox.</p>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="mt-email-capture mt-email-capture--hero">
        <p className="mt-email-capture__hint">Get a new AI tool in your inbox every week</p>
        <form onSubmit={handleSubmit} className="mt-email-capture__form">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="mt-email-capture__input"
            required
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn btn--ghost mt-email-capture__btn"
          >
            {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-email-capture mt-email-capture--results">
      <h3 className="mt-email-capture__headline">Get a new AI tool in your inbox every week</h3>
      <p className="mt-email-capture__sub">
        I build one tool like this every week and share how I made it. No spam, no fluff.
      </p>
      <form onSubmit={handleSubmit} className="mt-email-capture__form">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="mt-email-capture__input"
          required
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn btn--primary mt-email-capture__btn"
        >
          {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}
