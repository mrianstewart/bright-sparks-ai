'use client';

import { useState } from 'react';

type State = 'idle' | 'loading' | 'sent' | 'not_found' | 'not_paid' | 'error';

export function LostLinkForm() {
  const [state, setState] = useState<State>('idle');
  const [checkoutUrl, setCheckoutUrl] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (e.currentTarget.querySelector('[name="email"]') as HTMLInputElement).value.trim();
    setState('loading');
    try {
      const res = await fetch('/speech-writer/api/speech-writer/resend-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState('error');
        return;
      }
      if (data.status === 'sent') {
        setState('sent');
      } else if (data.status === 'not_found') {
        setState('not_found');
      } else if (data.status === 'not_paid') {
        setCheckoutUrl(data.checkoutUrl);
        setState('not_paid');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  return (
    <div className="sw-lost-link" id="lost-link">
      <h3 className="sw-lost-link__heading">Lost your link?</h3>
      <p className="sw-lost-link__sub">Enter the email you used to purchase and we&apos;ll resend it.</p>

      {state === 'sent' ? (
        <p className="sw-lost-link__success">Done — check your inbox. ✦</p>
      ) : state === 'not_found' ? (
        <p className="sw-lost-link__msg">
          We couldn&apos;t find a speech for that email.{' '}
          <a href="mailto:hello@brightsparks.ai">Contact hello@brightsparks.ai</a> if you need help.
        </p>
      ) : state === 'not_paid' ? (
        <p className="sw-lost-link__msg">
          It looks like your speech hasn&apos;t been purchased yet.{' '}
          <a href={checkoutUrl}>Continue to checkout →</a>
        </p>
      ) : (
        <form className="sw-lost-link__form" onSubmit={handleSubmit}>
          <div className="sw-lost-link__row">
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
              className="sw-lost-link__input"
              aria-label="Email address"
            />
            <button type="submit" className="sw-lost-link__btn" disabled={state === 'loading'}>
              {state === 'loading' ? 'Sending…' : 'Resend My Link'}
            </button>
          </div>
          {state === 'error' && (
            <p className="sw-lost-link__error">
              Something went wrong. Try again or email{' '}
              <a href="mailto:hello@brightsparks.ai">hello@brightsparks.ai</a>
            </p>
          )}
        </form>
      )}
    </div>
  );
}
