'use client';

import { useState } from 'react';

declare global {
  interface Window {
    plausible?: (event: string, options?: Record<string, unknown>) => void;
  }
}

const KIT_ENDPOINT = (id: string) => `https://app.kit.com/forms/${id}/subscriptions`;

export function EmailCaptureForm({ kitFormId }: { kitFormId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (e.currentTarget.querySelector('[name="email_address"]') as HTMLInputElement).value.trim();
    setState('loading');
    try {
      const res = await fetch(KIT_ENDPOINT(kitFormId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email_address: email }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok || res.status === 200 || res.status === 201) {
        setState('success');
        window.plausible?.('Speech Writer Email Signup');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="sw-email-form__success">
        <p>You&apos;re in — check your inbox. ✦</p>
      </div>
    );
  }

  return (
    <>
      <form className="sw-email-form" onSubmit={handleSubmit}>
        <div className="sw-email-form__row">
          <input
            type="email"
            name="email_address"
            placeholder="your@email.com"
            required
            autoComplete="email"
            className="sw-email-form__input"
            aria-label="Email address"
          />
          <button type="submit" className="sw-email-form__btn" disabled={state === 'loading'}>
            {state === 'loading' ? 'Sending…' : 'Send me the tips →'}
          </button>
        </div>
        <p className="sw-email-form__note">No spam. Unsubscribe anytime.</p>
      </form>
      {state === 'error' && (
        <p className="sw-email-form__error">
          Something went wrong. Try again or email{' '}
          <a href="mailto:hello@brightsparks.ai">hello@brightsparks.ai</a>
        </p>
      )}
    </>
  );
}
